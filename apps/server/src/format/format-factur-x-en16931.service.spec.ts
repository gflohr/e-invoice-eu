import { Test, TestingModule } from '@nestjs/testing';

import { FormatFacturXEN16931Service } from './format-factur-x-en16931.service';
import { AppConfigService } from '../app-config/app-config.service';

describe('Factur-X-EN16931', () => {
	let service: FormatFacturXEN16931Service;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				FormatFacturXEN16931Service,
				AppConfigService,
				{
					provide: 'AppConfigService',
					useValue: {},
				},
			],
		}).compile();

		service = module.get<FormatFacturXEN16931Service>(
			FormatFacturXEN16931Service,
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
