import { Textdomain } from '@esgettext/runtime';
import yargs, { InferredOptionTypes } from 'yargs';

import { Command } from '../command';
import { coerceOptions, OptSpec } from '../optspec';
import { Package } from '../package';

const gtx = Textdomain.getInstance('e-invoice-eu-cli');

const options: {
	url: OptSpec;
	verbose: OptSpec;
	quiet: OptSpec;
} = {
	url: {
		group: gtx._('Server Location'),
		alias: ['u'],
		type: 'string',
		demandOption: false,
		describe: gtx._('base URL of the server'),
		default: 'http://localhost:8080',
	},
	verbose: {
		group: gtx._('Mode of operation'),
		alias: ['v'],
		type: 'boolean',
		conflicts: 'quiet',
		demandOption: false,
		describe: gtx._('output all reports'),
	},
	quiet: {
		group: gtx._('Mode of operation'),
		alias: ['q'],
		type: 'boolean',
		conflicts: 'verbose',
		demandOption: false,
		describe: gtx._('suppress output'),
	},
};

export type ConfigOptions = InferredOptionTypes<typeof options>;

export class Validate implements Command {
	description(): string {
		return gtx._('Validate invoices.');
	}

	aliases(): Array<string> {
		return [];
	}

	build(argv: yargs.Argv): yargs.Argv<object> {
		return argv.options(options);
	}

	private async doRun(configOptions: ConfigOptions) {
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
