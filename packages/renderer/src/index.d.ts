import type { Component } from 'svelte';

export { pdf, Font, version } from './pdf.js';

export function usePDF(
  component: Component,
  props?: Record<string, unknown>,
): {
  readonly url: string | null;
  readonly blob: Blob | null;
  readonly loading: boolean;
  readonly error: Error | null;
  update(component?: Component, props?: Record<string, unknown>): void;
};

export { default as Document } from './Document.svelte';
export { default as Page } from './Page.svelte';
export { default as View } from './View.svelte';
export { default as Text } from './Text.svelte';
export { default as Link } from './Link.svelte';
export { default as Note } from './Note.svelte';
export { default as Image } from './Image.svelte';

export { default as PDFViewer } from './PDFViewer.svelte';
export { default as PDFDownloadLink } from './PDFDownloadLink.svelte';

export type SveltePDFComponent = Component;
