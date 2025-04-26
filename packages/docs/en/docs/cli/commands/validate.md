---
title: The Command "validate"
name: command-validate
section: cli
description: >
  If you have access to a validation server, you can validate the invoices you
  create. You can pass an arbitrary number of invoice file for batch
  processing.
---
<!--qgoda-no-xgettext-->
[% USE q = Qgoda %]
[% USE Highlight %]
<!--/qgoda-no-xgettext-->

Validating both incoming and outgoing invoices is a crucial part of electronic
invoice processing that ultimately saves time and money. Many e-invoicing
systems automatically validate documents and reject those that fail to meet
the required standards. This can lead to unnecessary delays, disrupt business
processes, and potentially harm customer relationships.

## Prerequisites

All known e-invoice validation software is written in Java. Before you can use
the `validate` command, you have to make sure that a Java Runtime Environment
is installed on your system.

### Java Runtime Enviroment (JRE)

Many systems will have a Java Runtime Environment pre-installed. You can
test that by typing `java -version` into a commandline terminal.  If there
is no command `java` or the reported version is less than 11, you have to
install a Java Runtime Environment. In doubt, you can download the
[OpenJDK](https://openjdk.org/) version which is available for all operating
systems and Microsoft Windows.

### E-Invoice-EU-Validator

The available
[offline validators]([% q.llink(name='validation') %]#offline-validators)
are written in Java which has the effect that they have a considerably high
start-up time. This is also true for the [MustangProject
validator](https://www.mustangproject.org/), the only offline validator
capable of validating all [supported
formats]([% q.llink(name='supported-formats') %]). This is unfortunate because
the MustangProject can validate only one document at a time so that this
start-up penalty has to be paid for every document validated.

The sister project
[e-invoice-eu-validator](https://github.com/gflohr/e-invoice-eu-validator)
jumps into this gap by providing a simple server that uses the
MustangProject library.

#### Installation

Download a file `validator-VERSION-jar-with-dependencies.jar` from the
[E-Invoice-EU Validator releases
page](https://github.com/gflohr/e-invoice-eu-validator/releases). Save the
file at a location of your choice.

#### Start the Validation Server

This command starts the server:

<!--qgoda-no-xgettext-->
[% FILTER $Highlight "language-sh" %]
java -jar validator-VERSION-jar-with-dependencies.jar
[% END %]
<!--/qgoda-no-xgettext-->

This will start the server listening on port 8080. If you want to use another
port, pass it in the environment variable `PORT`.

## Validate Documents

You can now validate an arbitrary number of invoice documents:

<!--qgoda-no-xgettext-->
[% FILTER $Highlight "language-sh" %]
e-invoice-eu validate invoice*.xml invoice*.pdf
[% END %]
<!--/qgoda-no-xgettext-->

The output looks like this:

<!--qgoda-no-xgettext-->
<pre class="language-">
invoice-283784.xml: <span style="color: green">✓ valid</span>
invoice-445937.pdf: <span style="color: green">✓ valid</span>
invoice-459872.xml: <strong style="color: red">✗ invalid</strong>
invoice.xml: ✗ invalid
&lt;?xml version="1.0" encoding="UTF-8"?&gt;

&lt;validation filename="invoice.xml" datetime="2025-04-26 09:01:12">
  &lt;xml&gt;
    &lt;messages&gt;
      &lt;error type="18"&gt;schema validation fails:org.xml.sax.SAXParseException; lineNumber: 305; columnNumber: 62; cvc-datatype-valid.1.2.1: 'tons of money' is not a valid value for 'decimal'.&lt;/error&gt; 
    &lt;/messages&gt;
    &lt;summary status="invalid"/&gt;
  &lt;/xml&gt;
  &lt;messages&gt;&lt;/messages&gt;
  &lt;summary status="invalid"/&gt;
&lt;/validation&gt;

invoice-845937.pdf: <span style="color: green">✓ valid</span>

3 invoices valid.
One invoice invalid.
</pre>
<!--/qgoda-no-xgettext-->

For invalid invoices, a detailed validation report is printed to the console.

If all invoices were valid, the program terminates with an exit code of 0.
If at least one invoice was valid, it terminates with a non-zero exit code.

### Options

The command `validate` supports the following options:

| Name          | Argument | Description                                                         |
| ------------- | -------- | --------------------------------------------------------------------|
| -u, --url     | `string` | the URL of the validation server, defaults to http://localhost:8080 |
| -v, --verbose | `string` | write reports also for valid invoice documents                      |
| -q, --quiet   | `string` | suppress all output                                                 |
