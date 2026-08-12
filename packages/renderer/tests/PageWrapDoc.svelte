<script>
  import { Document, Page, View, Text } from '../src/index.js';
</script>

<Document>
  <Page size={[200, 100]} style={{ padding: 10 }}>
    {#each Array(10) as _, i}
      <View style={{ height: 30, marginBottom: 5, backgroundColor: i % 2 === 0 ? 'red' : 'blue' }}>
        <Text value={`Block ${i + 1}`} style={{ color: 'white' }} />
      </View>
    {/each}
  </Page>
</Document>
