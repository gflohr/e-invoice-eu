import { describe, expect, it } from 'vitest';
import { renameKey } from './rename-key';

describe('Object key renaming in-place', () => {
	it('should keep the object order', () => {
		const obj = {
			parent: {
				leftSibling: {},
				changeMe: {
					foo: 1,
					bar: 2,
					baz: 3,
				},
				rightSibling: {},
			},
		};
		renameKey(obj.parent.changeMe, 'bar', 'barbar');
		expect(obj).toStrictEqual({
			parent: {
				leftSibling: {},
				changeMe: {
					foo: 1,
					barbar: 2,
					baz: 3,
				},
				rightSibling: {},
			},
		});
	});
});
