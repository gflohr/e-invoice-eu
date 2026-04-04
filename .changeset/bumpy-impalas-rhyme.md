---
'@e-invoice-eu/core': patch
---

Move module type back to esnext.

Setting `module` and `moduleResolution` to NodeNext broke the build
(see #489).
