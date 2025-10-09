#! /usr/bin/env node

// This script parses the PEPPOL XML sources that are used to generate the
// site docs.peppol.eu.  It converts the XML files into a JSON schema for
// the internal invoice format of `e-invoice-eu`.

import * as XLSX from '@e965/xlsx';
import { JSONSchemaType } from 'ajv';
import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs';
import * as path from 'path';

// Data types:
// - Amount: number >= zero, max. 2 decimal digits.
// - Binary object: Base64 string
// - Code
// - Date
// - Document Reference
// - Identifier
// - Percentage
// - Quantity
// - Text

type Cardinality = {
	min: number;
	max: number;
};

type Element = {
	Term: string;
	Name?: string;
	Description?: string;
	DataType?: string;
	CodeList?: string[];
	BusinessTerms?: string[];
	children?: Array<Element>;
	cardinality?: string;

	// For Docs.
	rules?: string[];
	example?: string;
	default?: string;
	fixed?: string;
};

type CodeListValue = {
	Id: string;
	Name?: string;
	Description?: string;
};

type AssertNode = {
	assert: {
		'#text': string;
	}[];
	':@': {
		'@_id': string;
		'@_flag': string;
	};
};

const parser = new XMLParser({
	ignoreAttributes: false,
	removeNSPrefix: true,
	preserveOrder: true,
	alwaysCreateTextNode: false,
	attributeNamePrefix: '@_',
	textNodeName: '#text',
});

const codeLists: { [key: string]: { enum: Array<string> } } = {};
const codeListValues: { [key: string]: Array<CodeListValue> } = {};
const rules: Record<string, { flag: string; text: string }> = {};

const $defs = {
	codeLists,
	dataTypes: {
		Amount: {
			type: 'string',
			pattern: '^[-+]?(0|[1-9][0-9]*)(.[0-9]{1,2})?$',
		},
		'Binary object': {
			type: 'string',
			// This is maybe too restrictive because it does not allow whitespace
			// but this should be okay for our purposes.
			pattern:
				'^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)$',
		},
		Date: {
			type: 'string',
			pattern: '^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$',
		},
		Percentage: {
			type: 'string',
			// FIXME! The ZUGFeRD documentation states that a percentage must have
			// a maximum of 4 decimal digts. Is that correct?
			pattern: '^[-+]?(0|[1-9][0-9]*)(.[0-9]{1,4})?$',
		},
		Quantity: {
			type: 'string',
			pattern: '^[-+]?(0|[1-9][0-9]*)(.[0-9]+)?$',
		},
	},
};

const outputDocs = process.argv.length === 3 && process.argv[2] === '--docs';

const codeListDir = 'peppol-bis-invoice-3/structure/codelist';
loadCodeLists(codeListDir);

const rulesDir = 'peppol-bis-invoice-3/rules/sch';
loadRules(rulesDir);

const rootFilename = 'peppol-bis-invoice-3/structure/syntax/ubl-invoice.xml';
const basedir = rootFilename.substring(0, rootFilename.lastIndexOf('/'));
const structure = readXml(parser, rootFilename)[0].Structure;
for (const element of structure) {
	if ('Document' in element) {
		element.Element = element.Document;
		delete element.Document;
		const tree = buildTree(element.Element);
		sortAttributes(tree);
		if (outputDocs) {
			printDocs(tree);
		} else {
			const schema = buildSchema(tree);
			fixupAttributes(schema);
			patchSchema(schema);
			console.log(JSON.stringify(schema, null, '\t'));
		}

		process.exit(0);
	}
}

throw new Error(`error parsing '${rootFilename}'`);

function printDocs(tree: Element) {
	console.log('# PEPPOL UBL Invoice\n');
	console.log(
		'This document describes the structure of the internal data format.\n',
	);
	console.log('## Elements\n');
	console.log('The elements are identified by their slash separated path.\n');

	printElement(tree, []);

	console.log('## Code Lists\n');

	for (const key of Object.keys(codeListValues).sort()) {
		const codeList = codeListValues[key];

		console.log(`### ${key}\n`);

		codeList.forEach(entry => {
			let item = entry.Id;
			if ('Name' in entry || 'Description' in entry) {
				item += ' (';
				if ('Name' in entry) item += `**${entry.Name}:**`;
				if ('Description' in entry) item += ` ${entry.Description}`;
				item += ')';
			}
			console.log(`* ${item}`);
		});

		console.log('\n');
	}
}

function printElement(element: Element, path: string[]) {
	let term = '/' + element.Term;
	if (path.length) {
		term = '/' + path.join('/') + term;
	}

	const name = element.Name ? ` (**${element.Name}**)` : '';
	let headline: string;

	if (element.Term.includes('@')) {
		// Attribute of the last element.
		const attribute = term.replace(/.*@/, '@');
		const attrCardinality = element.cardinality?.startsWith('0')
			? 'Optional'
			: 'Mandatory';

		headline = '#####';

		console.log(`#### ${attrCardinality} Attribute ${attribute} ${name}\n`);
	} else {
		console.log(`### ${term}${name}\n`);

		headline = '####';

		if (element.cardinality) {
			console.log(`Cardinality: ${element.cardinality}\n`);
		}
	}

	if (element.Description) {
		console.log(element.Description + '\n');
	}

	if (element.BusinessTerms?.length) {
		console.log(`Business Terms: ${element.BusinessTerms.join(', ')}\n`);
	}

	if (Object.prototype.hasOwnProperty.call(element, 'example')) {
		console.log(`Example value: ${element.example}\n`);
	}

	if (Object.prototype.hasOwnProperty.call(element, 'default')) {
		console.log(`Default value: ${element.default}\n`);
	}

	if (Object.prototype.hasOwnProperty.call(element, 'fixed')) {
		console.log(`Fixed value: ${element.fixed}\n`);
	}

	if (element.CodeList) {
		console.log(`${headline} Code Lists (allowed values)\n`);

		element.CodeList.forEach(cl => {
			console.log(`* ${cl}`);
		});

		console.log('\n');
	}

	if (element.rules) {
		console.log(`${headline} Business Rules\n`);
		element.rules.forEach(ruleId => {
			if (ruleId in rules) {
				const rule = rules[ruleId];
				console.log(
					`* ${ruleId}: ${rule.flag}: ${rule.text.replace(/\s\s+/g, ' ')}`,
				);
			}
		});

		console.log('\n');
	}

	if (element.children) {
		for (let i = 0; i < element.children.length; ++i) {
			path.push(element.Term);
			printElement(element.children[i], path);
			path.pop();
		}
	}
}

/**
 * Apply the necessary changes to the schema.
 */
function patchSchema(schema: JSONSchemaType<object>) {
	patchSchemaImpliedFields(schema);
	patchSchemaForDocumentTypeCodes(schema);
	patchSchemaForEAS(schema);
}

function patchSchemaImpliedFields(schema: JSONSchemaType<object>) {
	// The customization and profile ID can be deduced from the format.  We
	// make them therefore optional.
	schema.properties['ubl:Invoice'].required = schema.properties[
		'ubl:Invoice'
	].required.filter(
		(elem: string) =>
			elem !== 'cbc:CustomizationID' && elem !== 'cbc:ProfileID',
	);

	// We can also fill in the value NA for the order reference id.
	delete schema.properties['ubl:Invoice'].properties['cac:OrderReference']
		.required;
}

function patchSchemaForDocumentTypeCodes(schema: JSONSchemaType<object>) {
	// We support credit notes in the same way that CII does. You can freely
	// choose codes from both the invoice type code list and the credit note
	// code type list. If the invoice syntax is UBL, then the element names
	// are patched at runtime.
	const typeSchema =
		schema.properties['ubl:Invoice'].properties['cbc:InvoiceTypeCode'];
	const invListRef = typeSchema['$ref'];
	delete typeSchema['$ref'];
	const cnListRef = invListRef.replace(/-inv$/, '-cn');
	typeSchema.anyOf = [{ $ref: invListRef }, { $ref: cnListRef }];
}

function patchSchemaForEAS(schema: JSONSchemaType<object>) {
	// Some codes for XRechnung are missing in the UBL code list, see
	// https://github.com/gflohr/e-invoice-eu/issues/145.
	schema.$defs!.codeLists.eas.enum.push(
		'EM', // O.F.T.P. (ODETTE File Transfer Protocol)
		'AQ', // X.400 address for mail text'
		'AS', // AS2 exchange
		'AU', // File Transfer Protocol
		'EM', // Electronic mail | SMTP email
	);
}

/**
 * We treat attributes for an element `cxy:SomeElement` like regular elements
 * with a name `cxy:SomeElement@attributeName`.  However, because of the way
 * they are retrieved, they don't appear directly after their corresponding
 * attribute.  This is merely a cosmetic problem but we fix it by iterating
 * the intermediate tree and resorting the attributes.
 *
 * @param element the nested data structure
 */
function sortAttributes(element: { [key: string]: any }) {
	if (typeof element === 'object') {
		for (const key in element) {
			sortAttributes(element[key]);

			if (key === 'children') {
				const sorted = [];

				const attributes = element.children
					.filter((child: { Term: string | string[] }) =>
						child.Term.includes('@'),
					)
					.reduce(
						(acc: { [x: string]: any }, child: { Term: string | number }) => {
							acc[child.Term] = child;
							return acc;
						},
						{} as { [key: string]: any },
					);

				for (const child of element.children) {
					if (child.Term.includes('@')) {
						continue;
					}
					sorted.push(child);
					const prefix = child.Term + '@';
					for (const attribute in attributes) {
						if (attribute.startsWith(prefix)) {
							sorted.push(attributes[attribute]);
						}
					}
				}

				element.children = sorted;
			}
		}
	}
}

/**
 * Element attributes are either mandatory or optional.  But even a mandatory
 * attribute must be absent if the corresponding element is absent (because it
 * is optional itself).  Then the normal required logic for objects no longer
 * works.
 *
 * This function iterates over all optional object properties and formulates
 * corresponsing dependent schemas.
 *
 * Kudos for the implementation go to Jeremy Fiel for this answer on
 * stackoverflow: https://stackoverflow.com/a/79086490/5464233
 *
 * @param schema the schema to fix
 */
function fixupAttributes(node: { [key: string]: any }) {
	if (typeof node === 'object') {
		for (const key in node) {
			if (key === 'type' && node.type === 'object') {
				const attributes = Object.keys(node.properties).filter(prop =>
					prop.includes('@'),
				);
				const required: Array<string> = 'required' in node ? node.required : [];

				if (attributes.length) {
					node.dependentRequired = {};
					const mandatoryAttributes = required.filter(prop =>
						prop.includes('@'),
					);

					for (const attribute of mandatoryAttributes) {
						const elem = attribute.split('@')[0];
						node.dependentRequired[elem] ??= [];
						node.dependentRequired[elem].push(attribute);
					}

					for (const attribute of attributes) {
						const elem = attribute.split('@')[0];
						node.dependentRequired[attribute] = [elem];
					}

					if ('required' in node) {
						node.required = required.filter(prop => !prop.includes('@'));
					}
				}
			}

			fixupAttributes(node[key]);
		}
	}
}

function buildTree(element: any, parent: any = null): Element {
	const tree: Element = {} as Element;

	for (const node of element) {
		if (typeof node === 'object') {
			if ('Term' in node) {
				tree.Term = node.Term[0]['#text'];
			} else if ('Name' in node) {
				tree.Name = node.Name[0]['#text'];
			} else if ('Description' in node) {
				tree.Description = node.Description[0]['#text'];
			} else if ('DataType' in node) {
				tree.DataType = node.DataType[0]['#text'];
			} else if ('Reference' in node && ':@' in node) {
				const refType = node[':@']['@_type'];
				const value = node.Reference?.[0]?.['#text'];
				if ('CODE_LIST' === refType) {
					tree.CodeList ??= [];
					tree.CodeList.push(value);
				} else if ('RULE' === refType) {
					tree.rules ??= [];
					tree.rules.push(value);
				} else if ('BUSINESS_TERM' === refType) {
					tree.BusinessTerms ??= [];
					tree.BusinessTerms.push(...value.split(/[ \t]*,[ \t]*/));
				} else if (typeof refType !== 'undefined') {
					console.error(`Unknown reference type ${refType}`);
				}
			} else if ('Attribute' in node) {
				const attribute = buildTree(node.Attribute);
				attribute.Term = `${tree.Term}@${attribute.Term}`;
				parent.children.push(attribute);
				if (
					':@' in node &&
					'@_usage' in node[':@'] &&
					node[':@']['@_usage'] === 'Optional'
				) {
					attribute.cardinality = '0..1';
				}
			} else if ('Value' in node) {
				const valueType = node[':@']['@_type'];
				const value = node.Value?.[0]?.['#text'];

				if (valueType === 'EXAMPLE') {
					tree.example = value;
				} else if (valueType === 'DEFAULT') {
					tree.default = value;
				} else if (valueType === 'FIXED') {
					tree.fixed = value;
				} else if (typeof valueType !== 'undefined') {
					console.error(`Unknown value type ${valueType}`);
				}
			} else if ('Element' in node) {
				tree.children ??= [];
				const newElement = buildTree(node.Element, tree);
				tree.children.push(newElement);
				if (':@' in node && '@_cardinality' in node[':@']) {
					let cardinality = node[':@']['@_cardinality'];
					if (
						newElement.Term === 'cbc:Note' &&
						tree.Term === 'ubl:Invoice' &&
						cardinality === '0..1'
					) {
						// Top-level cbc:Note is unbounded, see
						// https://github.com/gflohr/e-invoice-eu/issues/252.
						cardinality = '0..n';
					}
					newElement.cardinality = cardinality;
				}
			}
		}
	}

	return tree;
}

function buildSchema(tree: Element): JSONSchemaType<object> {
	const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

	const result = {
		$schema: 'https://json-schema.org/draft/2019-09/schema',
		$id: `https://www.cantanea.com/schemas/ubl-invoice-schema-v${pkg.version}`,
		type: 'object',
		additionalProperties: false,
		properties: {},
		required: [],
		$defs,
	};

	(result.properties as { [key: string]: any })[tree.Term] = processNode(tree);

	if (parseCardinality(tree.cardinality).min === 1) {
		(result.required as unknown as string[]).push(tree.Term);
	}

	return result as unknown as JSONSchemaType<object>;
}

function processNode(node: Element): JSONSchemaType<object> {
	const { cardinality, children } = node;
	const { min, max } = parseCardinality(cardinality);
	const common: { [key: string]: string } = {};

	if ('Name' in node) {
		common.title = (node.Name as string).replace(/[ \t\n]+/g, ' ');
	}
	if ('Description' in node) {
		common.description = (node.Description as string).replace(/[ \t\n]+/g, ' ');
	}

	if ('BusinessTerms' in node) {
		common.description += '\nBusiness terms: ' + node.BusinessTerms?.join(', ');
	}

	let schema: JSONSchemaType<any>;

	if (node.CodeList) {
		if (node.CodeList.length > 1) {
			schema = {
				type: 'string',
				oneOf: [],
				...common,
			};
			for (const ref of node.CodeList) {
				(schema.oneOf as Array<object>).push({
					$ref: `#/$defs/codeLists/${ref}`,
				});
			}
		} else {
			schema = {
				type: 'string',
				$ref: `#/$defs/codeLists/${node.CodeList[0]}`,
				...common,
			};
		}
	} else if (node.DataType && node.DataType in $defs.dataTypes) {
		schema = {
			$ref: `#/$defs/dataTypes/${node.DataType}`,
			...common,
		} as JSONSchemaType<any>;
	} else {
		schema = { type: 'string', ...common };
	}

	// If the node has children, it's an object with properties
	if (children && children.length > 0) {
		const properties: { [key: string]: JSONSchemaType<object> } = {};
		const required: Array<string> = [];

		children.forEach(child => {
			properties[child.Term] = processNode(child);
			if (parseCardinality(child.cardinality).min === 1) {
				required.push(child.Term);
			}
		});

		schema = {
			type: 'object',
			additionalProperties: false,
			...common,
			properties,
		} as JSONSchemaType<any>;

		if (required.length) {
			schema.required = required;
		}
	}

	// If it's an array (max > 1 or max is infinite), modify the schema
	// accordingly.
	if (max > 1 || max === Infinity) {
		schema = {
			type: 'array',
			items: schema,
		};
		if (min > 0) {
			schema.minItems = min;
		}
		if (max !== Infinity) {
			schema.maxItems = max;
		}
	}

	return schema as JSONSchemaType<object>;
}

function readXml(parser: XMLParser, filename: string): any {
	const xml = fs.readFileSync(filename);
	const document = parser.parse(xml);
	if (typeof document[0] === 'object' && '?xml' in document[0]) {
		document.shift();
	}
	const data = resolveStructure(parser, document);

	return data;
}

function resolveStructure(parser: XMLParser, data: any): any {
	if (typeof data === 'object') {
		for (const key in data) {
			const child = data[key];
			if (
				Array.isArray(data) &&
				typeof child === 'object' &&
				'Include' in child
			) {
				const filename = child.Include[0]['#text'];
				const document = readXml(parser, `${basedir}/${filename}`);
				const data = resolveStructure(parser, document);
				child.Element = data[0].Element;
				if (data[0][':@']) {
					child[':@'] = data[0][':@'];
				}
				delete child.Include;
			}

			resolveStructure(parser, data[key]);
		}
	}

	return data;
}

function parseCardinality(cardinality: string | undefined): Cardinality {
	if (typeof cardinality === 'undefined') return { min: 1, max: 1 };

	const [min, max] = cardinality
		.split('..')
		.map(c => (c === 'n' ? Infinity : parseInt(c, 10)));

	return { min, max };
}

function loadCodeLists(dir: string) {
	const pattern = new RegExp('.+\.xml$');
	const filenames = fs
		.readdirSync(dir)
		.filter(filename => pattern.test(filename))
		.filter(filename => !filename.match(/\/UNCL1001-(?:cn|inv)\.xml$/))
		.map(filename => path.join(dir, filename));
	const codeListParser = new XMLParser({
		parseTagValue: false,
		parseAttributeValue: false,
	});

	for (const filename of filenames) {
		loadCodeList(codeListParser, filename);
	}

	loadUNCL1001();
}

function loadUNCL1001() {
	const filename = path.resolve(
		__dirname,
		'../../../contrib/code-lists/UNTDID1001.csv',
	);

	const workbook = XLSX.read(fs.readFileSync(filename), {
		type: 'buffer',
		cellDates: true,
	});
	const rows = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1, {
		defval: null,
	});

	codeListValues['UNCL1001-inv'] = [];
	codeListValues['UNCL1001-cn'] = [];

	type Row = {
		Code: number;
		Name: string;
		'EN16931 interpretation': 'Invoice' | 'Credit Note';
	};

	for (const row of rows as Row[]) {
		const value: CodeListValue = {
			Id: row.Code.toString(),
			Name: row.Name,
		};

		if (row['EN16931 interpretation'] === 'Credit Note') {
			codeListValues['UNCL1001-cn'].push(value);
		} else if (row['EN16931 interpretation'] === 'Invoice') {
			codeListValues['UNCL1001-inv'].push(value);
		} else {
			throw new Error(`Unknown EN16931 interpretation: ${row['EN16931 interpretation']}`);
		}
	}

	const invCodes: string[] = [];
	for (const elem of codeListValues['UNCL1001-inv']) {
		invCodes.push(elem.Id.toString());
	}
	$defs.codeLists['UNCL1001-inv'] = { enum: invCodes };

	const cnCodes: string[] = [];
	for (const elem of codeListValues['UNCL1001-cn']) {
		cnCodes.push(elem.Id.toString());
	}
	$defs.codeLists['UNCL1001-cn'] = { enum: cnCodes };
}

function loadCodeList(parser: XMLParser, filename: string) {
	const data = readXml(parser, filename);
	const id = data.CodeList.Identifier;
	let codeElements: Array<CodeListValue> = data.CodeList.Code;
	if (!Array.isArray(codeElements)) {
		codeElements = [codeElements];
	}

	codeListValues[id] = codeElements;

	const codes: string[] = [];
	for (const elem of codeElements) {
		codes.push(elem.Id.toString());
	}

	$defs.codeLists[id] = { enum: codes };
}

function loadRules(dir: string) {
	const pattern = new RegExp('.+-UBL\.sch$');
	const filenames = fs
		.readdirSync(dir)
		.filter(filename => pattern.test(filename))
		.map(filename => path.join(dir, filename));

	for (const filename of filenames) {
		loadRule(parser, filename);
	}
}

function toArray<T>(maybeArray: T | T[] | undefined): T[] {
	if (!maybeArray) return [];

	return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
}

function loadRule(parser: XMLParser, filename: string) {
	const xml = fs.readFileSync(filename, 'utf8');
	const document = parser.parse(xml);

	document.forEach(node => {
		if ('schema' in node) {
			const schema = toArray(node.schema);
			const patternNodes = schema.filter(node => 'pattern' in node);
			patternNodes.forEach(patternNode => {
				const ruleNodes = toArray(patternNode.pattern).filter(
					node => 'rule' in node,
				);

				ruleNodes.forEach(ruleNode => {
					const assertNodes = toArray(ruleNode.rule).filter(
						node => 'assert' in node,
					);

					assertNodes.forEach((assertNode: AssertNode) => {
						const id = assertNode[':@']['@_id'];
						let text = assertNode.assert[0]['#text'];
						const prefixes = [`[${id}]-`, `[${id}] `];

						for (const prefix of prefixes) {
							if (text.startsWith(prefix)) {
								text = text.substring(prefix.length);
								break;
							}
						}

						rules[id] = {
							flag: assertNode[':@']['@_flag'],
							text,
						};
					});
				});
			});
		}
	});
}
