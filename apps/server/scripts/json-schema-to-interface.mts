#! /usr/bin/env node

import * as fs from 'fs';
import { compile } from 'json-schema-to-typescript';

if (process.argv.length !== 4) {
	console.error(`Usage: ${process.argv[1]} INPUT_SCHEMA INTERFACE`);
}

const inputSchemaFilename = process.argv[2];
const interfaceFilename = process.argv[3];

const inputSchema = JSON.parse(fs.readFileSync(inputSchemaFilename, 'utf-8'));
// Make the names a little shorter.
delete inputSchema.$id;

const style = JSON.parse(fs.readFileSync('.prettierrc', 'utf-8'));

const options = { style };

compile(inputSchema, 'Invoice', options).then(ts => {
	fs.writeFileSync(interfaceFilename, ts);
});
