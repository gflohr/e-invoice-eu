#! /usr/bin/env node

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const directory = dirname(filename);
const packageJsonPath = join(directory, 'package.json');

const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

console.log(`export class Package {
	public static getName(): string {
		return 'e-invoice-eu';
	}

	public static getBugTrackerUrl(): string {
		return '${pkg.bugs.url}';
	}

	public static getVersion(): string {
		return '${pkg.version}';
	}

	public static getAuthorName(): string {
		return '${pkg.author.name}';
	}

	public static getAuthorUrl(): string {
		return '${pkg.author.url}';
	}
}`);
