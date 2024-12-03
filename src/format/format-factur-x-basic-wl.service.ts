import { Injectable } from '@nestjs/common';

import { FX_EN16931, FXProfile } from './format-cii.service';
import { FormatFacturXService } from './format-factur-x.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';

@Injectable()
export class FormatFacturXBasicWLService
	extends FormatFacturXService
	implements EInvoiceFormat
{
	get customizationID(): string {
		return 'urn:factur-x.eu:1p0:basicwl';
	}

	get fxProfile(): FXProfile {
		return FX_EN16931;
	}
}
