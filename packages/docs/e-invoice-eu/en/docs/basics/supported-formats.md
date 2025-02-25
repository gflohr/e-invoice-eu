---
title: Supported Formats
name: supported-formats
section: basics
description: E-Invoice-EU supports e-invoice formats that conform to the European Standard EN16931.
---
<!--qgoda-no-xgettext-->
[% USE q = Qgoda %]
<!--/qgoda-no-xgettext-->

E-Invoice-EU supports the following [e-invoice
formats]([% q.llink(name='hybrid-vs-xml') %]):

| Name              | Customization ID/Remarks
|-------------------|---------------------------
| CII               | `urn:cen.eu:en16931:2017`
| Factur-X-Minimum  | `urn:factur-x.eu:1p0:minimum`
| Factur-X-BasicWL  | `urn:factur-x.eu:1p0:basicwl`
| Factur-X-Basic-WL | is an alias for Factur-X-BasicWL
| Factur-X-Basic    | `'urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:basic'`
| Factur-X-EN16931  | `urn:cen.eu:en16931:2017`
| Factur-X-Comfort  | is an alias for Factur-X-EN16931
| Factur-X-Extended | `urn:cen.eu:en16931:2017#conformant#urn:factur-x.eu:1p0:extended`
| Factur-X-XRechung | `urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0`
| UBL               | `urn:cen.eu:en16931:2017`
| XRECHNUNG-CII     | `urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0`
| XRECHNUNG-UBL     | `urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0`
| ZUGFeRD-Minimum   | is an alias for Factur-X-Minimum
| ZUGFeRD-BasicWL   | is an alias for Factur-X-BasicWL
| ZUGFeRD-Basic-WL  | is an alias for Factur-X-BasicWL
| ZUGFeRD-Basic     | is an alias for Factur-X-Basic
| ZUGFeRD-EN16931   | is an alias for Factur-X-EN16931
| ZUGFeRD-Comfort   | is an alias for Factur-X-EN16931
| ZUGFeRD-Extended  | is an alias for Factur-X-Extended
| ZUGFeRD-XRechung  | is an alias for Factur-X-XRechnung

Please see the section [E-Invoice
Formats]([% q.llink(name='hybrid-vs-xml') %]) for more information about
customization ids and the different e-invoice formats.
