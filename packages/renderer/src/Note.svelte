<script>
  import { getContext } from 'svelte';
  import * as primitives from '@svelte-pdf/engine/primitives';

  import { omitNils } from './utils.js';

  const props = $props();

  const parent = getContext('pdf-parent');
  const root = getContext('pdf-root');

  const getNoteProps = () =>
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

  const note = {
    type: primitives.Note,
    props: getNoteProps(),
    style: props.style ?? {},
    children: [],
    box: {},
  };

  parent.appendChild(note);

  const syncTextValue = () => {
    const value = props.value;
    const stringValue = value != null ? String(value) : null;
    const existing = note.children.find(
      (child) => child.type === primitives.TextInstance,
    );

    if (stringValue != null) {
      if (existing) {
        existing.value = stringValue;
      } else {
        note.children.push({ type: primitives.TextInstance, value: stringValue });
      }
    } else if (existing) {
      const index = note.children.indexOf(existing);
      if (index > -1) note.children.splice(index, 1);
    }
  };

  syncTextValue();

  $effect(() => {
    note.props = getNoteProps();
    note.style = props.style ?? {};
    syncTextValue();
    root?.notify();
  });
</script>
