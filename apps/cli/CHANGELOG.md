# @e-invoice-eu/cli

## 3.2.1

### Patch Changes

- 8074c15: Upgrade all dependencies.
  
  Exception: TypeScript. NestJS still does not work with TypeScript 7.
  Upgrading the TypeScript versions in the other workspaces fails, see
  https://github.com/nestjs/nest-cli/issues/3549.
- Updated dependencies [7c0cb64]
- Updated dependencies [8074c15]
  - @e-invoice-eu/core@3.2.1

## 3.2.0

### Patch Changes

- e77faa0: Use cbc:CompanyLegalForm instead of cbc:LegalForm (see #566).
- 5f24875: Upgrade all dependencies to latest.

  Exception: TypeScript is not upgrade to version 7, because neither NestJS nor
  Rollup support TypeScript 7 for the time being. But since TypeScript is a
  devDependency, this does not affect any users of the software.

- e08d51c: Preserve correct ID, when downgrading ram:GlobalID to ram:ID (#567).
- afdc2fd: Report the correct cli version when installed locally.
- Updated dependencies [938ab61]
- Updated dependencies [e77faa0]
- Updated dependencies [1566b64]
- Updated dependencies [5f24875]
- Updated dependencies [e08d51c]
- Updated dependencies [1566b64]
  - @e-invoice-eu/core@3.2.0

## 3.1.1

### Patch Changes

- d8809ce: Fix homepage URLs.
- cc349ba: Make Base64 padding optional.
- Updated dependencies [d8809ce]
- Updated dependencies [cc349ba]
  - @e-invoice-eu/core@3.1.1

## 3.1.0

### Patch Changes

- Updated dependencies [f88cd94]
  - @e-invoice-eu/core@3.1.0

## 3.0.3

### Patch Changes

- Updated dependencies [375b34a]
- Updated dependencies [109fbbf]
- Updated dependencies [e90c3e6]
  - @e-invoice-eu/core@3.0.3

## 3.0.2

### Patch Changes

- Updated dependencies [6a4ddf6]
  - @e-invoice-eu/core@3.0.2

## 3.0.1

### Patch Changes

- Updated dependencies [e80b0ca]
  - @e-invoice-eu/core@3.0.1

## 3.0.0

### Patch Changes

- 0f849c6: Factur-X conformance level for price elements fixed
- Updated dependencies [0f849c6]
- Updated dependencies [2eb5907]
- Updated dependencies [71c08ac]
- Updated dependencies [0831806]
  - @e-invoice-eu/core@3.0.0

## 2.3.4

### Patch Changes

- automatic dockerhub publish and bugfixes
- Updated dependencies
  - @e-invoice-eu/core@2.3.4

## 2.3.3

### Patch Changes

- upgrade dependencies and fix CVEs
- Updated dependencies
  - @e-invoice-eu/core@2.3.3

## 2.3.2

### Patch Changes

- make customization id overridable
- Updated dependencies
  - @e-invoice-eu/core@2.3.2

## 2.3.1

### Patch Changes

- fix CII output
- Updated dependencies
  - @e-invoice-eu/core@2.3.1

## 2.3.1

### Patch Changes

- fix CII output
- Updated dependencies
  - @e-invoice-eu/core@2.3.1

## 2.4.0

### Minor Changes

- fix CII output

### Patch Changes

- Updated dependencies
  - @e-invoice-eu/core@2.4.0
