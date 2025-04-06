import * as fs from 'fs/promises';
import yargs from 'yargs';

import { coerceOptions } from '../optspec';
import { Package } from '../package';
import { safeStdoutWrite } from '../safe-stdout-write';
import { Migrate } from './migrate';

jest.mock('../optspec');
jest.mock('../package');

jest.mock('fs/promises');
const mockedFs = fs as jest.Mocked<typeof fs>;

jest.mock('../safe-stdout-write', () => ({
	safeStdoutWrite: jest.fn().mockResolvedValue(undefined),
}));

const mockedData = 'migrated data';

jest.mock('@e-invoice-eu/core', () => ({
	MappingService: jest.fn().mockImplementation(() => ({
		migrate: jest.fn().mockReturnValue(mockedData),
	})),
	FormatFactoryService: jest.fn(),
}));

describe('Transform Command', () => {
	let migrate: Migrate;

	beforeEach(() => {
		migrate = new Migrate();
		jest.clearAllMocks();
	});

	test('description() should return a valid description', () => {
		expect(migrate.description()).toBe('Migrate files.');
	});

	test('aliases() should return an empty array', () => {
		expect(migrate.aliases()).toEqual([]);
	});

	test('build() should add expected options to yargs', () => {
		const mockArgv = yargs([]);
		const optionsSpy = jest.spyOn(mockArgv, 'options');

		migrate.build(mockArgv);

		expect(optionsSpy).toHaveBeenCalledWith({
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

	test('run() should return 1 if coerceOptions fails', async () => {
		(coerceOptions as jest.Mock).mockReturnValue(false);

		const result = await migrate.run({} as yargs.Arguments);

		expect(result).toBe(1);
	});

	test('run() should call doRun and return 0 on success', async () => {
		(coerceOptions as jest.Mock).mockReturnValue(true);
		const doRunSpy = jest
			.spyOn(migrate as any, 'doRun')
			.mockResolvedValue(undefined);

		const result = await migrate.run({} as yargs.Arguments);

		expect(doRunSpy).toHaveBeenCalled();
		expect(result).toBe(0);
	});

	test('run() should return 1 and log an error if doRun throws', async () => {
		(coerceOptions as jest.Mock).mockReturnValue(true);
		const error = new Error('test error');
		jest.spyOn(migrate as any, 'doRun').mockRejectedValue(error);

		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

		(Package.getName as jest.Mock).mockReturnValue('e-invoice-eu-cli');

		const result = await migrate.run({} as yargs.Arguments);

		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'e-invoice-eu-cli: Error: test error',
		);
		expect(result).toBe(1);

		consoleErrorSpy.mockRestore();
	});

	it('should write to a file when output is specified', async () => {
		const argv = {
			mapping: 'mapping.yaml',
			output: 'output.yaml',
		} as unknown as yargs.Arguments;

		mockedFs.readFile.mockResolvedValueOnce('migrated data');

		await migrate.run(argv);

		expect(mockedFs.writeFile).toHaveBeenCalledWith(
			'output.yaml',
			`${mockedData}\n`,
			'utf-8',
		);
	});

	it('should write to stdout when output is not specified', async () => {
		const argv = {
			data: 'data.xlsx',
			mapping: 'mapping.json',
		} as unknown as yargs.Arguments;

		mockedFs.readFile.mockResolvedValueOnce(Buffer.from('spreadsheet data'));
		mockedFs.readFile.mockResolvedValueOnce('mapping data');

		await migrate.run(argv);

		expect(safeStdoutWrite).toHaveBeenCalledTimes(1);
		expect(safeStdoutWrite).toHaveBeenCalledWith(
			mockedData + '\n',
		);
	});
});
