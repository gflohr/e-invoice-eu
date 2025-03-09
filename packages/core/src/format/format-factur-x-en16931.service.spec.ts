import { FormatFacturXEN16931Service } from './format-factur-x-en16931.service';

describe('Factur-X-EN16931', () => {
	let service: FormatFacturXEN16931Service;

	beforeEach(async () => {
		service = new FormatFacturXEN16931Service();
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
