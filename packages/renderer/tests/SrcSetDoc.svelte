<script>
  import { Document, Page, Image } from '../src/index.js';

  const { src, srcSet, sizes } = $props();
</script>

<Document>
  <Page size={{ width: 150, height: 100 }}>
    <Image {src} {srcSet} {sizes} style={{ width: 60 }} />
  </Page>
  <Page size={{ width: 300, height: 100 }}>
    <Image {src} {srcSet} {sizes} style={{ width: 60 }} />
  </Page>
  <Page size={{ width: 500, height: 100 }}>
    <Image {src} {srcSet} {sizes} style={{ width: 60 }} />
  </Page>
</Document>
