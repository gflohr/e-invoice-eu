import { Test, TestingModule } from '@nestjs/testing';

import { FormatFactoryService } from './format.factory.service';
import { AppConfigService } from '../app-config/app-config.service';
import { SerializerService } from '../serializer/serializer.service';

describe('XRECHNUNG-UBL', () => {
	let service: FormatFactoryService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AppConfigService,
				{
					provide: 'AppConfigService',
					useValue: {},
				},
				FormatFactoryService,
				SerializerService,
				{
					provide: 'SerializerService',
					useValue: {},
				},
			],
		}).compile();

		service = module.get<FormatFactoryService>(FormatFactoryService);
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
			'Factur-X-EN16931',
			'Factur-X-Extended',
			'Factur-X-XRechnung',
			'UBL',
			'XRECHNUNG-UBL',
		]);
	});
});
