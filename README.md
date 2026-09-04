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

## Server-side rendering (Node / SvelteKit)

Install the renderer — `@svelte-pdf/engine` comes with it as a dependency:

```bash
npm install @svelte-pdf/renderer
```

Define a document as a Svelte component:

```svelte
<!-- $lib/MyDocument.svelte -->
<script>
  import { Document, Page, View, Text } from '@svelte-pdf/renderer';
</script>

<Document title="Hello svelte-pdf">
  <Page size="A4">
    <View style={{ padding: 48, fontFamily: 'Helvetica' }}>
      <Text style={{ fontSize: 18 }}>Rendered with svelte-pdf!</Text>
    </View>
  </Page>
</Document>
```

Then render it from any Node entry point (API route, script, queue worker…):

```js
import { renderToBuffer } from '@svelte-pdf/renderer/server';
import MyDocument from '$lib/MyDocument.svelte';

const buffer = await renderToBuffer(MyDocument, { title: 'Hello' });
// buffer: Node Buffer containing the PDF
```

`./server` also exports `renderToStream`, `renderToFile`, `pdf`, `Font`, and `version`.

### How it resolves

- `@svelte-pdf/renderer/server` is a **prebuilt ES module** in `dist/server/` with `.d.ts` — no bundler compilation needed on your side.
- The components (`Document`, `Page`, …) ship as **Svelte source** behind the package's `svelte` export condition and are compiled by your app's bundler (Vite + `vite-plugin-svelte`, the same path SvelteKit uses).
- In Vite SSR builds, keep `svelte` and the `./server` subpath **external** so a single Svelte runtime is shared and the prebuilt server bundle is what actually executes (SvelteKit does this by default):

```js
// vite.config.js — only needed in hand-rolled Vite SSR setups, not SvelteKit
ssr: {
  noExternal: [/^@svelte-pdf\/renderer$/],
  external: ['svelte', '@svelte-pdf/renderer/server'],
},
```

Until the packages are published to npm, install them from a local checkout:

```json
{
  "dependencies": {
    "@svelte-pdf/renderer": "file:../svelte-pdf/packages/renderer",
    "@svelte-pdf/engine": "file:../svelte-pdf/packages/engine"
  },
  "overrides": { "@svelte-pdf/engine": "file:../svelte-pdf/packages/engine" }
}
```

The full server flow (clean project → install → Vite SSR build → render) is automated by the acceptance script:

```bash
packages/renderer/scripts/e2e-server-install.sh
```

Run it without arguments for a real registry install, or with `--linked` to wire dependencies from the monorepo's `node_modules` without network access.

## Browser rendering (Vite)

Same install as the server. The browser entry provides the components plus `PDFViewer`, `PDFDownloadLink`, and `usePDF`:

```bash
npm install pdfjs-dist
```

```svelte
<script>
  import { PDFViewer, PDFDownloadLink } from '@svelte-pdf/renderer';
  import MyDocument from '$lib/MyDocument.svelte';
</script>

<PDFViewer document={MyDocument} documentProps={{ title: 'Hello' }} zoom="fit" title="PDF preview" />

<PDFDownloadLink document={MyDocument} fileName="hello.pdf">
  {#snippet children()}Download PDF{/snippet}
</PDFDownloadLink>
```

`PDFViewer` renders each PDF page into a `<canvas>` element using `pdfjs-dist` (the old `iframe` display has been removed because current Chrome versions no longer render blob URLs consistently). You can control the display with:

- `zoom` — either a number or the string `'fit'` (default). `'fit'` scales each page to the container width; numbers are interpreted in PDF points and then converted to CSS pixels (`zoom * 96 / 72`).
- `canvasStyle` — a style object merged onto each page canvas (the default sets `display: block` and `margin: 0 auto`).
- `workerSrc` — URL of the pdfjs worker bundle. In Vite you can import it with `?url` and pass it through:

  ```js
  import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
  ```

  If no worker source is configured, pdfjs falls back to a fake worker with a console warning, but rendering still works in browsers.

### How it resolves

- Bundlers that honor the `svelte` export condition (Vite/vite-plugin-svelte, SvelteKit) compile the components from the shipped Svelte source — one Svelte runtime, correct SSR and client output.
- Bundlers without the `svelte` condition fall back to the **prebuilt** `dist/index.js` (client-compiled components importing the `svelte` peer runtime).
- **yoga-layout**: the engine keeps `yoga-layout` external, and its `./load` module embeds the WASM binary as base64 inside an ESM module — so Vite/esbuild pre-bundling and Rollup builds handle it with **no workaround**. There is no separate `.wasm` asset to serve or protect.

> Browser font caveat: fontkit's browser build has no `open()`, so `Font.register` with a **remote URL** throws at render time. Use standard fonts, or register fonts from data (`src` as a `Buffer`/`Uint8Array`), which go through `fontkit.create`. Fetching remote fonts to data in the engine is planned follow-up work.

The browser flow (clean project → install → client build → bundle asserts) is automated by:

```bash
packages/renderer/scripts/e2e-browser-install.sh
```

Run it without arguments for a real registry install, or with `--linked` for offline use; it keeps the scaffolded project and prints a `vite preview` command for visual confirmation.

## Markdown

Add the optional package:

```bash
npm install @svelte-pdf/markdown
```

Then drop `<Markdown content="..." />` anywhere inside a `<Page>` (it parses the string with `marked` and builds `Text`/`Link`/styled nodes through the context API):

```svelte
<script>
  import { Markdown } from '@svelte-pdf/markdown';
</script>

<Markdown content="# Heading\n\nA paragraph with **bold** and [a link](https://svelte.dev)." />
```

Supported: headings, paragraphs, bold, italic, strikethrough, links, ordered/unordered lists, blockquotes, inline code, code blocks, horizontal rules.

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

Build state:

- `@svelte-pdf/engine` — builds with Rollup (`bun run --cwd packages/engine build`): `dist/` JS + `.d.ts` for every subpath export, `yoga-layout` kept external.
- `@svelte-pdf/renderer` — both entries build: `./server` → `dist/server/` and the browser `.` entry → `dist/index.js` (client-compiled components + `usePDF`/`PDFViewer`/`PDFDownloadLink`), each with `.d.ts`. The `svelte` condition still resolves to `src/` so Vite/SvelteKit compile per environment.
- `@svelte-pdf/markdown` — builds with Rollup: `.` → `dist/index.js` (client-compiled `Markdown` + `.d.ts`), with the `svelte` condition resolving to `src/` so SvelteKit/Vite compile it per environment. Verified by the e2e clean-install script.

Remaining before first publish:

- The Changesets + `bun release` pipeline (ticket 9).
- Known issue: markdown link parsing trips on marked's plain-text tokens (`token.tokens` missing) — see `packages/markdown/src/Markdown.svelte`; this blocks the markdown e2e and one renderer test.

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

- **Build pipeline**: engine, renderer (`./server` + browser entries) and markdown are built (Rollup, `yoga-layout` external). No CI or Changesets wiring exists yet (ticket 9).
- **Markdown link parsing**: `Markdown.svelte` assumes inline tokens always carry a `tokens` array; marked v12 emits plain `text` tokens for simple link children, which throws `"text is not iterable"`. Affects the `all-features` renderer test and any markdown containing links.
- **Build tooling quirk**: rollup's property-value analysis cannot see the ROOT-container mutation that happens inside Svelte's `render()` context, so the renderer's server bundle is built with `treeshake: false` (see `packages/renderer/rollup.config.js`). Re-enable tree-shaking only after verifying the `renderToBuffer`/`renderToStream` bodies survive.
- **Browser fonts**: `fontkit.open` (used for remote-URL fonts) is absent from fontkit's browser build, so custom remote fonts fail in the browser — standard fonts and `Buffer`/`Uint8Array` sources work. Fetching remote fonts to data is follow-up engine work.
- **Browser APIs**: `usePDF`, `PDFViewer`, and `PDFDownloadLink` are verified through the browser-entry smoke test and the e2e Vite bundle build; full runtime verification needs a real browser (`packages/renderer/scripts/e2e-browser-install.sh` prints a `vite preview` command).
- **Engine unit tests**: on the current Node.js version, a subset of engine tests fail due to environmental issues with the `yoga-layout` WASM loader and Node.js v24 Buffer handling. These failures are pre-existing and do not affect the Svelte renderer or markdown packages.

## License

MIT. The original react-pdf project is also licensed under MIT.
