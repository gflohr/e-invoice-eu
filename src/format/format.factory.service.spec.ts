import { Test, TestingModule } from '@nestjs/testing';

import { FormatFactoryService } from './format.factory.service';
import { SerializerService } from '../serializer/serializer.service';

describe('XRECHNUNG-UBL', () => {
	let service: FormatFactoryService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
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

	it('should create an XRECHNUNG-UBL format service', () => {
		expect(service.createFormatService('XRECHNUNG-UBL')).toBeDefined();
	});

	it('should list all formats alphabetically', () => {
		const allFormats = service.listFormatServices().map(f => f.name);
		expect(allFormats).toEqual(['UBL', 'XRECHNUNG-UBL']);
	});
});
