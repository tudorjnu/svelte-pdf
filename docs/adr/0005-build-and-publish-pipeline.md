# Build and publish pipeline for installable packages

## Status

Accepted

## Context

`svelte-pdf` is a monorepo with three packages:

- `@svelte-pdf/engine` — framework-agnostic PDF engine, vendored from react-pdf and written mostly in TypeScript.
- `@svelte-pdf/renderer` — Svelte 5 component layer.
- `@svelte-pdf/markdown` — optional Markdown component depending on `@svelte-pdf/renderer`.

Currently all packages are consumed from source via Vitest aliases. The `package.json` files point `main` / `svelte` / `exports` at `src/`, which works for local development and tests but does not work for npm consumers. There is no compiled output, no bundled `.d.ts`, and no handling of the `yoga-layout` WASM binary for downstream bundlers.

Users expect to install the library with a single command, just like react-pdf:

```bash
npm install @svelte-pdf/renderer
```

Until a build and publish pipeline exists, this is not possible.

## Decision

We will add a build step to each package and publish to npm.

### Build outputs

Each package produces:

- ES module JS files in `dist/`.
- `.d.ts` type declaration files in `dist/`.
- Separate server and browser builds where needed (renderer and markdown).
- A `package.json` whose `exports` point to the built files.

### Build tool

Use Rollup with the following plugins:

- `@rollup/plugin-typescript` (or `rollup-plugin-ts`) for engine TypeScript.
- `rollup-plugin-svelte` for Svelte components, configured to emit both server and browser outputs.
- `rollup-plugin-node-resolve` and `rollup-plugin-commonjs` for npm dependencies.
- `rollup-plugin-replace` or `@rollup/plugin-alias` for environment-specific entry points (e.g. `pdfkit` node vs. browser build).

`yoga-layout` is kept as an external dependency. We do not bundle its WASM binary; instead we rely on the downstream bundler (Vite, Rollup, webpack) to load it correctly. A note in the README explains the common Vite/esbase workaround if needed.

### Package exports

`@svelte-pdf/renderer` exports:

- `.` — browser build with Svelte components, `usePDF`, `Font`, `pdf`.
- `./server` — server build with `renderToBuffer`, `renderToStream`, `renderToFile`, `Font`, `pdf`.

`@svelte-pdf/markdown` exports:

- `.` — browser + server build of `Markdown`.

`@svelte-pdf/engine` exports the same subpaths as today (`/primitives`, `/layout`, `/render`, etc.) but from compiled JS + `.d.ts`.

### Versioning and publishing

Use Changesets for version bumps and a single `bun release` (or `yarn release`) command that publishes all packages. Independent versioning is acceptable because engine, renderer, and markdown can evolve separately.

### What we will not do

- We will not bundle `yoga-layout` into the engine build. Bundling the WASM binary has proven brittle and increases package size.
- We will not ship uncompiled source as the primary distribution. `src/` may remain in the package for source maps, but `exports` point to `dist/`.

## Consequences

- Users can install `@svelte-pdf/renderer` and `@svelte-pdf/markdown` from npm with one command.
- Downstream bundlers are responsible for loading `yoga-layout` correctly; the README documents the Vite/esbuild workaround.
- Maintainers must run the build before publishing. CI should enforce this.
- The repository grows a small amount of build configuration but loses the source-only constraint.

## Alternatives considered

1. **Ship source only and rely on downstream Svelte/Vite tooling to compile it.** This is what the current Vitest setup does. It is simple for local development but unreliable for npm consumers because not all projects compile dependencies from source, and the engine's TypeScript/WASM imports are not universally resolvable.

2. **Publish as a single monolithic package** instead of three. This would simplify installation (`npm install svelte-pdf`) but couples engine internals with the Svelte layer and prevents reusing the engine in other frameworks. It also breaks the architecture described in ADR-0004.

3. **Use `bun build` or `tsup` instead of Rollup.** Both are viable and faster. Rollup was chosen because it has the most mature Svelte and multi-output ecosystem and matches react-pdf's own build approach.
