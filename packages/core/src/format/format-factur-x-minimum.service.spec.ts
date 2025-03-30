import { Logger } from '../logger.interface';
import { FormatFacturXMinimumService } from './format-factur-x-minimum.service';

describe('Factur-X-Minimum', () => {
	let service: FormatFacturXMinimumService;

	beforeEach(async () => {
		service = new FormatFacturXMinimumService({} as unknown as Logger);
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
