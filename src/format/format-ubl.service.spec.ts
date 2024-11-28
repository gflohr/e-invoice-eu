import { Test, TestingModule } from '@nestjs/testing';

import { FormatUBLService } from './format-ubl.service';
import { Invoice } from '../invoice/invoice.interface';
import { InvoiceServiceOptions } from '../invoice/invoice.service';
import { Mapping } from '../mapping/mapping.interface';
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

	it('should order mapping keys correctly', () => {
		const mapping = {
			'ubl:Invoice': {
				'cbc:ID': '1234567890',
			},
		} as unknown as Mapping;

		service.fillMappingDefaults(mapping);
		expect(Object.keys(mapping['ubl:Invoice'])).toEqual([
			'cbc:CustomizationID',
			'cbc:ProfileID',
			'cbc:ID',
		]);
	});

	it('should order invoice keys correctly', () => {
		const invoice = {
			'ubl:Invoice': {
				'cbc:ID': '1234567890',
			},
		} as unknown as Invoice;

		service.fillInvoiceDefaults(invoice);
		expect(Object.keys(invoice['ubl:Invoice'])).toEqual([
			'cbc:CustomizationID',
			'cbc:ProfileID',
			'cbc:ID',
		]);
	});

	it('should generate XML', () => {
		const invoice: Invoice = { 'ubl:Invoice': {} } as unknown as Invoice;
		const options = {} as InvoiceServiceOptions;

		expect(service.generate(invoice, options)).toMatchSnapshot();
	});
});
