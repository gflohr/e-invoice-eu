---
title: FAQ
name: faq
section: other
---
<!--qgoda-no-xgettext-->
[% USE q = Qgoda %]
[% USE Highlight %]
<!--/qgoda-no-xgettext-->

<qgoda-toc/>

## Which Arguments/Parameters are Needed for Which Use Case

The same rules apply both for the [% q.lanchor(name='cli') %] and the
[% q.lanchor(name='service') %]:

You have two options to pass the invoice data to the software. If you already
have the invoice data as structured data in the internal format, you can
pass the data with the parameter `invoice` or the commandline option
`--invoice` as JSON. The other option is to generate the invoice data from a
spreadsheet. In that case you have to pass the spreadsheet data with the
parameter `spreadsheet` (commandline option `--spreadsheet`) and a YAML or JSON mapping
with the option `mapping` (commandline option `--mapping`).

Then, you must decide whether you want to create a pure XML invoice format
or the hybrid Factur-X/ZUGFeRD format. For Factur-X/ZUGFeRD you *always* need
a PDF because it is a PDF with the machine-readable invoice data embedded; for
pure XML formats you only need a PDF if you want to embed an optional PDF
version of the invoice into the XML document.

If you have to provide a pdf, you have to options to do so:  If you already
have a PDF version of the invoice, you can just pass it to the application
with the parameter `pdf` respectively the commandline option `--pdf`. The
other option is to generate the PDF from a spreadsheet file with
[LibreOffice](https://www.libreoffice.org). In that case, you have to pass the
spreadsheet file as a parameter `spreadsheet` or the commandline option `--spreadsheet`.

For Factur-X/ZUGFeRD, you cannot specify a PDF id or PDF description because
it is implied. For pure XML formats you can specify them with the parameter
`pdf-id` or the commandline option `--pdf-id` and the parameter
`pdf-description` or the commandline option `--pdf-description`.

Finally, it is possible to attach more files for every supported format. For
each of these attachments you *must* add the file with the parameter
`attachment` or the commandline option `--attachment`. You *should* also
pass the attachmend id and description with `attachment-id`/`--attachment-id`
and `attachment-description`/`--attachment-description`.

In case, the software does not guess the correct MIME type of the attachment,
you should also specify it with the parameter `attachment-mimetype` or
the command line option `--attachment-mimetype`.

## Why are no Numbers Used in the JSON Schema?

Amounts have to be numbers >= 0 with at most two decimal places. The following
JSON schema should work for this:

<!--qgoda-no-xgettext-->
[% FILTER $Highlight "language-json" %]
{
	"type": "number",
	"multipleOf": 0.01
}
[% END %]
<!--/qgoda-no-xgettext-->

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

## What Does the Warning 'ODS number format may be incorrect' Mean?

See [SheetJS GitHub issue #1569](https://github.com/SheetJS/sheetjs/issues/1569).
You can probably ignore this warning, unless you run into a problem with
number formats.

## Where Can I Get Information About Business Terms?

You will often see references to business terms in validation error messages.
You can look up to which elements they belong in our
[list of Business Terms]([% q.llink(name='business-terms') %]).

## How Can I Suppress Auxiliary Sheets in the PDF Output?

Make sure that only the sheet that contains the printable invoice data has
a print range defined. You can check that with the menu entry
`Format -> Print Ranges -> Edit`. For all other sheets, all three options
have to be set to `None`.

## Can I encode "Skonto" in an Electronic Invoice?

Skonto is a cash discount that is commonly given in German speaking countries.
If the invoice is paid with a certain number of days, an automatic allowance is
granted.

The standard EN16931 does nt provide anything to encode this. But the German
XRechnung standard defines a way to transmit this information. This is best
explained by an example:

```
#SKONTO#TAGE=10#PROZENT=3.00#
#SKONTO#TAGE=10#PROZENT=3.00#BASISBETRAG=1303.69#
```

The first token `SKONTO` is mandatory. It is followed by the number of days
(`TAGE`) and the allowance percentage (`PROZENT`) with exactly two decimal
digits.

If the discount is applied to only a part of the grand total, that part has
to be specified as a base amount (`BASISBETRAG`), again with two decimal
digits.

It seems to be sufficient that the field
[`/cac:PaymentTerms/cbc:Note`](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-PaymentTerms/cbc-Note/)
contains a line that matches this pattern so that you can mix this with
human-readable information. Please file an issue, if this is wrong information.

Other sources mention that you can specify a penalty for late payment in the
same manner as for "Skonto" but replace the `#SKONTO#` with `#VERZUG#` (the
German word for late payment). However, the [official Schematron rules for
the German XRechnung](https://github.com/itplr-kosit/xrechnung-schematron/blob/3196f722f1b7298eaaff2e0c89d499e42015f67c/src/validation/schematron/common.sch#L11)
do not suggest such a convention.
