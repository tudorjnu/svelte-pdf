# svelte-pdf — Spec

Status: ready-for-agent

## Problem Statement

Developers using Svelte who need to generate PDF documents have no equivalent of react-pdf. They must either use react-pdf (requiring React as a dependency), use HTML-to-PDF approaches (like Puppeteer, which require a browser and produce non-selectable text), or use low-level libraries like PDFKit directly (which require manual positioning and styling). There is no way to write PDFs declaratively using Svelte's component model, with flexbox layout, automatic pagination, and server-side rendering.

## Solution

svelte-pdf is a library for creating PDF documents using Svelte 5 components. It vendors react-pdf's mature, framework-agnostic engine (layout via Yoga, text layout, rendering, PDF generation, font loading, image processing, style resolution) and replaces only the React-specific layer with Svelte. Users write Svelte components (`<Document>`, `<Page>`, `<View>`, `<Text>`, etc.) that build an element tree via Svelte's context API, which is then processed by the engine into a PDF. The library works in both the browser (interactive `PDFViewer` component) and on the server (`renderToBuffer` / `renderToFile` via Svelte's `render()`).

## User Stories

1. As a Svelte developer, I want to install svelte-pdf and generate a PDF document, so that I can create PDFs without leaving the Svelte ecosystem.
2. As a Svelte developer, I want to write PDF documents using Svelte components (`<Document>`, `<Page>`, `<View>`, `<Text>`), so that I can use my existing component knowledge for PDF generation.
3. As a Svelte developer, I want to style my PDF components using style objects (`style={{ flexDirection: 'row', padding: 10 }}`), so that I can control the visual layout of my documents.
4. As a Svelte developer, I want to use flexbox layout (flexDirection, flexGrow, justifyContent, alignItems, gap), so that I can position elements without manual coordinates.
5. As a Svelte developer, I want automatic pagination, so that content that doesn't fit on one page flows to the next.
6. As a Svelte developer, I want to embed images in my PDF, so that I can include logos, photos, and graphics.
7. As a Svelte developer, I want to add hyperlinks to my PDF, so that readers can navigate to external resources.
8. As a Svelte developer, I want to add notes/annotations to my PDF, so that I can include metadata visible in PDF readers.
9. As a Svelte developer, I want to render text using a `value` prop (`<Text value="Hello World" />`), so that I can include text content in my documents.
10. As a Svelte developer, I want to use markdown for rich text (`<Markdown content="Hello **world**" />`), so that I can include bold, italic, links, and headings without verbose component nesting.
11. As a Svelte developer, I want to register custom fonts (`Font.register(...)`), so that I can use non-default fonts in my documents.
12. As a Svelte developer, I want to use Svelte's control flow (`{#if}`, `{#each}`, `{#await}`) in my PDF documents, so that I can generate dynamic, data-driven documents.
13. As a Svelte developer, I want to preview my PDF in the browser using `<PDFViewer>`, so that I can see changes in real-time during development.
14. As a Svelte developer, I want to download a PDF via a `<PDFDownloadLink>` component, so that users can save PDFs from my app.
15. As a Svelte developer, I want to use a `usePDF()` function for programmatic access to the PDF blob, so that I can build custom PDF rendering UIs.
16. As a Svelte developer, I want my PDF to re-render automatically when document data changes, so that I don't need to manually trigger re-renders.
17. As a SvelteKit developer, I want to generate PDFs on the server using `renderToBuffer(MyDocument, props)`, so that I can produce PDFs in API routes or server-side code.
18. As a SvelteKit developer, I want to write my PDF document as a `.svelte` file and use it both in the browser and on the server, so that I have a single document definition for both contexts.
19. As a Svelte developer, I want to set document metadata (title, author, subject, keywords), so that my PDFs have proper metadata.
20. As a Svelte developer, I want to control page size and orientation (`size="A4"`, `orientation="landscape"`), so that I can produce documents in different formats.
21. As a Svelte developer, I want to use hyphenation in my text, so that text breaks more naturally at line endings.
22. As a Svelte developer, I want to set PDF version, language, page layout, and page mode, so that I can control document-level PDF properties.
23. As a Svelte developer, I want to encrypt my PDF (owner password, user password, permissions), so that I can protect sensitive documents.
24. As a developer migrating from react-pdf, I want the component API to mirror react-pdf's API (same component names, same style properties, same Font API), so that migration is straightforward.
25. As a developer migrating from react-pdf, I want the PDF output to be visually identical to react-pdf, so that switching frameworks doesn't change the document appearance.

## Implementation Decisions

### Package structure

Three packages:

- **`@svelte-pdf/engine`** — react-pdf's framework-agnostic packages (primitives, fns, types, font, image, textkit, stylesheet, layout, render, pdfkit, math) consolidated into one package. Internally structured as modules but published as a single dependency. No Svelte dependency.
- **`@svelte-pdf/renderer`** — the Svelte layer. Provides PDF components (`Document`, `Page`, `View`, `Text`, `Link`, `Note`, `Image`), browser components (`PDFViewer`, `PDFDownloadLink`), the `usePDF()` function, and server-side APIs (`renderToBuffer`, `renderToFile`, `renderToStream`). Depends on `@svelte-pdf/engine`.
- **`@svelte-pdf/markdown`** — optional add-on providing `<Markdown content="..." />`. Depends on `@svelte-pdf/renderer` and `marked`.

### Tree-building mechanism

Svelte components build the element tree via Svelte 5's context API. Each component creates a node object (`{ type, style, props, children, box }`) during initialization and registers it with its parent via `setContext`/`getContext`. The tree builds synchronously top-down during component initialization.

Two context keys:

- `pdf-parent` — set by each component for its children; provides `appendChild`, `removeChild`, `insertBefore`
- `pdf-root` — set by the root `Document` component; provides `notify` (to trigger re-render)

### Text handling

Text content is passed via an explicit `value` prop: `<Text value="Hello World" />`. No template text extraction. Rich text is handled by the separate `@svelte-pdf/markdown` package using `marked` as the parser.

### Reactivity

In the browser, `$effect` in each component syncs prop changes onto its node and calls `root.notify()`. The root `Document` component has an `$effect` that triggers PDF re-rendering when notified. Re-renders are batched (queued with concurrency 1, discarding stale renders) to avoid rendering on every individual prop change. In SSR, `$effect` does not run — one-shot rendering doesn't need reactivity.

### Server-side rendering

Server-side PDF generation uses Svelte's `render()` function with a shared container object. The `renderToBuffer(component, props)` / `renderToFile(component, props, path)` wrapper functions:

1. Create a container (`{ type: 'ROOT', document: null }`)
2. Call Svelte's `render(component, { props: { ...props, __container: container } })`)
3. The tree builds synchronously during `render()` via context API
4. After `render()` returns, pass the container to `pdf(container).toBuffer()` / `toFile()`

The user writes a `.svelte` file (using `<Document>`, `<Page>`, etc.) and passes it to the server API. The same file works in the browser.

### Component API

Mirrors react-pdf's API:

- Component names: `Document`, `Page`, `View`, `Text`, `Link`, `Note`, `Image`
- Style objects: `{ flexDirection: 'row', padding: 10, backgroundColor: '#E4E4E4' }`
- No `StyleSheet.create()` — use plain objects
- Font API: `Font.register()`, `Font.registerHyphenationCallback()`, `Font.registerEmojiSource()`, `Font.getHyphenationCallback()`, `Font.getEmojiSource()`
- Document props: `title`, `author`, `subject`, `keywords`, `creator`, `producer`, `language`, `pdfVersion`, `pageLayout`, `pageMode`, `ownerPassword`, `userPassword`, `permissions`
- Page props: `size`, `orientation`, `pageLayout`

### Browser components

- **`PDFViewer.svelte`** — takes a `document` prop (Svelte component or element tree), renders the PDF in an `<iframe>` via blob URL. Accepts `showToolbar`, `title`, `style`, `className` props.
- **`PDFDownloadLink.svelte`** — takes a `document` prop and renders a link/button that downloads the PDF. Accepts `fileName`, `className`, `children` (snippet for custom link content).
- **`usePDF()`** — a function in a `.svelte.js` module using `$state` internally. Takes a document factory function, returns `{ url, blob, loading, error }`. For custom rendering without the wrapper components.

### Markdown component

`<Markdown content="..." />` in the `@svelte-pdf/markdown` package. Parses the markdown string via `marked.lexer()`, walks the token AST, and produces a subtree of `TEXT`, `TEXT_INSTANCE`, `LINK`, and styled `TEXT` nodes. Supports: headings, paragraphs, bold, italic, strikethrough, links, lists, blockquotes, code, horizontal rules.

### Testing seams

Two seams:

1. **Engine unit tests** (existing, reused) — ~204 tests from react-pdf covering layout, render, textkit, stylesheet, font, image, fns, pdfkit, primitives, math. Reused with import path changes from `@react-pdf/*` to `@svelte-pdf/engine`.

2. **Visual regression tests** (new, highest seam) — adapted from react-pdf's 20 renderer tests + 81 PNG baselines. Full pipeline: Svelte document → element tree → layout → render → PDF → PNG → compare to baseline. Uses adapted `renderComponent` helper (Svelte component → `renderToBuffer` → `pdfjs-dist` → `@napi-rs/canvas` → PNG → snapshot comparison). The 81 PNG baselines are reused as-is; the PDF output should be pixel-identical to react-pdf's output.

### Svelte version

Svelte 5 only. Uses runes (`$props`, `$state`, `$effect`, `$derived`), snippets (`{@render}`), and the context API (`setContext`/`getContext`). No Svelte 4 support.

## Testing Decisions

### What makes a good test

Tests should verify external behavior, not implementation details. For the engine, this means testing that layout functions produce correct dimensions/positions, that render primitives produce correct drawing operations, and that text layout produces correct line breaks. For the full pipeline, this means visual regression — the rendered PDF image should match the baseline.

### Modules to be tested

- **`@svelte-pdf/engine`**: all vendored packages tested via their existing unit tests (layout, render, textkit, stylesheet, font, image, fns, pdfkit, primitives, math)
- **`@svelte-pdf/renderer`**: full pipeline tested via visual regression tests covering borders, flex, gap, images, links, page wrapping, emoji, orphan text, debug mode, named destinations
- **`@svelte-pdf/markdown`**: markdown-to-PDF rendering tested via visual regression (new baselines created for markdown-specific scenarios)

### Prior art

All engine tests and visual regression baselines come from react-pdf's existing test suite. The `renderComponent.js` helper (PDF → image → snapshot) is adapted from react-pdf's renderer tests. The visual regression approach uses `jest-image-snapshot` (via Vitest) with `@napi-rs/canvas` and `pdfjs-dist` for PDF-to-image conversion.

## Out of Scope

- **SVG components** (`Svg`, `Rect`, `Line`, `Path`, `Circle`, `Ellipse`, `Polygon`, `Polyline`, `G`, `Defs`, `LinearGradient`, `RadialGradient`, `Stop`, `ClipPath`, `Marker`, `Tspan`) — deferred to a future `@svelte-pdf/svg` package.
- **Form components** (`TextInput`, `Select`, `Checkbox`, `FieldSet`) — deferred to a future `@svelte-pdf/forms` package.
- **Canvas** (`Canvas`, `ImageBackground`) — deferred.
- **Svelte 4 support** — Svelte 5 only (see ADR-0002).
- **Template text syntax** (`<Text>Hello</Text>`) — not supported; use `<Text value="Hello" />` or `<Markdown content="Hello" />` (see ADR-0003).
- **CSS string styles** — not supported; use style objects.
- **`StyleSheet.create()`** — dropped; use plain objects.
- **`BlobProvider`** — dropped; `usePDF()` covers the same use case.

## Further Notes

- The 81 PNG visual baselines from react-pdf serve as the initial test expectations. Pixel-identical output to react-pdf is an aspiration, not a guarantee — baselines may be updated when intentional divergence occurs, but this should be rare.
- The `react-pdf/` directory in the repo root contains the original react-pdf source as a reference for vendoring and comparison.
- ADRs documenting the four key architectural decisions are in `docs/adr/`.
- The domain glossary defining Engine, Renderer, Element tree, Node, Text instance, and Container is in `CONTEXT.md`.
