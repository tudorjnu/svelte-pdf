import { describe, expect, test } from 'vitest';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import OrphanDoc from './OrphanDoc.svelte';
import renderComponent from './renderComponent.js';

expect.extend({ toMatchImageSnapshot });

const __dirname = dirname(fileURLToPath(import.meta.url));
const snapshotsDir = resolve(__dirname, '__snapshots__');

describe('visual regression: orphan text', () => {
  test('empty string', async () => {
    const image = await renderComponent(OrphanDoc, { textValue: '' });

    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: snapshotsDir,
      customSnapshotIdentifier: 'orphan-empty',
    });
  });

  test('regular string', async () => {
    const image = await renderComponent(OrphanDoc, { textValue: 'text' });

    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: snapshotsDir,
      customSnapshotIdentifier: 'orphan-string',
    });
  });

  test('number value', async () => {
    const image = await renderComponent(OrphanDoc, { textValue: 10 });

    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: snapshotsDir,
      customSnapshotIdentifier: 'orphan-number',
    });
  });
});
