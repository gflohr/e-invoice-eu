import { JSONSchemaType } from 'ajv';

import { sortBySchema } from './sort-by-schema';

type Bedroom = {
	owner: string;
	size: number;
	colour: string;
};

type House = {
	basement: {
		workshop: string;
		laundry: string;
	};
	groundFloor: {
		kitchen: string;
		loungeRoom: string;
		bedrooms: Bedroom[];
	};
	attic: {
		secretLab: {
			size: number;
			colour: string;
		};
		diyNuclearPowerPlant?: {
			size: number;
			colour: string;
		};
		prankHideout: {
			size: number;
			colour: string;
		};
	};
};

const houseSchema: JSONSchemaType<House> = {
	type: 'object',
	additionalProperties: false,
	required: [],
	properties: {
		basement: {
			type: 'object',
			additionalProperties: false,
			required: [],
			properties: {
				workshop: { type: 'string' },
				laundry: { type: 'string' },
			},
		},
		groundFloor: {
			type: 'object',
			additionalProperties: false,
			required: [],
			nullable: false,
			properties: {
				kitchen: { type: 'string' },
				loungeRoom: { type: 'string' },
				bedrooms: {
					type: 'array',
					nullable: false,
					items: {
						type: 'object',
						additionalProperties: false,
						required: [],
						properties: {
							owner: { type: 'string' },
							size: { type: 'number' },
							colour: { type: 'string' },
						},
					},
				},
			},
		},
		attic: {
			type: 'object',
			additionalProperties: false,
			required: [],
			nullable: false,
			properties: {
				secretLab: {
					type: 'object',
					additionalProperties: false,
					required: [],
					nullable: false,
					properties: {
						size: { type: 'number' },
						colour: { type: 'string' },
					},
				},
				diyNuclearPowerPlant: {
					type: 'object',
					additionalProperties: false,
					required: [],
					nullable: true,
					properties: {
						size: { type: 'number' },
						colour: { type: 'string' },
					},
				},
				prankHideout: {
					type: 'object',
					additionalProperties: false,
					required: [],
					nullable: false,
					properties: {
						size: { type: 'number' },
						colour: { type: 'string' },
					},
				},
			},
		},
	},
};

const wantedHouse: House = {
	basement: {
		workshop: 'brown',
		laundry: 'green',
	},
	groundFloor: {
		kitchen: 'yellow',
		loungeRoom: 'white',
		bedrooms: [
			{
				colour: 'blue',
				owner: 'parents',
				size: 12,
			},
			{
				colour: 'yellow',
				owner: 'bart',
				size: 10,
			},
			{
				size: 10,
				colour: 'orange',
				owner: 'lisa',
			},
			{
				size: 10,
				owner: 'maggie',
				colour: 'red',
			},
		],
	},
	attic: {
		secretLab: {
			size: 25,
			colour: 'purple',
		},
		// The diyNuclearPowerPlant is missing on purpose!
		prankHideout: {
			colour: 'black',
			size: 8,
		},
	},
};

const unsortedHouse: House = {
	groundFloor: {
		bedrooms: [
			{
				owner: 'parents',
				size: 12,
				colour: 'blue',
			},
			{
				owner: 'bart',
				size: 10,
				colour: 'yellow',
			},
			{
				owner: 'lisa',
				size: 10,
				colour: 'orange',
			},
			{
				owner: 'maggie',
				size: 10,
				colour: 'red',
			},
		],
		loungeRoom: 'white',
		kitchen: 'yellow',
	},
	basement: {
		workshop: 'brown',
		laundry: 'green',
	},
	attic: {
		prankHideout: {
			size: 8,
			colour: 'black',
		},
		secretLab: {
			size: 25,
			colour: 'purple',
		},
	},
};

describe('Sort by schema', () => {
	it('should sort an object by a JSON schema', () => {
		const sortedHouse = sortBySchema(unsortedHouse, houseSchema);

		expect(sortedHouse).toEqual(wantedHouse);
	});

	it('should throw an exception if the object is not valid', () => {
		expect(() => sortBySchema('house' as unknown as House, houseSchema)).toThrow(
			'Data must be a non-null object.',
		);
	});

	it('should throw an exception if the object is null', () => {
		expect(() => sortBySchema(null as unknown as House, houseSchema)).toThrow(
			'Data must be a non-null object.',
		);
	});

	it('should throw an exception if the schema is not valid', () => {
		expect(() => sortBySchema(unsortedHouse, 'schema' as unknown as JSONSchemaType<House>)).toThrow(
			'Schema must be a valid JSON schema.',
		);
	});

	it('should throw an exception if the schema is null', () => {
		expect(() => sortBySchema(unsortedHouse, null as unknown as JSONSchemaType<House>)).toThrow(
			'Schema must be a valid JSON schema.',
		);
	});

	it('should assign arrays of primitives directly when item schema is not an object with properties', () => {
		const data = {
			tags: ['factur-x', 'ubl', 'zugferd'],
		};

		const schema: JSONSchemaType<{ tags: string[] }> = {
			type: 'object',
			properties: {
				tags: {
					type: 'array',
					items: { type: 'string' }, // Not an object → triggers else branch
				},
			},
			required: ['tags'],
			additionalProperties: false,
		};

		const result = sortBySchema(data, schema);
		expect(result).toEqual({
			tags: ['factur-x', 'ubl', 'zugferd'],
		});
	});

	// This behaviour is actually not really what we want but it does not
	// happen for our use case.
	it('should discard unknown properties', () => {
		const data = { z: 1, y: 2, x: 3, w: 4, v: 5, u: 6, t: 7, s: 8, r: 9 };
		const schema: JSONSchemaType<object> = {
			type: 'object',
			additionalProperties: true,
		};

		expect(sortBySchema(data, schema)).toEqual({});
	});
});
