import yargs from 'yargs';

import { Format } from './format';
import { coerceOptions } from '../optspec';
import { Package } from '../package';

jest.mock('../optspec');
jest.mock('../package');

jest.mock('@e-invoice-eu/core', () => ({
	FormatFactoryService: jest.fn().mockImplementation(() => ({
		listFormatServices: jest.fn().mockReturnValue([
			{
				name: 'FormatA',
			},
			{
				name: 'FormatB',
			},
		]),
		normalizeFormat: jest.fn((format: string) => format.toLowerCase()),
	})),
}));

describe('Format Command', () => {
	let format: Format;
	let consoleSpy: jest.SpyInstance;

	beforeEach(() => {
		format = new Format();
		consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		jest.clearAllMocks();
	});

	it('description() should return a valid description', () => {
		expect(format.description()).toBe('List and describe supported formats.');
	});

	it('aliases() should return an empty array', () => {
		expect(format.aliases()).toEqual([]);
	});

	it('build() should add expected options to yargs', () => {
		const mockArgv = yargs([]);
		const optionsSpy = jest.spyOn(mockArgv, 'options');

		format.build(mockArgv);

		expect(optionsSpy).toHaveBeenCalledWith({
			list: expect.objectContaining({
				group: 'Operation mode',
				alias: ['l'],
				type: 'boolean',
				conflicts: 'info',
				demandOption: false,
				describe: 'list all supported formats',
			}),
			info: expect.objectContaining({
				group: 'Operation mode',
				alias: ['i'],
				type: 'string',
				conflicts: 'list',
				demandOption: false,
				describe: 'show detailed information about one format',
			}),
		});
	});

	it('run() should return 1 if coerceOptions fails', async () => {
		(coerceOptions as jest.Mock).mockReturnValue(false);

		const result = await format.run({} as yargs.Arguments);

		expect(result).toBe(1);
	});

	it('run() should call doRun and return 0 on success', async () => {
		(coerceOptions as jest.Mock).mockReturnValue(true);
		const doRunSpy = jest
			.spyOn(format as any, 'doRun')
			.mockResolvedValue(undefined);

		const result = await format.run({} as yargs.Arguments);

		expect(doRunSpy).toHaveBeenCalled();
		expect(result).toBe(0);
	});

	it('run() should return 1 and log an error if doRun throws', async () => {
		(coerceOptions as jest.Mock).mockReturnValue(true);
		const error = new Error('test error');
		jest.spyOn(format as any, 'doRun').mockRejectedValue(error);

		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

		(Package.getName as jest.Mock).mockReturnValue('e-invoice-eu-cli');

		const result = await format.run({} as yargs.Arguments);

		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'e-invoice-eu-cli: Error: test error',
		);
		expect(result).toBe(1);

		consoleErrorSpy.mockRestore();
	});

	describe('list()', () => {
		it('should list all supported formats', () => {
			format['list']();
			expect(consoleSpy).toHaveBeenCalledWith('FormatA\nFormatB');
		});
	});

	describe('info()', () => {
		it('should display detailed information about a format', () => {
			format['info']('FormatA');
			expect(consoleSpy).toHaveBeenCalledWith('name: FormatA');
		});

		it('should throw an error if the format is not supported', () => {
			expect(() => format['info']('UnknownFormat')).toThrow(
				"Format 'UnknownFormat' is not supported!",
			);
		});
	});
});
