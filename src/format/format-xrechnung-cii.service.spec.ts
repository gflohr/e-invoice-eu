import { Test, TestingModule } from '@nestjs/testing';

import { FormatXRECHNUNGCIIService } from './format-xrechnung-cii.service';
import { AppConfigService } from '../app-config/app-config.service';
import { SerializerService } from '../serializer/serializer.service';

describe('XRECHNUNG-CII', () => {
	let service: FormatXRECHNUNGCIIService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				FormatXRECHNUNGCIIService,
				AppConfigService,
				{
					provide: 'AppConfigService',
					useValue: {},
				},
				SerializerService,
				{
					provide: 'SerializerService',
					useValue: {},
				},
			],
		}).compile();

		service = module.get<FormatXRECHNUNGCIIService>(FormatXRECHNUNGCIIService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should have a customization id', () => {
		expect(service.customizationID).toBeDefined();
	});

	it('should have a profile id', () => {
		expect(service.profileID).toBeDefined();
	});
});
