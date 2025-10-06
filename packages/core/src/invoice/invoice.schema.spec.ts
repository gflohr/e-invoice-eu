import { invoiceSchema } from "./invoice.schema";

describe('schema bugs', () => {
	it('should preserve leading zeroes in EAS codes', () => {
		expect(invoiceSchema?.$defs?.codeLists.eas.enum.includes('0002')).toBeTruthy();
		expect(invoiceSchema?.$defs?.codeLists.eas.enum.includes('2')).toBeFalsy();
	});
});
