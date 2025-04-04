import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { FormatFactoryService } from './format.factory.service';
import { AppConfigService } from '../app-config/app-config.service';

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
			],
		}).compile();

		service = module.get<FormatFactoryService>(FormatFactoryService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should throw an exception for unknown format serviceces', () => {
		expect(() =>
			service.createFormatService('ZIRKUSFeRD', {} as unknown as Logger),
		).toThrow("Format 'ZIRKUSFeRD' not supported.");
	});

	it('should create a UBL format service', () => {
		expect(
			service.createFormatService('UBL', {} as unknown as Logger),
		).toBeDefined();
	});

	it('should treat format identifiers case-insensitively', () => {
		expect(
			service.createFormatService('uBl', {} as unknown as Logger),
		).toBeDefined();
	});

	it('should create an XRECHNUNG-UBL format service', () => {
		expect(
			service.createFormatService('XRECHNUNG-UBL', {} as unknown as Logger),
		).toBeDefined();
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
