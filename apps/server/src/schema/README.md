# EInvoice EU Schemas

This directory contains the required JSON schemas.

## `ubl-invoice.schema.json`

A JSON Schema for UBL invoice documents. It is generated from the Peppol
XML definitions.

It requires the JSON Schema version 2019/09. That means that you have to
pass the option `--spec=draft2019` to the `ajv` binary:

```shell
$ npx ajv validate --spec=draft2019 -s src/schema/ubl-invoice.schema.json \
	-d contrib/examples/xrechnung-ubl.json
```

All known formal constraints (read regular expressions/patterns) are included
but business rule checking is not part of the schema.

That has some surprising consequences. For example, the supplier postal
address is mandatory
(see https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-AccountingCustomerParty/cac-Party/cac-PostalAddress/)
but has only one mandatory field `cac:Country`.
