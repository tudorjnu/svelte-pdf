import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import del from 'rollup-plugin-delete';
import { compile, compileModule } from 'svelte/compiler';

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

/**
 * Compile Svelte components/runes modules to client output. No CSS is emitted
 * (the components have no <style> blocks); the svelte runtime stays external.
 */
const svelteCompileClient = () => ({
  name: 'svelte-compile-client',
  transform(code, id) {
    if (id.endsWith('.svelte')) {
      const out = compile(code, { generate: 'client', filename: id });
      return { code: out.js.code, map: out.js.map ?? null };
    }
    if (id.endsWith('.svelte.js')) {
      const out = compileModule(code, { generate: 'client', filename: id });
      return { code: out.js.code, map: out.js.map ?? null };
    }
    return null;
  },
});

export default [
  {
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
  },
  {
    input: { index: 'src/index.js' },
    treeshake: false,
    output: {
      format: 'es',
      dir: 'dist',
      entryFileNames: 'index.js',
      sourcemap: true,
    },
    external,
    plugins: [
      json(),
      commonjs(),
      nodeResolve({ preferBuiltins: true }),
      svelteCompileClient(),
    ],
  },
];
