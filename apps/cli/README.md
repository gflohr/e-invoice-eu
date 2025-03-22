<p align="center">
	<img
		src="../../assets/e-invoice-eu-logo-2.webp"
		width="256" height="256" />
</p>

[![licence](https://img.shields.io/badge/licence-WTFPL-blue)](http://www.wtfpl.net/)
[![price](https://img.shields.io/badge/price-FREE-green)](https://github.com/gflohr/qgoda/blob/main/LICENSE)
[![coverage](https://img.shields.io/coverallsCoverage/github/gflohr/e-invoice-eu?branch=main)](https://coveralls.io/github/gflohr/e-invoice-eu?branch=main)
[![documentation](https://img.shields.io/badge/documentation-Qgoda🍓-ffc107)](https://www.qgoda.net/)
[![stand with](https://img.shields.io/badge/stand%20with-Ukraine🇺🇦-ffc107)](https://www.standwithukraineeurope.com/en//)

# @e-invoice-eu/cli<!-- omit in toc -->

Generate e-invoices (E-Rechnung in German) conforming to EN16931 (Factur-X/ZUGFeRD, UBL, CII, XRechnung aka X-Rechnung) from LibreOffice Calc/Excel data or JSON.

## Table of Contents<!-- omit in toc -->

- [Description](#description)
- [Features](#features)
- [Documentation](#documentation)
- [Installation](#installation)
- [Usage](#usage)
  - [General](#general)
  - [The Command `invoice`](#the-command-invoice)
    - [Argument `format`](#argument-format)
    - [Argument `lang`](#argument-lang)
    - [Argument `embedPDF`](#argument-embedpdf)
    - [Argument `pdf`](#argument-pdf)
    - [Argument `data`](#argument-data)
    - [Argument `attachments`](#argument-attachments)
  - [Getting Supported Formats](#getting-supported-formats)
  - [Getting the JSON Schema Definitions](#getting-the-json-schema-definitions)
- [Copyright](#copyright)
- [Disclaimer](#disclaimer)

## Description

This package contains the commandline interface of `@e-invoice-eu/core`
installed as `e-invoice-eu`. It uses the E-Invoice-EU core library
[`@e-invoice-eu/core`](https://github.com/gflohr/e-invoice-eu/tree/main/packages/core)
internally.

## Features

The program can create e-invoices in the following formats:

- Cross Industry Invoice - CII
- Universal Business Language - UBL
- Factur-X/ZUGFeRD (all profiles including XRECHNUNG) with full PDF/A support

E-Invoices can be created directly from data in the [E-Invoice-EU internal
format](https://gflohr.github.io/e-invoice-eu/en/docs/details/internal-format/)
or via a [mapping definition](https://gflohr.github.io/e-invoice-eu/en/docs/details/mapping/)
from popular spreadsheet formats like `.ods`, `.xlsx`, `.csv`, ...

## Documentation

The general documentation of `e-invoice-eu` is available at the
[`e-invoice-eu` GitHub page](https://github.com/gflohr/e-invoice-eu/tree/main/packages/core).
For reference, you can also consult the
[API documentation](https://gflohr.github.io/e-invoice-eu/api-docs/).

## Installation

```sh
npm install -g @e-invoice-eu/cli
```

You can test that the installation has worked with the command `e-invoice-eu
--version`. The output should be the version number of the installed software.

## Usage

### General

The general usage patterns are:

```sh
e-invoice-eu COMAND [COMMAND_OPTIONS]
e-invoice-eu [GLOBAL_OPTIONS]
```

You can get information about the program like this:

```sh
e-invoice-eu --help
```

### The Command `invoice`

The command `invoice` takes the following options and arguments:

| Name              | Argument | Description                                                                                   |
| ----------------- | -------- | --------------------------------------------------------------------------------------------- |
| -f, --format      | `string` | a [supported format](https://gflohr.github.io/e-invoice-eu/en/docs/basics/supported-formats/) |
| -o, --output      | `string` | write output to specified file instead of standard output                                     |
| -i, --invoice     | `string` | JSON file with invoice data, mandatory for invoice generation from JSON                       |
| -m, --mapping     | `string` | YAML or JSON file with mapping, mandatory for invoice generation from spreadsheet data        |
| -d, --data        | `string` | invoice spreadsheet file, mandataory for invoice generation from spreadsheet data             |
| -l, --lang        | `string` | a language identifier like `fr-fr`                                                            |
| --embedPDF        |          | use if a PDF version should be embedded into XML output                                       |
| -p, --pdf         | `string` | a PDF version of the invoice                                                                  |
| --pdf-id          | `string` | ID of the embedded PDF, defaults to the document number; ignored for Factur-X/ZUGFeRD         |
| --pdf-description | `string` | optional description of the embedded PDF; ignored for Factur-X/ZUGFeRD                        |
| -a, --attachment  | `string` | optional name of an additional attachment                                                     |
| --attachment-id   | `string` |

#### Argument `format`

This contains the format of the e-invoice as a case-insensitive string. You
can also use aliases. For example, `Factur-X-Comfort` is an alias for
`Factur-X-EN16931`.

#### Argument `lang`

A language identifier like `fr-fr`. This is only used for the Factur-X/ZUGFeRD
formats for some canned texts in the PDF XMP meta data.

#### Argument `embedPDF`

This is only used for the pure XML formats (everything that is not
Factur-X/ZUGFeRD). If it has a truthy value, a PDF version of the invoice
is embedded as a base64 encoded string in the XML.

#### Argument `pdf`

This is required in two cases:

1. The format is a Factur-X/ZUGFeRD format and `data` was **not** specified.
2. The format is a pure XML format, `embedPDF` was specified and `data` was not specified.

#### Argument `data`

A spreadsheet version of the invoice. If a PDF is required, either because
embedPDF was specified for pure XML or because the format is Factur-X/ZUGFeRD,
[LibreOffice](https://libreoffice.org) is invoked for rendering the spreadsheet
as a PDF.

This feature will trigger an exception if used in the browser.

#### Argument `attachments`

You can specify an arbitrary number of additional attachments.

In case of the pure XML formats, they are embedded as base64 encoded strings
in the XML. In case of Factur-X/ZUGFeRD they are attached to the PDF,
additionally to the mandatory attachment `factur-x.xml`.

### Getting Supported Formats

```typescript
import { FormatFactoryService } from '@e-invoice-eu/core';

const factoryService = new FormatFactoryService();
const formats = factoryService.listFormatServices();
```

In `format` you will find an array of
[`FormatInfo`](https://gflohr.github.io/e-invoice-eu/api-docs/types/FormatInfo.html)
objects.

### Getting the JSON Schema Definitions

```typescript
import { invoiceSchema, mappingSchema } from '@e-invoice-eu/core';
```

These variables contain the schema for the
[`Invoice`](https://gflohr.github.io/e-invoice-eu/api-docs/types/Invoice.html)
and [`Mapping`](https://gflohr.github.io/e-invoice-eu/api-docs/types/Mapping.html)
interfaces. These schemas can be passed as an argument to the compile method of an Ajv instance, see https://ajv.js.org/api.html#ajv-compile-schema-object-data-any-boolean-promise-any for more information!

The schemas have the type
[`JSONSchemaType<Invoice>`](https://ajv.js.org/guide/typescript.html#utility-types-for-schemas)
and
[`JSONSchemaType<Mapping>`](https://ajv.js.org/guide/typescript.html#utility-types-for-schemas)
respectively.

## Copyright

Copyright (C) 2024-2025 Guido Flohr <guido.flohr@cantanea.com>, all
rights reserved.

This is free software available under the terms of the
[WTFPL](http://www.wtfpl.net/).

## Disclaimer

This free software has been written with the greatest possible care, but like
all software it may contain errors. Use at your own risk! There is no
warranty and no liability.
