import { Injectable } from '@nestjs/common';

import { FormatUBLService } from './format-ubl.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';
import { Invoice } from '../invoice/invoice.interface';

// This is what we are looking at while traversing the input tree:
export type Node = { [key: string]: Node } | Node[] | string;
export type ObjectNode = { [key: string]: Node };

// Flags for Factur-X usage.
export type FXProfile =
	| 0x0
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
	| 0x1f;
export const FULL_CII: FXProfile = 0x0; // Field not allowed for Factur-X.
export const FX_EXTENDED: FXProfile = 0x1;
export const FX_EN16931: FXProfile = 0x2;
export const FX_BASIC: FXProfile = 0x4;
export const FX_BASIC_WL: FXProfile = 0x8;
export const FX_MINIMUM: FXProfile = 0x10;

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
			fxProfile?: never;
	  }
	| {
			type: 'string';
			subtype?: SubType;
			src: string[];
			dest: string[];
			children?: never;
			fxProfile: FXProfile;
	  };

const cacAdditionalItemProperty: Transformation = {
	type: 'object',
	src: ['cac:AdditionalItemProperty'],
	dest: ['ram:ApplicableProductCharacteristic'],
	children: [
		{
			type: 'string',
			src: ['cii:TypeCode'],
			dest: ['ram:TypeCode'],
			fxProfile: FX_EXTENDED,
		},
		{
			type: 'string',
			src: ['cbc:Name'],
			dest: ['ram:Description'],
			fxProfile: FX_EN16931,
		},
		{
			type: 'string',
			src: ['cii:ValueMeasure'],
			dest: ['ram:ValueMeasure'],
			fxProfile: FX_EXTENDED,
		},
		{
			type: 'string',
			src: ['cii:ValueMeasure@unitCode'],
			dest: ['ram:ValueMeasure@unitCode'],
			fxProfile: FX_EXTENDED,
		},
		{
			type: 'string',
			src: ['cbc:Value'],
			dest: ['ram:Value'],
			fxProfile: FX_EN16931,
		},
	],
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
			fxProfile: FX_EN16931,
		},
		{
			type: 'string',
			src: ['cii:ListVersionID'],
			dest: ['ram:ClassCode', 'ram:ListVersionID'],
			fxProfile: FX_EN16931,
		},
		{
			type: 'string',
			src: ['cii:ClassName'],
			dest: ['ram:ClassName'],
			fxProfile: FX_EXTENDED,
		},
	],
};

const ciiIndividualTradeProductInstance: Transformation = {
	type: 'object',
	src: [],
	dest: ['ram:IndividualTradeProductInstance'],
	children: [
		{
			type: 'string',
			src: ['cii:BatchID'],
			dest: ['ram:BatchID'],
			fxProfile: FX_EXTENDED,
		},
	],
};

const cacItem: Transformation = {
	type: 'object',
	src: ['cac:Item'],
	dest: ['ram:SpecifiedTradeProduct'],
	children: [
		{
			type: 'string',
			src: ['cii:SpecifiedTradeProductID'],
			dest: ['ram:ID'],
			fxProfile: FULL_CII,
		},
		{
			type: 'string',
			src: ['cac:StandardItemIdentification', 'cbc:ID'],
			dest: ['ram:GlobalID'],
			fxProfile: FX_BASIC,
		},
		{
			type: 'string',
			src: ['cac:StandardItemIdentification', 'cbc:ID@schemeID'],
			dest: ['ram:GlobalID@schemeID'],
			fxProfile: FX_BASIC,
		},
		{
			type: 'string',
			src: ['cac:SellersItemIdentification', 'cbc:ID'],
			dest: ['ram:SellerAssignedID'],
			fxProfile: FX_EN16931,
		},
		{
			type: 'string',
			src: ['cac:BuyersItemIdentification', 'cbc:ID'],
			dest: ['ram:BuyerAssignedID'],
			fxProfile: FX_EN16931,
		},
		{
			type: 'string',
			src: ['cbc:Name'],
			dest: ['ram:Name'],
			fxProfile: FX_BASIC,
		},
		{
			type: 'string',
			src: ['cbc:Description'],
			dest: ['ram:Description'],
			fxProfile: FX_EN16931,
		},
		cacAdditionalItemProperty,
		cacCommodityClassification,
		ciiIndividualTradeProductInstance,
		{
			type: 'string',
			src: ['cac:OriginCountry', 'cbc:IdentificationCode'],
			dest: ['ram:OriginTradeCountry', 'ram:ID'],
			fxProfile: FX_EN16931,
		},
	],
};

const cacOrderLineReference: Transformation = {
	type: 'object',
	src: ['cac:OrderLineReference'],
	dest: ['ram:SpecifiedLineTradeAgreement'],
	children: [
		{
			type: 'string',
			src: ['cii:BuyerOrderReferencedDocumentID'],
			dest: ['ram:BuyerOrderReferencedDocument', 'ram:IssuerAssignedID'],
			fxProfile: FX_EXTENDED,
		},
		{
			type: 'string',
			src: ['cbc:LineID'],
			dest: ['ram:BuyerOrderReferencedDocument', 'ram:LineID'],
			fxProfile: FX_EN16931,
		},
		{
			type: 'string',
			src: ['cii:FormattedIssueDateTime'],
			dest: [
				'ram:BuyerOrderReferencedDocument',
				'ram:FormattedIssueDateTime',
				'udt:DateTimeString',
			],
			fxProfile: FX_EXTENDED,
		},
		{
			type: 'string',
			src: ['cii:FormattedIssueDateTime', 'fixed:102'],
			dest: [
				'ram:BuyerOrderReferencedDocument',
				'ram:FormattedIssueDateTime',
				'udt:DateTimeString@format',
			],
			fxProfile: FX_EXTENDED,
		},
	],
};

const cacPrice: Transformation = {
	type: 'object',
	src: ['cac:Price'],
	dest: [],
	children: [
		{
			type: 'string',
			src: ['cac:AllowanceCharge', 'cbc:BaseAmount'],
			dest: ['ram:GrossProductTradePrice', 'ram:ChargeAmount'],
			fxProfile: FX_EN16931,
		},
		{
			type: 'string',
			src: ['cbc:BasisQuantity'],
			dest: ['ram:GrossProductTradePrice', 'ram:BasisQuantity'],
			fxProfile: FX_EN16931,
		},
		{
			type: 'string',
			src: ['cbc:BasisQuantity@unitCode'],
			dest: ['ram:GrossProductTradePrice', 'ram:BasisQuantity@unitCode'],
			fxProfile: FX_EN16931,
		},
		{
			type: 'string',
			src: ['cac:AllowanceCharge', 'cbc:ChargeIndicator'],
			dest: [
				'ram:GrossProductTradePrice',
				'ram:AppliedTradeAllowanceCharge',
				'ram:ChargeIndicator',
				'udt:Indicator',
			],
			fxProfile: FX_EN16931,
		},
		{
			type: 'string',
			src: ['cac:AllowanceCharge', 'cbc:Amount'],
			dest: [
				'ram:GrossProductTradePrice',
				'ram:AppliedTradeAllowanceCharge',
				'ram:ActualAmount',
			],
			fxProfile: FX_EN16931,
		},
		{
			type: 'string',
			src: ['cac:AllowanceCharge', 'cbc:Amount@currencyID'],
			dest: [
				'ram:GrossProductTradePrice',
				'ram:AppliedTradeAllowanceCharge',
				'ram:ActualAmount@currencyID',
			],
			fxProfile: FX_EN16931,
		},
		{
			type: 'string',
			src: ['cac:AllowanceCharge', 'cii:ReasonCode'],
			dest: [
				'ram:GrossProductTradePrice',
				'ram:AppliedTradeAllowanceCharge',
				'ram:ReasonCode',
			],
			fxProfile: FX_EN16931,
		},
		{
			type: 'string',
			src: ['cac:AllowanceCharge', 'cii:Reason'],
			dest: [
				'ram:GrossProductTradePrice',
				'ram:AppliedTradeAllowanceCharge',
				'ram:Reason',
			],
			fxProfile: FX_EN16931,
		},
		{
			type: 'string',
			src: ['cbc:PriceAmount'],
			dest: ['ram:NetProductTradePrice', 'ram:ChargeAmount'],
			fxProfile: FX_EN16931,
		},
	],
};

const cacInvoiceLinePeriod: Transformation[] = [
	{
		type: 'string',
		src: ['cbc:StartDate'],
		dest: ['ram:StartDateTime', 'udt:DateTimeString'],
		fxProfile: FX_EN16931,
	},
	{
		type: 'string',
		src: ['cbc:StartDate', 'fixed:102'],
		dest: [
			'ram:StartDateTime',
			'udt:DateTimeString',
			'udt:DateTimeString@format',
		],
		fxProfile: FX_EN16931,
	},
	{
		type: 'string',
		src: ['cbc:EndDate'],
		dest: ['ram:EndDateTime', 'udt:DateTimeString'],
		fxProfile: FX_EN16931,
	},
	{
		type: 'string',
		src: ['cbc:EndDate', 'fixed:102'],
		dest: [
			'ram:EndDateTime',
			'udt:DateTimeString',
			'udt:DateTimeString@format',
		],
		fxProfile: FX_EN16931,
	},
];

const cacInvoiceLineAllowanceCharge: Transformation = {
	type: 'object',
	src: ['cac:AllowanceCharge'],
	dest: ['ram:SpecifiedTradeAllowanceCharge'],
	children: [
		{
			type: 'string',
			src: ['cbc:ChargeIndicator'],
			dest: ['ram:ChargeIndicator', 'udt:Indicator'],
			fxProfile: FX_BASIC,
		},
		{
			type: 'string',
			src: ['cbc:MultiplierFactorNumeric'],
			dest: ['ram:CalculationPercent'],
			fxProfile: FX_BASIC,
		},
		{
			type: 'string',
			src: ['cbc:BaseAmount'],
			dest: ['ram:BasisAmount'],
			fxProfile: FX_BASIC,
		},
		{
			type: 'string',
			src: ['cbc:BaseAmount@currencyID'],
			dest: ['ram:BasisAmount@currencyID'],
			fxProfile: FX_BASIC,
		},
		{
			type: 'string',
			src: ['cbc:Amount'],
			dest: ['ram:ActualAmount'],
			fxProfile: FX_BASIC,
		},
		{
			type: 'string',
			src: ['cbc:Amount@currencyID'],
			dest: ['ram:ActualAmount@currencyID'],
			fxProfile: FX_BASIC,
		},
		{
			type: 'string',
			src: ['cbc:AllowanceChargeReasonCode'],
			dest: ['ram:ReasonCode'],
			fxProfile: FX_BASIC,
		},
		{
			type: 'string',
			src: ['cbc:AllowanceChargeReason'],
			dest: ['ram:Reason'],
			fxProfile: FX_BASIC,
		},
	],
};

const cacInvoiceLine: Transformation = {
	type: 'array',
	src: ['cac:InvoiceLine'],
	dest: [
		'rsm:SupplyChainTradeTransaction',
		'ram:IncludedSupplyChainTradeLineItem',
	],
	children: [
		{
			type: 'string',
			src: ['cbc:ID'],
			dest: ['ram:AssociatedDocumentLineDocument', 'ram:LineID'],
			fxProfile: FX_BASIC,
		},
		{
			type: 'string',
			src: ['cii:ParentLineID'],
			dest: ['ram:AssociatedDocumentLineDocument', 'ram:ParentLineID'],
			fxProfile: FULL_CII,
		},
		{
			type: 'string',
			src: ['cii:LineStatusCode'],
			dest: ['ram:AssociatedDocumentLineDocument', 'ram:LineStatusCode'],
			fxProfile: FX_EXTENDED,
		},
		{
			type: 'string',
			src: ['cii:IncludedNoteContentCode'],
			dest: [
				'ram:AssociatedDocumentLineDocument',
				'ram:IncludedNote',
				'udt:ContentCode',
			],
			fxProfile: FX_EXTENDED,
		},
		{
			type: 'string',
			src: ['cbc:Note'],
			dest: [
				'ram:AssociatedDocumentLineDocument',
				'ram:IncludedNote',
				'ram:Content',
			],
			fxProfile: FX_BASIC_WL,
		},
		{
			type: 'string',
			src: ['cii:IncludedNoteSubjectCode'],
			dest: [
				'ram:AssociatedDocumentLineDocument',
				'ram:IncludedNote',
				'udt:SubjectCode',
			],
			fxProfile: FX_BASIC_WL,
		},
		cacItem,
		cacOrderLineReference,
		cacPrice,
		{
			type: 'string',
			src: ['cbc:InvoicedQuantity'],
			dest: ['ram:SpecifiedLineTradeDelivery', 'ram:BilledQuantity'],
			fxProfile: FX_BASIC,
		},
		{
			type: 'string',
			src: ['cbc:InvoicedQuantity@unitCode'],
			dest: ['ram:SpecifiedLineTradeDelivery', 'ram:BilledQuantity@unitCode'],
			fxProfile: FX_BASIC,
		},
		{
			type: 'string',
			src: ['cac:Item', 'cac:ClassifiedTaxCategory', 'cac:TaxScheme', 'cbc:ID'],
			dest: [
				'ram:SpecifiedLineTradeSettlement',
				'ApplicableTradeTax',
				'ram:TypeCode',
			],
			fxProfile: FX_BASIC,
		},
		{
			type: 'string',
			src: ['cac:Item', 'cac:ClassifiedTaxCategory', 'cbc:ID'],
			dest: [
				'ram:SpecifiedLineTradeSettlement',
				'ApplicableTradeTax',
				'ram:CategoryCode',
			],
			fxProfile: FX_BASIC,
		},
		{
			type: 'string',
			src: ['cac:Item', 'cac:ClassifiedTaxCategory', 'cbc:Percent'],
			dest: [
				'ram:SpecifiedLineTradeSettlement',
				'ApplicableTradeTax',
				'ram:RateApplicablePercent',
			],
			fxProfile: FX_BASIC,
		},
		...cacInvoiceLinePeriod,
		cacInvoiceLineAllowanceCharge,
	],
};

export const ublInvoice: Transformation = {
	type: 'object',
	src: ['ubl:Invoice'],
	dest: ['rsm:CrossIndustryInvoice'],
	children: [
		{
			type: 'string',
			src: ['cii:TestIndicator'],
			dest: [
				'rsm:ExchangedDocumentContext',
				'ram:TestIndicator',
				'udt:Indicator',
			],
			fxProfile: FX_EXTENDED,
		},
		{
			type: 'string',
			src: ['cbc:ProfileID'],
			dest: [
				'rsm:ExchangedDocumentContext',
				'ram:BusinessProcessSpecifiedDocumentContextParameter',
				'ram:ID',
			],
			fxProfile: FX_MINIMUM,
		},
		{
			type: 'string',
			src: ['cbc:CustomizationID'],
			dest: [
				'rsm:ExchangedDocumentContext',
				'ram:GuidelineSpecifiedDocumentContextParameter',
				'ram:ID',
			],
			fxProfile: FX_MINIMUM,
		},
		{
			type: 'string',
			src: ['cbc:ID'],
			dest: ['ram:ExchangedDocument', 'ram:ID'],
			fxProfile: FX_MINIMUM,
		},
		{
			type: 'string',
			src: ['cii:Name'],
			dest: ['ram:ExchangedDocument', 'ram:Name'],
			fxProfile: FX_EXTENDED,
		},
		{
			type: 'string',
			subtype: 'DateTimeString',
			src: ['cbc:IssueDate'],
			dest: [
				'ram:ExchangedDocument',
				'ram:IssueDateTime',
				'udt:DateTimeString',
			],
			fxProfile: FX_MINIMUM,
		},
		{
			type: 'string',
			src: ['cbc:IssueDate', 'fixed:102'],
			dest: [
				'ram:ExchangedDocument',
				'ram:IssueDateTime',
				'udt:DateTimeString@format',
			],
			fxProfile: FX_MINIMUM,
		},
		{
			type: 'string',
			src: ['cii:CopyIndicator'],
			dest: ['ram:ExchangedDocument', 'ram:CopyIndicator', 'udt:Indicatory'],
			fxProfile: FX_EXTENDED,
		},
		{
			type: 'array',
			src: [],
			dest: [],
			children: [
				{
					type: 'string',
					src: ['cii:LanguageID'],
					dest: ['ram:ExchangedDocument', 'ram:LanguageID'],
					fxProfile: FX_EXTENDED,
				},
			],
		},
		{
			type: 'string',
			src: ['cii:IncludedNoteContentCode'],
			dest: ['ram:ExchangedDocument', 'ram:IncludedNote', 'udt:ContentCode'],
			fxProfile: FX_EXTENDED,
		},
		{
			type: 'string',
			src: ['cbc:Note'],
			dest: ['ram:ExchangedDocument', 'ram:IncludedNote', 'ram:Content'],
			fxProfile: FX_BASIC_WL,
		},
		{
			type: 'string',
			src: ['cii:IncludedNoteSubjectCode'],
			dest: ['ram:ExchangedDocument', 'ram:IncludedNote', 'udt:SubjectCode'],
			fxProfile: FX_BASIC_WL,
		},
		{
			type: 'string',
			subtype: 'DateTimeString',
			src: ['cii:EffectiveSpecifiedPeriod'],
			dest: [
				'ram:ExchangedDocument',
				'ram:EffectiveSpecifiedPeriod',
				'ram:CompleteDateTime',
				'udt:DateTimeString',
			],
			fxProfile: FX_EXTENDED,
		},
		{
			type: 'string',
			src: ['cii:EffectiveSpecifiedPeriod', 'fixed:102'],
			dest: [
				'ram:ExchangedDocument',
				'ram:EffectiveSpecifiedPeriod',
				'ram:CompleteDateTime',
				'udt:DateTimeString@format',
			],
			fxProfile: FX_MINIMUM,
		},
		cacInvoiceLine,
	],
};

@Injectable()
export class FormatCIIService
	extends FormatUBLService
	implements EInvoiceFormat
{
	get customizationID(): string {
		return 'urn:cen.eu:en16931:2017';
	}

	get profileID(): string {
		return 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0';
	}

	get syntax(): 'CII' {
		return 'CII';
	}

	generate(invoice: Invoice): string {
		const cii: Node = {};
		this.convert(invoice as unknown as ObjectNode, cii, [ublInvoice]);

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
			'urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEn';

		return this.render(cii, {
			prettyPrint: true,
			indent: '\t',
		});
	}

	private convert(
		src: ObjectNode,
		dest: ObjectNode,
		transformations: Transformation[],
	) {
		for (const transformation of transformations) {
			const childSrc = this.resolveSrc(src, transformation.src);
			if (!childSrc) continue;
			const srcKey = transformation.src[transformation.src.length - 1];
			if (!(srcKey in childSrc)) continue;

			const childDest = this.resolveDest(dest, transformation.dest);
			const destKey = transformation.dest[transformation.dest.length - 1];

			switch (transformation.type) {
				case 'object':
					childDest[destKey] ??= {};
					this.convert(
						childSrc[srcKey] as ObjectNode,
						childDest[destKey] as ObjectNode,
						transformation.children,
					);
					break;
				case 'array':
					childDest[destKey] ??= [];
					const groups = src[srcKey] as Node[];
					for (const group of groups) {
						const node: Node = {};
						(childDest[destKey] as Node[]).push(node);
						this.convert(group as ObjectNode, node, transformation.children);
					}
					break;
				case 'string':
					if (srcKey in childSrc) {
						childDest[destKey] = this.renderValue(
							childSrc[srcKey] as string,
							transformation,
						);
					}
					break;
				default:
					break;
			}
		}
	}

	private renderValue(value: string, transformation: Transformation): string {
		if (transformation.subtype === 'DateTimeString') {
			return value.replaceAll('-', '');
		} else {
			return value;
		}
	}

	private resolveSrc(ptr: ObjectNode, keys: string[]): ObjectNode | undefined {
		if (keys.length) {
			for (let i = 0; i < keys.length - 1; ++i) {
				const key = keys[i];

				if (key in ptr) {
					ptr = ptr[key] as ObjectNode;
				} else {
					return undefined;
				}
			}

			if (keys[keys.length - 1].startsWith('fixed:')) {
				const key = keys[keys.length - 1];
				return { [key]: key.substring(6) };
			}
		}

		return ptr;
	}

	private resolveDest(ptr: ObjectNode, keys: string[]) {
		if (keys.length) {
			for (let i = 0; i < keys.length - 1; ++i) {
				const key = keys[i];
				if (key in ptr) {
					ptr = ptr[key] as ObjectNode;
				} else {
					ptr[key] = {};
					ptr = ptr[key];
				}
			}
		}

		return ptr;
	}
}
