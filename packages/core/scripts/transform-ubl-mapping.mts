#! /usr/bin/env node

import { JSONSchemaType } from 'ajv';
import * as fs from 'fs';
import yaml from 'js-yaml';

import { Invoice } from '../src/invoice/invoice.interface';
import {
	mappingValuePattern,
	sectionReferencePattern,
} from '../src/mapping/mapping.regex';

if (process.argv.length !== 4) {
	console.error(`Usage: ${process.argv[1]} INVOICE_SCHEMA MAPPING_SCHEMA`);
	process.exit(1);
}

const invoiceSchemaFilename = process.argv[2];
const mappingSchemaFilename = process.argv[3];

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

const invoiceSchemaYaml = fs.readFileSync(invoiceSchemaFilename, 'utf-8');
const invoiceSchema = yaml.load(invoiceSchemaYaml, {
	filename: invoiceSchemaFilename,
}) as JSONSchemaType<Invoice>;
transformSchema(invoiceSchema as JSONSchemaType<any>);

const mappingSchema = {
	$schema: 'https://json-schema.org/draft/2019-09/schema',
	$id: `https://www.cantanea.com/schemas/ubl-invoice-schema-v${pkg.version}`,
	type: 'object',
	title: 'Mapping',
	description: 'Maps invoice data to the cells in a spreadsheet.',
	properties: {
		meta: {
			type: 'object',
			additionalProperties: false,
			title: 'Mapping Meta Information',
			description: 'Auxiliary information for the mapping data.',
			properties: {
				sectionColumn: {
					type: 'object',
					additionalProperties: {
						type: 'string',
						pattern: '^[A-Z]+$',
					},
				},
				empty: {
					type: 'array',
					items: {
						type: 'string',
						minLength: 1,
					},
				},
				version: {
					type: 'string',
					default: '1.0',
					pattern: '^(?:0|[1-9][0-9]*)(?:\.(?:0|[1-9][0-9]*))$',
					description: 'Version of the mapping schema as a string "MAJOR.MINOR" or "MAJOR".',
				},
			},
			required: ['sectionColumn'],
		},
		'ubl:Invoice': invoiceSchema.properties['ubl:Invoice'],
	},
	required: ['meta', 'ubl:Invoice'],
	$defs: {
		valueRef: {
			type: 'string',
			pattern: mappingValuePattern,
		},
		sectionRef: {
			type: 'string',
			pattern: sectionReferencePattern,
		},
	},
};

fs.writeFileSync(
	mappingSchemaFilename,
	JSON.stringify(mappingSchema, null, '\t'),
);

function transformSchema(schema: JSONSchemaType<any>): void {
	// Transform properties if they exist
	if (schema.properties) {
		for (const [key, value] of Object.entries(schema.properties)) {
			// Recursively transform nested schemas
			transformSchema(value as JSONSchemaType<any>);

			const valueObject = value as Record<string, any>;

			// Update type and references
			if (valueObject.type === 'string' || valueObject.$ref) {
				const defaultValue = schema.properties[key].default;
				schema.properties[key] = { $ref: '#/$defs/valueRef' };
				if (typeof defaultValue !== 'undefined') {
					schema.properties[key].default = defaultValue;
				}
			} else if (valueObject.type === 'array') {
				// Convert array to object
				const newObject: Record<string, JSONSchemaType<object>> = {
					type: 'object',
					additionalProperties: false,
					properties: {},
				} as JSONSchemaType<object>;

				if (valueObject.items) {
					transformSchema(valueObject.items);
					newObject.properties = {
						section: { $ref: '#/$defs/sectionRef' },
						...valueObject.items.properties,
					};
					newObject.required = [] as unknown as JSONSchemaType<object>;
					if (valueObject.items.required) {
						newObject.required.push(...valueObject.items.required);
					}
					if (valueObject.items.dependentRequired) {
						newObject.dependentRequired = valueObject.items.dependentRequired;
					}
					delete valueObject.items;
				}
				schema.properties[key] = newObject;
			}
		}
	}
}
