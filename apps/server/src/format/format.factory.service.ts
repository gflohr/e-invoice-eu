import {
	FormatFactoryService as FormatFactorCoreService,
	EInvoiceFormat,
} from '@e-invoice-eu/core';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { AppConfigService } from '../app-config/app-config.service';
export class FormatInfo {
	@ApiProperty({
		description: 'The name of the format',
		example: 'UBL',
	})
	name: string;

	@ApiProperty({
		description: 'The customization ID of the format',
		example: 'urn:cen.eu:en16931:2017',
	})
	customizationID: string;

	@ApiProperty({
		description: 'The profile ID of the format',
		example: 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0',
	})
	profileID: string;

	@ApiProperty({
		description: 'The appropriate MIME type of the format',
		example: 'application/xml',
	})
	mimeType: string;

	@ApiProperty({
		description: "The basic syntax of the format ('UBL' or 'CII')",
		example: 'UBL',
	})
	syntax: 'UBL' | 'CII';
}

@Injectable()
export class FormatFactoryService {
	private readonly coreService: FormatFactorCoreService;

	constructor(private readonly appConfigService: AppConfigService) {
		this.coreService = new FormatFactorCoreService();
	}

	listFormatServices(): FormatInfo[] {
		return this.coreService.listFormatServices();
	}

	createFormatService(format: string, logger: Logger): EInvoiceFormat {
		try {
			return this.coreService.createFormatService(format, logger);
		} catch {
			throw new NotFoundException(`Format '${format}' not supported.`);
		}
	}

	normalizeFormat(format: string): string {
		return this.coreService.normalizeFormat(format);
	}
}
