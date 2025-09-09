# Search Example

This example demonstrates how to configure and use search functionality in BunPress.

## Basic Search Configuration

Enable search in your `bunpress.config.ts`:

```typescript
export default {
  markdown: {
    search: {
      enabled: true,
      placeholder: 'Search documentation...',
      maxResults: 10,
      keyboardShortcuts: true
    }
  }
}
```

## Search Features

The search functionality includes:

- **Real-time search**: Results appear as you type
- **Smart ranking**: Results are ranked by relevance (title > headings > content)
- **Keyboard shortcuts**: Press `Ctrl+K` (or `Cmd+K` on Mac) to focus search
- **Content snippets**: Shows relevant content snippets for each result
- **Mobile friendly**: Responsive design that works on all devices

## Search Index Generation

BunPress automatically generates a search index from your markdown content:

- **Titles**: Highest ranking for exact title matches
- **Headings**: Medium ranking for heading matches
- **Content**: Base ranking for content matches
- **Smart snippets**: Extracts relevant text around search terms

## Custom Search Configuration

Configure search behavior with various options:

```typescript
export default {
  markdown: {
    search: {
      enabled: true,
      placeholder: 'Search...',
      maxResults: 5,
      keyboardShortcuts: false
    }
  }
}
```

## Search Results

Search results include:

- **Title**: The page title
- **URL**: The page URL
- **Content snippet**: Relevant text around the search term
- **Score**: Internal ranking score (higher = more relevant)

## Keyboard Shortcuts

- `Ctrl+K` / `Cmd+K`: Focus search input
- `Escape`: Close search results and blur input
- `Arrow keys`: Navigate through results
- `Enter`: Select highlighted result

## Mobile Search

On mobile devices:

- Search input adapts to screen size
- Touch-friendly interface
- Optimized for small screens
- Keyboard shortcuts disabled (not needed on mobile)

## Try It Out

Enable search in your configuration and try searching for terms in your documentation. The search will automatically index all your content and provide fast, relevant results!

## Performance

- **Lazy loading**: Search index loads only when needed
- **Debounced input**: Prevents excessive API calls while typing
- **Cached results**: Search index is cached for better performance
- **Minimal bundle size**: Search functionality is lightweight
