# @svelte-pdf/markdown

Markdown-to-PDF component for [svelte-pdf](https://github.com/diegomura/react-pdf).

## Installation

```bash
npm install @svelte-pdf/markdown
```

## Usage

```svelte
<script>
  import { Document, Page } from '@svelte-pdf/renderer';
  import { Markdown } from '@svelte-pdf/markdown';
</script>

<Document>
  <Page>
    <Markdown content="# Hello **world**" />
  </Page>
</Document>
```

## Supported Markdown

- Headings (`#` to `######`)
- Paragraphs
- **Bold**, *italic*, ~~strikethrough~~
- [Links](https://example.com)
- Unordered and ordered lists
- Blockquotes
- Inline code and code blocks
- Horizontal rules
