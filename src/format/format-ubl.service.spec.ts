import { Test, TestingModule } from '@nestjs/testing';

import { FormatUBLService } from './format-ubl.service';
import { SerializerService } from '../serializer/serializer.service';

describe('UBL', () => {
	let service: FormatUBLService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				FormatUBLService,
				SerializerService,
				{
					provide: 'SerializerService',
					useValue: {},
				},
			],
		}).compile();

		service = module.get<FormatUBLService>(FormatUBLService);
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
