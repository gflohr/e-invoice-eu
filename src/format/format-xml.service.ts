import { Injectable } from '@nestjs/common';
import { ExpandObject } from 'xmlbuilder2/lib/interfaces';

import {
	SerializerOptions,
	SerializerService,
} from '../serializer/serializer.service';

@Injectable()
export class FormatXMLService {
	constructor(private readonly serializerService: SerializerService) {}

	get mimeType(): string {
		return 'application/xml';
	}

	render(
		data: ExpandObject,
		serializerOptions: SerializerOptions,
	): string | Buffer {
		return this.serializerService.serialize(data, serializerOptions);
	}
}
