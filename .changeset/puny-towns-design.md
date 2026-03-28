---
'@e-invoice-eu/core': patch
---

Map buyer IDs correctly to CII.

If a `schemeID` attribute is present, it is considered a global ID, otherwise
a local ID. This is in line with the id maping of the delivery party.
