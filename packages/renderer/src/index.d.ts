import type { Component, Snippet } from 'svelte';

export { pdf, Font, version } from './pdf.js';

/** Props shared by every element component. */
export interface BaseProps {
  style?: Record<string, unknown>;
  id?: string;
  /** Outline/bookmark configuration. */
  bookmark?: unknown;
  /** Page-break behavior, e.g. `before`, `after`, `avoid`. */
  break?: boolean | string;
  debug?: boolean;
  /** Render on every page instead of only where placed. */
  fixed?: boolean;
  minPresenceAhead?: number;
  /** Rendered callback invoked with `{ pageNumber, totalPages }` while laying out pages. */
  render?: (props: { pageNumber: number; totalPages: number }) => unknown;
  children?: Snippet;
}

export declare const Document: Component<
  BaseProps & {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string | string[];
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
    pageLayout?: Record<string, unknown>;
    pageMode?: 'useNone' | 'useOutlines' | 'useThumbs' | 'fullscreen';
    language?: string;
    pdfVersion?: string;
    ownerPassword?: string;
    userPassword?: string;
    permissions?: unknown;
    onRender?: (params: Record<string, unknown>) => void;
  }
>;

export declare const Page: Component<
  BaseProps & {
    /** Page size, e.g. `'A4'`, `'LETTER'`, or `[width, height]` in points. */
    size?: string | [number, number];
    orientation?: 'portrait' | 'landscape';
    dpi?: number;
    wrap?: boolean;
  }
>;

export declare const View: Component<BaseProps & { wrap?: boolean }>;

export declare const Text: Component<
  BaseProps & {
    /** Text content. This is the supported way to set text (no template children). */
    value?: string | number;
    orphans?: number;
    widows?: number;
    hyphenationCallback?: (word: string) => string[];
  }
>;

export declare const Link: Component<
  BaseProps & {
    /** Link target (URL or internal destination id). */
    src?: string;
    href?: string;
    hitSlop?: number | Record<string, number>;
  }
>;

export declare const Note: Component<
  BaseProps & { value?: string; wrap?: boolean }
>;

export declare const Image: Component<
  BaseProps & {
    /** Image URL or local Buffer. */
    src?: string | Uint8Array;
    srcSet?: unknown;
    sizes?: string;
    source?: unknown;
    cache?: boolean;
    wrap?: boolean;
    x?: number;
    y?: number;
  }
>;

export declare const PDFViewer: Component<
  {
    /** The document component to render. */
    document: Component;
    documentProps?: Record<string, unknown>;
    showToolbar?: boolean;
    title?: string;
    style?: string | Record<string, string>;
    className?: string;
  } & Record<string, unknown>
>;

export declare const PDFDownloadLink: Component<
  {
    /** The document component to render. */
    document: Component;
    documentProps?: Record<string, unknown>;
    fileName?: string;
    className?: string;
    children?: Snippet;
    onclick?: (event: unknown) => void;
    href?: string;
  } & Record<string, unknown>
>;

export declare const usePDF: (
  component: Component,
  props?: Record<string, unknown>,
) => {
  readonly url: string | null;
  readonly blob: Blob | null;
  readonly loading: boolean;
  readonly error: Error | null;
  update(component?: Component, props?: Record<string, unknown>): void;
};

export type SveltePDFComponent = Component;
