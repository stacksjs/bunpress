# Configuration

BunPress can be configured through a `bunpress.config.ts` file in your project root.

## Basic Configuration

```typescript
// bunpress.config.ts
export default {
  // Enable verbose logging
  verbose: true,

  // Markdown plugin configuration
  markdown: {
    title: 'My Documentation',
    meta: {
      description: 'My project documentation',
      author: 'Your Name',
    },
    scripts: [
      '/js/highlight.js',
    ],
  },
}
```

## Available Options

### General Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `verbose` | `boolean` | `true` | Enable verbose logging |

### Markdown Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `string` | `'BunPress Documentation'` | Default title for HTML documents |
| `meta` | `Record<string, string>` | See below | Metadata for HTML documents |
| `css` | `string` | See below | Custom CSS to be included in the head of the document |
| `scripts` | `string[]` | `[]` | List of script URLs to be included at the end of the body |
| `template` | `string` | `undefined` | Custom HTML template with `{{content}}` placeholder |
| `markedOptions` | `object` | `{}` | Custom options for the Marked Markdown parser |
| `preserveDirectoryStructure` | `boolean` | `true` | Whether to preserve the directory structure in the output |

## Default Metadata

By default, BunPress includes the following metadata:

```typescript
{
  description: 'Documentation built with BunPress',
  generator: 'BunPress',
  viewport: 'width=device-width, initial-scale=1.0',
}
```

## Default CSS

BunPress includes a default stylesheet that provides a clean, responsive layout for your documentation.
