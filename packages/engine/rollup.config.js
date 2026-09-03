import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import del from 'rollup-plugin-delete';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import pkg from './package.json' with { type: 'json' };

const __dirname = dirname(fileURLToPath(import.meta.url));
const filterRoot = resolve(__dirname);

const dependencyIds = Object.keys(pkg.dependencies);

const external = (id) =>
  id.startsWith('@svelte-pdf/engine/') ||
  id === '@svelte-pdf/engine' ||
  /@babel\/runtime/.test(id) ||
  dependencyIds.some((dep) => id === dep || id.startsWith(`${dep}/`));

const STANDARD_FONTS = [
  'Courier',
  'CourierBold',
  'CourierBoldOblique',
  'CourierOblique',
  'Helvetica',
  'HelveticaBold',
  'HelveticaBoldOblique',
  'HelveticaOblique',
  'Symbol',
  'TimesBold',
  'TimesBoldItalic',
  'TimesItalic',
  'TimesRoman',
  'ZapfDingbats',
];

const tsPlugin = (outDir) =>
  typescript({
    tsconfig: './tsconfig.json',
    outDir,
    rootDir: 'src',
    declaration: true,
    declarationMap: true,
    sourceMap: true,
    include: ['src/**/*.ts', 'src/**/*.js', 'src/**/*.d.ts'],
    filterRoot,
  });

const entries = [
  { name: 'index', input: 'src/index.ts' },
  { name: 'primitives', input: 'src/primitives/index.ts' },
  { name: 'fns', input: 'src/fns/index.ts' },
  { name: 'svg', input: 'src/svg/index.ts' },
  { name: 'pdfkit', input: 'src/pdfkit/document.node.js' },
  { name: 'font', input: 'src/font/index.ts' },
  { name: 'image', input: 'src/image/index.ts' },
  { name: 'textkit', input: 'src/textkit/index.ts' },
  { name: 'stylesheet', input: 'src/stylesheet/index.ts' },
  { name: 'layout', input: 'src/layout/index.ts' },
  { name: 'render', input: 'src/render/index.ts' },
  ...STANDARD_FONTS.map((name) => ({
    name: `pdfkit/standard-fonts/${name}`,
    input: `src/pdfkit/font/generated/${name}.js`,
  })),
];

export default [
  {
    input: Object.fromEntries(entries.map(({ name, input }) => [name, input])),
    output: {
      format: 'es',
      dir: 'dist',
      entryFileNames: '[name].js',
      preserveModules: false,
      chunkFileNames: 'chunks/[name]-[hash].js',
      sourcemap: true,
    },
    external,
    plugins: [
      del({ targets: 'dist' }),
      replace({
        preventAssignment: true,
        values: { BROWSER: JSON.stringify(false) },
      }),
      commonjs(),
      nodeResolve({ preferBuiltins: true }),
      tsPlugin('dist'),
    ],
  },
];
