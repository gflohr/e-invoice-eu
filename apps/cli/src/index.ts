#! /usr/bin/env node

import { Textdomain } from '@esgettext/runtime';
import * as path from 'path';
import * as v from 'valibot';
import '@valibot/i18n/de';
import yargs from 'yargs';

import { Command } from './command';
import { Format } from './commands/format';
import { Invoice } from './commands/invoice';
import { Schema } from './commands/schema';
import { Transform } from './commands/transform';
import { Validate } from './commands/validate';
import { Package } from './package';

const commandNames = ['invoice', 'transform', 'validate', 'format', 'schema'];

const gtx = Textdomain.getInstance('e-einvoice-eu-cli');
v.setGlobalConfig({ lang: Textdomain.locale });
const localePath = path.join(__dirname, 'locale');
gtx.bindtextdomain(localePath);
gtx
	.resolve()
	.then(async () => {
		let exitCode = 0;
		const ulocale = Textdomain.locale.replace('-', '_');

		const commands: { [key: string]: Command } = {
			invoice: new Invoice(),
			transform: new Transform(),
			validate: new Validate(),
			format: new Format(),
			schema: new Schema(),
		};

		const program = yargs(process.argv.slice(2))
			.locale(ulocale)
			.strict()
			.showHelpOnFail(
				false,
				gtx._x(
					"Try '{programName} --help' or '{programName} COMMAND --help' for more information!",
					{
						programName: Package.getName(),
					},
				),
			)
			.demandCommand(1, gtx._('Error: No command given.'))
			.scriptName(Package.getName());

		for (const name of commandNames) {
			const command = commands[name];

			const commandName = command.synopsis
				? `${name} ${command.synopsis()}`
				: name;

			program.command({
				command: commandName,
				aliases: command.aliases(),
				describe: command.description(),
				builder: (argv: yargs.Argv) => {
					return command.build(argv);
				},
				handler: async (argv: yargs.Arguments) => {
					argv._.shift();
					exitCode = await command.run(argv);
				},
			});
		}
		const epilogue = gtx._x('Report bugs in the bugtracker at\n{url}!', {
			url: Package.getBugTrackerUrl(),
		});

		await program.help().epilogue(epilogue).parse();

		process.exit(exitCode);
	})
	.catch((exception: Error) => {
		console.error(gtx._x('{programName}: unhandled exception: {exception}'), {
			programName: Package.getName(),
			exception,
		});

		process.exit(2);
	});
