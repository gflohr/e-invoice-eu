import { Injectable } from '@nestjs/common';

import { FULL_CII, FXProfile } from './format-cii.service';
import { FormatFacturXService } from './format-factur-x.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';

@Injectable()
export class FormatFacturXXRechnungService
	extends FormatFacturXService
	implements EInvoiceFormat
{
	get customizationID(): string {
		return 'urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0';
	}

	get fxProfile(): FXProfile {
		return FULL_CII;
	}
}
