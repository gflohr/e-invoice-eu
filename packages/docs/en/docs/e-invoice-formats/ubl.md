---
title: UBL
name: ubl
section: e-invoice-formats
description: UBL stands for Universal Business Language
---
UBL is an XML syntax for many different business documents, among others
invoices and credit notes. E-Invoice-EU currently only supports invoices.

The format is well documented by Peppol at
https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/.

[% title = "Official UBL Documentation" %]
<!--qgoda-no-xgettext-->
[% WRAPPER components/infobox.html
type='warning' title=title %]
<!--/qgoda-no-xgettext-->
The current official documentation of UBL is available as an [OASIS Standards
Document](http://docs.oasis-open.org/ubl/UBL-2.1.html). But it is not very
helpful in the context of electronic invoices in the EU because the EU has
additional requirements. It is therefore recommended to use the Peppol
documentation.
<!--qgoda-no-xgettext-->
[% END %]
<!--/qgoda-no-xgettext-->

Clicking on an element name opens the documentation for the element. If the name
of an element begins with `cac:`, it has subelements. If the name starts with
`cbc:` it is the name of a leaf element.  It makes sense to get familiar with
this documentation because the Peppol UBL invoice structure is also the basis
for the internal invoice format of E-Invoice-EU.
