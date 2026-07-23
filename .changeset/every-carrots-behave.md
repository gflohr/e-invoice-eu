---
"@e-invoice-eu/server": patch
---

Uninstall npm and corepack in docker image.

This reduces the attack surface and avoids false positives from Trivy.
