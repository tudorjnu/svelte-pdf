---
'@svelte-pdf/engine': patch
---

Only force a page break when the `break` prop is boolean `true`. Previously any truthy value — including the string `'avoid'`, which is meant to request keep-together behavior — forced a break, inflating page counts.
