<script>
  import { getContext, setContext } from 'svelte';
  import * as primitives from '@svelte-pdf/engine/primitives';

  import { omitNils } from './utils.js';

  const props = $props();

  const container = props.__container ?? getContext('pdf-container');
  const parent = getContext('pdf-parent');

  const getDocumentProps = () =>
    omitNils({
      title: props.title,
      author: props.author,
      subject: props.subject,
      keywords: props.keywords,
      creator: props.creator,
      producer: props.producer,
      creationDate: props.creationDate,
      modificationDate: props.modificationDate,
      pageLayout: props.pageLayout,
      pageMode: props.pageMode,
      language: props.language,
      pdfVersion: props.pdfVersion,
      ownerPassword: props.ownerPassword,
      userPassword: props.userPassword,
      permissions: props.permissions,
      onRender: props.onRender,
    });

  const document = {
    type: primitives.Document,
    props: getDocumentProps(),
    children: [],
    box: {},
    style: {},
  };

  if (parent) {
    parent.appendChild(document);
  }

  if (container) {
    container.document = document;
  }

  const root = {
    notify: () => {
      if (container?.onChange) container.onChange();
    },
  };

  setContext('pdf-parent', {
    appendChild: (child) => document.children.push(child),
    removeChild: (child) => {
      const index = document.children.indexOf(child);
      if (index > -1) document.children.splice(index, 1);
    },
    insertBefore: (child, before) => {
      const index = document.children.indexOf(before);
      if (index > -1) {
        document.children.splice(index, 0, child);
      } else {
        document.children.push(child);
      }
    },
  });

  setContext('pdf-root', root);

  $effect(() => {
    document.props = getDocumentProps();
    root.notify();
  });
</script>

{@render props.children?.()}
