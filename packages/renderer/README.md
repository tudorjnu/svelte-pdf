# @svelte-pdf/renderer

Create PDF documents with [Svelte 5](https://svelte.dev/) components — on the browser and the server. The Svelte layer of [svelte-pdf](https://github.com/tudorjnu/svelte-pdf), built on the vendored react-pdf engine [`@svelte-pdf/engine`](https://www.npmjs.com/package/@svelte-pdf/engine).

## Installation

```bash
npm install @svelte-pdf/renderer
```

Installs `@svelte-pdf/engine` as a dependency.

## Components

PDF components: `Document`, `Page`, `View`, `Text`, `Link`, `Note`, `Image`.

Browser components: `PDFViewer` (renders the PDF in an iframe), `PDFDownloadLink` (triggers a download). The `usePDF()` function returns reactive state `{ url, blob, loading, error }` that follows document changes.

The `Font` registration API (`register`, `registerHyphenationCallback`, `registerEmojiSource`) is exported from the root entry.

## Server-side rendering

Server APIs live behind the `./server` export so bundlers can tree-shake them out of client builds:

```js
import { renderToBuffer } from '@svelte-pdf/renderer/server';
import MyDocument from './MyDocument.svelte';

const buffer = await renderToBuffer(MyDocument, { title: 'Hello' });
```

Available APIs: `renderToBuffer`, `renderToStream`, `renderToFile`.

## Full documentation

See the [repo README](https://github.com/tudorjnu/svelte-pdf#readme) for component props, styling, fonts, markdown support, and SvelteKit/bundler setup.

## License

MIT.
