import { FormatFactoryService } from '@e-invoice-eu/core';
import { Textdomain } from '@esgettext/runtime';
import yargs, { InferredOptionTypes } from 'yargs';

import { Command } from '../command';
import { coerceOptions, OptSpec } from '../optspec';
import { Package } from '../package';

const gtx = Textdomain.getInstance('e-invoice-eu-cli');

const options: {
	list: OptSpec;
	info: OptSpec;
} = {
	list: {
		group: gtx._('Operation mode'),
		alias: ['l'],
		type: 'boolean',
		conflicts: 'info',
		demandOption: false,
		describe: gtx._('list all supported formats'),
	},
	info: {
		group: gtx._('Operation mode'),
		alias: ['i'],
		type: 'string',
		conflicts: 'list',
		demandOption: false,
		describe: gtx._('show detailed information about one format'),
	},
};

export type ConfigOptions = InferredOptionTypes<typeof options>;

export class Format implements Command {
	description(): string {
		return gtx._('List and describe supported formats.');
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
		const info = factoryService.info(format);

		for (const prop in info) {
			console.log(`${prop}: ${info[prop]}`);
		}
	}

	private async doRun(configOptions: ConfigOptions) {
		if (typeof configOptions.info === 'undefined' && !configOptions.list) {
			throw new Error(
				gtx._("One of the options '--list' or '--info' is required!"),
			);
		}

		if (configOptions.list) {
			this.list();
		} else {
			this.info(configOptions.info as string);
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
