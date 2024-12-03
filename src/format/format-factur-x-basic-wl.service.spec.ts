import { Test, TestingModule } from '@nestjs/testing';

import { FormatFacturXBasicWLService } from './format-factur-x-basic-wl.service';
import { AppConfigService } from '../app-config/app-config.service';
import { SerializerService } from '../serializer/serializer.service';

describe('Factur-X-EN16931', () => {
	let service: FormatFacturXBasicWLService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				FormatFacturXBasicWLService,
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

		service = module.get<FormatFacturXBasicWLService>(
			FormatFacturXBasicWLService,
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