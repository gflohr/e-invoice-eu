---
title: The Command "transform"
name: command-transform
section: cli
description: You can map spreadsheet data to the internal data format of E-Invoice-EU.
---
<!--qgoda-no-xgettext-->
[% USE q = Qgoda %]
[% USE Highlight %]
<!--/qgoda-no-xgettext-->

## Create JSON Data from Spreadsheet Data

You can also create invoice data in the [internal format]([% q.llink(name='internal-format') %]) from a spreadsheet
file with the command `transform`. This is probably
only useful for informational purposes because JSON is not an allowed format
for e-invoices.

Example:

<!--qgoda-no-xgettext-->
[% FILTER $Highlight "language-sh" %]
e-invoice-eu --format=UBL \
        --data=contrib/templates/default-invoice.ods \
        --mappingcontrib/mappings/default-invoice.yaml
[% END %]
<!--/qgoda-no-xgettext-->

This endpoint only supports three options:

- `--data`: The spreadsheet with the invoice data.
- `--mapping`: The [mapping definition]([% q.llink(name='mapping') %]) for the invoice data.
- `--output`: An optional output file. If not present, the output is written to standard output.

[% title = "Why is the Format Needed?" %]

<!--qgoda-no-xgettext-->
[% WRAPPER components/infobox.html type='info' title=title %]
<!--/qgoda-no-xgettext-->

The command [maps]([% q.llink(name='mapping') %]) data from a spreadsheet file into the [internal format]([% q.llink(name='internal-format') %]) which
is supposed to be independent of the output format. Still, you have to supply
the format because the transformation also inserts the default customization id
in the field `/ubl:Invoice/cbc:customizationID`. If the customization ID is
supplied in the spreadsheet data, you can pass an arbitrary format because
an explicitly specified customization ID is never overwritten.
<!--qgoda-no-xgettext-->
[% END %]
<!--/qgoda-no-xgettext-->
