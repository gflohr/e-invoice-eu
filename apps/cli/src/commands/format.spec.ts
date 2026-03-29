import type { Arguments } from 'yargs';
import {
	vi,
	describe,
	it,
	beforeEach,
	afterEach,
	expect,
	type Mock,
} from 'vitest';
import yargs from 'yargs';

import { Format } from './format';
import { coerceOptions } from '../optspec';
import { Package } from '../package';
import { mimeType } from 'valibot';

vi.mock('../optspec');
vi.mock('../package');

vi.mock('@e-invoice-eu/core', () => {
	return {
		FormatFactoryService: class {
			listFormatServices() {
				return [
					{
						name: 'FormatA',
						syntax: 'UBL',
						mimeType: 'application/xml',
						customizationID: 'urn:format:a',
						profileID: 'urn:profile:a',
					},
					{
						name: 'FormatB',
						syntax: 'CII',
						mimeType: 'application/pdf',
						customizationID: 'urn:format:b',
						profileID: 'urn:profile:b',
					},
				];
			}
			info() {
				return {
					name: 'FormatC',
					syntax: 'UBL',
					mimeType: 'application/xml',
					customizationID: 'urn:format:c',
					profileID: 'urn:profile:c',
				};
			}
			normalizeFormat(format: string) {
				return format
					.toLowerCase()
					.replace(/-comfort$/, '-en16931')
					.replace(/-basic[-_]?wl$/, '-basic wl')
					.replace(/^zugferd-/, 'factur-x-');
			}
		},
	};
});

describe('Format Command', () => {
	let format: Format;
	const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

	beforeEach(() => {
		format = new Format();
	});

	afterEach(() => {
		consoleSpy.mockClear();
	});

	it('description() should return a valid description', () => {
		expect(format.description()).toBe('List and describe supported formats.');
	});

	it('aliases() should return an empty array', () => {
		expect(format.aliases()).toEqual([]);
	});

	it('build() should add expected options to yargs', () => {
		const mockArgv = yargs([]);
		const optionsSpy = vi.spyOn(mockArgv, 'options');

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
		(coerceOptions as Mock).mockReturnValue(false);

		const result = await format.run({} as Arguments);

		expect(result).toBe(1);
	});

	it('run() should call doRun and return 0 on success', async () => {
		(coerceOptions as Mock).mockReturnValue(true);
		const doRunSpy = vi
			.spyOn(format as any, 'doRun')
			.mockResolvedValue(undefined);

		const result = await format.run({} as Arguments);

		expect(doRunSpy).toHaveBeenCalled();
		expect(result).toBe(0);
	});

	it('run() should return 1 and log an error if doRun throws', async () => {
		(coerceOptions as Mock).mockReturnValue(true);
		const error = new Error('test error');
		vi.spyOn(format as any, 'doRun').mockRejectedValue(error);

		const consoleErrorSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => {});

		(Package.getName as Mock).mockReturnValue('e-invoice-eu-cli');

		const result = await format.run({} as Arguments);

		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'e-invoice-eu-cli: Error: test error',
		);
		expect(result).toBe(1);

		consoleErrorSpy.mockRestore();
	});

	describe('list()', () => {
		it('should list all supported formats', async () => {
			const options = { list: true } as unknown as Arguments;

			await format.run(options);

			expect(consoleSpy).toHaveBeenCalledWith('FormatA\nFormatB');
		});
	});

	describe('info()', () => {
		let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

		beforeEach(() => {
			consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		});

		afterEach(() => {
			consoleErrorSpy.mockRestore();
		});

		it('should display detailed information about a format', async () => {
			const options = { info: 'FormatC' } as unknown as Arguments;

			await format.run(options);

			expect(consoleSpy).toHaveBeenCalledWith('name: FormatC');
		});

		it('should throw an error if neither --info nor --list is passed', async () => {
			const options = {} as unknown as Arguments;

			const exitCode = await format.run(options);

			expect(exitCode).not.toBe(0);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				expect.stringContaining(
					"Error: One of the options '--list' or '--info' is required!",
				),
			);
		});
	});
});
