# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

svelte-pdf is a library for creating PDF documents using Svelte 5 components, on the browser and server. It is built by vendoring react-pdf's framework-agnostic engine and replacing the React-specific layer with Svelte.

## Architecture

The library works as a pipeline: Svelte components → context API → element tree → layout → render → PDF output.

### Package Dependency Flow

```
@svelte-pdf/renderer (main entry point — exports Document, Page, View, Text, etc.)
  ├── @svelte-pdf/engine     → Consolidated engine: layout (Yoga), text layout, rendering,
  │                             pdfkit, font loading, image processing, style resolution
  └── @svelte-pdf/markdown   → Optional add-on: markdown-to-PDF-tree rendering

@svelte-pdf/engine contains the vendored framework-agnostic packages from react-pdf:
  primitives, fns, types, font, image, textkit, stylesheet, layout, render, pdfkit, math
```

## Agent skills

### Issue tracker

Issues live as local markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default triage label vocabulary is used. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo — one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
