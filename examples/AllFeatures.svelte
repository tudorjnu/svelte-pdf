<script>
  import {
    Document,
    Page,
    View,
    Text,
    Link,
    Image,
    Note,
    Font,
  } from '@svelte-pdf/renderer';
  import { Markdown } from '@svelte-pdf/markdown';
  import fs from 'node:fs';
  import path from 'node:path';
  import url from 'node:url';

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  // Register custom fonts from react-pdf's test assets. The markdown content
  // renders bold/italic runs, and the engine resolves font styles exactly
  // (no fallback across fontStyle), so every variant the document uses needs
  // a source. In the hermetic test setup all URLs serve the same fixture
  // TTF — enough to exercise the pipeline without real variant metrics.
  Font.register({
    family: 'Oswald',
    fonts: [
      {
        src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
      },
      {
        src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
        fontWeight: 700,
      },
    ],
  });

  Font.register({
    family: 'Open Sans',
    fonts: [
      {
        src: 'https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0e.ttf',
      },
      {
        src: 'https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0e.ttf',
        fontWeight: 700,
      },
      {
        src: 'https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0e.ttf',
        fontStyle: 'italic',
      },
      {
        src: 'https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0e.ttf',
        fontWeight: 700,
        fontStyle: 'italic',
      },
    ],
  });

  const { title = 'svelte-pdf feature test' } = $props();

  const imageSrc = fs.readFileSync(
    path.resolve(__dirname, '../../packages/renderer/tests/images/orientation-1.jpeg'),
  );

  const markdownContent = `
# Markdown heading

This is a paragraph with **bold**, *italic*, and [a link](https://svelte.dev).

- Unordered item one
- Unordered item two

1. Ordered one
2. Ordered two

> A blockquote

Inline \`code\` and a rule below.

---
`;
</script>

<Document
  title={title}
  author="svelte-pdf"
  subject="Feature overview"
  keywords={['svelte', 'pdf', 'react-pdf']}
  creator="svelte-pdf"
>
  <Page size="A4" style={{ padding: 40, fontFamily: 'Open Sans' }}>
    <View style={{ backgroundColor: '#e4e4e4', padding: 20, marginBottom: 20 }}>
      <Text
        value={title}
        style={{ fontSize: 32, textAlign: 'center', fontFamily: 'Oswald' }}
      />
    </View>

    <Text
      value="Custom fonts, styles, and metadata are supported."
      style={{ fontSize: 12, marginBottom: 10 }}
    />

    <Text
      value="Flexbox layout with gap:"
      style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 5 }}
    />

    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
      <View style={{ flex: 1, height: 40, backgroundColor: 'red' }} />
      <View style={{ flex: 1, height: 40, backgroundColor: 'green' }} />
      <View style={{ flex: 1, height: 40, backgroundColor: 'blue' }} />
    </View>

    <Text value="Borders and radius:" style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 5 }} />
    <View
      style={{
        width: 100,
        height: 60,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: 'black',
        borderStyle: 'dashed',
        borderRadius: 10,
        backgroundColor: 'lightyellow',
      }}
    />

    <Text value="External link:" style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 5 }} />
    <Link href="https://github.com/diegomura/react-pdf" style={{ marginBottom: 10 }}>
      <Text value="react-pdf on GitHub" style={{ color: 'blue', textDecoration: 'underline' }} />
    </Link>

    <Text value="Image:" style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 5 }} />
    <Image src={imageSrc} style={{ width: 220, height: 'auto', marginBottom: 10 }} />

    <Note value="This is a PDF note annotation." />
  </Page>

  <Page size="A4" style={{ padding: 40, fontFamily: 'Open Sans' }}>
    <Text
      value="Markdown content:"
      style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, fontFamily: 'Oswald' }}
    />
    <Markdown content={markdownContent} />
  </Page>
</Document>
