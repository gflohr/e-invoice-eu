import { Test, TestingModule } from '@nestjs/testing';

import { FormatFacturXBasicService } from './format-factur-x-basic.service';
import { AppConfigService } from '../app-config/app-config.service';
import { SerializerService } from '../serializer/serializer.service';

describe('Factur-X-Basic', () => {
	let service: FormatFacturXBasicService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				FormatFacturXBasicService,
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

		service = module.get<FormatFacturXBasicService>(FormatFacturXBasicService);
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
