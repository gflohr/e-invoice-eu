// FIXME! Name all the commands SubjectCommand so that we can import the
// Invoice interface in a normal fashion.
import {
	Invoice as CoreInvoice,
	InvoiceFile,
	InvoiceService,
	InvoiceServiceOptions,
	MappingService,
} from '@e-invoice-eu/core';
import { Textdomain } from '@esgettext/runtime';
import { accessSync, statSync } from 'fs';
import * as fs from 'fs/promises';
import * as yaml from 'js-yaml';
import { lookup } from 'mime-types';
import * as os from 'os';
import * as path from 'path';
import yargs, { InferredOptionTypes } from 'yargs';

import { Command } from '../command';
import { coerceOptions, OptSpec } from '../optspec';
import { Package } from '../package';
import { safeStdoutBufferWrite, safeStdoutWrite } from '../safe-stdout-write';

const gtx = Textdomain.getInstance('e-invoice-eu-cli');

function findExecutable(command: string): string | null {
	const paths = process.env.PATH?.split(path.delimiter) || [];

	for (const dir of paths) {
		const fullPath = path.join(dir, command);
		try {
			if (
				statSync(fullPath).isFile() &&
				accessSync(fullPath, fs.constants.X_OK) === undefined
			) {
				return fullPath;
			}
		} catch {
			// Ignore errors (e.g., file doesn't exist or no access)
		}
	}

	return null;
}

export function guessLibreOfficePath(): string {
	const platform = os.platform();

	if (platform === 'win32') {
		return 'C:\\Program Files\\LibreOffice\\program\\soffice.exe';
	} else if (platform === 'darwin') {
		return '/Applications/LibreOffice.app/Contents/MacOS/soffice';
	} else {
		return (
			findExecutable('libreoffice') ??
			findExecutable('soffice') ??
			'libreoffice'
		);
	}
}

const options: {
	format: OptSpec;
	output: OptSpec;
	invoice: OptSpec;
	mapping: OptSpec;
	data: OptSpec;
	lang: OptSpec;
	pdf: OptSpec;
	'pdf-id': OptSpec;
	'pdf-description': OptSpec;
	attachment: OptSpec;
	'attachment-id': OptSpec;
	'attachment-description': OptSpec;
	'attachment-mimetype': OptSpec;
	'embed-pdf': OptSpec;
	'libre-office': OptSpec;
} = {
	format: {
		group: gtx._('Format selection'),
		alias: ['f'],
		type: 'string',
		demandOption: true,
		describe: gtx._(
			"invoice format (case-insensitive), try 'format --list' for a list of allowed values",
		),
	},
	output: {
		group: gtx._('Output file location'),
		alias: ['o'],
		type: 'string',
		demandOption: false,
		describe: gtx._(
			'write output to specified file instead of standard output',
		),
	},
	invoice: {
		group: gtx._('Input data'),
		alias: ['i'],
		type: 'string',
		conflicts: ['mapping'],
		demandOption: false,
		describe: gtx._('invoice data as JSON, mandatory for json data input'),
	},
	mapping: {
		group: gtx._('Input data'),
		alias: ['m'],
		type: 'string',
		conflicts: ['invoice'],
		demandOption: false,
		describe: gtx._(
			'mapping file (YAML or JSON), mandatory for spreadsheet data input',
		),
	},
	data: {
		group: gtx._('Input data'),
		alias: ['d'],
		type: 'string',
		demandOption: false,
		describe: gtx._(
			'invoice spreadsheet data, mandatory for spreadsheet data input',
		),
	},
	pdf: {
		group: gtx._('Input data'),
		alias: ['p'],
		type: 'string',
		demandOption: false,
		describe: gtx._('PDF version of the invoice'),
	},
	'pdf-id': {
		group: gtx._('Input data'),
		type: 'string',
		demandOption: false,
		describe: gtx._('ID of the embedded PDF, defaults to the document number'),
	},
	'pdf-description': {
		group: gtx._('Input data'),
		type: 'string',
		demandOption: false,
		describe: gtx._('optional description of the embedded PDF'),
	},
	attachment: {
		group: gtx._('Input data'),
		alias: ['a'],
		type: 'string',
		multi: true,
		demandOption: false,
		describe: gtx._('arbitrary number of attachments'),
	},
	'attachment-id': {
		group: gtx._('Input data'),
		type: 'string',
		multi: true,
		demandOption: false,
		describe: gtx._('optional ids of the attachments'),
	},
	'attachment-description': {
		group: gtx._('Input data'),
		type: 'string',
		multi: true,
		demandOption: false,
		describe: gtx._('optional descriptions of the attachments'),
	},
	'attachment-mimetype': {
		group: gtx._('Input data'),
		alias: ['attachment-mime-type'],
		type: 'string',
		multi: true,
		demandOption: false,
		describe: gtx._('optional MIME types of the attachments'),
	},
	lang: {
		group: gtx._('Invoice details'),
		alias: ['l'],
		type: 'string',
		demandOption: false,
		default: 'en',
		describe: gtx._('invoice language code'),
	},
	'embed-pdf': {
		group: gtx._('Invoice details'),
		type: 'boolean',
		demandOption: false,
		describe: gtx._('embed a PDF version of the invoice'),
	},
	'libre-office': {
		group: gtx._('External programs'),
		alias: ['libreoffice'],
		type: 'string',
		demandOption: false,
		default: guessLibreOfficePath(),
		describe: gtx._(
			'path to LibreOffice executable, mandatory if PDF creation is requested',
		),
	},
};

export type ConfigOptions = InferredOptionTypes<typeof options>;

export class Invoice implements Command {
	description(): string {
		return gtx._('Create an e-invoice from spreadsheet data or JSON.');
	}

	aliases(): Array<string> {
		return [];
	}

	build(argv: yargs.Argv): yargs.Argv<object> {
		return argv.options(options);
	}

	private async addPdf(
		options: InvoiceServiceOptions,
		configOptions: ConfigOptions,
	) {
		if (configOptions.pdf) {
			const invoiceFile: InvoiceFile = {
				buffer: await fs.readFile(configOptions.pdf as string),
				filename: path.basename(configOptions.pdf as string),
				mimetype: 'application/pdf',
			};

			options.pdf = invoiceFile;
			if (typeof configOptions['pdf-id'] !== 'undefined') {
				options.pdfID = configOptions['pdf-id'] as string;
			}
			if (typeof configOptions['pdf-description'] !== 'undefined') {
				options.pdfID = configOptions['pdf-description'] as string;
			}

			options.embedPDF = !!configOptions['embed-pdf'];
		}
	}

	private checkConfigOptions(configOptions: ConfigOptions) {
		if (
			typeof configOptions.invoice === 'undefined' &&
			typeof configOptions.mapping === 'undefined'
		) {
			throw new Error(
				gtx._("One of the options '--invoice' or '--mapping' is mandatory."),
			);
		} else if (
			typeof configOptions.mapping !== 'undefined' &&
			typeof configOptions.data === 'undefined'
		) {
			throw new Error(gtx._('No invoice spreadsheet specified.'));
		}
	}

	private async addAttachments(
		options: InvoiceServiceOptions,
		configOptions: ConfigOptions,
	) {
		if (!configOptions.attachment) return;

		const attachments = configOptions.attachment as string[];
		for (let i = 0; i < attachments.length; ++i) {
			const filename = attachments[i];
			const basename = path.basename(filename);
			const mimetype =
				configOptions['attachment-mimetype']?.[i] ?? lookup(basename);

			if (!mimetype) {
				throw new Error(
					gtx._x("cannot guess MIME type of attachment '{filename}'!", {
						filename,
					}),
				);
			}

			const file: InvoiceFile = {
				buffer: await fs.readFile(filename),
				filename: basename,
				mimetype,
			};

			options.attachments.push({
				file,
				id: configOptions['attachment-id']?.[i],
				description: configOptions['attachment-description']?.[i],
			});
		}
	}

	private async createInvoice(
		options: InvoiceServiceOptions,
		configOptions: ConfigOptions,
	): Promise<string | Buffer> {
		let invoiceData: CoreInvoice;

		const format = configOptions.format as string;

		if (typeof configOptions.data !== 'undefined') {
			options.data = {
				filename: configOptions.data as string,
				buffer: await fs.readFile(configOptions.data as string),
				mimetype: lookup[configOptions.data as string],
			};
		}

		if (typeof configOptions.invoice !== 'undefined') {
			const filename = configOptions.invoice as string;

			const json = await fs.readFile(filename, 'utf-8');
			try {
				invoiceData = JSON.parse(json) as CoreInvoice;
			} catch (e) {
				throw new Error(`${filename}: ${e.message}`);
			}
		} else if (typeof configOptions.mapping !== 'undefined') {
			if (typeof configOptions.data == 'undefined') {
				throw new Error(
					gtx._("The option '--data' is mandatory if a mapping is specified!"),
				);
			}

			const mappingYaml = await fs.readFile(
				configOptions.mapping as string,
				'utf-8',
			);

			const mapping = yaml.load(mappingYaml);

			const mappingService = new MappingService(console);
			invoiceData = mappingService.transform(
				options.data!.buffer,
				format.toLowerCase(),
				mapping,
			);
		} else {
			throw new Error(
				gtx._("You must either specify '--data' or '--invoice'!"),
			);
		}

		options.libreOfficePath = configOptions['libre-office'] as string;

		const invoiceService = new InvoiceService(console);

		return await invoiceService.generate(invoiceData, options);
	}

	private async doRun(configOptions: ConfigOptions) {
		const options: InvoiceServiceOptions = {
			format: configOptions.format as string,
			lang: configOptions.lang as string,
			attachments: [],
		};

		this.checkConfigOptions(configOptions);
		await this.addPdf(options, configOptions);
		await this.addAttachments(options, configOptions);

		const document = await this.createInvoice(options, configOptions);
		if (typeof document === 'string') {
			if (typeof configOptions.output === 'undefined') {
				safeStdoutWrite(document);
			} else {
				await fs.writeFile(configOptions.output as string, document, 'utf-8');
			}
		} else {
			if (typeof configOptions.output === 'undefined') {
				safeStdoutBufferWrite(document);
			} else {
				await fs.writeFile(configOptions.output as string, document);
			}
		}
	}

	public async run(argv: yargs.Arguments): Promise<number> {
		const configOptions = argv as unknown as ConfigOptions;

		if (!coerceOptions(argv, options)) {
			return 1;
		}

		try {
			await this.doRun(configOptions);
			return 0;
		} catch (e) {
			console.error(
				gtx._x('{programName}: {error}', {
					programName: Package.getName(),
					error: e,
				}),
			);

			return 1;
		}
	}
}
