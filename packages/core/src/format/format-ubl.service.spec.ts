import { Invoice, Mapping } from '@e-invoice-eu/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../utils/render-spreadsheet', () => ({
	renderSpreadsheet: vi.fn(
		async () => new Uint8Array([73, 110, 118, 111, 105, 99, 101]),
	),
}));

import { ExpandObject } from 'xmlbuilder2/lib/interfaces';
import { InvoiceServiceOptions } from '../invoice/invoice.service';
import { FormatUBLService } from './format-ubl.service';

describe('UBL', () => {
	let service: FormatUBLService;
	const mockLogger = {
		log: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	};

	beforeEach(async () => {
		service = new FormatUBLService(mockLogger);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should have a customization id', () => {
		expect(service.customizationID).toBeDefined();
	});

	it('should have a profile id', () => {
		expect(service.profileID).toBeDefined();
	});

	it('should fill in mapping defaults', () => {
		const mapping = { 'ubl:Invoice': {} } as unknown as Mapping;

		service.fillMappingDefaults(mapping);
		expect(mapping['ubl:Invoice']['cbc:CustomizationID']).toBe(
			service.customizationID,
		);
		expect(mapping['ubl:Invoice']['cbc:ProfileID']).toBe(service.profileID);
	});

	it('should fill in invoice defaults', () => {
		const invoice = { 'ubl:Invoice': {} } as unknown as Invoice;

		service.fillInvoiceDefaults(invoice);
		expect(invoice['ubl:Invoice']['cbc:CustomizationID']).toBe(
			service.customizationID,
		);
		expect(invoice['ubl:Invoice']['cbc:ProfileID']).toBe(service.profileID);
	});

	it('should generate XML', async () => {
		const invoice: Invoice = { 'ubl:Invoice': {} } as unknown as Invoice;
		const options = { attachments: [] } as unknown as InvoiceServiceOptions;

		const xml = await service.generate(invoice, options);

		expect(xml).toMatchSnapshot();
	});

	it('should throw an error if PDF source is missing', async () => {
		const invoice: Invoice = { 'ubl:Invoice': {} } as unknown as Invoice;
		const options = { embedPDF: true } as unknown as InvoiceServiceOptions;

		await expect(service.generate(invoice, options)).rejects.toThrow(
			'Either an invoice spreadsheet file or an invoice PDF is needed!',
		);
	});

	it('should throw an error if LibreOffice path is not provided', async () => {
		const invoice: Invoice = { 'ubl:Invoice': {} } as unknown as Invoice;
		const options = {
			embedPDF: true,
			spreadsheet: {},
		} as unknown as InvoiceServiceOptions;

		await expect(service.generate(invoice, options)).rejects.toThrow(
			'LibreOffice path is required for conversion to PDF!',
		);
	});

	it('should embed a PDF', async () => {
		const invoice: Invoice = { 'ubl:Invoice': {} } as unknown as Invoice;
		const options = {
			embedPDF: true,
			spreadsheet: {
				filename: 'invoice.ods',
				buffer: Buffer.from('test'),
			},
			libreOfficePath: 'libreoffice',
		} as unknown as InvoiceServiceOptions;

		const xml = await service.generate(invoice, options);
		expect(xml).toMatchSnapshot();
	});

	it('should filenames without a dot correctly', async () => {
		const invoice: Invoice = { 'ubl:Invoice': {} } as unknown as Invoice;
		const options = {
			embedPDF: true,
			spreadsheet: {
				filename: '/path/to.files/invoice',
				buffer: Buffer.from('test'),
			},
			libreOfficePath: 'libreoffice',
		} as unknown as InvoiceServiceOptions;

		const xml = await service.generate(invoice, options);
		expect(xml).toMatchSnapshot();
	});

	it('should throw an error if pdf buffer is missing', async () => {
		const invoice: Invoice = { 'ubl:Invoice': {} } as unknown as Invoice;
		const options = {
			embedPDF: true,
			pdf: {},
			libreOfficePath: 'libreoffice',
		} as unknown as InvoiceServiceOptions;

		await expect(service.generate(invoice, options)).rejects.toThrow(
			'A PDF buffer is required!',
		);
	});

	it('should throw an error if spreadsheet is missing', async () => {
		const invoice: Invoice = { 'ubl:Invoice': {} } as unknown as Invoice;
		const options = {
			embedPDF: true,
			libreOfficePath: 'libreoffice',
		} as unknown as InvoiceServiceOptions;

		await expect(service.generate(invoice, options)).rejects.toThrow(
			'Either an invoice spreadsheet file or an invoice PDF is needed!',
		);
	});

	it('should throw an error if spreadsheet buffer is missing', async () => {
		const invoice: Invoice = { 'ubl:Invoice': {} } as unknown as Invoice;
		const options = {
			embedPDF: true,
			spreadsheet: {
				filename: 'invoice.ods',
			},
			libreOfficePath: 'libreoffice',
		} as unknown as InvoiceServiceOptions;

		await expect(service.generate(invoice, options)).rejects.toThrow(
			'A spreadsheet buffer is required!',
		);
	});

	it('should throw an error if the PDF filename is missing', async () => {
		const invoice: Invoice = { 'ubl:Invoice': {} } as unknown as Invoice;
		const options = {
			embedPDF: true,
			pdf: {
				buffer: Buffer.from('test'),
			},
		} as unknown as InvoiceServiceOptions;

		await expect(service.generate(invoice, options)).rejects.toThrow(
			'A PDF filename is required!',
		);
	});

	it('should embed a PDF passed as an argument', async () => {
		const invoice: Invoice = { 'ubl:Invoice': {} } as unknown as Invoice;
		const options = {
			embedPDF: true,
			pdf: {
				filename: 'invoice.pdf',
				buffer: Buffer.from('test'),
				description: 'A human-readable version of the invoice',
			},
			libreOfficePath: 'libreoffice',
		} as unknown as InvoiceServiceOptions;

		const xml = await service.generate(invoice, options);
		expect(xml).toMatchSnapshot();
	});

	it('should attach attachments', async () => {
		const invoice: Invoice = { 'ubl:Invoice': {} } as unknown as Invoice;
		const options = {
			attachments: [
				{
					filename: 'hours-sheet.ods',
					id: 'hours-sheet',
					mimetype: 'application/vnd.oasis.opendocument.spreadsheet',
					buffer: Buffer.from('test'),
					description: 'A detailed breakdown of the hours worked',
				},
				{
					filename: 'catalogue.pdf',
					mimetype: 'application/pdf',
					buffer: Buffer.from('test'),
				},
			],
			libreOfficePath: 'libreoffice',
		} as unknown as InvoiceServiceOptions;

		const xml = await service.generate(invoice, options);
		expect(xml).toMatchSnapshot();
	});

	it('should throw an error for invalid MIME types', async () => {
		const invoice: Invoice = { 'ubl:Invoice': {} } as unknown as Invoice;
		const options = {
			attachments: [
				{
					filename: 'hours-sheet.txt',
					id: 'hours-sheet',
					mimetype: 'text/plain',
					buffer: Buffer.from('test'),
					description: 'A detailed breakdown of the hours worked',
				},
				{
					filename: 'catalogue.pdf',
					mimetype: 'application/pdf',
					buffer: Buffer.from('test'),
				},
			],
			libreOfficePath: 'libreoffice',
		} as unknown as InvoiceServiceOptions;

		await expect(service.generate(invoice, options)).rejects.toThrow(
			"The attachment MIME type 'text/plain' is not allowed!",
		);
	});

	it('should throw an error if the filename is missing', async () => {
		const invoice: Invoice = { 'ubl:Invoice': {} } as unknown as Invoice;
		const options = {
			attachments: [
				{
					filename: 'hours-sheet.ods',
					id: 'hours-sheet',
					mimetype: 'application/vnd.oasis.opendocument.spreadsheet',
					buffer: Buffer.from('test'),
					description: 'A detailed breakdown of the hours worked',
				},
				{
					mimetype: 'application/pdf',
					buffer: Buffer.from('test'),
				},
			],
			libreOfficePath: 'libreoffice',
		} as unknown as InvoiceServiceOptions;

		await expect(service.generate(invoice, options)).rejects.toThrow(
			'The attachment filename is required!',
		);
	});

	it('should throw an error if the filename is missing', async () => {
		const invoice: Invoice = { 'ubl:Invoice': {} } as unknown as Invoice;
		const options = {
			attachments: [
				{
					filename: 'hours-sheet.ods',
					id: 'hours-sheet',
					mimetype: 'application/vnd.oasis.opendocument.spreadsheet',
					buffer: Buffer.from('test'),
					description: 'A detailed breakdown of the hours worked',
				},
				{
					filename: 'catalogue.pdf',
					mimetype: 'application/pdf',
				},
			],
			libreOfficePath: 'libreoffice',
		} as unknown as InvoiceServiceOptions;

		await expect(service.generate(invoice, options)).rejects.toThrow(
			'The attachment buffer is required!',
		);
	});

	describe('post-processing', () => {
		const defaultNotes = [
			'Buy a dozen donuts at the Kwik-E-Mart and instantly become' +
				' Homer-level happy—guaranteed to make your cat ignore you!',
			"Order Bart's Skateboard Deluxe 3000 from the Simpson Garage" +
				" because it's the only board that survives a launch over" +
				" Grandpa's dentures!",
		];

		const postProcessor = async (data: ExpandObject) => {
			const document = data['Invoice'] ?? data['CreditNote'];
			const notes = document['cbc:Note'];

			if (notes) {
				notes.push(...defaultNotes);
			} else {
				document['cbc:Note'] = [...defaultNotes];
			}
		};

		it('should append default notes to invoice notes', async () => {
			const invoice: Invoice = {
				'ubl:Invoice': {
					'cbc:ID': '1234567890',
					'cbc:InvoiceTypeCode': '380',
					'cbc:Note': ['Please send complaints to devnull@us.com'],
				},
			} as unknown as Invoice;
			const options = {
				postProcessor,
			} as InvoiceServiceOptions;

			const xml = await service.generate(invoice, options);
			expect(xml).toMatchSnapshot();
		});

		it('should append default notes to credit-note notes', async () => {
			const invoice: Invoice = {
				'ubl:Invoice': {
					'cbc:ID': '1234567890',
					'cbc:InvoiceTypeCode': '381',
					'cbc:Note': ['Please send complaints to devnull@us.com'],
				},
			} as unknown as Invoice;
			const options = {
				postProcessor,
			} as InvoiceServiceOptions;

			const xml = await service.generate(invoice, options);
			expect(xml).toMatchSnapshot();
		});
	});
});
