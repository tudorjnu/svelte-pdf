# @svelte-pdf/engine

## 0.1.2

### Patch Changes

- 4941eab: Accept object values for box-model style props (`padding`, `margin`, and their shorthand/partial variants). `{ top, right, bottom, left }` objects map to the expanded style keys with missing sides defaulting to 0; each value goes through the same unit parsing as other forms, so `'10mm'` and friends work.
- 7e5fd84: Resolve unregistered font families to the standard fonts (with a warning) instead of throwing "Font family not registered". Throws a clear error only when the standard fonts themselves are unavailable (e.g. after `Font.clear()`).
- 104d2bb: Only force a page break when the `break` prop is boolean `true`. Previously any truthy value — including the string `'avoid'`, which is meant to request keep-together behavior — forced a break, inflating page counts.

## 0.1.1

### Patch Changes

- 93f021d: Add READMEs to the engine and renderer packages so npm pages render documentation, and fix the repository link in the markdown package README.

## 0.1.0

Initial release. Framework-agnostic PDF engine vendored from react-pdf (primitives, fns, types, font, image, textkit, stylesheet, layout, render, pdfkit, math), consolidated into a single package with import paths updated to `@svelte-pdf/engine`.
