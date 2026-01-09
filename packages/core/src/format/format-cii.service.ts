import { Invoice } from '@e-invoice-eu/core';
import * as jsonpath from 'jsonpath-plus';

import { FormatUBLService } from './format-ubl.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';
import { InvoiceServiceOptions } from '../invoice/invoice.service';

// This is what we are looking at while traversing the input tree:
export type Node = { [key: string]: Node } | Node[] | string;
export type ObjectNode = { [key: string]: Node };

// Flags for Factur-X usage.
export type FXProfile =
	| 0x1
	| 0x2
	| 0x3
	| 0x4
	| 0x5
	| 0x6
	| 0x7
	| 0x8
	| 0xa
	| 0xb
	| 0xc
	| 0xd
	| 0xe
	| 0xf
	| 0x10
	| 0x11
	| 0x12
	| 0x13
	| 0x14
	| 0x15
	| 0x16
	| 0x17
	| 0x18
	| 0x19
	| 0x1a
	| 0x1b
	| 0x1c
	| 0x1d
	| 0x1d
	| 0x1f
	| 0x20
	| 0x21
	| 0x22
	| 0x23
	| 0x24
	| 0x25
	| 0x26
	| 0x27
	| 0x28
	| 0x2a
	| 0x2b
	| 0x2c
	| 0x2d
	| 0x2e
	| 0x2f
	| 0x30
	| 0x31
	| 0x32
	| 0x33
	| 0x34
	| 0x35
	| 0x36
	| 0x37
	| 0x38
	| 0x39
	| 0x3a
	| 0x3b
	| 0x3c
	| 0x3d
	| 0x3d
	| 0x3f;
export const FULL_CII: FXProfile = 0x1;
export const FX_EXTENDED: FXProfile = 0x2;
export const FX_EN16931: FXProfile = 0x4;
export const FX_BASIC: FXProfile = 0x8;
export const FX_BASIC_WL: FXProfile = 0x10;
export const FX_MINIMUM: FXProfile = 0x20;

export const MASK_FULL_CII: FXProfile = FULL_CII;
export const FX_MASK_EXTENDED: FXProfile = (MASK_FULL_CII |
	FX_EXTENDED) as FXProfile;
export const FX_MASK_EN16931: FXProfile = (FX_MASK_EXTENDED |
	FX_EN16931) as FXProfile;
export const FX_MASK_BASIC: FXProfile = (FX_MASK_EN16931 |
	FX_BASIC) as FXProfile;
export const FX_MASK_BASIC_WL: FXProfile = (FX_MASK_BASIC |
	FX_BASIC_WL) as FXProfile;
export const FX_MASK_MINIMUM: FXProfile = (FX_MASK_BASIC_WL |
	FX_MINIMUM) as FXProfile;

export type SubType = 'DateTimeString';

// Both `src` and `dest` contain an array of element names that defines the
// path to that node.
//
// For `src`, a special semantic exists.  If an element name begins with the
// special prefix "fixed:", everything after that prefix is returned.  In
// general, this should be the last element in the list so that it is only
// rendered if the elements it depends on exist in the source.
export type Transformation =
	| {
			type: 'object' | 'array';
			subtype?: never;
			src: string[];
			dest: string[];
			children: Transformation[];
			fxProfileMask: FXProfile;
	  }
	| {
			type: 'string';
			subtype?: SubType;
			src: string[];
			dest: string[];
			children?: never;
			fxProfileMask: FXProfile;
	  };

const cacAdditionalItemProperty: Transformation = {
	type: 'array',
	src: ['cac:AdditionalItemProperty'],
	dest: ['ram:ApplicableProductCharacteristic'],
	children: [
		{
			type: 'string',
			src: ['cbc:Name'],
			dest: ['ram:Description'],
			fxProfileMask: FX_MASK_EN16931,
		},
		{
			type: 'string',
			src: ['cbc:Value'],
			dest: ['ram:Value'],
			fxProfileMask: FX_MASK_EN16931,
		},
	],
	fxProfileMask: FX_MASK_MINIMUM,
};

const cacCommodityClassification: Transformation = {
	type: 'array',
	src: ['cac:CommodityClassification'],
	dest: ['ram:DesignatedProductClassification'],
	children: [
		{
			type: 'string',
			src: ['cbc:ItemClassificationCode'],
			dest: ['ram:ClassCode', 'ram:ListID'],
			fxProfileMask: FX_MASK_EN16931,
		},
	],
	fxProfileMask: FX_MASK_MINIMUM,
};

const cacItem: Transformation = {
	type: 'object',
	src: ['cac:Item'],
	dest: ['ram:SpecifiedTradeProduct'],
	children: [
		{
			type: 'string',
			src: ['cac:StandardItemIdentification', 'cbc:ID'],
			dest: ['ram:GlobalID'],
			fxProfileMask: FX_MASK_BASIC,
		},
		{
			type: 'string',
			src: ['cac:StandardItemIdentification', 'cbc:ID@schemeID'],
			dest: ['ram:GlobalID@schemeID'],
			fxProfileMask: FX_MASK_BASIC,
		},
		{
			type: 'string',
			src: ['cac:SellersItemIdentification', 'cbc:ID'],
			dest: ['ram:SellerAssignedID'],
			fxProfileMask: FX_MASK_EN16931,
		},
		{
			type: 'string',
			src: ['cac:BuyersItemIdentification', 'cbc:ID'],
			dest: ['ram:BuyerAssignedID'],
			fxProfileMask: FX_MASK_EN16931,
		},
		{
			type: 'string',
			src: ['cbc:Name'],
			dest: ['ram:Name'],
			fxProfileMask: FX_MASK_BASIC,
		},
		{
			type: 'string',
			src: ['cbc:Description'],
			dest: ['ram:Description'],
			fxProfileMask: FX_MASK_EN16931,
		},
		cacAdditionalItemProperty,
		cacCommodityClassification,
		{
			type: 'string',
			src: ['cac:OriginCountry', 'cbc:IdentificationCode'],
			dest: ['ram:OriginTradeCountry', 'ram:ID'],
			fxProfileMask: FX_MASK_EN16931,
		},
	],
	fxProfileMask: FX_MASK_MINIMUM,
};

const cacOrderLineReference: Transformation = {
	type: 'object',
	src: ['cac:OrderLineReference'],
	dest: ['ram:SpecifiedLineTradeAgreement'],
	children: [
		{
			type: 'string',
			src: ['cbc:LineID'],
			dest: ['ram:BuyerOrderReferencedDocument', 'ram:LineID'],
			fxProfileMask: FX_MASK_EN16931,
		},
	],
	fxProfileMask: FX_MASK_MINIMUM,
};

const cacPrice: Transformation = {
	type: 'object',
	src: ['cac:Price'],
	dest: [],
	children: [
		{
			type: 'object',
			src: [],
			dest: ['ram:SpecifiedLineTradeAgreement', 'ram:GrossPriceProductTradePrice'],
			children: [
				{
					type: 'string',
					src: ['cbc:BaseQuantity'],
					dest: ['ram:BasisQuantity'],
					fxProfileMask: FX_MASK_EN16931,
				},
				{
					type: 'string',
					src: ['cbc:BaseQuantity@unitCode'],
					dest: ['ram:BasisQuantity@unitCode'],
					fxProfileMask: FX_MASK_EN16931,
				},
			],
			fxProfileMask: FX_MASK_EN16931,
		},
		{
			type: 'object',
			src: ['cac:AllowanceCharge'],
			dest: ['ram:SpecifiedLineTradeAgreement', 'ram:GrossPriceProductTradePrice'],
			children: [
				{
					type: 'string',
					src: ['cbc:BaseAmount'],
					dest: ['ram:ChargeAmount'],
					fxProfileMask: FX_MASK_EN16931,
				},
				{
					type: 'string',
					src: ['cbc:ChargeIndicator'],
					dest: [
						'ram:AppliedTradeAllowanceCharge',
						'ram:ChargeIndicator',
						'udt:Indicator',
					],
					fxProfileMask: FX_MASK_EN16931,
				},
				{
					type: 'string',
					src: ['cbc:Amount'],
					dest: [
						'ram:AppliedTradeAllowanceCharge',
						'ram:ActualAmount',
					],
					fxProfileMask: FX_MASK_EN16931,
				},
				{
					type: 'string',
					src: ['cbc:Amount@currencyID'],
					dest: [
						'ram:AppliedTradeAllowanceCharge',
						'ram:ActualAmount@currencyID',
					],
					fxProfileMask: FX_MASK_EN16931,
				},
			],
			fxProfileMask: FX_MASK_EN16931,
		},
		{
			type: 'string',
			src: ['cbc:PriceAmount'],
			dest: [
				'ram:SpecifiedLineTradeAgreement',
				'ram:NetPriceProductTradePrice',
				'ram:ChargeAmount',
			],
			fxProfileMask: FX_MASK_BASIC,
		},
	],
	fxProfileMask: FX_MASK_MINIMUM,
};

const cacInvoiceLinePeriod: Transformation = {
	type: 'object',
	src: ['cac:InvoicePeriod'],
	dest: ['ram:SpecifiedLineTradeSettlement', 'ram:BillingSpecifiedPeriod'],
	children: [
		{
			type: 'string',
			subtype: 'DateTimeString',
			src: ['cbc:StartDate'],
			dest: ['ram:StartDateTime', 'udt:DateTimeString'],
			fxProfileMask: FX_MASK_EN16931,
		},
		{
			type: 'string',
			src: ['cbc:StartDate', 'fixed:102'],
			dest: ['ram:StartDateTime', 'udt:DateTimeString@format',],
			fxProfileMask: FX_MASK_EN16931,
		},
		{
			type: 'string',
			subtype: 'DateTimeString',
			src: ['cbc:EndDate'],
			dest: ['ram:EndDateTime', 'udt:DateTimeString'],
			fxProfileMask: FX_MASK_EN16931,
		},
		{
			type: 'string',
			src: ['cbc:EndDate', 'fixed:102'],
			dest: ['ram:EndDateTime', 'udt:DateTimeString@format',],
			fxProfileMask: FX_MASK_EN16931,
		},
	],
	fxProfileMask: FX_MASK_EN16931,
};

const cacInvoiceLineAllowanceCharge: Transformation = {
	type: 'array',
	src: ['cac:AllowanceCharge'],
	dest: ['ram:SpecifiedLineTradeSettlement', 'ram:SpecifiedTradeAllowanceCharge'],
	children: [
		{
			type: 'string',
			src: ['cbc:ChargeIndicator'],
			dest: ['ram:ChargeIndicator', 'udt:Indicator'],
			fxProfileMask: FX_MASK_BASIC,
		},
		{
			type: 'string',
			src: ['cbc:MultiplierFactorNumeric'],
			dest: ['ram:CalculationPercent'],
			fxProfileMask: FX_MASK_BASIC,
		},
		{
			type: 'string',
			src: ['cbc:BaseAmount'],
			dest: ['ram:BasisAmount'],
			fxProfileMask: FX_MASK_BASIC,
		},
		{
			type: 'string',
			src: ['cbc:BaseAmount@currencyID'],
			dest: ['ram:BasisAmount@currencyID'],
			fxProfileMask: FX_MASK_BASIC,
		},
		{
			type: 'string',
			src: ['cbc:Amount'],
			dest: ['ram:ActualAmount'],
			fxProfileMask: FX_MASK_BASIC,
		},
		{
			type: 'string',
			src: ['cbc:Amount@currencyID'],
			dest: ['ram:ActualAmount@currencyID'],
			fxProfileMask: FX_MASK_BASIC,
		},
		{
			type: 'string',
			src: ['cbc:AllowanceChargeReasonCode'],
			dest: ['ram:ReasonCode'],
			fxProfileMask: FX_MASK_BASIC,
		},
		{
			type: 'string',
			src: ['cbc:AllowanceChargeReason'],
			dest: ['ram:Reason'],
			fxProfileMask: FX_MASK_BASIC,
		},
	],
	fxProfileMask: FX_MASK_MINIMUM,
};

const cacDocumentReference: Transformation = {
	type: 'object',
	src: ['cac:DocumentReference'],
	dest: ['ram:AdditionalReferencedDocument'],
	children: [
		{
			type: 'string',
			src: ['cbc:ID'],
			dest: ['ram:IssuerAssignedID'],
			fxProfileMask: FX_MASK_EN16931,
		},
		{
			type: 'string',
			src: ['cbc:DocumentTypeCode'],
			dest: ['ram:TypeCode'],
			fxProfileMask: FX_MASK_EN16931,
		},
	],
	fxProfileMask: FX_MASK_MINIMUM,
};

const cacInvoiceLine: Transformation = {
	type: 'array',
	src: ['cac:InvoiceLine'],
	dest: ['ram:IncludedSupplyChainTradeLineItem'],
	children: [
		{
			type: 'string',
			src: ['cbc:ID'],
			dest: ['ram:AssociatedDocumentLineDocument', 'ram:LineID'],
			fxProfileMask: FX_MASK_BASIC,
		},
		{
			type: 'string',
			src: ['cbc:Note'],
			dest: [
				'ram:AssociatedDocumentLineDocument',
				'ram:IncludedNote',
				'ram:Content',
			],
			fxProfileMask: FX_MASK_BASIC_WL,
		},
		cacItem,
		cacOrderLineReference,
		cacPrice,
		{
			type: 'string',
			src: ['cbc:InvoicedQuantity'],
			dest: ['ram:SpecifiedLineTradeDelivery', 'ram:BilledQuantity'],
			fxProfileMask: FX_MASK_BASIC,
		},
		{
			type: 'string',
			src: ['cbc:InvoicedQuantity@unitCode'],
			dest: ['ram:SpecifiedLineTradeDelivery', 'ram:BilledQuantity@unitCode'],
			fxProfileMask: FX_MASK_BASIC,
		},
		{
			type: 'string',
			src: ['cac:Item', 'cac:ClassifiedTaxCategory', 'cac:TaxScheme', 'cbc:ID'],
			dest: [
				'ram:SpecifiedLineTradeSettlement',
				'ram:ApplicableTradeTax',
				'ram:TypeCode',
			],
			fxProfileMask: FX_MASK_BASIC,
		},
		{
			type: 'string',
			src: ['cac:Item', 'cac:ClassifiedTaxCategory', 'cbc:ID'],
			dest: [
				'ram:SpecifiedLineTradeSettlement',
				'ram:ApplicableTradeTax',
				'ram:CategoryCode',
			],
			fxProfileMask: FX_MASK_BASIC,
		},
		{
			type: 'string',
			src: ['cac:Item', 'cac:ClassifiedTaxCategory', 'cbc:Percent'],
			dest: [
				'ram:SpecifiedLineTradeSettlement',
				'ram:ApplicableTradeTax',
				'ram:RateApplicablePercent',
			],
			fxProfileMask: FX_MASK_BASIC,
		},
		cacInvoiceLinePeriod,
		cacInvoiceLineAllowanceCharge,
		{
			type: 'string',
			src: ['cbc:LineExtensionAmount'],
			dest: [
				'ram:SpecifiedLineTradeSettlement',
				'ram:SpecifiedTradeSettlementLineMonetarySummation',
				'ram:LineTotalAmount',
			],
			fxProfileMask: FX_MASK_BASIC_WL,
		},
		cacDocumentReference,
		{
			type: 'string',
			src: ['cbc:AccountingCost'],
			dest: [
				'ram:SpecifiedLineTradeSettlement',
				'ram:ReceivableSpecifiedTradeAccountingAccount',
				'ram:ID',
			],
			fxProfileMask: FX_MASK_EN16931,
		},
	],
	fxProfileMask: FX_MASK_BASIC,
};

export const cacPostalAddress: Transformation[] = [
	{
		type: 'string',
		src: ['cbc:PostalZone'],
		dest: ['ram:PostcodeCode'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cbc:StreetName'],
		dest: ['ram:LineOne'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cbc:AdditionalStreetName'],
		dest: ['ram:LineTwo'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cac:AddressLine', 'cbc:Line'],
		dest: ['ram:LineThree'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cbc:CityName'],
		dest: ['ram:CityName'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cac:Country', 'cbc:IdentificationCode'],
		dest: ['ram:CountryID'],
		fxProfileMask: FX_MASK_MINIMUM,
	},
	{
		type: 'string',
		src: ['cbc:CountrySubentity'],
		dest: ['ram:CountrySubDivisionName'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
];

export const cacPartyTaxScheme: Transformation[] = [
	{
		type: 'string',
		src: ['cbc:CompanyID'],
		dest: ['ram:ID'],
		fxProfileMask: FX_MASK_MINIMUM,
	},
	// FIXME! It must be possible to specify FC instead!
	{
		type: 'string',
		src: ['fixed:VA'],
		dest: ['ram:ID@schemeID'],
		fxProfileMask: FX_MASK_MINIMUM,
	},
];

export const cacAccountingSupplierParty: Transformation[] = [
	{
		type: 'array',
		src: [],
		dest: [],
		children: [
			{
				type: 'string',
				src: ['cac:PartyIdentification', 'cbc:ID'],
				dest: ['ram:ID'],
				fxProfileMask: FX_MASK_BASIC_WL,
			},
		],
		fxProfileMask: FX_MASK_MINIMUM,
	},
	{
		type: 'string',
		src: ['cac:PartyLegalEntity', 'cbc:RegistrationName'],
		dest: ['ram:Name'],
		fxProfileMask: FX_MASK_MINIMUM,
	},
	{
		type: 'string',
		src: ['cac:PartyLegalEntity', 'cbc:LegalForm'],
		dest: ['ram:Description'],
		fxProfileMask: FX_MASK_EN16931,
	},
	{
		type: 'string',
		src: ['cac:PartyLegalEntity', 'cbc:CompanyID'],
		dest: ['ram:SpecifiedLegalOrganization', 'ram:ID'],
		fxProfileMask: FX_MASK_MINIMUM,
	},
	{
		type: 'string',
		src: ['cac:PartyLegalEntity', 'cbc:CompanyID@schemeID'],
		dest: ['ram:SpecifiedLegalOrganization', 'ram:ID@schemeID'],
		fxProfileMask: FX_MASK_MINIMUM,
	},
	{
		type: 'string',
		src: ['cac:PartyName', 'cbc:Name'],
		dest: ['ram:SpecifiedLegalOrganization', 'ram:TradingBusinessName'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cac:Contact', 'cbc:Name'],
		dest: ['ram:DefinedTradeContact', 'ram:PersonName'],
		fxProfileMask: FX_MASK_EN16931,
	},
	{
		type: 'string',
		src: ['cac:Contact', 'cbc:Telephone'],
		dest: [
			'ram:DefinedTradeContact',
			'ram:TelephoneUniversalCommunication',
			'ram:CompleteNumber',
		],
		fxProfileMask: FX_MASK_EN16931,
	},
	{
		type: 'string',
		src: ['cac:Contact', 'cbc:ElectronicMail'],
		dest: [
			'ram:DefinedTradeContact',
			'ram:EmailURIUniversalCommunication',
			'ram:URIID',
		],
		fxProfileMask: FX_MASK_EN16931,
	},
	{
		type: 'object',
		src: ['cac:PostalAddress'],
		dest: ['ram:PostalTradeAddress'],
		children: cacPostalAddress,
		fxProfileMask: FX_MASK_MINIMUM,
	},
	{
		type: 'string',
		src: ['cbc:EndpointID'],
		dest: ['ram:URIUniversalCommunication', 'ram:URIID'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cbc:EndpointID@schemeID'],
		dest: ['ram:URIUniversalCommunication', 'ram:URIID@schemeID'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'array',
		src: ['cac:PartyTaxScheme'],
		dest: ['ram:SpecifiedTaxRegistration'],
		children: cacPartyTaxScheme,
		fxProfileMask: FX_MASK_MINIMUM,
	},
];

export const cacAccountingCustomerParty: Transformation[] = [
	{
		type: 'string',
		src: ['cac:PartyIdentification', 'cbc:ID'],
		dest: ['ram:ID'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cac:PartyLegalEntity', 'cbc:RegistrationName'],
		dest: ['ram:Name'],
		fxProfileMask: FX_MASK_MINIMUM,
	},
	{
		type: 'string',
		src: ['cac:PartyLegalEntity', 'cbc:LegalForm'],
		dest: ['ram:Description'],
		fxProfileMask: FX_MASK_EN16931,
	},
	{
		type: 'string',
		src: ['cac:PartyLegalEntity', 'cbc:CompanyID'],
		dest: ['ram:SpecifiedLegalOrganization', 'ram:ID'],
		fxProfileMask: FX_MASK_MINIMUM,
	},
	{
		type: 'string',
		src: ['cac:PartyLegalEntity', 'cbc:CompanyID@schemeID'],
		dest: ['ram:SpecifiedLegalOrganization', 'ram:ID@schemeID'],
		fxProfileMask: FX_MASK_MINIMUM,
	},
	{
		type: 'string',
		src: ['cac:PartyName', 'cbc:Name'],
		dest: ['ram:SpecifiedLegalOrganization', 'ram:TradingBusinessName'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'object',
		src: ['cac:PostalAddress'],
		dest: ['ram:PostalTradeAddress'],
		children: cacPostalAddress,
		fxProfileMask: FX_MASK_MINIMUM,
	},
	{
		type: 'string',
		src: ['cbc:EndpointID'],
		dest: ['ram:URIUniversalCommunication', 'ram:URIID'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cbc:EndpointID@schemeID'],
		dest: ['ram:URIUniversalCommunication', 'ram:URIID@schemeID'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'object',
		src: ['cac:PartyTaxScheme'],
		dest: ['ram:SpecifiedTaxRegistration'],
		children: cacPartyTaxScheme,
		fxProfileMask: FX_MASK_MINIMUM,
	},
];

export const cacAdditionalDocumentReference: Transformation[] = [
	{
		type: 'string',
		src: ['cbc:ID'],
		dest: ['ram:IssuerAssignedID'],
		fxProfileMask: FX_MASK_EN16931,
	},
	{
		type: 'string',
		src: ['cac:Attachment', 'cac:ExternalReference', 'cbc:URI'],
		dest: ['udt:URIID'],
		fxProfileMask: FX_MASK_EN16931,
	},
	{
		type: 'string',
		src: ['cbc:DocumentTypeCode'],
		dest: ['qdt:TypeCode'],
		fxProfileMask: FX_MASK_EN16931,
	},
	{
		type: 'string',
		src: ['cbc:DocumentDescription'],
		dest: ['ram:Name'],
		fxProfileMask: FX_MASK_EN16931,
	},
	{
		type: 'string',
		src: ['cac:Attachment', 'cbc:EmbeddedDocumentBinaryObject'],
		dest: ['ram:AttachmentBinaryObject'],
		fxProfileMask: FX_MASK_EN16931,
	},
	{
		type: 'string',
		src: ['cac:Attachment', 'cbc:EmbeddedDocumentBinaryObject@mimeCode'],
		dest: ['ram:AttachmentBinaryObject@mimeCode'],
		fxProfileMask: FX_MASK_EN16931,
	},
	{
		type: 'string',
		src: ['cac:Attachment', 'cbc:EmbeddedDocumentBinaryObject@filename'],
		dest: ['ram:AttachmentBinaryObject@filename'],
		fxProfileMask: FX_MASK_EN16931,
	},
];

export const deliveryAddress: Transformation[] = [
	{
		type: 'string',
		src: ['cbc:PostalZone'],
		dest: ['ram:PostcodeCode'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cbc:StreetName'],
		dest: ['ram:LineOne'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cbc:AdditionalStreetName'],
		dest: ['ram:LineTwo'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cac:AddressLine', 'cbc:Line'],
		dest: ['ram:LineThree'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cbc:CityName'],
		dest: ['ram:CityName'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cac:Country', 'cbc:IdentificationCode'],
		dest: ['ram:CountryID'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cbc:CountrySubentity'],
		dest: ['ram:CountrySubDivisionName'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cac:Delivery', 'cbc:ActualDeliveryDate'],
		dest: [
			'ram:ActualDeliverySupplyChainEvent',
			'ram:OccurrenceDateTime',
			'udt:DateTimeString',
		],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cac:Delivery', 'cbc:ActualDeliveryDate', 'fixed:102'],
		dest: [
			'ram:ActualDeliverySupplyChainEvent',
			'ram:OccurrenceDateTime',
			'udt:DateTimeString@format',
		],
		fxProfileMask: FX_MASK_MINIMUM,
	},
	{
		type: 'string',
		src: ['cac:DespatchDocumentReference', 'cbc:ID'],
		dest: ['ram:DespatchAdviceReferencedDocument', 'ram:IssuerAssignedID'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
];

const cacPayeeParty: Transformation[] = [
	{
		// FIXME! This is an array for certain CII variants.
		type: 'string',
		src: ['cac:PartyIdentification', 'cbc:ID'],
		dest: ['ram:ID'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cac:PartyName', 'cbc:Name'],
		dest: ['ram:Name'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cac:PartyLegalEntity', 'cbc:CompanyID'],
		dest: ['ram:SpecifiedLegalOrganization', 'ram:ID'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cac:PartyLegalEntity', 'cbc:CompanyID@schemeID'],
		dest: ['ram:SpecifiedLegalOrganization', 'ram:ID@schemeID'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
];

const cacPaymentMeans: Transformation[] = [
	{
		type: 'string',
		src: ['cbc:PaymentMeansCode'],
		dest: ['ram:TypeCode'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cbc:PaymentMeansCode@name'],
		dest: ['ram:Information'],
		fxProfileMask: FX_MASK_EN16931,
	},
	{
		type: 'string',
		src: ['cac:CardAccount', 'cbc:PrimaryAccountNumberID'],
		dest: ['ram:ApplicableTradeSettlementFinancialCard', 'ram:ID'],
		fxProfileMask: FX_MASK_EN16931,
	},
	{
		type: 'string',
		src: ['cac:CardAccount', 'cbc:HolderName'],
		dest: ['ram:ApplicableTradeSettlementFinancialCard', 'ram:CardHolderName'],
		fxProfileMask: FX_MASK_EN16931,
	},
	{
		type: 'string',
		src: ['cac:PaymentMandate', 'cac:PayerFinancialAccount', 'cbc:ID'],
		dest: ['ram:PayerPartyDebtorFinancialAccount', 'ram:IBANID'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cac:PayeeFinancialAccount', 'cbc:ID'],
		dest: ['ram:PayeePartyCreditorFinancialAccount', 'ram:IBANID'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cac:PayeeFinancialAccount', 'cbc:Name'],
		dest: ['ram:PayeePartyCreditorFinancialAccount', 'ram:AccountName'],
		fxProfileMask: FX_MASK_EN16931,
	},
	{
		type: 'string',
		src: [
			'cac:PayeeFinancialAccount',
			'cac:FinancialInstitutionBranch',
			'cbc:ID',
		],
		dest: ['ram:PayeeSpecifiedCreditorFinancialInstitution', 'ram:BICID'],
		fxProfileMask: FX_MASK_EN16931,
	},
];

export const cacTaxSubtotal: Transformation[] = [
	{
		type: 'string',
		src: ['cbc:TaxAmount'],
		dest: ['ram:CalculatedAmount'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cac:TaxCategory', 'cac:TaxScheme', 'cbc:ID'],
		dest: ['ram:TypeCode'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cac:TaxCategory', 'cbc:TaxExemptionReason'],
		dest: ['ram:ExemptionReason'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cbc:TaxableAmount'],
		dest: ['ram:BasisAmount'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cac:TaxCategory', 'cbc:ID'],
		dest: ['ram:CategoryCode'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cac:TaxCategory', 'cbc:TaxExemptionReasonCode'],
		dest: ['ram:ExemptionReasonCode'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['..', '..', 'cac:InvoicePeriod', 'cbc:DescriptionCode'],
		dest: ['ram:DueDateTypeCode'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
	{
		type: 'string',
		src: ['cac:TaxCategory', 'cbc:Percent'],
		dest: ['ram:RateApplicablePercent'],
		fxProfileMask: FX_MASK_BASIC_WL,
	},
];

export const cacInvoicePeriod: Transformation = {
	type: 'object',
	src: ['cac:InvoicePeriod'],
	dest: ['ram:ApplicableHeaderTradeSettlement', 'ram:BillingSpecifiedPeriod'],
	children: [
		{
			type: 'string',
			subtype: 'DateTimeString',
			src: ['cbc:StartDate'],
			dest: ['ram:StartDateTime', 'udt:DateTimeString'],
			fxProfileMask: FX_MASK_BASIC_WL,
		},
		{
			type: 'string',
			src: ['cbc:StartDate', 'fixed:102'],
			dest: ['ram:StartDateTime', 'udt:DateTimeString@format'],
			fxProfileMask: FX_MASK_BASIC_WL,
		},
		{
			type: 'string',
			subtype: 'DateTimeString',
			src: ['cbc:EndDate'],
			dest: ['ram:EndDateTime', 'udt:DateTimeString'],
			fxProfileMask: FX_MASK_BASIC_WL,
		},
		{
			type: 'string',
			src: ['cbc:EndDate', 'fixed:102'],
			dest: ['ram:EndDateTime', 'udt:DateTimeString@format'],
			fxProfileMask: FX_MASK_BASIC_WL,
		},
	],
	fxProfileMask: FX_MASK_MINIMUM,
};

// Document-level allowances and charges.
export const cacAllowanceCharge: Transformation = {
	type: 'array',
	src: ['cac:AllowanceCharge'],
	dest: [
		'ram:ApplicableHeaderTradeSettlement',
		'ram:SpecifiedTradeAllowanceCharge',
	],
	children: [
		{
			type: 'string',
			src: ['cbc:ChargeIndicator'],
			dest: ['ram:ChargeIndicator', 'udt:Indicator'],
			fxProfileMask: FX_MASK_BASIC_WL,
		},
		{
			type: 'string',
			src: ['cbc:MultiplierFactorNumeric'],
			dest: ['ram:CalculationPercent'],
			fxProfileMask: FX_MASK_BASIC_WL,
		},
		{
			type: 'string',
			src: ['cbc:BaseAmount'],
			dest: ['ram:BasisAmount'],
			fxProfileMask: FX_MASK_BASIC_WL,
		},
		{
			type: 'string',
			src: ['cbc:Amount'],
			dest: ['ram:ActualAmount'],
			fxProfileMask: FX_MASK_BASIC_WL,
		},
		{
			type: 'string',
			src: ['cbc:AllowanceChargeReasonCode'],
			dest: ['ram:ReasonCode'],
			fxProfileMask: FX_MASK_BASIC_WL,
		},
		{
			type: 'string',
			src: ['cbc:AllowanceChargeReason'],
			dest: ['ram:Reason'],
			fxProfileMask: FX_MASK_BASIC_WL,
		},
		// FIXME! Next 3 can go into a separate object!
		{
			type: 'string',
			src: ['cac:TaxCategory', 'cac:TaxScheme', 'cbc:ID'],
			dest: ['ram:CategoryTradeTax', 'ram:TypeCode'],
			fxProfileMask: FX_MASK_BASIC_WL,
		},
		{
			type: 'string',
			src: ['cac:TaxCategory', 'cbc:ID'],
			dest: ['ram:CategoryTradeTax', 'ram:CategoryCode'],
			fxProfileMask: FX_MASK_BASIC_WL,
		},
		{
			type: 'string',
			src: ['cac:TaxCategory', 'cbc:Percent'],
			dest: ['ram:CategoryTradeTax', 'ram:RateApplicablePercent'],
			fxProfileMask: FX_MASK_BASIC_WL,
		},
	],
	fxProfileMask: FX_MASK_MINIMUM,
};

export const cacLegalMonetaryTotal: Transformation = {
	type: 'object',
	src: ['cac:LegalMonetaryTotal'],
	dest: [
		'ram:ApplicableHeaderTradeSettlement',
		'ram:SpecifiedTradeSettlementHeaderMonetarySummation',
	],
	children: [
		{
			type: 'string',
			src: ['cbc:LineExtensionAmount'],
			dest: ['ram:LineTotalAmount'],
			fxProfileMask: FX_MASK_BASIC_WL,
		},
		{
			type: 'string',
			src: ['cbc:ChargeTotalAmount'],
			dest: ['ram:ChargeTotalAmount'],
			fxProfileMask: FX_MASK_BASIC_WL,
		},
		{
			type: 'string',
			src: ['cbc:AllowanceTotalAmount'],
			dest: ['ram:AllowanceTotalAmount'],
			fxProfileMask: FX_MASK_BASIC_WL,
		},
		{
			type: 'string',
			src: ['cbc:TaxExclusiveAmount'],
			dest: ['ram:TaxBasisTotalAmount'],
			fxProfileMask: FX_MASK_MINIMUM,
		},
		{
			type: 'array',
			src: ['..', 'cac:TaxTotal'],
			dest: ['ram:TaxTotalAmount'],
			children: [
				{
					type: 'object',
					src: [],
					dest: [],
					children: [
						{
							type: 'string',
							src: ['cbc:TaxAmount'],
							dest: ['#'],
							fxProfileMask: FX_MASK_MINIMUM,
						},
						{
							type: 'string',
							src: ['cbc:TaxAmount@currencyID'],
							dest: ['#@currencyID'],
							fxProfileMask: FX_MASK_MINIMUM,
						},
					],
					fxProfileMask: FX_MASK_MINIMUM,
				},
			],
			fxProfileMask: FX_MASK_MINIMUM,
		},
		{
			type: 'string',
			src: ['cbc:PayableRoundingAmount'],
			dest: ['ram:RoundingAmount'],
			fxProfileMask: FX_MASK_EN16931,
		},
		{
			type: 'string',
			src: ['cbc:TaxInclusiveAmount'],
			dest: ['ram:GrandTotalAmount'],
			fxProfileMask: FX_MASK_MINIMUM,
		},
		{
			type: 'string',
			src: ['cbc:PrepaidAmount'],
			dest: ['ram:TotalPrepaidAmount'],
			fxProfileMask: FX_MASK_BASIC_WL,
		},
		{
			type: 'string',
			src: ['cbc:PayableAmount'],
			dest: ['ram:DuePayableAmount'],
			fxProfileMask: FX_MASK_MINIMUM,
		},
	],
	fxProfileMask: FX_MASK_MINIMUM,
};

export const ublInvoice: Transformation = {
	type: 'object',
	src: ['ubl:Invoice'],
	dest: ['rsm:CrossIndustryInvoice'],
	children: [
		{
			type: 'string',
			src: ['cbc:ProfileID'],
			dest: [
				'rsm:ExchangedDocumentContext',
				'ram:BusinessProcessSpecifiedDocumentContextParameter',
				'ram:ID',
			],
			fxProfileMask: FX_MASK_MINIMUM,
		},
		{
			type: 'string',
			src: ['cbc:CustomizationID'],
			dest: [
				'rsm:ExchangedDocumentContext',
				'ram:GuidelineSpecifiedDocumentContextParameter',
				'ram:ID',
			],
			fxProfileMask: FX_MASK_MINIMUM,
		},
		{
			type: 'string',
			src: ['cbc:ID'],
			dest: ['rsm:ExchangedDocument', 'ram:ID'],
			fxProfileMask: FX_MASK_MINIMUM,
		},
		{
			type: 'string',
			src: ['cbc:InvoiceTypeCode'],
			dest: ['rsm:ExchangedDocument', 'ram:TypeCode'],
			fxProfileMask: FX_MASK_MINIMUM,
		},
		{
			type: 'string',
			subtype: 'DateTimeString',
			src: ['cbc:IssueDate'],
			dest: [
				'rsm:ExchangedDocument',
				'ram:IssueDateTime',
				'udt:DateTimeString',
			],
			fxProfileMask: FX_MASK_MINIMUM,
		},
		{
			type: 'string',
			src: ['cbc:IssueDate', 'fixed:102'],
			dest: [
				'rsm:ExchangedDocument',
				'ram:IssueDateTime',
				'udt:DateTimeString@format',
			],
			fxProfileMask: FX_MASK_MINIMUM,
		},
		{
			type: 'string',
			src: ['cbc:Note'],
			dest: ['rsm:ExchangedDocument', 'ram:IncludedNote', 'ram:Content'],
			fxProfileMask: FX_MASK_BASIC_WL,
		},
		{
			type: 'object',
			src: [],
			dest: ['rsm:SupplyChainTradeTransaction'],
			children: [
				cacInvoiceLine,
				{
					type: 'string',
					src: ['cbc:BuyerReference'],
					dest: ['ram:ApplicableHeaderTradeAgreement', 'ram:BuyerReference'],
					fxProfileMask: FX_MASK_MINIMUM,
				},
				{
					type: 'object',
					src: ['cac:AccountingSupplierParty', 'cac:Party'],
					dest: ['ram:ApplicableHeaderTradeAgreement', 'ram:SellerTradeParty'],
					children: cacAccountingSupplierParty,
					fxProfileMask: FX_MASK_MINIMUM,
				},
				{
					type: 'object',
					src: ['cac:AccountingCustomerParty', 'cac:Party'],
					dest: ['ram:ApplicableHeaderTradeAgreement', 'ram:BuyerTradeParty'],
					children: cacAccountingCustomerParty,
					fxProfileMask: FX_MASK_MINIMUM,
				},
				{
					type: 'string',
					src: ['cac:OrderReference', 'cbc:SalesOrderID'],
					dest: [
						'ram:ApplicableHeaderTradeAgreement',
						'ram:SellerOrderReferencedDocument',
						'ram:IssuerAssignedID',
					],
					fxProfileMask: FX_MASK_EN16931,
				},
				{
					type: 'string',
					src: ['cac:OrderReference', 'cbc:ID'],
					dest: [
						'ram:ApplicableHeaderTradeAgreement',
						'ram:BuyerOrderReferencedDocument',
						'ram:IssuerAssignedID',
					],
					fxProfileMask: FX_MASK_EXTENDED,
				},
				{
					type: 'string',
					src: ['cac:ContractDocumentReference', 'cbc:ID'],
					dest: [
						'ram:ApplicableHeaderTradeAgreement',
						'ram:ContractReferencedDocument',
						'ram:IssuerAssignedID',
					],
					fxProfileMask: FX_MASK_BASIC_WL,
				},
				{
					type: 'object',
					src: ['cac:AdditionalDocumentReference'],
					dest: [
						'ram:ApplicableHeaderTradeAgreement',
						'ram:AdditionalReferencedDocument',
					],
					children: cacAdditionalDocumentReference,
					fxProfileMask: FX_MASK_MINIMUM,
				},
				{
					type: 'string',
					src: ['cac:ProjectReference', 'cbc:ID'],
					dest: [
						'ram:ApplicableHeaderTradeAgreement',
						'ram:SpecifiedProcuringProject',
						'ram:ID',
					],
					fxProfileMask: FX_MASK_EXTENDED,
				},
				// CII requires both an ID and a name but UBL only defines the
				// ID.
				{
					type: 'string',
					src: ['cac:ProjectReference', 'cbc:ID'],
					dest: [
						'ram:ApplicableHeaderTradeAgreement',
						'ram:SpecifiedProcuringProject',
						'ram:Name',
					],
					fxProfileMask: FX_MASK_EXTENDED,
				},
				{
					type: 'object',
					src: [],
					dest: ['ram:ApplicableHeaderTradeDelivery'],
					children: [],
					fxProfileMask: FX_MASK_MINIMUM,
				},
				// FIXME! This is an array for CII.
				{
					type: 'string',
					src: ['cac:Delivery', 'cac:DeliveryLocation', 'cbc:ID'],
					dest: [
						'ram:ApplicableHeaderTradeDelivery',
						'ram:ShipToTradeParty',
						'udt:ID',
					],
					fxProfileMask: FX_MASK_BASIC_WL,
				},
				{
					type: 'string',
					src: [
						'cac:Delivery',
						'cac:DeliveryParty',
						'cac:PartyName',
						'cbc:Name',
					],
					dest: [
						'ram:ApplicableHeaderTradeDelivery',
						'ram:ShipToTradeParty',
						'ram:Name',
					],
					fxProfileMask: FX_MASK_BASIC_WL,
				},
				{
					type: 'object',
					src: ['cac:Delivery', 'cac:DeliveryLocation', 'cac:Address'],
					dest: [
						'ram:ApplicableHeaderTradeDelivery',
						'ram:ShipToTradeParty',
						'ram:PostalTradeAddress',
					],
					children: deliveryAddress,
					fxProfileMask: FX_MASK_MINIMUM,
				},
				{
					type: 'string',
					src: ['cac:DespatchDocumentReference', 'cbc:ID'],
					dest: [
						'ram:ApplicableHeaderTradeDelivery',
						'ram:DespatchAdviceReferencedDocument',
						'ram:IssuerAssignedID',
					],
					fxProfileMask: FX_MASK_BASIC_WL,
				},
				{
					type: 'string',
					src: ['cac:ReceiptDocumentReference', 'cbc:ID'],
					dest: [
						'ram:ReceivingAdviceReferencedDocument',
						'ram:IssuerAssignedID',
					],
					fxProfileMask: FX_MASK_BASIC_WL,
				},
				{
					type: 'string',
					src: ['cac:PayeeParty', 'cac:PartyIdentification', 'cbc:ID'],
					dest: [
						'ram:ApplicableHeaderTradeSettlement',
						'ram:CreditorReferenceID',
					],
					fxProfileMask: FX_MASK_BASIC_WL,
				},
				{
					type: 'string',
					src: ['cac:PaymentMeans', 'cbc:PaymentID'],
					dest: ['ram:ApplicableHeaderTradeSettlement', 'ram:PaymentReference'],
					fxProfileMask: FX_MASK_BASIC_WL,
				},
				{
					type: 'string',
					src: ['cbc:TaxCurrencyCode'],
					dest: ['ram:ApplicableHeaderTradeSettlement', 'ram:TaxCurrencyCode'],
					fxProfileMask: FX_MASK_BASIC_WL,
				},
				{
					type: 'string',
					src: ['cbc:DocumentCurrencyCode'],
					dest: [
						'ram:ApplicableHeaderTradeSettlement',
						'ram:InvoiceCurrencyCode',
					],
					fxProfileMask: FX_MASK_MINIMUM,
				},
				{
					type: 'object',
					src: ['cac:PayeeParty'],
					dest: ['ram:ApplicableHeaderTradeSettlement', 'ram:PayeeTradeParty'],
					children: cacPayeeParty,
					fxProfileMask: FX_MASK_MINIMUM,
				},
				{
					type: 'array',
					src: ['cac:PaymentMeans'],
					dest: [
						'ram:ApplicableHeaderTradeSettlement',
						'ram:SpecifiedTradeSettlementPaymentMeans',
					],
					children: cacPaymentMeans,
					fxProfileMask: FX_MASK_MINIMUM,
				},
				{
					type: 'array',
					src: ['cac:TaxTotal'],
					dest: [],
					children: [
						{
							type: 'array',
							src: ['cac:TaxSubtotal'],
							dest: [
								'ram:ApplicableHeaderTradeSettlement',
								'ram:ApplicableTradeTax',
							],
							children: cacTaxSubtotal,
							fxProfileMask: FX_MASK_MINIMUM,
						},
					],
					fxProfileMask: FX_MASK_MINIMUM,
				},
				cacInvoicePeriod,
				cacAllowanceCharge,
				{
					type: 'string',
					src: ['cac:PaymentTerms', 'cbc:Note'],
					dest: [
						'ram:ApplicableHeaderTradeSettlement',
						'ram:SpecifiedTradePaymentTerms',
						'ram:Description',
					],
					fxProfileMask: FX_MASK_EN16931,
				},
				{
					type: 'string',
					subtype: 'DateTimeString',
					src: ['cbc:DueDate'],
					dest: [
						'ram:ApplicableHeaderTradeSettlement',
						'ram:SpecifiedTradePaymentTerms',
						'ram:DueDateDateTime',
						'udt:DateTimeString',
					],
					fxProfileMask: FX_MASK_BASIC_WL,
				},
				{
					type: 'string',
					src: ['cbc:DueDate', 'fixed:102'],
					dest: [
						'ram:ApplicableHeaderTradeSettlement',
						'ram:SpecifiedTradePaymentTerms',
						'ram:DueDateDateTime',
						'udt:DateTimeString@format',
					],
					fxProfileMask: FX_MASK_BASIC_WL,
				},
				{
					type: 'string',
					src: ['cac:PaymentMeans', 'cac:PaymentMandate', 'cbc:ID'],
					dest: [
						'ram:ApplicableHeaderTradeSettlement',
						'ram:SpecifiedTradePaymentTerms',
						'ram:DirectDebitMandateID',
					],
					fxProfileMask: FX_MASK_BASIC_WL,
				},
				cacLegalMonetaryTotal,
				{
					type: 'array',
					src: ['cac:BillingReference'],
					dest: [
						'ram:ApplicableHeaderTradeSettlement',
						'ram:InvoiceReferencedDocument',
					],
					children: [
						{
							type: 'string',
							src: ['cbc:ID'],
							dest: ['ram:IssuerAssignedID'],
							fxProfileMask: FX_MASK_BASIC_WL,
						},
						{
							type: 'string',
							src: ['cbc:IssueDate'],
							dest: ['ram:FormattedIssueDateTime', 'udt:DateTimeString'],
							fxProfileMask: FX_MASK_BASIC_WL,
						},
						{
							type: 'string',
							src: ['cbc:IssueDate', 'fixed:102'],
							dest: ['ram:FormattedIssueDateTime', 'udt:DateTimeString@format'],
							fxProfileMask: FX_MASK_BASIC_WL,
						},
					],
					fxProfileMask: FX_MASK_MINIMUM,
				},
				{
					type: 'string',
					src: ['cbc:AccountingCost'],
					dest: ['ram:ReceivableSpecifiedTradeAccountingAccount', 'ram:ID'],
					fxProfileMask: FX_MASK_BASIC_WL,
				},
			],
			fxProfileMask: FX_MASK_MINIMUM,
		},
	],
	fxProfileMask: FX_MASK_MINIMUM,
};

export class FormatCIIService
	extends FormatUBLService
	implements EInvoiceFormat {
	get customizationID(): string {
		return 'urn:cen.eu:en16931:2017';
	}

	get profileID(): string {
		return 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0';
	}

	get syntax(): 'CII' {
		return 'CII';
	}

	get fxProfile(): FXProfile {
		return FULL_CII;
	}

	async generate(
		invoice: Invoice,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_options: InvoiceServiceOptions,
	): Promise<string | Uint8Array> {
		const cii: ObjectNode = {};

		this.convert(invoice, '$', cii, '$', [ublInvoice]);

		cii['rsm:CrossIndustryInvoice@xmlns:xsi'] =
			'http://www.w3.org/2001/XMLSchema-instance';
		cii['rsm:CrossIndustryInvoice@xsi:schemaLocation'] =
			'urn:un:unece:uncefact:data' +
			':standard:CrossIndustryInvoice:100' +
			' ../schema/D16B%20SCRDM%20(Subset)/uncoupled%20clm/CII/uncefact' +
			'/data/standard/CrossIndustryInvoice_100pD16B.xsd';
		cii['rsm:CrossIndustryInvoice@xmlns:qdt'] =
			'urn:un:unece:uncefact:data:standard:QualifiedDataType:100';
		cii['rsm:CrossIndustryInvoice@xmlns:udt'] =
			'urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100';
		cii['rsm:CrossIndustryInvoice@xmlns:rsm'] =
			'urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100';
		cii['rsm:CrossIndustryInvoice@xmlns:ram'] =
			'urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100';

		return this.renderXML(cii);
	}

	private convert(
		invoice: Invoice,
		srcPath: string,
		dest: ObjectNode,
		destPath: string,
		transformations: Transformation[],
	) {
		for (const transformation of transformations) {
			if (!(this.fxProfile & transformation.fxProfileMask)) {
				continue;
			}

			const lastSrcKey = transformation.src[transformation.src.length - 1];
			let src: any;
			let childSrcPath: string;
			// Avoid writing attribute values for non-existing nodes.
			if (
				transformation.src.length &&
				lastSrcKey.startsWith('fixed:') &&
				transformation.dest.length &&
				transformation.dest[transformation.dest.length - 1].includes('@')
			) {
				const parentPaths = [...transformation.dest];
				parentPaths[parentPaths.length - 1] = parentPaths[
					parentPaths.length - 1
				].replace(/@.+/, '');
				const parentPath = this.applySubPaths(destPath, parentPaths);
				const parents = jsonpath.JSONPath({ path: parentPath, json: dest });
				if (Array.isArray(parents) && parents.length === 0) {
					continue;
				}
				src = lastSrcKey.substring(6);
				childSrcPath = srcPath;
			} else {
				childSrcPath = this.applySubPaths(srcPath, transformation.src);
				const srcs = jsonpath.JSONPath({ path: childSrcPath, json: invoice });
				if (Array.isArray(srcs) && srcs.length === 0) {
					continue;
				}
				src = srcs[0];
			}

			const childDestPath = this.applySubPaths(destPath, transformation.dest);

			switch (transformation.type) {
				case 'object':
					if (!transformation.children.length) {
						// Special case.  Force the element to exist.
						this.vivifyDest(dest, childDestPath, {});
					} else {
						this.convert(
							invoice,
							childSrcPath,
							dest,
							childDestPath,
							transformation.children,
						);
					}
					break;
				case 'array':
					for (let i = 0; i < src.length; ++i) {
						const arraySrcPath = `${childSrcPath}[${i}]`;
						const arrayDestPath = transformation.dest.length
							? `${childDestPath}[${i}]`
							: childDestPath;
						this.convert(
							invoice,
							arraySrcPath,
							dest,
							arrayDestPath,
							transformation.children,
						);
					}
					break;
				case 'string':
					this.vivifyDest(
						dest,
						childDestPath,
						this.renderValue(src, transformation),
					);

					break;
			}
		}
	}

	private applySubPaths(path: string, subPaths: string[]) {
		for (const subPath of subPaths) {
			// FIXME! The first two branches seem to be dead code.
			if (subPath === '..') {
				path = path.replace(/[[.][^[.]+$/, '');
			} else if (subPath.startsWith('@')) {
				const match = path.match(/^(.*?)(\[[0-9]+\])$/);
				if (match) {
					const basePath = match[1]; // The part before the brackets
					const indexPart = match[2] || ''; // The brackets with the number, if they exist

					path = `${basePath}${subPath}${indexPart}`;
				} else {
					path += subPath;
				}
			} else {
				path += `.${subPath}`;
			}
		}

		return path;
	}

	private vivifyDest(
		dest: ObjectNode,
		path: string,
		value: string | ObjectNode,
	) {
		const indices = path.replace(/\[([0-9]+)\]/g, '.$1').split('.');

		if (indices[0] === '$') {
			indices.shift();
		}

		for (let i = 0; i < indices.length - 1; ++i) {
			const key = indices[i];
			const nextIndex = indices[i + 1];

			const isNextArrayIndex = nextIndex.match(/^[0-9]+$/);

			if (isNextArrayIndex) {
				dest[key] ??= [];
			} else {
				dest[key] ??= {};
			}

			dest = dest[key] as ObjectNode;
		}

		dest[indices[indices.length - 1]] = value;
	}

	private renderValue(value: string, transformation: Transformation): string {
		if (transformation.subtype === 'DateTimeString') {
			return value.replaceAll('-', '');
		} else {
			return value;
		}
	}
}
