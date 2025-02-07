import { Test, TestingModule } from '@nestjs/testing';

import { FormatXRECHNUNGUBLService } from './format-xrechnung-ubl.service';
import { AppConfigService } from '../app-config/app-config.service';

describe('XRECHNUNG-UBL', () => {
	let service: FormatXRECHNUNGUBLService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				FormatXRECHNUNGUBLService,
				AppConfigService,
				{
					provide: 'AppConfigService',
					useValue: {},
				},
			],
		}).compile();

		service = module.get<FormatXRECHNUNGUBLService>(FormatXRECHNUNGUBLService);
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
