# svelte-pdf

A library for creating PDF documents using Svelte 5 components, on the browser and server. Built by vendoring react-pdf's framework-agnostic engine and replacing only the React-specific layer with Svelte.

## Language

**Engine**:
The framework-agnostic PDF pipeline — layout (Yoga flexbox), text layout, rendering, PDF generation, font loading, image processing, and style resolution. Consolidated into a single package `@svelte-pdf/engine`.
_Avoid_: core, internals, pipeline

**Renderer**:
The Svelte-specific layer that provides PDF components (`Document`, `Page`, `View`, `Text`, etc.), browser components (`PDFViewer`, `PDFDownloadLink`), and server-side APIs (`renderToBuffer`, `renderToFile`). Package: `@svelte-pdf/renderer`.
_Avoid_: wrapper, adapter

**Element tree**:
The plain-object tree of nodes that the engine consumes. Each node has a `type` (e.g. `VIEW`, `TEXT`), `style`, `props`, `children`, and `box`. Built by Svelte components via context API during initialization.
_Avoid_: virtual DOM, component tree, render tree

**Node**:
A single element in the element tree. Created by a Svelte component and registered with its parent via `setContext`/`getContext`.
_Avoid_: element, instance, fiber

**Text instance**:
A leaf node in the element tree containing a text string (`{ type: 'TEXT_INSTANCE', value: 'Hello' }`). Created when a `value` prop is set on a `Text` component.
_Avoid_: text node, text element, text content

**Container**:
The shared root object (`{ type: 'ROOT', document: null }`) used to capture the element tree during server-side rendering via Svelte's `render()`.
_Avoid_: root, context, store
