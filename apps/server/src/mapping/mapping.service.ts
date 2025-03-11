import {
	MappingService as CoreMappingService,
	Invoice,
} from '@e-invoice-eu/core';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MappingService {
	private readonly mappingService: CoreMappingService;
	private readonly logger = new Logger(MappingService.name);

	constructor() {
		this.mappingService = new CoreMappingService(
			this.logger,
		);
	}

	transform(format: string, yamlMapping: string, dataBuffer: Buffer): Invoice {
		return this.mappingService.transform(format, yamlMapping, dataBuffer);
	}
}
