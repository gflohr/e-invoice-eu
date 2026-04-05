import { invoiceSchema, mappingSchema } from '@e-invoice-eu/core';
import * as fs from 'fs/promises';
import {
	beforeEach,
	describe,
	expect,
	it,
	type Mock,
	type Mocked,
	vi,
} from 'vitest';
import type { Arguments } from 'yargs';
import yargs from 'yargs';
import { coerceOptions } from '../optspec';
import { Package } from '../package';
import { safeStdoutWrite } from '../safe-stdout-write';
import { Schema } from './schema';

vi.mock('../optspec');
vi.mock('../package');

vi.mock('fs/promises');
const mockedFs = fs as Mocked<typeof fs>;

vi.mock('../safe-stdout-write', () => ({
	safeStdoutWrite: vi.fn().mockResolvedValue(undefined),
}));

describe('Schema Command', () => {
	let schema: Schema;

	beforeEach(() => {
		schema = new Schema();
		vi.clearAllMocks();
	});

	it('description() should return a valid description', () => {
		expect(schema.description()).toBe('Output JSON schema.');
	});

	it('aliases() should return an empty array', () => {
		expect(schema.aliases()).toEqual([]);
	});

	it('build() should add expected options to yargs', () => {
		const mockArgv = yargs([]);
		const optionsSpy = vi.spyOn(mockArgv, 'options');

		schema.build(mockArgv);

		expect(optionsSpy).toHaveBeenCalledWith({
			id: expect.objectContaining({
				group: 'Schema selection',
				alias: ['i'],
				type: 'string',
				choices: ['invoice', 'mapping'],
				demandOption: true,
				describe: 'the schema to output',
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

		const result = await schema.run({} as Arguments);

		expect(result).toBe(1);
	});

	it('run() should call doRun and return 0 on success', async () => {
		(coerceOptions as Mock).mockReturnValue(true);
		const doRunSpy = vi
			.spyOn(schema as any, 'doRun')
			.mockResolvedValue(undefined);

		const result = await schema.run({} as Arguments);

		expect(doRunSpy).toHaveBeenCalled();
		expect(result).toBe(0);
	});

	it('run() should return 1 and log an error if doRun throws', async () => {
		(coerceOptions as Mock).mockReturnValue(true);
		const error = new Error('test error');
		vi.spyOn(schema as any, 'doRun').mockRejectedValue(error);

		const consoleErrorSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => {});

		(Package.getName as Mock).mockReturnValue('e-invoice-eu-cli');

		const result = await schema.run({} as Arguments);

		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'e-invoice-eu-cli: Error: test error',
		);
		expect(result).toBe(1);

		consoleErrorSpy.mockRestore();
	});

	it('should write to a file when output is specified', async () => {
		const argv = {
			id: 'invoice',
			output: 'output.json',
		} as unknown as Arguments;

		await schema.run(argv);

		expect(mockedFs.writeFile).toHaveBeenCalledWith(
			'output.json',
			JSON.stringify(invoiceSchema),
			'utf-8',
		);
	});

	it('should write to stdout when output is not specified', async () => {
		const argv = {
			id: 'mapping',
		} as unknown as Arguments;

		await schema.run(argv);

		expect(safeStdoutWrite).toHaveBeenCalledWith(
			JSON.stringify(mappingSchema),
		);
		expect(safeStdoutWrite).toHaveBeenCalledTimes(1);
	});
});
