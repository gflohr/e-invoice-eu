import { beforeEach, describe, expect, it, type Mocked, vi } from 'vitest';

vi.mock('@e-invoice-eu/core', () => ({
	MappingService: vi.fn(),
}));

import {
	MappingService as CoreMappingService,
	Invoice,
} from '@e-invoice-eu/core';

import { MappingService } from './mapping.service';

describe('MappingService', () => {
	let service: MappingService;
	let coreMappingServiceMock: Mocked<CoreMappingService>;

	beforeEach(() => {
		coreMappingServiceMock = {
			transform: vi.fn(),
		} as unknown as Mocked<CoreMappingService>;

		vi.mocked(CoreMappingService).mockImplementation(function () {
			return coreMappingServiceMock;
		});

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
