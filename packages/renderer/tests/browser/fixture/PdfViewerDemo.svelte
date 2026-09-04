<!--
  PDFViewer mounting a real document component. NOTE: this currently CANNOT
  produce a PDF in the browser — the engine is Node-only (pdfkit extends
  stream.Readable; finding #1). The fixture therefore documents the expected
  behavior for now: the failure surfaces LOUDLY via the viewer's error state
  instead of a silent blank iframe. Once the engine ships a browser build,
  this demo renders pages and the skipped end-to-end test in
  pdfviewer.browser.test.js can be un-skipped.
-->
<script>
  import { PDFViewer } from '../../../src/index.js';
  import BrowserDoc from './BrowserDoc.svelte';
</script>

<div id="viewer-component" style="width: 800px">
  <PDFViewer document={BrowserDoc} />
</div>