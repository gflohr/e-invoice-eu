import { EInvoiceFormat } from './format.e-invoice-format.interface';
import { FormatCIIService } from './format-cii.service';

export class FormatXRECHNUNGCIIService
	extends FormatCIIService
	implements EInvoiceFormat
{
	get customizationID(): string {
		return 'urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0';
	}
}
