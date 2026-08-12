import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

const root = resolve(__dirname);
const engineRoot = resolve(root, '../engine');
const rendererRoot = resolve(root, '../renderer');

const yogaLoad = resolve(root, '../../node_modules/yoga-layout/dist/src/load.js');

export default defineConfig({
  root,
  plugins: [
    svelte({
      hot: !process.env.VITEST,
      compilerOptions: {
        generate: 'server',
      },
    }),
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
      {
        find: /^@svelte-pdf\/renderer$/,
        replacement: resolve(rendererRoot, 'src/index.js'),
      },
      {
        find: /^@svelte-pdf\/engine\/pdfkit\/standard-fonts\/(.+)$/,
        replacement: resolve(engineRoot, 'src/pdfkit/standard-fonts/$1.js'),
      },
      {
        find: /^@svelte-pdf\/engine\/pdfkit\/font\/generated\/(.+)$/,
        replacement: resolve(engineRoot, 'src/pdfkit/font/generated/$1.js'),
      },
      {
        find: /^@svelte-pdf\/engine\/pdfkit$/,
        replacement: resolve(engineRoot, 'src/pdfkit/document.node.js'),
      },
      {
        find: /^@svelte-pdf\/engine\/types$/,
        replacement: resolve(engineRoot, 'src/types/index.d.ts'),
      },
      {
        find: /^@svelte-pdf\/engine\/(\w+)$/,
        replacement: resolve(engineRoot, 'src/$1/index.ts'),
      },
      {
        find: /^@svelte-pdf\/engine\/(\w+)\/(.+)$/,
        replacement: resolve(engineRoot, 'src/$1/$2.ts'),
      },
    ],
  },
  test: {
    include: ['tests/**/*.test.js', 'tests/**/*.test.ts', 'tests/**/*.test.svelte'],
    environment: 'node',
    setupFiles: ['vitest.setup.js'],
  },
});
