import { Invoice, Mapping } from '@e-invoice-eu/core';

jest.mock('../utils/render-spreadsheet', () => ({
	renderSpreadsheet: jest.fn(async () => new Uint8Array([73, 110, 118, 111, 105, 99, 101])),
}));

import { FormatUBLService } from './format-ubl.service';
import { InvoiceServiceOptions } from '../invoice/invoice.service';

describe('UBL', () => {
	let service: FormatUBLService;
	const mockLogger = {
		log: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
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
});
