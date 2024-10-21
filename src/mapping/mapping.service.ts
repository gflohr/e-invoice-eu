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
import { mappingValueRe, sectionReferenceRe } from './mapping.regex';

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

		const invoice: { [key: string]: any } = {
			'ubl:Invoice': {},
		};
		this.transformObject(
			invoice['ubl:Invoice'],
			mapping.meta,
			mapping['ubl:Invoice'],
			workbook,
			['properties', 'ubl:Invoice'],
		);

		return invoice as unknown as Invoice;
	}

	private transformObject(
		target: { [key: string]: any },
		meta: MappingMetaInformation,
		mapping: { [key: string]: any },
		workbook: XLSX.WorkBook,
		schemaPath: Array<string>,
	): any {
		for (const property in mapping) {
			schemaPath.push('properties', property);
			const schema = this.getSchema(schemaPath);
			if (typeof mapping[property] === 'string') {
				target[property] = this.resolveValue(
					mapping[property],
					workbook,
					schema,
					schemaPath,
				);
			} else if (schema.type === 'array') {
				target[property] = [];
				this.transformArray(
					target[property],
					meta,
					mapping[property],
					workbook,
					schemaPath,
				);
			} else {
				target[property] = {}; // FIXME! Maybe type array.
				this.transformObject(
					target[property],
					meta,
					mapping[property],
					workbook,
					schemaPath,
				);
			}
			schemaPath.pop();
			schemaPath.pop();
		}
	}

	private transformArray(
		target: Array<any>,
		meta: MappingMetaInformation,
		mapping: { [key: string]: any },
		workbook: XLSX.WorkBook,
		schemaPath: Array<string>,
	): any {
		schemaPath.push('items');
		//const schema = this.getSchema(schemaPath);
		//console.warn(schema);

		const rows = this.getSectionRows(workbook, meta, mapping.section);
		console.warn(rows);
		//const sectionRows = this.getSectionRows(mapping.section);
		//console.warn(sectionRows);
		schemaPath.pop();
	}

	private getSectionRows(
		workbook: XLSX.WorkBook,
		meta: MappingMetaInformation,
		sectionRef: string,
	): number[] {
		const matches = sectionRef.match(sectionReferenceRe) as RegExpMatchArray;
		const sheetName =
			this.unquoteSheetName(matches[1]) ?? workbook.SheetNames[0];
		const section = matches[2];

		if (!workbook.SheetNames.includes(sheetName)) {
			throw new Error(`Sheet '${sheetName}' referenced in mapping not found!`);
		} else if (!(sheetName in meta.sectionColumn)) {
			throw new Error(
				`Sheet '${sheetName} referenced in mapping has no section column`,
			);
		}

		const sheet = workbook.Sheets[sheetName];
		const column = meta.sectionColumn[sheetName];
		const rows: number[] = [];

		const range = XLSX.utils.decode_range(sheet['!ref'] as string);

		for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
			const cellAddress = `${column}${rowNum + 1}`;
			const cell = sheet[cellAddress];

			if (cell && cell.v === section) {
				rows.push(rowNum);
			}
		}

		return rows;
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
		workbook: XLSX.WorkBook,
		schema: JSONSchemaType<any>,
		schemaPath: Array<string>,
	): string {
		const matches = ref.match(mappingValueRe) as RegExpMatchArray;
		if (typeof matches[4] !== 'undefined') {
			return this.unquoteLiteral(matches[4]);
		}

		const sheetMatch = this.unquoteSheetName(matches[1]);
		//const section = matches[2];
		const cellName = matches[3];

		const sheetName =
			typeof sheetMatch === 'undefined' ? workbook.SheetNames[0] : sheetMatch;

		const worksheet = workbook.Sheets[sheetName];

		try {
			if (typeof worksheet === 'undefined') {
				throw new Error(`no such sheet '${sheetName}'`);
			}
			return this.getCellValue(worksheet, cellName, schema);
		} catch (x) {
			const instancePath = schemaPath.filter(
				item => item !== 'properties' && item !== 'items',
			);
			const error: ErrorObject = {
				instancePath: '/' + instancePath.join('/'),
				schemaPath:
					'#/' + schemaPath.map(encodeURIComponent).join('/') + '/type',
				keyword: 'type',
				params: { type: 'string' },
				message: `mapping '${ref}' resolves to null: ${x.message}`,
			};

			throw new Ajv2019.ValidationError([error]);
		}
	}

	private unquoteLiteral(literal: string): string {
		return literal[0] === "'" ? literal.substring(1) : literal;
	}

	/**
	 * Get a value from a spreadsheet cell.  The only possible error is that
	 * the cell does not exist.  Reporting other errors is left to the
	 * schema validation that happens, when processing the data.
	 *
	 * @param worksheet the XLSX.Worksheet
	 * @param cellName a cell name like 'A1'
	 * @param schema the schema for this value
	 * @returns the value from the cell
	 */
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
}
