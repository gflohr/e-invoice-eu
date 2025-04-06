import * as XLSX from '@e965/xlsx';
import Ajv2019, {
	ErrorObject,
	JSONSchemaType,
	ValidateFunction,
	ValidationError,
} from 'ajv/dist/2019';
import * as jsonpath from 'jsonpath-plus';

import { FormatFactoryService } from '../format/format.factory.service';
import { Logger } from '../logger.interface';
import { Mapping, MappingMetaInformation } from './mapping.interface';
import { ValidationService } from '../validation';
import { mappingSchema } from './mapping.schema';
import { Invoice, invoiceSchema } from '../invoice';
import { mappingValueRe, sectionReferenceRe } from './mapping.regex';

type SectionRanges = { [key: string]: { [key: string]: number[] } };

type MappingContext = {
	meta: MappingMetaInformation;
	workbook: XLSX.WorkBook;
	sectionRanges: SectionRanges;
	schemaPath: string[];
	arrayPath: Array<[string, number, number]>;
	rowRange: [number, number];
};

/**
 * Generate an {@link Invoice} object (data in the internal invoice format)
 * from spreadsheet data and a {@link Mapping}.
 */
export class MappingService {
	private readonly validator: ValidateFunction<Mapping>;
	private readonly validationService: ValidationService;
	private readonly formatFactoryService: FormatFactoryService;

	/**
	 * Creates a new instance of the service.
	 *
	 * @param logger - The logger instance used for logging messages, warnings and errors.
	 */
	constructor(private readonly logger: Logger) {
		this.formatFactoryService = new FormatFactoryService();
		const ajv = new Ajv2019({
			strict: true,
			allErrors: true,
			useDefaults: true,
		});
		this.validator = ajv.compile(mappingSchema);
		this.validationService = new ValidationService(this.logger);
	}

	private validateMapping(data: Mapping, format?: string): Mapping {
		const valid = this.validationService.validate(
			'mapping data',
			this.validator,
			data,
		);

		if (typeof format === 'undefined') {
			return valid;
		}

		const formatter = this.formatFactoryService.createFormatService(
			format,
			this.logger,
		);
		formatter.fillMappingDefaults(valid);

		return valid;
	}

	/**
	 * Transform invoice spreadsheet data to invoice data in the internal
	 * format via a mapping.
	 *
	 * @param dataBuffer the spreadsheet data
	 * @param format one of the supported invoice formats, see {@link FormatFactoryService.listFormatServices}
	 * @param mapping the mapping definition
	 * @returns the invoice data in the internal format
	 */
	transform(dataBuffer: Uint8Array, format: string, mapping: Mapping): Invoice {
		mapping = this.validateMapping(mapping, format);
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

		this.cleanAttributes(invoice);

		return invoice as unknown as Invoice;
	}

	/**
	 * Migrate a mapping to the latest version.
	 *
	 * @param mapping a mapping definition
	 * @returns the migrated mapping
	 */
	migrate(mapping: Mapping): Mapping {
		mapping = this.validateMapping(mapping);

		mapping.meta.version = 3;

		this.migrateObject(mapping);

		return mapping;
	}

	private migrateObject(mapping: { [key: string]: any }) {
		for (const property in mapping) {
			if (property === 'section') {
				continue;
			}

			if (typeof mapping[property] === 'string') {
				const matches = mapping[property].match(mappingValueRe);

				if (matches && typeof matches[2] !== 'undefined') {
					const sheetName = matches[1];
					const sectionName = matches[2];
					const cellName = matches[3];

					const args = [cellName, sectionName, sheetName]
						.filter(val => typeof val !== 'undefined')
						.map(val => `'${val}'`);
					mapping[property] = `=SECTIONVALUE(${args.join(', ')})`;
				}
			} else if (typeof mapping[property] === 'object') {
				this.migrateObject(mapping[property]);
			}
		}
	}

	private cleanAttributes(data: { [key: string]: any }) {
		for (const property in data) {
			const [elem, attr] = property.split('@', 2);

			// Remove hard-coded attributes if the associated element is
			// missing.
			if (typeof attr !== 'undefined') {
				if (!(elem in data)) {
					delete data[property];
					continue;
				}
			}

			if (typeof data[property] === 'object') {
				this.cleanAttributes(data[property]);
			}
		}
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
				const value = this.resolveValue(mapping[property], schema, ctx);
				if (value !== '') {
					target[property] = value;
				}
			} else if (schema.type === 'array') {
				if ('section' in mapping[property]) {
					target[property] = [];
					this.transformArray(target[property], mapping[property], ctx);
				} else {
					target[property] = [{}];
					ctx.schemaPath.push('items');
					this.transformObject(target[property][0], mapping[property], ctx);
					ctx.schemaPath.pop();
				}
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

			const value = this.getCellValue(worksheet, cellName, schema);
			if (ctx.meta.empty && ctx.meta.empty.includes(value)) {
				return '';
			}

			return value;
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
			return '';
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
				value = cell.v.toString();
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

		if (!(cellSection in ctx.sectionRanges[sheetName])) {
			throw new Error(
				`cannot find section '${cellSection}' in sheet '${sheetName}'`,
			);
		}

		const rows = ctx.sectionRanges[sheetName][cellSection];
		if (rows.length !== 2) {
			throw new Error(
				`multiple unbound sections '${cellSection}' in sheet '${sheetName}'`,
			);
		}

		return rows[0];
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
