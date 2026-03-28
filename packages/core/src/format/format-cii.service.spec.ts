import { Invoice } from '@e-invoice-eu/core';

import { FormatCIIService } from './format-cii.service';
import { InvoiceServiceOptions } from '../invoice/invoice.service';
import { Logger } from '../logger.interface';

describe('CII', () => {
	let service: FormatCIIService;
	beforeEach(async () => {
		service = new FormatCIIService({} as unknown as Logger);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should have a customization id', () => {
		expect(service.customizationID).toBeDefined();
	});

	it('should have a profile id', () => {
		expect(service.profileID).toBeDefined();
	});

	it('should convert string values', async () => {
		const invoice: Invoice = {
			'ubl:Invoice': {
				'cbc:CustomizationID': 'urn:cen.eu:en16931:2017',
				'cbc:ProfileID': 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0',
			},
		} as unknown as Invoice;
		const options = {} as InvoiceServiceOptions;
		const xml = await service.generate(invoice, options);
		expect(xml).toMatchSnapshot();
	});

	it('should omit missing string values', async () => {
		const invoice: Invoice = {
			'ubl:Invoice': {
				'cbc:CustomizationID': 'urn:cen.eu:en16931:2017',
			},
		} as unknown as Invoice;
		const options = {} as InvoiceServiceOptions;
		const xml = await service.generate(invoice, options);
		expect(xml).toMatchSnapshot();
	});

	it('should convert arrays', async () => {
		const invoice: Invoice = {
			'ubl:Invoice': {
				'cac:InvoiceLine': [
					{
						'cbc:ID': '1',
						'cac:Item': {
							'cbc:Name': 'Duff Beer by the Barrel',
						},
					},
					{
						'cbc:ID': '2',
						'cac:Item': {
							'cbc:Name': 'Do-It-Yourself Nuclear Power Plant Kit',
						},
					},
					{
						'cbc:ID': '3',
						'cac:Item': {
							'cbc:Name': 'Monorail Maintenance Fee ',
						},
					},
				],
			},
		} as unknown as Invoice;
		const options = {} as InvoiceServiceOptions;
		const xml = await service.generate(invoice, options);
		expect(xml).toMatchSnapshot();
	});

	it('should encode date/time strings correctly', async () => {
		const invoice: Invoice = {
			'ubl:Invoice': {
				'cbc:IssueDate': '2024-11-08',
			},
		} as unknown as Invoice;
		const options = {} as InvoiceServiceOptions;
		const xml = await service.generate(invoice, options);
		expect(xml).toMatchSnapshot();
	});

	describe('regressions', () => {
		describe('#146 missing TaxTotalAmount', () => {
			it('should fix add TaxTotalAmount', async () => {
				const invoice: Invoice = {
					'ubl:Invoice': {
						'cac:TaxTotal': [
							{
								'cbc:TaxAmount': '20.00',
								'cbc:TaxAmount@currencyID': 'BGN',
							},
						],
						'cac:LegalMonetaryTotal': {
							'cbc:LineExtensionAmount': '100.00',
						},
					},
				} as unknown as Invoice;
				const options = {} as InvoiceServiceOptions;
				const xml = await service.generate(invoice, options);
				expect(xml).toMatchSnapshot();
			});
		});

		describe('#310 adapt delivery party mapping depending on it attribute presence', () => {
			it('should fix #310 (global ids) for IDs with an attribute', async () => {
				const invoice: Invoice = {
					'ubl:Invoice': {
						'cac:Delivery': {
							'cac:DeliveryLocation': {
								'cbc:ID': '83745498753497',
								'cbc:ID@schemeID': '0088',
							},
						},
					},
				} as unknown as Invoice;
				const options = {} as InvoiceServiceOptions;
				const xml = await service.generate(invoice, options);
				expect(xml).toMatchSnapshot();
			});

			it('should not consider IDs w/o attribute as global (#310 global ids)', async () => {
				const invoice: Invoice = {
					'ubl:Invoice': {
						'cac:Delivery': {
							'cac:DeliveryLocation': {
								'cbc:ID': 'around-the-corner',
							},
						},
					},
				} as unknown as Invoice;
				const options = {} as InvoiceServiceOptions;
				const xml = await service.generate(invoice, options);
				expect(xml).toMatchSnapshot();
			});
		});

		describe('#455 map billing reference', () => {
			it('maps BillingReference InvoiceDocumentReference to InvoiceReferencedDocument', async () => {
				const invoice: Invoice = {
					'ubl:Invoice': {
						'cac:BillingReference': [
							{
								'cac:InvoiceDocumentReference': {
									'cbc:ID': 'INV-123',
									'cbc:IssueDate': '2025-12-31',
								},
							},
						],
					},
				} as unknown as Invoice;
				const xml = await service.generate(
					invoice,
					{} as InvoiceServiceOptions,
				);
				expect(xml).toContain(
					'<ram:IssuerAssignedID>INV-123</ram:IssuerAssignedID>',
				);
				expect(xml).toMatch(
					/<qdt:DateTimeString format="102">\s*2025-12-31\s*<\/qdt:DateTimeString>/,
				);
			});
		});

		describe('#465 adapt buyer party mapping depending on it attribute presence', () => {
			it('should downgrade buyer GlobalID to ID without a scheme', async () => {
				const invoice: Invoice = {
					'ubl:Invoice': {
						'cac:AccountingCustomerParty': {
							'cac:Party': {
								'cac:PartyIdentification': {
									'cbc:ID': '42',
								},
							},
						},
					},
				} as unknown as Invoice;
				const xml = await service.generate(
					invoice,
					{} as InvoiceServiceOptions,
				);
				expect(xml).toMatchSnapshot();
			});

			it('should keep buyer GlobalID to ID with a scheme', async () => {
				const invoice: Invoice = {
					'ubl:Invoice': {
						'cac:AccountingCustomerParty': {
							'cac:Party': {
								'cac:PartyIdentification': {
									'cbc:ID': 'SE8765456787',
									'cbc:ID@schemeID': '0088',
								},
							},
						},
					},
				} as unknown as Invoice;
				const xml = await service.generate(
					invoice,
					{} as InvoiceServiceOptions,
				);
				expect(xml).toMatchSnapshot();
			});
		});
	});
});
