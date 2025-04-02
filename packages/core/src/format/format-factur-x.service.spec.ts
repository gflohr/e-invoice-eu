import { Textdomain } from '@esgettext/runtime';
import {
	decodePDFRawStream,
	PDFArray,
	PDFDocument,
	PDFName,
	PDFNumber,
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

async function createTestPDF(): Promise<PDFDocument> {
	const pdfDoc = await PDFDocument.create();
	const page = pdfDoc.addPage([600, 800]);
	const linkAnnotation = pdfDoc.context.obj({
		Type: 'Annot',
		Subtype: 'Link',
		Rect: [100, 700, 200, 750],
		Border: [0, 0, 0],
		C: [1, 0, 0],
		A: {
			Type: 'Action',
			S: 'URI',
			URI: 'https://example.com',
		},
		F: PDFNumber.of(0),
	});

	const linkAnnotationRef = pdfDoc.context.register(linkAnnotation);

	let annotations = page.node.get(PDFName.of('Annots')) as PDFArray | undefined;
	if (!annotations) {
		annotations = pdfDoc.context.obj([]) as PDFArray;
		page.node.set(PDFName.of('Annots'), annotations);
	}
	annotations.push(linkAnnotationRef);

	return pdfDoc;
}

describe('FormatFacturXService', () => {
	let service: FormatFacturXService;
	let mockOptions: InvoiceServiceOptions;

	beforeEach(async () => {
		service = new FormatFacturXService(mockLogger);

		jest
			.spyOn(FormatCIIService.prototype, 'generate')
			.mockResolvedValue('<invoice></invoice>');

		const pdfDoc = await createTestPDF();

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

		it('should throw an exception if attaching the Factur-X XML fails', async () => {
			const attachMock = jest.spyOn(PDFDocument.prototype, 'attach').mockRejectedValue('no string attached');
			const consoleMock = jest.spyOn(globalThis.console, 'error').mockImplementation(() => {});

			try {
				await expect(service.generate(mockInvoice, mockOptions)).rejects.toThrow(
					'Error attaching Factur-X XML file to PDF: no string attached',
				);
			} finally {
				expect(attachMock).toHaveBeenCalledTimes(1);
				expect(consoleMock).toHaveBeenCalledTimes(1);
				expect(consoleMock).toHaveBeenCalledWith(
					'Error attaching Factur-X XML file to PDF: no string attached',
				);
				attachMock.mockRestore();
				consoleMock.mockRestore();
			}
		});

		it('should throw an exception for unknown formats', async () => {
			mockOptions.format = 'ZirkusFErD-Extended';
			await expect(service.generate(mockInvoice, mockOptions)).rejects.toThrow(
				"unknown Factur-X format 'ZirkusFErD-Extended'",
			);
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

		it('should add XMP metadata for Factur-X-XRechnung', async () => {
			mockOptions.format = 'Factur-X-XRechnung';

			const pdfBytes = await service.generate(mockInvoice, mockOptions);

			expect(await extractXMPMetadata(pdfBytes)).toMatchSnapshot();
		});
	});
});
