---
title: Creating Invoices
name: creating-invoices
section: service
description: You can create e-invoices either from spreadsheet data or directly from JSON.
styles:
  - /site/css/modal-image-popup.css
scripts:
  - /site/js/modal-image-popup.js
---

<!--qgoda-no-xgettext-->

[% USE q = Qgoda %]
[% USE Highlight %]
[% USE CodeGroup %]

<!--/qgoda-no-xgettext-->

The [% q.lanchor(name='general-mode-of-operation') %] is to first [map]([% q.llink(name='mapping') %])
spreadsheet data to the [internal invoice format]([% q.llink(name='internal-format') %]) in JSON and then generate an
e-invoice XML or a hybrid PDF/XML file from that JSON. But it is also
possible to bypass the first mapping step and generate the invoice directly
from JSON data.

<qgoda-toc/>

## Prerequisites

Before you start, you must have:

- A spreadsheet template. The examples assume that you use the template in `contrib/templates/default-invoice.ods`.
- A [mapping definition]([% q.llink(name='mapping') %]). The examples assume that you use the mapping file in `contrib/mappings/default-invoice.yaml`.
- [LibreOffice](https://libreoffice.org/) installed on your system (not always necessary).
- You have [started the server]([% q.llink(name='deployment') %]). The examples assume that the server is available at http://localhost:3000.
- You have changed directory to the top-level directory of the repository so that the sample files are available.
- You have set the necessary [environment variables]([% q.llink(name='deployment') %]#environment-variables).

E-Invoice-EU uses [LibreOffice](https://libreoffice.org/) in headless mode to
create PDFs from spreadsheet files. If you do not use this feature, there is no
need for LibreOffice. Alternatively, you can always provide a PDF file from
other sources instead of generating it from spreadsheet data.

## Creating Invoices from Spreadsheet Data

The API endpoint for this functionality is
`/api/invoice/create/:FORMAT`.

[% title = "The endpoint /invoice/transform-and-create is deprecated!" %]

<!--qgoda-no-xgettext-->

[% WRAPPER components/infobox.html
type='warning' title=title %]

<!--/qgoda-no-xgettext-->

As of version 1.4.3, the endpoint <code>/invoice/transform-and-create</code>
is deprecated. It will be removed in the next major version 2.x.x of the
software. All you have to do is to replace
<code>/invoice/transform-and-create</code> with
<code>/invoice/create</code>. The parameters are the same.

<!--qgoda-no-xgettext-->

[% END %]

<!--/qgoda-no-xgettext-->

### Basic E-invoice

In its most simple form, you can create an e-invoice from the spreadsheet data
like this:

<!--qgoda-no-xgettext-->

[% FILTER $CodeGroup %]

[curl]
[% FILTER $Highlight "language-sh" %]
curl -X POST http://localhost:3000/api/invoice/create/UBL \
 -F data=@contrib/templates/default-invoice.ods \
 -F mapping=@contrib/mappings/default-invoice.yaml
[% END %]

[httpie]
[% FILTER $Highlight "language-sh" %]
http --form POST http://localhost:3000/api/invoice/create/UBL \
 data@contrib/templates/default-invoice.ods \
 mapping@contrib/mappings/default-invoice.yaml
[% END %]

[% END %]

<!--/qgoda-no-xgettext-->

The format is a path parameter that is specified after the endpoint path
`api/invoice/create`, in this case `UBL`. The format is
case-insensitive.

The invoice data (parameter `data`) is read from the spreadsheet file
`contrib/templates/default-invoice.ods`. That spreadsheet data is then
[mapped]([% q.llink(name='mapping') %]) (parameter `mapping`) with the mapping definition
`contrib/mappings/default-invoice.yaml`.

### E-Invoice with Additional Attachments

It is possible to attach files with additional information. This works
both for pure XML formats and for hybrid Factur-X/ZUGFeRD e-invoices. The
example creates a Factur-X Extended invoice with two attachments:

<!--qgoda-no-xgettext-->

[% FILTER $CodeGroup %]

[curl]
[% FILTER $Highlight "language-sh" %]
curl -X POST \
 http://localhost:3000/api/invoice/create/UBL \
 -F lang=de \
 -F data=@contrib/templates/default-invoice.ods \
 -F mapping=@contrib/mappings/default-invoice.yaml \
 -F embedPDF=1 \
 -F pdf=@invoice.pdf \
 -F pdfID=1234567890 \
 -F pdfDescription="Invoice as PDF." \
 -F "attachment=@time-sheet.ods;type=application/vnd.oasis.opendocument.spreadsheet" \
 -F "attachmentID=abc-123-xyz" \
 -F attachmentDescription="Detailed description of hours spent." \
 -F attachment=@payment-terms.pdf \
 -F attachmentDescription="Our payment terms"
[% END %]

[httpie]
[% FILTER $Highlight "language-sh" %]
http --form POST http://localhost:3000/api/invoice/create/UBL \
 lang=de \
 data@contrib/templates/default-invoice.ods \
 mapping@contrib/mappings/default-invoice.yaml \
 embedPDF=1 \
 pdf@invoice.pdf \
 pdfID=1234567890 \
 pdfDescription="Invoice as PDF." \
 attachment@time-sheet.ods\;type=application/vnd.oasis.opendocument.spreadsheet \
 attachmentID=abc-123-xyz \
 attachmentDescription="Detailed description of hours spent." \
 attachment@payment-terms.pdf \
 attachmentDescription="Our payment terms"
[% END %]

[% END %]

<!--/qgoda-no-xgettext-->

Let us break that down into the individual URL parameters sent:

- `lang`: This is used to determine the language for some canned texts.
- `data`: The spreadsheet with the invoice data.
- `mapping`: The [mapping definition]([% q.llink(name='mapping') %]) for the invoice data.
- `embedPDF`: Embed a PDF version of the e-invoice in the XML; ignored for Factur-X/ZUGFeRD.
- `pdf`: The PDF version of the e-invoice. If embedding a PDF was requested but the parameter `pdf` is missing, the PDF is generated from the spreadsheet file (parameter `data`).
- `pdfID`: The attachment id of the embedded PDF, defaults to the filename.
- `pdfDescription`: An optional description of that attachment.
- `attachment`: Optionally, an additional file to be embedded.
- `attachmentID`: Optionally, the id of the attachment, defaults to the filename.
- `attachmentDescription`: An optional description of the attachment.

[% title = "Generate PDF From Spreadsheet Data" %]

<!--qgoda-no-xgettext-->

[% WRAPPER components/infobox.html type='warning' title=title %]

<!--/qgoda-no-xgettext-->

If the PDF is not provided with the parameter <code>pdf</code>, it is generated from
the spreadsheet file (parameter <code>data</code>). In that case you must
ensure that the LibreOffice executable is found. It must be either in your
<code>$PATH</code> or you have <a
href="[% q.llink(name='deployment') %]#libre_office-code">configured its
location</a>.

<!--qgoda-no-xgettext-->

[% END %]

<!--/qgoda-no-xgettext-->

Each attachment to the e-invoice may have an optional id and an optional
description. However, the service only "sees" 3 lists of the URL parameters
`attachment`, `attachmentID`, and `attachmentDescription`, even if you
group them per attachment.

If you use the parameter `attachment` four times, `attachmentID` twice,
and `attachmentDescription` three times, in whatever order, the following
attachments are embedded:

| Attachment        | Filename        | ID                | Description                |
| ----------------- | --------------- | ----------------- | -------------------------- |
| **Attachment #1** | `attachment` #1 | `attachmentID #1` | `attachmentDescription #1` |
| **Attachment #2** | `attachment` #2 | `attachmentID #2` | `attachmentDescription #2` |
| **Attachment #3** | `attachment` #3 | -                 | `attachmentDescription #3` |
| **Attachment #4** | `attachment` #4 | -                 | -                          |

You will probably want to avoid that hassle by specifying an id and/or
description either for all attachments or for none.

## Factur-X/ZUGFeRD Example

There is nothing special about creating Factur-X/ZUGFeRD, only that the output
is binary and you want to redirect it to a file.

<!--qgoda-no-xgettext-->

[% FILTER $CodeGroup %]

[curl]
[% FILTER $Highlight "language-sh" %]
curl -X POST http://localhost:3000/api/invoice/create/Factur-X-Extended \
 -F data=@contrib/templates/default-invoice.ods \
 -F mapping=@contrib/mappings/default-invoice.yaml \
 --output e-invoice.pdf
[% END %]

[httpie]
[% FILTER $Highlight "language-sh" %]
http --form POST http://localhost:3000/api/invoice/create/Factur-X-Extended \
 data@contrib/templates/default-invoice.ods \
 mapping@contrib/mappings/default-invoice.yaml \
 --output e-invoice.pdf
[% END %]

[% END %]

<!--/qgoda-no-xgettext-->

This would create a Factur-X/ZUGFeRD e-invoice with the profile
_Extended_.

You must also keep in mind that the hybrid Factur-X/ZUGFeRD format _requires_
a PDF version of the input. You must either specify it yourself with the
parameter `pdf` or `LibreOffice` must be available so that it can be generated
from the spreadsheet file `data`.

[% title = "Do Not Redirect Standard Output on Windows!" %]

<!--qgoda-no-xgettext-->

[% WRAPPER components/infobox.html
type='warning' title=title %]

<!--/qgoda-no-xgettext-->

Depending on what shell you are using, redirecting standard output messes
up the generated PDF. More precisely, it converts all newline characters
(`LF`) to `CRLF` which corrupts the binary file. It also encodes it as
UTF-16-LE, a 2-byte character encoding, which is again wrong for binary
files. You can avoid that by using the option `-o` resp. `--output`. See
<a href="https://github.com/gflohr/e-invoice-eu/issues/96#issuecomment-2708171823">
https://github.com/gflohr/e-invoice-eu/issues/96#issuecomment-2708171823
</a>
for more information!

<!--qgoda-no-xgettext-->

[% END %]

<!--/qgoda-no-xgettext-->

## Creating Invoices from JSON

You can bypass the [mapping step]([% q.llink(name='mapping') %]) and generate
the invoice directly from JSON. All you have to do is to omit the parameter
`mapping`.

Example:

<!--qgoda-no-xgettext-->

[% FILTER $CodeGroup %]

[curl]
[% FILTER $Highlight "language-sh" %]
curl -X POST http://localhost:3000/api/invoice/create/UBL \
 -F invoice=@contrib/data/default-invoice.json
[% END %]

[httpie]
[% FILTER $Highlight "language-sh" %]
http --form POST http://localhost:3000/api/invoice/create/UBL \
 invoice@contrib/data/default-invoice.json
[% END %]

[% END %]

<!--/qgoda-no-xgettext-->

In this case, a Peppol UBL invoice is created.

This endpoint allows the exact same URL parameters as the [endpoint for
creating invoices from spreadsheet
data](#e-invoice-with-additional-attachments) except for the parameter
`mapping` which makes no sense.

## Create JSON Data from Spreadsheet Data

You can also create invoice data in the [internal format]([% q.llink(name='internal-format') %]) from a spreadsheet
file with the endpoint `/api/mapping/transform/:format`. This is probably
only useful for informational purposes because JSON is not an allowed format
for e-invoices.

Example:

<!--qgoda-no-xgettext-->

[% FILTER $CodeGroup %]

[curl]
[% FILTER $Highlight "language-sh" %]
curl -X POST http://localhost:3000/api/mapping/transform/UBL \
 -F data=@contrib/templates/default-invoice.ods \
 -F mapping=@contrib/mappings/default-invoice.yaml
[% END %]

[httpie]
[% FILTER $Highlight "language-sh" %]
http --form POST http://localhost:3000/api/mapping/transform/UBL \
 data@contrib/templates/default-invoice.ods \
 mapping@contrib/mappings/default-invoice.yaml
[% END %]

[% END %]

<!--/qgoda-no-xgettext-->

This endpoint only supports two URL parameters:

- `data`: The spreadsheet with the invoice data.
- `mapping`: The [mapping definition]([% q.llink(name='mapping') %]) for the invoice data.

[% title = "Why is the Format Needed?" %]

<!--qgoda-no-xgettext-->

[% WRAPPER components/infobox.html type='info' title=title %]

<!--/qgoda-no-xgettext-->

This endpoint [maps]([% q.llink(name='mapping') %]) data from a spreadsheet file into the [internal format]([% q.llink(name='internal-format') %]) which
is supposed to be independent of the output format. Still, you have to supply
the format because the transformation also inserts the default customization id
in the field `/ubl:Invoice/cbc:customizationID`. If the customization ID is
supplied in the spreadsheet data, you can pass an arbitrary format because
an explicitly specified customization ID is never overwritten.

<!--qgoda-no-xgettext-->

[% END %]

<!--/qgoda-no-xgettext-->
