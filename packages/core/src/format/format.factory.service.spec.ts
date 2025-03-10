import { FormatFactoryService } from './format.factory.service';

describe('XRECHNUNG-UBL', () => {
	let service: FormatFactoryService;

	beforeEach(async () => {
		service = new FormatFactoryService();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should throw an exception for unknown format serviceces', () => {
		expect(() => service.createFormatService('ZIRKUSFeRD')).toThrow(
			"Format 'ZIRKUSFeRD' not supported.",
		);
	});

	it('should create a UBL format service', () => {
		expect(service.createFormatService('UBL')).toBeDefined();
	});

	it('should treat format identifiers case-insensitively', () => {
		expect(service.createFormatService('uBl')).toBeDefined();
	});

	it('should create an XRECHNUNG-UBL format service', () => {
		expect(service.createFormatService('XRECHNUNG-UBL')).toBeDefined();
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
});
