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
		landroom: string;
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
				landroom: { type: 'string' },
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
		landroom: 'white',
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
		landroom: 'white',
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
	it('Should sort an object by a JSON schema', () => {
		const sortedHouse = sortBySchema(unsortedHouse, houseSchema);

		expect(sortedHouse).toEqual(wantedHouse);
	});
});
