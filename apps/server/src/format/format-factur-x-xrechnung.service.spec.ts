import { Test, TestingModule } from '@nestjs/testing';

import { FormatFacturXXRechnungService } from './format-factur-x-xrechnung.service';
import { AppConfigService } from '../app-config/app-config.service';

describe('Factur-X-XRechnung', () => {
	let service: FormatFacturXXRechnungService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				FormatFacturXXRechnungService,
				AppConfigService,
				{
					provide: 'AppConfigService',
					useValue: {},
				},
			],
		}).compile();

		service = module.get<FormatFacturXXRechnungService>(
			FormatFacturXXRechnungService,
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
