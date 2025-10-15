import fs from 'fs';
import Ajv from 'ajv/dist/2019';

const args = process.argv.slice(2);

if (args.length !== 1) {
	console.error('Usage: check-json-schema.mts <schema-file>');
	process.exit(1);
}

const schemaFile = args[0];

try {
	const schema = JSON.parse(fs.readFileSync(schemaFile, 'utf8'));
	const ajv = new Ajv({ strict: false });

	ajv.compile(schema);
} catch (err) {
	console.error(`Failed to compile ${schemaFile}:`, err.message);
	process.exit(1);
}
