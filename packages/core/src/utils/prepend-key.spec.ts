import { describe, expect, it } from 'vitest';
import { prependKey } from './prepend-key';

describe('Object key prepending in-place', () => {
	it('should prepend the key', () => {
		const obj = {
			parent: {
				foo: {},
				bar: {},
				baz: {},
			},
		};
		prependKey(obj.parent, 'first', { some: 'value' });
		expect(obj).toStrictEqual({
			parent: {
				first: { some: 'value' },
				foo: {},
				bar: {},
				baz: {},
			},
		});
	});

	it('should discarding an existing entry for the key', () => {
		const obj = {
			parent: {
				foo: {},
				bar: {},
				first: 'prune me!',
				baz: {},
			},
		};
		prependKey(obj.parent, 'first', { some: 'value' });
		expect(obj).toStrictEqual({
			parent: {
				first: { some: 'value' },
				foo: {},
				bar: {},
				baz: {},
			},
		});
	});
});
