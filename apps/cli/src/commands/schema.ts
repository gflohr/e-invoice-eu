import { mappingSchema, invoiceSchema } from '@e-invoice-eu/core';
import { Textdomain } from '@esgettext/runtime';
import * as fs from 'fs/promises';
import { Arguments, Argv, InferredOptionTypes } from 'yargs';

import { Command } from '../command';
import { coerceOptions, OptSpec } from '../optspec';
import { Package } from '../package';
import { safeStdoutWrite } from '../safe-stdout-write';

const gtx = Textdomain.getInstance('e-invoice-eu-cli');

const options: {
	id: OptSpec;
	output?: OptSpec;
} = {
	id: {
		group: gtx._('Schema selection'),
		alias: ['i'],
		type: 'string',
		choices: ['invoice', 'mapping'],
		demandOption: true,
		describe: gtx._('the schema to output'),
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

export class Schema implements Command {
	description(): string {
		return gtx._('Output JSON schema.');
	}

	aliases(): Array<string> {
		return [];
	}

	build(argv: Argv): Argv<object> {
		return argv.options(options);
	}

	private async doRun(configOptions: ConfigOptions) {
		const schema =
			configOptions.id === 'mapping' ? mappingSchema : invoiceSchema;
		const output = JSON.stringify(schema);

		if (
			typeof configOptions.output === 'undefined' ||
			configOptions.output === '-'
		) {
			await safeStdoutWrite(output);
		} else {
			await fs.writeFile(configOptions.output as string, output, 'utf-8');
		}
	}

	public async run(argv: Arguments): Promise<number> {
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
