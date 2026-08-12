<script>
  import { Document, Page, Text } from '../src/index.js';

  const { textValue = '' } = $props();
</script>

<Document>
  <Page size={[100, 100]}>
    <Text value={textValue} />
  </Page>
</Document>
