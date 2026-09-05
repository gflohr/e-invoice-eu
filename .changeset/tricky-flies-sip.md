---
"@e-invoice-eu/cli": patch
"@e-invoice-eu/core": patch
"@e-invoice-eu/server": patch
---

Upgrade all dependencies.

Exception: TypeScript. NestJS still does not work with TypeScript 7.
Upgrading the TypeScript versions in the other workspaces fails, see
https://github.com/nestjs/nest-cli/issues/3549.
