import yargs from 'yargs';

import { Invoice } from './invoice';
import { coerceOptions } from '../optspec';
import { Package } from '../package';

jest.mock('../optspec');
jest.mock('../package');

describe('Invoice Command', () => {
	let invoice: Invoice;
	let consoleSpy: jest.SpyInstance;

	beforeEach(() => {
		invoice = new Invoice();
		consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		jest.clearAllMocks();
	});

	it('description() should return a valid description', () => {
		expect(invoice.description()).toBe('Create an e-invoice from spreadsheet data or JSON.');
	});

	it('aliases() should return an empty array', () => {
		expect(invoice.aliases()).toEqual([]);
	});

	it('build() should add expected options to yargs', () => {
		const mockArgv = yargs([]);
		const optionsSpy = jest.spyOn(mockArgv, 'options');

		invoice.build(mockArgv);

		expect(optionsSpy).toHaveBeenCalledWith({
			format: {
				group: 'Format selection',
				alias: ['f'],
				type: 'string',
				demandOption: true,
				describe: 'invoice format (case-insensitive), try `format --list` for a list of allowed values',
			},
			invoice: {
				group: 'Input data',
				alias: ['i'],
				type: 'string',
				demandOption: false,
				describe: 'invoice data as JSON',
			},
			mapping: {
				group: 'Input data',
				alias: ['m'],
				type: 'string',
				demandOption: false,
				describe: 'mapping file (YAML or JSON), mandatory for spreadsheet data input',
			},
			data: {
				group: 'Input data',
				alias: ['d'],
				type: 'string',
				demandOption: false,
				describe: 'invoice spreadsheet data, mandatory for spreadsheet data input',
			},
			pdf: {
				group: 'Input data',
				alias: ['p'],
				type: 'string',
				demandOption: false,
				describe: 'PDF version of the invoice',
			},
			'pdf-id': {
				group: 'Input data',
				type: 'string',
				demandOption: false,
				describe: 'ID of the embedded PDF, defaults to the document number',
			},
			'pdf-description': {
				group: 'Input data',
				type: 'string',
				demandOption: false,
				describe: 'optional description of the embedded PDF',
			},
			attachment: {
				group: 'Input data',
				alias: ['a'],
				type: 'string',
				multi: true,
				demandOption: false,
				describe: 'arbitrary number of attachments',
			},
			'attachment-id': {
				group: 'Input data',
				type: 'string',
				multi: true,
				demandOption: false,
				describe: 'ids of the attachment',
			},
			'attachment-description': {
				group: 'Input data',
				type: 'string',
				multi: true,
				demandOption: false,
				describe: 'descriptions of the attachment',
			},
			lang: {
				group: 'Invoice details',
				alias: ['l'],
				type: 'string',
				demandOption: false,
				default: 'en',
				describe: 'invoice language code',
			},
			'embed-pdf': {
				group: 'Invoice details',
				type: 'boolean',
				demandOption: false,
				describe: 'embed a PDF version of the invoice',
			},
		});
	});

	it('run() should return 1 if coerceOptions fails', async () => {
		(coerceOptions as jest.Mock).mockReturnValue(false);

		const result = await invoice.run({} as yargs.Arguments);

		expect(result).toBe(1);
	});

	it('run() should call doRun and return 0 on success', async () => {
		(coerceOptions as jest.Mock).mockReturnValue(true);
		const doRunSpy = jest
			.spyOn(invoice as any, 'doRun')
			.mockResolvedValue(undefined);

		const result = await invoice.run({} as yargs.Arguments);

		expect(doRunSpy).toHaveBeenCalled();
		expect(result).toBe(0);
	});

	it('run() should return 1 and log an error if doRun throws', async () => {
		(coerceOptions as jest.Mock).mockReturnValue(true);
		const error = new Error('test error');
		jest.spyOn(invoice as any, 'doRun').mockRejectedValue(error);

		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

		(Package.getName as jest.Mock).mockReturnValue('e-invoice-eu-cli');

		const result = await invoice.run({} as yargs.Arguments);

		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'e-invoice-eu-cli: Error: test error',
		);
		expect(result).toBe(1);

		consoleErrorSpy.mockRestore();
	});
});
