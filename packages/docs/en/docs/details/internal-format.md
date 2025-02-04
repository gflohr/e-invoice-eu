---
title: Internal Format
name: internal-format
section: details
description: The internally used data structure is almost identical to that of Peppol UBL Invoices. All supported output formats can be generated from it.
---
<!--qgoda-no-xgettext-->
[% USE q = Qgoda %]
[% USE Highlight %]
<!--/qgoda-no-xgettext-->

<qgoda-toc/>

## Why an Internal Format?

Data in the internal format is the starting point of the generation of
e-invoices in all supported output formats. Therefore, users of the software do
not have to care about all details of other formats but can focus on one.

[% title = "Required Know-How" %]
<!--qgoda-no-xgettext-->
[% WRAPPER components/infobox.html type='info' title=title %]
<!--/qgoda-no-xgettext-->
Knowledge of JSON is definitely a plus, when reading this documentation.
XML know-how is also a plus but not really important.
<!--qgoda-no-xgettext-->
[% END %]
<!--/qgoda-no-xgettext-->

## Why UBL?

In fact, there are just two possible syntaxes for e-invoices conforming to the
European standard EN16931, UBL and CII. UBL has been chosen because its
syntax is well documented and less complex compared to CII.

At the downside of it, it is currently not possible to add information to
invoices that is present in CII but not present in UBL. This may eventually
change in the future.

## UBL vs Peppol UBL

The [Universal Business Language UBL](https://groups.oasis-open.org/communities/tc-community-home2?CommunityKey=556949c8-dac8-40e6-bb16-018dc7ce54d6) can be used to express a
[wide variety of business
documents](http://docs.oasis-open.org/ubl/os-UBL-2.1/UBL-2.1.html#S-UBL-2.1-DOCUMENT-SCHEMAS),
one of them being [UBL
invoices](http://docs.oasis-open.org/ubl/os-UBL-2.1/UBL-2.1.html#T-INVOICE).
The UBL standard is maintained by the organization [OASIS
Open](https://groups.oasis-open.org/home).

[Peppol (Pan-European Public Procurement
OnLine)](https://peppol.org/) is an effort of the European
Union aiming at the standardization of cross-border procurement processes.
They have published the [Business Interoperability Specifications
(BIS)](https://docs.peppol.eu/poacc/billing/3.0/bis/), currently version 3.0.
One of these specifications is that for [UBL
Invoice](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/tree/).

This specification is based on the above mentioned UBL specification by
OASIS Open but it is not identical. This documentation therefore refers to
the Peppol BIS UBL Invoice as Peppol UBL.

## Structure of the Peppol UBL Documentation

The UBL invoice documentation is available as either [a single
HTML page](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/tree/)
or a [multi-page clickable tree](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/).

The single-page version is good for searching but the multi-page version is
easier to use and understand.

### Document Object Model (DOM)

As UBL is an XML format, the underlying mental model is a [Document Object
Model (DOM)](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model).
The software E-Invoice-EU uses JSON instead. The main structural difference
to XML - at least in the context of Peppol UBL - is the availability of
arrays (lists) in JSON.

### Nodes and Leafs

The structure of Peppol UBL consists of nodes which are elements that have
sub-elements and leafs which are elements that do not have sub-elements.

Nodes have a namespace prefix of `cac`, for example the element
[`cac:AccountingSupplierParty`](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-AccountingSupplierParty/)
which describes the issuer of an invoice.  Inside that definition we find the
postal address of the supplier and the [city part `cbc:CityName`](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-AccountingSupplierParty/cac-Party/cac-PostalAddress/cbc-CityName/)
is a leaf because it does not contain sub-elements. As all other leafs, it
has a namespace prefix of `cbc`.

### Cardinality

The Peppol UBL documentation specifies a *cardinality* of each element. The
cardinality describes how many occurences of a certain element are allowed
at a certain location. The cardinality is specified as two integers separated
by two dots, for example `0..2`.  The first number specifies the minimum
number of occurences and the higher number specifies the maximum number of
occurrences. If the higher number is the letter `n`, as for example in `0..n`,
there can be an arbitrary number of occurences.

The following table describes typical cardinalities.

| Cardinality | Meaning |
|-------------|---------|
| `1..1`      | A mandatory element, for example the [amount due of an invoice](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-LegalMonetaryTotal/cbc-PayableAmount/). |
| `0..1`      | An optional element, for example an [advance payment](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-LegalMonetaryTotal/cbc-PrepaidAmount/). |
| `1..n`      | A mandatory list with an unlimited number of elements, for example the [line items resp. invoice positions](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-InvoiceLine/)|
| `0..n`      | An optional list with an unlimited number of elements, for example the [charges and allowances on document level](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-AllowanceCharge/) |
| `1..2`      | A mandatory list with a maximum of 2 elements, for example the [tax total](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-TaxTotal/) |
| `0..2`      | An optional list with a maximum of 2 elements, for example the [party tax scheme](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-AccountingSupplierParty/cac-Party/cac-PartyTaxScheme/) |

Rules of thumb: If the first number is `0`, an element is optional, otherwise
it is mandatory. Only if the second number is greater or equal `2` or it is `n`,
we have a list.

### Attributes

XML elements can have attributes that further describe the element's value.
For example, the [amount due of an invoice](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-LegalMonetaryTotal/cbc-PayableAmount/) has a mandatory attribute
`@currencyID` that contains the abbreviated currency identifier of the amount.
In the column "Use" of the attributes section of the element documentation, the letter
`M` indicates that it is a mandatory attribute, in other words, it has to be
present.

The [company id](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-AccountingSupplierParty/cac-Party/cac-PartyLegalEntity/cbc-CompanyID/) has an *optional* attribute `schemeID`.
This is indicated by the letter `O` in the column "Use".

### Code Lists

Many fields cannot have arbitrary values but there a restricted to a choice
from a list. These lists are called *code lists*. The [amount due of an
invoice](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-LegalMonetaryTotal/cbc-PayableAmount/)
for example needs a currency id and the corresponding attribute
[`@currencyID`](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-LegalMonetaryTotal/cbc-PayableAmount/currencyID/)
is restricted to the code list [ISO 4217 Currency
codes](https://docs.peppol.eu/poacc/billing/3.0/codelist/ISO4217/). You can
get the relevant information by clicking on the element's or attribute's
name, and then on the code list name in the section "Code lists". The code
list page itself lists the possible values in the section "Codes". You
often have to scroll down a little bit to get to the list of values.

## Transforming XML to JSON

Since E-Invoice-EU uses JSON and not XML, the Peppol UBL has to be transformed
into JSON.

### Basic Strategy

The way of transforming XML into JSON for E-Invoice-EU is straightforward
and easier to understand than to describe.

The XML structure is converted into JSON by following a simple set of rules:

1. Elements become JSON keys – Each XML element is represented as a key in the JSON object.
2. Nesting is preserved – If an element contains child elements, it becomes an object with those elements as its properties.
3. Text values become string values – If an element contains only text, the text becomes the value of the corresponding key.

Take for example this incomplete fragment of a UBL invoice XML document
specifying the [supplier's name](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-AccountingSupplierParty/cac-Party/cac-PartyName/):

<!--qgoda-no-xgettext-->
[% FILTER $Highlight "language-markup" "line-numbers" %]
<ubl:Invoice>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cbc:PartyName>
        Acme Ltd.
      </cbc:PartyName>
    </cac:Party>
  </cac:AccountingSupplierParty>
</ubl:Invoice>
[% END %]
<!--/qgoda-no-xgettext-->

This translates into JSON like this:

<!--qgoda-no-xgettext-->
[% FILTER $Highlight "language-json" "line-numbers" %]
{
  "ubl:Invoice": {
    "cac:AccountingSupplierParty": {
      "cac:Party": {
        "cbc:PartyName": "Acme Ltd."
      }
    }
  }
}
[% END %]
<!--/qgoda-no-xgettext-->

Each XML element becomes a property in the JSON object, and the hierarchy
remains unchanged. The text content of cbc:PartyName` becomes the string
"Acme Ltd." in JSON.

### Lists/Arrays

XML has no notion of lists respectively arrays. Instead, elements are simply
repeated. Take for example invoice line items:

<!--qgoda-no-xgettext-->
[% FILTER $Highlight "language-markup" "line-numbers" %]
<ubl:Invoice>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:AccountingCost>100:1</cbc:AccountingCost>
  </cac:InvoiceLine>
  <cac:InvoiceLine>
    <cbc:ID>2</cbc:ID>
    <cbc:AccountingCost>200:2</cbc:AccountingCost>
  </cac:InvoiceLine>
  <cac:InvoiceLine>
    <cbc:ID>3</cbc:ID>
    <cbc:AccountingCost>300:3</cbc:AccountingCost>
  </cac:InvoiceLine>
</ubl:Invoice>
[% END %]
<!--/qgoda-no-xgettext-->

There are three `cac:InvoiceLine` elements. That means that they are a list.

The transformation into JSON is straightforward:

<!--qgoda-no-xgettext-->
[% FILTER $Highlight "language-json" "line-numbers" %]
{
  "ubl:Invoice": {
    "cac:InvoiceLine": [
      {
        "cbc:ID": "1",
        "cbc:AccountingCost": "100:1",
      },
      {
        "cbc:ID": "2",
        "cbc:AccountingCost": "200:3",
      },
      {
        "cbc:ID": "3",
        "cbc:AccountingCost": "300:3",
      },
    ]
  }
}
[% END %]
<!--/qgoda-no-xgettext-->

Because `cac:InvoiceLine` is an array (it has a cardinality of `1..n`), it
is also an array in JSON. The items are simply all sub-nodes of
`cac:InvoiceLine`.

[% title = "Single-Item Lists" %]
<!--qgoda-no-xgettext-->
[% WRAPPER components/infobox.html type='info' title=title %]
<!--/qgoda-no-xgettext-->
Even if you have just one item, you must still use an array in JSON.  Single
values are not automatically coerced into arrays.  This is particularly
important for some elements that you probably do not expect to be arrays, for
example the <a href="https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cac-TaxTotal/">tax
total</a> of the invoice.
<!--qgoda-no-xgettext-->
[% END %]
<!--/qgoda-no-xgettext-->

### Attributes

Some elements have attributes:

<!--qgoda-no-xgettext-->
[% FILTER $Highlight "language-markup" "line-numbers" %]
<ubl:Invoice>
  <cac:LegalMonetaryTotal>
    <cbc:PayableAmount currencyID="EUR">23.04</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
</ubl:Invoice>
[% END %]
<!--/qgoda-no-xgettext-->

JSON does not have a notion of attributes. Instead you take the name of the
element, add an `@` and the attribute name:

<!--qgoda-no-xgettext-->
[% FILTER $Highlight "language-json" "line-numbers" %]
{
  "ubl:Invoice": {
    "cac:LegalMonetaryTotal": {
      "cbc:PayableAmount": "23.04"
      "cbc:PayableAmount@currencyID": "EUR"
    }
  }
}
[% END %]
<!--/qgoda-no-xgettext-->

### Non-String Values

Please note that strings *must* be used for all values, even if they are
numbers. Check the above examples for that.

## Validation

Don't worry if you forget about the exact details. The service bails out with
an error message if the structure of the input data does not adhere to the
schema.

## JSON Schema

If you are familiar with [JSON Schema](https://json-schema.org/), you can also
use this. It is available in the [GitHub repo E-Invoice-EU](https://github.com/gflohr/e-invoice-eu/blob/main/src/schema/invoice.schema.json)
or as the REST endpoint [`/api/schema/invoice`]([% q.llink(name='other-endpoints') %]#invoice-schema).

