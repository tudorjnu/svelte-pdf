# @svelte-pdf/engine

The framework-agnostic PDF engine behind [svelte-pdf](https://github.com/tudorjnu/svelte-pdf): layout (Yoga), text layout, rendering, PDF generation, font loading, image processing, and style resolution.

> You usually don't need to install this directly — install [`@svelte-pdf/renderer`](https://www.npmjs.com/package/@svelte-pdf/renderer), which depends on the engine and provides the Svelte 5 components plus the server and browser APIs.

## Origin

Vendored from [react-pdf](https://github.com/diegomura/react-pdf). Its framework-agnostic packages (`primitives`, `fns`, `types`, `font`, `image`, `textkit`, `stylesheet`, `layout`, `render`, `pdfkit`, `math`) are consolidated here as internal modules with import paths updated to `@svelte-pdf/engine`.

## Subpath exports

- `.` — barrel export: `layout`, `render`, `PDFDocument` (pdfkit), `FontStore`, primitives, `resolveStyles`, `fns`, SVG
- `./primitives`, `./fns`, `./svg` — element-tree primitives, utilities, SVG parsing
- `./layout` — Yoga-based layout engine
- `./render` — render steps producing the pdfkit document
- `./pdfkit` — the vendored pdfkit (plus `./pdfkit/standard-fonts/*`)
- `./font` — shared `fontStore` singleton and font loading
- `./image` — image fetching and resolution
- `./textkit` — text layout engines (linebreaking, justification, bidi, hyphenation)
- `./stylesheet` — style flattening and resolution
- `./types` — type definitions only

## License

MIT.
