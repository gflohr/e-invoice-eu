# E-Invoice-EU

Tool-chain for generating EN16931 conforming invoices from popular spreadsheet
formats or JSON.

- [E-Invoice-EU](#e-invoice-eu)
  - [Status](#status)
    - [Supported Formats](#supported-formats)
    - [Security](#security)
  - [Description](#description)
  - [Documentation](#documentation)
  - [Alternatives](#alternatives)
  - [Pre-requisites](#pre-requisites)
  - [Installation](#installation)
  - [Running the app](#running-the-app)
  - [Test](#test)
  - [Curl Examples](#curl-examples)
    - [OpenAPI/Swagger documentation](#openapiswagger-documentation)
    - [List Supported Formats](#list-supported-formats)
    - [Transform Data from Spreadsheet](#transform-data-from-spreadsheet)
    - [Create an Invoice from a Spreadsheet](#create-an-invoice-from-a-spreadsheet)
    - [Full-Fledged Example](#full-fledged-example)
  - [Data Structure](#data-structure)
  - [Mapping Syntax](#mapping-syntax)
  - [Frequently Asked Questions](#frequently-asked-questions)
    - [Why are no Numbers Used in the JSON Schema?](#why-are-no-numbers-used-in-the-json-schema)
    - [What Does the Warning 'ODS number format may be incorrect' Mean?](#what-does-the-warning-ods-number-format-may-be-incorrect-mean)
    - [Where Can I Get Information About Business Terms?](#where-can-i-get-information-about-business-terms)
    - [How Can I Suppress Auxiliary Sheets in the PDF Output?](#how-can-i-suppress-auxiliary-sheets-in-the-pdf-output)
  - [BUGS](#bugs)
    - [Report a Bug](#report-a-bug)
    - [PDF/A](#pdfa)
    - [Missing Invoice Formats](#missing-invoice-formats)
  - [License](#license)

## Status

### Supported Formats

You can currently create invoices in these formats:

- CII: customization id `urn:cen.eu:en16931:2017`
- Factur-X-EN16931 id `urn:cen.eu:en16931:2017`, also known as ZUGFeRD-EN16931 or ZUGFeRD-Comfort
- Factur-X-Extended id `urn:cen.eu:en16931:2017#conformant#urn:factur-x.eu:1p0:extended`, also known as ZUGFeRD-Extended
- Factur-X-XRechung id `urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0`, also known as ZUGFeRD-XRechnung
- UBL: customization id `urn:cen.eu:en16931:2017`
- XRECHNUNG-CII: customization id `urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0`
- XRECHNUNG-UBL: customization id `urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0`

### Security

The service in its current state is meant to be run in a network with limited
access or behind an API gateway that prevents abuse of the service.

One simple solution is to use [`ngninx`](https://nginx.org/) as a
gateway and configure rate-limiting there. You will also want to limit
the maximum request body size.

## Description

This repository is an attempt to aid small businesses, especially in France and Germany but also in other parts of the European Union to create electronic invoices conforming with EN16931 with only free and open-source software.

It is quite unlikely that you can use anything here out of the box. See it as a starter template for your own solution.

## Documentation

This `README.md` is probably incomplete. Please see the blog post
[Creating Electronic Invoices with Free and Open Source
Software](https://www.guido-flohr.net/creating-electronic-invoices-with-free-and-open-source-software/)
for more accurate in-depth information!

## Alternatives

You can achieve similar results with these projects:

- [Factur-X extension for LibreOffice](https://github.com/akretion/factur-x-libreoffice-extension)
  is a LibreOffice extension to generate Factur-X invoices from LibreOffice Calc published under the GPL licence with a [video tutorial](https://www.youtube.com/watch?v=ldD-1W8yIv0). It is maybe less flexible but easier to set up.

## Pre-requisites

- NodeJS 20.x
- Bun (you can use npm, yarn, pnpm, ... instead if you prefer)

## Installation

```bash
$ bun install --optional
```

This may warn about "husky" missing. Just run `bun install` again in order
to fix this.

## Running the app

```bash
# development
$ bun run start

# watch mode
$ bun run start:dev

# production mode
$ bun run start:prod
```

## Test

```bash
# unit tests
$ bun run test

# e2e tests
$ bun run test:e2e

# test coverage
$ bun run test:cov
```

## Curl Examples

The following assumes that you run the application with `start:dev` and the
API is exposed at http://localhost:3000.

### OpenAPI/Swagger documentation

```bash
curl http://localhost:3000/api
```

It probably makes more sense to open that URL in the browser.

### List Supported Formats

```bash
$ curl http://localhost:3000/api/format/list
```

This will return a list with format informat. For each format, the name,
the customization and profile ID, the MIME type, and the syntax (UBL or
CII) is returned.

### Transform Data from Spreadsheet

The application ships with a mapping in `resources/default-invoice.yaml`.
You can use it with the spreadsheet data from
`contrib/templates/1234567890-consulting/default-invoice.ods` like this:

```bash
$ curl -X POST http://localhost:3000/api/mapping/transform/UBL \
	-F mapping=@contrib/mappings/default-invoice.yaml \
	-F data=@contrib/templates/1234567890-consulting/default-invoice.ods
```

This will create invoice data in the internal format from a spreadsheet. The
intended target format is UBL.

The format parameter (`UBL` in this case) is case-insensitive!

### Create an Invoice from a Spreadsheet

```bash
$ curl -v -X POST \
    http://localhost:3000/api/invoice/transform-and-create/UBL \
    -F mapping=@contrib/mappings/default-invoice.yaml \
    -F data=@contrib/templates/1234567890-consulting/default-invoice.ods
```

This will transform the spreadsheet into the internal format and immediately
create an invoice in format `UBL`.

### Full-Fledged Example

Say you want to add a PDF version `invoice.pdf` and two attachments
`time-sheet.ods` and `payment-terms.pdf` to the generated invoice:

```bash
$ curl -v -X POST \
    http://localhost:3000/api/invoice/transform-and-create/UBL \
    -F mapping=@contrib/mappings/default-invoice.yaml \
    -F data=@contrib/templates/1234567890-consulting/default-invoice.ods \
    -F pdf=@invoice.pdf \
    -F embedPDF= \
    -F pdfID=1234567890 \
    -F pdfDescription="Invoice as PDF." \
    -F "attachment=@time-sheet.ods;type=application/vnd.oasis.opendocument.spreadsheet" \
		-F "attachmentID=abc-123-xyz" \
    -F attachmentDescription="Detailed description of hours spent." \
    -F attachment=@payment-terms.pdf \
    -F attachmentDescription="Our payment terms" \
```

The parameter `embedPDF` should be passed if a PDF version of the document
should be embedded into the XML. It only makes sense if you have specified a
format that is _not_ Factur-X. Otherwise, it gets ignored. If you have uploaded a file `pdf` it
is taken. Otherwise, the file is generated with LibreOffice from the `data` file.
The parameter `pdfID` defaults to the document number.

Note that for the first supplementary attachment 'time-sheet.ods`, a MIME type
is explicitly specified because `curl` probably does not not the correct MIME
type of OpenDocument spreadsheet files.

For each supplementary attachment, an optional `description` and an optional
`id` can be specified. If the id is omitted, it defaults to the filename of
the attached file.

## Data Structure

The invoice document data structure is documented here:
https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/

If you prefer to have it all on one page, look here:
https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/tree/

A gentler introduction can be found here:
https://docs.peppol.eu/poacc/billing/3.0/bis/

## Mapping Syntax

Please see the [mapping documentation](documentation/Mapping.md)!

## Frequently Asked Questions

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

There are workarounds for this limitation of Ajv but I want to avoid people
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
You can look up to which elements they belong in the documentation
file [BusinessTerms.md](documentation/BusinessTerms.md).

### How Can I Suppress Auxiliary Sheets in the PDF Output?

Make sure that only the sheet that contains the printable invoice data has
a print range defined. You can check that with the menu entry
`Format -> Print Ranges -> Edit`. For all other sheets, all three options
have to be set to `None`.

## BUGS

### Report a Bug

Please report bugs at https://github.com/gflohr/e-invoice-eu/issues.

### PDF/A

The Factur-X resp. ZUGFeRD standard requires PDF/A compliance for the PDF that
the invoice is wrapped in. Please search the internet if you do not know what
PDF/A means.

This library creates PDFs solely with [`pdf-lib`](https://github.com/Hopding/pdf-lib)
and does some pretty complicated transformations on the PDF to achieve PDF/A
compliance. This is not battle tested and may fail.

If you encounter a PDF that does not meet the PDF/A requirements, please
open an issue and attach an anonymized version of the PDF. What you can do
in the meantime:

- If you have [GhostScript](https://www.ghostscript.com/) installed, convert the PDF to PDF/A with this command: `gs -dVERBOSE -dPDFA=3 -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -sOutputFile=OUTPUT_FILE.pdf PDFA_def.ps INPUT_FILE.pdf`
- Try to create the PDF again with [LibreOffice](https://www.libreoffice.org/).
- If the normal settings in LibreOffice do not work, enable PDF/A support (in the General section of the PDF options).
- If you want to automate the process, you can start LibreOffice in headless mode on the commandline: `libreoffice --headless "-env:UserInstallation=file:///tmp/LibreOffice_Conversion_${USER}" --convert-to 'pdf:writer_pdf_Export:{"SelectPdfVersion":{"type":"long","value":"3"}}' SOURCE_FILE.ods`

On Un\*x systems, `libreoffice` should be in your `$PATH`. On MacOS, you will
find it under `/Applications/LibreOffice.app/Contents/MacOS/soffice`. On
MS Windows, it is probably somewhere like `C:\\Program Files\\LibreOffice\\libreoffice.exe` (corrections are welcome).

### Missing Invoice Formats

All invoice formats that are variants of UBL or CII should be relatively easy
to support. Please file an issue if you need an invoice format that is
currently not supported.

Credit notes and other documents like orders are currently not supported and
support for it will require more effort.

EDI is also not supported. If you know of a tool that is able to convert
UBL or CII to EDI, please let us know!

## License

This is free software available under the terms of the
[WTFPL](http://www.wtfpl.net/).
