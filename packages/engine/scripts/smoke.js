import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Import from the built package without any Vitest aliases.
const engine = await import(resolve(root, 'dist/index.js'));
const { layout, FontStore, resolveStyles, PDFDocument } = engine;
const { default: render } = await import(resolve(root, 'dist/render.js'));
const primitives = await import(resolve(root, 'dist/primitives.js'));
const fns = await import(resolve(root, 'dist/fns.js'));

assert(typeof layout === 'function', 'layout export should be a function');
assert(typeof render === 'function', 'render export should be a function');
assert(typeof PDFDocument === 'function', 'PDFDocument export should be a constructor');
assert(typeof FontStore === 'function', 'FontStore export should be a constructor');
assert(typeof resolveStyles === 'function', 'resolveStyles export should be a function');
assert(typeof primitives.View === 'string', 'primitives.View should be a string');
assert(typeof fns.upperFirst === 'function', 'fns.upperFirst should be a function');

const doc = new PDFDocument();
assert(typeof doc.on === 'function', 'PDFDocument instance should be an event emitter');

const fontStore = new FontStore();
assert(typeof fontStore.register === 'function', 'FontStore instance should have register');

// Also resolve through package.json exports from within the package.
const packaged = await import('@svelte-pdf/engine');
assert(typeof packaged.layout === 'function', 'package layout export should be a function');
assert(typeof packaged.PDFDocument === 'function', 'package PDFDocument export should be a constructor');

const layoutPkg = await import('@svelte-pdf/engine/layout');
assert(typeof layoutPkg.default === 'function', 'package ./layout export should be a function');

const renderPkg = await import('@svelte-pdf/engine/render');
assert(typeof renderPkg.default === 'function', 'package ./render export should be a function');

const fontPkg = await import('@svelte-pdf/engine/font');
assert(typeof fontPkg.default === 'function', 'package ./font export should be a constructor');

const standardFont = await import('@svelte-pdf/engine/pdfkit/standard-fonts/Helvetica');
assert(typeof standardFont.default === 'object' || typeof standardFont.default === 'function', 'package ./pdfkit/standard-fonts/Helvetica export should exist');

console.log('Engine smoke test passed.');
