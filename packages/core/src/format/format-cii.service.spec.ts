import { describe, it, beforeEach, expect } from 'vitest';

import { Invoice } from '@e-invoice-eu/core';

import { FormatCIIService } from './format-cii.service';
import { InvoiceServiceOptions } from '../invoice/invoice.service';
import { Logger } from '../logger.interface';
import { ExpandObject } from 'xmlbuilder2/lib/interfaces';

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

	describe('post-processing', () => {
		const defaultNotes = [
			'Buy a dozen donuts at the Kwik-E-Mart and instantly become' +
				' Homer-level happy—guaranteed to make your cat ignore you!',
			"Order Bart's Skateboard Deluxe 3000 from the Simpson Garage" +
				" because it's the only board that survives a launch over" +
				" Grandpa's dentures!",
		];

		const postProcessor = (data: ExpandObject) => {
			if (
				data['rsm:CrossIndustryInvoice']['rsm:ExchangedDocument']![
					'ram:IncludedNote'
				]
			) {
				if (
					!Array.isArray(
						data['rsm:CrossIndustryInvoice']['rsm:ExchangedDocument']![
							'ram:IncludedNote'
						],
					)
				) {
					data['rsm:CrossIndustryInvoice']['rsm:ExchangedDocument']![
						'ram:IncludedNote'
					] = [
						data['rsm:CrossIndustryInvoice']['rsm:ExchangedDocument']![
							'ram:IncludedNote'
						],
					];
				}
			} else {
				data['rsm:CrossIndustryInvoice']['rsm:ExchangedDocument']![
					'ram:IncludedNote'
				] = [];
			}

			const notes =
				data['rsm:CrossIndustryInvoice']['rsm:ExchangedDocument'][
					'ram:IncludedNote'
				];

			for (const note of defaultNotes) {
				notes.push({ 'ram:Content': note });
			}
		};

		it('should append default notes to the invoice notes', async () => {
			const invoice: Invoice = {
				'ubl:Invoice': {
					'cbc:ID': '1234567890',
					'cbc:Note': ['Please send complaints to devnull@us.com'],
				},
			} as unknown as Invoice;
			const options = {
				postProcessor,
			} as InvoiceServiceOptions;

			const xml = await service.generate(invoice, options);
			expect(xml).toMatchSnapshot();
		});
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
				expect(xml).toContain(
					'<ram:GlobalID schemeID="0088">83745498753497</ram:GlobalID>',
				);
				expect(xml).not.toContain('<ram:ID>83745498753497</ram:ID>');
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
				expect(xml).toContain('<ram:ID>around-the-corner</ram:ID>');
				expect(xml).not.toContain(
					'<ram:GlobalID>around-the-corner</ram:GlobalID>',
				);
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
					/<qdt:DateTimeString format="102">\s*20251231\s*<\/qdt:DateTimeString>/,
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
				expect(xml).toContain('<ram:ID>42</ram:ID>');
				expect(xml).not.toContain('<ram:GlobalID>42</ram:GlobalID>');
				expect(xml).toMatchSnapshot();
			});

			it('should keep buyer GlobalID with a scheme', async () => {
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
				expect(xml).toContain(
					'<ram:GlobalID schemeID="0088">SE8765456787</ram:GlobalID>',
				);
				expect(xml).not.toContain('<ram:ID>SE8765456787</ram:ID>');
				expect(xml).toMatchSnapshot();
			});
		});

		describe('#490 adapt seller party mappings depending on it attribute presence', () => {
			it('should map seller ids in a context-depending manner', async () => {
				const invoice: Invoice = {
					'ubl:Invoice': {
						'cac:AccountingSupplierParty': {
							'cac:Party': {
								'cac:PartyIdentification': [
									// Those will become global IDs.
									{
										'cbc:ID': '5060012349998',
										'cbc:ID@schemeID': '0088',
									},
									{
										'cbc:ID': 'abcdefxyz',
										'cbc:ID@schemeID': '0044',
									},
									// And those will remain local IDs.
									{
										'cbc:ID': '42',
									},
									{
										'cbc:ID': 'well known',
									},
								],
								// Make sure that this will come last in the
								// XML output.
								'cac:PartyName': {
									'cbc:Name': 'Acme Ltd.',
								},
							},
						},
					},
				} as unknown as Invoice;
				const xml = await service.generate(
					invoice,
					{} as InvoiceServiceOptions,
				);
				expect(xml).toContain('<ram:ID>42</ram:ID>');
				expect(xml).not.toContain('>42</ram:GlobalID>');
				expect(xml).toContain('<ram:ID>well known</ram:ID>');
				expect(xml).not.toContain('>well known</ram:GlobalID>');
				expect(xml).not.toContain('<ram:ID schemeID');
				expect(xml).toContain(
					'<ram:GlobalID schemeID="0088">5060012349998</ram:GlobalID>',
				);
				expect(xml).not.toContain('>5060012349998</ram:ID>');
				expect(xml).toContain(
					'<ram:GlobalID schemeID="0044">abcdefxyz</ram:GlobalID>',
				);
				expect(xml).not.toContain('>abcdefxyz</ram:ID>');
				// The snapshot test ensures that all local IDs precede the
				// global IDs.
				expect(xml).toMatchSnapshot();
			});
		});
	});
});
