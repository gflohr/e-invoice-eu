import * as fs from 'fs/promises';
import yargs from 'yargs';
import type { Arguments } from 'yargs';
import {
	vi,
	describe,
	it,
	beforeEach,
	expect,
	type Mocked,
	type Mock,
} from 'vitest';

import { Transform } from './transform';
import { coerceOptions } from '../optspec';
import { Package } from '../package';
import { safeStdoutWrite } from '../safe-stdout-write';

vi.mock('../optspec');
vi.mock('../package');

vi.mock('fs/promises');
const mockedFs = fs as Mocked<typeof fs>;

vi.mock('../safe-stdout-write', () => ({
	safeStdoutWrite: vi.fn().mockResolvedValue(undefined),
}));

const mockedTransformation = { transformed: 'data' };

vi.mock('@e-invoice-eu/core', () => {
	return {
		MappingService: class {
			transform = vi.fn().mockReturnValue(mockedTransformation);
		},
		FormatFactoryService: class {},
	};
});

describe('Transform Command', () => {
	let transform: Transform;

	beforeEach(() => {
		transform = new Transform();
		vi.clearAllMocks();
	});

	it('description() should return a valid description', () => {
		expect(transform.description()).toBe('Transform spreadsheet data to JSON.');
	});

	it('aliases() should return an empty array', () => {
		expect(transform.aliases()).toEqual([]);
	});

	it('build() should add expected options to yargs', () => {
		const mockArgv = yargs([]);
		const optionsSpy = vi.spyOn(mockArgv, 'options');

		transform.build(mockArgv);

		expect(optionsSpy).toHaveBeenCalledWith({
			spreadsheet: expect.objectContaining({
				group: 'Input file location',
				alias: ['s'],
				type: 'string',
				demandOption: true,
				describe: 'the invoice spreadsheet file',
			}),
			mapping: expect.objectContaining({
				group: 'Input file location',
				alias: ['m'],
				type: 'string',
				demandOption: true,
				describe: 'the mapping file',
			}),
			output: expect.objectContaining({
				group: 'Output file location',
				alias: ['o'],
				type: 'string',
				demandOption: false,
				describe: 'the output file; standard output if `-`',
			}),
		});
	});

	it('run() should return 1 if coerceOptions fails', async () => {
		(coerceOptions as Mock).mockReturnValue(false);

		const result = await transform.run({} as Arguments);

		expect(result).toBe(1);
	});

	it('run() should call doRun and return 0 on success', async () => {
		(coerceOptions as Mock).mockReturnValue(true);
		const doRunSpy = vi
			.spyOn(transform as any, 'doRun')
			.mockResolvedValue(undefined);

		const result = await transform.run({} as Arguments);

		expect(doRunSpy).toHaveBeenCalled();
		expect(result).toBe(0);
	});

	it('run() should return 1 and log an error if doRun throws', async () => {
		(coerceOptions as Mock).mockReturnValue(true);
		const error = new Error('test error');
		vi.spyOn(transform as any, 'doRun').mockRejectedValue(error);

		const consoleErrorSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => {});

		(Package.getName as Mock).mockReturnValue('e-invoice-eu-cli');

		const result = await transform.run({} as Arguments);

		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'e-invoice-eu-cli: Error: test error',
		);
		expect(result).toBe(1);

		consoleErrorSpy.mockRestore();
	});

	it('should write to a file when output is specified', async () => {
		const argv = {
			data: 'data.xlsx',
			mapping: 'mapping.json',
			output: 'output.json',
		} as unknown as Arguments;

		mockedFs.readFile.mockResolvedValueOnce(Buffer.from('spreadsheet data'));
		mockedFs.readFile.mockResolvedValueOnce('mapping data');

		await transform.run(argv);

		expect(mockedFs.writeFile).toHaveBeenCalledWith(
			'output.json',
			JSON.stringify(mockedTransformation),
			'utf-8',
		);
	});

	it('should write to stdout when output is not specified', async () => {
		const argv = {
			data: 'data.xlsx',
			mapping: 'mapping.json',
		} as unknown as Arguments;

		mockedFs.readFile.mockResolvedValueOnce(Buffer.from('spreadsheet data'));
		mockedFs.readFile.mockResolvedValueOnce('mapping data');

		await transform.run(argv);

		expect(safeStdoutWrite).toHaveBeenCalledTimes(1);
		expect(safeStdoutWrite).toHaveBeenCalledWith(
			JSON.stringify(mockedTransformation),
		);
	});
});
