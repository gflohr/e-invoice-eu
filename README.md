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

# E-Invoice-EU

Free and open source tool chain for generating EN16931 conforming invoices (Factur-X/ZUGFeRD, UBL, CII, XRechnung) from popular spreadsheet
formats or JSON.

- [E-Invoice-EU](#e-invoice-eu)
	- [Supported Formats](#supported-formats)
	- [Using the software](#using-the-software)
	- [Security](#security)
	- [Description](#description)
	- [Documentation](#documentation)
	- [Alternatives](#alternatives)
	- [Pre-requisites](#pre-requisites)
	- [Installation](#installation)
	- [Running the app](#running-the-app)
	- [Test](#test)
	- [Running in a Container](#running-in-a-container)
	- [BUGS](#bugs)
		- [Report a Bug](#report-a-bug)
		- [PDF/A](#pdfa)
	- [License](#license)
	- [Disclaimer](#disclaimer)

## Supported Formats

You can currently create invoices in these formats:

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
- `ZUGFeRD-XRechung` is an alias for `Factur-X-XRechnung`

Case does not matter, when you specify a format.

## Using the software

The only way to use the software is to run the server providing the REST
API and sending requests to the server.

This may eventually change in the future, when a commandline interface will
be added.

## Security

The service in its current state is meant to be run in a network with limited
access or behind an API gateway that prevents abuse of the service.

One simple solution is to use [`ngninx`](https://nginx.org/) as a
gateway and configure rate-limiting there. You will also want to limit
the maximum request body size.

## Description

This repository is an attempt to aid small businesses, especially in France and Germany but also in other parts of the European Union to create electronic invoices conforming with EN16931 with only free and open-source software.

It is quite unlikely that you can use anything here out of the box. See it as a starter template for your own solution.

## Documentation

See the [E-Invoice-EU online documentation](https://gflohr.github.io/e-invoice-eu/).

The blog post
[Creating E-Invoices with Free and Open Source
Software](https://www.guido-flohr.net/creating-electronic-invoices-with-free-and-open-source-software/)
or the German version [Elektronische Rechnungen mit freier und quelloffener Software erzeugen](https://www.guido-flohr.net/elektronische-rechnungen-mit-freier-und-quelloffener-software-erzeugen/)
also provides in-depth information using a gentler approach!

## Alternatives

You can achieve similar results with these projects:

- [Factur-X extension for LibreOffice](https://github.com/akretion/factur-x-libreoffice-extension)
  is a LibreOffice extension to generate Factur-X invoices from LibreOffice Calc published under the GPL licence with a [video tutorial](https://www.youtube.com/watch?v=ldD-1W8yIv0). It is maybe less flexible but easier to set up.

## Pre-requisites

- NodeJS 17 or newer (currently tested with NodeJS 18, 20, and 22)
- A package manager like bun, npm, yarn, pnpm, ...

## Installation

```bash
$ bun install
```

This may warn about "husky" missing. Just run `bun install` again in order
to fix this.

If you do not like `bun`, replace it with `npm`, `yarn`, `pnpm` or whatever
is currently hyped.

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

## Running in a Container

By far the easiest way is to run the application in a software container.

Pull the Docker image:

```sh
$ docker pull gflohr/e-invoice-eu:latest
```

Run the container:

```sh
$ docker run --rm -d -p 3000:3000 --name e-invoice-eu gflohr/e-invoice-eu:1.0.0
```

If you want to debug issues, omit the option `-d` so that you can see the
output of the application running inside of the container.

Access the application from your host computer:

```sh
$ curl http://localhost:3000/api/format/list
```

Or you can see the [OpenAPI/Swagger documentation](https://www.openapis.org/):

```bash
curl http://localhost:3000/api
```

It probably makes more sense to open that URL in the browser.

See the [documentation](http://localhost:3000/e-invoice-eu/e-invoice-eu/en/docs/service/creating-invoices/)
for information how to create e-invoices with the API.

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

## License

This is free software available under the terms of the
[WTFPL](http://www.wtfpl.net/).

## Disclaimer

This free software has been written with the greatest possible care, but like
all software it may contain errors. Use at your own risk! There is no
warranty and no liability.
