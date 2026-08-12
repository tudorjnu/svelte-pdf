import { describe, expect, test } from 'vitest';

import {
  Document,
  Page,
  View,
  Text,
  Link,
  Note,
  Image,
  PDFViewer,
  PDFDownloadLink,
  usePDF,
  pdf,
  Font,
} from '../src/index.js';

describe('package exports', () => {
  test('all core components are exported', () => {
    expect(Document).toBeDefined();
    expect(Page).toBeDefined();
    expect(View).toBeDefined();
    expect(Text).toBeDefined();
    expect(Link).toBeDefined();
    expect(Note).toBeDefined();
    expect(Image).toBeDefined();
  });

  test('browser components and usePDF are exported', () => {
    expect(PDFViewer).toBeDefined();
    expect(PDFDownloadLink).toBeDefined();
    expect(usePDF).toBeDefined();
  });

  test('pdf and Font helpers are exported', () => {
    expect(pdf).toBeDefined();
    expect(Font).toBeDefined();
  });

  test('server APIs are exported from server entry', async () => {
    const server = await import('../src/server.js');
    expect(server.renderToBuffer).toBeDefined();
    expect(server.renderToStream).toBeDefined();
    expect(server.renderToFile).toBeDefined();
  });
});
