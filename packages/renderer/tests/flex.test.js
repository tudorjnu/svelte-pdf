import { describe, expect, test } from 'vitest';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import FlexDoc from './FlexDoc.svelte';
import renderComponent from './renderComponent.js';

expect.extend({ toMatchImageSnapshot });

const __dirname = dirname(fileURLToPath(import.meta.url));
const snapshotsDir = resolve(__dirname, '__snapshots__');

describe('visual regression: flex', () => {
  test('flex auto', async () => {
    const image = await renderComponent(FlexDoc, { flex1: 'auto', flex2: 'auto' });

    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: snapshotsDir,
      customSnapshotIdentifier: 'flex-auto',
    });
  });

  test('flex grow', async () => {
    const image = await renderComponent(FlexDoc, { flex1: '1', flex2: '2' });

    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: snapshotsDir,
      customSnapshotIdentifier: 'flex-grow',
    });
  });
});
