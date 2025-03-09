---
title: Validation
name: validation
section: details
description: Validating an e-invoice ensures that it adheres to the European standard EN16931. A number of options exist for this task.
---
<!--qgoda-no-xgettext-->
[% USE q = Qgoda %]
[% USE Highlight %]
[% USE CodeGroup %]
<!--/qgoda-no-xgettext-->

When implementing an e-invoicing solution, it is almost guaranteed that the
first invoices that you produce are invalid. It is strongly recommended that
you use a validator to ensure that your invoices meet all requirements!
Even once that your solution is up an running it is a good idea to validate
all outgoing and also incoming invoices.

<qgoda-toc/>

## Syntax and Semantics

Electronic invoices must have a certain structure that is determined by the
syntax chosen, either [% q.lanchor(name='ubl') %] or
[% q.lanchor(name='cii') %]. The syntax specifies which elements must exist
and where they live inside the syntax tree.

[% title = 'Order of Invoice Fields' %]
<!--qgoda-no-xgettext-->
[% WRAPPER components/infobox.html type='info' title=title %]
<!--/qgoda-no-xgettext-->
The XML standards also specify the exact order of elements. Fortunately,
E-Invoice-EU automatically sorts its output so that you don't have to bother
about the order of your input data, no matter whether it comes from a
spreadsheet via a <a href="[% q.llink(name='mapping') %]">Mapping</a> or
directly from JSON in the <a
href="[% q.llink(name='internal-format') %]">internal invoice format</a>.
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

This documentation contains an almost complete list of business groups, see
[% q.lanchor(name='business-groups') %] with links to the [Peppol UBL invoice
documentation](https://docs.peppol.eu/poacc/billing/3.0/).

## Why is No Validation Built In E-Invoice-EU?

All known validators are written in Java and they only cover a certain subset
of different formats. The only exception is the [Practical Peppol
validator](https://peppol.helger.com/public/locale-en_US/menuitem-validation-ws2)
that covers a very wide range of in formats. But it is not straightforward
to set up or integrate into another software.

That limits the choice to online validators but that would mean that invoice
data would be sent over the internet and for data privacy reasons, this should
not happen automatically but users should opt-in to this feature.

However, offering the option of automatic validation is a feature planned
for the future, see [GitHub issue #78](https://github.com/gflohr/e-invoice-eu/issues/78).

## Validators

You can either upload e-invoices to an online validator or use self-hosted
software for validation purposes.

[% title = 'Missing Entry>' %]
<!--qgoda-no-xgettext-->
[% WRAPPER components/infobox.html type='info' title=title %]
<!--/qgoda-no-xgettext-->
The list of software and websites following is incomplete. If you want to
add an entry, please file an [issue](https://github.com/gflohr/e-invoice-eu/issues)!
<!--qgoda-no-xgettext-->
[% END %]
<!--/qgoda-no-xgettext-->

### Online Validators

Online validators are easy to use but you have to keep in mind that invoices
contain personal data and may also contain business or trade secrets.  Please
check all legal requirements before you use them.

#### Factur-X/ZUGFeRD

The following online validators are freely available:

- portinvoice: https://www.portinvoice.com/
- ZUGFeRD Community (requires registration): https://www.zugferd-community.net/en/login
- FNFE Service Validator (requires registration): https://services.fnfe-mpe.org/
- Ecosio: https://ecosio.com/en/peppol-and-xml-document-validator/ (only XML)
- Practical Peppol Validator: https://peppol.helger.com/public/locale-en_US/menuitem-validation-ws2 (only XML)

The Ecosio validator uses the Practical Peppol validator under the hood. You
have extract the XML embedded into the PDF for using these validators.

The Practical Peppol validator offers a SOAP interface and is suitable for
automated validation scenarios.

#### UBL/CII

- portinvoice: https://www.portinvoice.com
- EPO Consulting Validator: https://www.epoconsulting.com/erechnung-sap/xrechnung-validator
- Invoice Portal XRechnung https://invoice-portal.de/en/peppol-bis-xrechnung-validator/
- Ecosio: https://ecosio.com/de/peppol-und-xml-dokumente-online-validieren/
- Practical Peppol Validator: https://peppol.helger.com/public/locale-en_US/menuitem-validation-ws2

The Ecosio validator uses the Practical Peppol validator under the hood.

The Practical Peppol validator offers a SOAP interface and is suitable for
automated validation scenarios.

### Offline Validators

#### Factur-X/ZUGFeRD

##### Mustang Project

[Mustang project](https://github.com/ZUGFeRD/mustangproject) offers validation
of Factur-X/ZUGFeRD and XRECHNUNG documents. You need a Java Runtime
Environment for using it.

If you have Java installed, download the `Mustang-CLI-*VERSION*.jar` from their
[release page](https://github.com/ZUGFeRD/mustangproject/releases) and save
it as `Mustang-CLI.jar` in the directory `contrib/validators/factur-x`.

After that you can validate Factur-X/ZUGFeRD like this:

<!--qgoda-no-xgettext-->
[% FILTER $Highlight "language-shell" %]
node contrib/validators/factur-x/factur-x-validate.mjs INVOICE_DOCUMENT
[% END %]
<!--/qgoda-no-xgettext-->

In case of an error, you will get a detailed error report which is
unfortunately not very easy to understand.

You can pass PDF documents with embedded e-invoices and also bare XML files.
The validator also supports documents following the German XRechnung standard.
Check the [Mustang project homepage](https://www.mustangproject.org/) for
up-to-date information.

If you haven't installed the Java interpreter in your `$PATH`, you can set
the environment variable `$JAVA` to the location of the Java executable.
Likewise. you can point the environment variable `$MUSTANG_CLI_JAR` to the
location of the Mustangproject Jar file if it cannot be found at
`contrib/factur-x/Mustang-CLI.jar`.

##### Practical Peppol

The [Practical Peppol validator](https://peppol.helger.com/public/locale-en_US/menuitem-validation-ws2)
can be set up locally. You have to contact the author for details.

#### UBL/CII (XRechnung)

The German [Koordinierungsstelle für IT-Standards -
KoSIT](https://www.xoev.de/) maintains a free and open source validator for
arbitrary e-invoice formats.

You need a Java Runtime Environment (version 11 or newer) and download at
least two pieces of software, the actual validator and a so-called
"validation scenario" with the schemas of the supported formats.

##### Install Validator

Download the file `validator-*VERSION*-distribution.zip`. It contains a file
`validationtool-*VERSION*-standalone.jar`. Save it as `validationtool.jar`
in the directory `contrib/validators/kosit`.

Please try out that you can run the validator executable with this command:

<!--qgoda-no-xgettext-->
[% FILTER $Highlight "language-shell" %]
java -jar contrib/validators/kosit/validationtool.jar
[% END %]
<!--/qgoda-no-xgettext-->

It should display a help page with usage information.

#### Install XRECHNUNG Scenario

A "scenario" for XRECHNUNG is available at https://github.com/itplr-kosit/validator-configuration-xrechnung/releases.

Download the file `validator-configuration-xrechnung_*VERSION*_*DATE*.zip`
and unpack it in the directory `contrib/validators/kosit/xrechnung-scenario`.
This should now work:

<!--qgoda-no-xgettext-->
[% FILTER $Highlight "language-shell" %]
ls contrib/validators/kosit/xrechnung-scenario/scenarios.xml
[% END %]
<!--/qgoda-no-xgettext-->

This scenario contains schemas for UBL, CII, and various versions of the
German XRECHNUNG format.

##### Run the Validator

Now you can run the validator like this:

<!--qgoda-no-xgettext-->
[% FILTER $Highlight "language-shell" %]
node contrib/validators/kosit/validate.mjs invoice.pdf
[% END %]
<!--/qgoda-no-xgettext-->

You will see the result of the validation on the console. Additionally, a
file `*INVOICE_DOCUMENT*-report.xml` will be generated with a detailed
validation report and a visualization of the invoice. Despite the filename
extension `.xml`, the report is an HTML file and can be displayed in the
browser.

You can pass multiple files on the commandline if you want to validate
more than one document at once.

Alternatively, you can start the validator as a daemon:

<!--qgoda-no-xgettext-->
[% FILTER $Highlight "language-shell" %]
node contrib/validators/kosit/validate.mjs --daemon
[% END %]
<!--/qgoda-no-xgettext-->

The option `-D` is an alias for `--daemon`.

You can now open a web interface at http://localhost:8080/ and upload invoices
to be validated.

Alternatively, you can also use `curl` or `httpie`:

<!--qgoda-no-xgettext-->
[% FILTER $CodeGroup %]
[curl]
[% FILTER $Highlight "language-shell" %]
$ curl POST -d @./invoice.xml http://localhost:8080/
[% END %]

[httpie]
[% FILTER $Highlight "language-shell" %]
$ http POST -d @./invoice.xml http://localhost:8080/
[% END %]
[% END %]
<!--/qgoda-no-xgettext-->

For complete usage information of the validator, run this command:

<!--qgoda-no-xgettext-->
[% FILTER $Highlight "language-shell" %]
$ node contrib/validators/kosit/validate.mjs --help
[% END %]
<!--/qgoda-no-xgettext-->

Note that the wrapper script always passes the mandatory arguments `--scenarios`
and `--repository`.
