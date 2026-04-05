import type { Arguments } from 'yargs';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';
import { coerceOptions, OptSpec } from './optspec';

vi.mock('./package', () => ({
	Package: { getName: vi.fn(() => 'test-program') },
}));

describe('coerceOptions', () => {
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		consoleErrorSpy.mockRestore();
	});

	it('should allow multiple values for multi:true options', () => {
		const args = { testOption: 'value' };
		const optspecs: { [key: string]: OptSpec } = {
			'test-option': { multi: true },
		};

		expect(coerceOptions(args as unknown as Arguments, optspecs)).toBe(
			true,
		);
		expect(args.testOption).toEqual(['value']);
	});

	it('should not modify non-multi options if single value is passed', () => {
		const args = { testOption: 'value' };
		const optspecs: { [key: string]: OptSpec } = {
			'test-option': { multi: false },
		};

		expect(coerceOptions(args as unknown as Arguments, optspecs)).toBe(
			true,
		);
		expect(args.testOption).toBe('value');
	});

	it('should prevent multiple values for non-multi options and return false', () => {
		const args = { testOption: ['value1', 'value2'] };
		const optspecs: { [key: string]: OptSpec } = {
			'test-option': { multi: false },
		};

		expect(coerceOptions(args as unknown as Arguments, optspecs)).toBe(
			false,
		);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			expect.stringContaining(
				"Error: The option 'test-option' cannot be specified more than once!",
			),
		);
	});
});
