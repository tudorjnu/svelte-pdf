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

## Known limitations and risks

- **Build pipeline**: the packages are currently consumed directly from source via Vitest aliases. A real build/publish pipeline will need to handle the `yoga-layout` WASM binary, engine TypeScript ESM resolution, and Svelte server/browser compilation.
- **Browser APIs**: `usePDF`, `PDFViewer`, and `PDFDownloadLink` are implemented but only verified through export and structural tests. They need a browser or jsdom environment for full runtime testing.
- **Engine unit tests**: on the current Node.js version, a subset of engine tests fail due to environmental issues with the `yoga-layout` WASM loader and Node.js v24 Buffer handling. These failures are pre-existing and do not affect the Svelte renderer or markdown packages.

## License

MIT. The original react-pdf project is also licensed under MIT.
