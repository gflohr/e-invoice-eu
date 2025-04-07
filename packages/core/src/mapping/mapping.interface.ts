/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type ValueRef = string;
export type SectionRef = string;

/**
 * Maps invoice data to the cells in a spreadsheet.
 */

/**
 * This is a TypeScript interface for the JSON Schema definition
 * (https://json-schema.org/) for the corresponding data type.
 */
export interface Mapping {
	meta: MappingMetaInformation;
	'ubl:Invoice': {
		'cbc:CustomizationID'?: ValueRef;
		'cbc:ProfileID'?: ValueRef;
		'cbc:ID': ValueRef;
		'cbc:IssueDate': ValueRef;
		'cbc:DueDate'?: ValueRef;
		'cbc:InvoiceTypeCode': ValueRef;
		'cbc:Note'?: ValueRef;
		'cbc:TaxPointDate'?: ValueRef;
		'cbc:DocumentCurrencyCode': ValueRef;
		'cbc:TaxCurrencyCode'?: ValueRef;
		'cbc:AccountingCost'?: ValueRef;
		'cbc:BuyerReference'?: ValueRef;
		'cac:InvoicePeriod'?: DELIVERYORINVOICEPERIOD;
		'cac:OrderReference'?: ORDERANDSALESORDERREFERENCE;
		'cac:BillingReference'?: {
			section?: SectionRef;
			'cac:InvoiceDocumentReference': INVOICEDOCUMENTREFERENCE;
		};
		'cac:DespatchDocumentReference'?: DESPATCHADVICEREFERENCE;
		'cac:ReceiptDocumentReference'?: RECEIPTADVICEREFERENCE;
		'cac:OriginatorDocumentReference'?: TENDERORLOTREFERENCE;
		'cac:ContractDocumentReference'?: CONTRACTREFERENCE;
		'cac:AdditionalDocumentReference'?: {
			section?: SectionRef;
			'cbc:ID': ValueRef;
			'cbc:ID@schemeID'?: ValueRef;
			'cbc:DocumentTypeCode'?: ValueRef;
			'cbc:DocumentDescription'?: ValueRef;
			'cac:Attachment'?: ATTACHMENT;
		};
		'cac:ProjectReference'?: PROJECTREFERENCE;
		'cac:AccountingSupplierParty': SELLER;
		'cac:AccountingCustomerParty': BUYER;
		'cac:PayeeParty'?: PAYEE;
		'cac:TaxRepresentativeParty'?: SELLERTAXREPRESENTATIVEPARTY;
		'cac:Delivery'?: DELIVERYINFORMATION;
		'cac:PaymentMeans'?: {
			section?: SectionRef;
			'cbc:PaymentMeansCode': ValueRef;
			'cbc:PaymentMeansCode@name'?: ValueRef;
			'cbc:PaymentID'?: ValueRef;
			'cac:CardAccount'?: PAYMENTCARDINFORMATION;
			'cac:PayeeFinancialAccount'?: CREDITTRANSFER;
			'cac:PaymentMandate'?: DIRECTDEBIT;
		};
		'cac:PaymentTerms'?: PAYMENTTERMS;
		'cac:AllowanceCharge'?: {
			section?: SectionRef;
			'cbc:ChargeIndicator': ValueRef;
			'cbc:AllowanceChargeReasonCode'?: ValueRef;
			'cbc:AllowanceChargeReason'?: ValueRef;
			'cbc:MultiplierFactorNumeric'?: ValueRef;
			'cbc:Amount': ValueRef;
			'cbc:Amount@currencyID'?: ValueRef;
			'cbc:BaseAmount'?: ValueRef;
			'cbc:BaseAmount@currencyID'?: ValueRef;
			'cac:TaxCategory': TAXCATEGORY;
		};
		'cac:TaxTotal': {
			section?: SectionRef;
			'cbc:TaxAmount': ValueRef;
			'cbc:TaxAmount@currencyID'?: ValueRef;
			'cac:TaxSubtotal'?: {
				section?: SectionRef;
				'cbc:TaxableAmount': ValueRef;
				'cbc:TaxableAmount@currencyID'?: ValueRef;
				'cbc:TaxAmount': ValueRef;
				'cbc:TaxAmount@currencyID'?: ValueRef;
				'cac:TaxCategory': VATCATEGORY;
			};
		};
		'cac:LegalMonetaryTotal': DOCUMENTTOTALS;
		'cac:InvoiceLine': {
			section?: SectionRef;
			'cbc:ID': ValueRef;
			'cbc:Note'?: ValueRef;
			'cbc:InvoicedQuantity': ValueRef;
			'cbc:InvoicedQuantity@unitCode'?: ValueRef;
			'cbc:LineExtensionAmount': ValueRef;
			'cbc:LineExtensionAmount@currencyID'?: ValueRef;
			'cbc:AccountingCost'?: ValueRef;
			'cac:InvoicePeriod'?: INVOICELINEPERIOD;
			'cac:OrderLineReference'?: ORDERLINEREFERENCE;
			'cac:DocumentReference'?: LINEOBJECTIDENTIFIER;
			'cac:AllowanceCharge'?: {
				section?: SectionRef;
				'cbc:ChargeIndicator': ValueRef;
				'cbc:AllowanceChargeReasonCode'?: ValueRef;
				'cbc:AllowanceChargeReason'?: ValueRef;
				'cbc:MultiplierFactorNumeric'?: ValueRef;
				'cbc:Amount': ValueRef;
				'cbc:Amount@currencyID'?: ValueRef;
				'cbc:BaseAmount'?: ValueRef;
				'cbc:BaseAmount@currencyID'?: ValueRef;
			};
			'cac:Item': ITEMINFORMATION;
			'cac:Price': PRICEDETAILS;
		};
	};
	[k: string]: unknown;
}
/**
 * Auxiliary information for the mapping data.
 */
export interface MappingMetaInformation {
	sectionColumn: {
		[k: string]: string;
	};
	empty?: string[];
	/**
	 * Version of the mapping schema as a string "MAJOR.MINOR" or "MAJOR".
	 */
	version?: string;
}
/**
 * A group of business terms providing information on the invoice period. Also called delivery period. If the group is used, the invoiceing period start date and/or end date must be used.
 * Business terms: BG-14
 */
export interface DELIVERYORINVOICEPERIOD {
	'cbc:StartDate'?: ValueRef;
	'cbc:EndDate'?: ValueRef;
	'cbc:DescriptionCode'?: ValueRef;
}
export interface ORDERANDSALESORDERREFERENCE {
	'cbc:ID': ValueRef;
	'cbc:SalesOrderID'?: ValueRef;
}
export interface INVOICEDOCUMENTREFERENCE {
	'cbc:ID': ValueRef;
	'cbc:IssueDate'?: ValueRef;
}
export interface DESPATCHADVICEREFERENCE {
	'cbc:ID': ValueRef;
}
export interface RECEIPTADVICEREFERENCE {
	'cbc:ID': ValueRef;
}
export interface TENDERORLOTREFERENCE {
	'cbc:ID': ValueRef;
}
export interface CONTRACTREFERENCE {
	'cbc:ID': ValueRef;
}
export interface ATTACHMENT {
	'cbc:EmbeddedDocumentBinaryObject'?: ValueRef;
	'cbc:EmbeddedDocumentBinaryObject@mimeCode'?: ValueRef;
	'cbc:EmbeddedDocumentBinaryObject@filename'?: ValueRef;
	'cac:ExternalReference'?: EXTERNALREFERENCE;
}
export interface EXTERNALREFERENCE {
	'cbc:URI': ValueRef;
}
export interface PROJECTREFERENCE {
	'cbc:ID': ValueRef;
}
/**
 * A group of business terms providing information about the Seller.
 * Business terms: BG-4
 */
export interface SELLER {
	'cac:Party': PARTY;
}
export interface PARTY {
	'cbc:EndpointID': ValueRef;
	'cbc:EndpointID@schemeID'?: ValueRef;
	'cac:PartyIdentification'?: {
		section?: SectionRef;
		'cbc:ID': ValueRef;
		'cbc:ID@schemeID'?: ValueRef;
	};
	'cac:PartyName'?: PARTYNAME;
	'cac:PostalAddress': SELLERPOSTALADDRESS;
	'cac:PartyTaxScheme'?: {
		section?: SectionRef;
		'cbc:CompanyID': ValueRef;
		'cac:TaxScheme': TAXSCHEME;
	};
	'cac:PartyLegalEntity': PARTYLEGALENTITY;
	'cac:Contact'?: SELLERCONTACT;
}
export interface PARTYNAME {
	'cbc:Name': ValueRef;
}
/**
 * A group of business terms providing information about the address of the Seller. Sufficient components of the address are to be filled to comply with legal requirements.
 * Business terms: BG-5
 */
export interface SELLERPOSTALADDRESS {
	'cbc:StreetName'?: ValueRef;
	'cbc:AdditionalStreetName'?: ValueRef;
	'cbc:CityName'?: ValueRef;
	'cbc:PostalZone'?: ValueRef;
	'cbc:CountrySubentity'?: ValueRef;
	'cac:AddressLine'?: ADDRESSLINE;
	'cac:Country': COUNTRY;
}
export interface ADDRESSLINE {
	'cbc:Line': ValueRef;
}
export interface COUNTRY {
	'cbc:IdentificationCode': ValueRef;
}
export interface TAXSCHEME {
	'cbc:ID': ValueRef;
}
export interface PARTYLEGALENTITY {
	'cbc:RegistrationName': ValueRef;
	'cbc:CompanyID'?: ValueRef;
	'cbc:CompanyID@schemeID'?: ValueRef;
	'cbc:CompanyLegalForm'?: ValueRef;
}
/**
 * A group of business terms providing contact information about the Seller.
 * Business terms: BG-6
 */
export interface SELLERCONTACT {
	'cbc:Name'?: ValueRef;
	'cbc:Telephone'?: ValueRef;
	'cbc:ElectronicMail'?: ValueRef;
}
/**
 * A group of business terms providing information about the Buyer.
 * Business terms: BG-7
 */
export interface BUYER {
	'cac:Party': PARTY1;
}
export interface PARTY1 {
	'cbc:EndpointID': ValueRef;
	'cbc:EndpointID@schemeID'?: ValueRef;
	'cac:PartyIdentification'?: PARTYIDENTIFICATION;
	'cac:PartyName'?: PARTYNAME1;
	'cac:PostalAddress': BUYERPOSTALADDRESS;
	'cac:PartyTaxScheme'?: PARTYVATIDENTIFIER;
	'cac:PartyLegalEntity': PARTYLEGALENTITY1;
	'cac:Contact'?: BUYERCONTACT;
}
export interface PARTYIDENTIFICATION {
	'cbc:ID': ValueRef;
	'cbc:ID@schemeID'?: ValueRef;
}
export interface PARTYNAME1 {
	'cbc:Name': ValueRef;
}
/**
 * A group of business terms providing information about the postal address for the Buyer. Sufficient components of the address are to be filled to comply with legal requirements.
 * Business terms: BG-8
 */
export interface BUYERPOSTALADDRESS {
	'cbc:StreetName'?: ValueRef;
	'cbc:AdditionalStreetName'?: ValueRef;
	'cbc:CityName'?: ValueRef;
	'cbc:PostalZone'?: ValueRef;
	'cbc:CountrySubentity'?: ValueRef;
	'cac:AddressLine'?: ADDRESSLINE1;
	'cac:Country': COUNTRY1;
}
export interface ADDRESSLINE1 {
	'cbc:Line': ValueRef;
}
export interface COUNTRY1 {
	'cbc:IdentificationCode': ValueRef;
}
export interface PARTYVATIDENTIFIER {
	'cbc:CompanyID': ValueRef;
	'cac:TaxScheme': TAXSCHEME1;
}
export interface TAXSCHEME1 {
	'cbc:ID': ValueRef;
}
export interface PARTYLEGALENTITY1 {
	'cbc:RegistrationName': ValueRef;
	'cbc:CompanyID'?: ValueRef;
	'cbc:CompanyID@schemeID'?: ValueRef;
}
/**
 * A group of business terms providing contact information relevant for the Buyer.
 * Business terms: BG-9
 */
export interface BUYERCONTACT {
	'cbc:Name'?: ValueRef;
	'cbc:Telephone'?: ValueRef;
	'cbc:ElectronicMail'?: ValueRef;
}
/**
 * A group of business terms providing information about the Payee, i.e. the role that receives the payment. Shall be used when the Payee is different from the Seller.
 * Business terms: BG-10
 */
export interface PAYEE {
	'cac:PartyIdentification'?: PARTYIDENTIFICATION1;
	'cac:PartyName': PARTYNAME2;
	'cac:PartyLegalEntity'?: PARTYLEGALENTITY2;
}
export interface PARTYIDENTIFICATION1 {
	'cbc:ID': ValueRef;
	'cbc:ID@schemeID'?: ValueRef;
}
export interface PARTYNAME2 {
	'cbc:Name': ValueRef;
}
export interface PARTYLEGALENTITY2 {
	'cbc:CompanyID': ValueRef;
	'cbc:CompanyID@schemeID'?: ValueRef;
}
/**
 * A group of business terms providing information about the Seller's tax representative.
 * Business terms: BG-11
 */
export interface SELLERTAXREPRESENTATIVEPARTY {
	'cac:PartyName': PARTYNAME3;
	'cac:PostalAddress': SELLERTAXREPRESENTATIVEPOSTALADDRESS;
	'cac:PartyTaxScheme': PARTYVATIDENTIFIER1;
}
export interface PARTYNAME3 {
	'cbc:Name': ValueRef;
}
/**
 * A group of business terms providing information about the postal address for the tax representative party. Sufficient components of the address are to be filled to comply with legal requirements.
 * Business terms: BG-12
 */
export interface SELLERTAXREPRESENTATIVEPOSTALADDRESS {
	'cbc:StreetName'?: ValueRef;
	'cbc:AdditionalStreetName'?: ValueRef;
	'cbc:CityName'?: ValueRef;
	'cbc:PostalZone'?: ValueRef;
	'cbc:CountrySubentity'?: ValueRef;
	'cac:AddressLine'?: ADDRESSLINE2;
	'cac:Country': COUNTRY2;
}
export interface ADDRESSLINE2 {
	'cbc:Line': ValueRef;
}
export interface COUNTRY2 {
	'cbc:IdentificationCode': ValueRef;
}
export interface PARTYVATIDENTIFIER1 {
	'cbc:CompanyID': ValueRef;
	'cac:TaxScheme': TAXSCHEME2;
}
export interface TAXSCHEME2 {
	'cbc:ID': ValueRef;
}
/**
 * A group of business terms providing information about where and when the goods and services invoiced are delivered.
 * Business terms: BG-13
 */
export interface DELIVERYINFORMATION {
	'cbc:ActualDeliveryDate'?: ValueRef;
	'cac:DeliveryLocation'?: {
		'cbc:ID'?: ValueRef;
		'cbc:ID@schemeID'?: ValueRef;
		'cac:Address'?: DELIVERTOADDRESS;
	};
	'cac:DeliveryParty'?: DELIVERPARTY;
}
/**
 * A group of business terms providing information about the address to which goods and services invoiced were or are delivered.
 * Business terms: BG-15
 */
export interface DELIVERTOADDRESS {
	'cbc:StreetName'?: ValueRef;
	'cbc:AdditionalStreetName'?: ValueRef;
	'cbc:CityName'?: ValueRef;
	'cbc:PostalZone'?: ValueRef;
	'cbc:CountrySubentity'?: ValueRef;
	'cac:AddressLine'?: ADDRESSLINE3;
	'cac:Country': COUNTRY3;
}
export interface ADDRESSLINE3 {
	'cbc:Line': ValueRef;
}
export interface COUNTRY3 {
	'cbc:IdentificationCode': ValueRef;
}
export interface DELIVERPARTY {
	'cac:PartyName': PARTYNAME4;
}
export interface PARTYNAME4 {
	'cbc:Name': ValueRef;
}
/**
 * A group of business terms providing information about card used for payment contemporaneous with invoice issuance.
 * Business terms: BG-18
 */
export interface PAYMENTCARDINFORMATION {
	'cbc:PrimaryAccountNumberID': ValueRef;
	'cbc:NetworkID': ValueRef;
	'cbc:HolderName'?: ValueRef;
}
/**
 * A group of business terms to specify credit transfer payments.
 * Business terms: BG-17
 */
export interface CREDITTRANSFER {
	'cbc:ID': ValueRef;
	'cbc:Name'?: ValueRef;
	'cac:FinancialInstitutionBranch'?: FINANCIALINSTITUTIONBRANCH;
}
export interface FINANCIALINSTITUTIONBRANCH {
	'cbc:ID': ValueRef;
}
/**
 * A group of business terms to specify a direct debit.
 * Business terms: BG-19
 */
export interface DIRECTDEBIT {
	'cbc:ID'?: ValueRef;
	'cac:PayerFinancialAccount'?: PAYERFINANCIALACCOUNT;
}
export interface PAYERFINANCIALACCOUNT {
	'cbc:ID': ValueRef;
}
export interface PAYMENTTERMS {
	'cbc:Note': ValueRef;
}
export interface TAXCATEGORY {
	'cbc:ID': ValueRef;
	'cbc:Percent'?: ValueRef;
	'cac:TaxScheme': TAXSCHEME3;
}
export interface TAXSCHEME3 {
	'cbc:ID': ValueRef;
}
export interface VATCATEGORY {
	'cbc:ID': ValueRef;
	'cbc:Percent'?: ValueRef;
	'cbc:TaxExemptionReasonCode'?: ValueRef;
	'cbc:TaxExemptionReason'?: ValueRef;
	'cac:TaxScheme': TAXSCHEME4;
}
export interface TAXSCHEME4 {
	'cbc:ID': ValueRef;
}
/**
 * A group of business terms providing the monetary totals for the Invoice.
 * Business terms: BG-22
 */
export interface DOCUMENTTOTALS {
	'cbc:LineExtensionAmount': ValueRef;
	'cbc:LineExtensionAmount@currencyID'?: ValueRef;
	'cbc:TaxExclusiveAmount': ValueRef;
	'cbc:TaxExclusiveAmount@currencyID'?: ValueRef;
	'cbc:TaxInclusiveAmount': ValueRef;
	'cbc:TaxInclusiveAmount@currencyID'?: ValueRef;
	'cbc:AllowanceTotalAmount'?: ValueRef;
	'cbc:AllowanceTotalAmount@currencyID'?: ValueRef;
	'cbc:ChargeTotalAmount'?: ValueRef;
	'cbc:ChargeTotalAmount@currencyID'?: ValueRef;
	'cbc:PrepaidAmount'?: ValueRef;
	'cbc:PrepaidAmount@currencyID'?: ValueRef;
	'cbc:PayableRoundingAmount'?: ValueRef;
	'cbc:PayableRoundingAmount@currencyID'?: ValueRef;
	'cbc:PayableAmount': ValueRef;
	'cbc:PayableAmount@currencyID'?: ValueRef;
}
/**
 * A group of business terms providing information about the period relevant for the Invoice line.
 * Business terms: BG-26
 */
export interface INVOICELINEPERIOD {
	'cbc:StartDate'?: ValueRef;
	'cbc:EndDate'?: ValueRef;
}
export interface ORDERLINEREFERENCE {
	'cbc:LineID': ValueRef;
}
export interface LINEOBJECTIDENTIFIER {
	'cbc:ID': ValueRef;
	'cbc:ID@schemeID'?: ValueRef;
	'cbc:DocumentTypeCode': ValueRef;
}
/**
 * A group of business terms providing information about the goods and services invoiced.
 * Business terms: BG-31
 */
export interface ITEMINFORMATION {
	'cbc:Description'?: ValueRef;
	'cbc:Name': ValueRef;
	'cac:BuyersItemIdentification'?: BUYERSITEMIDENTIFICATION;
	'cac:SellersItemIdentification'?: SELLERSITEMIDENTIFICATION;
	'cac:StandardItemIdentification'?: STANDARDITEMIDENTIFICATION;
	'cac:OriginCountry'?: ORIGINCOUNTRY;
	'cac:CommodityClassification'?: {
		section?: SectionRef;
		'cbc:ItemClassificationCode': ValueRef;
		'cbc:ItemClassificationCode@listID'?: ValueRef;
		'cbc:ItemClassificationCode@listVersionID'?: ValueRef;
	};
	'cac:ClassifiedTaxCategory': LINEVATINFORMATION;
	'cac:AdditionalItemProperty'?: {
		section?: SectionRef;
		'cbc:Name': ValueRef;
		'cbc:Value': ValueRef;
	};
}
export interface BUYERSITEMIDENTIFICATION {
	'cbc:ID': ValueRef;
}
export interface SELLERSITEMIDENTIFICATION {
	'cbc:ID': ValueRef;
}
export interface STANDARDITEMIDENTIFICATION {
	'cbc:ID': ValueRef;
	'cbc:ID@schemeID'?: ValueRef;
}
export interface ORIGINCOUNTRY {
	'cbc:IdentificationCode': ValueRef;
}
/**
 * A group of business terms providing information about the VAT applicable for the goods and services invoiced on the Invoice line.
 * Business terms: BG-30
 */
export interface LINEVATINFORMATION {
	'cbc:ID': ValueRef;
	'cbc:Percent'?: ValueRef;
	'cac:TaxScheme': TAXSCHEME5;
}
export interface TAXSCHEME5 {
	'cbc:ID': ValueRef;
}
/**
 * A group of business terms providing information about the price applied for the goods and services invoiced on the Invoice line.
 * Business terms: BG-29
 */
export interface PRICEDETAILS {
	'cbc:PriceAmount': ValueRef;
	'cbc:PriceAmount@currencyID'?: ValueRef;
	'cbc:BaseQuantity'?: ValueRef;
	'cbc:BaseQuantity@unitCode'?: ValueRef;
	'cac:AllowanceCharge'?: ALLOWANCE;
}
export interface ALLOWANCE {
	'cbc:ChargeIndicator': ValueRef;
	'cbc:Amount': ValueRef;
	'cbc:Amount@currencyID'?: ValueRef;
	'cbc:BaseAmount'?: ValueRef;
	'cbc:BaseAmount@currencyID'?: ValueRef;
}
