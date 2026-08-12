import { describe, expect, test } from 'vitest';

import SimpleTextDoc from './SimpleTextDoc.svelte';
import { renderToBuffer } from '../src/renderToBuffer.js';

describe('renderToBuffer', () => {
  test('produces a non-empty PDF buffer', async () => {
    const buffer = await renderToBuffer(SimpleTextDoc, {
      color: '#ff0000',
      textValue: 'Hello svelte-pdf',
    });

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.toString('ascii', 0, 4)).toBe('%PDF');
  });
});
