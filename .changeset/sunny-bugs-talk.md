---
'@e-invoice-eu/core': major
---

Upgraded code lists and schemas from PEPPOL-UBL to the latest release
v3.0.20. This updated caused the type VATExemptionReasonCode to be narrowed
from string to a literal union.

This may break TypeScript consumers that relied on arbitrary string values.
