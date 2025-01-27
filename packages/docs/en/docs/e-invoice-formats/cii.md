---
title: CII
name: cii
section: e-invoice-formats
description: CII stands for Cross Industry Invoice.
---
<!--qgoda-no-xgettext-->
[% USE q = Qgoda %]
[% USE Srcset %]
<!--/qgoda-no-xgettext-->

The other approved XML syntax for invoices in the EU is UN/CEFACT CII (United
Nations Centre for Trade Facilitation and Electronic Business Cross Industry
Invoice).

Unlike [% q.llanchor(name='UBL') %], the scope of CII is restricted to invoices;
other document types are not supported.  But that does not mean that the format
is in any way simpler than UBL. In fact, the CII documentation is certainly
not for the faint of heart.

CII can carry an overwhelming amount of information going far beyond the
requirements of the European Standard EN16931. Currently, it is not possible
to produce these additional elements with E-Invoice-EU.

The documentation for [Factur-X](http://fnfe-mpe.org/factur-x/) and
[ZUGFeRD](https://www.ferd-net.de/en/) describe the syntacs and semantics of
CII according to these standards but using the documentation is a challenge of
its own. Since E-Invoice-EU does not require a deeper understanding of CII,
this is left as an exercise to the reader.
