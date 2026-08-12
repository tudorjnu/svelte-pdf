<script>
  import { getContext, setContext } from 'svelte';
  import * as primitives from '@svelte-pdf/engine/primitives';

  import { omitNils } from './utils.js';

  const props = $props();

  const parent = getContext('pdf-parent');
  const root = getContext('pdf-root');

  const getPageProps = () =>
    omitNils({
      size: props.size,
      orientation: props.orientation,
      dpi: props.dpi,
      wrap: props.wrap,
      render: props.render,
      debug: props.debug,
      fixed: props.fixed,
      break: props.break,
      bookmark: props.bookmark,
      minPresenceAhead: props.minPresenceAhead,
      id: props.id,
    });

  const page = {
    type: primitives.Page,
    props: getPageProps(),
    style: props.style ?? {},
    children: [],
    box: {},
  };

  parent.appendChild(page);

  setContext('pdf-parent', {
    appendChild: (child) => page.children.push(child),
    removeChild: (child) => {
      const index = page.children.indexOf(child);
      if (index > -1) page.children.splice(index, 1);
    },
    insertBefore: (child, before) => {
      const index = page.children.indexOf(before);
      if (index > -1) {
        page.children.splice(index, 0, child);
      } else {
        page.children.push(child);
      }
    },
  });

  $effect(() => {
    page.props = getPageProps();
    page.style = props.style ?? {};
    root?.notify();
  });
</script>

{@render props.children?.()}
