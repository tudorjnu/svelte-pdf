import { describe, expect, test } from 'vitest';
import FontStore from '@svelte-pdf/engine/font';

import { loadYoga } from '@svelte-pdf/engine/layout/yoga';

import resolveTextLayout from '@svelte-pdf/engine/layout/steps/resolveTextLayout';
import resolveDimensions from '@svelte-pdf/engine/layout/steps/resolveDimensions';
import { SafeDocumentNode } from '@svelte-pdf/engine/layout/types';

const fontStore = new FontStore();

const getRoot = async (
  text = 'hello world',
  styles = {},
): Promise<SafeDocumentNode> => ({
  type: 'DOCUMENT',
  props: {},
  yoga: await loadYoga(),
  children: [
    {
      type: 'PAGE',
      props: {},
      style: {
        width: 100,
        height: 100,
      },
      children: [
        {
          type: 'TEXT',
          style: styles,
          props: {},
          children: [
            {
              type: 'TEXT_INSTANCE',
              value: text,
            },
          ],
        },
      ],
    },
  ],
});

describe('text layout step', () => {
  const getText = (root) => root.children[0].children[0];

  test('should calculate lines for text while resolve dimensions', async () => {
    const root = await getRoot('text text text');
    const dimensions = resolveDimensions(root, fontStore);

    expect(getText(dimensions).lines).toBeDefined();
  });

  test('should calculate lines for text width defined height', async () => {
    const root = await getRoot('text text text', { height: 50 });
    const dimensions = resolveDimensions(root, fontStore);

    expect(getText(dimensions).lines).not.toBeDefined();

    const textLayout = resolveTextLayout(dimensions, fontStore);

    expect(getText(textLayout).lines).toBeDefined();
  });

  test('should calculate lines for empty text', async () => {
    const root = await getRoot('');
    const dimensions = resolveDimensions(root, fontStore);

    expect(getText(dimensions).lines).toBeDefined();
  });
});
