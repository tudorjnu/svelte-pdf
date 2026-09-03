#!/usr/bin/env bash
# Ticket 7 acceptance test: a clean Vite browser project OUTSIDE the monorepo
# installs @svelte-pdf/renderer and bundles PDFViewer / usePDF / components.
#
# Usage:
#   e2e-browser-install.sh            # real `bun install` (needs registry access)
#   e2e-browser-install.sh --linked   # offline: symlink deps from the monorepo's
#                                     # node_modules instead of installing
#
# On success the project directory is KEPT (path is printed) so you can run
# `bun run preview` and visually confirm the PDF renders in the iframe.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
LINKED=0
[ "${1:-}" = "--linked" ] && LINKED=1

[ -f "$ROOT/packages/engine/dist/index.js" ] || {
  echo "engine not built — run: bun run --cwd packages/engine build" >&2
  exit 1
}
[ -f "$ROOT/packages/renderer/dist/index.js" ] || {
  echo "renderer not built — run: bun run --cwd packages/renderer build" >&2
  exit 1
}

WORK="${TMPDIR:-/tmp}/svelte-pdf-e2e-browser"
rm -rf "$WORK"
mkdir -p "$WORK/src"
cd "$WORK"

cat >package.json <<EOF
{
  "name": "svelte-pdf-e2e-browser",
  "private": true,
  "type": "module",
  "dependencies": {
    "@svelte-pdf/engine": "file:$ROOT/packages/engine",
    "@svelte-pdf/renderer": "file:$ROOT/packages/renderer"
  },
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^4.0.4",
    "svelte": "^5.56.8",
    "vite": "^5.4.11"
  },
  "overrides": {
    "@svelte-pdf/engine": "file:$ROOT/packages/engine"
  }
}
EOF

cat >vite.config.js <<'EOF'
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
});
EOF

cat >index.html <<'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>svelte-pdf e2e browser</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
EOF

cat >src/MyDocument.svelte <<'EOF'
<script>
  import { Document, Page, View, Text } from '@svelte-pdf/renderer';
</script>

<Document title="svelte-pdf e2e browser">
  <Page size="A4">
    <View style={{ padding: 48, fontFamily: 'Helvetica' }}>
      <Text style={{ fontSize: 18, color: '#111827' }}>
        Browser preview rendered by @svelte-pdf/renderer.
      </Text>
    </View>
  </Page>
</Document>
EOF

cat >src/main.js <<'EOF'
import { mount } from 'svelte';
import { PDFViewer, PDFDownloadLink } from '@svelte-pdf/renderer';
import MyDocument from './MyDocument.svelte';

mount(PDFViewer, {
  target: document.getElementById('app'),
  props: { document: MyDocument, documentProps: { title: 'svelte-pdf e2e browser' }, title: 'PDF preview' },
});

console.log('e2e browser app mounted');
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

echo "Building client bundle..."
"$ROOT/node_modules/.bin/vite" build --outDir .build >/dev/null

BUNDLE="$(ls .build/assets/*.js | head -1)"
grep -q "iframe" "$BUNDLE" || {
  echo "FAIL: PDFViewer iframe not in bundle" >&2
  exit 1
}
grep -q "#toolbar=" "$BUNDLE" || {
  echo "FAIL: compiled PDFViewer missing" >&2
  exit 1
}
grep -q "Browser preview rendered by" "$BUNDLE" || {
  echo "FAIL: user document not bundled" >&2
  exit 1
}
grep -qE '[A-Za-z0-9+/]{500}' "$BUNDLE" || {
  echo "FAIL: yoga-layout wasm payload missing" >&2
  exit 1
}

echo "OK: clean Vite project bundles PDFViewer + document (yoga wasm included)."
echo
echo "To visually confirm the PDF preview in the iframe:"
echo "  cd $WORK && bun run vite preview"
echo "  # then open the printed URL in a browser"
