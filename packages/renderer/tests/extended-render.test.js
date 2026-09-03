import { test } from 'vitest';
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

import { renderToBuffer, renderToFile } from '@svelte-pdf/renderer/server';
import Extended from '../../../examples/Extended.svelte';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(__dirname, '../../../examples');
const localImage = readFileSync(
  resolve(__dirname, '../../../../packages/renderer/tests/images/orientation-1.jpeg'),
);

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

test('render extended example PDF and PNG preview', { timeout: 120_000 }, async () => {
  const outputPdf = resolve(outputDir, 'extended.pdf');
  const outputPng = resolve(outputDir, 'extended.png');

  await renderToFile(
    Extended,
    { title: 'Extended feature demo', showImage: true, imageSrc: localImage, pageCountOffset: 0 },
    outputPdf,
  );

  const buffer = await renderToBuffer(
    Extended,
    { title: 'Extended feature demo', showImage: true, imageSrc: localImage, pageCountOffset: 0 },
  );

  const document = await getDocument({
    data: new Uint8Array(buffer),
    verbosity: 0,
    CanvasFactory,
  }).promise;

  const pages = await Promise.all(
    Array.from({ length: document.numPages }, (_, i) =>
      document.getPage(i + 1),
    ),
  );

  const [maxWidth, totalHeight, scaledPages] = pages.reduce(
    ([width, height, list], page) => {
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d');
      return [
        Math.max(width, viewport.width),
        height + viewport.height + 10,
        [...list, { page, viewport, canvas, context }],
      ];
    },
    [0, 0, []],
  );

  const composed = createCanvas(maxWidth, totalHeight - 10);
  const composedContext = composed.getContext('2d');

  let offsetY = 0;
  for (const { page, viewport, canvas, context } of scaledPages) {
    await page.render({ canvasContext: context, viewport }).promise;
    composedContext.drawImage(canvas, 0, offsetY);
    offsetY += viewport.height + 10;
  }

  writeFileSync(outputPng, composed.toBuffer('image/png'));

  console.log('Extended PDF written to', outputPdf);
  console.log('Extended PNG preview written to', outputPng);

  for (const { page } of scaledPages) {
    await page.cleanup();
  }
  await document.destroy();
});
