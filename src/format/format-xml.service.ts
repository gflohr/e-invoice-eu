import { Injectable } from '@nestjs/common';
import { ExpandObject } from 'xmlbuilder2/lib/interfaces';

import {
	SerializerOptions,
	SerializerService,
} from '../serializer/serializer.service';

@Injectable()
export class FormatXMLService {
	constructor(private readonly serializerService: SerializerService) {}

	render(data: ExpandObject, serializerOptions: SerializerOptions): string {
		return this.serializerService.serialize(data, serializerOptions);
	}
}
