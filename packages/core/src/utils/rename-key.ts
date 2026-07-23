export function renameKey(
	obj: Record<string, unknown>,
	oldKey: string,
	newKey: string,
): void {
	const entries = Object.keys(obj).map(key => [
		key === oldKey ? newKey : key,
		obj[key],
	]);

	for (const key of Object.keys(obj)) {
		delete obj[key];
	}

	for (const [key, value] of entries) {
		obj[key as keyof typeof obj] = value;
	}
}
