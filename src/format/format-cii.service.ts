import { Injectable } from '@nestjs/common';
import { ExpandObject } from 'xmlbuilder2/lib/interfaces';

import { FormatUBLService } from './format-ubl.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';
import { Invoice } from '../invoice/invoice.interface';

// This is what we are looking at while traversing the input tree:
type Node = { [key: string]: Node } | Node[] | 'string';
type ObjectNode = { [key: string]: Node };

type Transformation =
	| {
			type: 'object' | 'array';
			src: string[];
			dest: string[];
			children: Transformation[];
	  }
	| {
			type: 'string';
			src: string[];
			dest: string[];
			children?: never;
	  };

const ubl2cii: Transformation = {
	type: 'object',
	src: ['ubl:Invoice'],
	dest: ['rsm:CrossIndustryInvoice'],
	children: [
		{
			type: 'string',
			src: ['cbc:CustomizationID'],
			dest: [
				'rsm:ExchangedDocumentContext',
				'ram:GuidelineSpecifiedDocumentContextParameter',
				'ram:ID',
			],
		},
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
		return '';
	}

	get syntax(): 'CII' {
		return 'CII';
	}

	generate(invoice: Invoice): string {
		const cii: Node = {};
		this.convert(invoice as unknown as ObjectNode, cii, [ubl2cii]);
		const expandObject: ExpandObject = {
			'rsm:CrossIndustryInvoice': cii,
		};

		expandObject['rsm:CrossIndustryInvoice@xmlns:xsi'] =
			'http://www.w3.org/2001/XMLSchema-instance';
		expandObject['rsm:CrossIndustryInvoice@xsi:schemaLocation'] =
			'urn:un:unece:uncefact:data' +
			':standard:CrossIndustryInvoice:100' +
			' ../schema/D16B%20SCRDM%20(Subset)/uncoupled%20clm/CII/uncefact' +
			'/data/standard/CrossIndustryInvoice_100pD16B.xsd';
		expandObject['rsm:CrossIndustryInvoice@xmlns:qdt'] =
			'urn:un:unece:uncefact:data:standard:QualifiedDataType:100';
		expandObject['rsm:CrossIndustryInvoice@xmlns:udt'] =
			'urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100';
		expandObject['rsm:CrossIndustryInvoice@xmlns:rsm'] =
			'urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100';
		expandObject['rsm:CrossIndustryInvoice@xmlns:ram'] =
			'urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEn';

		return this.render(expandObject, {
			prettyPrint: true,
			indent: '\t',
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private convert(
		src: ObjectNode,
		dest: ObjectNode,
		transformations: Transformation[],
	) {
		for (const transformation of transformations) {
			const childSrc = this.resolveSrc(src, transformation.src);
			if (!childSrc) continue;

			const childDest = this.resolveDest(dest, transformation.dest);
			const srcKey = transformation.src[transformation.src.length - 1];
			const destKey = transformation.dest[transformation.dest.length - 1];

			switch (transformation.type) {
				case 'object':
					if (srcKey in childSrc) {
						childDest[destKey] ??= {};
						this.convert(
							childSrc[srcKey] as ObjectNode,
							childDest[destKey] as ObjectNode,
							transformation.children,
						);
					}
					break;
				case 'string':
					if (srcKey in childSrc) {
						childDest[destKey] = childSrc[srcKey];
					}
					break;
				default:
					break;
			}
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
