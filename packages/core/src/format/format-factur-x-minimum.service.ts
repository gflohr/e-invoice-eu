import { FX_MINIMUM, FXProfile } from './format-cii.service';
import { FormatFacturXService } from './format-factur-x.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';

export class FormatFacturXMinimumService
	extends FormatFacturXService
	implements EInvoiceFormat
{
	get customizationID(): string {
		return 'urn:factur-x.eu:1p0:minimum';
	}

	get fxProfile(): FXProfile {
		return FX_MINIMUM;
	}
}
