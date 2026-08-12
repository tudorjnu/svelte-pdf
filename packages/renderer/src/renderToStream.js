import { render as renderSvelte } from 'svelte/server';

import { pdf } from './pdf.js';

export const renderToStream = async (Component, props = {}) => {
  const container = { type: 'ROOT', document: null };

  await renderSvelte(Component, {
    props,
    context: new Map([['pdf-container', container]]),
  });

  if (!container.document) {
    throw new Error(
      'Document component not found. Make sure your top-level component renders a <Document>.',
    );
  }

  const instance = pdf(container);
  return instance.toBuffer();
};

export default renderToStream;
