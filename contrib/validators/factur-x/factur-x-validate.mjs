#!/usr/bin/env node

import { execFile } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const progName = process.argv[2];

if (process.argv.length !== 3) {
	console.error(`Usage: ${progName} EINVOICE.pdf`);
	process.exit(1);
}

const inputFile = process.argv[2];

const jarPath = process.env.MUSTANG_CLI_JAR ?? join(__dirname, 'Mustang-CLI.jar');

if (!existsSync(jarPath)) {
	console.error(`${progName}: ${jarPath}: File does not exist.`);
	process.exit(1);
}

const command = process.env.JAVA ?? 'java';
const args = ['-jar', jarPath, '--action', 'validate', '--no-notices', '--source', inputFile];

// Execute the command
execFile(command, args, (error, stdout, stderr) => {
	if (error) {
		console.error(stdout);
		console.error(stderr);
		process.exit(1);
	} else {
		// Print success message
		console.log(`${inputFile} is valid.`);
	}
});
