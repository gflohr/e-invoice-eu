// A sheet Ref is anything inside single quotes or a string without colons and dots.
const quotedSheetRef = "'[^']+'";
const unquotedSheetRef = '[^:.]+';
const sheetRef = `(${unquotedSheetRef}|${quotedSheetRef})?`; // Optional and captured

// A section Ref is a colon followed by anything but a colon or dot.
const sectionRef = '([^.:]+)?'; // Optional section ref

// Column and row names
const columnName = '[A-Z]+';
const rowName = '[1-9][0-9]*';
const cellName = `(${columnName}${rowName})`; // Capture group for cell reference

// Cell reference
const cellRef = `=(?:${sheetRef}(?::${sectionRef})?\\.)?${cellName}`;

// A leading single-quote is ignored but forces textual interpretation.
const quotedLiteral = "'[^']+'";
const unquotedLiteral = '[^=].*';
const literal = `(${quotedLiteral}|${unquotedLiteral})`; // Capture group for literal

/**
 * This regular expression matches a value reference, i.e. the value of a
 * node in the mapping object.  They are always strings!
 *
 * The captures are:
 *
 * 0: the entire reference
 * 1: a possibly single-quoted sheet name or undefined
 * 2: a section name without the leading colon or undefined
 * 3: a cell name without the leading dot or undefined
 * 4: a literal value, possibly with a leading single-quote, or undefined
 */
export const mappingValuePattern = `^${cellRef}|${literal}$`;
export const mappingValueRe = new RegExp(mappingValuePattern);

/**
 * This regular expression matches a section Reference, i.e. the value of
 * the property `section` for arrays.  It is an optional, possibly quoted sheet
 * reference followed by a colon and the name of a section.  A lone section
 * must start with a colon.  The catptures are:
 *
 * 0: the entire reference
 * 1: a possibly quoted sheet reference or undefined
 * 2: a section reference without the colon
 */
export const sectionReferencePattern = `(?:${sheetRef}(?::${sectionRef}))`;
export const sectionReferenceRe = new RegExp(sectionReferencePattern);
