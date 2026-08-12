<script>
  import { Document, Page, View } from '../src/index.js';

  const {
    width = 100,
    height = 100,
    margin = 20,
    borderWidth = 2,
    borderColor = 'black',
    borderStyle = 'solid',
    borderRadius = 0,
    backgroundColor,
  } = $props();
</script>

<Document>
  <Page size={[200, 200]} style={{ backgroundColor: '#e2e2e2' }}>
    <View
      style={{
        width,
        height,
        margin,
        borderWidth,
        borderColor,
        borderStyle,
        borderRadius,
        backgroundColor,
      }}
    />
  </Page>
</Document>
