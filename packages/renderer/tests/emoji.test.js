import { describe, expect, test } from 'vitest';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import EmojiDoc from './EmojiDoc.svelte';
import renderComponent from './renderComponent.js';
import { Font } from '../src/index.js';

expect.extend({ toMatchImageSnapshot });

const __dirname = dirname(fileURLToPath(import.meta.url));
const snapshotsDir = resolve(__dirname, '__snapshots__');

describe('visual regression: emoji', () => {
  test('builder emoji source', async () => {
    Font.registerEmojiSource({
      builder: (code) =>
        `https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/${code.toLowerCase()}_3d.png`,
    });

    const image = await renderComponent(EmojiDoc, { emoji: '💩' });

    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: snapshotsDir,
      customSnapshotIdentifier: 'emoji-builder',
    });
  }, 30_000);

  test('twemoji source', async () => {
    Font.registerEmojiSource({
      format: 'png',
      url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/',
    });

    const image = await renderComponent(EmojiDoc, { emoji: '🦫' });

    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: snapshotsDir,
      customSnapshotIdentifier: 'emoji-twemoji',
    });
  }, 30_000);
});
