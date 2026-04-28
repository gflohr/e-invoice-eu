# @e-invoice-eu/core

## 3.1.1

### Patch Changes

- d8809ce: Fix homepage URLs.
- cc349ba: Make Base64 padding optional.

## 3.1.0

### Minor Changes

- f88cd94: Add UnitPriceAmount type for BT-146, BT-147, BT-148

## 3.0.3

### Patch Changes

- 375b34a: Move module type back to esnext.

  Setting `module` and `moduleResolution` to NodeNext broke the build
  (see #489).

- 109fbbf: Allow post-processing of invoice data before XML is rendered.

  See the API documentation for
  [`InvoiceServiceOptions`](https://gflohr.github.io/e-invoice-eu/api-docs/types/InvoiceServiceOptions.html#postprocessor).

  It is not planned to port this feature to the command-line tool or the REST
  API. For those interfaces, you can easily run the generated XML through some
  XSL stylesheet.

  For the hybrid formats Factur-X resp. ZUGFeRD, this will include an invocation
  of `pdftk` or a similar tool for extracting the attachment, deleting it, and
  adding it again.

- e90c3e6: Map seller party identifications to CII.

## 3.0.2

### Patch Changes

- 6a4ddf6: \* ReceivableSpecifiedTradeAccountingAccount no longer placed outside ApplicableHeaderTradeSettlement
  - Remove @currencyID on Amount elements (forbidden by CII-DT-031)
  - Fix CII mapping for payee identifier (BT-60)

## 3.0.1

### Patch Changes

- e80b0ca: Map buyer IDs correctly to CII.

  If a `schemeID` attribute is present, it is considered a global ID, otherwise
  a local ID. This is in line with the id maping of the delivery party.

## 3.0.0

### Major Changes

- 71c08ac: Upgraded code lists and schemas from PEPPOL-UBL to the latest release
  v3.0.20. This update caused the type VATExemptionReasonCode to be narrowed
  from string to a literal union.

  This may break TypeScript consumers that relied on arbitrary string values.

  Technically, this is a breaking change and required a major version bump from
  2 to 3. However, it is highly unlikely, that this will break existing code.

### Patch Changes

- 0f849c6: Factur-X conformance level for price elements fixed
- 2eb5907: Map referenced invoice for corrected invoices to CII.
- 0831806: fix encoding of XMP metadata

## 2.3.4

### Patch Changes

- automatic dockerhub publish and bugfixes

## 2.3.3

### Patch Changes

- upgrade dependencies and fix CVEs

## 2.3.2

### Patch Changes

- make customization id overridable

## 2.3.1

### Patch Changes

- fix CII output

## 2.3.1

### Patch Changes

- fix CII output

## 2.4.0

### Minor Changes

- fix CII output
