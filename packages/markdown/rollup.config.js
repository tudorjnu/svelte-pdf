import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import del from 'rollup-plugin-delete';
import { compile } from 'svelte/compiler';

import pkg from './package.json' with { type: 'json' };

const dependencyIds = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
];

const external = (id) =>
  id === 'svelte' ||
  id.startsWith('svelte/') ||
  id === 'marked' ||
  id.startsWith('marked/') ||
  id === '@svelte-pdf/engine' ||
  id.startsWith('@svelte-pdf/engine/') ||
  id === '@svelte-pdf/renderer' ||
  id.startsWith('@svelte-pdf/renderer/') ||
  dependencyIds.some((dep) => id === dep || id.startsWith(`${dep}/`)) ||
  id.startsWith('node:');

/**
 * Compile the Markdown component to client output (no <style> blocks, so no
 * CSS emission). The svelte runtime stays external; SSR consumers compile the
 * shipped Svelte source via the package's `svelte` condition.
 */
const svelteCompileClient = () => ({
  name: 'svelte-compile-client',
  transform(code, id) {
    if (id.endsWith('.svelte')) {
      const out = compile(code, { generate: 'client', filename: id });
      return { code: out.js.code, map: out.js.map ?? null };
    }
    return null;
  },
});

export default {
  input: { index: 'src/index.js' },
  // See packages/renderer/rollup.config.js: rollup's property analysis cannot
  // see context-map mutations, and the bundle is tiny anyway.
  treeshake: false,
  output: {
    format: 'es',
    dir: 'dist',
    entryFileNames: 'index.js',
    sourcemap: true,
  },
  external,
  plugins: [del({ targets: 'dist' }), commonjs(), nodeResolve({ preferBuiltins: true }), svelteCompileClient()],
};