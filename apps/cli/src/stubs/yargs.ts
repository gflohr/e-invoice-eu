// Minimal runtime stub for tests — returns a chainable object.
import type { Argv } from 'yargs';

function makeStub(): unknown {
	const stub: Record<string, unknown> = {
		command: (..._args: unknown[]) => stub,
		option: (..._args: unknown[]) => stub,
		options: (..._args: unknown[]) => stub,
		help: (..._args: unknown[]) => stub,
		parse: (..._args: unknown[]) => ({}),
		demandOption: (..._args: unknown[]) => stub,
		middleware: (..._args: unknown[]) => stub,
	};
	return stub;
}

export default function yargs(_argv?: string[] | null): Argv {
	return makeStub() as Argv;
}
