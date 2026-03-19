import {
	AFRelationship,
	decodePDFRawStream,
	PDFArray,
	PDFDict,
	PDFDocument,
	PDFHexString,
	PDFName,
	PDFNumber,
	PDFRawStream,
	PDFStream,
	PDFString,
} from '@cantoo/pdf-lib';
import { Textdomain } from '@esgettext/runtime';

import { Invoice, InvoiceServiceOptions } from '../invoice';
import { FormatCIIService, FULL_CII } from './format-cii.service';
import { FormatFacturXService } from './format-factur-x.service';
import { Package } from '../package';

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

const extractRawAttachments = (
	pdfDoc: PDFDocument,
): { fileName: PDFHexString | PDFString; fileSpec: PDFDict }[] => {
	if (!pdfDoc.catalog.has(PDFName.of('Names'))) return [];
	const Names = pdfDoc.catalog.lookup(PDFName.of('Names'), PDFDict);

	if (!Names.has(PDFName.of('EmbeddedFiles'))) return [];
	const EmbeddedFiles = Names.lookup(PDFName.of('EmbeddedFiles'), PDFDict);

	if (!EmbeddedFiles.has(PDFName.of('Names'))) return [];
	const EFNames = EmbeddedFiles.lookup(PDFName.of('Names'), PDFArray);

	const rawAttachments: {
		fileName: PDFHexString | PDFString;
		fileSpec: PDFDict;
	}[] = [];
	for (let idx = 0, len = EFNames.size(); idx < len; idx += 2) {
		const fileName = EFNames.lookup(idx) as PDFHexString | PDFString;
		const fileSpec = EFNames.lookup(idx + 1, PDFDict);
		rawAttachments.push({ fileName, fileSpec });
	}

	return rawAttachments;
};

type Attachment = {
	name: string;
	data: Uint8Array<ArrayBufferLike>;
	mimeType: string | undefined;
	afRelationship: AFRelationship;
	description: string;
};

const extractAttachments = (pdfDoc: PDFDocument): Attachment[] => {
	const rawAttachments = extractRawAttachments(pdfDoc);

	return rawAttachments.map(({ fileName, fileSpec }) => {
		const stream = fileSpec
			.lookup(PDFName.of('EF'), PDFDict)
			.lookup(PDFName.of('F'), PDFStream) as PDFRawStream;

		const afr = fileSpec.lookup(PDFName.of('AFRelationship'));
		const afRelationship =
			afr instanceof PDFName
				? afr.toString().slice(1) // Remove leading slash
				: afr instanceof PDFString
					? afr.decodeText()
					: undefined;

		const embeddedFileDict = stream.dict;
		const subtype = embeddedFileDict.lookup(PDFName.of('Subtype'));

		const mimeType =
			subtype instanceof PDFName
				? subtype.toString().slice(1)
				: subtype instanceof PDFString
					? subtype.decodeText()
					: undefined;

		const description = (
			fileSpec.lookup(PDFName.of('Desc')) as PDFHexString
		).decodeText();

		return {
			name: fileName.decodeText(),
			data: decodePDFRawStream(stream).decode(),
			mimeType: mimeType?.replace(/#([0-9A-Fa-f]{2})/g, (_, hex) =>
				String.fromCharCode(parseInt(hex, 16)),
			),
			afRelationship: afRelationship as AFRelationship,
			description,
		};
	});
};

describe('FormatFacturXService', () => {
	let service: FormatFacturXService;
	let mockOptions: InvoiceServiceOptions;

	beforeAll(() => {
		jest.spyOn(Package, 'getVersion').mockReturnValue('VERSION');
	});

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
		let originalGetTimezoneOffset: () => number;

		beforeAll(() => {
			jest.useFakeTimers().setSystemTime(new Date('2025-04-01T12:00:00Z'));

			// useFakeTimers() does not honour the TZ environment variable.
			// We have to monkey patch getTimezoneOffset() instead.
			originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
			Date.prototype.getTimezoneOffset = () => -120;
		});

		afterAll(() => {
			Date.prototype.getTimezoneOffset = originalGetTimezoneOffset;
			jest.useRealTimers();
		});

		it('should add XMP metadata for Factur-X-Minimum', async () => {
			mockOptions.format = 'Factur-X-Minimum';

			const pdfBytes = await service.generate(mockInvoice, mockOptions);

			expect(await extractXMPMetadata(pdfBytes)).toMatchSnapshot();
		});

		it('should add XMP metadata for Factur-X-Basic WL', async () => {
			mockOptions.format = 'Factur-X-Basic WL';

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

		it('should work in western timezones', async () => {
			const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
			// This is the timezone of Greenland, not of the US! ;)
			Date.prototype.getTimezoneOffset = () => +60;

			const pdfBytes = await service.generate(mockInvoice, mockOptions);

			expect(await extractXMPMetadata(pdfBytes)).toMatchSnapshot();

			Date.prototype.getTimezoneOffset = originalGetTimezoneOffset;
		});
	});

	describe('XML attachment to PDF', () => {
		it("should use 'factur-x.xml' as the filename for Factur-X-Minimum", async () => {
			mockOptions.format = 'Factur-X-Minimum';

			const pdfBytes = await service.generate(mockInvoice, mockOptions);
			expect(pdfBytes).toBeInstanceOf(Uint8Array);

			const pdfDoc = await PDFDocument.load(pdfBytes);
			const attachments = extractAttachments(pdfDoc);

			expect(attachments.length).toBe(1);
			const attachment = attachments[0];
			expect(attachment.name).toBe('factur-x.xml');
			expect(attachment.mimeType).toBe('text/xml');
			expect(attachment.afRelationship).toBe(AFRelationship.Alternative);
			expect(attachment.description).toBe('Factur-X');
		});

		it("should use 'factur-x.xml' as the filename for Factur-X-BasicWL", async () => {
			mockOptions.format = 'Factur-X-Basic WL';

			const pdfBytes = await service.generate(mockInvoice, mockOptions);
			expect(pdfBytes).toBeInstanceOf(Uint8Array);

			const pdfDoc = await PDFDocument.load(pdfBytes);
			const attachments = extractAttachments(pdfDoc);

			expect(attachments.length).toBe(1);
			const attachment = attachments[0];
			expect(attachment.name).toBe('factur-x.xml');
			expect(attachment.mimeType).toBe('text/xml');
			expect(attachment.afRelationship).toBe(AFRelationship.Alternative);
			expect(attachment.description).toBe('Factur-X');
		});

		it("should use 'factur-x.xml' as the filename for Factur-X-Basic", async () => {
			mockOptions.format = 'Factur-X-Basic';

			const pdfBytes = await service.generate(mockInvoice, mockOptions);
			expect(pdfBytes).toBeInstanceOf(Uint8Array);

			const pdfDoc = await PDFDocument.load(pdfBytes);
			const attachments = extractAttachments(pdfDoc);

			expect(attachments.length).toBe(1);
			const attachment = attachments[0];
			expect(attachment.name).toBe('factur-x.xml');
			expect(attachment.mimeType).toBe('text/xml');
			expect(attachment.afRelationship).toBe(AFRelationship.Alternative);
			expect(attachment.description).toBe('Factur-X');
		});

		it("should use 'factur-x.xml' as the filename for Factur-X-EN16931", async () => {
			mockOptions.format = 'Factur-X-EN16931';

			const pdfBytes = await service.generate(mockInvoice, mockOptions);
			expect(pdfBytes).toBeInstanceOf(Uint8Array);

			const pdfDoc = await PDFDocument.load(pdfBytes);
			const attachments = extractAttachments(pdfDoc);

			expect(attachments.length).toBe(1);
			const attachment = attachments[0];
			expect(attachment.name).toBe('factur-x.xml');
			expect(attachment.mimeType).toBe('text/xml');
			expect(attachment.afRelationship).toBe(AFRelationship.Alternative);
			expect(attachment.description).toBe('Factur-X');
		});

		it("should use 'factur-x.xml' as the filename for Factur-X-Extended", async () => {
			mockOptions.format = 'Factur-X-Extended';

			const pdfBytes = await service.generate(mockInvoice, mockOptions);
			expect(pdfBytes).toBeInstanceOf(Uint8Array);

			const pdfDoc = await PDFDocument.load(pdfBytes);
			const attachments = extractAttachments(pdfDoc);

			expect(attachments.length).toBe(1);
			const attachment = attachments[0];
			expect(attachment.name).toBe('factur-x.xml');
			expect(attachment.mimeType).toBe('text/xml');
			expect(attachment.afRelationship).toBe(AFRelationship.Alternative);
			expect(attachment.description).toBe('Factur-X');
		});

		it("should use 'xrechnung.xml' as the filename for Factur-X-XRechnung", async () => {
			mockOptions.format = 'Factur-X-XRechnung';

			const pdfBytes = await service.generate(mockInvoice, mockOptions);
			expect(pdfBytes).toBeInstanceOf(Uint8Array);

			const pdfDoc = await PDFDocument.load(pdfBytes);
			const attachments = extractAttachments(pdfDoc);

			expect(attachments.length).toBe(1);
			const attachment = attachments[0];
			expect(attachment.name).toBe('xrechnung.xml');
			expect(attachment.mimeType).toBe('text/xml');
			expect(attachment.afRelationship).toBe(AFRelationship.Alternative);
			expect(attachment.description).toBe('Factur-X');
		});

		it('should not modify the attachment', async () => {
			mockOptions.format = 'Factur-X-XRechnung';

			const pdfBytes = await service.generate(mockInvoice, mockOptions);
			expect(pdfBytes).toBeInstanceOf(Uint8Array);

			const pdfDoc = await PDFDocument.load(pdfBytes);
			const attachments = extractAttachments(pdfDoc);

			expect(attachments.length).toBe(1);
			const attachment = attachments[0];
			const xml = new TextDecoder().decode(attachment.data);
			expect(xml).toBe('<invoice></invoice>');
		});

		it('should throw an exception if attaching the Factur-X XML fails', async () => {
			const attachMock = jest
				.spyOn(PDFDocument.prototype, 'attach')
				.mockRejectedValue('no string attached');
			const consoleMock = jest
				.spyOn(globalThis.console, 'error')
				.mockImplementation(() => {});

			try {
				await expect(
					service.generate(mockInvoice, mockOptions),
				).rejects.toThrow(
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
	});

	describe('Attachments', () => {
		it('should attach supplementary files', async () => {
			mockOptions.attachments = [
				{
					filename: 'hour-sheet.ods',
					buffer: Buffer.from('hour sheet'),
					mimetype: 'application/vnd.oasis.opendocument.spreadsheet',
				},
				{
					filename: 'catalogue.pdf',
					buffer: Buffer.from('our products'),
					mimetype: 'application/pdf',
					id: 'catalogue', // Ignored for Factur-X.
					description: 'All the products that we offer',
				},
			];

			const pdfBytes = await service.generate(mockInvoice, mockOptions);
			const pdfDoc = await PDFDocument.load(pdfBytes);
			const attachments = extractAttachments(pdfDoc);

			expect(attachments.length).toBe(3);

			const invoiceAttachments = attachments.filter(
				a => a.name === 'factur-x.xml',
			);
			expect(invoiceAttachments.length).toBe(1);
			expect(invoiceAttachments[0].name).toBe('factur-x.xml');
			expect(invoiceAttachments[0].mimeType).toBe('text/xml');
			expect(invoiceAttachments[0].afRelationship).toBe(
				AFRelationship.Alternative,
			);
			expect(invoiceAttachments[0].description).toBe('Factur-X');

			const hoursheetAttachments = attachments.filter(
				a => a.name === 'hour-sheet.ods',
			);
			expect(hoursheetAttachments.length).toBe(1);
			expect(hoursheetAttachments[0].name).toBe('hour-sheet.ods');
			expect(hoursheetAttachments[0].mimeType).toBe(
				'application/vnd.oasis.opendocument.spreadsheet',
			);
			expect(hoursheetAttachments[0].afRelationship).toBe(
				AFRelationship.Supplement,
			);
			expect(hoursheetAttachments[0].description).toBe('Supplementary file');

			const catalogueAttachments = attachments.filter(
				a => a.name === 'catalogue.pdf',
			);
			expect(catalogueAttachments.length).toBe(1);
			expect(catalogueAttachments[0].name).toBe('catalogue.pdf');
			expect(catalogueAttachments[0].mimeType).toBe('application/pdf');
			expect(catalogueAttachments[0].afRelationship).toBe(
				AFRelationship.Supplement,
			);
			expect(catalogueAttachments[0].description).toBe(
				'All the products that we offer',
			);
		});
	});

	describe('crypto API', () => {
		it('should return window.crypto.subtle when running in browser', async () => {
			const subtleMock = {
				digest: jest.fn(),
			} as unknown as SubtleCrypto;
			(globalThis as any).window = {
				crypto: { subtle: subtleMock },
			};

			await service.generate(mockInvoice, mockOptions);
			expect(subtleMock.digest).toHaveBeenCalledTimes(1);
			expect(subtleMock.digest).toHaveBeenCalledWith(
				'SHA-512',
				expect.anything(),
			);

			delete (globalThis as any).window;
		});

		it('should return globalThis.crypto.subtle in Node with webcrypto', async () => {
			const subtleMock = {
				digest: jest.fn(),
			} as unknown as SubtleCrypto;

			const savedCrypto = (globalThis as any).crypto;
			(globalThis as any).crypto = { subtle: subtleMock };

			await service.generate(mockInvoice, mockOptions);

			expect(subtleMock.digest).toHaveBeenCalledTimes(1);
			expect(subtleMock.digest).toHaveBeenCalledWith(
				'SHA-512',
				expect.anything(),
			);

			(globalThis as any).crypto = savedCrypto;
		});

		it('should use webcrypto.subtle where applicable', () => {
			const savedCrypto = (globalThis as any).crypto;
			delete (globalThis as any).crypto;

			const customRequire = jest.fn().mockImplementation((module: string) => {
				if (module === 'crypto') {
					return { webcrypto: { subtle: 'catchme' } };
				}

				throw new Error(`Module ${module} not found`);
			});

			expect(service['getCrypto'](customRequire)).toBe('catchme');
			(globalThis as any).crypto = savedCrypto;
		});

		it('should throw if webcrypto.subtle is not available in an environment', () => {
			const savedCrypto = (globalThis as any).crypto;
			delete (globalThis as any).crypto;

			const customRequire = jest.fn().mockImplementation((module: string) => {
				throw new Error(`Module ${module} not found`);
			});

			try {
				expect(() => service['getCrypto'](customRequire)).toThrow(
					'Web Crypto API is not available in this environment',
				);
			} finally {
				(globalThis as any).crypto = savedCrypto;
			}
		});

		it('should throw if no crypto API is available', () => {
			const savedCrypto = (globalThis as any).crypto;
			delete (globalThis as any).crypto;

			try {
				expect(() => service['getCrypto']()).toThrow(
					'Web Crypto API is not available',
				);
			} finally {
				(globalThis as any).crypto = savedCrypto;
			}
		});
	});
});
