import { FormatFacturXBasicService } from './format-factur-x-basic.service';

describe('Factur-X-Basic', () => {
	let service: FormatFacturXBasicService;

	beforeEach(async () => {
		service = new FormatFacturXBasicService();
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
