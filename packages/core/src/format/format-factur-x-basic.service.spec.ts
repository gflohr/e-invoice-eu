import { Logger } from '../logger.interface';
import { FX_BASIC } from './format-cii.service';
import { FormatFacturXBasicService } from './format-factur-x-basic.service';

describe('Factur-X-Basic', () => {
	let service: FormatFacturXBasicService;

	beforeEach(async () => {
		service = new FormatFacturXBasicService({} as unknown as Logger);
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

	it('should use the Basic Factur-X profile', () => {
		expect(service.fxProfile).toEqual(FX_BASIC);
	});
});
