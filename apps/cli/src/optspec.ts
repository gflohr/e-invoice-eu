import { Textdomain } from '@esgettext/runtime';
import yargs from 'yargs';

import { Package } from './package';

const gtx = Textdomain.getInstance('e-invoice-eu-cli');

export interface OptSpec extends yargs.Options {
	multi?: boolean;
}

export function coerceOptions(
	args: yargs.Arguments,
	optspecs: { [optname: string]: OptSpec },
): boolean {
	for (const optname in optspecs) {
		const optspec = optspecs[optname];
		const optkey = optname.replace(/-(.)/g, (_, group1) =>
			group1.toUpperCase(),
		);
		const arg = args[optkey];
		const isArray = typeof arg === 'object' && Array.isArray(arg);
		if (optspec.multi) {
			if (typeof arg !== 'undefined' && !isArray) {
				args[optkey] = [args[optkey]];
			}
		} else {
			if (isArray) {
				console.error(
					gtx._x(
						'{programName}: Error: The option' +
							" '{optname}' cannot be specified more than once!",
						{ programName: Package.getName(), optname },
					),
				);

				return false;
			}
		}
	}

	return true;
}
