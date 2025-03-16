import { Logger } from '../logger.interface';
import { FormatFacturXExtendedService } from './format-factur-x-extended.service';

describe('Factur-X-Extended', () => {
	let service: FormatFacturXExtendedService;

	beforeEach(async () => {
		service = new FormatFacturXExtendedService({} as unknown as Logger);
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
