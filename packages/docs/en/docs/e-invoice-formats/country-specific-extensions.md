---
title: Extensions
name: country-specific-extensions
section: e-invoice-formats
description: Member states may define their own extensions to the standard in the form of Core Invoice Usage Specifications (CIUS)
---

<!--qgoda-no-xgettext-->

[% USE q = Qgoda %]

<!--/qgoda-no-xgettext-->

You may expect from an e-invoice standard like EN16931 that it
standardizes e-invoices. Not quite! Each member state can define their own
extentions to the standard called Core Invoice Usage Specifications
(CIUS). Notable examples are the standard "XRechnung" in Germany or "OIUBL" in
Denmark, see the EU document [eInvoicing Country Factsheets for each Member State & other
countries](https://ec.europa.eu/digital-building-blocks/sites/display/DIGITAL/eInvoicing+Country+Factsheets+for+each+Member+State+and+other+countries)
for an overview.

## Which Extensions are Allowed?

Fortunately, countries cannot arbitrarily change the standard.

First of all, the allowed syntaxes are still only
[% q.lanchor(name='ubl') %] and [% q.lanchor(name='cii') %].

Changes to the semantics are also restricted. Countries can, for example, make
optional elements mandatory, restrict the number of occurrences of a
certain element, or disallow usage of certain codes. See
[CIUS and Extension - What is allowed](https://ec.europa.eu/digital-building-blocks/sites/display/DIGITAL/CIUS+and+Extension+-+What+is+allowed) for more information.

## Practial Aspects

Both [% q.lanchor(name='ubl') %] and [% q.lanchor(name='cii') %] require the
presence of a so-called [customization ID](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/cbc-CustomizationID/). The customization ID is an opaque string like this:

<!--qgoda-no-xgettext-->

```
urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0
```

<!--/qgoda-no-xgettext-->

It identifies a particular flavour of the e-invoice.

E-Invoice-EU facilitates this by defining aliases for certain formats. For
example the alias "XRechnung" for the German extension automatically sets
the customization id of the document to this:

<!--qgoda-no-xgettext-->

```
urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0
```

<!--/qgoda-no-xgettext-->

If you want to produce a flavour that is not directly supported by
E-Invoice-EU, you can simply select the base format (UBL or CII) and
also specify the customization ID yourself like any other field. Explicitly specified customization
IDs always override the built-in defaults.

Either way, it is your responsability to fulfill the semantic requirements of
every country-specific flavour. E-Invoice-EU only checks that the structure
of the invoice data adheres to the stipulations of the standard.
