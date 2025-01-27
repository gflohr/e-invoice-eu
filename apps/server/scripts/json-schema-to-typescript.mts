import { promises as fs } from 'fs';
import * as path from 'path';

if (process.argv.length !== 3) {
	console.error(`Usage: ${process.argv[1]} NAME`);
	process.exit(1);
}

generateCode(process.argv[2]);

async function generateCode(name: string) {
	const schemaFile = path.join('src', 'schema', `${name}.schema.json`);

	const json = (await fs.readFile(schemaFile, 'utf-8')).trim();

	const interfaceName = name.replace(/^(.)/, c => c.toUpperCase());

	const code =
		'/*\n' +
		` * This file is generated from '${schemaFile}'.\n` +
		' * Do not edit!\n' +
		' */\n' +
		'\n' +
		`import { JSONSchemaType } from 'ajv';\n` +
		`import { ${interfaceName} } from './${name}.interface';\n` +
		'\n' +
		`export const ${name}Schema: JSONSchemaType<${interfaceName}> = ${json}` +
		` as unknown as JSONSchemaType<${interfaceName}>;\n`;

	const outputFile = path.join('src', name, `${name}.schema.ts`);
	await fs.writeFile(outputFile, code);
}
