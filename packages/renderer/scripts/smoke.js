import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Import from the built package without any Vitest aliases.
const server = await import(resolve(root, 'dist/server/server.js'));

assert(
  typeof server.renderToBuffer === 'function',
  'renderToBuffer should be a function',
);
assert(
  typeof server.renderToStream === 'function',
  'renderToStream should be a function',
);
assert(
  typeof server.renderToFile === 'function',
  'renderToFile should be a function',
);
assert(typeof server.pdf === 'function', 'pdf should be a function');
assert(
  typeof server.Font?.register === 'function',
  'Font.register should be a function',
);
assert(typeof server.version === 'string', 'version should be a string');

// Also resolve through package.json exports from within the package.
const packaged = await import('@svelte-pdf/renderer/server');
assert(
  typeof packaged.renderToBuffer === 'function',
  'package ./server export should be a function',
);
assert(
  typeof packaged.Font?.register === 'function',
  'package ./server Font export should exist',
);

console.log('Renderer server smoke test passed.');
