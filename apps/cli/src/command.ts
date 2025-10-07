import type { Arguments, Argv } from 'yargs';

export interface Command {
	synopsis?(): string;
	description(): string;
	aliases(): Array<string>;
	build(argv: Argv): Argv<object>;
	run(argv: Arguments): Promise<number>;
}
