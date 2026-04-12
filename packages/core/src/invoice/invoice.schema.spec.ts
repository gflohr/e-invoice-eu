import { describe, expect, it } from 'vitest';

import { invoiceSchema } from './invoice.schema';

describe('schema bugs', () => {
	it('should preserve leading zeroes in EAS codes', () => {
		expect(
			invoiceSchema?.$defs?.codeLists.eas.enum.includes('0002'),
		).toBeTruthy();
		expect(
			invoiceSchema?.$defs?.codeLists.eas.enum.includes('2'),
		).toBeFalsy();
	});
});

describe('unit price amount type (EN 16931 §6.5.3)', () => {
	const priceProps =
		invoiceSchema?.properties?.['ubl:Invoice']?.properties?.[
			'cac:InvoiceLine'
		]?.items?.properties?.['cac:Price']?.properties;
	const acProps = priceProps?.['cac:AllowanceCharge']?.properties;

	it('should define UnitPriceAmount data type with unlimited decimals', () => {
		const dt = invoiceSchema?.$defs?.dataTypes?.UnitPriceAmount;
		expect(dt).toBeDefined();
		expect(dt.pattern).toContain('[0-9]+');
		// Must not have a max decimal constraint like {1,2}
		expect(dt.pattern).not.toContain('{1,');
	});

	it('should use UnitPriceAmount for item net price (BT-146)', () => {
		expect(priceProps?.['cbc:PriceAmount']?.$ref).toBe(
			'#/$defs/dataTypes/UnitPriceAmount',
		);
	});

	it('should use UnitPriceAmount for item price discount (BT-147)', () => {
		expect(acProps?.['cbc:Amount']?.$ref).toBe(
			'#/$defs/dataTypes/UnitPriceAmount',
		);
	});

	it('should use UnitPriceAmount for item gross price (BT-148)', () => {
		expect(acProps?.['cbc:BaseAmount']?.$ref).toBe(
			'#/$defs/dataTypes/UnitPriceAmount',
		);
	});

	it('should keep Amount type restricted to 2 decimal places', () => {
		const dt = invoiceSchema?.$defs?.dataTypes?.Amount;
		expect(dt).toBeDefined();
		expect(dt.pattern).toContain('{1,2}');
	});
});
