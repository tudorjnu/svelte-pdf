import { upperFirst } from '@svelte-pdf/engine/fns';
import renderPDF from '@svelte-pdf/engine/render';
import PDFDocument from '@svelte-pdf/engine/pdfkit';
import layoutDocument from '@svelte-pdf/engine/layout';
import { fontStore } from '@svelte-pdf/engine/font';

import { omitNils } from './utils.js';
import packageJson from '../package.json';

const { version } = packageJson;

const pdf = (initialValue, { onChange = () => {} } = {}) => {
  const container = { type: 'ROOT', document: null, onChange };

  if (initialValue) {
    if (initialValue.type === 'ROOT') {
      container.document = initialValue.document;
    } else {
      container.document = initialValue;
    }
  }

  const render = async (compress = true) => {
    const document = container.document;
    if (!document) {
      throw new Error('No document to render');
    }

    const props = document.props || {};
    const {
      pdfVersion,
      language,
      pageLayout,
      pageMode,
      title,
      author,
      subject,
      keywords,
      creator = 'svelte-pdf',
      producer = 'svelte-pdf',
      creationDate = new Date(),
      modificationDate,
      ownerPassword,
      userPassword,
      permissions,
    } = props;

    const ctx = new PDFDocument({
      compress,
      pdfVersion,
      lang: language,
      displayTitle: true,
      autoFirstPage: false,
      ownerPassword,
      userPassword,
      permissions,
      pageLayout,
      info: omitNils({
        Title: title,
        Author: author,
        Subject: subject,
        Keywords: keywords,
        Creator: creator,
        Producer: producer,
        CreationDate: creationDate,
        ModificationDate: modificationDate,
      }),
    });

    if (pageMode) {
      ctx._root.data.PageMode = upperFirst(pageMode);
    }

    const layout = await layoutDocument(document, fontStore);
    const fileStream = renderPDF(ctx, layout);

    return { layout, fileStream };
  };

  const callOnRender = (params = {}) => {
    if (container.document?.props?.onRender) {
      container.document.props.onRender(params);
    }
  };

  const toBuffer = async () => {
    const { layout: _INTERNAL__LAYOUT__DATA_, fileStream } = await render();
    callOnRender({ _INTERNAL__LAYOUT__DATA_ });
    return fileStream;
  };

  const toBlob = async () => {
    const chunks = [];
    const { layout: _INTERNAL__LAYOUT__DATA_, fileStream: instance } =
      await render();

    return new Promise((resolve, reject) => {
      instance.on('data', (chunk) => {
        chunks.push(
          chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk),
        );
      });

      instance.on('end', () => {
        try {
          const blob = new Blob(chunks, { type: 'application/pdf' });
          callOnRender({ blob, _INTERNAL__LAYOUT__DATA_ });
          resolve(blob);
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  return {
    container,
    toBuffer,
    toBlob,
  };
};

const Font = fontStore;

export { version, Font, pdf };
