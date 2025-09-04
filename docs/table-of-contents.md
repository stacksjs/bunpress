# Table of Contents

BunPress automatically generates and manages table of contents for your documentation with powerful customization options.

## Automatic TOC Generation

BunPress automatically generates a table of contents from your heading structure.

```markdown
# Introduction

## Getting Started

### Installation

### Configuration

## Advanced Usage

### Customization

### Extensions
```

## TOC Positioning

### Sidebar TOC (Default)

The table of contents appears in the sidebar by default.

```markdown
---
toc: sidebar
---

# My Document
```

### Inline TOC

Place the TOC anywhere in your content using the `[[toc]]` syntax.

```markdown
# My Document

[[toc]]

## Section 1

Some content...

## Section 2

More content...
```

### Floating TOC

A floating TOC that stays visible while scrolling.

```markdown
---
toc: floating
---

# My Document
```

### Multiple Positions

You can enable multiple TOC positions:

```markdown
---
toc: [sidebar, floating]
---

# My Document
```

## TOC Customization

### Custom Title

```markdown
---
tocTitle: "Contents"
---

# My Document
```

### Depth Control

Control which heading levels appear in the TOC:

```markdown
---
toc:
  minDepth: 2
  maxDepth: 4
---

# Level 1 (not in TOC)
## Level 2 (in TOC)
### Level 3 (in TOC)
#### Level 4 (in TOC)
##### Level 5 (not in TOC)
```

### Exclude Patterns

Exclude specific headings from the TOC:

```markdown
# Normal Heading

## Getting Started

## Advanced Usage <!-- toc-ignore -->

## API Reference
```

## Heading Anchors

All headings automatically get anchor links for easy sharing.

```markdown
## My Section

Content here...
```

Renders as:

```html
<h2 id="my-section">
  <a href="#my-section" class="heading-anchor">#</a>
  My Section
</h2>
```

## Special Characters in Anchors

BunPress handles special characters in headings gracefully:

```markdown
# What's New? (v2.0)

## Features & Benefits

### Vue.js + TypeScript = ❤️
```

Generates clean URLs:

- `#whats-new-v2-0`
- `#features-benefits`
- `#vue-js-typescript`

## Duplicate Headings

BunPress automatically handles duplicate heading names:

```markdown
# Introduction

## Usage

### Basic Usage

## Usage

### Advanced Usage
```

Generates unique IDs:

- `#usage` (first)
- `#usage-1` (second)

## Long Heading Text

Long headings are automatically truncated in the TOC:

```markdown
## A Very Long Heading Title That Might Cause Issues With Display And Should Be Handled Gracefully By The TOC Generation System
```

Appears as: "A Very Long Heading Title That Might Cause Issues With Display And Should Be Handled Gracefully By The TOC Generation System..."

## Headings with Code

Inline code in headings is preserved in the TOC:

```markdown
## Using `map()` function

### Working with `Array.prototype.filter()`
```

## Interactive Features

### Smooth Scrolling

TOC links use smooth scrolling for better navigation experience.

### Active Item Highlighting

The current section is automatically highlighted as you scroll.

### Collapse/Expand

TOC sections can be collapsed and expanded for better organization.

## Configuration

Configure TOC behavior in your `bunpress.config.ts`:

```typescript
export default {
  markdown: {
    toc: {
      enabled: true,
      position: ['sidebar'],
      title: 'Table of Contents',
      maxDepth: 6,
      minDepth: 2,
      smoothScroll: true,
      activeHighlight: true,
      collapsible: true,
      exclude: []
    }
  }
}
```

## Frontmatter Options

You can also configure TOC per page using frontmatter:

```markdown
---
toc:
  title: "Contents"
  maxDepth: 3
  position: [sidebar, floating]
---
```

## CSS Classes

BunPress provides CSS classes for styling:

- `.table-of-contents` - Main TOC container
- `.toc-title` - TOC title
- `.toc-list` - TOC list
- `.toc-item` - Individual TOC items
- `.toc-link` - TOC links
- `.toc-active` - Active TOC items
- `.toc-collapse` - Collapsible TOC items
- `.toc-truncate` - Truncated long headings
- `.toc-code` - Headings containing code

## Performance

- TOC generation is optimized for large documents
- Smooth scrolling is hardware-accelerated
- Active item highlighting uses efficient scroll listeners
- Long headings are truncated for better performance
