#!/usr/bin/env bash
# Ticket 8 acceptance test: a clean project OUTSIDE the monorepo installs
# @svelte-pdf/markdown (+ renderer + engine) and renders a PDF containing
# markdown content via renderToBuffer.
#
# Usage:
#   e2e-markdown-install.sh            # real `bun install` (needs registry access)
#   e2e-markdown-install.sh --linked   # offline: symlink deps from the monorepo's
#                                      # node_modules instead of installing
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
LINKED=0
[ "${1:-}" = "--linked" ] && LINKED=1

for dist in \
  "$ROOT/packages/engine/dist/index.js" \
  "$ROOT/packages/renderer/dist/server/server.js" \
  "$ROOT/packages/markdown/dist/index.js"; do
  [ -f "$dist" ] || {
    echo "not built: $dist — run bun run --cwd <package> build first" >&2
    exit 1
  }
done

WORK="$(mktemp -d "${TMPDIR:-/tmp}/svelte-pdf-e2e-markdown.XXXXXX")"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

mkdir -p "$WORK/src"

# Pack real tarballs (see e2e-server-install.sh for the rationale — file:
# symlinks resolve deps through the monorepo and split the svelte runtime).
echo "Packing engine, renderer and markdown tarballs..."
npm_pack() {
  (cd "$2" && npm pack --cache "$WORK/vendor/.npm-cache" --pack-destination "$WORK/vendor" --loglevel=error >/dev/null 2>&1)
}
npm_pack engine "$ROOT/packages/engine"
npm_pack renderer "$ROOT/packages/renderer"
npm_pack markdown "$ROOT/packages/markdown"
ENGINE_TGZ="$(ls "$WORK/vendor" | grep engine | head -1)"
RENDERER_TGZ="$(ls "$WORK/vendor" | grep renderer | head -1)"
MARKDOWN_TGZ="$(ls "$WORK/vendor" | grep markdown | head -1)"
[ -n "$ENGINE_TGZ" ] && [ -n "$RENDERER_TGZ" ] && [ -n "$MARKDOWN_TGZ" ] || {
  echo "FAIL: npm pack did not produce tarballs" >&2
  exit 1
}

cd "$WORK"

cat >package.json <<EOF
{
  "name": "svelte-pdf-e2e-markdown",
  "private": true,
  "type": "module",
  "dependencies": {
    "@svelte-pdf/engine": "file:./vendor/$ENGINE_TGZ",
    "@svelte-pdf/renderer": "file:./vendor/$RENDERER_TGZ",
    "@svelte-pdf/markdown": "file:./vendor/$MARKDOWN_TGZ"
  },
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^4.0.4",
    "svelte": "^5.56.8",
    "vite": "^5.4.11"
  },
  "overrides": {
    "@svelte-pdf/engine": "file:./vendor/$ENGINE_TGZ",
    "@svelte-pdf/renderer": "file:./vendor/$RENDERER_TGZ"
  }
}
EOF

cat > vite.config.js <<'EOF'
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  ssr: {
    noExternal: [/^@svelte-pdf\/(renderer|markdown)$/],
    external: ['svelte', '@svelte-pdf/renderer/server'],
  },
  build: { target: 'node18' },
});
EOF

cat > src/MyDocument.svelte <<'EOF'
<script>
  import { Document, Page, View, Text } from '@svelte-pdf/renderer';
  import { Markdown } from '@svelte-pdf/markdown';

  const markdown = `
# Installed markdown

This paragraph was rendered by **@svelte-pdf/markdown** from a *clean install*.

- list item one
- list item two

[a link](https://svelte.dev) and \`inline code\`.
`;
</script>

<Document title="svelte-pdf e2e markdown">
  <Page size="A4">
    <View style={{ padding: 48, fontFamily: 'Helvetica' }}>
      <Text style={{ fontSize: 16 }}>Plain renderer text:</Text>
      <Markdown content={markdown} />
    </View>
  </Page>
</Document>
EOF

cat > src/render.js <<'EOF'
import { writeFileSync } from 'node:fs';
import { renderToBuffer } from '@svelte-pdf/renderer/server';
import MyDocument from './MyDocument.svelte';

const buffer = await renderToBuffer(MyDocument, {});
const header = buffer.subarray(0, 5).toString('latin1');
if (!header.startsWith('%PDF-')) {
  throw new Error(`Expected a PDF, got: ${JSON.stringify(header)}`);
}
// Markdown content must actually appear in the PDF text stream.
const text = buffer.toString('latin1');
if (!text.includes('Installed markdown')) {
  throw new Error('Markdown heading missing from rendered PDF');
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