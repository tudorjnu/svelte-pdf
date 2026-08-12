<script>
  import { Document, Page, View } from '../src/index.js';

  const { gap = 10, direction = 'row' } = $props();
</script>

<Document>
  <Page size={[100, 50]} style={{ backgroundColor: '#e2e2e2' }}>
    <View style={{ flexDirection: direction, gap }}>
      <View style={{ width: 20, height: 20, backgroundColor: 'red' }} />
      <View style={{ width: 20, height: 20, backgroundColor: 'blue' }} />
      <View style={{ width: 20, height: 20, backgroundColor: 'green' }} />
    </View>
  </Page>
</Document>
