import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { FormatCIIService } from './format-cii.service';
import { FormatUBLService } from './format-ubl.service';
import { FormatXRECHNUNGUBLService } from './format-xrechnung-ubl.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';
import { SerializerService } from '../serializer/serializer.service';

export class FormatInfo {
	@ApiProperty({
		description: 'The name of the format',
		example: 'UBL',
	})
	name: string;

	@ApiProperty({
		description: 'The customization ID of the format',
		example: 'urn:cen.eu:en16931:2017',
	})
	customizationID: string;

	@ApiProperty({
		description: 'The profile ID of the format',
		example: 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0',
	})
	profileID: string;

	@ApiProperty({
		description: 'The appropriate MIME type of the format',
		example: 'application/xml',
	})
	mimeType: string;

	@ApiProperty({
		description: "The basic syntax of the format ('UBL' or 'CII')",
		example: 'UBL',
	})
	syntax: 'UBL' | 'CII';
}

@Injectable()
export class FormatFactoryService {
	private readonly formatServices: {
		[key: string]: new (...args: any[]) => EInvoiceFormat;
	} = {
		CII: FormatCIIService,
		UBL: FormatUBLService,
		'XRECHNUNG-UBL': FormatXRECHNUNGUBLService,
	};

	constructor(private readonly serializerService: SerializerService) {}

	listFormatServices(): FormatInfo[] {
		const infos: FormatInfo[] = [];

		for (const format in this.formatServices) {
			const FormatService = this.formatServices[format];

			const service = new FormatService(this.serializerService);
			infos.push({
				name: format,
				customizationID: service.customizationID,
				profileID: service.profileID,
				mimeType: service.mimeType,
				syntax: service.syntax,
			});
		}

		return infos;
	}

	createFormatService(format: string): EInvoiceFormat {
		const FormatService = this.formatServices[format];

		if (!FormatService) {
			throw new NotFoundException(`Format '${format}' not supported.`);
		}

		return new FormatService(this.serializerService);
	}
}
