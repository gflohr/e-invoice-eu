import { Logger } from '../logger.interface';
import { FX_BASIC_WL } from './format-cii.service';
import { FormatFacturXBasicWLService } from './format-factur-x-basic-wl.service';

describe('Factur-X-BasicWL', () => {
	let service: FormatFacturXBasicWLService;

	beforeEach(async () => {
		service = new FormatFacturXBasicWLService({} as unknown as Logger);
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

	it('should use the Basic WL Factur-X profile', () => {
		expect(service.fxProfile).toEqual(FX_BASIC_WL);
	});
});
