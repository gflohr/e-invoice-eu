import { Logger } from '../logger.interface';
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

export class FormatInfo {
	name: string;
	customizationID: string;
	profileID: string;
	mimeType: string;
	syntax: 'UBL' | 'CII';
}

export class FormatFactoryService {
	private readonly formatServices: {
		[key: string]: new (...args: any[]) => EInvoiceFormat;
	} = {
		CII: FormatCIIService,
		'Factur-X-Basic': FormatFacturXBasicService,
		'Factur-X-Basic WL': FormatFacturXBasicWLService,
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

	constructor() {
		for (const format in this.formatServices) {
			this.formatServicesLookup[format.toLowerCase()] =
				this.formatServices[format];
		}
	}

	listFormatServices(): FormatInfo[] {
		const infos: FormatInfo[] = [];

		for (const format in this.formatServices) {
			const FormatService = this.formatServices[format];

			const service = new FormatService();
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

	createFormatService(format: string, logger: Logger): EInvoiceFormat {
		const normalizedFormat = this.normalizeFormat(format);
		const FormatService = this.formatServicesLookup[normalizedFormat];

		if (!FormatService) {
			throw new Error(`Format '${format}' not supported.`);
		}

		return new FormatService(logger);
	}

	normalizeFormat(format: string): string {
		format = format.toLowerCase();
		format = format.replace(/-comfort$/, '-en16931');
		format = format.replace(/-basic[-_]?wl$/, '-basic wl');
		format = format.replace(/^zugferd-/, 'factur-x-');

		return format;
	}
}
