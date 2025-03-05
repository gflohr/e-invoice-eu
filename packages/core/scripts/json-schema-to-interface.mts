#! /usr/bin/env node

import * as fs from 'fs';
import { compile } from 'json-schema-to-typescript';
import { LinkedJSONSchema } from 'json-schema-to-typescript/dist/src/types/JSONSchema';
import * as path from 'path';
import { fileURLToPath } from 'url';

if (process.argv.length !== 4) {
	console.error(`Usage: ${process.argv[1]} INPUT_SCHEMA INTERFACE`);
}

const inputSchemaFilename = process.argv[2];
const interfaceFilename = process.argv[3];

const inputSchema = JSON.parse(fs.readFileSync(inputSchemaFilename, 'utf-8'));
// Make the names a little shorter.
delete inputSchema.$id;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.resolve(__dirname, '../../../.prettierrc');
const style = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const options = { style };

compile(inputSchema, 'Invoice', options).then(ts => {
	fs.writeFileSync(interfaceFilename, ts);
});
