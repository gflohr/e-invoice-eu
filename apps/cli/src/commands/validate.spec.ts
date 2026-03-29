import yargs from 'yargs';
import { vi, describe, it, beforeEach, expect, type Mock } from 'vitest';
import type { Arguments } from 'yargs';

import { coerceOptions } from '../optspec';
import { Package } from '../package';
import { Validate } from './validate';

vi.mock('../optspec');
vi.mock('../package');

describe('Validate Command', () => {
	let validate: Validate;

	beforeEach(() => {
		validate = new Validate();
		vi.clearAllMocks();
	});

	it('description() should return a valid description', () => {
		expect(validate.description()).toBe('Validate invoices.');
	});

	it('aliases() should return an empty array', () => {
		expect(validate.aliases()).toEqual([]);
	});

	it('build() should add expected options to yargs', () => {
		const mockArgv = yargs([]);
		const optionsSpy = vi.spyOn(mockArgv, 'options');

		validate.build(mockArgv);

		expect(optionsSpy).toHaveBeenCalledWith({
			url: expect.objectContaining({
				group: 'Server Location',
				alias: ['u'],
				type: 'string',
				demandOption: false,
				describe: 'base URL of the server',
				default: 'http://localhost:8080',
			}),
			quiet: expect.objectContaining({
				group: 'Mode of Operation',
				alias: ['q'],
				type: 'boolean',
				conflicts: 'verbose',
				demandOption: false,
				describe: 'suppress output',
			}),
			verbose: expect.objectContaining({
				group: 'Mode of Operation',
				alias: ['v'],
				type: 'boolean',
				conflicts: 'quiet',
				demandOption: false,
				describe: 'output all reports',
			}),
		});
	});

	it('run() should return 1 if coerceOptions fails', async () => {
		(coerceOptions as Mock).mockReturnValue(false);

		const result = await validate.run({} as Arguments);

		expect(result).toBe(1);
	});

	it('run() should call doRun and return 0 on success', async () => {
		(coerceOptions as Mock).mockReturnValue(true);
		const doRunSpy = vi
			.spyOn(validate as any, 'doRun')
			.mockResolvedValue(undefined);

		const result = await validate.run({} as Arguments);

		expect(doRunSpy).toHaveBeenCalled();
		expect(result).toBe(0);
	});

	it('run() should return 1 and log an error if doRun throws', async () => {
		(coerceOptions as Mock).mockReturnValue(true);
		const error = new Error('test error');
		vi.spyOn(validate as any, 'doRun').mockRejectedValue(error);

		const consoleErrorSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => {});

		(Package.getName as Mock).mockReturnValue('e-invoice-eu-cli');

		const result = await validate.run({
			verbose: true,
		} as unknown as Arguments);

		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'e-invoice-eu-cli: Error: test error',
		);
		expect(result).toBe(1);

		consoleErrorSpy.mockRestore();
	});
});
