import { FormatXRECHNUNGUBLService } from './format-xrechnung-ubl.service';

describe('XRECHNUNG-UBL', () => {
	let service: FormatXRECHNUNGUBLService;

	beforeEach(async () => {
		service = new FormatXRECHNUNGUBLService();
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
