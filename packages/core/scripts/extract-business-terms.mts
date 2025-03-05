import { JSONSchemaType } from 'ajv';
import * as fs from 'fs';

type BusinessTerms = {
	[term: string]: string[];
};

type Type = 'terms' | 'groups';

if (process.argv.length !== 4) {
	console.error(`Usage: ${process.argv[1]} TYPE INPUT_SCHEMA`);
	process.exit(1);
}

const type: Type = process.argv[2] as Type;
if (type !== 'terms' && type !== 'groups') {
	console.error(`Type can only be "terms" or "groups".`);
	process.exit(1);
}

const invoiceSchemaFilename = process.argv[3];
const schema: JSONSchemaType<any> = JSON.parse(
	fs.readFileSync(invoiceSchemaFilename, 'utf-8'),
);

const title = type === 'terms' ? 'Business Terms' : 'Business Groups';
const lctitle = title.toLowerCase();
const shortTitle = type === 'terms' ? 'Term' : 'Group';
const name = type === 'terms' ? 'business-terms' : 'business-groups';

console.log('---');
console.log(`title: ${title}`);
console.log(`name: ${name}`);
console.log('section: other');
console.log(
	`description: This table maps all EN16931 ${lctitle}` +
		' their respective XML elements.',
);
console.log(
	'styles: "<style>td { word-break: break-all; font-size: smaller; }</style>"',
);
console.log('---');
console.log('<!-- This file is generated! Do not edit! -->');
console.log(`| ${shortTitle} | Usage<!--qgoda-no-xgettext-->|`);
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
		const breakablePath = path.replace(/\//g, '&hairsp;/');
		usage.push(`[${breakablePath}](${link})`);
	}

	console.log(`| ${term} | ${usage.join('<br />')} |`);
}

console.log(`<!--/qgoda-no-xgettext-->`);

function recurseSchema(
	schema: JSONSchemaType<any>,
	path: string[],
): BusinessTerms {
	const allTerms: BusinessTerms = {};

	if (typeof schema === 'object') {
		for (const key of Object.keys(schema)) {
			const newPath = [...path];
			if (key.match(/^(?:ubl|cac|cbc):[a-zA-Z]+(?:@[a-zA-Z]+)?$/)) {
				newPath.push(key);

				const re = new RegExp(
					'\nBusiness terms: (B[TG]-[1-9][0-9]*(?:, B[TG]-[1-9][0-9]*)?)$',
				);

				if (typeof schema[key] !== 'object') continue;

				const description =
					schema[key].type === 'array'
						? schema[key].items.description
						: schema[key].description;

				if (description && description.match(re)) {
					const terms = (re.exec(description) as RegExpExecArray)[1].split(
						', ',
					);

					const typeRe =
						type === 'terms' ? new RegExp(/^BT-/) : new RegExp(/^BG-/);
					for (const term of terms.filter(term => term.match(typeRe))) {
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
