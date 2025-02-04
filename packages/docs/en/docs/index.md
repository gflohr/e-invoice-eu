---
location: /{lingua}/docs/index.html
title: E-Invoice-EU
name: documentation
categories: Documentation
view: docs.html
type: doc
start: 1
description: Free and open source tool chain for generating EN16931 conforming invoices (Factur-X/ZUGFeRD, UBL, CII, XRechnung) from popular spreadsheet formats or JSON.
---
<!--qgoda-no-xgettext-->
[% USE q = Qgoda %]
<!--/qgoda-no-xgettext-->

[% title = "Incomplete Translation!" %]
<!--qgoda-no-xgettext-->
[% IF asset.lingua != 'en' %]
[% WRAPPER components/infobox.html
type='warning' title=title %]
<!--/qgoda-no-xgettext-->
The translation for this site is not yet ready. The parts that are not
yet translated will be displayed in English instead.
<!--qgoda-no-xgettext-->
[% END %]
[% END %]
<!--/qgoda-no-xgettext-->

## Features

* E-Invoice generation from popular Spreadsheet formats or JSON.
* Supports all electronic invoice formats conforming to EU standard EN16931, notably Factur-X/ZUGFeRD, UBL, and CII.
* Written in TypeScript/JavaScript.
* Large parts of the code are generated from PEPPOL-UBL documentation.
* Automatic valdiation of input document structure.
* OpenAPI/Swagger API documentation included.

## About this Documentation

[% title = "Work in Progress" %]
<!--qgoda-no-xgettext-->
[% WRAPPER components/infobox.html type='warning' title=title %]
<!--/qgoda-no-xgettext-->
This documentation is work in progress. It is still incomplete and it requires
proof-reading. This warning will vanish, once the documentation is considered
sufficient and stable. In the meantime, feel free to <a href="https://github.com/gflohr/e-invoice-eu/issues">file an issue</a> if you spot an error or non-obvious omission.
<!--qgoda-no-xgettext-->
[% END %]
<!--/qgoda-no-xgettext-->

You can navigate through the documentation with the navigation in the right
sidebar. But you can also read it cover to cover by following the links at the
bottom that will take you to the next page.
