<script>
  import { getContext } from 'svelte';
  import * as primitives from '@svelte-pdf/engine/primitives';

  import { omitNils } from './utils.js';

  const props = $props();

  const parent = getContext('pdf-parent');
  const root = getContext('pdf-root');

  const getImageProps = () =>
    omitNils({
      src: props.src,
      source: props.source,
      cache: props.cache,
      x: props.x,
      y: props.y,
      srcSet: props.srcSet,
      sizes: props.sizes,
      wrap: props.wrap,
      render: props.render,
      debug: props.debug,
      fixed: props.fixed,
      break: props.break,
      bookmark: props.bookmark,
      minPresenceAhead: props.minPresenceAhead,
      id: props.id,
    });

  const image = {
    type: primitives.Image,
    props: getImageProps(),
    style: props.style ?? {},
    children: [],
    box: {},
  };

  parent.appendChild(image);

  $effect(() => {
    image.props = getImageProps();
    image.style = props.style ?? {};
    root?.notify();
  });
</script>
