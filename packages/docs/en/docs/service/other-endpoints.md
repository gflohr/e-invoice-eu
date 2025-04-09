---
title: Other Endpoints
name: other-endpoints
section: service
description: This page describes other endpoints provided by the API
---
<!--qgoda-no-xgettext-->
[% USE q = Qgoda %]
[% USE Highlight %]
[% USE CodeGroup %]
<!--/qgoda-no-xgettext-->

<qgoda-toc/>

## List Formats

You can get a list of the supported formats with the endpoint `/api/format/list`.

<!--qgoda-no-xgettext-->

[% FILTER $CodeGroup %]

[curl]
[% FILTER $Highlight "language-sh" %]
curl http://localhost:3000/api/format/list
[% END %]

[httpie]
[% FILTER $Highlight "language-sh" %]
http http://localhost:300/api/format/list[% END %]
[% END %]

<!--/qgoda-no-xgettext-->

It returns a list of entries that look - for example - like this:

<!--qgoda-no-xgettext-->

[% FILTER $Highlight "language-json" %]
{
	"name": "Factur-X-Extended",
	"syntax": "CII"
	"mimeType": "application/pdf",
	"customizationID": "urn:cen.eu:en16931:2017#conformant#urn:factur-x.eu:1p0:extended",
	"profileID": "urn:fdc:peppol.eu:2017:poacc:billing:01:1.0",
}
[% END %]

<!--/qgoda-no-xgettext-->

The meaning of the fields are:

- `name`: The name of the format as specified when [creating invoices]([% q.llink(name='creating-invoices') %])
- `syntax`: The general syntax of the XML portion, one of `CII` or `UBL`.
- `mimeType`: One of `application/xml` for pure XML formats or `application/pdf` for hybrid formats (Factur-X/ZUGFeRD)
- `customizationID`: The customization ID of the format.
- `profileID`: The profile ID of the format.

## Schemas

You can also get the [JSON Schema](https://json-schema.org/) definitions used
by the software.

### Invoice Schema

This endpoint returns the JSON schema for the [internal invoice format]([% q.llink(name='internal-format') %]):

<!--qgoda-no-xgettext-->

[% FILTER $CodeGroup %]

[curl]
[% FILTER $Highlight "language-sh" %]
curl http://localhost:3000/api/schema/invoice
[% END %]

[httpie]
[% FILTER $Highlight "language-sh" %]
http http://localhost:300/api/schema/invoice[% END %]
[% END %]

<!--/qgoda-no-xgettext-->

### Mapping Schema

This endpoint returns the JSON schema for [mapping definitions]([% q.llink(name='mapping') %]), usually given
in YAML:

<!--qgoda-no-xgettext-->

[% FILTER $CodeGroup %]

[curl]
[% FILTER $Highlight "language-sh" %]
curl http://localhost:3000/api/schema/mapping
[% END %]

[httpie]
[% FILTER $Highlight "language-sh" %]
http http://localhost:300/api/schema/mapping[% END %]
[% END %]

<!--/qgoda-no-xgettext-->
