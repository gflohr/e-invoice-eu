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

export type EInvoiceMIMEType = 'application/pdf' | 'application/xml';

/**
 * Describe a format.
 */
export type FormatInfo = {
	/**
	 * The name of the format like "UBL" or "Factur-X-Extended".
	 */
	name: string;

	/**
	 * The customization id of the format.
	 */
	customizationID: string;

	/**
	 * The profile id of the format.
	 */
	profileID: string;

	/**
	 * The MIME type of the format.
	 */
	mimeType: EInvoiceMIMEType;

	/**
	 * The general syntax in the sense of EN16931.
	 */
	syntax: 'UBL' | 'CII';
};

/**
 * Factory service for a an e-invoice generating service.
 */
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

	/**
	 * Create a service that is able to create a specific invoice format.
	 *
	 * @param format one of the supported formats, see {@link listFormatServices}
	 * @param logger an object that implements the {@link Logger} interface
	 * @returns
	 */
	createFormatService(format: string, logger: Logger): EInvoiceFormat {
		const normalizedFormat = this.normalizeFormat(format);
		const FormatService = this.formatServicesLookup[normalizedFormat];

		if (!FormatService) {
			throw new Error(`Format '${format}' is not supported.`);
		}

		return new FormatService(logger);
	}

	/**
	 * List all supported invoice formats.
	 *
	 * @returns an array of format information objects
	 */
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

	/**
	 * Normalizes a format name into a lowercase, canonical name.
	 * @param format the format name to normalize
	 * @returns the normalized format name
	 */
	normalizeFormat(format: string): string {
		format = format.toLowerCase();
		format = format.replace(/-comfort$/, '-en16931');
		format = format.replace(/-basic[-_]?wl$/, '-basic wl');
		format = format.replace(/^zugferd-/, 'factur-x-');

		return format;
	}

	/**
	 * Get information about a particular format.
	 *
	 * @param format the format to describe
	 * @returns the format information
	 */
	describeFormat(format:string): FormatInfo {
		const normalized = this.normalizeFormat(format);

		const FormatServiceClass = this.formatServicesLookup[normalized];
		if (!FormatServiceClass) {
			throw new Error(`Format '${format}' is not supported.`);
		}

		const service = new FormatServiceClass();

		return {
			name: normalized,
			syntax: service.syntax,
			mimeType: service.mimeType,
			customizationID: service.customizationID,
			profileID: service.profileID,

		}
	}
}
