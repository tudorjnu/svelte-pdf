import { describe, expect, test } from 'vitest';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import BordersDoc from './BordersDoc.svelte';
import renderComponent from './renderComponent.js';

expect.extend({ toMatchImageSnapshot });

const __dirname = dirname(fileURLToPath(import.meta.url));
const snapshotsDir = resolve(__dirname, '__snapshots__');

describe('visual regression: borders', () => {
  test('uniform solid border', async () => {
    const image = await renderComponent(BordersDoc);

    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: snapshotsDir,
      customSnapshotIdentifier: 'borders-uniform-solid',
    });
  });

  test('uniform dashed border', async () => {
    const image = await renderComponent(BordersDoc, { borderStyle: 'dashed' });

    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: snapshotsDir,
      customSnapshotIdentifier: 'borders-uniform-dashed',
    });
  });

  test('uniform dotted border', async () => {
    const image = await renderComponent(BordersDoc, { borderStyle: 'dotted' });

    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: snapshotsDir,
      customSnapshotIdentifier: 'borders-uniform-dotted',
    });
  });

  test('border with radius', async () => {
    const image = await renderComponent(BordersDoc, { borderRadius: 10 });

    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: snapshotsDir,
      customSnapshotIdentifier: 'borders-radius',
    });
  });
});
