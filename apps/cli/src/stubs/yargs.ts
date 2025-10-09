/* eslint-disable @typescript-eslint/no-unused-vars */
// Minimal runtime stub for tests — returns a chainable object.
import type { Argv } from 'yargs';

function makeStub(): any {
	const stub: any = {
		command: (..._args: any[]) => stub,
		option: (..._args: any[]) => stub,
		options: (..._args: any[]) => stub,
		help: (..._args: any[]) => stub,
		parse: (..._args: any[]) => ({}),
		demandOption: (..._args: any[]) => stub,
		middleware: (..._args: any[]) => stub,
	};
	return stub;
}

export default function yargs(_argv?: string[] | null): Argv {
	return makeStub() as Argv;
}
