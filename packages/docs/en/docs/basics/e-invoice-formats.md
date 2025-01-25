---
title: E-Invoice Formats
name: e-invoice-formats
section: Basics
description: E-Invoice-EU supports e-invoice formats that conform to the European Standard EN16931.
---
<!--qgoda-no-xgettext-->
[% USE q = Qgoda %]
[% USE Srcset %]
<!--/qgoda-no-xgettext-->

There are different approaches to distinguish e-invoice formats.

## Hybrid Formats (Factur-X/ZUGFeRD) vs. XML Formats

Electronic invoices initially were XML documents. In France and Germany,
the standards Factur-X and ZUGFeRD have been developed. Both Factur-X and
ZUGFeRD documents are actually PDF invoice documents but they contain an
equivalent XML version of the invoice as an attachment.

Factur-X and ZUGFeRD are nowadays identical. They are just different names for
the same thing. Factur-X is the official name but the term ZUGFeRD is still
prevalent in Germany.

### PDF Attachments

The ability to attach arbitrary documents to a PDF is one of the lesser
known features of the Portable Document Format PDF and most PDF viewers do not
allow you to see attachments to PDFs. However, Adobe Acrobat Reader has this
feature.

[% FILTER $Srcset alt="PDF Attachments in Adobe Acrobat Reader" %]/images/basics/e-invoice-formats/pdf-attachments-in-acrobat-reader.webp[% END %]

The functionality is hidden behind a paperclip icon at the right side of the window. Clicking it reveals the list of attachments to the document. In this case, not only the XML invoice file but an additional file for informational purposes is attached, too.

### PDF/A

But even with the attached XML file, a PDF does not automatically qualify as
a valid electronic invoice. A PDF file may look different on different devices.
For example it may not embed all fonts used but reference a font that is
expected to be installed on the particular device. If the font is missing, a
replacement font is chosen by the renderer.

If a PDF fulfills the PDF/A standard, all fonts must be embedded and also a
couple of other requirements have to be fulfilled so that it is guaranteed that
the PDF will look exactly the same on every device, even in the future, so that
the documents are *revision-safe*.

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

## UBL vs CII Documents

Although a PDF is an electronic document and to a certain extent
machine-readable it is not considered an electronic invoice. The same holds
true for text processor spreadsheet documents. The European standard EN16931
requires e-invoices to be XML Documents in one of the syntaxes
UBL (Universal Business Language) or CII (Cross Industry Invoices).

[% title = "XML Syntax" %]
<!--qgoda-no-xgettext-->
[% WRAPPER components/infobox.html type='info' title=title %]
<!--/qgoda-no-xgettext-->
What is meant with syntax? A UBL and a CII invoice can contain the exact same
information. What differs is the name of the XML element and its location in
the document object model. 
<!--qgoda-no-xgettext-->
[% END %]
<!--/qgoda-no-xgettext-->

[% title = "Embedding a PDF Invoice in XML?" %]
<!--qgoda-no-xgettext-->
[% WRAPPER components/infobox.html type='info' title=title %]
<!--/qgoda-no-xgettext-->
For Factur-X/ZUGFeRD, the machine-readable XML version of the document is
embedded in the PDF invoice document. But both UBL and CII optionally allow
embedding a PDF version in the XML, exactly the other way around.
<!--qgoda-no-xgettext-->
[% END %]
<!--/qgoda-no-xgettext-->

### UBL (Universal Business Language)

UBL is an XML syntax for many different business documents, among others
invoices and credit notes. E-Invoice-EU currently only supports invoices.

### CII (Cross Industry Invoice)

CII only supports invoices but allows a lot more information to be included in
the invoice than UBL does. However, E-Invoice-EU currently only supports the
subset of CII that has equivalents in UBL invoices.

## Takeaway

An electronic invoice is either an XML document in one of the flavours UBL and
CII or a Factur-X/ZUGFeRD PDF. If you opt for an XML element you *may* include
a PDF version. If you go with the hybrid format Factur-X/ZUGFeRD you *must*
include an XML version of the invoice.
