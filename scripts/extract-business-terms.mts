import { JSONSchemaType } from 'ajv/dist/2019';
import * as fs from 'fs';

type BusinessTerms = {
	[term: string]: string[];
};

if (process.argv.length !== 3) {
	console.error(`Usage: ${process.argv[1]} INPUT_SCHEMA`);
}

const invoiceSchemaFilename = process.argv[2];
const schema: JSONSchemaType<any> = JSON.parse(
	fs.readFileSync(invoiceSchemaFilename, 'utf-8'),
);

console.log('<!-- This file is generated! Do not edit! -->');
console.log('# List of Business Terms\n');
console.log(
	'This table maps allEN16931 business terms and business groups to' +
		' their respective XML elements.\n',
);
console.log('| Term | Usage |');
console.log('|------|-------|');

const businessTerms = recurseSchema(schema, []);
const sortedTerms = Object.keys(businessTerms).sort((a, b) => {
	const [prefixA, numA] = a.split('-');
	const [prefixB, numB] = b.split('-');

	const prefixComparison = prefixA.localeCompare(prefixB);
	if (prefixComparison !== 0) return prefixComparison;

	return parseInt(numA, 10) - parseInt(numB, 10);
});

for (const term of sortedTerms) {
	const usage: string[] = [];
	for (const path of businessTerms[term]) {
		const hyph = path.replace(/:/g, '-').replace('ubl-Invoice', 'ubl-invoice');
		const link = `https://docs.peppol.eu/poacc/billing/3.0/syntax${hyph}/`;
		usage.push(`[${path}](${link})`);
	}

	console.log(`| ${term} | ${usage.join(' ')} |`);
}

function recurseSchema(
	schema: JSONSchemaType<any>,
	path: string[],
): BusinessTerms {
	const allTerms: BusinessTerms = {};

	if (typeof schema === 'object') {
		for (const key of Object.keys(schema)) {
			const newPath = [...path];
			if (key.match(/^(?:ubl|cac|cbc):[a-zA-Z]+$/)) {
				newPath.push(key);
			} else if (key === 'description') {
				const description = schema.description;
				const re = new RegExp(
					'\nBusiness terms: (B[TG]-[1-9][0-9]*(?:, B[TG]-[1-9][0-9]*)?)$',
				);
				if (description.match(re)) {
					const terms = (re.exec(description) as RegExpExecArray)[1].split(
						', ',
					);

					for (const term of terms) {
						allTerms[term] ??= [];
						allTerms[term].push('/' + newPath.join('/'));
					}
				}
			}

			Object.assign(allTerms, recurseSchema(schema[key], newPath));
		}
	}

	return allTerms;
}
