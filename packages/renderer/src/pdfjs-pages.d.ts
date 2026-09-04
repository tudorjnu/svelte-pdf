import type { GlobalWorkerOptions as GlobalWorkerOptionsType } from 'pdfjs-dist';

export interface DrawOpts {
  /** CSS scale: pdf points are 72/in, CSS px 96/in (zoom × 96/72). */
  cssScale: number;
  /** Device-pixel-ratio for the backing store (default: window.devicePixelRatio, capped at 2). */
  dpr?: number;
  /** Polled between pages — return true when a newer draw supersedes this one. */
  isCancelled?: () => boolean;
  /** Called once when the document is loaded (numPages known). */
  onPages?: (pages: number) => void;
  /**
   * Set pdfjs's GlobalWorkerOptions.workerSrc before loading.
   * If omitted, whatever the consumer configured stands (browsers without a
   * worker fall back to pdfjs's fake worker with a console warning).
   */
  workerSrc?: string;
  /**
   * Canvas factory injection for non-DOM environments (e.g. node tests via
   * @napi-rs/canvas). Defaults to document.createElement('canvas').
   */
  createCanvas?: (
    width: number,
    height: number,
  ) => { canvas: unknown; context: unknown };
  /** Extra styles merged over the default structural canvas styles. */
  canvasStyle?: Record<string, string>;
}

export interface DrawHandle {
  pages: number;
  /**
   * Cancels an in-flight draw, removes its canvases, frees the document.
   * Idempotent.
   */
  destroy: () => void;
}

/**
 * Render every page of a PDF into `container` as canvases (pdfjs), stacked
 * vertically. Copies `data` before handing it to pdfjs (pdfjs transfers/
 * detaches the buffer it is given, which would break redraws from the same
 * bytes). Engine-independent — imports pdfjs only.
 */
export declare function drawPdfPages(
  container: { appendChild(node: unknown): void },
  data: Uint8Array,
  opts: DrawOpts,
): Promise<DrawHandle>;

export declare const GlobalWorkerOptions: typeof GlobalWorkerOptionsType;