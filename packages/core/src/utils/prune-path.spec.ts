import { describe, expect, it } from 'vitest';
import { prunePath } from './prune-path';

describe('Recursive object clean-up', () => {
	it('should clean-up recursively', () => {
		const obj = {
			level0: {
				level1: {
					array1: [
						{
							level2: {
								leaf: {},
							},
						}
					],
				},
				other: 'exists',
			},
		};
		prunePath(obj, '$.level0.level1.array1[0].level2.leaf');
		expect(obj).toStrictEqual({level0: { other: 'exists' }});
	});

	it('should clean-up recursively and stop at the root without crashing', () => {
		const obj = {
			level0: {
				level1: {
					array1: [
						{
							level2: {
								leaf: {},
							},
						}
					],
				},
			},
		};
		prunePath(obj, '$.level0.level1.array1[0].level2.leaf');
		expect(obj).toStrictEqual({});
	});
});
