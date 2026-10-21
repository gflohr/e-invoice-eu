---
"@e-invoice-eu/core": patch
---

Relax schema for top-level note elements.

The top-level elements `cbc:Note` and `x-cii:SubjectCode` can now either be
single string values or arrays of strings.
