import { Test, TestingModule } from '@nestjs/testing';

import { FormatUBLService } from './format-ubl.service';
import { AppConfigService } from '../app-config/app-config.service';
import { Invoice } from '../invoice/invoice.interface';
import { InvoiceServiceOptions } from '../invoice/invoice.service';
import { Mapping } from '../mapping/mapping.interface';

describe('UBL', () => {
	let service: FormatUBLService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				FormatUBLService,
				AppConfigService,
				{
					provide: 'AppConfigService',
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

	it('should fill in mapping defaults', () => {
		const mapping = { 'ubl:Invoice': {} } as unknown as Mapping;

		service.fillMappingDefaults(mapping);
		expect(mapping['ubl:Invoice']['cbc:CustomizationID']).toBe(
			service.customizationID,
		);
		expect(mapping['ubl:Invoice']['cbc:ProfileID']).toBe(service.profileID);
	});

	it('should fill in invoice defaults', () => {
		const invoice = { 'ubl:Invoice': {} } as unknown as Invoice;

		service.fillInvoiceDefaults(invoice);
		expect(invoice['ubl:Invoice']['cbc:CustomizationID']).toBe(
			service.customizationID,
		);
		expect(invoice['ubl:Invoice']['cbc:ProfileID']).toBe(service.profileID);
	});

	it('should generate XML', async () => {
		const invoice: Invoice = { 'ubl:Invoice': {} } as unknown as Invoice;
		const options = { attachments: [] } as unknown as InvoiceServiceOptions;

		const xml = await service.generate(invoice, options);

		expect(xml).toMatchSnapshot();
	});
});
