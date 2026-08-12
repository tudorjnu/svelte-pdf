<script>
  import usePDF from './usePDF.svelte.js';

  const {
    document: DocumentComponent,
    documentProps = {},
    fileName = 'document.pdf',
    className,
    children,
    onclick,
    href,
    ...rest
  } = $props();

  const instance = usePDF(DocumentComponent, documentProps);

  let initialized = false;

  $effect(() => {
    DocumentComponent;
    documentProps;

    if (initialized) {
      instance.update(DocumentComponent, documentProps);
    }
    initialized = true;
  });

  const handleClick = (event) => {
    if (instance.blob && window.navigator.msSaveBlob) {
      window.navigator.msSaveBlob(instance.blob, fileName);
    }
    if (typeof onclick === 'function') {
      onclick(event, instance);
    }
  };
</script>

<a href={instance.url} download={fileName} onclick={handleClick} class={className} {...rest}
  >{#if children}{@render children(instance)}{:else}{fileName}{/if}
</a>
