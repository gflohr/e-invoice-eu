import {
	BadRequestException,
	Controller,
	HttpStatus,
	InternalServerErrorException,
	Logger,
	Param,
	Post,
	Res,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidationError } from 'ajv/dist/2019';
import { Response } from 'express';

import { InvoiceService } from './invoice.service';
import { MappingService } from '../mapping/mapping.service';
import { CustomFilesInterceptor } from '../utils/custom-files.interceptor';

@ApiTags('invoice')
@Controller('invoice')
export class InvoiceController {
	constructor(
		private readonly invoiceService: InvoiceService,
		private readonly mappingService: MappingService,
		private readonly logger: Logger,
	) {}

	@Post('transform-and-create/:format')
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		required: true,
		schema: {
			type: 'object',
			properties: {
				data: {
					type: 'string',
					format: 'binary',
					description: 'The spreadsheet to be transformed.',
				},
				mapping: {
					type: 'string',
					format: 'binary',
					description:
						'The mapping from spreadsheet data to the internal format as YAML or JSON.',
				},
				pdf: {
					type: 'string',
					format: 'binary',
					nullable: true,
					description:
						'Optional PDF version of the invoice.  For Factur-X/ZUGFeRD, if no PDF is uploaded, one is generated from the Spreadsheet with the help of LibreOffice.',
				},
				attachments: {
					type: 'array',
					description:
						'An arbitrary number of supplementary attachments.  For each attachment an object with the key `file` for the upload and an optional key `description` with an optional description must be provided.',
					items: {
						type: 'object',
						properties: {
							file: {
								type: 'string',
								format: 'binary',
								description: 'A supplementary attachment.',
							},
							description: {
								type: 'string',
								nullable: true,
								description: 'An optional description of the attachment.',
							},
						},
					},
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
	@UseInterceptors(CustomFilesInterceptor())
	transformAndCreate(
		@Res() response: Response,
		@Param('format') format: string,
		@UploadedFiles()
		files: Express.Multer.File[],
	) {
		const dataFile = files.find(file => file.fieldname === 'data');
		const mappingFile = files.find(file => file.fieldname === 'mapping');

		if (!dataFile) {
			throw new BadRequestException('No invoice file uploaded');
		}

		if (!mappingFile) {
			throw new BadRequestException('No mapping file uploaded');
		}

		try {
			const invoice = this.mappingService.transform(
				format,
				mappingFile.buffer.toString(),
				dataFile.buffer,
			);

			const xml = this.invoiceService.generate(format, invoice);

			response.set('Content-Type', 'application/xml');
			response.status(HttpStatus.CREATED).send(xml);
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
