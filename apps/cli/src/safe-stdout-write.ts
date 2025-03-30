/* istanbul ignore file */
// Why is this not included in test coverage? A unit test would have to
// mock away the underlying implementation of stdout.  But this function
// only exists because of the underlying limitations of stdout.  A unit
// test, therefore would have to do a large write to file descriptor 1
// which is not feasible.
//
// What the function addresses is a problem writing large schema data
// (around 90 kb) to the console. If that is piped to a program like `jq`
// the output gets truncated to 64k bytes when you just do a
// conventional `process.stdout.write()`.
//
// Any ideas on how to test that are welcome.

import { once } from 'events';
import * as stream from 'stream';
import * as util from 'util';

const CHUNK_SIZE = 16 * 1024;

const finished = util.promisify(stream.finished);

export const safeStdoutWrite = async (output: string) => {
	let offset = 0;

	while (offset < output.length) {
		const chunk = output.slice(offset, offset + CHUNK_SIZE);
		const canContinue = process.stdout.write(chunk);

		if (!canContinue) {
			await once(process.stdout, 'drain');
		}

		offset += CHUNK_SIZE;
	}

	process.stdout.end();

	await finished(process.stdout);
};

export const safeStdoutBufferWrite = async (output: Uint8Array) => {
	let offset = 0;

	while (offset < output.length) {
		const chunk = output.subarray(offset, offset + CHUNK_SIZE);
		const canContinue = process.stdout.write(chunk);

		if (!canContinue) {
			await once(process.stdout, 'drain');
		}

		offset += CHUNK_SIZE;
	}

	process.stdout.end();
	await finished(process.stdout);
};
