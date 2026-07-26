---
"@e-invoice-eu/core": patch
"@e-invoice-eu/docs": patch
"@e-invoice-eu/server": patch
"@e-invoice-eu/cli": patch
---

Upgrade all dependencies to latest.

Exception: TypeScript is not upgrade to version 7, because neither NestJS nor
Rollup support TypeScript 7 for the time being. But since TypeScript is a
devDependency, this does not affect any users of the software.
