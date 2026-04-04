---
'@e-invoice-eu/core': patch
---

Allow post-processing of invoice data before XML is rendered.

See the API documentation for
[`InvoiceServiceOptions`](https://gflohr.github.io/e-invoice-eu/api-docs/types/InvoiceServiceOptions.html#nowarnings).

It is not planned to port this feature to the command-line tool or the REST
API. For those interfaces, you can easily run the generated XML through some
XSL stylesheet.

For the hybrid formats Factur-X resp. ZUGFeRD, this will include an invocation
of `pdftk` or a similar tool for extracting the attachment, deleting it, and
adding it again.
