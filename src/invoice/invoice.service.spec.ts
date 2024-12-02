import { Test, TestingModule } from '@nestjs/testing';

import { Invoice } from './invoice.interface';
import { InvoiceService } from './invoice.service';
import { AppConfigService } from '../app-config/app-config.service';
import { FormatFactoryService } from '../format/format.factory.service';
import { SerializerService } from '../serializer/serializer.service';

describe('InvoiceService', () => {
	let service: InvoiceService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				InvoiceService,
				AppConfigService,
				{
					provide: 'AppConfigService',
					useValue: {},
				},
				FormatFactoryService,
				{
					provide: 'FormatFactoryService',
					useValue: {},
				},
				SerializerService,
				{
					provide: 'SerializerService',
					useValue: {},
				},
			],
		}).compile();

		service = module.get<InvoiceService>(InvoiceService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should create an invoice', async () => {
		const invoice: Invoice = { 'ubl:Invoice': {} } as unknown as Invoice;
		const got = await service.generate(invoice, {
			format: 'UBL',
			attachments: [],
		});

		expect(got).toMatchSnapshot();
	});
});
