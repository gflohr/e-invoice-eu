import * as XLSX from '@e965/xlsx';
import { Test, TestingModule } from '@nestjs/testing';
import { JSONSchemaType } from 'ajv';

import { Mapping, MappingMetaInformation } from './mapping.interface';
import { MappingService } from './mapping.service';
import { FormatFactoryService } from '../format/format.factory.service';
import { Invoice } from '../invoice/invoice.interface';
import { SerializerService } from '../serializer/serializer.service';
import { ValidationService } from '../validation/validation.service';

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

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				MappingService,
				FormatFactoryService,
				{
					provide: 'FormatFactoryService',
					useValue: {},
				},
				SerializerService,
				{
					provide: 'SerializerService',
					useValue: {},
				},
				ValidationService,
				{
					provide: 'ValidationService',
					useValue: {
						validate: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<MappingService>(MappingService);
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

		it('should throw an exception if a non-existing cell is referenced', () => {
			const wb: XLSX.WorkBook = {
				Sheets: {
					Invoice: {},
				},
				SheetNames: ['Invoice'],
			} as XLSX.WorkBook;
			try {
				service['resolveValue']('=ET742', {} as JSONSchemaType<any>, {
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
					"reference '=ET742' resolves to null: no such cell 'ET742'",
				);
			}
		});

		it('should throw an exception if a non-existing section is referenced', async () => {
			const localMapping = structuredClone(mapping);
			localMapping['ubl:Invoice']['cac:InvoiceLine']['cbc:ID'] = '=:Lines.A1';
			const mockParseMapping = jest
				.spyOn(service as any, 'parseMapping')
				.mockReturnValue(localMapping);
			const buf: Buffer = [] as unknown as Buffer;

			jest.spyOn(XLSX, 'read').mockReturnValueOnce(workbook);

			try {
				service.transform('UBL', '{}', buf);
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

			mockParseMapping.mockRestore();
		});

		it('should throw an exception if a non-existing sheet is referenced as section', async () => {
			const localMapping = structuredClone(mapping);
			localMapping['ubl:Invoice']['cac:InvoiceLine']['section'] =
				'Infoice:Line';
			const mockParseMapping = jest
				.spyOn(service as any, 'parseMapping')
				.mockReturnValue(localMapping);
			const buf: Buffer = [] as unknown as Buffer;

			jest.spyOn(XLSX, 'read').mockReturnValueOnce(workbook);

			try {
				service.transform('UBL', '{}', buf);
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

			mockParseMapping.mockRestore();
		});

		it('should throw an exception if a non-existing section is referenced as section', async () => {
			const localMapping = structuredClone(mapping);
			localMapping['ubl:Invoice']['cac:InvoiceLine']['section'] =
				'Invoice:Lime';
			const mockParseMapping = jest
				.spyOn(service as any, 'parseMapping')
				.mockReturnValue(localMapping);
			const buf: Buffer = [] as unknown as Buffer;

			jest.spyOn(XLSX, 'read').mockReturnValueOnce(workbook);

			try {
				service.transform('UBL', '{}', buf);
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

			mockParseMapping.mockRestore();
		});

		describe('should transform invoice data', () => {
			let invoice: Invoice;

			beforeAll(async () => {
				const mockParseMapping = jest
					.spyOn(service as any, 'parseMapping')
					.mockReturnValue(mapping);
				const buf: Buffer = [] as unknown as Buffer;

				jest.spyOn(XLSX, 'read').mockReturnValueOnce(workbook);

				invoice = service.transform('UBL', '{}', buf);

				mockParseMapping.mockRestore();
			});

			it('should return an invoice object', () => {
				expect(invoice).toBeDefined();
				expect(invoice['ubl:Invoice']).toBeDefined();
			});

			it('should map a literal value', () => {
				expect(invoice['ubl:Invoice']['cbc:ID']).toBe('1234567890');
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
		});
	});
});
