---
title: Credit Notes
name: credit-notes
section: details
description: Credit notes and corrected invoices are reversed invoices with a different document type code. Otherwise, there is nothing special about them.
---
<!--qgoda-no-xgettext-->
[% USE q = Qgoda %]
<!--/qgoda-no-xgettext-->

Sometimes invoices have to be corrected or invalidated altogether. The
documents that have to be issued for that purpose are called credit notes,
invoice corrections or corrected invoices.

## Document Type Code

As far as E-Invoice-EU is concerned, there is nothing special about such
invoices. They simply have a different [invoice type
code](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cbc-InvoiceTypeCode/):

- 381 for credit notes
- 384 for corrected invoices

For practical purposes, these two are synonyms (although accountants will maybe
disagree on that). The UBL standard prefers 381, for CII the preferred code
is 384.

## Reverse Quantities, Discount/Charge Rates, and Amounts of Money

If you use a negative quantity for the line items, all amounts of money that
are calculated from that will become negative. For allowances and charges,
you have to either use a negative percentage (for example "-3 %" instead of
"3 %") or if you have specified them as an absolute value, you have to negate
that value.

The resulting invoice should look like the original invoice with all quantities
and amounts of money multiplied by -1.

## UBL CreditNote

The standard CII only supports invoices.

Unlike CII, UBL supports two distinct document types
[`ubl:Invoice`](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/tree/)
and
[`ubl:CreditNote`](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-creditnote/tree/).
The schema for the latter is alomost identical to `Invoice` with these
exceptions:

- The root element is [`ubl:CreditNote`](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-creditnote/tree/), not [`ubl:Invoice`](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/tree/).
- The code lists for the document type code differ.
- Most element name that begin with `cac:Invoice` or `cbc:Invoice` begin with `cac:CreditNote` resp. `cbc:CreditNote` instead.

As a user of E-Invoice-EU, you do not have to care about that. The software
translates the element names automatically depending on the document type.

[% title = "Element Names" %]
<!--qgoda-no-xgettext-->
[% WRAPPER components/infobox.html type='info' title=title %]
<!--/qgoda-no-xgettext-->
Even if the UBL output generated by E-Invoice-EU is a <code>CreditNote</code>
and not an <code>Invoice</code>, the element names in the input should not
change. You still have to use <code>Invoice</code> everywhere, whether
the input data comes from a [% q.lanchor(name='mapping') %] or from data in the
[% q.lanchor(name='internal-format') %]. If there is demand for it, this may
change in the future and you can optionally use the `CreditNote` namespace
instead.
<!--qgoda-no-xgettext-->
[% END %]
<!--/qgoda-no-xgettext-->
