import { Test, TestingModule } from '@nestjs/testing';
import { FormatService } from './format.service';

describe('FormatService', () => {
	let service: FormatService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [FormatService],
		}).compile();

		service = module.get<FormatService>(FormatService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
