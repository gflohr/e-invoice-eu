/**
 * @internal
 *
 * Inserts an object property at the first position.
 *
 * If the key already exists, at first position, it is overwritten.
 *
 * @param obj the object to manipulate
 * @param firstKey the key to insert at first position
 * @param firstValue the corresponding value
 */
export function prependKey(
	obj: Record<string, unknown>,
	firstKey: string,
	firstValue: unknown,
): void {
	// If it is already the first key, update in place.
	if (Object.keys(obj)[0] === firstKey) {
		obj[firstKey] = firstValue;
		return;
	}

	const entries = Object.entries(obj);

	for (const key of Object.keys(obj)) {
		delete obj[key];
	}

	obj[firstKey] = firstValue;

	for (const [key, value] of entries) {
		obj[key as keyof typeof obj] = value;
	}
}
