---
title: The Command "invoice"
name: command-invoice
section: cli
description: The command <code>invoice</code> is used for creating e-invoices from either spreadsheet data or JSON.
styles:
  - /site/css/modal-image-popup.css
scripts:
  - /site/js/modal-image-popup.js
---
<!--qgoda-no-xgettext-->
[% USE q = Qgoda %]
[% USE Highlight %]
<!--/qgoda-no-xgettext-->

The [% q.lanchor(name='general-mode-of-operation') %] is to first [map]([% q.llink(name='mapping') %])
spreadsheet data to the [internal invoice format]([% q.llink(name='internal-format') %]) in JSON and then generate an
e-invoice XML or a hybrid PDF/XML file from that JSON. But it is also
possible to bypass the first mapping step and generate the invoice directly
from JSON data.

<qgoda-toc/>

## Prerequisites

What you need exactly, depends on the desired output format and your exact
requirements. Please see the [overview of required
arguments]([% q.llink(name='faq') %]#which-arguments-parameters-are-needed-for-which-use-case) in the section
[% q.lanchor(name='faq') %] for details.

You need one or more of the following:

- A spreadsheet template. The examples assume that you use the template in `contrib/templates/default-invoice.ods`.
- A [mapping definition]([% q.llink(name='mapping') %]). The examples assume that you use the mapping file in `contrib/mappings/default-invoice.yaml`.
- [LibreOffice](https://libreoffice.org/) installed on your system (not always necessary).
- You have [started the server]([% q.llink(name='deployment') %]). The examples assume that the server is available at http://localhost:3000.
- You have changed directory to the top-level directory of the repository so that the sample files are available.

E-Invoice-EU uses [LibreOffice](https://libreoffice.org/) in headless mode to
create PDFs from spreadsheet files. If you do not use this feature, there is no
need for LibreOffice. Alternatively, you can always provide a PDF file from
other sources instead of generating it from spreadsheet data.

## Overview of Options and Arguments

The command `invoice` supports the following options:

| Name              | Argument | Description                                                                                   |
| ----------------- | -------- | --------------------------------------------------------------------------------------------- |
| -f, --format      | `string` | a [supported format](https://gflohr.github.io/e-invoice-eu/en/docs/basics/supported-formats/) |
| -o, --output      | `string` | write output to specified file instead of standard output                                     |
| -i, --invoice     | `string` | JSON file with invoice data, mandatory for invoice generation from JSON                       |
| -m, --mapping     | `string` | YAML or JSON file with mapping, mandatory for invoice generation from spreadsheet data        |
| -d, --data        | `string` | invoice spreadsheet file, mandataory for invoice generation from spreadsheet data             |
| -l, --lang        | `string` | a language identifier like `fr-fr`                                                            |
| --embedPDF        |          | use if a PDF version should be embedded into XML output                                       |
| -p, --pdf         | `string` | a PDF version of the invoice                                                                  |
| --pdf-id          | `string` | ID of the embedded PDF, defaults to the document number; ignored for Factur-X/ZUGFeRD         |
| --pdf-description | `string` | optional description of the embedded PDF; ignored for Factur-X/ZUGFeRD                        |
| -a, --attachment  | `string` | optional name of an additional attachment                                                     |
| --attachment-id   | `string` |

## Creating Invoices from Spreadsheet Data

### Basic E-invoice

In its most simple form, you can create an e-invoice from spreadsheet data
like this:

<!--qgoda-no-xgettext-->
[% FILTER $Highlight "language-sh" %]
e-invoice-eu --format=UBL \
        --data=contrib/templates/default-invoice.ods \
        --mapping=contrib/mappings/default-invoice.yaml
[% END %]
<!--/qgoda-no-xgettext-->

This will create an e-invoice in the format UBL.

The invoice data (option `data`) is read from the spreadsheet file
`contrib/templates/default-invoice.ods`. That spreadsheet data is then
[mapped]([% q.llink(name='mapping') %]) (parameter `mapping`) with the mapping definition
`contrib/mappings/default-invoice.yaml`.

### E-Invoice with Additional Attachments

It is possible to attach files with additional information. This works
both for pure XML formats and for hybrid Factur-X/ZUGFeRD e-invoices. The
example creates a Factur-X Extended invoice with three attachments:

<!--qgoda-no-xgettext-->
[% FILTER $Highlight "language-sh" %]
e-invoice-eu --format=UBL
        --lang=de \
        --data=contrib/templates/default-invoice.ods \
        --mapping=@contrib/mappings/default-invoice.yaml \
        --embedPDF \
        --pdf=@invoice.pdf \
        --pdf-id=1234567890 \
        --pdf-description="Invoice as PDF." \
        --attachment=time-sheet.ods \
				--attachment-mimetype=application/vnd.oasis.opendocument.spreadsheet \
        --attachment-d=abc-123-xyz \
        --attachment-description="Detailed description of hours spent." \
        --attachment=payment-terms.pdf \
        --attachment-description="Our payment terms."
[% END %]
<!--/qgoda-no-xgettext-->

Let us break that down into the individual options used:

- <!--qgoda-no-xgettext-->`--lang`<!--/qgoda-no-xgettext-->: This is used to determine the language for some canned texts.
- <!--qgoda-no-xgettext-->`--data`<!--/qgoda-no-xgettext-->: The spreadsheet with the invoice data.
- <!--qgoda-no-xgettext-->`--mapping`<!--/qgoda-no-xgettext-->: The [mapping definition]([% q.llink(name='mapping') %]) for the invoice data.
- <!--qgoda-no-xgettext-->`--embedPDF`<!--/qgoda-no-xgettext-->: Embed a PDF version of the e-invoice in the XML; ignored for Factur-X/ZUGFeRD.
- <!--qgoda-no-xgettext-->`--pdf`<!--/qgoda-no-xgettext-->: The PDF version of the e-invoice. If embedding a PDF was requested but the parameter `pdf` is missing, the PDF is generated from the spreadsheet file (parameter `data`).
- <!--qgoda-no-xgettext-->`--pdf-id`<!--/qgoda-no-xgettext-->: The attachment id of the embedded PDF, defaults to the filename.
- <!--qgoda-no-xgettext-->`pdf-description`<!--/qgoda-no-xgettext-->: An optional description of that attachment.
- <!--qgoda-no-xgettext-->`--attachment`<!--/qgoda-no-xgettext-->: Optionally, an additional file to be embedded.
- <!--qgoda-no-xgettext-->`--attachment-mimetype`<!--/qgoda-no-xgettext-->: Optionally, the MIME type of the file to be embedded if it not guessed correctly.
- <!--qgoda-no-xgettext-->`--attachment-id`<!--/qgoda-no-xgettext-->: Optionally, the id of the attachment, defaults to the filename.
- <!--qgoda-no-xgettext-->`--attachment-description`<!--/qgoda-no-xgettext-->: An optional description of the attachment.

The last group of arguments `--attachment` is passed twice for two additional
attachments. Because the second group omits the option
`--attachment-description` that attachment does not have a description.

[% title = "Generate PDF From Spreadsheet Data" %]

<!--qgoda-no-xgettext-->
[% WRAPPER components/infobox.html type='warning' title=title %]
<!--/qgoda-no-xgettext-->
If the PDF is not provided with the option <code>--pdf</code>, it is generated from
the spreadsheet file (optoin <code>--data</code>). In that case you must
ensure that the LibreOffice executable is found. The program tries to guess
the correct location. If that fails, it must be either in your
<code>$PATH</code> or you have <a
href="[% q.llink(name='deployment') %]#libre_office-code">configured its
location</a>.
<!--qgoda-no-xgettext-->
[% END %]
<!--/qgoda-no-xgettext-->

Each attachment to the e-invoice may have an optional id and an optional
description. However, the program only "sees" 3 lists of the options
`--attachment`, `--attachment-mimetype`, `--attachment-id`, and
`attachment-description`, even if you group them per attachment.

If you use the option `--attachment` four times, `--attachment-id` twice,
and `attachment-description` three times, in whatever order, the following
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
is binary and you want to redirect it to a file or use the option `--output`.

<!--qgoda-no-xgettext-->
[% FILTER $Highlight "language-sh" %]
e-invoice-eu --format=Factur-X-Extended \
 --data=contrib/templates/default-invoice.ods \
 --mapping=@contrib/mappings/default-invoice.yaml \
 --output e-invoice.pdf
[% END %]
<!--/qgoda-no-xgettext-->

This would create a Factur-X/ZUGFeRD e-invoice with the profile
_Extended_.

You must also keep in mind that the hybrid Factur-X/ZUGFeRD format _requires_
a PDF version of the input. You must either specify it yourself with the
option `--pdf` or `LibreOffice` must be available so that it can be generated
from the spreadsheet file specified as an argument to `--data`.

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
[% FILTER $Highlight "language-sh" %]
e-invoice-eu --forma=UBL --invoice=contrib/data/default-invoice.json
[% END %]
<!--/qgoda-no-xgettext-->

In this case, a Peppol UBL invoice is created.

You can create all other options and arguments that are allowed for the
generation of invoices from spreadsheet data with the exception of `--mapping`
which makes no sense.
