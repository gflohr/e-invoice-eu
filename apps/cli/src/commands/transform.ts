import { Textdomain } from '@esgettext/runtime';
import yargs, { InferredOptionTypes } from 'yargs';

import { Command } from '../command';
import { coerceOptions, OptSpec } from '../optspec';
import { Package } from '../package';

const gtx = Textdomain.getInstance('e-invoice-eu-cli');

const options: {
	data: OptSpec;
	mapping: OptSpec;
} = {
	data: {
		group: gtx._('Input data'),
		alias: ['d'],
		type: 'string',
		demandOption: true,
		describe: gtx._('the invoice spreadsheet file'),
	},
	mapping: {
		group: gtx._('Input data'),
		alias: ['m'],
		type: 'string',
		demandOption: true,
		describe: gtx._('the mapping file'),
	},
};

export type ConfigOptions = InferredOptionTypes<typeof options>;

export class Transform implements Command {
	description(): string {
		return gtx._('Transform spreadsheet data to JSON.');
	}

	aliases(): Array<string> {
		return [];
	}

	build(argv: yargs.Argv): yargs.Argv<object> {
		return argv.options(options);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private async doRun(configOptions: ConfigOptions) {
		console.log('todo');
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
