import { describe, expect, test } from 'vitest';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import SimpleTextDoc from './SimpleTextDoc.svelte';
import renderComponent from './renderComponent.js';

expect.extend({ toMatchImageSnapshot });

const __dirname = dirname(fileURLToPath(import.meta.url));
const snapshotsDir = resolve(__dirname, '__snapshots__');

describe('visual regression', () => {
  test('simple text document matches baseline', async () => {
    const image = await renderComponent(SimpleTextDoc, {
      color: '#ff0000',
      textValue: 'Hello svelte-pdf',
    });

    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: snapshotsDir,
      customSnapshotIdentifier: 'simple-text-doc',
    });
  });
});
