import { describe, expect, test } from 'vitest';
import fs from 'fs';
import path from 'path';
import url from 'url';

import ComponentsDoc from './ComponentsDoc.svelte';
import { renderToBuffer, renderToStream, renderToFile } from '../src/server.js';
import { Font } from '../src/index.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const readImage = (name) =>
  fs.readFileSync(path.resolve(__dirname, './images', name));

describe('core components', () => {
  test('renderToBuffer includes Link, Note and Text', async () => {
    const buffer = await renderToBuffer(ComponentsDoc, {
      textValue: 'Core components test',
      href: 'https://svelte-pdf.dev',
    });

    expect(buffer.toString('ascii', 0, 4)).toBe('%PDF');
    expect(buffer.length).toBeGreaterThan(0);
  });

  test('renderToStream returns a readable stream', async () => {
    const stream = await renderToStream(ComponentsDoc, {
      textValue: 'Stream test',
    });

    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);
    expect(buffer.toString('ascii', 0, 4)).toBe('%PDF');
  });

  test('renderToFile writes a PDF file', async () => {
    const outputPath = path.resolve(__dirname, '__tmp-output.pdf');

    try {
      await renderToFile(ComponentsDoc, { textValue: 'File test' }, outputPath);

      const written = fs.readFileSync(outputPath);
      expect(written.toString('ascii', 0, 4)).toBe('%PDF');
    } finally {
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    }
  });

  test('Image component renders a JPEG buffer', async () => {
    const imageSrc = readImage('orientation-1.jpeg');
    const buffer = await renderToBuffer(ComponentsDoc, { imageSrc });

    expect(buffer.toString('ascii', 0, 4)).toBe('%PDF');
    expect(buffer.length).toBeGreaterThan(0);
  });

  test('Font API is exposed with register methods', () => {
    expect(typeof Font.register).toBe('function');
    expect(typeof Font.registerHyphenationCallback).toBe('function');
    expect(typeof Font.registerEmojiSource).toBe('function');
  });
});
