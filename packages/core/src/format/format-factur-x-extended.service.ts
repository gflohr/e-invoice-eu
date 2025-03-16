import { FX_EXTENDED, FXProfile } from './format-cii.service';
import { FormatFacturXService } from './format-factur-x.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';

export class FormatFacturXExtendedService
	extends FormatFacturXService
	implements EInvoiceFormat
{
	get customizationID(): string {
		return 'urn:cen.eu:en16931:2017#conformant#urn:factur-x.eu:1p0:extended';
	}

	get fxProfile(): FXProfile {
		return FX_EXTENDED;
	}
}
