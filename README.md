<p align="center">
	<img
		src="https://raw.githubusercontent.com/gflohr/e-invoice-eu/main/assets/e-invoice-eu-logo-2.webp"
		width="256" height="256" />
</p>

[![licence](https://img.shields.io/badge/licence-WTFPL-blue)](http://www.wtfpl.net/)
[![price](https://img.shields.io/badge/price-FREE-green)](https://github.com/gflohr/qgoda/blob/main/LICENSE)
[![coverage](https://img.shields.io/coverallsCoverage/github/gflohr/e-invoice-eu?branch=main)](https://coveralls.io/github/gflohr/e-invoice-eu?branch=main)
[![downloads](https://img.shields.io/npm/dw/%40e-invoice-eu%2Fcore)](https://img.shields.io/npm/dw/%40e-invoice-eu%2Fcore)
[![documentation](https://img.shields.io/badge/documentation-Qgoda🍓-ffc107)](https://www.qgoda.net/)
[![stand with](https://img.shields.io/badge/stand%20with-Ukraine🇺🇦-ffc107)](https://www.standwithukraineeurope.com/en//)

# E-Invoice-EU<!-- omit from toc -->

Free and open source tool chain for generating EN16931 conforming e-invoices
(Factur-X/ZUGFeRD, UBL, CII, XRechnung) from popular spreadsheet formats or
JSON with free and open source software.

- [Why E-Invoice-EU?](#why-e-invoice-eu)
- [Supported Formats](#supported-formats)
- [Using the software](#using-the-software)
- [Description](#description)
- [Documentation](#documentation)
- [Validation](#validation)
- [BUGS](#bugs)
	- [PDF/A](#pdfa)
- [Reporting Bugs](#reporting-bugs)
- [Copyright](#copyright)
- [Disclaimer](#disclaimer)

## Why E-Invoice-EU?

Electronic invoicing in the EU is mandatory, but most available solutions are
proprietary, commercial, closed, and costly. E-Invoice-EU takes a different approach:

- ✅ **100% free & open source** – no licence fees, no vendor lock-in
- ✅ **Standards-compliant** – EN16931, Factur-X, ZUGFeRD, UBL, CII, XRechnung
- ✅ **Flexible integration** – use the CLI tool, the REST API, or the TypeScript/JavaScript library
- ✅ **Modern ERP-friendly** – JSON-based input/output makes it trivial to integrate into any contemporary ERP infrastructure
- ✅ **Proven in production** – already used by organizations ranging from freelancers to multinational enterprises

Whether you need to automate a few invoices per month or integrate e-invoicing
into a large-scale workflow: E-Invoice-EU gives you a reliable foundation.

## Supported Formats

You can currently create e-invoices in these formats:

- `CII`: customization id `urn:cen.eu:en16931:2017`
- `Factur-X-Minimum` customization id `urn:factur-x.eu:1p0:minimum`
- `Factur-X-BasicWL` customization id `urn:factur-x.eu:1p0:basicwl`
- `Factur-X-Basic-WL` is an alias for `Factur-X-BasicWL`
- `Factur-X-Basic` customization id `'urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:basic'`
- `Factur-X-EN16931` customization id `urn:cen.eu:en16931:2017`
- `Factur-X-Comfort` is an alias for `Factur-X-EN16931`
- `Factur-X-Extended` customization id `urn:cen.eu:en16931:2017#conformant#urn:factur-x.eu:1p0:extended`
- `Factur-X-XRechung` customization id `urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0`
- `UBL`: customization customization id `urn:cen.eu:en16931:2017`
- `XRECHNUNG-CII`: customization id `urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0`
- `XRECHNUNG-UBL`: customization id `urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0`
- `ZUGFeRD-Minimum` is an alias for `Factur-X-Minimum`
- `ZUGFeRD-BasicWL` is an alias for `Factur-X-BasicWL`
- `ZUGFeRD-Basic-WL` is an alias for `Factur-X-BasicWL`
- `ZUGFeRD-Basic` is an alias for `Factur-X-Basic`
- `ZUGFeRD-EN16931` is an alias for `Factur-X-EN16931`
- `ZUGFeRD-Comfort` is an alias for `Factur-X-EN16931`
- `ZUGFeRD-Extended` is an alias for `Factur-X-Extended`
- `ZUGFeRD-XRechnung` is an alias for `Factur-X-XRechnung`

Case does not matter, when you specify a format.

## Using the software

There are several ways to use the software:

- a [commandline tool `e-invoice-eu`](apps/cli/README.md)
- a [web service with a RESTful API](apps/server/README.md)
- a [JavaScript/TypeScript library](packages/core/README.md)

The JavaScript/TypeScript library works both on the commandline and in the
browser. The only limitation of the browser version is that it cannot generate
PDF versions of invoices from spreadsheet data because this requires invocation
of [LibreOffice](https://www.libreoffice.org/) which is not possible in the
browser. Instead, you have to provide a PDF version yourself, in case it is
needed.

The [E-Invoice-EU documentation](https://gflohr.github.io/e-invoice-eu/)
contains a [fully working demo of invoice generation right in your
browser](https://gflohr.github.io/e-invoice-eu/en/docs/other/browser-example/).

## Description

This repository is an attempt to aid businesses, especially in France and
Germany but also in other parts of the European Union to create e-invoices
conforming with EN16931 with only free and open-source software.

## Documentation

See the [E-Invoice-EU online documentation](https://gflohr.github.io/e-invoice-eu/).

The blog post
[Creating E-Invoices with Free and Open Source
Software](https://www.guido-flohr.net/creating-electronic-invoices-with-free-and-open-source-software/)
or the German version [Elektronische Rechnungen mit freier und quelloffener Software erzeugen](https://www.guido-flohr.net/elektronische-rechnungen-mit-freier-und-quelloffener-software-erzeugen/)
also provides in-depth information using a gentler approach!

You can also use the documentation interactively by asking questions in
natural language. See https://gflohr.github.com/e-invoice-eu/en/docs/basics/ai-supported-documentation/
or go directly to https://notebooklm.google.com/notebook/f5783dde-ebe6-4610-bac1-f181fdf45f94.

## Validation

It is strongly recommended that you validate all incoming and outgoing e-invoices.
See [Validation](./contrib/validators) for details.

A new and very simple option is offered by the sister project to this one,
[e-invoice-eu-validator](https://github.com/gflohr/e-invoice-eu-validator).

## BUGS

### PDF/A

The Factur-X resp. ZUGFeRD standard requires PDF/A compliance for the PDF that
the invoice is wrapped in. Please search the internet if you do not know what
PDF/A means.

This library creates PDFs solely with [`pdf-lib`](https://github.com/cantoo-scribe/pdf-lib)
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

## Reporting Bugs

Please report bugs at https://github.com/gflohr/e-invoice-eu/issues.

## Copyright

Copyright (C) 2024-2025 Guido Flohr <guido.flohr@cantanea.com>, all
rights reserved.

This is free software available under the terms of the
[WTFPL](http://www.wtfpl.net/).

## Disclaimer

This free software has been written with the greatest possible care, but like
all software it may contain errors. Use at your own risk! There is no
warranty and no liability.
