# svelte-pdf

A library for creating PDF documents using [Svelte 5](https://svelte.dev/) components.

This project is a direct descendant of [react-pdf](https://github.com/diegomura/react-pdf). It vendors react-pdf's mature, framework-agnostic PDF engine (layout via Yoga, text layout, rendering, PDF generation, font loading, image processing, and style resolution) and replaces only the React-specific component layer with Svelte 5. The goal is to give Svelte developers the same declarative PDF authoring experience that react-pdf provides for React developers, with matching component names, style objects, and APIs wherever possible.

## Packages

- **`@svelte-pdf/engine`** — the framework-agnostic PDF engine extracted from react-pdf.
- **`@svelte-pdf/renderer`** — the Svelte 5 component layer: `Document`, `Page`, `View`, `Text`, `Link`, `Note`, `Image`, plus browser components `PDFViewer` and `PDFDownloadLink`, the `usePDF()` hook, and server APIs `renderToBuffer`, `renderToStream`, and `renderToFile`.
- **`@svelte-pdf/markdown`** — an optional add-on providing a `<Markdown content="..." />` component backed by `marked`.

## Project origin

The source code in this repository is derived from the react-pdf project. The engine package was created by consolidating react-pdf's framework-agnostic packages (`@react-pdf/primitives`, `@react-pdf/fns`, `@react-pdf/types`, `@react-pdf/font`, `@react-pdf/image`, `@react-pdf/textkit`, `@react-pdf/stylesheet`, `@react-pdf/layout`, `@react-pdf/render`, `@react-pdf/pdfkit`, `@react-pdf/math`) into a single internal package and updating their import paths. The renderer and markdown packages are new Svelte-specific work built on top of that engine.

## What is implemented

- All 7 core components: `Document`, `Page`, `View`, `Text`, `Link`, `Note`, `Image`.
- Server-side rendering APIs: `renderToBuffer`, `renderToStream`, `renderToFile`.
- Browser APIs: `usePDF`, `PDFViewer`, `PDFDownloadLink`.
- `Font` registration API: `register`, `registerHyphenationCallback`, `registerEmojiSource`.
- Reactive browser re-rendering via Svelte 5 `$state` / `$effect` and a batched render queue.
- `<Markdown content="..." />` component with support for headings, paragraphs, bold, italic, strikethrough, links, lists, blockquotes, inline code, code blocks, and horizontal rules.
- Visual regression tests for the renderer and markdown packages, adapted from react-pdf's test approach.

## Extended feature example

A larger example is included to exercise all core components:

```bash
bun run test:renderer:run -- tests/extended-render.test.js
```

This renders `examples/Extended.svelte` to:

- `examples/extended.pdf`
- `examples/extended.png` — a 1.5× DPI preview of all pages stacked vertically.

The extended example includes:

- `Document` metadata (title, author, subject, keywords, creator)
- `Page` with `size` and a second page with `orientation="landscape"`
- `View` with flex row layout, gap, padding, background color, border radius
- `Text` with sizes, weights, colors, and the `fixed` + `render` page-number prop
- `Link` with external URL and styled children
- `Image` loaded from a local `Buffer` (passed via the `imageSrc` prop)
- `Note` annotation
- Conditional rendering via `{#if}`

> Note on images: remote URLs can fail in the test environment because `vitest-fetch-mock` intercepts network requests and the engine's image parser has known issues with Node.js v24 buffers. For reliable local visual tests, pass a local image `Buffer` as the `imageSrc` prop. The extended test does this automatically.

Edit `svelte-pdf/examples/Extended.svelte` and rerun the command to experiment.

## Quick local visual test

A ready-to-run example is included. It renders a sample Svelte document to both `examples/output.pdf` and `examples/output.png`.

```bash
bun run test:renderer:run -- tests/local-render.test.js
```

After running, open `svelte-pdf/examples/output.png` to see the rendered PDF preview, or open `svelte-pdf/examples/output.pdf` in any PDF reader.

You can edit `svelte-pdf/examples/Hello.svelte` to change what gets rendered, then run the same command again.

## Publishing to npm

The packages are currently source-only and consumed through Vitest aliases. Before publishing you need a build step that:

1. Compiles Svelte components for both browser and server.
2. Resolves `@svelte-pdf/engine/*` TypeScript imports and handles the `yoga-layout` WASM binary so it is not corrupted by bundlers.
3. Produces proper `main` / `module` / `exports` entry points in each `package.json`.

A minimal publishing path would be:

```bash
# 1. Add build scripts (e.g. Rollup or tsup) to each package
# 2. Build all packages
bun run build

# 3. Bump versions
bun run version-packages

# 4. Publish each package
bun publish --workspace packages/renderer
bun publish --workspace packages/markdown
bun publish --workspace packages/engine
```

Until a build pipeline is in place, the packages cannot be published as-is.

## Running tests

```bash
# Install dependencies
bun install

# Renderer tests (Svelte component layer)
bun run test:renderer:run

# Markdown tests
bun run test:markdown:run

# Engine tests (these have pre-existing environmental failures on Node v24)
bun run test:engine

# All tests
bun test run
```

## How to test rendering yourself

You can render any Svelte document component to a PDF buffer on the server:

```js
import { renderToBuffer, renderToFile } from '@svelte-pdf/renderer/server';
import MyDocument from './MyDocument.svelte';

// To a Node Buffer
const buffer = await renderToBuffer(MyDocument, { title: 'Hello' });

// Or to a file
await renderToFile(MyDocument, { title: 'Hello' }, './output.pdf');
```

For browser rendering, use `usePDF()`:

```svelte
<script>
  import { usePDF, PDFViewer } from '@svelte-pdf/renderer';
  import MyDocument from './MyDocument.svelte';

  const pdf = usePDF(MyDocument, { title: 'Hello' });
</script>

{#if pdf.loading}
  <p>Loading PDF...</p>
{:else if pdf.error}
  <p>Error: {pdf.error.message}</p>
{:else}
  <PDFViewer document={MyDocument} documentProps={{ title: 'Hello' }} />
{/if}
```

To visually inspect a generated PDF, convert it to an image with `pdftoppm`:

```bash
pdftoppm -png -r 200 output.pdf preview
```

This generates `preview-1.png`, `preview-2.png`, etc. at 200 DPI.

## Known limitations and risks

- **Build pipeline**: the packages are currently consumed directly from source via Vitest aliases. A real build/publish pipeline will need to handle the `yoga-layout` WASM binary, engine TypeScript ESM resolution, and Svelte server/browser compilation.
- **Browser APIs**: `usePDF`, `PDFViewer`, and `PDFDownloadLink` are implemented but only verified through export and structural tests. They need a browser or jsdom environment for full runtime testing.
- **Engine unit tests**: on the current Node.js version, a subset of engine tests fail due to environmental issues with the `yoga-layout` WASM loader and Node.js v24 Buffer handling. These failures are pre-existing and do not affect the Svelte renderer or markdown packages.

## License

MIT. The original react-pdf project is also licensed under MIT.
