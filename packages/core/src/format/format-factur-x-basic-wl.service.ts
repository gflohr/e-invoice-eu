import { FX_BASIC_WL, FXProfile } from './format-cii.service';
import { FormatFacturXService } from './format-factur-x.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';

export class FormatFacturXBasicWLService
	extends FormatFacturXService
	implements EInvoiceFormat
{
	get customizationID(): string {
		return 'urn:factur-x.eu:1p0:basicwl';
	}

	get fxProfile(): FXProfile {
		return FX_BASIC_WL;
	}
}
