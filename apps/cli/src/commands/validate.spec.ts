import yargs from 'yargs';

import { Format } from './format';
import { coerceOptions } from '../optspec';
import { Package } from '../package';
import { Validate } from './validate';

jest.mock('../optspec');
jest.mock('../package');

describe('Validate Command', () => {
	let validate: Validate;
	let consoleSpy: jest.SpyInstance;

	beforeEach(() => {
		validate = new Validate();
		consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		jest.clearAllMocks();
	});

	it('description() should return a valid description', () => {
		expect(validate.description()).toBe('Validate invoices.');
	});

	it('aliases() should return an empty array', () => {
		expect(validate.aliases()).toEqual([]);
	});

	it('build() should add expected options to yargs', () => {
		const mockArgv = yargs([]);
		const optionsSpy = jest.spyOn(mockArgv, 'options');

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
		});
	});

	it('run() should return 1 if coerceOptions fails', async () => {
		(coerceOptions as jest.Mock).mockReturnValue(false);

		const result = await validate.run({} as yargs.Arguments);

		expect(result).toBe(1);
	});

	it('run() should call doRun and return 0 on success', async () => {
		(coerceOptions as jest.Mock).mockReturnValue(true);
		const doRunSpy = jest
			.spyOn(validate as any, 'doRun')
			.mockResolvedValue(undefined);

		const result = await validate.run({} as yargs.Arguments);

		expect(doRunSpy).toHaveBeenCalled();
		expect(result).toBe(0);
	});

	it('run() should return 1 and log an error if doRun throws', async () => {
		(coerceOptions as jest.Mock).mockReturnValue(true);
		const error = new Error('test error');
		jest.spyOn(validate as any, 'doRun').mockRejectedValue(error);

		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

		(Package.getName as jest.Mock).mockReturnValue('e-invoice-eu-cli');

		const result = await validate.run({} as yargs.Arguments);

		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'e-invoice-eu-cli: Error: test error',
		);
		expect(result).toBe(1);

		consoleErrorSpy.mockRestore();
	});
});
