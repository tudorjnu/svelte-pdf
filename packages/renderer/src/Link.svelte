<script>
  import { getContext, setContext } from 'svelte';
  import * as primitives from '@svelte-pdf/engine/primitives';

  import { omitNils } from './utils.js';

  const props = $props();

  const parent = getContext('pdf-parent');
  const root = getContext('pdf-root');

  const getLinkProps = () =>
    omitNils({
      wrap: props.wrap,
      render: props.render,
      debug: props.debug,
      fixed: props.fixed,
      break: props.break,
      bookmark: props.bookmark,
      minPresenceAhead: props.minPresenceAhead,
      id: props.id,
      href: props.href,
      src: props.src,
      hitSlop: props.hitSlop,
    });

  const link = {
    type: primitives.Link,
    props: getLinkProps(),
    style: props.style ?? {},
    children: [],
    box: {},
  };

  parent.appendChild(link);

  setContext('pdf-parent', {
    appendChild: (child) => link.children.push(child),
    removeChild: (child) => {
      const index = link.children.indexOf(child);
      if (index > -1) link.children.splice(index, 1);
    },
    insertBefore: (child, before) => {
      const index = link.children.indexOf(before);
      if (index > -1) {
        link.children.splice(index, 0, child);
      } else {
        link.children.push(child);
      }
    },
  });

  $effect(() => {
    link.props = getLinkProps();
    link.style = props.style ?? {};
    root?.notify();
  });
</script>

{@render props.children?.()}
