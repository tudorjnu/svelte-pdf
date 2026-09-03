#!/usr/bin/env bash
# Ticket 6 acceptance test: a clean project OUTSIDE the monorepo installs
# @svelte-pdf/renderer + @svelte-pdf/engine and renders a PDF via the
# `./server` entry (renderToBuffer).
#
# Usage:
#   e2e-server-install.sh            # real `bun install` (needs registry access)
#   e2e-server-install.sh --linked   # offline: symlink deps from the monorepo's
#                                    # node_modules instead of installing
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
LINKED=0
[ "${1:-}" = "--linked" ] && LINKED=1

# Both packages must be built first.
[ -f "$ROOT/packages/engine/dist/index.js" ] || {
  echo "engine not built — run: bun run --cwd packages/engine build" >&2
  exit 1
}
[ -f "$ROOT/packages/renderer/dist/server/server.js" ] || {
  echo "renderer not built — run: bun run --cwd packages/renderer build" >&2
  exit 1
}

WORK="$(mktemp -d "${TMPDIR:-/tmp}/svelte-pdf-e2e-server.XXXXXX")"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

mkdir -p "$WORK/src"
cd "$WORK"

# Pack real tarballs (npm pack) instead of file: links — file: symlinks make
# bun resolve the packages' deps (svelte) through the monorepo, producing two
# svelte runtime copies in the test project. Tarballs also exercise the
# packages' `files` field, exactly like a real npm install will.
echo "Packing @svelte-pdf/engine and @svelte-pdf/renderer tarballs..."
mkdir -p vendor
(cd "$ROOT/packages/engine" && npm pack --cache "$WORK/vendor/.npm-cache" --pack-destination "$WORK/vendor" >/dev/null)
(cd "$ROOT/packages/renderer" && npm pack --cache "$WORK/vendor/.npm-cache" --pack-destination "$WORK/vendor" >/dev/null)

cat >package.json <<EOF
{
  "name": "svelte-pdf-e2e-server",
  "private": true,
  "type": "module",
  "dependencies": {
    "@svelte-pdf/engine": "file:./vendor/@svelte-pdf-engine-0.1.0.tgz",
    "@svelte-pdf/renderer": "file:./vendor/@svelte-pdf-renderer-0.1.0.tgz"
  },
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^4.0.4",
    "svelte": "^5.56.8",
    "vite": "^5.4.11"
  },
  "overrides": {
    "@svelte-pdf/engine": "file:./vendor/@svelte-pdf-engine-0.1.0.tgz"
  }
}
EOF

cat >vite.config.js <<'EOF'
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  ssr: {
    noExternal: [/^@svelte-pdf\/renderer$/],
    // Keep one svelte runtime (node_modules) shared between the compiled
    // components and the prebuilt server bundle; the server subpath stays
    // external so the installed dist/server/server.js is what actually runs.
    external: ['svelte', '@svelte-pdf/renderer/server'],
  },
  build: { target: 'node18' },
});
EOF

cat >src/MyDocument.svelte <<'EOF'
<script>
  import { Document, Page, View, Text } from '@svelte-pdf/renderer';
</script>

<Document title="svelte-pdf e2e server" author="e2e">
  <Page size="A4">
    <View style={{ padding: 48, fontFamily: 'Helvetica' }}>
      <Text style={{ fontSize: 18, color: '#111827' }}>
        Rendered by @svelte-pdf/renderer/server from a clean install.
      </Text>
    </View>
  </Page>
</Document>
EOF

cat >src/render.js <<'EOF'
import { writeFileSync } from 'node:fs';
import { renderToBuffer } from '@svelte-pdf/renderer/server';
import MyDocument from './MyDocument.svelte';

const buffer = await renderToBuffer(MyDocument, {});
const header = buffer.subarray(0, 5).toString('latin1');
if (!header.startsWith('%PDF-')) {
  throw new Error(`Expected a PDF, got: ${JSON.stringify(header)}`);
}
writeFileSync('output.pdf', buffer);
console.log(`OK: renderToBuffer produced ${buffer.length} bytes -> output.pdf`);
EOF

if [ "$LINKED" -eq 1 ]; then
  echo "--linked mode: symlinking node_modules from the monorepo (no install)"
  mkdir -p node_modules
  for dep in @svelte-pdf svelte vite @sveltejs; do
    ln -s "$ROOT/node_modules/$dep" "node_modules/$dep"
  done
else
  echo "Installing clean project dependencies (file: + registry)..."
  bun install || npm install
fi

echo "Building SSR bundle..."
"$ROOT/node_modules/.bin/vite" build --ssr src/render.js --outDir .build >/dev/null

echo "Rendering PDF from installed packages..."
node .build/render.js
