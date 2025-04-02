import { Textdomain } from '@esgettext/runtime';
import {
	decodePDFRawStream,
	PDFDocument,
	PDFName,
	PDFRawStream,
} from 'pdf-lib';

import { Invoice, InvoiceServiceOptions } from '../invoice';
import { FormatCIIService, FULL_CII } from './format-cii.service';
import { FormatFacturXService } from './format-factur-x.service';

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

async function extractXMPMetadata(
	pdfBytes: string | Uint8Array<ArrayBufferLike>,
): Promise<string> {
	const pdfDoc = await PDFDocument.load(pdfBytes);

	const metadataRef = pdfDoc.catalog.get(PDFName.of('Metadata'));
	expect(metadataRef).toBeDefined();

	const metadataStream = pdfDoc.context.lookup(metadataRef);
	expect(metadataStream).toBeInstanceOf(PDFRawStream);

	const rawStream = metadataStream as PDFRawStream;

	const decodedStream = decodePDFRawStream(rawStream).decode();
	expect(decodedStream).toBeInstanceOf(Uint8Array);

	return new TextDecoder('utf-8').decode(
		decodedStream as unknown as Uint8Array,
	);
}

describe('FormatFacturXService', () => {
	let service: FormatFacturXService;
	let mockOptions: InvoiceServiceOptions;

	beforeEach(async () => {
		service = new FormatFacturXService(mockLogger);

		jest
			.spyOn(FormatCIIService.prototype, 'generate')
			.mockResolvedValue('<invoice></invoice>');

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

	describe('general features', () => {
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

			const locale = mockOptions.lang.replace(
				/^([a-z]{2})-([a-z]{2})$/i,
				(_, lang, country) => `${lang.toLowerCase()}-${country.toUpperCase()}`,
			);
			expect(Textdomain.locale).toBe(locale);
		});
	});

	describe('XMP metadata', () => {
		beforeAll(() => {
			jest.useFakeTimers().setSystemTime(new Date('2025-04-01T12:00:00Z'));
		});

		afterAll(() => {
			jest.useRealTimers();
		});

		it('should add XMP metadata for Factur-X-Minimum', async () => {
			mockOptions.format = 'Factur-X-Minimum';

			const pdfBytes = await service.generate(mockInvoice, mockOptions);

			expect(await extractXMPMetadata(pdfBytes)).toMatchSnapshot();
		});

		it('should add XMP metadata for Factur-X-Basic WL', async () => {
			mockOptions.format = 'Factur-X-BasicWL';

			const pdfBytes = await service.generate(mockInvoice, mockOptions);

			expect(await extractXMPMetadata(pdfBytes)).toMatchSnapshot();
		});

		it('should add XMP metadata for Factur-X-Basic', async () => {
			mockOptions.format = 'Factur-X-Basic';

			const pdfBytes = await service.generate(mockInvoice, mockOptions);

			expect(await extractXMPMetadata(pdfBytes)).toMatchSnapshot();
		});

		it('should add XMP metadata for Factur-X-EN16931', async () => {
			mockOptions.format = 'Factur-X-EN16931';

			const pdfBytes = await service.generate(mockInvoice, mockOptions);

			expect(await extractXMPMetadata(pdfBytes)).toMatchSnapshot();
		});

		it('should add XMP metadata for Factur-X-Extended', async () => {
			const pdfBytes = await service.generate(mockInvoice, mockOptions);

			expect(await extractXMPMetadata(pdfBytes)).toMatchSnapshot();
		});

		it('should add XMP metadata for Factur-XRechnung', async () => {
			mockOptions.format = 'Factur-X-XRechnung';

			const pdfBytes = await service.generate(mockInvoice, mockOptions);

			expect(await extractXMPMetadata(pdfBytes)).toMatchSnapshot();
		});
	});
});
