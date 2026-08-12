import { describe, expect, test } from 'vitest';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import MarkdownDoc from './MarkdownDoc.svelte';
import renderComponent from './renderComponent.js';

expect.extend({ toMatchImageSnapshot });

const __dirname = dirname(fileURLToPath(import.meta.url));
const snapshotsDir = resolve(__dirname, '__snapshots__');

describe('visual regression: markdown', () => {
  test('headings and paragraphs', async () => {
    const content = `
# Heading 1

Some paragraph text.

## Heading 2

Another paragraph with **bold** and *italic* text.
`;

    const image = await renderComponent(MarkdownDoc, { content });

    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: snapshotsDir,
      customSnapshotIdentifier: 'markdown-headings',
    });
  });

  test('links, lists and blockquotes', async () => {
    const content = `
> A quoted block

- First item
- Second item with [a link](https://example.com)

1. Ordered one
2. Ordered two
`;

    const image = await renderComponent(MarkdownDoc, { content });

    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: snapshotsDir,
      customSnapshotIdentifier: 'markdown-lists-link-quote',
    });
  });

  test('inline code and horizontal rule', async () => {
    const content = `
Use \`npm install\` to install.

---

This is after the rule.

\`\`\`
const x = 1;
\`\`\`
`;

    const image = await renderComponent(MarkdownDoc, { content });

    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: snapshotsDir,
      customSnapshotIdentifier: 'markdown-code-rule',
    });
  });
});
