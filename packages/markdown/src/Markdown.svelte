<script>
  import { getContext } from 'svelte';
  import { lexer } from 'marked';
  import * as primitives from '@svelte-pdf/engine/primitives';

  const { content = '', baseStyle = {} } = $props();

  const parent = getContext('pdf-parent');
  const root = getContext('pdf-root');

  const HEADING_SIZES = {
    1: 32,
    2: 28,
    3: 24,
    4: 20,
    5: 18,
    6: 16,
  };

  const appendText = (children, text, style = {}) => {
    if (text === '') return;
    children.push({
      type: primitives.Text,
      props: {},
      style: { ...baseStyle, ...style },
      children: [{ type: primitives.TextInstance, value: text }],
      box: {},
    });
  };

  const appendLink = (children, href, parts, style = {}) => {
    const link = {
      type: primitives.Link,
      props: { href },
      style: { ...baseStyle, ...style },
      children: [],
      box: {},
    };

    // marked v12 emits link children as plain `text` tokens; some carry no
    // `tokens` array at all, so the parts list itself may be absent.
    for (const part of parts ?? []) {
      if (typeof part === 'string') {
        link.children.push({
          type: primitives.Text,
          props: {},
          style: { ...baseStyle, ...style },
          children: [{ type: primitives.TextInstance, value: part }],
          box: {},
        });
      } else {
        appendInlineStyled(link.children, part);
      }
    }

    children.push(link);
  };

  const appendInlineStyled = (children, token, base = {}) => {
    const style = { ...base };
    if (token.type === 'strong') style.fontWeight = 'bold';
    if (token.type === 'em') style.fontStyle = 'italic';
    if (token.type === 'del') style.textDecoration = 'line-through';
    if (token.type === 'codespan') {
      style.fontFamily = 'Courier';
      style.backgroundColor = '#f0f0f0';
    }

    // marked's inline tokens always carry their children in `tokens`, except
    // `codespan` (raw text in `text`) and bare `text` leaves (also in `text`).
    const text =
      token.type === 'codespan' ? token.text : (token.tokens ?? token.text);

    if (typeof text === 'string') {
      appendText(children, text, style);
      return;
    }

    const parts = [];
    const flushParts = () => {
      if (parts.length > 0) {
        appendText(children, parts.join(''), style);
        parts.length = 0;
      }
    };

    for (const child of text) {
      if (child.type === 'text') {
        parts.push(child.text);
      } else {
        // Consecutive text children batch into one run; flush it so the
        // styled child keeps its position in the text flow.
        flushParts();
        if (child.type === 'link') {
          appendLink(children, child.href, child.tokens, style);
        } else {
          appendInlineStyled(children, child, style);
        }
      }
    }
    flushParts();
  };

  const buildParagraph = (tokens) => {
    const paragraph = {
      type: primitives.View,
      props: {},
      style: { marginBottom: 10, ...baseStyle },
      children: [],
      box: {},
    };

    for (const token of tokens) {
      if (token.type === 'text') {
        appendText(paragraph.children, token.text);
      } else if (token.type === 'link') {
        appendLink(paragraph.children, token.href, token.tokens, { color: 'blue', textDecoration: 'underline' });
      } else {
        appendInlineStyled(paragraph.children, token);
      }
    }

    return paragraph;
  };

  const buildList = (tokens, ordered = false) => {
    const list = {
      type: primitives.View,
      props: {},
      style: { marginBottom: 10, ...baseStyle },
      children: [],
      box: {},
    };

    let index = 1;
    for (const item of tokens) {
      const itemView = {
        type: primitives.View,
        props: {},
        style: { flexDirection: 'row', marginBottom: 4 },
        children: [],
        box: {},
      };

      const bulletText = ordered ? `${index}. ` : '• ';
      index += 1;

      appendText(itemView.children, bulletText, { width: 20 });
      itemView.children.push(buildParagraph(item.tokens));

      list.children.push(itemView);
    }

    return list;
  };

  const buildBlockquote = (tokens) => {
    const quote = {
      type: primitives.View,
      props: {},
      style: {
        borderLeftWidth: 4,
        borderLeftColor: '#ccc',
        paddingLeft: 10,
        marginBottom: 10,
        ...baseStyle,
      },
      children: [],
      box: {},
    };

    for (const token of tokens) {
      const child = buildNode(token);
      if (child) quote.children.push(child);
    }

    return quote;
  };

  const buildNode = (token) => {
    switch (token.type) {
      case 'heading': {
        const view = {
          type: primitives.View,
          props: {},
          style: { marginBottom: 10, ...baseStyle },
          children: [],
          box: {},
        };
        appendInlineStyled(view.children, { ...token, type: 'text', tokens: token.tokens }, {
          fontSize: HEADING_SIZES[token.depth] || 16,
          fontWeight: 'bold',
        });
        return view;
      }
      case 'paragraph':
        return buildParagraph(token.tokens);
      case 'list':
        return buildList(token.items, token.ordered);
      case 'blockquote':
        return buildBlockquote(token.tokens);
      case 'hr': {
        return {
          type: primitives.View,
          props: {},
          style: {
            height: 1,
            backgroundColor: '#000',
            marginVertical: 10,
            ...baseStyle,
          },
          children: [],
          box: {},
        };
      }
      case 'code': {
        return {
          type: primitives.View,
          props: {},
          style: {
            backgroundColor: '#f5f5f5',
            padding: 8,
            marginBottom: 10,
            ...baseStyle,
          },
          children: [
            {
              type: primitives.Text,
              props: {},
              style: { fontFamily: 'Courier', fontSize: 10 },
              children: [{ type: primitives.TextInstance, value: token.text }],
              box: {},
            },
          ],
          box: {},
        };
      }
      default:
        return null;
    }
  };

  const sync = () => {
    const tokens = lexer(content, { gfm: true });

    // Clear existing children
    node.children.length = 0;

    for (const token of tokens) {
      const child = buildNode(token);
      if (child) node.children.push(child);
    }

    root?.notify();
  };

  const node = {
    type: primitives.View,
    props: {},
    style: baseStyle,
    children: [],
    box: {},
  };

  parent.appendChild(node);

  sync();

  $effect(() => {
    content;
    baseStyle;
    sync();
  });
</script>
