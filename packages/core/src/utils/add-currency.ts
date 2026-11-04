/**
 * Adds two currency amounts as strings. The returned sum has the same accuracy
 * as the most accurate summand.
 *
 * @param s1 the first summand
 * @param s2 the second summand
 * @returns the sum
 */
export function addCurrency(s1: string, s2: string): string {
	const getDecimals = (s: string) =>
		s.includes('.') ? s.split('.')[1].length : 0;
	const maxDecimals = Math.max(getDecimals(s1), getDecimals(s2));

	const parseScaled = (s: string, decimals: number): bigint => {
		const clean = s.startsWith('+') ? s.slice(1) : s;
		const [intPart = '0', decPart = ''] = clean.split('.');
		const paddedDec = decPart.padEnd(decimals, '0').slice(0, decimals);

		const isNegative = clean.startsWith('-');
		const absInt = intPart.startsWith('-') ? intPart.slice(1) : intPart;

		const fullStr = (absInt === '' ? '0' : absInt) + paddedDec;
		const val = BigInt(fullStr);
		return isNegative ? -val : val;
	};

	const v1 = parseScaled(s1, maxDecimals);
	const v2 = parseScaled(s2, maxDecimals);
	const sum = v1 + v2;

	if (maxDecimals === 0) {
		return sum.toString();
	}

	const isNegative = sum < 0;
	const absSumStr = (isNegative ? -sum : sum)
		.toString()
		.padStart(maxDecimals + 1, '0');

	const intResult = absSumStr.slice(0, absSumStr.length - maxDecimals);
	const decResult = absSumStr.slice(absSumStr.length - maxDecimals);

	return `${isNegative ? '-' : ''}${intResult}.${decResult}`;
}
