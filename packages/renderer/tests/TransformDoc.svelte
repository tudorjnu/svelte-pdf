<script>
  import { Document, Page, View } from '../src/index.js';

  const { transform, width = 20, height = 20 } = $props();
</script>

<Document>
  <Page size={[20, 20]}>
    <View
      style={{
        width,
        height,
        backgroundColor: 'black',
        transform,
      }}
    />
  </Page>
</Document>
