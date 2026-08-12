<script>
  import usePDF from './usePDF.svelte.js';

  const {
    document: DocumentComponent,
    documentProps = {},
    showToolbar = true,
    title,
    style,
    className,
    ...rest
  } = $props();

  const instance = usePDF(DocumentComponent, documentProps);

  let initialized = false;

  $effect(() => {
    // depend on document and props
    DocumentComponent;
    documentProps;

    if (initialized) {
      instance.update(DocumentComponent, documentProps);
    }
    initialized = true;
  });

  const src = $derived(
    instance.url ? `${instance.url}#toolbar=${showToolbar ? 1 : 0}` : null,
  );
</script>

<iframe {src} {title} {style} class={className} {...rest} />
