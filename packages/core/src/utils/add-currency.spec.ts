import { describe, expect, it } from 'vitest';
import { addCurrency } from './add-currency.js';

describe('Adding currency amounts', () => {
	it('should add integers', () => {
		expect(addCurrency('1', '23')).toBe('24');
	});

	it('should add negative integers', () => {
		expect(addCurrency('1', '-23')).toBe('-22');
	});

	it('should add floating point numbers', () => {
		expect(addCurrency('3.14', '2.72')).toBe('5.86');
	});

	it('should preserve the highest accuracy', () => {
		expect(addCurrency('3.14', '2.7200')).toBe('5.8600');
	});

	it('should handle overflow', () => {
		expect(addCurrency('3.95', '2.05')).toBe('6.00');
	});

	it('should honour the sign of the left summand', () => {
		expect(addCurrency('-3.14', '2.72')).toBe('-0.42');
	});

	it('should honour the sign of the right summand', () => {
		expect(addCurrency('3.14', '-2.72')).toBe('0.42');
	});

	it('should honour the sign of both summands', () => {
		expect(addCurrency('-3.14', '-2.72')).toBe('-5.86');
	});

	it('should handle overflow, signs, and accuracy differences', () => {
		expect(addCurrency('-3.95', '-2.72000000')).toBe('-6.67000000');
	});

	it('should ignore plus signs', () => {
		expect(addCurrency('+3.14', '+2.72')).toBe('5.86');
	});

	it('should allow numbers without a integer part', () => {
		expect(addCurrency('.14', '.72')).toBe('0.86');
	});
});
