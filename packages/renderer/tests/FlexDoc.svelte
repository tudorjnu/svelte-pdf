<script>
  import { Document, Page, View } from '../src/index.js';

  const { flex1 = '1 1 auto', flex2 = '1 1 auto', gap = 2, direction = 'row' } = $props();
</script>

<Document>
  <Page size={[100, 25]} style={{ backgroundColor: '#e2e2e2' }}>
    <View style={{ flexDirection: direction, gap }}>
      <View style={{ height: 20, width: 20, backgroundColor: 'red' }} />
      <View style={{ height: 20, width: 20, flex: flex1, backgroundColor: 'blue' }} />
      <View style={{ height: 20, width: 20, flex: flex2, backgroundColor: 'green' }} />
    </View>
  </Page>
</Document>
