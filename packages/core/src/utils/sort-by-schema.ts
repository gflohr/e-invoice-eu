import { JSONSchemaType } from 'ajv';
import { ExpandObject } from 'xmlbuilder2/lib/interfaces';

export function sortBySchema<T>(data: T, schema: JSONSchemaType<T>): T {
	if (typeof data !== 'object' || data === null) {
		throw new Error('Data must be a non-null object.');
	}

	if (typeof schema !== 'object' || schema === null) {
		throw new Error('Schema must be a valid JSON schema.');
	}

	const sortObject = (
		obj: ExpandObject,
		schemaProps: ExpandObject,
	): ExpandObject => {
		const sorted: ExpandObject = {};
		for (const key of Object.keys(schemaProps)) {
			if (key in obj) {
				if (
					schemaProps[key]?.type === 'object' &&
					schemaProps[key]?.properties
				) {
					sorted[key] = sortObject(
						obj[key],
						schemaProps[key].properties,
					);
				} else if (
					schemaProps[key]?.type === 'array' &&
					Array.isArray(obj[key])
				) {
					const itemSchema = schemaProps[key].items;
					if (
						itemSchema?.type === 'object' &&
						itemSchema?.properties
					) {
						sorted[key] = obj[key].map((item: ExpandObject) =>
							sortObject(item, itemSchema.properties),
						);
					} else {
						sorted[key] = obj[key];
					}
				} else {
					sorted[key] = obj[key];
				}
			}
		}
		return sorted;
	};

	return sortObject(data, schema.properties || {}) as T;
}
