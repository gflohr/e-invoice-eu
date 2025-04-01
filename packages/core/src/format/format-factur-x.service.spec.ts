import { Textdomain } from "@esgettext/runtime";
import { PDFDocument } from "pdf-lib";

import { Invoice, InvoiceServiceOptions } from "../invoice";
import { FormatCIIService, FULL_CII } from "./format-cii.service";
import { FormatFacturXService } from "./format-factur-x.service";

const mockLogger = {
	log: jest.fn(),
	warn: jest.fn(),
	error: jest.fn(),
};

const mockInvoice = {
	'ubl:Invoice': {
		'cbc:ID': '42',
		'cbc:IssueDate': '2025-03-31',
		'cac:AccountingSupplierParty': {
			'cac:Party': {
				'cac:PartyLegalEntity': {
					'cbc:RegistrationName': 'Acme Ltd.',
				},
			},
		},
	},
} as Invoice;

describe('FormatFacturXService', () => {
	let service: FormatFacturXService;
	let mockOptions: InvoiceServiceOptions;

	beforeEach(async () => {
		service = new FormatFacturXService(mockLogger);

		jest.spyOn(FormatCIIService.prototype, 'generate').mockResolvedValue('<invoice></invoice>');

		const pdfDoc = await PDFDocument.create();
		pdfDoc.addPage([600, 800]);
		mockOptions = {
			format: 'Factur-X-Extended',
			lang: 'ab-cd',
			pdf: {
				buffer: await pdfDoc.save(),
				filename: 'invoice.pdf',
				mimetype: 'application/pdf',
			},
		} as InvoiceServiceOptions;
	});

	describe(('general features'), () => {
		it('should be defined', () => {
			expect(service).toBeDefined();
		});

		it('should have the FULL_CII profile', () => {
			expect(service.fxProfile).toBe(FULL_CII);
		});
	});

	describe('i18n', () => {
		it('should initialize the textdomain', async () => {
			await service.generate(mockInvoice, mockOptions);

			const locale = mockOptions.lang.replace(/^([a-z]{2})-([a-z]{2})$/i, (_, lang, country) =>
				`${lang.toLowerCase()}-${country.toUpperCase()}`
			  );
			expect(Textdomain.locale).toBe(locale);
		});
	});
});
