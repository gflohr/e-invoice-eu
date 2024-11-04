import {
	BadRequestException,
	Controller,
	HttpStatus,
	InternalServerErrorException,
	Logger,
	NotFoundException,
	Param,
	Post,
	Res,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidationError } from 'ajv';
import { Response } from 'express';

import { FormatFactoryService } from '../format/format.factory.service';
import { MappingService } from '../mapping/mapping.service';

@ApiTags('invoice')
@Controller('invoice')
export class InvoiceController {
	constructor(
		private readonly mappingService: MappingService,
		private readonly formatFactoryService: FormatFactoryService,
		private readonly logger: Logger,
	) {
		this.logger = new Logger(InvoiceController.name);
	}

	@Post('transform-and-create/:format')
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		description: 'The spreadsheet to be transformed.',
		required: true,
		schema: {
			type: 'object',
			properties: {
				data: {
					type: 'string',
					format: 'binary',
				},
				mapping: {
					type: 'string',
					format: 'binary',
				},
			},
		},
	})
	@ApiResponse({
		status: 201,
		description:
			'Creation successful. The output is an invoice' +
			' document as either XML or PDF.',
	})
	@ApiResponse({
		status: 400,
		description: 'Bad request with error details',
	})
	@UseInterceptors(
		FileFieldsInterceptor([
			{ name: 'data', maxCount: 1 },
			{ name: 'mapping', maxCount: 1 },
		]),
	)
	transformAndCreate(
		@Res() response: Response,
		@Param('format') format: string,
		@UploadedFiles()
		files: {
			data?: Express.Multer.File[];
			mapping?: Express.Multer.File[];
		},
	) {
		const dataFile = files.data?.[0];
		if (!dataFile) {
			throw new BadRequestException('No invoice file uploaded');
		}

		const mappingFile = files.mapping?.[0];
		if (!mappingFile) {
			throw new BadRequestException('No mapping file uploaded');
		}

		try {
			const invoice = this.mappingService.transform(
				format,
				mappingFile.buffer.toString(),
				dataFile.buffer,
			);

			const formatter = this.formatFactoryService.createFormatService(format);
			const xml = formatter.generate(invoice);

			response.set('Content-Type', 'application/xml');
			response.status(HttpStatus.CREATED).send(xml);
		} catch (error) {
			if (error.code && error.code === 'ENOENT') {
				throw new NotFoundException();
			} else if (error instanceof ValidationError) {
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
