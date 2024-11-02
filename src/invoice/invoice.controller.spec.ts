import { Test, TestingModule } from '@nestjs/testing';

import { InvoiceController } from './invoice.controller';

describe('InvoiceController', () => {
	let controller: InvoiceController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [InvoiceController],
		}).compile();

		controller = module.get<InvoiceController>(InvoiceController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
