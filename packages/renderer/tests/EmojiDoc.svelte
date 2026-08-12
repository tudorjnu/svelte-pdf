<script>
  import { Document, Page, Text } from '../src/index.js';

  const { emoji = '💩', fontSize = 80 } = $props();
</script>

<Document>
  <Page size={[100, 100]}>
    <Text value={emoji} style={{ fontSize }} />
  </Page>
</Document>
