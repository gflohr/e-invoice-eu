import { Textdomain } from '@esgettext/runtime';
import chalk from 'chalk';
import * as fs from 'fs/promises';
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
		group: gtx._('Mode of Operation'),
		alias: ['v'],
		type: 'boolean',
		conflicts: 'quiet',
		demandOption: false,
		describe: gtx._('output all reports'),
	},
	quiet: {
		group: gtx._('Mode of Operation'),
		alias: ['q'],
		type: 'boolean',
		conflicts: 'verbose',
		demandOption: false,
		describe: gtx._('suppress output'),
	},
};

export type ConfigOptions = InferredOptionTypes<typeof options> & {
	invoice: string;
	invoices: string[];
};
export class Validate implements Command {
	synopsis(): string {
		return '<invoice> [invoices...]';
	}

	description(): string {
		return gtx._('Validate invoices.');
	}

	aliases(): Array<string> {
		return [];
	}

	build(argv: yargs.Argv): yargs.Argv<object> {
		return argv.options(options);
	}

	private async validate(
		url: URL,
		filename: string,
		configOptions: ConfigOptions,
	): Promise<boolean> {
		const mimeType = filename.match(/\.pdf$/i)
			? 'application/pdf'
			: 'application/xml';
		const body = await fs.readFile(filename);
		const form = new FormData();
		const blob = new Blob([body], { type: mimeType });
		form.append('invoice', blob, filename);

		let response: Response;
		try {
			response = await fetch(url, {
				method: 'POST',
				body: form,
			});
		} catch (error) {
			console.error(
				`${filename}:`,
				chalk.bold.red(
					'✗ ' +
						gtx._x(
							'invalid. Is the validation server running at {url}? Error: {error}.',
							{
								filename,
								url,
								error,
							},
						),
				),
			);
			return false;
		}

		if (response.status === 200) {
			if (!configOptions.quiet) {
				console.log(`${filename}:`, chalk.green('✓ ' + gtx._('valid')));
			}
			if (configOptions.verbose) {
				console.log(await response.text());
			}
		} else {
			if (!configOptions.quiet) {
				console.error(`${filename}:`, chalk.bold.red('✗ ' + gtx._('invalid')));
				console.error(await response.text());
			}
			return false;
		}

		return true;
	}

	private async doRun(configOptions: ConfigOptions) {
		const url = new URL(configOptions.url as string);
		url.pathname = '/validate';

		const invoices = [configOptions.invoice, ...configOptions.invoices];

		let success = 0;
		let errors = 0;
		for (const invoice of invoices) {
			try {
				if (await this.validate(url, invoice, configOptions)) {
					++success;
				} else {
					++errors;
				}
			} catch (e) {
				if (!configOptions.quiet) {
					console.error(e);
				}
				++errors;
			}
		}

		if (!configOptions.quiet) {
			console.log(
				gtx._nx('One invoice is valid', '{num} invoices are valid', success, {
					num: success.toString(),
				}),
			);
			if (errors) {
				console.log(
					gtx._nx(
						'One invoice is invalid',
						'{num} invoices are invalid',
						errors,
						{
							num: success.toString(),
						},
					),
				);
			}
		}

		if (errors) {
			throw new Error(gtx._x('Validation failed!'));
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
			if (configOptions.verbose) {
				console.error(
					gtx._x('{programName}: {error}', {
						programName: Package.getName(),
						error: e,
					}),
				);
			}

			return 1;
		}
	}
}
