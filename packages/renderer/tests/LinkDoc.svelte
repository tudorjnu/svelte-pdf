<script>
  import { Document, Page, Link, Text, View } from '../src/index.js';

  const { href = 'https://example.com', debug = false } = $props();
</script>

<Document>
  <Page size={[50, 25]} style={{ alignItems: 'flex-start' }}>
    <Link {href} style={{ textDecoration: 'none' }} {debug}>
      <Text value="hello" />
    </Link>
  </Page>
</Document>
