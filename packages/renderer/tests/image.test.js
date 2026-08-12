import { describe, expect, test } from 'vitest';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import fs from 'fs';
import path from 'path';

import ImageDoc from './ImageDoc.svelte';
import renderComponent from './renderComponent.js';

expect.extend({ toMatchImageSnapshot });

const __dirname = dirname(fileURLToPath(import.meta.url));
const snapshotsDir = resolve(__dirname, '__snapshots__');

const readImage = (name) =>
  fs.readFileSync(path.resolve(__dirname, '../../../../packages/renderer/tests/images', name));

describe('visual regression: image', () => {
  test('jpeg orientation 1', async () => {
    const image = await renderComponent(ImageDoc, { imageSrc: readImage('orientation-1.jpeg') });

    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: snapshotsDir,
      customSnapshotIdentifier: 'image-orientation-1',
    });
  });
});
