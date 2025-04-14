#! /bin/sh

# = Smoke Test for E-Invoice-EU =
#
# == Prequisites ==
#
# See https://gflohr.github.io/e-invoice-eu/en/docs/details/validation/#offline-validators
# for how to install MustangProject, the KoSIT validator and the XRechnung
# validation scenarios for the KoSIT validator.
#

set -e

E_INVOICE_EU_CLI='npx tsx apps/cli/src/index.ts'
XRECHNUNG_VALIDATOR='node contrib/validators/kosit/validate.mjs'
FACTUR_X_VALIDATOR='node contrib/validators/factur-x/factur-x-validate.mjs'

EXAMPLES = \
	default-invoice \
	default-credit-node \
	default-corrected_invoice
TEMPLATE_DIR = contrib/templates
JSON_DIR = contrib/data
MAPPING = contrib/mappings/default-inoice.yaml

xrechnung_formats=`$E_INVOICE_EU_CLI format --list | grep -v Factur-X`
factur_x_formats=`$E_INVOICE_EU_CLI format --list | grep Factur-X`

## First XRechnung because it is faster.
for format in $xrechnung_formats; do
	for
done
