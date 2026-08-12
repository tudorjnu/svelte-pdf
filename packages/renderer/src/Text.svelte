<script>
  import { getContext, setContext } from 'svelte';
  import * as primitives from '@svelte-pdf/engine/primitives';

  import { omitNils } from './utils.js';

  const props = $props();

  const parent = getContext('pdf-parent');
  const root = getContext('pdf-root');

  const getTextProps = () =>
    omitNils({
      wrap: props.wrap,
      widows: props.widows,
      orphans: props.orphans,
      render: props.render,
      hyphenationCallback: props.hyphenationCallback,
      debug: props.debug,
      fixed: props.fixed,
      break: props.break,
      bookmark: props.bookmark,
      minPresenceAhead: props.minPresenceAhead,
      id: props.id,
    });

  const text = {
    type: primitives.Text,
    props: getTextProps(),
    style: props.style ?? {},
    children: [],
    box: {},
  };

  parent.appendChild(text);

  const syncTextValue = () => {
    const value = props.value;
    const stringValue = value != null ? String(value) : null;
    const existing = text.children.find(
      (child) => child.type === primitives.TextInstance,
    );

    if (stringValue != null) {
      if (existing) {
        existing.value = stringValue;
      } else {
        text.children.unshift({ type: primitives.TextInstance, value: stringValue });
      }
    } else if (existing) {
      const index = text.children.indexOf(existing);
      if (index > -1) text.children.splice(index, 1);
    }
  };

  syncTextValue();

  setContext('pdf-parent', {
    appendChild: (child) => text.children.push(child),
    removeChild: (child) => {
      const index = text.children.indexOf(child);
      if (index > -1) text.children.splice(index, 1);
    },
    insertBefore: (child, before) => {
      const index = text.children.indexOf(before);
      if (index > -1) {
        text.children.splice(index, 0, child);
      } else {
        text.children.push(child);
      }
    },
  });

  $effect(() => {
    text.props = getTextProps();
    text.style = props.style ?? {};
    syncTextValue();
    root?.notify();
  });
</script>

{@render props.children?.()}
