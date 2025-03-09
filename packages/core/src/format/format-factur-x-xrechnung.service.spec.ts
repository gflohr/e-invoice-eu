import { FormatFacturXXRechnungService } from './format-factur-x-xrechnung.service';

describe('Factur-X-XRechnung', () => {
	let service: FormatFacturXXRechnungService;

	beforeEach(async () => {
		service = new FormatFacturXXRechnungService();
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
