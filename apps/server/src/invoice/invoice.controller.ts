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
	ApiParam,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { ValidationError } from 'ajv/dist/2019';
import { Response } from 'express';

import { Invoice } from './invoice.interface';
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
					description:
						'The invoice data in the internal format as JSON.  See the [JSON schema for the internal format](#/schema/SchemaController_invoice)!',
				},
				lang: {
					type: 'string',
					nullable: true,
					description:
						'Primary language of your document as a locale identifier like fr-ca, defaults to en',
				},
				data: {
					type: 'string',
					format: 'binary',
					nullable: true,
					description:
						'An optional spreadsheet to be converted to PDF (Factur-X/ZUGFeRD only).',
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
			required: ['invoice'],
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
			invoice: Express.Multer.File[];
			data?: Express.Multer.File[];
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
		const { invoice, data, pdf, attachment } = files;

		if (!invoice) {
			throw new BadRequestException('No invoice file uploaded');
		}

		let attachmentIDs = body.attachmentID || [];
		if (typeof attachmentIDs !== 'object') attachmentIDs = [attachmentIDs];

		let attachmentDescriptions = body.attachmentDescription || [];
		if (typeof attachmentDescriptions !== 'object')
			attachmentDescriptions = [attachmentDescriptions];

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
			const invoiceData = JSON.parse(
				invoice[0].buffer.toString(),
			) as unknown as Invoice;
			const document = await this.invoiceService.generate(invoiceData, {
				format: format.toLowerCase(),
				data: data ? data[0] : undefined,
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
		const { data, mapping, pdf, attachment } = files;

		let attachmentIDs = body.attachmentID || [];
		if (typeof attachmentIDs !== 'object') attachmentIDs = [attachmentIDs];

		let attachmentDescriptions = body.attachmentDescription || [];
		if (typeof attachmentDescriptions !== 'object')
			attachmentDescriptions = [attachmentDescriptions];

		if (!data) {
			throw new BadRequestException('No invoice file uploaded');
		}

		if (!mapping) {
			throw new BadRequestException('No mapping file uploaded');
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
			const invoice = this.mappingService.transform(
				format.toLowerCase(),
				mapping[0].buffer.toString(),
				data[0].buffer,
			);

			const document = await this.invoiceService.generate(invoice, {
				format: format.toLowerCase(),
				data: data[0],
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
}
