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

import { MappingService } from '../mapping/mapping.service';
import { SerializerService } from '../serializer/serializer.service';

@ApiTags('invoice')
@Controller('invoice')
export class InvoiceController {
	constructor(
		private readonly serializerService: SerializerService,
		private readonly mappingService: MappingService,
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

		if (format !== 'UBL') {
			throw new BadRequestException(`Unsupported format '${format}'`);
		}

		const mappingFile = files.mapping?.[0];
		if (!mappingFile) {
			throw new BadRequestException('No mapping file uploaded');
		}

		try {
			const invoice = this.mappingService.transform(
				mappingFile.buffer.toString(),
				dataFile.buffer,
			);
			const xml = this.serializerService.xml(
				'Invoice',
				{
					xmlns: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
					'xmlns:cac':
						'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
					'xmlns:cbc':
						'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
				},
				invoice,
				{
					prettyPrint: true,
					indent: '\t',
				},
			);

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
