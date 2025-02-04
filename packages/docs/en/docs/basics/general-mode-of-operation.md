---
title: General Mode of Operation
name: general-mode-of-operation
section: basics
description: The software works by mapping spreadsheet data to JSON data from which the e-invoice is generated. You can also directly generate the e-invoice from JSON.
styles:
- /site/css/modal-image-popup.css
scripts:
- /site/js/modal-image-popup.js
---
<!--qgoda-no-xgettext-->
[% USE q = Qgoda %]
[% USE Srcset %]
<!--/qgoda-no-xgettext-->

[% FILTER $Srcset alt="Flowchart of E-Invoice-EU General Mode of Operation" %]/images/basics/general-mode-of-operation/flow-chart.webp[% END %] 

The software was created under the assumption that many small businesses
create their invoices with the help of spreadsheet software like
[LibreOffice](https://www.libreoffice.org/). That means that the invoice data
is already available as structured data.

All that was left to be done was to map the input spreadsheet data to elements
in the output XML of the electronic invoice. Because there are multiple
supported output XML formats, it makes sense to first map the input data
into a general [internal format]([% q.llink(name='internal-format') %]) and
then render the data into the desired output format.

The internal format chosen is largely equivalent to that of
[Peppol UBL](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/).
The advantages are:

* The documentation is browsable and relatively easy to understand.
* It is generated from data (see https://github.com/OpenPEPPOL/peppol-bis-invoice-3) that also allows generating [JSON schema](https://json-schema.org/) definitions.
* From these JSON schema definitions, it is possible to generate large parts of the code of E-Invoice-EU.

As a result, it is easy to keep the implementation up-to-date with the current
standards by Peppol.
