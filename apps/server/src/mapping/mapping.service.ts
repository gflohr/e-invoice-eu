import {
	MappingService as CoreMappingService,
	Invoice,
} from '@e-invoice-eu/core';
import { FormatFactoryService } from '@e-invoice-eu/core';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MappingService {
	private readonly mappingService: CoreMappingService;
	private readonly logger = new Logger(MappingService.name);

	constructor() {
		const formatFactoryService = new FormatFactoryService();
		this.mappingService = new CoreMappingService(
			formatFactoryService,
			this.logger,
		);
	}

	transform(format: string, yamlMapping: string, dataBuffer: Buffer): Invoice {
		return this.mappingService.transform(format, yamlMapping, dataBuffer);
	}
}
