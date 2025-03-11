import { FormatFactoryService } from '@e-invoice-eu/core';
import { Textdomain } from '@esgettext/runtime';
import yargs, { InferredOptionTypes } from 'yargs';

import { Command } from '../command';
import { coerceOptions, OptSpec } from '../optspec';
import { Package } from '../package';

const gtx = Textdomain.getInstance('e-invoice-eu-cli');

const options: {
	format: OptSpec;
	output: OptSpec;
	invoice: OptSpec;
	mapping: OptSpec;
	data: OptSpec;
	lang: OptSpec;
	pdf: OptSpec;
	'pdf-id': OptSpec;
	'pdf-description': OptSpec,
	attachment: OptSpec;
	'attachment-id': OptSpec;
	'attachment-description': OptSpec;
	'embed-pdf': OptSpec;
} = {
	format: {
		group: gtx._('Format selection'),
		alias: ['f'],
		type: 'string',
		demandOption: true,
		describe: gtx._('invoice format (case-insensitive), try `format --list` for a list of allowed values'),
	},
	output: {
		group: gtx._('Output file location'),
		alias: ['o'],
		type: 'string',
		demandOption: false,
		describe: gtx._('write output to specified file instead of standard output'),
	},
	invoice: {
		group: gtx._('Input data'),
		alias: ['i'],
		type: 'string',
		demandOption: false,
		describe: gtx._('invoice data as JSON'),
	},
	mapping: {
		group: gtx._('Input data'),
		alias: ['m'],
		type: 'string',
		demandOption: false,
		describe: gtx._('mapping file (YAML or JSON), mandatory for spreadsheet data input'),
	},
	data: {
		group: gtx._('Input data'),
		alias: ['d'],
		type: 'string',
		demandOption: false,
		describe: gtx._('invoice spreadsheet data, mandatory for spreadsheet data input'),
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
		describe: gtx._('ID of the embedded PDF, defaults to the document number')
	},
	'pdf-description': {
		group: gtx._('Input data'),
		type: 'string',
		demandOption: false,
		describe: gtx._('optional description of the embedded PDF')
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
		describe: gtx._('ids of the attachment')
	},
	'attachment-description': {
		group: gtx._('Input data'),
		type: 'string',
		multi: true,
		demandOption: false,
		describe: gtx._('descriptions of the attachment')
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

	private list() {
		const factoryService = new FormatFactoryService();
		const formats = factoryService
			.listFormatServices()
			.map(format => format.name)
			.join('\n');

		console.log(formats);
	}

	private info(format: string) {
		const factoryService = new FormatFactoryService();
		const normalized = factoryService.normalizeFormat(format);
		const formatInfos = factoryService.listFormatServices();

		const info = formatInfos.filter(
			info => info.name.toLowerCase() === normalized,
		);
		if (!info.length) {
			throw new Error(
				gtx._x("Format '{format}' is not supported!", { format }),
			);
		}

		for (const prop in info[0]) {
			console.log(`${prop}: ${info[0][prop]}`);
		}
	}

	private async doRun(configOptions: ConfigOptions) {
		console.log('todo')
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
