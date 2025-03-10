import { FormatFacturXExtendedService } from './format-factur-x-extended.service';

describe('Factur-X-Extended', () => {
	let service: FormatFacturXExtendedService;

	beforeEach(async () => {
		service = new FormatFacturXExtendedService();
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
