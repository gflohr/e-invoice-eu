import { ExpandObject } from 'xmlbuilder2/lib/interfaces';

/**
 * Overwrite a node if not existing, recursively creating all intermediate
 * nodes.
 *
 * @param dest the object to clean
 * @param path the path to the leaf
 * @param value the value to overwrite
 */
export function vivifyPath(
	dest: ExpandObject,
	path: string,
	value: string | ExpandObject,
) {
	const indices = path.replace(/\[([0-9]+)\]/g, '.$1').split('.');

	if (indices[0] === '$') {
		indices.shift();
	}

	for (let i = 0; i < indices.length - 1; ++i) {
		const key = indices[i];
		const nextIndex = indices[i + 1];

		const isNextArrayIndex = nextIndex.match(/^[0-9]+$/);

		if (isNextArrayIndex) {
			dest[key] ??= [];
		} else {
			dest[key] ??= {};
		}

		dest = dest[key] as ExpandObject;
	}

	dest[indices[indices.length - 1]] ??= value;
}
