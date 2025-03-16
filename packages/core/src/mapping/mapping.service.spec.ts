import * as XLSX from '@e965/xlsx';
import { JSONSchemaType } from 'ajv';

import { MappingService } from './mapping.service';
import { EInvoiceFormat } from '../format';
import { Mapping, MappingMetaInformation } from './mapping.interface';
import { FormatFactoryService } from '../format/format.factory.service';
import { Invoice } from '../invoice';
import { Logger } from '../logger.interface';
import { ValidationService } from '../validation';

jest.mock('fs/promises');

// Used for testing `transform()`.
const mapping = {
	meta: {
		sectionColumn: {
			Unused: 'L',
			Invoice: 'K',
		},
	},
	'ubl:Invoice': {
		'cbc:CustomizationID': '=B1',
		'cbc:ID': '1234567890',
		'cbc:IssueDate': '=A1',
		'cbc:DueDate': "='Invoice'.A2",
		'cbc:Note': "'= not equals eagles",
		'cac:OrderReference': {
			'cbc:ID': '=A3',
		},
		'cac:PaymentMeans': {
			// No section.
			'cbc:PaymentMeansCode': '30',
		},
		'cac:LegalMonetaryTotal': {
			'cbc:LineExtensionAmount': '=:SubTotal.F1',
		},
		'cac:InvoiceLine': {
			section: ':Line',
			'cbc:ID': '=:Line.A1',
			'cac:AllowanceCharge': {
				section: ':ACLine',
				// This is relative to the allowanche/charge section.
				'cbc:Amount': '=:ACLine.B1',
				// And this is relative to the invoice line section.
				'cbc:Amount@currencyID': '=:Line.B1',
			},
		},
	},
} as unknown as Mapping;

const workbook = {
	SheetNames: ['Invoice'],
	Sheets: {
		Invoice: {
			A1: {
				t: 's',
				v: '2024-10-21',
			},
			A2: {
				t: 'd',
				v: new Date('2024-10-28T12:34:56Z'),
			},
			A3: {
				t: 's',
				v: '0815',
			},
			B1: {
				t: 's',
				v: 'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0',
			},
			A20: {
				t: 's',
				v: '1',
			},
			A22: {
				t: 's',
				v: '2',
			},
			A23: {
				t: 's',
				v: '3',
			},
			B20: {
				t: 's',
				v: 'EUR',
			},
			B21: {
				t: 's',
				v: '23.04',
			},
			B22: {
				t: 's',
				v: 'EUR',
			},
			B23: {
				t: 's',
				v: 'EUR',
			},
			B24: {
				t: 's',
				v: '13.03',
			},
			B25: {
				t: 's',
				v: '42.00',
			},
			F27: {
				t: 's',
				v: '12345.67',
			},
			K20: {
				t: 's',
				v: 'Line',
			},
			K21: {
				t: 's',
				v: 'ACLine',
			},
			K22: {
				t: 's',
				v: 'Line',
			},
			K23: {
				t: 's',
				v: 'Line',
			},
			K24: {
				t: 's',
				v: 'ACLine',
			},
			K25: {
				t: 's',
				v: 'ACLine',
			},
			K27: {
				t: 's',
				v: 'SubTotal',
			},
			'!ref': 'A1:Z999',
		},
	},
} as XLSX.WorkBook;

const defaultMappingContext = {
	meta: {} as MappingMetaInformation,
	workbook,
	schemaPath: ['ubl:Invoice', 'cbc:ID'],
	sectionRanges: {},
	arrayPath: [],
	rowRange: [1, Infinity] as [number, number],
};

describe('MappingService', () => {
	let service: MappingService;
	const logger = {
		error: jest.fn(),
	};

	beforeEach(async () => {
		service = new MappingService(logger as unknown as Logger);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('should parse mappings and map data', () => {
		it('should throw an exception if a non-existing sheet is referenced', () => {
			const wb: XLSX.WorkBook = {
				Sheets: {},
			} as XLSX.WorkBook;

			try {
				service['resolveValue']('=Inwoice.A1', {} as JSONSchemaType<any>, {
					...defaultMappingContext,
					schemaPath: ['properties', 'ubl:Invoice', 'properties', 'cbc:ID'],
					workbook: wb,
				});
				throw new Error('no exception thrown');
			} catch (e) {
				expect(e).toBeDefined();
				expect(e.validation).toBeTruthy();
				expect(e.ajv).toBeTruthy();
				expect(Array.isArray(e.errors)).toBeTruthy();
				expect(e.errors.length).toBe(1);

				const error = e.errors[0];
				expect(error.instancePath).toBe('/ubl:Invoice/cbc:ID');
				expect(error.schemaPath).toBe(
					'#/properties/ubl%3AInvoice/properties/cbc%3AID',
				);
				expect(error.keyword).toBe('type');
				expect(error.params).toEqual({ type: 'string' });
				expect(error.message).toBe(
					"reference '=Inwoice.A1' resolves to null: no such sheet 'Inwoice'",
				);
			}
		});

		it('should return an empty string if a non-existing cell is referenced', () => {
			const wb: XLSX.WorkBook = {
				Sheets: {
					Invoice: {},
				},
				SheetNames: ['Invoice'],
			} as XLSX.WorkBook;
			const value = service['resolveValue'](
				'=ET742',
				{} as JSONSchemaType<any>,
				{
					...defaultMappingContext,
					schemaPath: ['properties', 'ubl:Invoice', 'properties', 'cbc:ID'],
					workbook: wb,
				},
			);
			expect(value).toBe('');
		});

		it('should return an empty string for configured empty values', () => {
			const wb: XLSX.WorkBook = {
				Sheets: {
					Invoice: {
						A1: {
							t: 's',
							v: '[:empty:]',
						},
						A2: {
							t: 's',
							v: 'not empty',
						},
					},
				},
				SheetNames: ['Invoice'],
			} as XLSX.WorkBook;
			const empty = service['resolveValue']('=A1', {} as JSONSchemaType<any>, {
				...defaultMappingContext,
				meta: {
					sectionColumn: {},
					empty: ['[:empty:]'],
				},
				schemaPath: ['properties', 'ubl:Invoice', 'properties', 'cbc:ID'],
				workbook: wb,
			});
			expect(empty).toBe('');

			const notEmpty = service['resolveValue'](
				'=A2',
				{} as JSONSchemaType<any>,
				{
					...defaultMappingContext,
					schemaPath: ['properties', 'ubl:Invoice', 'properties', 'cbc:ID'],
					workbook: wb,
				},
			);
			expect(notEmpty).toBe('not empty');
		});

		it('should throw an exception if a non-existing section is referenced', async () => {
			const localMapping = structuredClone(mapping);
			localMapping['ubl:Invoice']['cac:InvoiceLine']['cbc:ID'] = '=:Lines.A1';
			const mockValidateMapping = jest
				.spyOn(service as any, 'validateMapping')
				.mockReturnValue(localMapping);
			const buf: Buffer = [] as unknown as Buffer;

			jest.spyOn(XLSX, 'read').mockReturnValueOnce(workbook);

			try {
				service.transform(buf, 'UBL', {} as Mapping);
				throw new Error('no exception thrown');
			} catch (e) {
				expect(e).toBeDefined();
				expect(e.validation).toBeTruthy();
				expect(e.ajv).toBeTruthy();
				expect(Array.isArray(e.errors)).toBeTruthy();
				expect(e.errors.length).toBe(1);

				const error = e.errors[0];
				expect(error.instancePath).toBe(
					'/ubl:Invoice/cac:InvoiceLine/0/cbc:ID',
				);
				expect(error.schemaPath).toBe(
					'#/properties/ubl%3AInvoice/properties/cac%3AInvoiceLine/items/properties/cbc%3AID',
				);
				expect(error.keyword).toBe('type');
				expect(error.params).toEqual({ type: 'string' });
				expect(error.message).toBe(
					"reference '=:Lines.A1' resolves to null: cannot find section 'Lines' in sheet 'Invoice'",
				);
			}

			mockValidateMapping.mockRestore();
		});

		it('should throw an exception if a non-existing sheet is referenced as section', async () => {
			const localMapping = structuredClone(mapping);
			localMapping['ubl:Invoice']['cac:InvoiceLine']['section'] =
				'Infoice:Line';
			const mockValidateMapping = jest
				.spyOn(service as any, 'validateMapping')
				.mockReturnValue(localMapping);
			const buf: Buffer = [] as unknown as Buffer;

			jest.spyOn(XLSX, 'read').mockReturnValueOnce(workbook);

			try {
				service.transform(buf, 'UBL', {} as Mapping);
				throw new Error('no exception thrown');
			} catch (e) {
				expect(e).toBeDefined();
				expect(e.validation).toBeTruthy();
				expect(e.ajv).toBeTruthy();
				expect(Array.isArray(e.errors)).toBeTruthy();
				expect(e.errors.length).toBe(1);

				const error = e.errors[0];
				expect(error.instancePath).toBe('/ubl:Invoice/cac:InvoiceLine/section');
				expect(error.schemaPath).toBe(
					'#/properties/ubl%3AInvoice/properties/cac%3AInvoiceLine/properties/section',
				);
				expect(error.keyword).toBe('type');
				expect(error.params).toEqual({ type: 'string' });
				expect(error.message).toBe(
					"section reference 'Infoice:Line' resolves to null: no section column for sheet 'Infoice'",
				);
			}

			mockValidateMapping.mockRestore();
		});

		it('should throw an exception if a non-existing section is referenced as section', async () => {
			const localMapping = structuredClone(mapping);
			localMapping['ubl:Invoice']['cac:InvoiceLine']['section'] =
				'Invoice:Lime';
			const mockValidateMapping = jest
				.spyOn(service as any, 'validateMapping')
				.mockReturnValue(localMapping);
			const buf: Buffer = [] as unknown as Buffer;

			jest.spyOn(XLSX, 'read').mockReturnValueOnce(workbook);

			try {
				service.transform(buf, 'UBL', {} as Mapping);
				throw new Error('no exception thrown');
			} catch (e) {
				expect(e).toBeDefined();
				expect(e.validation).toBeTruthy();
				expect(e.ajv).toBeTruthy();
				expect(Array.isArray(e.errors)).toBeTruthy();
				expect(e.errors.length).toBe(1);

				const error = e.errors[0];
				expect(error.instancePath).toBe('/ubl:Invoice/cac:InvoiceLine/section');
				expect(error.schemaPath).toBe(
					'#/properties/ubl%3AInvoice/properties/cac%3AInvoiceLine/properties/section',
				);
				expect(error.keyword).toBe('type');
				expect(error.params).toEqual({ type: 'string' });
				expect(error.message).toBe(
					"section reference 'Invoice:Lime' resolves to null: no section 'Lime' in sheet 'Invoice'",
				);
			}

			mockValidateMapping.mockRestore();
		});

		it('should throw an exception if multiple unbound sections are encountered', async () => {
			const mockValidateMapping = jest
				.spyOn(service as any, 'validateMapping')
				.mockReturnValue(mapping);
			const buf: Buffer = [] as unknown as Buffer;

			const localWorkbook = structuredClone(workbook);
			localWorkbook.Sheets.Invoice.K28 = { t: 's', v: 'SubTotal' };

			jest.spyOn(XLSX, 'read').mockReturnValueOnce(localWorkbook);

			try {
				service.transform(buf, 'UBL', {} as Mapping);
				throw new Error('no exception thrown');
			} catch (e) {
				expect(e).toBeDefined();
				expect(e.validation).toBeTruthy();
				expect(e.ajv).toBeTruthy();
				expect(Array.isArray(e.errors)).toBeTruthy();
				expect(e.errors.length).toBe(1);

				const error = e.errors[0];
				expect(error.instancePath).toBe(
					'/ubl:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount',
				);
				expect(error.schemaPath).toBe(
					'#/properties/ubl%3AInvoice/properties/cac%3ALegalMonetaryTotal/properties/cbc%3ALineExtensionAmount',
				);
				expect(error.keyword).toBe('type');
				expect(error.params).toEqual({ type: 'string' });
				expect(error.message).toBe(
					"reference '=:SubTotal.F1' resolves to null: multiple unbound sections 'SubTotal' in sheet 'Invoice'",
				);
			}

			mockValidateMapping.mockRestore();
		});

		// Test the parseMapping() method.
		it('should validate mappings and fill defaults', () => {
			const formatter: EInvoiceFormat = {
				fillMappingDefaults: jest.fn(),
			} as unknown as EInvoiceFormat;
			const formatFactorySpy = jest
				.spyOn(FormatFactoryService.prototype, 'createFormatService')
				.mockReturnValue(formatter);
			const validateSpy = jest
				.spyOn(ValidationService.prototype, 'validate')
				.mockReturnValue({ 'ubl:Invoice': {} });

			const buf: Buffer = [] as unknown as Buffer;
			jest.spyOn(XLSX, 'read').mockReturnValueOnce(workbook);

			const mockFillSectionRanges = jest
				.spyOn(service as any, 'fillSectionRanges')
				.mockImplementationOnce(() => {});

			const invoice = service.transform(buf, 'ZIRKUSFeRD', {} as Mapping);

			expect(invoice).toEqual({ 'ubl:Invoice': {} });
			expect(validateSpy).toHaveBeenCalledTimes(1);
			expect(validateSpy).toHaveBeenCalledWith(
				'mapping data',
				expect.anything(),
				{},
			);

			expect(formatFactorySpy).toHaveBeenCalledTimes(1);
			expect(formatFactorySpy).toHaveBeenCalledWith('ZIRKUSFeRD', logger);
			expect(formatter.fillMappingDefaults).toHaveBeenCalledTimes(1);
			expect(formatter.fillMappingDefaults).toHaveBeenCalledWith({
				'ubl:Invoice': {},
			});

			formatFactorySpy.mockRestore();
			validateSpy.mockRestore();
			mockFillSectionRanges.mockRestore();
		});

		describe('should transform invoice data', () => {
			let invoice: Invoice;

			beforeAll(async () => {
				const mockValidateMapping = jest
					.spyOn(service as any, 'validateMapping')
					.mockReturnValue(mapping);
				const buf: Buffer = [] as unknown as Buffer;

				jest.spyOn(XLSX, 'read').mockReturnValueOnce(workbook);

				invoice = service.transform(buf, 'UBL', {} as Mapping);

				mockValidateMapping.mockRestore();
			});

			it('should return an invoice object', () => {
				expect(invoice).toBeDefined();
				expect(invoice['ubl:Invoice']).toBeDefined();
			});

			it('should map a literal value', () => {
				expect(invoice['ubl:Invoice']['cbc:ID']).toBe('1234567890');
				expect(typeof invoice['ubl:Invoice']['cbc:ID']).toBe('string');
			});

			it('should map a literal date', () => {
				expect(invoice['ubl:Invoice']['cbc:IssueDate']).toBe('2024-10-21');
			});

			it('should map a date', () => {
				expect(invoice['ubl:Invoice']['cbc:DueDate']).toBe('2024-10-28');
			});

			it('should map a string value', () => {
				const wanted = workbook.Sheets.Invoice.B1.v;
				expect(invoice['ubl:Invoice']['cbc:CustomizationID']).toBe(wanted);
			});

			it('should map a quoted literal value', () => {
				const wanted = '= not equals eagles';
				expect(invoice['ubl:Invoice']['cbc:Note']).toBe(wanted);
			});

			it('should map a nested object property', () => {
				const wanted = '0815';
				expect(invoice['ubl:Invoice']['cac:OrderReference']?.['cbc:ID']).toBe(
					wanted,
				);
			});

			it('should map an array of invoice lines', () => {
				const target = invoice['ubl:Invoice']['cac:InvoiceLine'];
				expect(target).toBeDefined();
				expect(Array.isArray(target)).toBe(true);
				expect(target.length).toBe(3);
				expect(target[0]['cbc:ID']).toBe('1');
				expect(target[1]['cbc:ID']).toBe('2');
				expect(target[2]['cbc:ID']).toBe('3');
			});

			it('should map allowances charges of invoice line #1', () => {
				const target =
					invoice['ubl:Invoice']['cac:InvoiceLine'][0]['cac:AllowanceCharge'];
				expect(target).toBeDefined();
				if (typeof target !== 'undefined') {
					expect(Array.isArray(target)).toBe(true);
					expect(target.length).toBe(1);
					expect(target[0]['cbc:Amount']).toBe('23.04');
					expect(target[0]['cbc:Amount@currencyID']).toBe('EUR');
				}
			});

			it('should map allowances charges of invoice line #2', () => {
				const target =
					invoice['ubl:Invoice']['cac:InvoiceLine'][1]['cac:AllowanceCharge'];
				expect(target).toBeDefined();
				if (typeof target !== 'undefined') {
					expect(Array.isArray(target)).toBe(true);
					expect(target.length).toBe(0);
				}
			});

			it('should map allowances charges of invoice line #3', () => {
				const target =
					invoice['ubl:Invoice']['cac:InvoiceLine'][2]['cac:AllowanceCharge'];
				expect(target).toBeDefined();
				if (typeof target !== 'undefined') {
					expect(Array.isArray(target)).toBe(true);
					expect(target.length).toBe(2);
					expect(target[0]['cbc:Amount']).toBe('13.03');
					expect(target[0]['cbc:Amount@currencyID']).toBe('EUR');
					expect(target[1]['cbc:Amount']).toBe('42.00');
					expect(target[1]['cbc:Amount@currencyID']).toBe('EUR');
				}
			});

			it('should map non-array sections', () => {
				const target =
					invoice['ubl:Invoice']['cac:LegalMonetaryTotal'][
						'cbc:LineExtensionAmount'
					];
				expect(target).toBe('12345.67');
			});

			it('should map arrays without sections', () => {
				const target = invoice['ubl:Invoice']['cac:PaymentMeans'];
				expect(Array.isArray(target)).toBe(true);
				expect(target?.[0]['cbc:PaymentMeansCode']).toBe('30');
			});
		});
	});
});
