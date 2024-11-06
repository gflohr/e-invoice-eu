import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { FormatFactoryService, FormatInfo } from './format.factory.service';

@ApiTags('format')
@Controller('format')
export class FormatController {
	constructor(private readonly formatFactoryService: FormatFactoryService) {}

	@Get('list')
	@ApiOperation({ summary: 'Get a list of format information' })
	@ApiResponse({
		status: 200,
		description: 'List of format information',
		type: [FormatInfo],
	})
	list(): FormatInfo[] {
		return this.formatFactoryService.listFormatServices();
	}
}
