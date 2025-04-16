#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const progName = process.argv[2];

if (process.argv.length < 3) {
	console.error(`Usage: ${progName} [OPTIONS] INVOICE_FILE...`);
	process.exit(1);
}

const jarPath = process.env.VALIDATIONTOOL_JAR ?? join(__dirname, 'validationtool.jar');

if (!existsSync(jarPath)) {
	console.error(`${progName}: ${jarPath}: File does not exist.`);
	process.exit(1);
}

const repository = join(__dirname, 'xrechnung-scenario');
const scenarios = join(repository, 'scenarios.xml');

const command = process.env.JAVA ?? 'java';
const [, , ...scriptArgs] = process.argv;

const args = [
	'-jar', jarPath,
	'--scenarios', scenarios,
	'--repository', repository,
	scriptArgs,
];

spawn(command, args, { stdio: 'inherit' });
