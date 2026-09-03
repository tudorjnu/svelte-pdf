import type { Readable } from 'node:stream';

/** The plain-object tree root captured from Svelte's render(). */
export interface PDFContainer {
  type: 'ROOT';
  document: unknown | null;
  onChange?: (params?: unknown) => void;
}

/** Result of a full layout + render pass through the engine. */
export interface RenderedPDF {
  container: PDFContainer;
  /** Runs layout + render and resolves to the PDF node stream. */
  toBuffer(): Promise<Readable>;
  /** Runs layout + render and resolves to a PDF Blob (browser-friendly). */
  toBlob(): Promise<Blob>;
}

export declare const pdf: (
  initialValue?: unknown,
  options?: {
    /** Called after each render with layout data / blob. */
    onChange?: (params?: Record<string, unknown>) => void;
  },
) => RenderedPDF;

export interface FontSource {
  src: string;
  family: string;
  weight?: number;
  style?: string;
}

export declare const Font: {
  register(src: string | FontSource, family?: string): void;
  registerHyphenationCallback(callback: (word: string) => string[]): void;
  registerEmojiSource(source: {
    url: string;
    format?: 'png' | 'jpg' | 'jpeg';
  }): void;
};

export declare const version: string;
