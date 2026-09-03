<script>
  import { Document, Page, View, Text, Link } from '@svelte-pdf/renderer';

  const { title = 'Hello svelte-pdf' } = $props();
</script>

<Document title={title} author="svelte-pdf">
  <Page size="A4" style={{ padding: 40 }}>
    <View style={{ backgroundColor: '#e4e4e4', padding: 20, marginBottom: 20 }}>
      <Text value={title} style={{ fontSize: 32, textAlign: 'center' }} />
    </View>

    <Text
      value="This PDF was generated from a Svelte 5 component using svelte-pdf."
      style={{ fontSize: 14, marginBottom: 10 }}
    />

    <Text
      value="Features on display:"
      style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}
    />

    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
      <View style={{ flex: 1, height: 40, backgroundColor: 'red' }} />
      <View style={{ flex: 1, height: 40, backgroundColor: 'green' }} />
      <View style={{ flex: 1, height: 40, backgroundColor: 'blue' }} />
    </View>

    <Link href="https://github.com/diegomura/react-pdf" style={{ color: 'blue', textDecoration: 'underline' }}>
      <Text value="Built on top of react-pdf's engine" />
    </Link>
  </Page>
</Document>
