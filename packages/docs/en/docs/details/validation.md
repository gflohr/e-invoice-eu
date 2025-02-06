---
title: Validation
name: validation
section: details
description: Validating an e-invoice ensures that it adheres to the European standard EN16931. A number of options exist for this task.
---
<!--qgoda-no-xgettext-->
[% USE q = Qgoda %]
[% USE Highlight %]
<!--/qgoda-no-xgettext-->

<qgoda-toc/>

## Syntax and Semantics

Electronic invoices must have a certain structure that is determined by the
syntax chosen, either [% q.lanchor(name='ubl') %] or
[% q.lanchor(name='cii') %]. The syntax specifies which elements must exist
and where they are located in the syntax tree.

[% title = 'Order of Invoice Fields' %]
<!--qgoda-no-xgettext-->
[% WRAPPER components/infobox.html type='info' title=title %]
<!--/qgoda-no-xgettext-->
The XML standards also specify the exact order of elements. Fortunately,
E-Invoice-EU automatically sorts its output so that you don't have to bother
about the order of your input data, no matter whether it comes from a
spreadsheet via a <a href="[% q.llink(name='mapping') %]">Mapping</a> or
directly from JSON in the <a
href="[% q.llink(name='internal-format') %]">internal invoice format</a>
<!--qgoda-no-xgettext-->
[% END %]
<!--/qgoda-no-xgettext-->

The correct syntax is ensured by E-Invoice-EU. It validates the input data
against the respective [schema]([% q.llink(name='other-endpoints') %]#schemas)
which ensures that the input is syntactically correct.

The schema also contain the code lists so that you can be sure that wherever
applicable only allowed values are used. Likewise, number and date
formats are checked.

## Business Rules

But there are also semantic requirements called *business rules*. An example
for such a rule is that if the payable amount of the invoice is positive,
it must either include a due date or payment terms, see
[BR-CO-25](https://docs.peppol.eu/poacc/billing/3.0/rules/ubl-tc434/BR-CO-25/).

In general, E-Invoice-EU does *not* check these semantic requirements.

A lot of these rules come from the standard itself. Others rules are set up
by the member states in the form of *Core Invoice Usage Specifications (CIUS)*,
see the chapter [% q.lanchor(name='country-specific-extensions') %].

### Business Terms

When reading these rules, you will often see the abbreviation *BT*. BT stands
for *business term* and is simply the identifier for a certain invoice field.
For example, the issue date of an invoice is business term number 2 or short
BT-2, see the documentation for
(`cbc:IssueDate`)[https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cbc-IssueDate/].

This documentation contains an almost complete list of business terms, see
[% q.lanchor(name='business-terms') %] with links to the [Peppol UBL invoice
documentation](https://docs.peppol.eu/poacc/billing/3.0/).

[% title = 'Why Reading Business Rules?' %]
<!--qgoda-no-xgettext-->
[% WRAPPER components/infobox.html type='info' title=title %]
<!--/qgoda-no-xgettext-->
Well, you will have no choice. E-invoice validation software quotes these
rules in their error messages. It is very hard to understand the error
messages without knowing what exactly the business terms mentioned in the
rule stand for.
<!--qgoda-no-xgettext-->
[% END %]
<!--/qgoda-no-xgettext-->

### Business Groups

The standard also uses the term business group or BG in short. Business groups
are simply groups of related business terms. BG-4 for example contains
information about the seller like electronic and postal addresses, tax
schemes, legal information and so on, see
[`cac:AccountingSupplierParty`](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-AccountingSupplierParty/).

The [list of business terms]([% q.llink(name='business-terms') %]) included in
this documentation also list business groups.
