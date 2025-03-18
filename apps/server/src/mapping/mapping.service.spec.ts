import {
	MappingService as CoreMappingService,
	Invoice,
} from '@e-invoice-eu/core';

import { MappingService } from './mapping.service';

jest.mock('@e-invoice-eu/core');

describe('MappingService', () => {
	let service: MappingService;
	let coreMappingServiceMock: jest.Mocked<CoreMappingService>;

	beforeEach(() => {
		coreMappingServiceMock = {
			transform: jest.fn(),
		} as unknown as jest.Mocked<CoreMappingService>;

		// Mock the CoreMappingService constructor
		(CoreMappingService as jest.Mock).mockImplementation(
			() => coreMappingServiceMock,
		);

		service = new MappingService();
	});

	it('should call transform method of CoreMappingService with correct parameters', () => {
		const format = 'someFormat';
		const yamlMapping = 'someYamlMapping';
		const dataBuffer = Buffer.from('test');
		const mockInvoice = { id: '123' } as unknown as Invoice;

		coreMappingServiceMock.transform.mockReturnValue(mockInvoice);

		const result = service.transform(format, yamlMapping, dataBuffer);

		expect(coreMappingServiceMock.transform).toHaveBeenCalledWith(
			dataBuffer,
			format,
			yamlMapping,
		);
		expect(result).toBe(mockInvoice);
	});
});
