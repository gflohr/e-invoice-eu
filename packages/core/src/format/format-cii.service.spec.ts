import { Invoice } from '@e-invoice-eu/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { ExpandObject } from 'xmlbuilder2/lib/interfaces';
import { InvoiceServiceOptions } from '../invoice/invoice.service';
import { Logger } from '../logger.interface';
import { FormatCIIService } from './format-cii.service';

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
							'cbc:Name':
								'Do-It-Yourself Nuclear Power Plant Kit',
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

	describe('Extensions for CII', () => {
		it('should render BT-21 for CII', async () => {
			const invoice: Invoice = {
				'ubl:Invoice': {
					'cbc:Note': ['Please send complaints to devnull@us.com'],
					'x-cii:SubjectCode': ['AAB'],
				},
			} as unknown as Invoice;

			const xml = await service.generate(invoice, {
				format: 'CII',
				lang: 'en',
			});
			expect(xml).toMatchSnapshot();
		});
	});

	describe('Object identifiers', () => {
		const objectIdentifier = {
			'cbc:ID': 'TSTHMR913N0000742',
			'cbc:ID@schemeID': 'AKG',
			'cbc:DocumentTypeCode': '130',
		};

		const invoiceLine = (documentReference: object) => ({
			'cbc:ID': '1',
			'cbc:LineExtensionAmount': '82000.00',
			'cbc:AccountingCost': '8400',
			'cac:DocumentReference': documentReference,
			'cac:Item': {
				'cbc:Name': 'The Homer',
			},
		});

		it('should map BT-128 with a scheme into the line trade settlement', async () => {
			const invoice: Invoice = {
				'ubl:Invoice': {
					'cac:InvoiceLine': [invoiceLine(objectIdentifier)],
				},
			} as unknown as Invoice;

			const xml = await service.generate(
				invoice,
				{} as InvoiceServiceOptions,
			);

			expect(xml).toMatch(
				new RegExp(
					'</ram:SpecifiedTradeSettlementLineMonetarySummation>\\s*' +
						'<ram:AdditionalReferencedDocument>\\s*' +
						'<ram:IssuerAssignedID>TSTHMR913N0000742</ram:IssuerAssignedID>\\s*' +
						'<ram:TypeCode>130</ram:TypeCode>\\s*' +
						'<ram:ReferenceTypeCode>AKG</ram:ReferenceTypeCode>\\s*' +
						'</ram:AdditionalReferencedDocument>\\s*' +
						'<ram:ReceivableSpecifiedTradeAccountingAccount>',
				),
			);
			expect(xml).toMatch(
				/<\/ram:SpecifiedLineTradeSettlement>\s*<\/ram:IncludedSupplyChainTradeLineItem>/,
			);
			expect(xml).toMatchSnapshot();
		});

		it('should map BT-128 without a scheme into the line trade settlement', async () => {
			const invoice: Invoice = {
				'ubl:Invoice': {
					'cac:InvoiceLine': [
						invoiceLine({
							'cbc:ID': 'TSTHMR913N0000742',
							'cbc:DocumentTypeCode': '130',
						}),
					],
				},
			} as unknown as Invoice;

			const xml = await service.generate(
				invoice,
				{} as InvoiceServiceOptions,
			);

			expect(xml).toMatch(
				new RegExp(
					'</ram:SpecifiedTradeSettlementLineMonetarySummation>\\s*' +
						'<ram:AdditionalReferencedDocument>\\s*' +
						'<ram:IssuerAssignedID>TSTHMR913N0000742</ram:IssuerAssignedID>\\s*' +
						'<ram:TypeCode>130</ram:TypeCode>\\s*' +
						'</ram:AdditionalReferencedDocument>\\s*' +
						'<ram:ReceivableSpecifiedTradeAccountingAccount>',
				),
			);
			expect(xml).not.toContain('<ram:ReferenceTypeCode>');
			expect(xml).toMatchSnapshot();
		});

		it('should map BT-18 with a scheme into the header trade agreement', async () => {
			const invoice: Invoice = {
				'ubl:Invoice': {
					'cac:ContractDocumentReference': {
						'cbc:ID': 'Powell Motors 1991',
					},
					'cac:AdditionalDocumentReference': [objectIdentifier],
					'cac:ProjectReference': {
						'cbc:ID': 'Car for the average man',
					},
				},
			} as unknown as Invoice;

			const xml = await service.generate(
				invoice,
				{} as InvoiceServiceOptions,
			);

			expect(xml).toMatch(
				new RegExp(
					'</ram:ContractReferencedDocument>\\s*' +
						'<ram:AdditionalReferencedDocument>\\s*' +
						'<ram:IssuerAssignedID>TSTHMR913N0000742</ram:IssuerAssignedID>\\s*' +
						'<ram:TypeCode>130</ram:TypeCode>\\s*' +
						'<ram:ReferenceTypeCode>AKG</ram:ReferenceTypeCode>\\s*' +
						'</ram:AdditionalReferencedDocument>\\s*' +
						'<ram:SpecifiedProcuringProject>',
				),
			);
			expect(xml).toMatchSnapshot();
		});

		it('should map BT-18 without a scheme into the header trade agreement', async () => {
			const invoice: Invoice = {
				'ubl:Invoice': {
					'cac:AdditionalDocumentReference': [
						{
							'cbc:ID': 'TSTHMR913N0000742',
							'cbc:DocumentTypeCode': '130',
						},
					],
				},
			} as unknown as Invoice;

			const xml = await service.generate(
				invoice,
				{} as InvoiceServiceOptions,
			);

			expect(xml).toMatch(
				new RegExp(
					'<ram:ApplicableHeaderTradeAgreement>\\s*' +
						'<ram:AdditionalReferencedDocument>\\s*' +
						'<ram:IssuerAssignedID>TSTHMR913N0000742</ram:IssuerAssignedID>\\s*' +
						'<ram:TypeCode>130</ram:TypeCode>\\s*' +
						'</ram:AdditionalReferencedDocument>\\s*' +
						'</ram:ApplicableHeaderTradeAgreement>',
				),
			);
			expect(xml).not.toContain('<ram:ReferenceTypeCode>');
			expect(xml).toMatchSnapshot();
		});

		it('should map BT-18 next to additional supporting documents', async () => {
			const invoice: Invoice = {
				'ubl:Invoice': {
					'cac:AdditionalDocumentReference': [
						objectIdentifier,
						{
							'cbc:ID': 'Timesheet',
							'cbc:DocumentDescription': "Hours spent at Moe's",
							'cac:Attachment': {
								'cac:ExternalReference': {
									'cbc:URI':
										'https://example.com/timesheet.pdf',
								},
							},
						},
					],
				},
			} as unknown as Invoice;

			service.patchInvoice(invoice);
			const xml = await service.generate(
				invoice,
				{} as InvoiceServiceOptions,
			);

			const count = (
				(xml as string).match(/<ram:AdditionalReferencedDocument>/g) ||
				[]
			).length;
			expect(count).toBe(2);
			expect(xml).toMatch(
				new RegExp(
					'<ram:IssuerAssignedID>TSTHMR913N0000742</ram:IssuerAssignedID>\\s*' +
						'<ram:TypeCode>130</ram:TypeCode>\\s*' +
						'<ram:ReferenceTypeCode>AKG</ram:ReferenceTypeCode>',
				),
			);
			expect(xml).toMatch(
				new RegExp(
					'<ram:IssuerAssignedID>Timesheet</ram:IssuerAssignedID>\\s*' +
						'<ram:URIID>https://example.com/timesheet.pdf</ram:URIID>\\s*' +
						'<ram:TypeCode>916</ram:TypeCode>\\s*' +
						"<ram:Name>Hours spent at Moe's</ram:Name>",
				),
			);
			expect(xml).toMatchSnapshot();
		});
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
						data['rsm:CrossIndustryInvoice'][
							'rsm:ExchangedDocument'
						]!['ram:IncludedNote'],
					)
				) {
					data['rsm:CrossIndustryInvoice']['rsm:ExchangedDocument']![
						'ram:IncludedNote'
					] = [
						data['rsm:CrossIndustryInvoice'][
							'rsm:ExchangedDocument'
						]!['ram:IncludedNote'],
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

	describe('Regressions', () => {
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

		describe('#490 adapt seller party mappings depending on schemeID attribute presence', () => {
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

		describe('#567 fix element order', () => {
			it('should use the right order for schemeless supplier party IDs', async () => {
				const invoice: Invoice = {
					'ubl:Invoice': {
						'cac:AccountingSupplierParty': {
							'cac:Party': {
								'cac:PartyIdentification': [
									{
										'cbc:ID': '42',
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
				expect(xml).not.toContain('<ram:GlobalID>42</ram:GlobalID>');
				// The snapshot test ensures that all local IDs precede the
				// global IDs.
				expect(xml).toMatchSnapshot();
			});

			it('should use the right order for schemeless customer party IDs', async () => {
				const invoice: Invoice = {
					'ubl:Invoice': {
						'cac:AccountingCustomerParty': {
							'cac:Party': {
								'cac:PartyIdentification': {
									'cbc:ID': '42',
								},
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
				expect(xml).not.toContain('<ram:GlobalID>42</ram:GlobalID>');
				// The snapshot test ensures that all local IDs precede the
				// global IDs.
				expect(xml).toMatchSnapshot();
			});

			it('should use the right order for schemeless delivery location ID', async () => {
				const invoice: Invoice = {
					'ubl:Invoice': {
						'cac:Delivery': {
							'cac:DeliveryLocation': {
								'cbc:ID': '42',
								'cac:Address': {
									'cac:Country': {
										'cbc:IdentificationCode': 'BG',
									},
								},
							},
						},
					},
				} as Invoice;
				const xml = await service.generate(
					invoice,
					{} as InvoiceServiceOptions,
				);
				expect(xml).toContain('<ram:ID>42</ram:ID>');
				expect(xml).not.toContain('<ram:GlobalID>42</ram:GlobalID>');
				// The snapshot test ensures that all local IDs precede the
				// global IDs.
				expect(xml).toMatchSnapshot();
			});
		});

		describe('#569 CII DueDateTypeCode (BT-8) never emitted from cac:InvoicePeriod/cbc:DescriptionCode', () => {
			it('should emit the due date type code', async () => {
				const invoice: Invoice = {
					'ubl:Invoice': {
						'cac:InvoicePeriod': {
							'cbc:DescriptionCode': '432',
						},
						'cac:TaxTotal': [
							{
								'cac:TaxSubtotal': [
									{
										'cac:TaxCategory': {
											'cbc:ID': 'S',
											'cbc:Percent': '20',
											'cac:TaxScheme': {
												'cbc:ID': 'VAT',
											},
										},
									},
								],
							},
						],
					},
				} as Invoice;
				const xml = await service.generate(
					invoice,
					{} as InvoiceServiceOptions,
				);
				expect(xml).toContain(
					'<ram:DueDateTypeCode>432</ram:DueDateTypeCode>',
				);
				expect(xml).toMatchSnapshot();
			});
		});

		describe('#593 Conditional Mapping of Payee/Supplier ID', () => {
			it('should map an unqualified payee party ID as a local ID', async () => {
				const invoice: Invoice = {
					'ubl:Invoice': {
						'cac:PayeeParty': {
							'cac:PartyIdentification': {
								'cbc:ID': 'xyz',
							},
							'cac:PartyName': {
								'cbc:Name': 'Get-Cash Ltd.',
							},
						},
					},
				} as unknown as Invoice;

				const xml = await service.generate(
					invoice,
					{} as InvoiceServiceOptions,
				);

				expect(xml).toContain(`
			<ram:PayeeTradeParty>
				<ram:ID>xyz</ram:ID>
				<ram:Name>Get-Cash Ltd.</ram:Name>
			</ram:PayeeTradeParty>`);
				expect(xml).toMatchSnapshot();
			});

			it('should map a qualified payee party non-SEPA ID as a global ID', async () => {
				const invoice: Invoice = {
					'ubl:Invoice': {
						'cac:PayeeParty': {
							'cac:PartyIdentification': {
								'cbc:ID': 'BG123456789',
								'cbc:ID@schemeID': '9926',
							},
						},
					},
				} as unknown as Invoice;
				const xml = await service.generate(
					invoice,
					{} as InvoiceServiceOptions,
				);
				expect(xml).toContain(`
			<ram:PayeeTradeParty>
				<ram:GlobalID schemeID="9926">BG123456789</ram:GlobalID>
			</ram:PayeeTradeParty>`);
				expect(xml).toMatchSnapshot();
			});

			it('should map a qualified payee party SEPA ID as a creditor reference ID', async () => {
				const invoice: Invoice = {
					'ubl:Invoice': {
						'cac:PayeeParty': {
							'cac:PartyIdentification': {
								'cbc:ID': 'BG12345678901234567890',
								'cbc:ID@schemeID': 'SEPA',
							},
						},
					},
				} as Invoice;
				const xml = await service.generate(
					invoice,
					{} as InvoiceServiceOptions,
				);
				expect(xml).not.toContain('<ram:PayeeTradeParty>');
				expect(xml).toContain(`
		<ram:ApplicableHeaderTradeSettlement>
			<ram:CreditorReferenceID>BG12345678901234567890</ram:CreditorReferenceID>
		</ram:ApplicableHeaderTradeSettlement>`);
				expect(xml).toMatchSnapshot();
			});

			it('should map a qualified supplier party SEPA ID as a creditor reference ID', async () => {
				const invoice: Invoice = {
					'ubl:Invoice': {
						'cac:AccountingSupplierParty': {
							'cac:Party': {
								'cac:PartyIdentification': [
									{
										'cbc:ID': 'BG12345678901234567890',
										'cbc:ID@schemeID': 'SEPA',
									},
								],
							},
						},
					},
				} as Invoice;

				const xml = await service.generate(
					invoice,
					{} as InvoiceServiceOptions,
				);

				expect(xml).not.toContain('<ram:SellerTradeParty>');
				expect(xml).toContain(`
		<ram:ApplicableHeaderTradeSettlement>
			<ram:CreditorReferenceID>BG12345678901234567890</ram:CreditorReferenceID>
		</ram:ApplicableHeaderTradeSettlement>`);
				expect(xml).toMatchSnapshot();
			});

			it('should prefer the first qualified supplier party SEPA ID as a creditor reference ID', async () => {
				const invoice: Invoice = {
					'ubl:Invoice': {
						'cac:AccountingSupplierParty': {
							'cac:Party': {
								'cac:PartyIdentification': [
									{
										'cbc:ID': 'BG12345678901234567890',
										'cbc:ID@schemeID': 'SEPA',
									},
									{
										'cbc:ID': 'FR12345678901234567890',
										'cbc:ID@schemeID': 'SEPA',
									},
									{
										'cbc:ID': 'DE12345678901234567890',
										'cbc:ID@schemeID': 'SEPA',
									},
								],
							},
						},
					},
				} as Invoice;

				const xml = await service.generate(
					invoice,
					{} as InvoiceServiceOptions,
				);

				expect(xml).not.toContain('<ram:SellerTradeParty>');
				expect(xml).toContain(`
		<ram:ApplicableHeaderTradeSettlement>
			<ram:CreditorReferenceID>BG12345678901234567890</ram:CreditorReferenceID>
		</ram:ApplicableHeaderTradeSettlement>`);
				expect(xml).toMatchSnapshot();
			});

			it('should preserve other supplier IDs', async () => {
				const invoice: Invoice = {
					'ubl:Invoice': {
						'cac:AccountingSupplierParty': {
							'cac:Party': {
								'cac:PartyIdentification': [
									{
										'cbc:ID': 'BG12345678901234567890',
										'cbc:ID@schemeID': 'SEPA',
									},
									{
										'cbc:ID': 'user@acme.com',
										'cbc:ID@schemeID': 'EM',
									},
									{
										'cbc:ID': 'well-known',
									},
								],
							},
						},
					},
				} as Invoice;

				const xml = await service.generate(
					invoice,
					{} as InvoiceServiceOptions,
				);

				expect(xml).toContain('<ram:SellerTradeParty>');
				expect(xml).toContain(`
		<ram:ApplicableHeaderTradeAgreement>
			<ram:SellerTradeParty>
				<ram:ID>well-known</ram:ID>
				<ram:GlobalID schemeID="EM">user@acme.com</ram:GlobalID>
			</ram:SellerTradeParty>
		</ram:ApplicableHeaderTradeAgreement>`);
				expect(xml).toContain(`
		<ram:ApplicableHeaderTradeSettlement>
			<ram:CreditorReferenceID>BG12345678901234567890</ram:CreditorReferenceID>
		</ram:ApplicableHeaderTradeSettlement>`);
				expect(xml).toMatchSnapshot();
			});

			it('should prefer the payee over the supplier party SEPA ID as a creditor reference ID', async () => {
				const invoice: Invoice = {
					'ubl:Invoice': {
						'cac:AccountingSupplierParty': {
							'cac:Party': {
								'cac:PartyIdentification': [
									{
										'cbc:ID': 'DE12345678901234567890',
										'cbc:ID@schemeID': 'SEPA',
									},
								],
							},
						},
						'cac:PayeeParty': {
							'cac:PartyIdentification': {
								'cbc:ID': 'BG12345678901234567890',
								'cbc:ID@schemeID': 'SEPA',
							},
						},
					},
				} as Invoice;

				const xml = await service.generate(
					invoice,
					{} as InvoiceServiceOptions,
				);

				expect(xml).not.toContain('<ram:SellerTradeParty>');
				expect(xml).not.toContain('<ram:PayeeTradeParty>');
				expect(xml).toContain(`
		<ram:ApplicableHeaderTradeSettlement>
			<ram:CreditorReferenceID>BG12345678901234567890</ram:CreditorReferenceID>
		</ram:ApplicableHeaderTradeSettlement>`);
				expect(xml).toMatchSnapshot();
			});
		});

		describe('#626', () => {
			it('#626 insert an empty ram:ApplicableHeaderTradeDelivery, when required', async () => {
				const invoice: Invoice = {
					'ubl:Invoice': {
						'cac:InvoicePeriod': {
							'cbc:StartDate': '2026-09-01',
							'cbc:EndDate': '2026-09-30',
						},
					},
				} as Invoice;

				const xml = await service.generate(
					invoice,
					{} as InvoiceServiceOptions,
				);

				expect(xml).toContain('<ram:ApplicableHeaderTradeDelivery/>');
				expect(xml).toMatchSnapshot();
			});
		});

		describe('#647 Multiple notes', () => {
			it('should wrap every note into a content node', async () => {
				const invoice: Invoice = {
					'ubl:Invoice': {
						'cbc:Note': [
							'Sector 7-G console replacement surcharge applied. It was like that when I got here.',
							'Payment due net 30 days or we release the hounds.',
							'Consulting fee: Taught plant manager to pronounce "Nucular".',
							'Monorail consulting fee. True, genuine, bona fide, 6-car monorail!',
							'I will not submit fake invoice notes for unit tests.',
						],
						'x-cii:SubjectCode': ['AAB', '', 'AAC'],
					},
				} as Invoice;

				const xml = (await service.generate(
					invoice,
					{} as InvoiceServiceOptions,
				)) as string;

				const countNoteStart = (xml.match(/<ram:IncludedNote>/g) || [])
					.length;
				expect(countNoteStart).toBe(5);
				const countNoteEnd = (xml.match(/<\/ram:IncludedNote>/g) || [])
					.length;
				expect(countNoteEnd).toBe(5);
				const countContentStart = (xml.match(/<ram:Content>/g) || [])
					.length;
				expect(countContentStart).toBe(5);
				const countContentEnd = (xml.match(/<\/ram:Content>/g) || [])
					.length;
				expect(countContentEnd).toBe(5);
				const countSubjectCodeStart = (
					xml.match(/<ram:SubjectCode>/g) || []
				).length;
				expect(countSubjectCodeStart).toBe(2);
				const countSubjectCodeEnd = (
					xml.match(/<\/ram:SubjectCode>/g) || []
				).length;
				expect(countSubjectCodeEnd).toBe(2);
				expect(xml).toMatchSnapshot();
			});
		});
	});
});
