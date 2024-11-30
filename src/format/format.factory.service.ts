import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { FormatCIIService } from './format-cii.service';
import { FormatFacturXExtendedService } from './format-factur-x-extended.service';
import { FormatUBLService } from './format-ubl.service';
import { FormatXRECHNUNGUBLService } from './format-xrechnung-ubl.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';
import { AppConfigService } from '../app-config/app-config.service';
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
		'Factur-X-Extended': FormatFacturXExtendedService,
		UBL: FormatUBLService,
		'XRECHNUNG-UBL': FormatXRECHNUNGUBLService,
	};
	private readonly formatServicesLookup: {
		[key: string]: new (...args: any[]) => EInvoiceFormat;
	} = {};

	constructor(
		private readonly appConfigService: AppConfigService,
		private readonly serializerService: SerializerService,
	) {
		for (const format in this.formatServices) {
			this.formatServicesLookup[format.toLowerCase()] =
				this.formatServices[format];
		}
	}

	listFormatServices(): FormatInfo[] {
		const infos: FormatInfo[] = [];

		for (const format in this.formatServices) {
			const FormatService = this.formatServices[format];

			const service = new FormatService(
				this.appConfigService,
				this.serializerService,
			);
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
		const FormatService = this.formatServicesLookup[format.toLowerCase()];

		if (!FormatService) {
			throw new NotFoundException(`Format '${format}' not supported.`);
		}

		return new FormatService(this.appConfigService, this.serializerService);
	}
}
