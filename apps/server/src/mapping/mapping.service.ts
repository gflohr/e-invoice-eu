import {
	MappingService as CoreMappingService,
	Invoice,
} from '@e-invoice-eu/core';
import { Injectable, Logger } from '@nestjs/common';
import * as yaml from 'js-yaml';

@Injectable()
export class MappingService {
	private readonly mappingService: CoreMappingService;
	private readonly logger = new Logger(MappingService.name);

	constructor() {
		this.mappingService = new CoreMappingService(this.logger);
	}

	transform(format: string, mapping: string, dataBuffer: Buffer): Invoice {
		const mappingData = yaml.load(mapping);

		return this.mappingService.transform(dataBuffer, format, mappingData);
	}
}
