import type { Invoice } from '@e-invoice-eu/core';
import {
	BadRequestException,
	Controller,
	InternalServerErrorException,
	Logger,
	Param,
	Post,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidationError } from 'ajv/dist/2019';

import { MappingService } from './mapping.service';

@ApiTags('mapping')
@Controller('mapping')
export class MappingController {
	constructor(
		private readonly mappingService: MappingService,
		private readonly logger: Logger,
	) {}

	@Post('transform/:format')
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		description: 'The spreadsheet to be transformed.',
		required: true,
		schema: {
			type: 'object',
			properties: {
				spreadsheet: {
					type: 'string',
					format: 'binary',
					nullable: true,
					description: 'The spreadsheet to be transformed.',
				},
				data: {
					type: 'string',
					format: 'binary',
					deprecated: true,
					nullable: true,
					description:
						'Will be removed in 2026! An alias for "spreadsheet". Use that instead!',
				},
				mapping: {
					type: 'string',
					format: 'binary',
					description: 'The mapping file in YAML or JSON format.',
				},
			},
		},
	})
	@ApiResponse({
		status: 201,
		description:
			'Transformation successful. The output is an invoice' +
			' document that can be used as input for the' +
			' `/api/invoice/generate` endpoint.',
		links: {
			generateInvoice: {
				operationRef: './invoice/generate',
				parameters: {
					invoice: '$response.body',
				},
			},
		},
	})
	@ApiResponse({
		status: 400,
		description: 'Bad request with error details',
	})
	@UseInterceptors(
		FileFieldsInterceptor([
			{ name: 'spreadsheet', maxCount: 1 },
			{ name: 'data', maxCount: 1 },
			{ name: 'mapping', maxCount: 1 },
		]),
	)
	transform(
		@Param('format') format: string,
		@UploadedFiles()
		files: {
			spreadsheet?: Express.Multer.File[];
			data?: Express.Multer.File[];
			mapping?: Express.Multer.File[];
		},
	): Invoice {
		if (files.spreadsheet && files.data) {
			throw new BadRequestException(
				'The parameters "spreadsheet" and data" are mutually exclusive.',
			);
		}

		const dataFile = files.spreadsheet ? files.spreadsheet[0] : files.data?.[0];
		if (!dataFile) {
			throw new BadRequestException('No invoice file uploaded');
		}

		const mappingFile = files.mapping?.[0];
		if (!mappingFile) {
			throw new BadRequestException('No mapping file uploaded');
		}

		try {
			return this.mappingService.transform(
				format,
				mappingFile.buffer.toString(),
				dataFile.buffer,
			);
		} catch (error) {
			if (error instanceof ValidationError) {
				throw new BadRequestException({
					message: 'Transformation failed.',
					details: error,
				});
			} else {
				this.logger.error(`unknown error: ${error.message}\n${error.stack}`);
				throw new InternalServerErrorException();
			}
		}
	}
}
