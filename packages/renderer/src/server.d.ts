import type { Component } from 'svelte';
import type { ReadableStream } from 'node:stream/web';

export { pdf, Font, version } from './pdf.js';

export function renderToBuffer(
  Component: Component,
  props?: Record<string, unknown>,
): Promise<Buffer>;

export function renderToStream(
  Component: Component,
  props?: Record<string, unknown>,
): Promise<ReadableStream>;

export function renderToFile(
  Component: Component,
  props: Record<string, unknown> | undefined,
  filePath: string,
  callback?: (stream: ReadableStream, filePath: string) => void,
): Promise<ReadableStream>;
