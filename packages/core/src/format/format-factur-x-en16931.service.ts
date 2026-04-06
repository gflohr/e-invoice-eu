import { EInvoiceFormat } from './format.e-invoice-format.interface';
import { FX_EN16931, FXProfile } from './format-cii.service';
import { FormatFacturXService } from './format-factur-x.service';

export class FormatFacturXEN16931Service
	extends FormatFacturXService
	implements EInvoiceFormat
{
	get customizationID(): string {
		return 'urn:cen.eu:en16931:2017';
	}

	get fxProfile(): FXProfile {
		return FX_EN16931;
	}
}
