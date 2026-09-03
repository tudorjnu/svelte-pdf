import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

const root = resolve(__dirname);

const yogaLoad = resolve(root, '../../node_modules/yoga-layout/dist/src/load.js');

export default defineConfig({
  root,
  plugins: [
    // yoga-layout's base64 WASM loader breaks under vitest/node here (the
    // renderer suite ships the same shim); route the specifiers through the
    // shared shim and mark them external so the mock path is exercised.
    {
      name: 'externalize-yoga',
      enforce: 'pre',
      resolveId(id) {
        if (id === 'yoga-layout/load' || id === 'yoga-layout') {
          return { id: yogaLoad, external: true };
        }
      },
    },
  ],
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