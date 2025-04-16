#! /usr/bin/env node

import { spawn } from 'child_process';
import * as fs from 'fs/promises';

const examples = [
	'default-invoice',
	'default-credit-note',
	'default-corrected-invoice',
];

async function testAll() {
	const formatListResult = await runEInvoiceEU(['format', '--list']);
	let formatListOutput = '';
	formatListResult.output.forEach(line => {
		formatListOutput += line.data;
	});
	const allFormats = formatListOutput
		.split('\n')
		.filter(line => line.length > 0);
	const xrechnungFormats = allFormats.filter(
		format => !format.match(/^Factur-X-/),
	);
	const facturXFormats = allFormats.filter(format =>
		format.match(/^Factur-X-/),
	);

	const validators = {
		KoSIT: {
			cmd: 'contrib/validators/kosit/validate.mjs',
			formats: xrechnungFormats,
		},
		MustangProject: {
			cmd: 'contrib/validators/factur-x/factur-x-validate.mjs',
			formats: facturXFormats,
		},
	};

	for (const format of allFormats) {
		const extension = format.match(/Factur-X-/) ? 'pdf' : 'xml';

		for (const example of examples) {
			const fromSpreadsheet = `from-spreadsheet.${extension}`;
			await createInvoice(fromSpreadsheet, format, example, true);
			const fromJson = `from-json.${extension}`;
			await createInvoice(fromJson, format, example, true);
			for (const validator of Object.keys(validators).sort()) {
				process.stdout.write(
					`Testing example '${example}' in format '${format}' with validator '${validator}' ...`,
				);
				console.log(' done');
			}
			try {
				await fs.unlink(fromSpreadsheet);
			} catch {}
			try {
				await fs.unlink(fromJson);
			} catch {}
		}
	}
}

async function createInvoice(outputFilename, format, example, map) {
	const args = ['invoice', '--format', format, '--output', outputFilename];
	if (map) {
		args.push('--spreadsheet', `contrib/templates/${example}.ods`);
		args.push('--mapping', 'contrib/mappings/default-invoice.yaml');
	} else {
		args.push('--invoice', `contrib/data/${example}.json`);
	}

	await runEInvoiceEU(args);
}

function runEInvoiceEU(args) {
	return runCommand('npx', ['tsx', 'apps/cli/src/index.ts', ...args]);
}

function runCommand(command, args = []) {
	return new Promise((resolve, reject) => {
		const result = {
			output: [],
		};
		const process = spawn(command, args);

		process.stdout.on('data', data => {
			const str = data.toString();
			result.output.push({
				data: str,
				channel: 'stdout',
			});
		});

		process.stderr.on('data', data => {
			const str = data.toString();
			result.output.push({
				data: str,
				channel: 'stderr',
			});
		});

		process.on('close', code => {
			result.code = code;

			if (code === 0) {
				resolve(result);
			} else {
				reject(result);
			}
		});

		process.on('error', err => {
			result.code = -1;
			result.err = err;
			reject(result);
		});
	});
}

testAll().catch(err => {
	console.error('Uncaught exception:', err);
});
