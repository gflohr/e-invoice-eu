import { describe, expect, it } from 'vitest';
import { vivifyPath } from './vivify-path';

describe('Vivify Paths', () => {
	it('should create all missing paths', () => {
		const obj = {};
		vivifyPath(obj, '$.level0.level1.array1[0].level2.leaf', 'new value');
		expect(obj).toStrictEqual({
			level0: {
				level1: {
					array1: [
						{
							level2: {
								leaf: 'new value',
							},
						},
					],
				},
			},
		});
	});

	it('should not overwrite existing values', () => {
		const obj = {
			level0: {
				level1: {
					array1: [
						{
							level2: {
								leaf: 'old value',
							},
						},
					],
				},
			},
		};
		vivifyPath(obj, '$.level0.level1.array1[0].level2.leaf', 'new value');
		expect(obj).toStrictEqual({
			level0: {
				level1: {
					array1: [
						{
							level2: {
								leaf: 'old value',
							},
						},
					],
				},
			},
		});
	});

	it('should create missing array elements', () => {
		const obj = {
			array: ['foobar'],
		};
		vivifyPath(obj, '$.array[2]', 'gotcha');
		expect(obj).toStrictEqual({
			array: ['foobar', /* empty */ , 'gotcha'],
		});
	});
});
