import { Injectable } from '@nestjs/common';
import { ExpandObject } from 'xmlbuilder2/lib/interfaces';

import { FormatCIIService, FULL_CII, FXProfile } from './format-cii.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';
import { SerializerOptions } from '../serializer/serializer.service';

@Injectable()
export class FormatFacturXService
	extends FormatCIIService
	implements EInvoiceFormat
{
	get mimeType(): string {
		return 'application/pdf';
	}

	get fxProfile(): FXProfile {
		return FULL_CII;
	}

	render(
		data: ExpandObject,
		serializerOptions: SerializerOptions,
	): string | Buffer {
		const xml = super.render(data, serializerOptions);

		return Buffer.from(xml);
	}
}
