---
'@svelte-pdf/renderer': patch
---

Fix `Font` typing drift and generic `usePDF`: `FontSource.fontWeight` (was `weight`, matching the engine font store), declare the existing `Font.clear()`, and make `usePDF<P>` generic so typed `Component<P>` values are accepted.
