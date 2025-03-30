import { invoiceSchema } from '@e-invoice-eu/core';
import { mappingSchema } from '@e-invoice-eu/core';
import * as fs from 'fs/promises';
import yargs from 'yargs';

import { Schema } from './schema';
import { coerceOptions } from '../optspec';
import { Package } from '../package';
import { safeStdoutWrite } from '../safe-stdout-write';

jest.mock('../optspec');
jest.mock('../package');

jest.mock('fs/promises');
const mockedFs = fs as jest.Mocked<typeof fs>;

jest.mock('../safe-stdout-write', () => ({
	safeStdoutWrite: jest.fn().mockResolvedValue(undefined),
}));

describe('Schema Command', () => {
	let schema: Schema;

	beforeEach(() => {
		schema = new Schema();
		jest.clearAllMocks();
	});

	test('description() should return a valid description', () => {
		expect(schema.description()).toBe('Output JSON schema.');
	});

	test('aliases() should return an empty array', () => {
		expect(schema.aliases()).toEqual([]);
	});

	test('build() should add expected options to yargs', () => {
		const mockArgv = yargs([]);
		const optionsSpy = jest.spyOn(mockArgv, 'options');

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

	test('run() should return 1 if coerceOptions fails', async () => {
		(coerceOptions as jest.Mock).mockReturnValue(false);

		const result = await schema.run({} as yargs.Arguments);

		expect(result).toBe(1);
	});

	test('run() should call doRun and return 0 on success', async () => {
		(coerceOptions as jest.Mock).mockReturnValue(true);
		const doRunSpy = jest
			.spyOn(schema as any, 'doRun')
			.mockResolvedValue(undefined);

		const result = await schema.run({} as yargs.Arguments);

		expect(doRunSpy).toHaveBeenCalled();
		expect(result).toBe(0);
	});

	test('run() should return 1 and log an error if doRun throws', async () => {
		(coerceOptions as jest.Mock).mockReturnValue(true);
		const error = new Error('test error');
		jest.spyOn(schema as any, 'doRun').mockRejectedValue(error);

		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

		(Package.getName as jest.Mock).mockReturnValue('e-invoice-eu-cli');

		const result = await schema.run({} as yargs.Arguments);

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
		} as unknown as yargs.Arguments;

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
		} as unknown as yargs.Arguments;

		await schema.run(argv);

		expect(safeStdoutWrite).toHaveBeenCalledWith(JSON.stringify(mappingSchema));
		expect(safeStdoutWrite).toHaveBeenCalledTimes(1);
	});
});
