import { Textdomain } from "@esgettext/runtime";

import { FileInfo, Invoice, InvoiceServiceOptions } from "../invoice";
import { FormatCIIService, FULL_CII } from "./format-cii.service";
import { FormatFacturXService } from "./format-factur-x.service";

jest.mock('@esgettext/runtime', () => ({
	Textdomain: {
		getInstance: jest.fn(),
	},
}));

jest.mock('pdf-lib', () => ({
	PDFDocument: {
		load: jest.fn().mockResolvedValue({
			save: jest.fn().mockResolvedValue(new Uint8Array()),
			attach: jest.fn(),
		}),
	},
	AFRelationship: {
		Alternative: 'whatever',
	}
}));

const mockLogger = {
	log: jest.fn(),
	warn: jest.fn(),
	error: jest.fn(),
};

const mockPdfFileInfo = {
	buffer: [] as unknown as Buffer,
	filename: 'invoice.pdf',
	mimetype: 'application/pdf',
} as FileInfo;

describe('FormatFacturXService', () => {
	let service: FormatFacturXService;
	let mockGtx: { resolve: jest.Mock };

	beforeEach(() => {
		service = new FormatFacturXService(mockLogger);

		mockGtx = { resolve: jest.fn().mockResolvedValue(undefined) };
		(Textdomain.getInstance as jest.Mock).mockReturnValue(mockGtx);

		jest.spyOn(service as any, 'createPDFA').mockImplementation(async () => {});
		jest.spyOn(FormatCIIService.prototype, 'generate').mockResolvedValue('<xml>Mocked XML</xml>');
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should have the FULL_CII profile', () => {
		expect(service.fxProfile).toBe(FULL_CII);
	});

	it('should initialize the textdomain', async () => {
		const invoice = {} as Invoice;
		const options = {
			lang: 'ab-cd',
			pdf: mockPdfFileInfo,
		} as InvoiceServiceOptions;

		await service.generate(invoice, options);
	});
});
