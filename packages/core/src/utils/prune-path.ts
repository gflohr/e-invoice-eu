import { ExpandObject } from 'xmlbuilder2/lib/interfaces';

/**
 * Clean-up an object recursively. Walks up the path, and deletes all empty
 * nodes.
 *
 * @param dest the object to clean
 * @param path the path to the leaf
 */
export function prunePath(dest: ExpandObject, path: string): void {
	const indices = path.replace(/\[([0-9]+)\]/g, '.$1').split('.');

	if (indices[0] === '$') {
		indices.shift();
	}

	let current: ExpandObject = dest;
	const stack: { parent: ExpandObject; key: string }[] = [];

	// 1. Walk down the path to collect parent-key references.
	for (const key of indices) {
		if (
			current === null ||
			typeof current !== 'object' ||
			!(key in current)
		) {
			break;
		}
		stack.push({ parent: current, key });
		current = current[key];
	}

	// 2. Walk back up from leaf to root.
	while (stack.length > 0) {
		const { parent, key } = stack.pop()!;
		const val = parent[key];

		if (isEmpty(val)) {
			if (Array.isArray(parent)) {
				parent.splice(Number(key), 1);
			} else {
				delete parent[key];
			}
		} else {
			// Stop early if we hit a node that contains other data.
			break;
		}
	}
}

function isEmpty(val: unknown): boolean {
	if (val === null || typeof val !== 'object') {
		return false;
	}
	if (Array.isArray(val)) {
		return val.length === 0;
	}
	return Object.keys(val).length === 0;
}
