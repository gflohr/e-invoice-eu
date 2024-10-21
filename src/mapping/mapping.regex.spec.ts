import { mappingValueRe, sectionReferenceRe } from './mapping.regex';

describe('Mapping value pattern', () => {
	it('should match a literal string', () => {
		const mappingValue = 'Springfield';
		const matches = mappingValue.match(mappingValueRe);
		expect(matches).not.toBeNull();
		if (matches !== null) {
			expect(matches[4]).toBe(mappingValue);
		}
	});

	it('should match a quoted literal string', () => {
		const mappingValue = "'=Homer.Simpson@compu-global-hyper-mega-net.biz";
		const matches = mappingValue.match(mappingValueRe);
		expect(matches).not.toBeNull();
		if (matches !== null) {
			expect(matches[4]).toBe(mappingValue);
		}
	});

	it('should match a simple cell reference', () => {
		const mappingValue = '=ET742';
		const matches = mappingValue.match(mappingValueRe);
		expect(matches).not.toBeNull();
		if (matches !== null) {
			expect(matches[1]).toBeUndefined();
			expect(matches[2]).toBeUndefined();
			expect(matches[3]).toBe('ET742');
		}
	});

	it('should match a cell reference with a section reference', () => {
		const mappingValue = '=:Line.ET742';
		const matches = mappingValue.match(mappingValueRe);
		expect(matches).not.toBeNull();
		if (matches !== null) {
			expect(matches[1]).toBeUndefined();
			expect(matches[2]).toBe('Line');
			expect(matches[3]).toBe('ET742');
		}
	});

	it('should match a fully-qualified cell reference', () => {
		const mappingValue = '=Invoice:Line.ET742';
		const matches = mappingValue.match(mappingValueRe);
		expect(matches).not.toBeNull();
		if (matches !== null) {
			expect(matches[1]).toBe('Invoice');
			expect(matches[2]).toBe('Line');
			expect(matches[3]).toBe('ET742');
		}
	});

	it('should match a cell reference without section', () => {
		const mappingValue = '=Invoice.ET742';
		const matches = mappingValue.match(mappingValueRe);
		expect(matches).not.toBeNull();
		if (matches !== null) {
			expect(matches[1]).toBe('Invoice');
			expect(matches[2]).toBeUndefined();
			expect(matches[3]).toBe('ET742');
		}
	});

	it('should match quoted sheet references', () => {
		const mappingValue = "='Proforma Invoice':Line.ET742";
		const matches = mappingValue.match(mappingValueRe);
		expect(matches).not.toBeNull();
		if (matches !== null) {
			expect(matches[1]).toBe("'Proforma Invoice'");
			expect(matches[2]).toBe('Line');
			expect(matches[3]).toBe('ET742');
		}
	});
});

describe('Section reference pattern', () => {
	it('should match a lone section reference', () => {
		const sheetReference = ':Line';
		const matches = sheetReference.match(sectionReferenceRe);
		expect(matches).not.toBeNull();
		if (matches !== null) {
			expect(matches[1]).not.toBeDefined();
			expect(matches[2]).toBe('Line');
		}
	});

	it('should match a fully-qualified sheet reference', () => {
		const sheetReference = 'Invoice:Line';
		const matches = sheetReference.match(sectionReferenceRe);
		expect(matches).not.toBeNull();
		if (matches !== null) {
			expect(matches[1]).toBe('Invoice');
			expect(matches[2]).toBe('Line');
		}
	});

	it('should match a quoted sheet name', () => {
		const sheetReference = "'Pro-forma Invoice':Line";
		const matches = sheetReference.match(sectionReferenceRe);
		expect(matches).not.toBeNull();
		if (matches !== null) {
			expect(matches[1]).toBe("'Pro-forma Invoice'");
			expect(matches[2]).toBe('Line');
		}
	});
});
