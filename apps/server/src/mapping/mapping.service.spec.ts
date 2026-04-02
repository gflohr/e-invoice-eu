import {
	MappingService as CoreMappingService,
	Invoice,
} from '@e-invoice-eu/core';
import {
	vi,
	describe,
	it,
	beforeEach,
	expect,
	type Mocked,
} from 'vitest';

import { MappingService } from './mapping.service';

let CoreMappingServiceMock: ReturnType<typeof vi.fn>;

vi.mock('@e-invoice-eu/core', async importOriginal => {
	const actual: object = await importOriginal();

	CoreMappingServiceMock = vi.fn();

	return {
		...actual,
		CoreMappingService: CoreMappingServiceMock,
	};
});

describe('MappingService', () => {
	let service: MappingService;
	let coreMappingServiceMock: Mocked<CoreMappingService>;

	beforeEach(() => {
		coreMappingServiceMock = {
			transform: vi.fn(),
		};

		CoreMappingServiceMock.mockImplementation(() => coreMappingServiceMock);

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
