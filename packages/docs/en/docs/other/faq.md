---
title: FAQ 
name: faq 
section: other
---
<!--qgoda-no-xgettext-->
[% USE q = Qgoda %]
<!--/qgoda-no-xgettext-->

### Why are no Numbers Used in the JSON Schema?

Amounts have to be numbers >= 0 with at most two decimal places. The following
JSON schema should work for this:

```json
{
	"type": "number",
	"multipleOf": 0.01
}
```

This is even documented in the [JSON Schema
documentation](https://json-schema.org/understanding-json-schema/reference/numeric#multiples).
Unfortunately, this does not work with the JavaScript implementation, see
https://github.com/ajv-validator/ajv/issues/652.

There are workarounds for this limitation of Ajv but we want to avoid people
naïvely validating against the schema with Ajv without applying the necessary
workaround. It looks simpler to require all amounts to be formatted
beforehand by the software that generates the input data.

The problem for percentages is the same only that percentages can have up
to four decimal digits.

For other numerical types, like quantities, we could use numbers but for
consistency we use strings throughout the schema.

### What Does the Warning 'ODS number format may be incorrect' Mean?

See [SheetJS GitHub issue #1569](https://github.com/SheetJS/sheetjs/issues/1569).
You can probably ignore this warning, unless you run into a problem with
number formats.

### Where Can I Get Information About Business Terms?

You will often see references to business terms in validation error messages.
You can look up to which elements they belong in our
[list of Business Terms]([% q.llink(name='business-terms') %]).

### How Can I Suppress Auxiliary Sheets in the PDF Output?

Make sure that only the sheet that contains the printable invoice data has
a print range defined. You can check that with the menu entry
`Format -> Print Ranges -> Edit`. For all other sheets, all three options
have to be set to `None`.
