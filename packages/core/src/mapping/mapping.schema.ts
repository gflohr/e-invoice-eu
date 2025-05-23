// istanbul ignore file
/*
 * This file is generated from 'src/schema/mapping.schema.json'.
 * Do not edit!
 */

import { JSONSchemaType } from 'ajv';

import { Mapping } from './mapping.interface';

/**
 * This schema can be passed as an argument to the compile method of an
 * `Ajv` instance, see https://ajv.js.org/api.html#ajv-compile-schema-object-data-any-boolean-promise-any
 * for more information!
 */
export const mappingSchema: JSONSchemaType<Mapping> = {
	$schema: 'https://json-schema.org/draft/2019-09/schema',
	$id: 'https://www.cantanea.com/schemas/ubl-invoice-schema-v2.1.7',
	type: 'object',
	title: 'Mapping',
	description: 'Maps invoice data to the cells in a spreadsheet.',
	properties: {
		meta: {
			type: 'object',
			additionalProperties: false,
			title: 'Mapping Meta Information',
			description: 'Auxiliary information for the mapping data.',
			properties: {
				sectionColumn: {
					type: 'object',
					additionalProperties: {
						type: 'string',
						pattern: '^[A-Z]+$',
					},
				},
				empty: {
					type: 'array',
					items: {
						type: 'string',
						minLength: 1,
					},
				},
			},
			required: ['sectionColumn'],
		},
		'ubl:Invoice': {
			type: 'object',
			additionalProperties: false,
			properties: {
				'cbc:CustomizationID': {
					$ref: '#/$defs/valueRef',
				},
				'cbc:ProfileID': {
					$ref: '#/$defs/valueRef',
				},
				'cbc:ID': {
					$ref: '#/$defs/valueRef',
				},
				'cbc:IssueDate': {
					$ref: '#/$defs/valueRef',
				},
				'cbc:DueDate': {
					$ref: '#/$defs/valueRef',
				},
				'cbc:InvoiceTypeCode': {
					$ref: '#/$defs/valueRef',
				},
				'cbc:Note': {
					$ref: '#/$defs/valueRef',
				},
				'cbc:TaxPointDate': {
					$ref: '#/$defs/valueRef',
				},
				'cbc:DocumentCurrencyCode': {
					$ref: '#/$defs/valueRef',
				},
				'cbc:TaxCurrencyCode': {
					$ref: '#/$defs/valueRef',
				},
				'cbc:AccountingCost': {
					$ref: '#/$defs/valueRef',
				},
				'cbc:BuyerReference': {
					$ref: '#/$defs/valueRef',
				},
				'cac:InvoicePeriod': {
					type: 'object',
					additionalProperties: false,
					title: 'DELIVERY OR INVOICE PERIOD',
					description:
						'A group of business terms providing information on the invoice period. Also called delivery period. If the group is used, the invoiceing period start date and/or end date must be used.\nBusiness terms: BG-14',
					properties: {
						'cbc:StartDate': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:EndDate': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:DescriptionCode': {
							$ref: '#/$defs/valueRef',
						},
					},
				},
				'cac:OrderReference': {
					type: 'object',
					additionalProperties: false,
					title: 'ORDER AND SALES ORDER REFERENCE',
					properties: {
						'cbc:ID': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:SalesOrderID': {
							$ref: '#/$defs/valueRef',
						},
					},
				},
				'cac:BillingReference': {
					type: 'object',
					additionalProperties: false,
					properties: {
						section: {
							$ref: '#/$defs/sectionRef',
						},
						'cac:InvoiceDocumentReference': {
							type: 'object',
							additionalProperties: false,
							title: 'INVOICE DOCUMENT REFERENCE',
							properties: {
								'cbc:ID': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:IssueDate': {
									$ref: '#/$defs/valueRef',
								},
							},
							required: ['cbc:ID'],
						},
					},
					required: ['cac:InvoiceDocumentReference'],
				},
				'cac:DespatchDocumentReference': {
					type: 'object',
					additionalProperties: false,
					title: 'DESPATCH ADVICE REFERENCE',
					properties: {
						'cbc:ID': {
							$ref: '#/$defs/valueRef',
						},
					},
					required: ['cbc:ID'],
				},
				'cac:ReceiptDocumentReference': {
					type: 'object',
					additionalProperties: false,
					title: 'RECEIPT ADVICE REFERENCE',
					properties: {
						'cbc:ID': {
							$ref: '#/$defs/valueRef',
						},
					},
					required: ['cbc:ID'],
				},
				'cac:OriginatorDocumentReference': {
					type: 'object',
					additionalProperties: false,
					title: 'TENDER OR LOT REFERENCE',
					properties: {
						'cbc:ID': {
							$ref: '#/$defs/valueRef',
						},
					},
					required: ['cbc:ID'],
				},
				'cac:ContractDocumentReference': {
					type: 'object',
					additionalProperties: false,
					title: 'CONTRACT REFERENCE',
					properties: {
						'cbc:ID': {
							$ref: '#/$defs/valueRef',
						},
					},
					required: ['cbc:ID'],
				},
				'cac:AdditionalDocumentReference': {
					type: 'object',
					additionalProperties: false,
					properties: {
						section: {
							$ref: '#/$defs/sectionRef',
						},
						'cbc:ID': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:ID@schemeID': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:DocumentTypeCode': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:DocumentDescription': {
							$ref: '#/$defs/valueRef',
						},
						'cac:Attachment': {
							type: 'object',
							additionalProperties: false,
							title: 'ATTACHMENT',
							properties: {
								'cbc:EmbeddedDocumentBinaryObject': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:EmbeddedDocumentBinaryObject@mimeCode': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:EmbeddedDocumentBinaryObject@filename': {
									$ref: '#/$defs/valueRef',
								},
								'cac:ExternalReference': {
									type: 'object',
									additionalProperties: false,
									title: 'EXTERNAL REFERENCE',
									properties: {
										'cbc:URI': {
											$ref: '#/$defs/valueRef',
										},
									},
									required: ['cbc:URI'],
								},
							},
							required: [],
							dependentRequired: {
								'cbc:EmbeddedDocumentBinaryObject': [
									'cbc:EmbeddedDocumentBinaryObject@mimeCode',
									'cbc:EmbeddedDocumentBinaryObject@filename',
								],
								'cbc:EmbeddedDocumentBinaryObject@mimeCode': [
									'cbc:EmbeddedDocumentBinaryObject',
								],
								'cbc:EmbeddedDocumentBinaryObject@filename': [
									'cbc:EmbeddedDocumentBinaryObject',
								],
							},
						},
					},
					required: ['cbc:ID'],
					dependentRequired: {
						'cbc:ID@schemeID': ['cbc:ID'],
					},
				},
				'cac:ProjectReference': {
					type: 'object',
					additionalProperties: false,
					title: 'PROJECT REFERENCE',
					properties: {
						'cbc:ID': {
							$ref: '#/$defs/valueRef',
						},
					},
					required: ['cbc:ID'],
				},
				'cac:AccountingSupplierParty': {
					type: 'object',
					additionalProperties: false,
					title: 'SELLER',
					description:
						'A group of business terms providing information about the Seller.\nBusiness terms: BG-4',
					properties: {
						'cac:Party': {
							type: 'object',
							additionalProperties: false,
							title: 'PARTY',
							properties: {
								'cbc:EndpointID': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:EndpointID@schemeID': {
									$ref: '#/$defs/valueRef',
								},
								'cac:PartyIdentification': {
									type: 'object',
									additionalProperties: false,
									properties: {
										section: {
											$ref: '#/$defs/sectionRef',
										},
										'cbc:ID': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:ID@schemeID': {
											$ref: '#/$defs/valueRef',
										},
									},
									required: ['cbc:ID'],
									dependentRequired: {
										'cbc:ID@schemeID': ['cbc:ID'],
									},
								},
								'cac:PartyName': {
									type: 'object',
									additionalProperties: false,
									title: 'PARTY NAME',
									properties: {
										'cbc:Name': {
											$ref: '#/$defs/valueRef',
										},
									},
									required: ['cbc:Name'],
								},
								'cac:PostalAddress': {
									type: 'object',
									additionalProperties: false,
									title: 'SELLER POSTAL ADDRESS',
									description:
										'A group of business terms providing information about the address of the Seller. Sufficient components of the address are to be filled to comply with legal requirements.\nBusiness terms: BG-5',
									properties: {
										'cbc:StreetName': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:AdditionalStreetName': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:CityName': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:PostalZone': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:CountrySubentity': {
											$ref: '#/$defs/valueRef',
										},
										'cac:AddressLine': {
											type: 'object',
											additionalProperties: false,
											title: 'ADDRESS LINE',
											properties: {
												'cbc:Line': {
													$ref: '#/$defs/valueRef',
												},
											},
											required: ['cbc:Line'],
										},
										'cac:Country': {
											type: 'object',
											additionalProperties: false,
											title: 'COUNTRY',
											properties: {
												'cbc:IdentificationCode': {
													$ref: '#/$defs/valueRef',
												},
											},
											required: ['cbc:IdentificationCode'],
										},
									},
									required: ['cac:Country'],
								},
								'cac:PartyTaxScheme': {
									type: 'object',
									additionalProperties: false,
									properties: {
										section: {
											$ref: '#/$defs/sectionRef',
										},
										'cbc:CompanyID': {
											$ref: '#/$defs/valueRef',
										},
										'cac:TaxScheme': {
											type: 'object',
											additionalProperties: false,
											title: 'TAX SCHEME',
											properties: {
												'cbc:ID': {
													$ref: '#/$defs/valueRef',
												},
											},
											required: ['cbc:ID'],
										},
									},
									required: ['cbc:CompanyID', 'cac:TaxScheme'],
								},
								'cac:PartyLegalEntity': {
									type: 'object',
									additionalProperties: false,
									title: 'PARTY LEGAL ENTITY',
									properties: {
										'cbc:RegistrationName': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:CompanyID': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:CompanyID@schemeID': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:CompanyLegalForm': {
											$ref: '#/$defs/valueRef',
										},
									},
									required: ['cbc:RegistrationName'],
									dependentRequired: {
										'cbc:CompanyID@schemeID': ['cbc:CompanyID'],
									},
								},
								'cac:Contact': {
									type: 'object',
									additionalProperties: false,
									title: 'SELLER CONTACT',
									description:
										'A group of business terms providing contact information about the Seller.\nBusiness terms: BG-6',
									properties: {
										'cbc:Name': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:Telephone': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:ElectronicMail': {
											$ref: '#/$defs/valueRef',
										},
									},
								},
							},
							required: [
								'cbc:EndpointID',
								'cac:PostalAddress',
								'cac:PartyLegalEntity',
							],
							dependentRequired: {
								'cbc:EndpointID': ['cbc:EndpointID@schemeID'],
								'cbc:EndpointID@schemeID': ['cbc:EndpointID'],
							},
						},
					},
					required: ['cac:Party'],
				},
				'cac:AccountingCustomerParty': {
					type: 'object',
					additionalProperties: false,
					title: 'BUYER',
					description:
						'A group of business terms providing information about the Buyer.\nBusiness terms: BG-7',
					properties: {
						'cac:Party': {
							type: 'object',
							additionalProperties: false,
							title: 'PARTY',
							properties: {
								'cbc:EndpointID': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:EndpointID@schemeID': {
									$ref: '#/$defs/valueRef',
								},
								'cac:PartyIdentification': {
									type: 'object',
									additionalProperties: false,
									title: 'PARTY IDENTIFICATION',
									properties: {
										'cbc:ID': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:ID@schemeID': {
											$ref: '#/$defs/valueRef',
										},
									},
									required: ['cbc:ID'],
									dependentRequired: {
										'cbc:ID@schemeID': ['cbc:ID'],
									},
								},
								'cac:PartyName': {
									type: 'object',
									additionalProperties: false,
									title: 'PARTY NAME',
									properties: {
										'cbc:Name': {
											$ref: '#/$defs/valueRef',
										},
									},
									required: ['cbc:Name'],
								},
								'cac:PostalAddress': {
									type: 'object',
									additionalProperties: false,
									title: 'BUYER POSTAL ADDRESS',
									description:
										'A group of business terms providing information about the postal address for the Buyer. Sufficient components of the address are to be filled to comply with legal requirements.\nBusiness terms: BG-8',
									properties: {
										'cbc:StreetName': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:AdditionalStreetName': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:CityName': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:PostalZone': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:CountrySubentity': {
											$ref: '#/$defs/valueRef',
										},
										'cac:AddressLine': {
											type: 'object',
											additionalProperties: false,
											title: 'ADDRESS LINE',
											properties: {
												'cbc:Line': {
													$ref: '#/$defs/valueRef',
												},
											},
											required: ['cbc:Line'],
										},
										'cac:Country': {
											type: 'object',
											additionalProperties: false,
											title: 'COUNTRY',
											properties: {
												'cbc:IdentificationCode': {
													$ref: '#/$defs/valueRef',
												},
											},
											required: ['cbc:IdentificationCode'],
										},
									},
									required: ['cac:Country'],
								},
								'cac:PartyTaxScheme': {
									type: 'object',
									additionalProperties: false,
									title: 'PARTY VAT IDENTIFIER',
									properties: {
										'cbc:CompanyID': {
											$ref: '#/$defs/valueRef',
										},
										'cac:TaxScheme': {
											type: 'object',
											additionalProperties: false,
											title: 'TAX SCHEME',
											properties: {
												'cbc:ID': {
													$ref: '#/$defs/valueRef',
												},
											},
											required: ['cbc:ID'],
										},
									},
									required: ['cbc:CompanyID', 'cac:TaxScheme'],
								},
								'cac:PartyLegalEntity': {
									type: 'object',
									additionalProperties: false,
									title: 'PARTY LEGAL ENTITY',
									properties: {
										'cbc:RegistrationName': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:CompanyID': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:CompanyID@schemeID': {
											$ref: '#/$defs/valueRef',
										},
									},
									required: ['cbc:RegistrationName'],
									dependentRequired: {
										'cbc:CompanyID@schemeID': ['cbc:CompanyID'],
									},
								},
								'cac:Contact': {
									type: 'object',
									additionalProperties: false,
									title: 'BUYER CONTACT',
									description:
										'A group of business terms providing contact information relevant for the Buyer.\nBusiness terms: BG-9',
									properties: {
										'cbc:Name': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:Telephone': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:ElectronicMail': {
											$ref: '#/$defs/valueRef',
										},
									},
								},
							},
							required: [
								'cbc:EndpointID',
								'cac:PostalAddress',
								'cac:PartyLegalEntity',
							],
							dependentRequired: {
								'cbc:EndpointID': ['cbc:EndpointID@schemeID'],
								'cbc:EndpointID@schemeID': ['cbc:EndpointID'],
							},
						},
					},
					required: ['cac:Party'],
				},
				'cac:PayeeParty': {
					type: 'object',
					additionalProperties: false,
					title: 'PAYEE',
					description:
						'A group of business terms providing information about the Payee, i.e. the role that receives the payment. Shall be used when the Payee is different from the Seller.\nBusiness terms: BG-10',
					properties: {
						'cac:PartyIdentification': {
							type: 'object',
							additionalProperties: false,
							title: 'PARTY IDENTIFICATION',
							properties: {
								'cbc:ID': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:ID@schemeID': {
									$ref: '#/$defs/valueRef',
								},
							},
							required: ['cbc:ID'],
							dependentRequired: {
								'cbc:ID@schemeID': ['cbc:ID'],
							},
						},
						'cac:PartyName': {
							type: 'object',
							additionalProperties: false,
							title: 'PARTY NAME',
							properties: {
								'cbc:Name': {
									$ref: '#/$defs/valueRef',
								},
							},
							required: ['cbc:Name'],
						},
						'cac:PartyLegalEntity': {
							type: 'object',
							additionalProperties: false,
							title: 'PARTY LEGAL ENTITY',
							properties: {
								'cbc:CompanyID': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:CompanyID@schemeID': {
									$ref: '#/$defs/valueRef',
								},
							},
							required: ['cbc:CompanyID'],
							dependentRequired: {
								'cbc:CompanyID@schemeID': ['cbc:CompanyID'],
							},
						},
					},
					required: ['cac:PartyName'],
				},
				'cac:TaxRepresentativeParty': {
					type: 'object',
					additionalProperties: false,
					title: 'SELLER TAX REPRESENTATIVE PARTY',
					description:
						"A group of business terms providing information about the Seller's tax representative.\nBusiness terms: BG-11",
					properties: {
						'cac:PartyName': {
							type: 'object',
							additionalProperties: false,
							title: 'PARTY NAME',
							properties: {
								'cbc:Name': {
									$ref: '#/$defs/valueRef',
								},
							},
							required: ['cbc:Name'],
						},
						'cac:PostalAddress': {
							type: 'object',
							additionalProperties: false,
							title: 'SELLER TAX REPRESENTATIVE POSTAL ADDRESS',
							description:
								'A group of business terms providing information about the postal address for the tax representative party. Sufficient components of the address are to be filled to comply with legal requirements.\nBusiness terms: BG-12',
							properties: {
								'cbc:StreetName': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:AdditionalStreetName': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:CityName': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:PostalZone': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:CountrySubentity': {
									$ref: '#/$defs/valueRef',
								},
								'cac:AddressLine': {
									type: 'object',
									additionalProperties: false,
									title: 'ADDRESS LINE',
									properties: {
										'cbc:Line': {
											$ref: '#/$defs/valueRef',
										},
									},
									required: ['cbc:Line'],
								},
								'cac:Country': {
									type: 'object',
									additionalProperties: false,
									title: 'COUNTRY',
									properties: {
										'cbc:IdentificationCode': {
											$ref: '#/$defs/valueRef',
										},
									},
									required: ['cbc:IdentificationCode'],
								},
							},
							required: ['cac:Country'],
						},
						'cac:PartyTaxScheme': {
							type: 'object',
							additionalProperties: false,
							title: 'PARTY VAT IDENTIFIER',
							properties: {
								'cbc:CompanyID': {
									$ref: '#/$defs/valueRef',
								},
								'cac:TaxScheme': {
									type: 'object',
									additionalProperties: false,
									title: 'TAX SCHEME',
									properties: {
										'cbc:ID': {
											$ref: '#/$defs/valueRef',
										},
									},
									required: ['cbc:ID'],
								},
							},
							required: ['cbc:CompanyID', 'cac:TaxScheme'],
						},
					},
					required: [
						'cac:PartyName',
						'cac:PostalAddress',
						'cac:PartyTaxScheme',
					],
				},
				'cac:Delivery': {
					type: 'object',
					additionalProperties: false,
					title: 'DELIVERY INFORMATION',
					description:
						'A group of business terms providing information about where and when the goods and services invoiced are delivered.\nBusiness terms: BG-13',
					properties: {
						'cbc:ActualDeliveryDate': {
							$ref: '#/$defs/valueRef',
						},
						'cac:DeliveryLocation': {
							type: 'object',
							additionalProperties: false,
							properties: {
								'cbc:ID': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:ID@schemeID': {
									$ref: '#/$defs/valueRef',
								},
								'cac:Address': {
									type: 'object',
									additionalProperties: false,
									title: 'DELIVER TO ADDRESS',
									description:
										'A group of business terms providing information about the address to which goods and services invoiced were or are delivered.\nBusiness terms: BG-15',
									properties: {
										'cbc:StreetName': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:AdditionalStreetName': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:CityName': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:PostalZone': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:CountrySubentity': {
											$ref: '#/$defs/valueRef',
										},
										'cac:AddressLine': {
											type: 'object',
											additionalProperties: false,
											title: 'ADDRESS LINE',
											properties: {
												'cbc:Line': {
													$ref: '#/$defs/valueRef',
												},
											},
											required: ['cbc:Line'],
										},
										'cac:Country': {
											type: 'object',
											additionalProperties: false,
											title: 'COUNTRY',
											properties: {
												'cbc:IdentificationCode': {
													$ref: '#/$defs/valueRef',
												},
											},
											required: ['cbc:IdentificationCode'],
										},
									},
									required: ['cac:Country'],
								},
							},
							dependentRequired: {
								'cbc:ID@schemeID': ['cbc:ID'],
							},
						},
						'cac:DeliveryParty': {
							type: 'object',
							additionalProperties: false,
							title: 'DELIVER PARTY',
							properties: {
								'cac:PartyName': {
									type: 'object',
									additionalProperties: false,
									title: 'PARTY NAME',
									properties: {
										'cbc:Name': {
											$ref: '#/$defs/valueRef',
										},
									},
									required: ['cbc:Name'],
								},
							},
							required: ['cac:PartyName'],
						},
					},
				},
				'cac:PaymentMeans': {
					type: 'object',
					additionalProperties: false,
					properties: {
						section: {
							$ref: '#/$defs/sectionRef',
						},
						'cbc:PaymentMeansCode': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:PaymentMeansCode@name': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:PaymentID': {
							$ref: '#/$defs/valueRef',
						},
						'cac:CardAccount': {
							type: 'object',
							additionalProperties: false,
							title: 'PAYMENT CARD INFORMATION',
							description:
								'A group of business terms providing information about card used for payment contemporaneous with invoice issuance.\nBusiness terms: BG-18',
							properties: {
								'cbc:PrimaryAccountNumberID': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:NetworkID': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:HolderName': {
									$ref: '#/$defs/valueRef',
								},
							},
							required: ['cbc:PrimaryAccountNumberID', 'cbc:NetworkID'],
						},
						'cac:PayeeFinancialAccount': {
							type: 'object',
							additionalProperties: false,
							title: 'CREDIT TRANSFER',
							description:
								'A group of business terms to specify credit transfer payments.\nBusiness terms: BG-17',
							properties: {
								'cbc:ID': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:Name': {
									$ref: '#/$defs/valueRef',
								},
								'cac:FinancialInstitutionBranch': {
									type: 'object',
									additionalProperties: false,
									title: 'FINANCIAL INSTITUTION BRANCH',
									properties: {
										'cbc:ID': {
											$ref: '#/$defs/valueRef',
										},
									},
									required: ['cbc:ID'],
								},
							},
							required: ['cbc:ID'],
						},
						'cac:PaymentMandate': {
							type: 'object',
							additionalProperties: false,
							title: 'DIRECT DEBIT',
							description:
								'A group of business terms to specify a direct debit.\nBusiness terms: BG-19',
							properties: {
								'cbc:ID': {
									$ref: '#/$defs/valueRef',
								},
								'cac:PayerFinancialAccount': {
									type: 'object',
									additionalProperties: false,
									title: 'PAYER FINANCIAL ACCOUNT',
									properties: {
										'cbc:ID': {
											$ref: '#/$defs/valueRef',
										},
									},
									required: ['cbc:ID'],
								},
							},
						},
					},
					required: ['cbc:PaymentMeansCode'],
					dependentRequired: {
						'cbc:PaymentMeansCode@name': ['cbc:PaymentMeansCode'],
					},
				},
				'cac:PaymentTerms': {
					type: 'object',
					additionalProperties: false,
					title: 'PAYMENT TERMS',
					properties: {
						'cbc:Note': {
							$ref: '#/$defs/valueRef',
						},
					},
					required: ['cbc:Note'],
				},
				'cac:AllowanceCharge': {
					type: 'object',
					additionalProperties: false,
					properties: {
						section: {
							$ref: '#/$defs/sectionRef',
						},
						'cbc:ChargeIndicator': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:AllowanceChargeReasonCode': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:AllowanceChargeReason': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:MultiplierFactorNumeric': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:Amount': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:Amount@currencyID': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:BaseAmount': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:BaseAmount@currencyID': {
							$ref: '#/$defs/valueRef',
						},
						'cac:TaxCategory': {
							type: 'object',
							additionalProperties: false,
							title: 'TAX CATEGORY',
							properties: {
								'cbc:ID': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:Percent': {
									$ref: '#/$defs/valueRef',
								},
								'cac:TaxScheme': {
									type: 'object',
									additionalProperties: false,
									title: 'TAX SCHEME',
									properties: {
										'cbc:ID': {
											$ref: '#/$defs/valueRef',
										},
									},
									required: ['cbc:ID'],
								},
							},
							required: ['cbc:ID', 'cac:TaxScheme'],
						},
					},
					required: ['cbc:ChargeIndicator', 'cbc:Amount', 'cac:TaxCategory'],
					dependentRequired: {
						'cbc:Amount': ['cbc:Amount@currencyID'],
						'cbc:BaseAmount': ['cbc:BaseAmount@currencyID'],
						'cbc:Amount@currencyID': ['cbc:Amount'],
						'cbc:BaseAmount@currencyID': ['cbc:BaseAmount'],
					},
				},
				'cac:TaxTotal': {
					type: 'object',
					additionalProperties: false,
					properties: {
						section: {
							$ref: '#/$defs/sectionRef',
						},
						'cbc:TaxAmount': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:TaxAmount@currencyID': {
							$ref: '#/$defs/valueRef',
						},
						'cac:TaxSubtotal': {
							type: 'object',
							additionalProperties: false,
							properties: {
								section: {
									$ref: '#/$defs/sectionRef',
								},
								'cbc:TaxableAmount': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:TaxableAmount@currencyID': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:TaxAmount': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:TaxAmount@currencyID': {
									$ref: '#/$defs/valueRef',
								},
								'cac:TaxCategory': {
									type: 'object',
									additionalProperties: false,
									title: 'VAT CATEGORY',
									properties: {
										'cbc:ID': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:Percent': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:TaxExemptionReasonCode': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:TaxExemptionReason': {
											$ref: '#/$defs/valueRef',
										},
										'cac:TaxScheme': {
											type: 'object',
											additionalProperties: false,
											title: 'TAX SCHEME',
											properties: {
												'cbc:ID': {
													$ref: '#/$defs/valueRef',
												},
											},
											required: ['cbc:ID'],
										},
									},
									required: ['cbc:ID', 'cac:TaxScheme'],
								},
							},
							required: [
								'cbc:TaxableAmount',
								'cbc:TaxAmount',
								'cac:TaxCategory',
							],
							dependentRequired: {
								'cbc:TaxableAmount': ['cbc:TaxableAmount@currencyID'],
								'cbc:TaxAmount': ['cbc:TaxAmount@currencyID'],
								'cbc:TaxableAmount@currencyID': ['cbc:TaxableAmount'],
								'cbc:TaxAmount@currencyID': ['cbc:TaxAmount'],
							},
						},
					},
					required: ['cbc:TaxAmount'],
					dependentRequired: {
						'cbc:TaxAmount': ['cbc:TaxAmount@currencyID'],
						'cbc:TaxAmount@currencyID': ['cbc:TaxAmount'],
					},
				},
				'cac:LegalMonetaryTotal': {
					type: 'object',
					additionalProperties: false,
					title: 'DOCUMENT TOTALS',
					description:
						'A group of business terms providing the monetary totals for the Invoice.\nBusiness terms: BG-22',
					properties: {
						'cbc:LineExtensionAmount': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:LineExtensionAmount@currencyID': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:TaxExclusiveAmount': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:TaxExclusiveAmount@currencyID': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:TaxInclusiveAmount': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:TaxInclusiveAmount@currencyID': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:AllowanceTotalAmount': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:AllowanceTotalAmount@currencyID': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:ChargeTotalAmount': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:ChargeTotalAmount@currencyID': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:PrepaidAmount': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:PrepaidAmount@currencyID': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:PayableRoundingAmount': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:PayableRoundingAmount@currencyID': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:PayableAmount': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:PayableAmount@currencyID': {
							$ref: '#/$defs/valueRef',
						},
					},
					required: [
						'cbc:LineExtensionAmount',
						'cbc:TaxExclusiveAmount',
						'cbc:TaxInclusiveAmount',
						'cbc:PayableAmount',
					],
					dependentRequired: {
						'cbc:LineExtensionAmount': ['cbc:LineExtensionAmount@currencyID'],
						'cbc:TaxExclusiveAmount': ['cbc:TaxExclusiveAmount@currencyID'],
						'cbc:TaxInclusiveAmount': ['cbc:TaxInclusiveAmount@currencyID'],
						'cbc:AllowanceTotalAmount': ['cbc:AllowanceTotalAmount@currencyID'],
						'cbc:ChargeTotalAmount': ['cbc:ChargeTotalAmount@currencyID'],
						'cbc:PrepaidAmount': ['cbc:PrepaidAmount@currencyID'],
						'cbc:PayableRoundingAmount': [
							'cbc:PayableRoundingAmount@currencyID',
						],
						'cbc:PayableAmount': ['cbc:PayableAmount@currencyID'],
						'cbc:LineExtensionAmount@currencyID': ['cbc:LineExtensionAmount'],
						'cbc:TaxExclusiveAmount@currencyID': ['cbc:TaxExclusiveAmount'],
						'cbc:TaxInclusiveAmount@currencyID': ['cbc:TaxInclusiveAmount'],
						'cbc:AllowanceTotalAmount@currencyID': ['cbc:AllowanceTotalAmount'],
						'cbc:ChargeTotalAmount@currencyID': ['cbc:ChargeTotalAmount'],
						'cbc:PrepaidAmount@currencyID': ['cbc:PrepaidAmount'],
						'cbc:PayableRoundingAmount@currencyID': [
							'cbc:PayableRoundingAmount',
						],
						'cbc:PayableAmount@currencyID': ['cbc:PayableAmount'],
					},
				},
				'cac:InvoiceLine': {
					type: 'object',
					additionalProperties: false,
					properties: {
						section: {
							$ref: '#/$defs/sectionRef',
						},
						'cbc:ID': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:Note': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:InvoicedQuantity': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:InvoicedQuantity@unitCode': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:LineExtensionAmount': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:LineExtensionAmount@currencyID': {
							$ref: '#/$defs/valueRef',
						},
						'cbc:AccountingCost': {
							$ref: '#/$defs/valueRef',
						},
						'cac:InvoicePeriod': {
							type: 'object',
							additionalProperties: false,
							title: 'INVOICE LINE PERIOD',
							description:
								'A group of business terms providing information about the period relevant for the Invoice line.\nBusiness terms: BG-26',
							properties: {
								'cbc:StartDate': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:EndDate': {
									$ref: '#/$defs/valueRef',
								},
							},
						},
						'cac:OrderLineReference': {
							type: 'object',
							additionalProperties: false,
							title: 'ORDER LINE REFERENCE',
							properties: {
								'cbc:LineID': {
									$ref: '#/$defs/valueRef',
								},
							},
							required: ['cbc:LineID'],
						},
						'cac:DocumentReference': {
							type: 'object',
							additionalProperties: false,
							title: 'LINE OBJECT IDENTIFIER',
							properties: {
								'cbc:ID': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:ID@schemeID': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:DocumentTypeCode': {
									$ref: '#/$defs/valueRef',
								},
							},
							required: ['cbc:ID', 'cbc:DocumentTypeCode'],
							dependentRequired: {
								'cbc:ID@schemeID': ['cbc:ID'],
							},
						},
						'cac:AllowanceCharge': {
							type: 'object',
							additionalProperties: false,
							properties: {
								section: {
									$ref: '#/$defs/sectionRef',
								},
								'cbc:ChargeIndicator': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:AllowanceChargeReasonCode': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:AllowanceChargeReason': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:MultiplierFactorNumeric': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:Amount': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:Amount@currencyID': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:BaseAmount': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:BaseAmount@currencyID': {
									$ref: '#/$defs/valueRef',
								},
							},
							required: ['cbc:ChargeIndicator', 'cbc:Amount'],
							dependentRequired: {
								'cbc:Amount': ['cbc:Amount@currencyID'],
								'cbc:BaseAmount': ['cbc:BaseAmount@currencyID'],
								'cbc:Amount@currencyID': ['cbc:Amount'],
								'cbc:BaseAmount@currencyID': ['cbc:BaseAmount'],
							},
						},
						'cac:Item': {
							type: 'object',
							additionalProperties: false,
							title: 'ITEM INFORMATION',
							description:
								'A group of business terms providing information about the goods and services invoiced.\nBusiness terms: BG-31',
							properties: {
								'cbc:Description': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:Name': {
									$ref: '#/$defs/valueRef',
								},
								'cac:BuyersItemIdentification': {
									type: 'object',
									additionalProperties: false,
									title: 'BUYERS ITEM IDENTIFICATION',
									properties: {
										'cbc:ID': {
											$ref: '#/$defs/valueRef',
										},
									},
									required: ['cbc:ID'],
								},
								'cac:SellersItemIdentification': {
									type: 'object',
									additionalProperties: false,
									title: 'SELLERS ITEM IDENTIFICATION',
									properties: {
										'cbc:ID': {
											$ref: '#/$defs/valueRef',
										},
									},
									required: ['cbc:ID'],
								},
								'cac:StandardItemIdentification': {
									type: 'object',
									additionalProperties: false,
									title: 'STANDARD ITEM IDENTIFICATION',
									properties: {
										'cbc:ID': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:ID@schemeID': {
											$ref: '#/$defs/valueRef',
										},
									},
									required: ['cbc:ID'],
									dependentRequired: {
										'cbc:ID': ['cbc:ID@schemeID'],
										'cbc:ID@schemeID': ['cbc:ID'],
									},
								},
								'cac:OriginCountry': {
									type: 'object',
									additionalProperties: false,
									title: 'ORIGIN COUNTRY',
									properties: {
										'cbc:IdentificationCode': {
											$ref: '#/$defs/valueRef',
										},
									},
									required: ['cbc:IdentificationCode'],
								},
								'cac:CommodityClassification': {
									type: 'object',
									additionalProperties: false,
									properties: {
										section: {
											$ref: '#/$defs/sectionRef',
										},
										'cbc:ItemClassificationCode': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:ItemClassificationCode@listID': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:ItemClassificationCode@listVersionID': {
											$ref: '#/$defs/valueRef',
										},
									},
									required: ['cbc:ItemClassificationCode'],
									dependentRequired: {
										'cbc:ItemClassificationCode': [
											'cbc:ItemClassificationCode@listID',
										],
										'cbc:ItemClassificationCode@listID': [
											'cbc:ItemClassificationCode',
										],
										'cbc:ItemClassificationCode@listVersionID': [
											'cbc:ItemClassificationCode',
										],
									},
								},
								'cac:ClassifiedTaxCategory': {
									type: 'object',
									additionalProperties: false,
									title: 'LINE VAT INFORMATION',
									description:
										'A group of business terms providing information about the VAT applicable for the goods and services invoiced on the Invoice line.\nBusiness terms: BG-30',
									properties: {
										'cbc:ID': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:Percent': {
											$ref: '#/$defs/valueRef',
										},
										'cac:TaxScheme': {
											type: 'object',
											additionalProperties: false,
											title: 'TAX SCHEME',
											properties: {
												'cbc:ID': {
													$ref: '#/$defs/valueRef',
												},
											},
											required: ['cbc:ID'],
										},
									},
									required: ['cbc:ID', 'cac:TaxScheme'],
								},
								'cac:AdditionalItemProperty': {
									type: 'object',
									additionalProperties: false,
									properties: {
										section: {
											$ref: '#/$defs/sectionRef',
										},
										'cbc:Name': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:Value': {
											$ref: '#/$defs/valueRef',
										},
									},
									required: ['cbc:Name', 'cbc:Value'],
								},
							},
							required: ['cbc:Name', 'cac:ClassifiedTaxCategory'],
						},
						'cac:Price': {
							type: 'object',
							additionalProperties: false,
							title: 'PRICE DETAILS',
							description:
								'A group of business terms providing information about the price applied for the goods and services invoiced on the Invoice line.\nBusiness terms: BG-29',
							properties: {
								'cbc:PriceAmount': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:PriceAmount@currencyID': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:BaseQuantity': {
									$ref: '#/$defs/valueRef',
								},
								'cbc:BaseQuantity@unitCode': {
									$ref: '#/$defs/valueRef',
								},
								'cac:AllowanceCharge': {
									type: 'object',
									additionalProperties: false,
									title: 'ALLOWANCE',
									properties: {
										'cbc:ChargeIndicator': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:Amount': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:Amount@currencyID': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:BaseAmount': {
											$ref: '#/$defs/valueRef',
										},
										'cbc:BaseAmount@currencyID': {
											$ref: '#/$defs/valueRef',
										},
									},
									required: ['cbc:ChargeIndicator', 'cbc:Amount'],
									dependentRequired: {
										'cbc:Amount': ['cbc:Amount@currencyID'],
										'cbc:BaseAmount': ['cbc:BaseAmount@currencyID'],
										'cbc:Amount@currencyID': ['cbc:Amount'],
										'cbc:BaseAmount@currencyID': ['cbc:BaseAmount'],
									},
								},
							},
							required: ['cbc:PriceAmount'],
							dependentRequired: {
								'cbc:PriceAmount': ['cbc:PriceAmount@currencyID'],
								'cbc:PriceAmount@currencyID': ['cbc:PriceAmount'],
								'cbc:BaseQuantity@unitCode': ['cbc:BaseQuantity'],
							},
						},
					},
					required: [
						'cbc:ID',
						'cbc:InvoicedQuantity',
						'cbc:LineExtensionAmount',
						'cac:Item',
						'cac:Price',
					],
					dependentRequired: {
						'cbc:InvoicedQuantity': ['cbc:InvoicedQuantity@unitCode'],
						'cbc:LineExtensionAmount': ['cbc:LineExtensionAmount@currencyID'],
						'cbc:InvoicedQuantity@unitCode': ['cbc:InvoicedQuantity'],
						'cbc:LineExtensionAmount@currencyID': ['cbc:LineExtensionAmount'],
					},
				},
			},
			required: [
				'cbc:ID',
				'cbc:IssueDate',
				'cbc:InvoiceTypeCode',
				'cbc:DocumentCurrencyCode',
				'cac:AccountingSupplierParty',
				'cac:AccountingCustomerParty',
				'cac:TaxTotal',
				'cac:LegalMonetaryTotal',
				'cac:InvoiceLine',
			],
		},
	},
	required: ['meta', 'ubl:Invoice'],
	$defs: {
		valueRef: {
			type: 'string',
			pattern:
				"^=(?:([^:.]+|'[^']+')?(?::([^.:]+)?)?\\.)?([A-Z]+[1-9][0-9]*)|('[^']+'|[^=].*)$",
		},
		sectionRef: {
			type: 'string',
			pattern: "(?:([^:.]+|'[^']+')?(?::([^.:]+)?))",
		},
	},
} as unknown as JSONSchemaType<Mapping>;
