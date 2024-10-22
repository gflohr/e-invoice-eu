import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as yaml from 'js-yaml';
import { Mapping, MappingMetaInformation } from './mapping.interface';
import Ajv2019, {
	ErrorObject,
	JSONSchemaType,
	ValidateFunction,
} from 'ajv/dist/2019';
import { mappingSchema } from './mapping.schema';
import { ValidationService } from '../validation/validation.service';
import { Invoice } from '../invoice/invoice.interface';
import * as XLSX from '@e965/xlsx';
import * as jsonpath from 'jsonpath-plus';
import { invoiceSchema } from '../invoice/invoice.schema';
import { mappingValueRe } from './mapping.regex';

type SectionRanges = { [key: string]: { [key: string]: number[] } };

type MappingContext = {
	meta: MappingMetaInformation;
	workbook: XLSX.WorkBook;
	sectionRanges: SectionRanges;
	schemaPath: string[];
	arrayPath: Array<[string, number]>;
};

@Injectable()
export class MappingService {
	private readonly logger = new Logger(MappingService.name);
	private readonly validator: ValidateFunction<Mapping>;
	private readonly basePath = path.join('resources', 'mappings');

	constructor(private readonly validationService: ValidationService) {
		const ajv = new Ajv2019({ strict: true, allErrors: true });
		this.validator = ajv.compile(mappingSchema);
	}

	async list(): Promise<Array<string>> {
		const dirEntries = await fs.readdir(this.basePath, { withFileTypes: true });

		const ids: Array<string> = [];
		for (const entry of dirEntries) {
			const name = entry.name;

			const id = name.replace(/\.ya?ml$/, '');
			if (name === id) {
				continue;
			}

			try {
				await this.loadMapping(id);
				ids.push(id);
			} catch (e) {
				this.logger.error(`invalid mapping '${this.basePath}/${name}': ${e}`);
			}
		}

		return ids;
	}

	async loadMapping(id: string): Promise<Mapping> {
		let filename = path.join(this.basePath, id + '.yaml');
		let content: string;

		try {
			content = await fs.readFile(filename, 'utf-8');
		} catch (e) {
			if (e.code && e.code === 'ENOENT') {
				filename = path.join(this.basePath, id + '.yml');
				content = await fs.readFile(filename, 'utf-8');
			} else {
				throw new Error(e);
			}
		}

		const data = yaml.load(content);

		const valid = this.validationService.validate(
			`mapping '${id}'`,
			this.validator,
			data,
		);

		return valid;
	}

	async transform(mappingId: string, buffer: Buffer): Promise<Invoice> {
		const mapping = await this.loadMapping(mappingId);
		const workbook = XLSX.read(buffer, {
			type: 'buffer',
			cellDates: true,
		});

		const invoice: { [key: string]: any } = { 'ubl:Invoice': {} };

		const ctx: MappingContext = {
			meta: mapping.meta,
			workbook,
			sectionRanges: this.getSectionRanges(mapping, workbook),
			schemaPath: ['properties', 'ubl:Invoice'],
			arrayPath: [],
		};

		this.transformObject(invoice['ubl:Invoice'], mapping['ubl:Invoice'], ctx);

		return invoice as unknown as Invoice;
	}

	private transformObject(
		target: { [key: string]: any },
		mapping: { [key: string]: any },
		ctx: MappingContext,
	): any {
		for (const property in mapping) {
			ctx.schemaPath.push('properties', property);
			const schema = this.getSchema(ctx.schemaPath);
			if (typeof mapping[property] === 'string') {
				target[property] = this.resolveValue(mapping[property], schema, ctx);
			} else if (schema.type === 'array') {
				target[property] = [];
				this.transformArray(target[property], mapping[property], ctx);
			} else {
				target[property] = {}; // FIXME! Maybe type array.
				this.transformObject(target[property], mapping[property], ctx);
			}
			ctx.schemaPath.pop();
			ctx.schemaPath.pop();
		}
	}

	private transformArray(
		target: Array<any>,
		mapping: { [key: string]: any },
		ctx: MappingContext,
	): any {
		ctx.schemaPath.push('items');
		const section = mapping.section.substring(1);

		const arrayPathIndex = ctx.arrayPath.length;

		ctx.arrayPath[arrayPathIndex] = [section, -1];

		ctx.arrayPath.pop();
		ctx.schemaPath.pop();
	}

	private unquoteSheetName(name: string): string | undefined {
		if (typeof name === 'undefined') {
			return undefined;
		} else if (name.match(/^'.*'$/)) {
			return name.substring(1, name.length - 1);
		} else {
			return name;
		}
	}

	private resolveValue(
		ref: string,
		schema: JSONSchemaType<any>,
		ctx: MappingContext,
	): string {
		const matches = ref.match(mappingValueRe) as RegExpMatchArray;
		if (typeof matches[4] !== 'undefined') {
			return this.unquoteLiteral(matches[4]);
		}

		const sheetMatch = this.unquoteSheetName(matches[1]);
		//const section = matches[2];
		const cellName = matches[3];

		const sheetName =
			typeof sheetMatch === 'undefined'
				? ctx.workbook.SheetNames[0]
				: sheetMatch;

		const worksheet = ctx.workbook.Sheets[sheetName];

		try {
			if (typeof worksheet === 'undefined') {
				throw new Error(`no such sheet '${sheetName}'`);
			}

			return this.getCellValue(worksheet, cellName, schema);
		} catch (x) {
			const instancePath = ctx.schemaPath.filter(
				item => item !== 'properties' && item !== 'items',
			);
			const error: ErrorObject = {
				instancePath: '/' + instancePath.join('/'),
				schemaPath: '#/' + ctx.schemaPath.map(encodeURIComponent).join('/'),
				keyword: 'type',
				params: { type: 'string' },
				message: `reference '${ref}' resolves to null: ${x.message}`,
			};

			throw new Ajv2019.ValidationError([error]);
		}
	}

	private unquoteLiteral(literal: string): string {
		return literal[0] === "'" ? literal.substring(1) : literal;
	}

	private getCellValue(
		worksheet: XLSX.WorkSheet,
		cellName: string,
		schema: JSONSchemaType<any>,
	): string {
		if (!(cellName in worksheet)) {
			throw new Error(`no such cell '${cellName}'`);
		}

		const cell = worksheet[cellName];
		const $ref = schema.$ref;

		let value: string;
		switch ($ref) {
			case '#/$defs/dataTypes/Date':
				if (cell.t === 'd') {
					value = this.getDateValue(cell.v as Date);
				} else {
					// FIXME! Throw an exception of the date is not in the
					// format 'YYYY-MM-DD'.
					value = cell.v;
				}
				break;
			default:
				value = cell.v;
		}

		return value;
	}

	private getDateValue(value: Date): string {
		return value.toISOString().substring(0, 10);
	}

	private getSchema(path: string[]): JSONSchemaType<any> {
		const jsonPath = ['$', ...path].join('.');

		return jsonpath.JSONPath({
			path: jsonPath,
			json: invoiceSchema,
		})[0] as JSONSchemaType<any>;
	}

	private getSectionRanges(
		mapping: Mapping,
		workbook: XLSX.WorkBook,
	): SectionRanges {
		const ranges: SectionRanges = {};

		for (const sheetName in mapping.meta.sectionColumn) {
			if (!(sheetName in workbook.Sheets)) {
				continue;
			}

			const column = mapping.meta.sectionColumn[sheetName] as string;
			const sheet = workbook.Sheets[sheetName];
			const range = XLSX.utils.decode_range(sheet['!ref'] as string);

			ranges[sheetName] = {};

			for (let row = range.s.r; row <= range.e.r; ++row) {
				const cellAddress = `${column}${row + 1}`;
				const cell = sheet[cellAddress];
				if (cell) {
					ranges[sheetName][cell.v] ??= [];
					ranges[sheetName][cell.v].push(row + 1);
				}
			}

			for (const section in ranges[sheetName]) {
				ranges[sheetName][section].push(range.e.r + 1);
			}
		}

		return ranges;
	}
}
