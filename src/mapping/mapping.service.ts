import * as XLSX from '@e965/xlsx';
import { Injectable, Logger } from '@nestjs/common';
import Ajv2019, {
	ErrorObject,
	JSONSchemaType,
	ValidateFunction,
	ValidationError,
} from 'ajv/dist/2019';
import * as yaml from 'js-yaml';
import * as jsonpath from 'jsonpath-plus';
import * as path from 'path';

import { Mapping, MappingMetaInformation } from './mapping.interface';
import { mappingValueRe, sectionReferenceRe } from './mapping.regex';
import { mappingSchema } from './mapping.schema';
import { Invoice } from '../invoice/invoice.interface';
import { invoiceSchema } from '../invoice/invoice.schema';
import { ValidationService } from '../validation/validation.service';

type SectionRanges = { [key: string]: { [key: string]: number[] } };

type MappingContext = {
	meta: MappingMetaInformation;
	workbook: XLSX.WorkBook;
	sectionRanges: SectionRanges;
	schemaPath: string[];
	arrayPath: Array<[string, number, number]>;
	rowRange: [number, number];
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

	private parseMapping(yamlData: string): Mapping {
		const obj = yaml.load(yamlData);

		const valid = this.validationService.validate(
			'mapping data',
			this.validator,
			obj,
		);

		return valid;
	}

	transform(yamlMapping: string, dataBuffer: Buffer): Invoice {
		const mapping = this.parseMapping(yamlMapping);
		const workbook = XLSX.read(dataBuffer, {
			type: 'buffer',
			cellDates: true,
		});

		const invoice: { [key: string]: any } = { 'ubl:Invoice': {} };

		const ctx: MappingContext = {
			meta: mapping.meta,
			workbook,
			sectionRanges: {},
			schemaPath: ['properties', 'ubl:Invoice'],
			arrayPath: [],
			rowRange: [1, Infinity],
		};
		this.fillSectionRanges(mapping, workbook, ctx);

		this.transformObject(invoice['ubl:Invoice'], mapping['ubl:Invoice'], ctx);

		return invoice as unknown as Invoice;
	}

	private transformObject(
		target: { [key: string]: any },
		mapping: { [key: string]: any },
		ctx: MappingContext,
	) {
		for (const property in mapping) {
			if (property === 'section') {
				continue;
			}
			ctx.schemaPath.push('properties', property);
			const schema = this.getSchema(ctx.schemaPath);
			if (typeof mapping[property] === 'string') {
				target[property] = this.resolveValue(mapping[property], schema, ctx);
			} else if (schema.type === 'array') {
				target[property] = [];
				this.transformArray(target[property], mapping[property], ctx);
			} else {
				target[property] = {};
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
	) {
		const sectionRef = mapping.section;

		const matches = sectionRef.match(sectionReferenceRe);
		const sheetName =
			typeof matches[1] === 'undefined'
				? ctx.workbook.SheetNames[0]
				: matches[1];
		const section = matches[2];

		try {
			if (!(sheetName in ctx.sectionRanges)) {
				throw new Error(`no section column for sheet '${sheetName}'`);
			}
			if (!(section in ctx.sectionRanges[sheetName])) {
				throw new Error(`no section '${section}' in sheet '${sheetName}'`);
			}
		} catch (e) {
			const message =
				`section reference '${sectionRef}' resolves to null: ` + e.message;

			ctx.schemaPath.push('properties');
			ctx.schemaPath.push('section');
			throw this.makeValidationError(message, ctx);
		}

		ctx.schemaPath.push('items');

		const sectionRanges = ctx.sectionRanges[sheetName][section];
		const upperBound = sectionRanges[sectionRanges.length - 1];
		if (upperBound < ctx.rowRange[1]) {
			// If this is a top-level section, the upper bound of the row range
			// is plus infinity!
			ctx.rowRange[1] = upperBound;
		}

		const sectionIndices = this.computeSectionIndices(sheetName, section, ctx);
		const arrayPathIndex = ctx.arrayPath.length;
		ctx.arrayPath[arrayPathIndex] = [section, -1, -1];

		const savedRowRange = ctx.rowRange;
		for (let i = 0; i < sectionIndices.length; ++i) {
			const startIndex = sectionIndices[i];
			const start = ctx.sectionRanges[sheetName][section][startIndex];
			const end = ctx.sectionRanges[sheetName][section][startIndex + 1];
			ctx.rowRange = [start, end];
			target[i] = {};
			ctx.arrayPath[arrayPathIndex][1] = startIndex;
			ctx.arrayPath[arrayPathIndex][2] = i;
			this.transformObject(target[i], mapping, ctx);
		}
		ctx.rowRange = savedRowRange;

		ctx.arrayPath.pop();
		ctx.schemaPath.pop();
	}

	private makeValidationError(
		message: string,
		ctx: MappingContext,
	): ValidationError {
		const instancePath = this.getInstancePath(ctx);
		const error: ErrorObject = {
			instancePath,
			schemaPath: '#/' + ctx.schemaPath.map(encodeURIComponent).join('/'),
			keyword: 'type',
			params: { type: 'string' },
			message,
		};

		return new ValidationError([error]);
	}

	private computeSectionIndices(
		sheetName: string,
		section: string,
		ctx: MappingContext,
	): number[] {
		const result: number[] = [];

		for (let i = 0; i < ctx.sectionRanges[sheetName][section].length; ++i) {
			const row = ctx.sectionRanges[sheetName][section][i];
			if (row < ctx.rowRange[0]) {
				continue;
			} else if (row >= ctx.rowRange[1]) {
				break;
			}
			result.push(i as unknown as number);
		}

		return result;
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
		const section = matches[2];
		let cellName = matches[3];

		const sheetName =
			typeof sheetMatch === 'undefined'
				? ctx.workbook.SheetNames[0]
				: sheetMatch;

		try {
			if (typeof section !== 'undefined') {
				const match = cellName.match(/^([A-Z]+)(\d+)$/) as RegExpMatchArray;
				const letters = match[1];
				const offset = this.getOffset(sheetName, section, ctx);
				const number = offset + parseInt(match[2], 10) - 1;

				cellName = letters + number;
			}

			const worksheet = ctx.workbook.Sheets[sheetName];

			if (typeof worksheet === 'undefined') {
				throw new Error(`no such sheet '${sheetName}'`);
			}

			return this.getCellValue(worksheet, cellName, schema);
		} catch (x) {
			const message = `reference '${ref}' resolves to null: ${x.message}`;
			throw this.makeValidationError(message, ctx);
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

	private fillSectionRanges(
		mapping: Mapping,
		workbook: XLSX.WorkBook,
		ctx: MappingContext,
	) {
		for (const sheetName in mapping.meta.sectionColumn) {
			if (!(sheetName in workbook.Sheets)) {
				continue;
			}

			const column = mapping.meta.sectionColumn[sheetName] as string;
			const sheet = workbook.Sheets[sheetName];
			const range = XLSX.utils.decode_range(sheet['!ref'] as string);

			ctx.sectionRanges[sheetName] = {};

			for (let row = range.s.r; row <= range.e.r; ++row) {
				const cellAddress = `${column}${row + 1}`;
				const cell = sheet[cellAddress];
				if (cell) {
					ctx.sectionRanges[sheetName][cell.v] ??= [];
					ctx.sectionRanges[sheetName][cell.v].push(row + 1);
				}
			}

			for (const section in ctx.sectionRanges[sheetName]) {
				// The last section could be in the last row of the sheet.
				// Because `range.e.r` is zero-based but our row numbers are
				// one-based, we have to add 2.
				ctx.sectionRanges[sheetName][section].push(range.e.r + 2);
			}
		}
	}

	private getOffset(
		sheetName: string,
		cellSection: string,
		ctx: MappingContext,
	): number {
		for (const pathInfo of ctx.arrayPath) {
			const section = pathInfo[0];
			const index = pathInfo[1];

			if (section === cellSection) {
				return ctx.sectionRanges[sheetName][section][index];
			}
		}

		throw new Error(`cannot find section '${cellSection}' in tree`);
	}

	private getInstancePath(ctx: MappingContext): string {
		const instancePath = [''];
		let arrayLevel = -1;
		ctx.schemaPath
			.filter(item => item !== 'properties')
			.forEach(item => {
				if (item === 'items') {
					instancePath.push(ctx.arrayPath[++arrayLevel][2].toString());
				} else {
					instancePath.push(item);
				}
			});

		return instancePath.join('/');
	}
}
