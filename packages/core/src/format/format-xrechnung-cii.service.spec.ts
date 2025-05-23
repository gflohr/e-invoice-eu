import { Logger } from '../logger.interface';
import { FormatXRECHNUNGCIIService } from './format-xrechnung-cii.service';

describe('XRECHNUNG-CII', () => {
	let service: FormatXRECHNUNGCIIService;

	beforeEach(async () => {
		service = new FormatXRECHNUNGCIIService({} as unknown as Logger);
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
