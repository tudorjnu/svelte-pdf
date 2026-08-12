<script>
  import { Document, Page, Link, Text, View } from '../src/index.js';
</script>

<Document>
  <Page orientation="landscape" size="A4" style={{ padding: 30, fontSize: 24 }}>
    <View>
      <Link href="#nameddestination">
        <Text value="Click me to get to the named destination" />
      </Link>
    </View>
    <View id="nameddestination" break>
      <Text value="Here is the named destination" />
    </View>
  </Page>
</Document>
