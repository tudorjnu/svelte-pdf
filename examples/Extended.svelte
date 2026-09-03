<script>
  import {
    Document,
    Page,
    View,
    Text,
    Link,
    Image,
    Note,
  } from '@svelte-pdf/renderer';

  const {
    title = 'svelte-pdf extended demo',
    author = 'svelte-pdf',
    showImage = true,
    imageSrc = 'https://react-pdf.org/images/quijote1.jpg',
    pageCountOffset = 0,
  } = $props();
</script>

<Document
  {title}
  {author}
  subject="Demonstration of all core features"
  keywords="svelte, pdf, react-pdf"
  creator="svelte-pdf"
>
  <Page size="A4" style={{ padding: 40 }}>
    <View style={{ backgroundColor: '#e4e4e4', padding: 20, marginBottom: 20, borderRadius: 8 }}>
      <Text value={title} style={{ fontSize: 32, textAlign: 'center', fontWeight: 'bold' }} />
    </View>

    <Text
      value="This document exercises every core component in svelte-pdf."
      style={{ fontSize: 14, marginBottom: 20 }}
    />

    <Text value="Typography" style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }} />

    <Text
      value="Paragraph with bold and colored text."
      style={{ fontSize: 12, marginBottom: 10 }}
    />

    <Text value="Lists and layout" style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }} />

    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
      <View style={{ flex: 1, height: 50, backgroundColor: 'red' }} />
      <View style={{ flex: 1, height: 50, backgroundColor: 'green' }} />
      <View style={{ flex: 1, height: 50, backgroundColor: 'blue' }} />
    </View>

    <View style={{ gap: 8, marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'black', marginRight: 8 }} />
        <Text value="Flexbox row with gap" style={{ fontSize: 12 }} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'black', marginRight: 8 }} />
        <Text value="Border radius on views" style={{ fontSize: 12 }} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'black', marginRight: 8 }} />
        <Text value="Styled text and containers" style={{ fontSize: 12 }} />
      </View>
    </View>

    <Text value="Links" style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }} />

    <Link href="https://github.com/diegomura/react-pdf" style={{ color: 'blue', textDecoration: 'underline', marginBottom: 20 }}>
      <Text value="Built on top of react-pdf's engine" style={{ fontSize: 12 }} />
    </Link>

    {#if showImage}
      <Text value="Image" style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }} />
      <Image src={imageSrc} style={{ width: 200, marginBottom: 20 }} />
    {/if}

    <Note value="This is a PDF note annotation." />

    <Text value="Page metadata" style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }} />

    <Text value="Title, author, subject, keywords and creator are set on the Document." style={{ fontSize: 12 }} />

    <Text
      fixed
      style={{ position: 'absolute', bottom: 30, left: 0, right: 0, fontSize: 10, textAlign: 'center', color: 'grey' }}
      render={({ pageNumber, totalPages }) => `Page ${pageNumber + pageCountOffset} / ${totalPages + pageCountOffset}`}
    />
  </Page>

  <Page size="A4" orientation="landscape" style={{ padding: 40 }}>
    <Text value="Landscape page" style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }} />
    <View style={{ flexDirection: 'row', gap: 20 }}>
      <View style={{ flex: 1, height: 100, backgroundColor: 'orange', borderWidth: 2, borderColor: 'black', borderStyle: 'dashed' }} />
      <View style={{ flex: 1, height: 100, backgroundColor: 'purple', borderWidth: 2, borderColor: 'black', borderStyle: 'dotted' }} />
    </View>
  </Page>
</Document>
