#! /usr/bin/env node

import { spawn } from 'child_process';
import * as fs from 'fs/promises';

const examples = [
	'default-invoice',
	'default-credit-note',
	'default-corrected-invoice',
];

async function testAll() {
	await runCommand('bun', ['run', 'build']);
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
	// for (const format of facturXFormats) {
		const extension = format.match(/Factur-X-/) ? 'pdf' : 'xml';

		for (const example of examples) {
			if (example.match(/credit-note/) && (
				format.match(/^Factur-X/) || format.match(/CII/))) {
				continue;
			} else if (example.match(/(?:corrected-invoice|credit-note)/) && format.match(/^XRECHNUNG-/)) {
				// See https://github.com/itplr-kosit/validator-configuration-xrechnung/issues/138!
				console.warn('FIXME! Corrected invoice in XRECHNUNG-* fails!');
				continue;
			}
			const fromSpreadsheet = `from-spreadsheet.${extension}`;
			await createInvoice(fromSpreadsheet, format, example, true);
			const fromJson = `from-json.${extension}`;
			await createInvoice(fromJson, format, example, false);

			const validator = validators.KoSIT.formats.includes(format)
				? 'KoSIT'
				: 'MustangProject';

			process.stdout.write(
				`Testing example '${example}' in format '${format}' with validator '${validator}' ...`,
			);

			await validate(
				validators[validator].cmd,
				fromSpreadsheet,
				validator,
				format,
			);
			await validate(validators[validator].cmd, fromJson, validator, format);

			console.log(' done');

			if (validator === 'KoSIT') {
				try {
					await fs.unlink('from-spreadsheet-report.xml');
				} catch {}
				try {
					await fs.unlink('from-json-report.xml');
				} catch {}
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

async function validate(cmd, filename, validator, format) {
	try {
		await runCommand('node', [cmd, filename]);
	} catch (error) {
		console.error(
			` validator '${validator}' failed for '${filename}' in format '${format}'`,
		);
		error.output.forEach(line => {
			if (line.channel === 'stdout') {
				process.stderr.write(line.data);
			} else {
				process.stderr.write(line.data);
			}
			process.exit(1);
		});
	}
}

// FIXME! Change that to use both the cli version and the server.
async function createInvoice(outputFilename, format, example, map) {
	const args = ['invoice', '--format', format, '--output', outputFilename];
	if (map) {
		process.stdout.write(
			`Creating document '${outputFilename}' from invoice spreadsheet ...`,
		);
		args.push('--spreadsheet', `contrib/templates/${example}.ods`);
		args.push('--mapping', 'contrib/mappings/default-invoice.yaml');
	} else {
		process.stdout.write(
			`Creating document '${outputFilename}' from invoice json ...`,
		);
		args.push('--spreadsheet', `contrib/templates/${example}.ods`);
		args.push('--mapping', 'contrib/mappings/default-invoice.yaml');
		if (format.match(/Factur-X-/)) {
			args.push('--pdf', `contrib/templates/${example}.pdf`);
		}
	}

	await runEInvoiceEU(args);

	console.log(' done');
}

function runEInvoiceEU(args) {
	return runCommand('node', ['apps/cli/dist/index.js', ...args]);
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
	console.error('Test failed:', err);
});
