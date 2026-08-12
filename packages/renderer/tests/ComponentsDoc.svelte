<script>
  import {
    Document,
    Page,
    View,
    Text,
    Link,
    Note,
    Image,
  } from '../src/index.js';

  const { imageSrc, textValue = 'Hello', href = 'https://example.com' } = $props();
</script>

<Document>
  <Page size="A4">
    <View style={{ padding: 20 }}>
      <Text value={textValue} />
      <Link href={href} style={{ color: 'blue', textDecoration: 'underline' }}>
        <Text value="Click here" />
      </Link>
      {#if imageSrc}
        <Image src={imageSrc} style={{ width: 100, height: 100 }} />
      {/if}
      <Note value="This is a note" />
    </View>
  </Page>
</Document>
