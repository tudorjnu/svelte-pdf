import { describe, expect, test } from 'vitest';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import DebugDoc from './DebugDoc.svelte';
import renderComponent from './renderComponent.js';

expect.extend({ toMatchImageSnapshot });

const __dirname = dirname(fileURLToPath(import.meta.url));
const snapshotsDir = resolve(__dirname, '__snapshots__');

describe('visual regression: debug', () => {
  test('debug on Text component', async () => {
    const image = await renderComponent(DebugDoc, { debug: true });

    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: snapshotsDir,
      customSnapshotIdentifier: 'debug-text',
    });
  });

  test('debug false does not show debug overlay', async () => {
    const image = await renderComponent(DebugDoc, { debug: false });

    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: snapshotsDir,
      customSnapshotIdentifier: 'debug-false',
    });
  });
});
