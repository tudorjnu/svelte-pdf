<script>
  import { Document, Page, View, Text } from '../src/index.js';

  const { debug = true, text = 'hello' } = $props();
</script>

<Document>
  <Page size={[50, 25]}>
    <Text value={text} {debug} />
  </Page>
</Document>
