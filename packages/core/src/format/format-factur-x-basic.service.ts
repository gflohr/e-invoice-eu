import { FX_BASIC, FXProfile } from './format-cii.service';
import { FormatFacturXService } from './format-factur-x.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';

export class FormatFacturXBasicService
	extends FormatFacturXService
	implements EInvoiceFormat
{
	get customizationID(): string {
		return 'urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:basic';
	}

	get fxProfile(): FXProfile {
		return FX_BASIC;
	}
}
