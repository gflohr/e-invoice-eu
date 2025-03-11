import yargs from 'yargs';

import { coerceOptions, OptSpec } from './optspec';

jest.mock('./package', () => ({
	Package: { getName: jest.fn(() => 'test-program') },
}));

describe('coerceOptions', () => {
	let consoleErrorSpy: jest.SpyInstance;

	beforeEach(() => {
		consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
	});

	afterEach(() => {
		consoleErrorSpy.mockRestore();
	});

	it('should allow multiple values for multi:true options', () => {
		const args = { testOption: 'value' };
		const optspecs: { [key: string]: OptSpec } = {
			'test-option': { multi: true },
		};

		expect(coerceOptions(args as unknown as yargs.Arguments, optspecs)).toBe(
			true,
		);
		expect(args.testOption).toEqual(['value']);
	});

	it('should not modify non-multi options if single value is passed', () => {
		const args = { testOption: 'value' };
		const optspecs: { [key: string]: OptSpec } = {
			'test-option': { multi: false },
		};

		expect(coerceOptions(args as unknown as yargs.Arguments, optspecs)).toBe(
			true,
		);
		expect(args.testOption).toBe('value');
	});

	it('should prevent multiple values for non-multi options and return false', () => {
		const args = { testOption: ['value1', 'value2'] };
		const optspecs: { [key: string]: OptSpec } = {
			'test-option': { multi: false },
		};

		expect(coerceOptions(args as unknown as yargs.Arguments, optspecs)).toBe(
			false,
		);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			expect.stringContaining(
				"Error: The option 'test-option' cannot be specified more than once!",
			),
		);
	});
});
