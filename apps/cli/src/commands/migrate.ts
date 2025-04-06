import { MappingService } from '@e-invoice-eu/core';
import { Textdomain } from '@esgettext/runtime';
import * as fs from 'fs/promises';
import * as yaml from 'js-yaml';
import yargs, { InferredOptionTypes } from 'yargs';

import { Command } from '../command';
import { coerceOptions, OptSpec } from '../optspec';
import { Package } from '../package';
import { safeStdoutWrite } from '../safe-stdout-write';

const gtx = Textdomain.getInstance('e-invoice-eu-cli');

const options: {
	mapping: OptSpec;
	output?: OptSpec;
} = {
	mapping: {
		group: gtx._('Input file location'),
		alias: ['m'],
		type: 'string',
		demandOption: true,
		describe: gtx._('the mapping file'),
	},
	output: {
		group: gtx._('Output file location'),
		alias: ['o'],
		type: 'string',
		demandOption: false,
		describe: gtx._('the output file; standard output if `-`'),
	},
};

export type ConfigOptions = InferredOptionTypes<typeof options>;

export class Migrate implements Command {
	description(): string {
		return gtx._('Migrate files.');
	}

	aliases(): Array<string> {
		return [];
	}

	build(argv: yargs.Argv): yargs.Argv<object> {
		return argv.options(options);
	}

	private async doRun(configOptions: ConfigOptions) {
		const yamlData = await fs.readFile(
			configOptions.mapping as string,
			'utf-8',
		);
		const mapping = yaml.load(yamlData);

		const mappingService = new MappingService(console);

		const output = yaml.dump(
			mappingService.migrate(mapping),
		);

		if (
			typeof configOptions.output === 'undefined' ||
			configOptions.output === '-'
		) {
			safeStdoutWrite(output);
		} else {
			await fs.writeFile(configOptions.output as string, output, 'utf-8');
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
