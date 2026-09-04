---
'@svelte-pdf/engine': patch
---

Resolve unregistered font families to the standard fonts (with a warning) instead of throwing "Font family not registered". Throws a clear error only when the standard fonts themselves are unavailable (e.g. after `Font.clear()`).
