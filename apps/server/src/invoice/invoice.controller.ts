import { Invoice } from '@e-invoice-eu/core';
import {
	BadRequestException,
	Body,
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
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { ValidationError } from 'ajv/dist/2019';
import { Response } from 'express';

import { InvoiceAttachment, InvoiceService } from './invoice.service';
import { MappingService } from '../mapping/mapping.service';

@ApiTags('invoice')
@Controller('invoice')
export class InvoiceController {
	constructor(
		private readonly invoiceService: InvoiceService,
		private readonly mappingService: MappingService,
		private readonly logger: Logger,
	) {}

	@Post('create/:format')
	@ApiParam({
		name: 'format',
		type: String,
		description:
			'The format of the invoice to create, for' +
			' example "UBL" or "CII". Case does not matter.',
		example: 'UBL',
	})
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		required: true,
		schema: {
			type: 'object',
			properties: {
				invoice: {
					type: 'object',
					nullable: true,
					description:
						'The invoice data in the internal format as JSON.  See the [JSON schema for the internal format](#/schema/SchemaController_invoice)! Mandatory, if the invoice should be generated from JSON data.',
				},
				mapping: {
					type: 'string',
					nullable: true,
					format: 'binary',
					description:
						'The mapping from spreadsheet data to the internal format as YAML or JSON. See the [JSON schema for mappings](#/schema/SchemaController_mapping). Mandatory, if the invoice should be generated from spreadsheet data.',
				},
				lang: {
					type: 'string',
					nullable: true,
					description:
						'Primary language of your document as a locale identifier like fr-ca, defaults to en',
				},
				spreadsheet: {
					type: 'string',
					nullable: true,
					format: 'binary',
					description: 'The spreadsheet to be transformed.',
				},
				data: {
					type: 'string',
					nullable: true,
					format: 'binary',
					description:
						'Will be removed in 2026! An alias for "spreadsheet". Use that instead!',
					deprecated: true,
				},
				pdf: {
					type: 'string',
					format: 'binary',
					nullable: true,
					description:
						'Optional PDF version of the invoice.  For Factur-X/ZUGFeRD, if no PDF is uploaded, one is generated from the Spreadsheet with the help of LibreOffice.',
				},
				attachment: {
					type: 'array',
					nullable: true,
					description: 'An arbitrary number of supplementary attachments.',
					items: {
						type: 'string',
						format: 'binary',
						description:
							'The individual attachment. Note that only' +
							' the MIME types "text/csv", "application/pdf"' +
							' "image/png", "image/jpeg"' +
							' "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",' +
							' and "application/vnd.oasis.opendocument.spreadsheet"' +
							' are allowed as MIME types to XML invoices.',
					},
				},
				attachmentID: {
					type: 'array',
					nullable: true,
					description: 'Optional ids for each supplementary attachment',
					items: {
						type: 'string',
						description: 'Description for the corresponding attachment.',
					},
				},
				attachmentDescription: {
					type: 'array',
					nullable: true,
					description:
						'Optional descriptions for each supplementary attachment.',
					items: {
						type: 'string',
						description: 'Description for the corresponding attachment.',
					},
				},
				embedPDF: {
					type: 'boolean',
					nullable: true,
					description:
						'Pass if a PDF version of the invoice should be' +
						' embedded into the XML; ignored for Factur-X.' +
						' If no PDF is uploaded, one is generated from the' +
						' Spreadsheet with the help of LibreOffice.',
				},
				pdfID: {
					type: 'string',
					nullable: true,
					description:
						'ID of the embedded PDF, defaults to the document' + ' number.',
				},
				pdfDescription: {
					type: 'string',
					nullable: true,
					description: 'Optional description for the embedded PDF.',
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
			{ name: 'invoice', maxCount: 1 },
			{ name: 'mapping', maxCount: 1 },
			{ name: 'spreadsheet', maxCount: 1 },
			{ name: 'data', maxCount: 1 },
			{ name: 'pdf', maxCount: 1 },
			{ name: 'attachment' }, // FIXME! How to set maxCount asynchronously?
		]),
	)
	async create(
		@Res() response: Response,
		@Param('format') format: string,
		@UploadedFiles()
		files: {
			spreadsheet?: Express.Multer.File[];
			data?: Express.Multer.File[];
			invoice?: Express.Multer.File[];
			mapping?: Express.Multer.File[];
			pdf?: Express.Multer.File[];
			attachment?: Express.Multer.File[];
		},

		@Body()
		body: {
			lang?: string;
			attachmentID?: string[];
			attachmentDescription?: string[];
			embedPDF?: boolean;
			pdfID?: string;
			pdfDescription?: string;
		},
	) {
		const { data, mapping, invoice, pdf, attachment } = files;
		let spreadsheet = files.spreadsheet;

		if (spreadsheet && data) {
			throw new BadRequestException(
				'The parameters "spreadsheet" and data" are mutually exclusive.',
			);
		}

		if (data) {
			spreadsheet = data;
		}

		let attachmentIDs = body.attachmentID || [];
		if (typeof attachmentIDs !== 'object') attachmentIDs = [attachmentIDs];

		let attachmentDescriptions = body.attachmentDescription || [];
		if (typeof attachmentDescriptions !== 'object')
			attachmentDescriptions = [attachmentDescriptions];

		if (!invoice && !mapping) {
			throw new BadRequestException(
				'Either an invoice or mapping file must be proviced',
			);
		} else if (invoice && mapping) {
			throw new BadRequestException(
				'Both an invoice and mapping file cannot be provided',
			);
		} else if (mapping && !spreadsheet) {
			throw new BadRequestException('No invoice file uploaded');
		}

		const attachments: InvoiceAttachment[] = [];
		if (attachment) {
			for (let i = 0; i < attachment.length; ++i) {
				attachments[i] = {
					file: attachment[i],
					id: attachmentIDs[i],
					description: attachmentDescriptions[i],
				};
			}
		}

		try {
			let invoiceData: Invoice;
			if (invoice) {
				invoiceData = JSON.parse(
					invoice[0].buffer.toString(),
				) as unknown as Invoice;
			} else {
				invoiceData = this.mappingService.transform(
					format.toLowerCase(),
					mapping![0].buffer.toString(),
					spreadsheet![0].buffer,
				);
			}

			const document = await this.invoiceService.generate(invoiceData, {
				format: format.toLowerCase(),
				spreadsheet: spreadsheet ? spreadsheet[0] : undefined,
				pdf: pdf ? pdf[0] : undefined,
				lang: body.lang ?? 'en',
				attachments: attachments,
				embedPDF: body.embedPDF,
				pdfID: body.pdfID,
				pdfDescription: body.pdfDescription,
			});
			if (typeof document === 'string') {
				response.set('Content-Type', 'application/xml');
			} else {
				response.set('Content-Type', 'application/pdf');
			}
			response.status(HttpStatus.CREATED).send(document);
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

	@Post('transform-and-create/:format')
	@ApiOperation({ deprecated: true })
	@ApiParam({
		name: 'format',
		type: String,
		description:
			'The format of the invoice to transform and create, for' +
			' example "UBL" or "CII". Case does not matter.',
		example: 'UBL',
	})
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		required: true,
		schema: {
			type: 'object',
			properties: {
				lang: {
					type: 'string',
					nullable: true,
					description:
						'Primary language of your document as a locale identifier like fr-ca, defaults to en',
				},
				data: {
					type: 'string',
					format: 'binary',
					description: 'The spreadsheet to be transformed.',
				},
				mapping: {
					type: 'string',
					format: 'binary',
					description:
						'The mapping from spreadsheet data to the internal format as YAML or JSON. See the [JSON schema for mappings](#/schema/SchemaController_mapping)',
				},
				pdf: {
					type: 'string',
					format: 'binary',
					nullable: true,
					description:
						'Optional PDF version of the invoice.  For Factur-X/ZUGFeRD, if no PDF is uploaded, one is generated from the Spreadsheet with the help of LibreOffice.',
				},
				attachment: {
					type: 'array',
					nullable: true,
					description: 'An arbitrary number of supplementary attachments.',
					items: {
						type: 'string',
						format: 'binary',
						description:
							'The individual attachment. Note that only' +
							' the MIME types "text/csv", "application/pdf"' +
							' "image/png", "image/jpeg"' +
							' "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",' +
							' and "application/vnd.oasis.opendocument.spreadsheet"' +
							' are allowed as MIME types to XML invoices.',
					},
				},
				attachmentID: {
					type: 'array',
					nullable: true,
					description: 'Optional ids for each supplementary attachment',
					items: {
						type: 'string',
						description: 'Description for the corresponding attachment.',
					},
				},
				attachmentDescription: {
					type: 'array',
					nullable: true,
					description:
						'Optional descriptions for each supplementary attachment.',
					items: {
						type: 'string',
						description: 'Description for the corresponding attachment.',
					},
				},
				embedPDF: {
					type: 'boolean',
					nullable: true,
					description:
						'Pass if a PDF version of the invoice should be' +
						' embedded into the XML; ignored for Factur-X.' +
						' If no PDF is uploaded, one is generated from the' +
						' Spreadsheet with the help of LibreOffice.',
				},
				pdfID: {
					type: 'string',
					nullable: true,
					description:
						'ID of the embedded PDF, defaults to the document' + ' number.',
				},
				pdfDescription: {
					type: 'string',
					nullable: true,
					description: 'Optional description for the embedded PDF.',
				},
			},
			required: ['data', 'mapping'],
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
			{ name: 'pdf', maxCount: 1 },
			{ name: 'attachment' }, // FIXME! How to set maxCount asynchronously?
		]),
	)
	async transformAndCreate(
		@Res() response: Response,
		@Param('format') format: string,
		@UploadedFiles()
		files: {
			data?: Express.Multer.File[];
			mapping?: Express.Multer.File[];
			pdf?: Express.Multer.File[];
			attachment?: Express.Multer.File[];
		},

		@Body()
		body: {
			lang?: string;
			attachmentID?: string[];
			attachmentDescription?: string[];
			embedPDF?: boolean;
			pdfID?: string;
			pdfDescription?: string;
		},
	) {
		const deprecationWarning = `
*********************************************************************
* DEPRECATION WARNING:                                              *
*                                                                   *
* The /invoice/transform-and-create endpoint is deprecated. It will *
* be removed in the next major version 2.x.x.  Use /invoice/create  *
* with the same parameters instead!                                 *
*********************************************************************
`.trimEnd();
		this.logger.warn(deprecationWarning);

		return this.create(response, format, files, body);
	}
}
