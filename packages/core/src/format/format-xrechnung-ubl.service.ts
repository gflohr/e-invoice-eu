import { EInvoiceFormat } from './format.e-invoice-format.interface';
import { FormatUBLService } from './format-ubl.service';

export class FormatXRECHNUNGUBLService
	extends FormatUBLService
	implements EInvoiceFormat
{
	get customizationID(): string {
		return 'urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0';
	}
}
