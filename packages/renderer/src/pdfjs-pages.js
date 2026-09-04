import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

/**
 * @typedef {Object} DrawOpts
 * @property {number} cssScale
 * @property {number} [dpr]
 * @property {() => boolean} [isCancelled]
 * @property {(pages: number) => void} [onPages]
 * @property {string} [workerSrc]
 * @property {(width: number, height: number) => { canvas: any; context: any }} [createCanvas]
 * @property {Record<string, string>} [canvasStyle]
 */

/**
 * @typedef {Object} DrawHandle
 * @property {number} pages
 * @property {() => void} destroy
 */

const DEFAULT_CANVAS_STYLE = {
  display: 'block',
  margin: '0 auto',
};

/**
 * Render PDF pages as `<canvas>` elements into `container` using pdfjs-dist.
 *
 * The caller is responsible for configuring pdfjs's worker source. In a
 * bundler that supports `?url` imports you can do:
 *
 *   import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
 *   GlobalWorkerOptions.workerSrc = workerUrl;
 *
 * and then pass that same URL as `workerSrc` when calling this helper.
 * Without a worker source, pdfjs falls back to a fake worker and prints a
 * console warning, but rendering still works in browsers.
 *
 * @param {HTMLElement} container
 * @param {Uint8Array} data
 * @param {DrawOpts} opts
 * @returns {Promise<DrawHandle>}
 */
export async function drawPdfPages(container, data, opts) {
  const dpr = Math.min(
    (opts.dpr ?? (typeof window !== 'undefined' ? window.devicePixelRatio : 1)) || 1,
    2,
  );
  const mine = [];
  let cancelled = false;
  const isCancelled = () => cancelled || (opts.isCancelled?.() ?? false);

  if (opts.workerSrc) {
    GlobalWorkerOptions.workerSrc = opts.workerSrc;
  }

  const loadingTask = getDocument({ data: data.slice() });
  const doc = await loadingTask.promise;

  const destroy = () => {
    if (cancelled) return;
    cancelled = true;
    for (const canvas of mine) {
      if (typeof canvas.remove === 'function') {
        canvas.remove();
      }
    }
    mine.length = 0;
    void loadingTask.destroy();
  };

  if (isCancelled()) {
    return { pages: doc.numPages, destroy };
  }

  opts.onPages?.(doc.numPages);

  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
    if (isCancelled()) break;

    const page = await doc.getPage(pageNumber);
    if (isCancelled()) {
      page.cleanup();
      break;
    }

    const viewport = page.getViewport({ scale: opts.cssScale });

    const width = Math.floor(viewport.width * dpr);
    const height = Math.floor(viewport.height * dpr);

    let canvas;
    let context;

    if (opts.createCanvas) {
      const result = opts.createCanvas(width, height);
      canvas = result.canvas;
      context = result.context;
    } else {
      canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      context = canvas.getContext('2d');
      if (!context) throw new Error('canvas 2d context unavailable');
    }

    if (canvas.style) {
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      const style = { ...DEFAULT_CANVAS_STYLE, ...(opts.canvasStyle ?? {}) };
      for (const [key, value] of Object.entries(style)) {
        canvas.style[key] = value;
      }
    }

    container.appendChild(canvas);
    mine.push(canvas);

    try {
      await page
        .render({
          canvas,
          canvasContext: context,
          viewport,
          transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
        })
        .promise;
    } catch (e) {
      if (!isCancelled()) throw e;
    }

    page.cleanup();
  }

  return { pages: doc.numPages, destroy };
}
