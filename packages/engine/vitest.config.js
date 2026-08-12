import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

const root = resolve(__dirname);

export default defineConfig({
  root,
  resolve: {
    alias: [
      // Catch-all: @svelte-pdf/engine/<pkg>/<subpath> → src/<pkg>/<subpath>
      {
        find: /^@svelte-pdf\/engine\/(\w+)\/(.+)$/,
        replacement: resolve(root, 'src/$1/$2'),
      },
      // Package index: @svelte-pdf/engine/<pkg> → src/<pkg>/index.ts (or .js for pdfkit)
      { find: /^@svelte-pdf\/engine\/pdfkit$/, replacement: resolve(root, 'src/pdfkit/document.node.js') },
      { find: /^@svelte-pdf\/engine\/types$/, replacement: resolve(root, 'src/types/index.d.ts') },
      { find: /^@svelte-pdf\/engine\/(\w+)$/, replacement: resolve(root, 'src/$1/index.ts') },
    ],
  },
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/**/__snapshots__/**'],
    setupFiles: ['vitest.setup.js'],
  },
});