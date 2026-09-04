import { describe, expect, test } from 'vitest';
import { createCanvas } from '@napi-rs/canvas';

import { drawPdfPages } from '../src/pdfjs-pages.js';
import { renderToBuffer } from '../src/renderToBuffer.js';
import SimpleTextDoc from './SimpleTextDoc.svelte';

async function buildPdf() {
  const buffer = await renderToBuffer(SimpleTextDoc, { title: 'drawPdfPages test' });
  return new Uint8Array(buffer);
}

function makeCreateCanvas(container) {
  return (width, height) => {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    canvas.remove = () => {
      if (container) container.removeChild(canvas);
    };
    return { canvas, context };
  };
}

function makeFakeContainer() {
  const children = [];
  return {
    children,
    appendChild(c) {
      children.push(c);
    },
    removeChild(c) {
      const index = children.indexOf(c);
      if (index >= 0) children.splice(index, 1);
    },
  };
}

describe('drawPdfPages', () => {
  test('renders real PDF pages with non-empty canvases', { timeout: 60_000 }, async () => {
    const data = await buildPdf();
    const container = makeFakeContainer();
    const createCanvas = makeCreateCanvas(container);

    const handle = await drawPdfPages(container, data, {
      cssScale: 1,
      createCanvas,
    });

    expect(handle.pages).toBeGreaterThan(0);
    expect(container.children.length).toBeGreaterThan(0);

    for (const canvas of container.children) {
      expect(canvas.width).toBeGreaterThan(0);
      expect(canvas.height).toBeGreaterThan(0);

      const imageData = canvas
        .getContext('2d')
        .getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      let nonZero = false;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] !== 0 || pixels[i + 1] !== 0 || pixels[i + 2] !== 0) {
          nonZero = true;
          break;
        }
      }
      expect(nonZero).toBe(true);
    }

    handle.destroy();
  });

  test('cancelling before render yields no canvases', { timeout: 60_000 }, async () => {
    const data = await buildPdf();
    const container = makeFakeContainer();
    const createCanvas = makeCreateCanvas(container);

    const handle = await drawPdfPages(container, data, {
      cssScale: 1,
      createCanvas,
      isCancelled: () => true,
    });

    expect(handle.pages).toBeGreaterThan(0);
    expect(container.children.length).toBe(0);

    handle.destroy();
  });
});
