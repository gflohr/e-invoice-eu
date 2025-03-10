import yargs from 'yargs';

export interface Command {
	synopsis?(): string;
	description(): string;
	aliases(): Array<string>;
	build(argv: yargs.Argv): yargs.Argv<object>;
	run(argv: yargs.Arguments): Promise<number>;
}
