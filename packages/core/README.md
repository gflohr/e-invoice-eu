<p align="center">
	<img
		src="./assets/e-invoice-eu-logo-2.webp"
		width="256" height="256" />
</p>

[![licence](https://img.shields.io/badge/licence-WTFPL-blue)](http://www.wtfpl.net/)
[![price](https://img.shields.io/badge/price-FREE-green)](https://github.com/gflohr/qgoda/blob/main/LICENSE)
[![coverage](https://img.shields.io/coverallsCoverage/github/gflohr/e-invoice-eu?branch=main)](https://coveralls.io/github/gflohr/e-invoice-eu?branch=main)
[![documentation](https://img.shields.io/badge/documentation-Qgoda🍓-ffc107)](https://www.qgoda.net/)
[![stand with](https://img.shields.io/badge/stand%20with-Ukraine🇺🇦-ffc107)](https://www.standwithukraineeurope.com/en//)

# E-Invoice-EU<!-- omit from toc -->

Free and open source tool chain for generating EN16931 conforming e-invoices
(Factur-X/ZUGFeRD, UBL, CII, XRechnung) from popular spreadsheet formats or
JSON.

This package contains the core library of `@e-invoice-eu/core`. Both the
[E-Invoice-EU command line tool](https://github.com/gflohr/e-invoice-eu/tree/main/apps/cli)
and the [E-Invoice-EU web service](https://github.com/gflohr/e-invoice-eu/tree/main/apps/server)
use it as their foundation.

## Table of Contents<!-- omit from toc -->
- [Features](#features)
- [Documentation](#documentation)
- [Installation](#installation)
- [Usage](#usage)
	- [Importing/Requiring the Library](#importingrequiring-the-library)
	- [Creating Invoice Data from Spreadsheet Files](#creating-invoice-data-from-spreadsheet-files)
	- [Generating an Invoice from Data in the Internal Format](#generating-an-invoice-from-data-in-the-internal-format)
- [Copyright](#copyright)
- [Disclaimer](#disclaimer)

## Features

The library can create e-invoices in the following formats:

* Cross Industry Invoice - CII
* Universal Business Language - UBL
* Factur-X/ZUGFeRD (all profiles including XRECHNUNG) with full PDF/A support

E-Invoices can be created directly from data in the [E-Invoice-EU internal
format](https://gflohr.github.io/e-invoice-eu/en/docs/details/internal-format/)
or via a [mapping definition](https://gflohr.github.io/e-invoice-eu/en/docs/details/mapping/)
from popular spreadsheet formats like `.ods`, `.xlsx`, `.csv`, ...

The library is implemented in TypeScript and provides complete type definitions
out of the box. No additional @types package is required. All data structures,
including those for the internal invoice format and mapping definitions, are
fully typed, ensuring comprehensive IntelliSense support.

The library is available as an ES module, CommonJS, and UMD, making it
compatible with both browser environments and JavaScript runtimes like Node.js.

## Documentation

The general documentation of `e-invoice-eu` is available at the
[`e-invoice-eu` GitHub page](https://github.com/gflohr/e-invoice-eu/tree/main/packages/core).
For reference, you can also consult the
[API documentation](https://gflohr.github.io/e-invoice-eu/api-docs/).

## Installation

```sh
npm install @e-invoice-eu/core
```

## Usage

### Importing/Requiring the Library

If you have the `import` keyword:

```typescript
import { InvoiceService, MappingService } from '@e-invoice-eu/core'
```

With `require`:

```javascript
const { InvoiceService, MappingService } = require('@e-invoice-eu/core')
```

In the browser:

```html
<script src="https://cdn.jsdelivr.net/npm/@e-invoice-eu/core/dist/esgettext.min.js"></script>
<script>
	const invoiceService = new eInvoiceEU.InvoiceService(/* arguments */);
	const mappingService = new eInvoiceEU.MappingService(/* arguments */);
	// Your code goes here ...
</script>
```

### Creating Invoice Data from Spreadsheet Files

For this optional step, you need both the spreadsheet file as a `Buffer` and a
mapping definition as a
[`Mapping`](https://gflohr.github.io/e-invoice-eu/api-docs/interfaces/Mapping.html)
object:

```typescript
import { MappingService } from '@e-invoice-eu/core';

const mappingService = new MappingService(console);
const invoice = mappingService.transform(
	spreadsheet, // a `Buffer`
	'Factur-X-Extended', // see https://gflohr.github.io/e-invoice-eu/en/docs/basics/supported-formats/
	mapping, // a `Mapping`
);
```

The returned `invoice` object is an 
[`Invoice`](https://gflohr.github.io/e-invoice-eu/api-docs/interfaces/Invoice.html)
instance in the internal format. It is not yet an XML string or PDF buffer!

### Generating an Invoice from Data in the Internal Format

You can either provide the invoice data yourself as an
[`Invoice`](https://gflohr.github.io/e-invoice-eu/api-docs/interfaces/Invoice.html)
instance or you can create it from spreadsheet data and a mapping definition
as shown in the [previous section](#creating-invoice-data-from-spreadsheet-files).

```typescript
import { InvoiceService } from '@e-invoice-eu/core';

const invoiceService = new InvoiceService(console);

const renderedInvoice = await invoiceService.generate(invoiceData, options);
```

See this summary for the `options` (optional options are marked with an
question mark `?`):

| Name  | Type | Description |
|------ |------|-------------|
| format | `string` | a [supported format]( https://gflohr.github.io/e-invoice-eu/en/docs/basics/supported-formats/) |
| lang | `string` | a language identifier like `fr-fr` |
| embedPDF? | `boolean` | pass `true` if a PDF version should be embedded into XML output |
| pdf | `InvoiceFile` | |
| attachments | `InvoiceAttachment[]` | |

TODO!

1) Types InvoiceFile and InvoiceAttachment are actually the same. Remove type InvoiceFile!
2) The `attachments` should not be mandatory but default to an empty array.
3) Rename type `InvoiceAttachment` to type `Attachment`.

## Copyright

Copyright (C) 2024-2025 Guido Flohr <guido.flohr@cantanea.com>, all
rights reserved.

This is free software available under the terms of the
[WTFPL](http://www.wtfpl.net/).

## Disclaimer

This free software has been written with the greatest possible care, but like
all software it may contain errors. Use at your own risk! There is no
warranty and no liability.
