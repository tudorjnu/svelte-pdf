<script>
  import { onMount } from 'svelte';
  // Direct subpath import — engine-free (index.js pulls the Node-only engine,
  // finding #1; a browser page must not import it until that is fixed).
  import { drawPdfPages } from '../../../src/pdfjs-pages.js';

  let container = $state(null);
  let error = $state(null);
  let pages = $state(0);

  onMount(async () => {
    try {
      const res = await fetch('./sample.pdf');
      if (!res.ok) throw new Error(`fixture fetch failed: ${res.status}`);
      const data = new Uint8Array(await res.arrayBuffer());
      // pdfjs v4 in a browser REQUIRES an explicit worker (node falls back to
      // a fake worker automatically — that's why the node suite passes without
      // it). Use the library's workerSrc option so it lands on the SAME pdfjs
      // instance drawPdfPages uses (modern vs legacy builds keep separate
      // GlobalWorkerOptions singletons).
      const handle = await drawPdfPages(container, data, {
        cssScale: 1,
        workerSrc: new URL(
          'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
          import.meta.url,
        ).href,
      });
      pages = handle.pages;
    } catch (e) {
      error = e;
    }
  });
</script>

<div id="viewer-canvas" bind:this={container}></div>
{#if error}<div id="demo-error" role="alert">{error.message}</div>{/if}
{#if pages}<div id="demo-pages">{pages}</div>{/if}