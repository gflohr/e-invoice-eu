# E-Invoice-EU

Tool-chain for generating EN16931 conforming invoices from popular spreadsheet
formats or JSON.

- [E-Invoice-EU](#e-invoice-eu)
  - [Status](#status)
  - [Description](#description)
  - [Documentation](#documentation)
  - [Pre-requisites](#pre-requisites)
  - [Installation](#installation)
  - [Running the app](#running-the-app)
  - [Test](#test)
  - [Curl Examples](#curl-examples)
    - [OpenAPI/Swagger documentation](#openapiswagger-documentation)
    - [List Supported Formats](#list-supported-formats)
    - [Transform Data from Spreadsheet](#transform-data-from-spreadsheet)
    - [Create an Invoice from a Spreadsheet](#create-an-invoice-from-a-spreadsheet)
  - [Data Structure](#data-structure)
  - [Mapping Syntax](#mapping-syntax)
  - [Frequently Asked Questions](#frequently-asked-questions)
    - [Why are no Numbers Used in the JSON Schema?](#why-are-no-numbers-used-in-the-json-schema)
    - [What Does the Warning 'ODS number format may be incorrect' Mean?](#what-does-the-warning-ods-number-format-may-be-incorrect-mean)
    - [Where Can I Get Information About Business Terms?](#where-can-i-get-information-about-business-terms)
  - [License](#license)

## Status

You can currently create invoices in these formats:

- UBL: customization id `urn:cen.eu:en16931:2017`
- XRECHNUNG-UBL: customization id `urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0`
- CII: customization id `urn:cen.eu:en16931:2017`

## Description

This repository is an attempt to aid small businesses, especially in France and Germany but also in other parts of the European Union to create electronic invoices conforming with EN16931 with only free and open-source software.

It is quite unlikely that you can use anything here out of the box. See it as a starter template for your own solution.

## Documentation

This `README.md` is probably incomplete. Please see the blog post
[Creating Electronic Invoices with Free and Open Source
Software](https://www.guido-flohr.net/creating-electronic-invoices-with-free-and-open-source-software/)
for more accurate in-depth information!

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
$ curl -X POST http://localhost:3000/api/format/list
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

### Create an Invoice from a Spreadsheet

```bash
$ curl -v -X POST \
    http://localhost:3000/api/invoice/transform-and-create/UBL \
    -F mapping=@contrib/mappings/default-invoice.yaml \
    -F data=@contrib/templates/1234567890-consulting/default-invoice.ods
```

This will transform the spreadsheet into the internal format and immediately
create an invoice in format `UBL`.

The formats `UBL` and `XRECHNUNG-UBL` are currently the only supported formats.

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

## License

This is free software available under the terms of the
[WTFPL](http://www.wtfpl.net/).
