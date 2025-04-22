import { FormatFactoryService } from './format.factory.service';

describe('XRECHNUNG-UBL', () => {
	let service: FormatFactoryService;
	const logger = {
		log: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
	};

	beforeEach(async () => {
		service = new FormatFactoryService();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should throw an exception for unknown format serviceces', () => {
		expect(() => service.createFormatService('ZIRKUSFeRD', logger)).toThrow(
			"Format 'ZIRKUSFeRD' is not supported.",
		);
	});

	it('should create a UBL format service', () => {
		expect(service.createFormatService('UBL', logger)).toBeDefined();
	});

	it('should treat format identifiers case-insensitively', () => {
		expect(service.createFormatService('uBl', logger)).toBeDefined();
	});

	it('should create an XRECHNUNG-UBL format service', () => {
		expect(service.createFormatService('XRECHNUNG-UBL', logger)).toBeDefined();
	});

	it('should list all formats alphabetically', () => {
		const allFormats = service.listFormatServices().map(f => f.name);
		expect(allFormats).toEqual([
			'CII',
			'Factur-X-Basic',
			'Factur-X-Basic WL',
			'Factur-X-EN16931',
			'Factur-X-Extended',
			'Factur-X-Minimum',
			'Factur-X-XRechnung',
			'UBL',
			'XRECHNUNG-CII',
			'XRECHNUNG-UBL',
		]);
	});

	it('should report information about a format', () => {
		const info = service.describeFormat('Factur-X-Extended');
		expect(info).toBeDefined();
		expect(info.name).toBe('factur-x-extended');
		expect(info.mimeType).toBe('application/pdf');
		expect(info.syntax).toBe('CII');
	});

	it('should throw an exception when requesting an unsupported format', () => {
		expect(() => service.describeFormat('ZIRKUSFeRD-Extended')).toThrow("Format 'ZIRKUSFeRD-Extended' is not supported.");
	});
});
