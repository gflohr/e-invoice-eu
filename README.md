# EInvoice-EU

Tool-chain for generating EN16931 conforming invoices

## Status

This is work-in-progress and not yet ready to use!

## Description

This repository is an attempt to aid small businesses, especially in France and Germany but also in other parts of the European Union to create electronic invoices conforming with EN16931 with only free and open-source software.

It is quite unlikely that you can use anything here out of the box. See it as a starter template for your own solution.

## Pre-requisites

- NodeJS 20.x
- Bun (you can use npm, yarn, pnpm, ... instead if you prefer)

## Installation

```bash
$ bun install
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

### What is the Endpoint ID

The endpoint ID is mandatory for both the seller and the buyer and identifies
the address to which an invoice or a response to an invoice is delivered.
It is also mandatory to specify the scheme id.

Popular choices are:

| schemeID  | Name                   |
| --------- | ---------------------- |
| 9922-9957 | VAT Number             |
| 0088      | EAN Location Code      |
| EM        | Electronic Mail (SMTP) |

EAN Location Codes are sometimes referred to as GLN (Global Location Number).

Using VAT IDs is a safe choice. If one of the parties does not have a VAT ID,
use the email address.

## License

This is free software available under the terms of the
[WTFPL](http://www.wtfpl.net/).
