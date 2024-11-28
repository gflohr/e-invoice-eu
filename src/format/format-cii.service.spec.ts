import { Test, TestingModule } from '@nestjs/testing';

import { FormatCIIService } from './format-cii.service';
import { Invoice } from '../invoice/invoice.interface';
import { InvoiceServiceOptions } from '../invoice/invoice.service';
import { SerializerService } from '../serializer/serializer.service';

describe('CII', () => {
	let service: FormatCIIService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				FormatCIIService,
				SerializerService,
				{
					provide: 'SerializerService',
					useValue: {},
				},
			],
		}).compile();

		service = module.get<FormatCIIService>(FormatCIIService);
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

	it('should convert string values', () => {
		const invoice: Invoice = {
			'ubl:Invoice': {
				'cbc:CustomizationID': 'urn:cen.eu:en16931:2017',
				'cbc:ProfileID': 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0',
			},
		} as unknown as Invoice;
		const options = {} as InvoiceServiceOptions;
		const xml = service.generate(invoice, options);
		expect(xml).toMatchSnapshot();
	});

	it('should omit missing string values', () => {
		const invoice: Invoice = {
			'ubl:Invoice': {
				'cbc:CustomizationID': 'urn:cen.eu:en16931:2017',
			},
		} as unknown as Invoice;
		const options = {} as InvoiceServiceOptions;
		const xml = service.generate(invoice, options);
		expect(xml).toMatchSnapshot();
	});

	it('should convert arrays', () => {
		const invoice: Invoice = {
			'ubl:Invoice': {
				'cac:InvoiceLine': [
					{
						'cbc:ID': '1',
						'cac:Item': {
							'cbc:Name': 'Duff Beer by the Barrel',
						},
					},
					{
						'cbc:ID': '2',
						'cac:Item': {
							'cbc:Name': 'Do-It-Yourself Nuclear Power Plant Kit',
						},
					},
					{
						'cbc:ID': '3',
						'cac:Item': {
							'cbc:Name': 'Monorail Maintenance Fee ',
						},
					},
				],
			},
		} as unknown as Invoice;
		const options = {} as InvoiceServiceOptions;
		const xml = service.generate(invoice, options);
		expect(xml).toMatchSnapshot();
	});

	it('should encode date/time strings correctly', () => {
		const invoice: Invoice = {
			'ubl:Invoice': {
				'cbc:IssueDate': '2024-11-08',
			},
		} as unknown as Invoice;
		const options = {} as InvoiceServiceOptions;
		const xml = service.generate(invoice, options);
		expect(xml).toMatchSnapshot();
	});
});
