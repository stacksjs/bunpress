---
title: Table of Contents
description: Configure automatic table of contents generation
---

```

Or customize per page:

```markdown
---

title: Deep Technical Guide
toc:
  maxDepth: 5

  position: floating
---

# Technical Documentation

This page has deeper TOC levels.
```

## Advanced Usage

### Custom Anchor IDs

Create custom anchor IDs for headings:

```markdown

## My Heading {#custom-anchor}

```

This creates a heading with anchor `#custom-anchor` instead of auto-generated `#my-heading`.

### Duplicate Headings

BunPress automatically handles duplicate heading text by appending numbers:

```markdown

## Configuration

...

## Configuration

...
```

Becomes anchors: `#configuration` and `#configuration-1`

### Code in Headings

Headings can include inline code:

```markdown

## Using `useState` Hook

## The `config.ts` File

```

The TOC will display the code formatting appropriately.

## Performance

The TOC is generated at build time, not runtime, ensuring:

- No JavaScript required for basic TOC functionality
- Fast page loads
- SEO-friendly anchor links

Interactive features (smooth scroll, active highlight) are progressively enhanced with minimal JavaScript.
