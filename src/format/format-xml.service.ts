import { Injectable } from '@nestjs/common';
import { ExpandObject } from 'xmlbuilder2/lib/interfaces';

import { AppConfigService } from '../app-config/app-config.service';
import {
	SerializerOptions,
	SerializerService,
} from '../serializer/serializer.service';

@Injectable()
export class FormatXMLService {
	constructor(
		protected readonly appConfigService: AppConfigService,
		private readonly serializerService: SerializerService,
	) {}

	get mimeType(): string {
		return 'application/xml';
	}

	renderXML(data: ExpandObject, serializerOptions: SerializerOptions): string {
		return this.serializerService.serialize(data, serializerOptions);
	}
}
