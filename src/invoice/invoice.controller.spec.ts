import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { InvoiceController } from './invoice.controller';
import { FormatFactoryService } from '../format/format.factory.service';
import { MappingService } from '../mapping/mapping.service';
import { SerializerService } from '../serializer/serializer.service';

describe('InvoiceController', () => {
	let controller: InvoiceController;

	const mockedLogger = {
		error: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [InvoiceController],
			providers: [
				{
					provide: FormatFactoryService,
					useValue: {},
				},
				{
					provide: MappingService,
					useValue: {
						transform: jest.fn(),
					},
				},
				{
					provide: SerializerService,
					useValue: {
						transform: jest.fn(),
					},
				},
				{
					provide: Logger,
					useValue: mockedLogger,
				},
			],
		}).compile();

		controller = module.get<InvoiceController>(InvoiceController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
