<script>
  import { Document, Page, Text, View } from '../src/index.js';

  const { showFooter = true } = $props();
</script>

<Document>
  <Page size={[150, 80]} wrap style={{ padding: 10 }}>
    {#each Array(6) as _, i}
      <View style={{ height: 25, marginBottom: 5, backgroundColor: i % 2 === 0 ? 'red' : 'blue' }} />
    {/each}
    {#if showFooter}
      <Text
        style={{ fontSize: 10, textAlign: 'center' }}
        fixed
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    {/if}
  </Page>
</Document>
