import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { FormatCIIService } from './format-cii.service';
import { FormatFacturXBasicWLService } from './format-factur-x-basic-wl.service';
import { FormatFacturXBasicService } from './format-factur-x-basic.service';
import { FormatFacturXEN16931Service } from './format-factur-x-en16931.service';
import { FormatFacturXExtendedService } from './format-factur-x-extended.service';
import { FormatFacturXMinimumService } from './format-factur-x-minimum.service';
import { FormatFacturXXRechnungService } from './format-factur-x-xrechnung.service';
import { FormatUBLService } from './format-ubl.service';
import { FormatXRECHNUNGCIIService } from './format-xrechnung-cii.service';
import { FormatXRECHNUNGUBLService } from './format-xrechnung-ubl.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';
import { AppConfigService } from '../app-config/app-config.service';

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
		'Factur-X-Basic': FormatFacturXBasicService,
		'Factur-X-BasicWL': FormatFacturXBasicWLService,
		'Factur-X-EN16931': FormatFacturXEN16931Service,
		'Factur-X-Extended': FormatFacturXExtendedService,
		'Factur-X-Minimum': FormatFacturXMinimumService,
		'Factur-X-XRechnung': FormatFacturXXRechnungService,
		UBL: FormatUBLService,
		'XRECHNUNG-CII': FormatXRECHNUNGCIIService,
		'XRECHNUNG-UBL': FormatXRECHNUNGUBLService,
	};
	private readonly formatServicesLookup: {
		[key: string]: new (...args: any[]) => EInvoiceFormat;
	} = {};

	constructor(private readonly appConfigService: AppConfigService) {
		for (const format in this.formatServices) {
			this.formatServicesLookup[format.toLowerCase()] =
				this.formatServices[format];
		}
	}

	listFormatServices(): FormatInfo[] {
		const infos: FormatInfo[] = [];

		for (const format in this.formatServices) {
			const FormatService = this.formatServices[format];

			const service = new FormatService(this.appConfigService);
			infos.push({
				name: format,
				syntax: service.syntax,
				mimeType: service.mimeType,
				customizationID: service.customizationID,
				profileID: service.profileID,
			});
		}

		return infos;
	}

	createFormatService(format: string): EInvoiceFormat {
		const normalizedFormat = this.normalizeFormat(format);
		const FormatService = this.formatServicesLookup[normalizedFormat];

		if (!FormatService) {
			throw new NotFoundException(`Format '${format}' not supported.`);
		}

		return new FormatService(this.appConfigService);
	}

	normalizeFormat(format: string): string {
		format = format.toLowerCase();
		format = format.replace(/-comfort$/, '-en16931');
		format = format.replace(/-basic-wl$/, '-basic-wl');
		format = format.replace(/^zugferd-/, 'factur-x-');

		return format;
	}
}
