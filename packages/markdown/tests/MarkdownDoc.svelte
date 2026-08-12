<script>
  import { Document, Page, View } from '@svelte-pdf/renderer';
  import { Markdown } from '../src/index.js';

  const { content } = $props();
</script>

<Document>
  <Page size="A4" style={{ padding: 40 }}>
    <Markdown {content} />
  </Page>
</Document>
