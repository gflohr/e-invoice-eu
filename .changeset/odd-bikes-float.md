---
"@e-invoice-eu/core": minor
"@e-invoice-eu/server": minor
"@e-invoice-eu/cli": minor
---

Map creditor reference ID correctly.

A supplier or payee party ID with `@schemeID=SEPA` is now mapped to the CII
creditor reference ID (BT-90). The payee party ID has precedence over the
supplier party ID. If multiple conflicting supplier party `@schemeID=SEPA` are
specified, the first one takes precedence.
