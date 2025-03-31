import { FULL_CII } from "./format-cii.service";
import { FormatFacturXService } from "./format-factur-x.service";

const mockLogger = {
	log: jest.fn(),
	warn: jest.fn(),
	error: jest.fn(),
};

describe('FormatFacturXService', () => {
	let service: FormatFacturXService;

	beforeEach(() => {
		service = new FormatFacturXService(mockLogger);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should have the FULL_CII profile', () => {
		expect(service.fxProfile).toBe(FULL_CII);
	});
});
