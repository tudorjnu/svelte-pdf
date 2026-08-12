<script>
  import { Document, Page, View, Image } from '../src/index.js';

  const { imageSrc } = $props();
</script>

<Document>
  <Page>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      <Image src={imageSrc} style={{ width: 220, margin: 5 }} />
    </View>
  </Page>
</Document>
