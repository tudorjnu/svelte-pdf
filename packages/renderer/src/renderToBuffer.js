import { render as renderSvelte } from 'svelte/server';

import { pdf } from './pdf.js';

export const renderToBuffer = async (Component, props = {}) => {
  const container = { type: 'ROOT', document: null };

  await renderSvelte(Component, {
    props,
    context: new Map([['pdf-container', container]]),
  });

  if (!container.document) {
    throw new Error(
      'Document component not found. Make sure your top-level component renders a \u003cDocument\u003e.',
    );
  }

  const instance = pdf(container);
  const stream = await instance.toBuffer();

  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
};

export default renderToBuffer;
