import { test } from 'vitest';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

import { renderToBuffer, renderToFile } from '@svelte-pdf/renderer/server';
import Hello from '../../examples/Hello.svelte';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(__dirname, '../../../examples');
const outputPdf = resolve(outputDir, 'output.pdf');
const outputPng = resolve(outputDir, 'output.png');

class CanvasFactory {
  create(width, height) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    return { canvas, context };
  }
  reset({ canvas }, width, height) {
    canvas.width = width;
    canvas.height = height;
  }
  destroy() {}
}

test('render local example PDF and PNG preview', { timeout: 60_000 }, async () => {
  const outputPdf = resolve(outputDir, 'output.pdf');
  const outputPng = resolve(outputDir, 'output.png');

  await renderToFile(Hello, { title: 'Local visual test' }, outputPdf);

  const buffer = await renderToBuffer(Hello, { title: 'Local visual test' });

  const document = await getDocument({
    data: new Uint8Array(buffer),
    verbosity: 0,
    CanvasFactory,
  }).promise;

  const page = await document.getPage(1);
  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext('2d');

  await page.render({ canvasContext: context, viewport }).promise;

  writeFileSync(outputPng, canvas.toBuffer('image/png'));

  console.log('PDF written to', outputPdf);
  console.log('PNG preview written to', outputPng);

  await document.destroy();
});
