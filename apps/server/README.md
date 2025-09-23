<p align="center">
	<img
		src="https://raw.githubusercontent.com/gflohr/e-invoice-eu/main/assets/e-invoice-eu-logo-2.webp"
		width="256" height="256" />
</p>

[![licence](https://img.shields.io/badge/licence-WTFPL-blue)](http://www.wtfpl.net/)
[![price](https://img.shields.io/badge/price-FREE-green)](https://github.com/gflohr/qgoda/blob/main/LICENSE)
[![coverage](https://img.shields.io/coverallsCoverage/github/gflohr/e-invoice-eu?branch=main)](https://coveralls.io/github/gflohr/e-invoice-eu?branch=main)
[![downloads](https://img.shields.io/npm/dw/%40e-invoice-eu%2Fcore)](https://img.shields.io/npm/dw/%40e-invoice-eu%2Fcore)
[![documentation](https://img.shields.io/badge/documentation-read-green)](https://gflohr.github.io/e-invoice-eu)
[![help](https://img.shields.io/badge/help-ask--a--question-green)](https://notebooklm.google.com/notebook/f5783dde-ebe6-4610-bac1-f181fdf45f94)
[![stand with](https://img.shields.io/badge/stand%20with-Ukraine🇺🇦-ffc107)](https://www.standwithukraineeurope.com/en//)

# @e-invoice-eu/server

This directory contains the source code of the E-Invoice-EU web service
with a RESTful API. The service is written with [NestJS](https://nestjs.com/).

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
$ docker run -it --rm -d -p 3000:3000 --name e-invoice-eu gflohr/e-invoice-eu:latest
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
for information on how to create e-invoices with the API.

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
