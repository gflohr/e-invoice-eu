import { Test, TestingModule } from '@nestjs/testing';

import { FormatFacturXExtendedService } from './format-factur-x-extended.service';
import { AppConfigService } from '../app-config/app-config.service';

describe('Factur-X-Extended', () => {
	let service: FormatFacturXExtendedService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				FormatFacturXExtendedService,
				AppConfigService,
				{
					provide: 'AppConfigService',
					useValue: {},
				},
			],
		}).compile();

		service = module.get<FormatFacturXExtendedService>(
			FormatFacturXExtendedService,
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
