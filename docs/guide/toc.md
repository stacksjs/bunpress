---
title: Table of Contents
description: Configure automatic table of contents generation
---

# Table of Contents

BunPress automatically generates a table of contents (TOC) from your markdown headings, providing easy navigation for your documentation pages.

## Basic Configuration

Enable and configure the TOC in your `bunpress.config.ts`:

```typescript
const config: BunPressOptions = {
  markdown: {
    toc: {
      enabled: true,
      position: 'sidebar',
      title: 'On this page',
    },
  },
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable TOC generation |
| `position` | `TocPosition \| TocPosition[]` | `['sidebar']` | Where to display the TOC |
| `title` | `string` | `'Table of Contents'` | TOC heading title |
| `minDepth` | `number` | `2` | Minimum heading level (h2) |
| `maxDepth` | `number` | `6` | Maximum heading level (h6) |
| `className` | `string` | `'table-of-contents'` | CSS class for container |
| `smoothScroll` | `boolean` | `true` | Enable smooth scrolling |
| `activeHighlight` | `boolean` | `true` | Highlight active item on scroll |
| `collapsible` | `boolean` | `true` | Enable collapsible sections |
| `exclude` | `string[]` | `[]` | Patterns to exclude headings |

## Position Options

The TOC can be displayed in multiple positions:

### Sidebar (Default)

Display in the right sidebar:

```typescript
toc: {
  position: 'sidebar',
}
```

### Inline

Insert TOC at a specific location using the `[[toc]]` marker:

```typescript
toc: {
  position: 'inline',
}
```

Then in your markdown:

```markdown
# My Page Title

[[toc]]

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
