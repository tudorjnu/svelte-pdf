import { describe, expect, test } from 'vitest';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import fs from 'fs';
import path from 'path';

import SrcSetDoc from './SrcSetDoc.svelte';
import renderComponent from './renderComponent.js';

expect.extend({ toMatchImageSnapshot });

const __dirname = dirname(fileURLToPath(import.meta.url));
const snapshotsDir = resolve(__dirname, '__snapshots__');

const readImage = (name) =>
  fs.readFileSync(
    path.resolve(__dirname, './images', name),
  );

describe('visual regression: srcSet', () => {
  test('selects different sources based on page width', async () => {
    const small = readImage('srcset-small.png');
    const medium = readImage('srcset-medium.png');
    const large = readImage('srcset-large.png');
    const srcSet = `${small} 200w, ${medium} 400w, ${large} 600w`;

    const image = await renderComponent(SrcSetDoc, { src: small, srcSet });

    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: snapshotsDir,
      customSnapshotIdentifier: 'srcset-page-width',
    });
  });
});
