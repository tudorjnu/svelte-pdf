import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import del from 'rollup-plugin-delete';

import pkg from './package.json' with { type: 'json' };

const dependencyIds = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
];

const external = (id) =>
  id === 'svelte' ||
  id.startsWith('svelte/') ||
  id === '@svelte-pdf/engine' ||
  id.startsWith('@svelte-pdf/engine/') ||
  dependencyIds.some((dep) => id === dep || id.startsWith(`${dep}/`)) ||
  id.startsWith('node:');

/** Minimal JSON-import support (avoids an extra dependency). */
const json = () => ({
  name: 'json',
  transform(code, id) {
    if (!id.endsWith('.json')) return null;
    return { code: `export default ${code};`, map: null };
  },
});

export default {
  input: { server: 'src/server.js' },
  // rollup's property-value analysis cannot see mutations of the ROOT
  // container through the Svelte context map and folds
  // `if (!container.document)` into an unconditional throw, deleting the
  // render tail. The server bundle is tiny, so tree-shaking buys nothing.
  treeshake: false,
  output: {
    format: 'es',
    dir: 'dist/server',
    entryFileNames: 'server.js',
    sourcemap: true,
  },
  external,
  plugins: [
    del({ targets: 'dist' }),
    json(),
    commonjs(),
    nodeResolve({ preferBuiltins: true }),
  ],
};
