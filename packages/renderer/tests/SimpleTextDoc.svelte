<script>
  import { Document, Page, View, Text } from '../src/index.js';

  const { color = '#ff0000', textValue = 'Hello svelte-pdf', __container } = $props();
</script>

<Document __container={__container}>
  <Page size="A4">
    <View style={{ backgroundColor: color, padding: 20 }}>
      <Text value={textValue} style={{ fontSize: 24, color: '#ffffff' }} />
    </View>
  </Page>
</Document>
