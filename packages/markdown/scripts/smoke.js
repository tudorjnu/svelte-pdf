import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Import from the built package without any Vitest aliases. The compiled
// component imports svelte internals at mount time only, so importing the
// module in node is safe.
const browser = await import(resolve(root, 'dist/index.js'));
assert(typeof browser.Markdown !== 'undefined', 'compiled Markdown component should be exported');

// Also resolve through package.json exports from within the package.
const packaged = await import('@svelte-pdf/markdown');
assert(packaged.Markdown !== undefined, 'package . export should include Markdown');

console.log('Markdown smoke test passed.');