---
title: Factur-X/ZUGFeRD
name: factur-x-zugferd
section: e-invoice-formats
description: Factur-X/ZUGFeRD invoices are special PDF documents with machine-readable invoice information attached as XML.
---

<!--qgoda-no-xgettext-->

[% USE q = Qgoda %]
[% USE Srcset %]

<!--/qgoda-no-xgettext-->

France and Germany have developed a different approach to e-invoicing with
their respective standards Factur-X and ZUGFeRD. Beginning with version 2.1,
the two standards are now identical.

## PDF Attachments

While the pure XML formats [% q.lanchor(name='ubl') %] and
[% q.lanchor(name='cii') %] can _optionally_ embed a PDF version of an
invoice, Factur-X/ZUGFeRD goes the opposite way. They are special PDFs with
a machine-readable XML version of the invoice added to the PDF as an
attachment.

The ability to attach arbitrary documents to a PDF is one of the lesser
known features of the Portable Document Format PDF and most PDF viewers do not
allow you to see attachments to PDFs. However, Adobe Acrobat Reader has this
feature.

[% FILTER $Srcset alt="PDF Attachments in Adobe Acrobat Reader" %]/images/basics/e-invoice-formats/pdf-attachments-in-acrobat-reader.webp[% END %]

The functionality is hidden behind a paperclip icon at the right side of the
window. Clicking it reveals the list of attachments to the document. In this
case, not only the XML invoice file but an additional file for informational
purposes is attached, too.

## CII is Mandatory for Factur-X/ZUGFeRD

Unfortunately, Factur-X/ZUGFeRD does not leave a choice between
[% q.lanchor(name='ubl') %] and [% q.lanchor(name='cii') %]. CII is
the mandatory syntax for the embedded XML.

## PDF/A

But even with the attached XML file, a PDF does not automatically qualify as
a valid electronic invoice. A PDF file may look different on different devices.
For example it may not embed all fonts used but reference a font that is
expected to be installed on the particular device. If the font is missing, a
replacement font is chosen by the renderer.

If a PDF fulfills the PDF/A standard, all fonts must be embedded and also a
couple of other requirements have to be fulfilled so that it is guaranteed that
the PDF will look exactly the same on every device, even in the future, so that
the documents are _revision-safe_.

Validating Factur-X/ZUGFeRD Invoices therefore involves two steps. First,
compliance with the PDF/A standard is checked. Second, the attached XML
undergoes the normal checks as pure XML documents.

[% title = "PDF/A Extension Schema!" %]

<!--qgoda-no-xgettext-->

[% WRAPPER components/infobox.html type='info' title=title %]

<!--/qgoda-no-xgettext-->

In fact, a third check is required. PDFs contain meta information in the
Extensible Metadata Platform XMP format, and that meta data has to contain
certain extra information for Factur-X/ZUGFeRD.

<!--qgoda-no-xgettext-->

[% END %]

<!--/qgoda-no-xgettext-->

## Profiles (Conformance Levels)

The standard allows for 6 different conformance levels called profiles:

- Minimum
- Basic WL
- Basic
- EN 16931 (formerly known as Comfort)
- Extended
- XRechnung

Each profile restricts the number of allowed CII elements to a certain
subset. "Minimum" is the smallest subset and "Extended" the largest.
The profile "XRechnung" seems to allow the full range of CII elements although
the documentation is not clear about that.

The profiles "Minimum" and "Basic WL" do not contain enough information for
a valid invoice according to VAT legislation but are considered
_accounting aids_.

[% title = "Purpose of Profiles" %]

<!--qgoda-no-xgettext-->

[% WRAPPER components/infobox.html type='info' title=title %]

<!--/qgoda-no-xgettext-->

When a data format allows optional information, the common approach in the
software industry is to recommend that readers of the data should simply
ignore those parts that are not relevant for a particular application. The
strategy chosen by Factur-X/ZUGFeRD, however, makes things unnecessarily complicated.

<!--qgoda-no-xgettext-->

[% END %]

<!--/qgoda-no-xgettext-->

## Discrepancies Between PDF and XML

Factur-X/ZUGFeRD invoices look like regular PDFs and recipients may not even
know that the documents contain an XML version of it. The German
ministry of Finance stipulates that the PDF and XML versions must be
content-identical counterparts (German: _inhaltsgleiche Mehrstücke_). It is
still unclear how courts will assess any discrepancies between the two
versions.

## Documentation

You can download the documentation for Factur-X from
https://fnfe-mpe.org/factur-x/factur-x_en/. The docs for the German counterpart
ZUGFeRD are available from https://www.ferd-net.de/. You have to enter a
valid e-mail address in order to be able to download the documentation. The
exact links frequently change but can easily be found with a search engine.

[% title = "Quality of the Documentation" %]

<!--qgoda-no-xgettext-->

[% WRAPPER components/infobox.html type='info' title=title %]

<!--/qgoda-no-xgettext-->

Although Factur-X and ZUGFeRD are now identical standards, there is both a
French and German version of the documentation with different structure. The structure of the
documentation fundamentally changes with every release and occasionally even
contains garbage like <code>.DS_Store</code> files from the Mac where stuff
has been zipped.

<!--qgoda-no-xgettext-->

[% END %]

<!--/qgoda-no-xgettext-->
