---
title: The Command "schema"
name: command-schema
section: cli
description: You can receive the JSON schema definitions used by E-Invoice-EU with the command <code>format</code>.
---
<!--qgoda-no-xgettext-->
[% USE q = Qgoda %]
[% USE Highlight %]
<!--/qgoda-no-xgettext-->

If you are interested in the JSON schema definitions internally used by
E-Invoice-EU, use the command `schema`.  It has one required option `--id`
that takes the schema id - either `invoice` or `mapping` as an argument.

### Invoice Schema

This prints the JSON schema for the [internal invoice format]([% q.llink(name='internal-format') %])
on standard output:

<!--qgoda-no-xgettext-->
[% FILTER $Highlight "language-sh" %]
e-invoice-eu schema --id=invoice
[% END %]
<!--/qgoda-no-xgettext-->

### Mapping Schema

This prints the JSON schema for [mapping definitions]([% q.llink(name='mapping') %]),
usually given in YAML:

<!--qgoda-no-xgettext-->
[% FILTER $Highlight "language-sh" %]
e-invoice-eu schmea --id=mapping
[% END %]
<!--/qgoda-no-xgettext-->
