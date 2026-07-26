# @e-invoice-eu/docs

## 3.2.0

### Minor Changes

- 938ab61: Allow CII Extensions

  Currently supported, only invoice note subject codes (BT-21) via the special
  element `x-cii:SubjectCode`.

### Patch Changes

- e77faa0: Use cbc:CompanyLegalForm instead of cbc:LegalForm (see #566).
- 1566b64: Map invoice period description code to CII.
- 5f24875: Upgrade all dependencies to latest.

  Exception: TypeScript is not upgrade to version 7, because neither NestJS nor
  Rollup support TypeScript 7 for the time being. But since TypeScript is a
  devDependency, this does not affect any users of the software.

- e08d51c: Preserve correct ID, when downgrading ram:GlobalID to ram:ID (#567).
- 1566b64: Automatically map VAT date codes.

  Whereas UBL uses UNCL 2005, CII uses UNCL 2445. You can use whichever list
  you prefer. The software will automatically convert the values according to
  the selected invoice format.

## 3.1.1

### Patch Changes

- cc349ba: Make Base64 padding optional.

## 3.1.0

## 3.0.3

## 3.0.2

## 3.0.1

## 3.0.0

### Patch Changes

- 0f849c6: Factur-X conformance level for price elements fixed

## 2.3.4

### Patch Changes

- automatic dockerhub publish and bugfixes

## 2.3.3

### Patch Changes

- upgrade dependencies and fix CVEs

## 2.3.2

### Patch Changes

- make customization id overridable
