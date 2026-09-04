import { mount } from 'svelte';
import PdfCanvasDemo from './PdfCanvasDemo.svelte';

// NOTE: PdfViewerDemo.svelte (PDFViewer mounting a live document component)
// is intentionally NOT mounted here. index.js re-exports pdf.js, which imports
// the Node-only engine — importing it in a browser crashes the whole module
// graph (finding #1). PDFViewer becomes browser-testable end-to-end once the
// engine ships a browser build; see pdfviewer.browser.test.js.
mount(PdfCanvasDemo, { target: document.getElementById('app') });