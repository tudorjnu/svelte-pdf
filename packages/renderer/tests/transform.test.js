import { describe, expect, test } from 'vitest';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import TransformDoc from './TransformDoc.svelte';
import renderComponent from './renderComponent.js';

expect.extend({ toMatchImageSnapshot });

const __dirname = dirname(fileURLToPath(import.meta.url));
const snapshotsDir = resolve(__dirname, '__snapshots__');

describe('visual regression: transform', () => {
  const cases = [
    ['scale-2', 'scale(0.5, 0.5)'],
    ['scale-1', 'scale(0.5)'],
    ['scale-x', 'scaleX(0.5)'],
    ['scale-y', 'scaleY(0.5)'],
    ['translate-x-0', 'translateX(0px)', 5, 5],
    ['translate-x', 'translateX(15px)', 5, 5],
    ['translate-y', 'translateY(15px)', 5, 5],
    ['translate-xy', 'translate(15px, 15px)', 5, 5],
    ['rotate', 'rotate(45deg)', 15, 15],
  ];

  for (const [name, transform, width = 20, height = 20] of cases) {
    test(`${name}`, async () => {
      const image = await renderComponent(TransformDoc, {
        transform,
        width,
        height,
      });

      expect(image).toMatchImageSnapshot({
        customSnapshotsDir: snapshotsDir,
        customSnapshotIdentifier: `transform-${name}`,
      });
    });
  }
});
