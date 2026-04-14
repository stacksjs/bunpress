---
title: Table of Contents
description: Configure automatic table of contents generation
---

## First Section

Content here...
```

### Floating

Display as a floating panel:

```typescript
toc: {
  position: 'floating',
}
```

### Multiple Positions

Combine positions:

```typescript
toc: {
  position: ['sidebar', 'inline'],
}
```

## Filtering Headings

### Depth Range

Control which heading levels are included:

```typescript
toc: {
  minDepth: 2,  // Start from h2 (exclude h1)
  maxDepth: 3,  // Include only h2 and h3
}
```

### Exclude Patterns

Exclude specific headings using regex patterns or exact matches:

```typescript
toc: {
  exclude: [
    '/^Internal/',      // Regex: exclude headings starting with "Internal"
    '/Debug$/',         // Regex: exclude headings ending with "Debug"
    'Deprecated',       // Exact match: exclude "Deprecated"
  ],
}
```

### Exclude in Markdown

Use HTML comments to exclude specific headings:

```markdown

## Regular Heading

This heading appears in the TOC.

<!-- toc-ignore -->

## Hidden Heading

This heading is excluded from the TOC.

## Another Regular Heading

```

## Styling

### Custom Styles

Override default TOC styles with custom CSS:

```typescript
markdown: {
  css: `
    .table-of-contents {
      position: sticky;
      top: 4rem;
      max-height: calc(100vh - 8rem);
      overflow-y: auto;
    }

    .toc-item {
      padding: 0.25rem 0;
      border-left: 2px solid transparent;
    }

    .toc-item.active {
      border-left-color: var(--primary-color);
      color: var(--primary-color);
    }

    .toc-link {
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.2s;
    }

    .toc-link:hover {
      color: var(--text-color);
    }
  `,
}
```

### CSS Variables

Available CSS variables for TOC customization:

```css
:root {
  --toc-width: 220px;
  --toc-offset-top: 4rem;
  --toc-border-color: #e5e7eb;
  --toc-active-color: #3b82f6;
  --toc-link-color: #6b7280;
  --toc-link-hover-color: #1f2937;
}
```

## Interactive Features

### Smooth Scrolling

Enable smooth scrolling to anchors:

```typescript
toc: {
  smoothScroll: true,
}
```

### Active Highlighting

Automatically highlight the current section as you scroll:

```typescript
toc: {
  activeHighlight: true,
}
```

### Collapsible Sections

Make nested headings collapsible:

```typescript
toc: {
  collapsible: true,
}
```

## Frontmatter Override

Override TOC settings per page using frontmatter:

```markdown
---

title: My Page

toc: false
---

# Content without TOC

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
