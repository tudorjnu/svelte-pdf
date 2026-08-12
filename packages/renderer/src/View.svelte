<script>
  import { getContext, setContext } from 'svelte';
  import * as primitives from '@svelte-pdf/engine/primitives';

  import { omitNils } from './utils.js';

  const props = $props();

  const parent = getContext('pdf-parent');
  const root = getContext('pdf-root');

  const getViewProps = () =>
    omitNils({
      wrap: props.wrap,
      render: props.render,
      debug: props.debug,
      fixed: props.fixed,
      break: props.break,
      bookmark: props.bookmark,
      minPresenceAhead: props.minPresenceAhead,
      id: props.id,
    });

  const view = {
    type: primitives.View,
    props: getViewProps(),
    style: props.style ?? {},
    children: [],
    box: {},
  };

  parent.appendChild(view);

  setContext('pdf-parent', {
    appendChild: (child) => view.children.push(child),
    removeChild: (child) => {
      const index = view.children.indexOf(child);
      if (index > -1) view.children.splice(index, 1);
    },
    insertBefore: (child, before) => {
      const index = view.children.indexOf(before);
      if (index > -1) {
        view.children.splice(index, 0, child);
      } else {
        view.children.push(child);
      }
    },
  });

  $effect(() => {
    view.props = getViewProps();
    view.style = props.style ?? {};
    root?.notify();
  });
</script>

{@render props.children?.()}
