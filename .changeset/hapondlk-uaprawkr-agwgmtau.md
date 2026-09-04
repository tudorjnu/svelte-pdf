---
'@svelte-pdf/renderer': minor
---

PDFViewer renders via pdfjs canvases — the blob-URL iframe display (broken on current Chrome: blank with a fragment, download prompt without) is gone. New props: `zoom` ('fit' | number), `canvasStyle`, `workerSrc`; failures surface in the viewer instead of silently blanking. `drawPdfPages` is exported (also via a new engine-free `@svelte-pdf/renderer/pdfjs-pages` subpath) with an injectable canvas factory for node tests. `pdfjs-dist` is now a peer dependency. Real-browser coverage added (chrome-headless-shell + vite fixture).
