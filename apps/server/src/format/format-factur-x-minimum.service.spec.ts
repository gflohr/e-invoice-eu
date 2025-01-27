import { Test, TestingModule } from '@nestjs/testing';

import { FormatFacturXMinimumService } from './format-factur-x-minimum.service';
import { AppConfigService } from '../app-config/app-config.service';

describe('Factur-X-Minimum', () => {
	let service: FormatFacturXMinimumService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				FormatFacturXMinimumService,
				AppConfigService,
				{
					provide: 'AppConfigService',
					useValue: {},
				},
			],
		}).compile();

		service = module.get<FormatFacturXMinimumService>(
			FormatFacturXMinimumService,
		);
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
