---
'@svelte-pdf/engine': patch
---

Accept object values for box-model style props (`padding`, `margin`, and their shorthand/partial variants). `{ top, right, bottom, left }` objects map to the expanded style keys with missing sides defaulting to 0; each value goes through the same unit parsing as other forms, so `'10mm'` and friends work.
