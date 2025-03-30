---
title: Hybrid vs XML
name: hybrid-vs-xml
section: e-invoice-formats
description: E-Invoice-EU supports e-invoice formats that conform to the European standard EN16931.
---

<!--qgoda-no-xgettext-->

[% USE q = Qgoda %]

<!--/qgoda-no-xgettext-->

There are different approaches to distinguish e-invoice formats.

## XML Formats

Not every electronic invoice document qualifies as an e-invoice in the
sense of the European standard EN16931. They have to be XML documents using
one of the syntaxes [UBL]([% q.llink(name='ubl') %]) or [CII]([% q.llink(name='cii') %]).

[% title = "XML Syntax" %]

<!--qgoda-no-xgettext-->

[% WRAPPER components/infobox.html type='info' title=title %]

<!--/qgoda-no-xgettext-->

What is meant with syntax? A UBL and a CII invoice can contain the exact same
information. What differs is the name of the XML elements and their location in
the document object model.

<!--qgoda-no-xgettext-->

[% END %]

<!--/qgoda-no-xgettext-->

Both UBL and CII allow embedding a human-readable, normally PDF version of the
invoice to be embedded in the XML.

## Hybrid Formats (Factur-X/ZUGFeRD)

In France and Germany, the standards [Factur-X and ZUGFeRD]([% q.llink(name='factur-x-zugferd') %]) for e-invoices
have been developed. Both Factur-X and ZUGFeRD documents are actually PDF
invoice documents but they contain an equivalent XML version of the invoice as
an attachment to the PDF.

Factur-X and ZUGFeRD are nowadays identical standards. They are just different names for
the same thing. Factur-X is the official name but the term ZUGFeRD is still
prevalent in Germany.

## Takeaway

An electronic invoice is either an XML document in one of the flavours UBL and
CII or a Factur-X/ZUGFeRD PDF. If you opt for an XML version you _may_ include
a PDF version. If you go with the hybrid format Factur-X/ZUGFeRD you _must_
include an XML version of the invoice.
