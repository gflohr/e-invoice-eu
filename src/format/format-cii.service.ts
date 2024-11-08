import { Injectable } from '@nestjs/common';

import { FormatUBLService } from './format-ubl.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';
import { Invoice } from '../invoice/invoice.interface';

// This is what we are looking at while traversing the input tree:
type Node = { [key: string]: Node } | Node[] | string;
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

const invoiceLine: Transformation = {
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
		},
		{
			type: 'string',
			src: ['cac:Item', 'cbc:Name'],
			dest: ['ram:SpecifiedTradeProduct', 'ram:Name'],
		},
	],
};

const ubl2cii: Transformation = {
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
		},
		{
			type: 'string',
			src: ['cbc:CustomizationID'],
			dest: [
				'rsm:ExchangedDocumentContext',
				'ram:GuidelineSpecifiedDocumentContextParameter',
				'ram:ID',
			],
		},
		invoiceLine,
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
		this.showStats();

		const cii: Node = {};
		this.convert(invoice as unknown as ObjectNode, cii, [ubl2cii]);

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

	private showStats() {
		const transformationNodes = this.countStringNodes(ubl2cii);
		console.log(`${transformationNodes} schema nodes mapped!`);
	}

	private countStringNodes(obj: any): number {
		let count = 0;

		if ('object' === typeof obj) {
			if (Array.isArray(obj)) {
				for (const child of obj) {
					count += this.countStringNodes(child);
				}
			} else {
				if (('type' in obj && obj.type === 'string') || '$ref' in obj) {
					++count;
				}

				for (const key in obj) {
					if (key !== 'dependentRequired') {
						count += this.countStringNodes(obj[key]);
					}
				}
			}
		}

		return count;
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
