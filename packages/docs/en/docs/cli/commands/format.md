---
title: The Command "format"
name: command-format
section: cli
description: You can get a list of all supported e-invoice output formats of E-Invoice-EU or information about a particular output format with the command <code>format</code>.
---
<!--qgoda-no-xgettext-->
[% USE q = Qgoda %]
[% USE Highlight %]
<!--/qgoda-no-xgettext-->

## List Formats

You can get a list of the supported formats with the option `--list`.

<!--qgoda-no-xgettext-->
[% FILTER $Highlight "language-sh" %]
e-invoice-eu format --list
[% END %]
<!--/qgoda-no-xgettext-->

It prints a list of format identifiers on standard output.

## Information About a Format

To receive extended information about a particular format, use the option
`--info` with the name of the format as an argument (case does not matter):

<!--qgoda-no-xgettext-->
[% FILTER $Highlight "language-sh" %]
e-invoice-eu format --info=Factur-X-Extended:
[% END %]
<!--/qgoda-no-xgettext-->

The output looks like this:

<!--qgoda-no-xgettext-->
[% FILTER $Highlight "language-sh" %]
name: Factur-X-Extended
syntax: CII
mimeType: application/pdf
customizationID: urn:cen.eu:en16931:2017#conformant#urn:factur-x.eu:1p0:extended
profileID: urn:fdc:peppol.eu:2017:poacc:billing:01:1.0
[% END %]
