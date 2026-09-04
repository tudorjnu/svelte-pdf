<script>
  import usePDF from './usePDF.svelte.js';
  import { drawPdfPages } from './pdfjs-pages.js';

  const {
    document: DocumentComponent,
    documentProps = {},
    zoom = 'fit',
    title,
    style,
    className,
    canvasStyle,
    workerSrc,
    ...rest
  } = $props();

  const instance = usePDF(DocumentComponent, documentProps);

  let initialized = false;
  let pagesEl = $state(null);
  let pages = $state(0);
  let drawGen = $state(0);
  let currentHandle = $state(null);
  let drawError = $state(null);

  $effect(() => {
    DocumentComponent;
    documentProps;

    if (initialized) {
      instance.update(DocumentComponent, documentProps);
    }
    initialized = true;
  });

  function fitScaleFor(container, paddingPx = 32) {
    const width = container?.clientWidth ?? 794;
    return Math.max(0.3, (width - paddingPx) / 595.28);
  }

  function cssScaleFor(container) {
    return zoom === 'fit' ? fitScaleFor(container) : zoom * (96 / 72);
  }

  function findScrollableAncestor(el) {
    let node = el?.parentElement;
    while (node) {
      const overflowY = window.getComputedStyle(node).overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  }

  function anchorScrollDuring(swapFn) {
    const ancestor = findScrollableAncestor(pagesEl);
    if (!ancestor || !pagesEl) {
      swapFn();
      return;
    }
    const before = pagesEl.getBoundingClientRect().top;
    swapFn();
    const after = pagesEl.getBoundingClientRect().top;
    const delta = after - before;
    if (Math.abs(delta) > 0.5) {
      ancestor.scrollBy({ top: delta });
    }
  }

  $effect(() => {
    const blob = instance.blob;
    const currentZoom = zoom;
    const container = pagesEl;

    if (!blob || !container) return;

    const gen = ++drawGen;

    (async () => {
      try {
        const bytes = new Uint8Array(await blob.arrayBuffer());
        if (gen !== drawGen) return;

        const cssScale = cssScaleFor(container);
        const stage = document.createElement('div');

        const handle = await drawPdfPages(stage, bytes, {
          cssScale,
          canvasStyle,
          workerSrc,
        });

        if (gen !== drawGen) {
          handle.destroy();
          return;
        }

        anchorScrollDuring(() => {
          currentHandle?.destroy();
          container.replaceChildren(...Array.from(stage.childNodes));
          currentHandle = handle;
          pages = handle.pages;
        });
        drawError = null;
      } catch (e) {
        // Draw failures (bad pdfjs worker, corrupt bytes) must surface —
        // an unhandled rejection would leave the viewer silently blank.
        if (gen === drawGen) drawError = e;
      }
    })();
  });

  $effect(() => {
    return () => {
      currentHandle?.destroy();
      currentHandle = null;
    };
  });

</script>

<div
  bind:this={pagesEl}
  class={className}
  {style}
  aria-label={title}
  {...rest}
>
  {#if !pages && instance.loading}
    <div>Rendering…</div>
  {/if}
</div>

{#if drawError || instance.error}
  <div role="alert">{(drawError ?? instance.error)?.message ?? String(drawError ?? instance.error)}</div>
{/if}
