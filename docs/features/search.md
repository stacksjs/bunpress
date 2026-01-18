# Search

BunPress includes built-in search functionality for your documentation site. This guide covers configuration and customization options.

## Quick Start

Enable search in your configuration:

```typescript
// bunpress.config.ts
export default {
  search: {
    enabled: true,
  },
}
```

## Search Providers

### Built-in Search

BunPress includes a fast, client-side search:

```typescript
export default {
  search: {
    provider: 'local', // default
  },
}
```

### Algolia DocSearch

For larger documentation sites:

```typescript
export default {
  search: {
    provider: 'algolia',
    algolia: {
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_SEARCH_API_KEY',
      indexName: 'YOUR_INDEX_NAME',
    },
  },
}
```

## Local Search Options

### Indexing Configuration

```typescript
export default {
  search: {
    provider: 'local',
    options: {
      // Include/exclude patterns
      include: ['**/*.md'],
      exclude: ['**/node_modules/**', '**/draft/**'],

      // Search fields
      searchFields: ['title', 'content', 'headings'],

      // Result options
      maxResults: 10,
      minQueryLength: 2,
    },
  },
}
```

### Boosting

Prioritize certain content:

```typescript
export default {
  search: {
    options: {
      boost: {
        title: 10,
        headings: 5,
        content: 1,
      },
    },
  },
}
```

## UI Customization

### Placeholder Text

```typescript
export default {
  search: {
    placeholder: 'Search documentation...',
  },
}
```

### Keyboard Shortcut

```typescript
export default {
  search: {
    shortcut: '/', // Press / to focus search
    // or
    shortcut: ['ctrl', 'k'], // Ctrl+K
  },
}
```

### Result Appearance

```typescript
export default {
  search: {
    resultOptions: {
      showDescription: true,
      descriptionLength: 150,
      highlightMatches: true,
      showPath: true,
    },
  },
}
```

## Styling

### Custom CSS

```css
/* Search input */
.search-input {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.5rem 1rem;
}

/* Search modal */
.search-modal {
  background: var(--vp-c-bg);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

/* Search results */
.search-result {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.search-result:hover {
  background: var(--vp-c-bg-soft);
}

/* Highlighted matches */
.search-highlight {
  background: rgba(255, 213, 0, 0.3);
  padding: 0.1em 0.2em;
  border-radius: 2px;
}
```

## Advanced Configuration

### Custom Tokenizer

```typescript
export default {
  search: {
    options: {
      tokenize: (text) => {
        // Custom tokenization logic
        return text
          .toLowerCase()
          .split(/[\s\-_]+/)
          .filter((token) => token.length > 1)
      },
    },
  },
}
```

### Fuzzy Matching

```typescript
export default {
  search: {
    options: {
      fuzzy: true,
      fuzziness: 2, // Max edit distance
    },
  },
}
```

### Stemming

```typescript
export default {
  search: {
    options: {
      stemmer: 'english', // Use English stemmer
    },
  },
}
```

## Frontmatter Control

### Exclude Pages

```yaml
---
search: false
---

# This page won't be indexed
```

### Custom Search Keywords

```yaml
---
search:
  keywords:
    - alternative name
    - common misspelling
---
```

### Search Title Override

```yaml
---
search:
  title: Custom Search Title
---
```

## Search Analytics

### Track Searches

```typescript
export default {
  search: {
    onSearch: (query, results) => {
      // Track search analytics
      analytics.track('search', {
        query,
        resultCount: results.length,
      })
    },
  },
}
```

## Algolia DocSearch

### Setup

1. Apply at [docsearch.algolia.com](https://docsearch.algolia.com/apply)
2. Configure once approved:

```typescript
export default {
  search: {
    provider: 'algolia',
    algolia: {
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_SEARCH_ONLY_API_KEY',
      indexName: 'your_index',
      searchParameters: {
        facetFilters: ['language:en'],
      },
    },
  },
}
```

### Crawler Configuration

```json
{
  "index_name": "your_index",
  "start_urls": ["https://your-docs.com/"],
  "selectors": {
    "lvl0": ".sidebar-heading.active",
    "lvl1": "article h1",
    "lvl2": "article h2",
    "lvl3": "article h3",
    "content": "article p, article li"
  }
}
```

## Performance

### Lazy Loading

```typescript
export default {
  search: {
    lazy: true, // Load search index on demand
  },
}
```

### Index Size

```typescript
export default {
  search: {
    options: {
      // Reduce index size
      storeFields: ['title', 'path'], // Minimal stored fields
      maxContentLength: 500, // Limit content per page
    },
  },
}
```

### Prebuilt Index

Build search index at build time:

```bash
bunpress build --search-index
```

## Accessibility

Search is accessible by default:

- Keyboard navigation
- ARIA labels
- Focus management
- Screen reader support

## Best Practices

1. **Meaningful titles**: Use descriptive page titles
2. **Clear headings**: Well-structured headings improve search
3. **Keywords**: Add search keywords in frontmatter
4. **Test searches**: Verify common queries return expected results
5. **Monitor analytics**: Track search patterns to improve content

## Related

- [Configuration](/advanced/configuration) - Full configuration options
- [SEO](/guide/seo) - Search engine optimization
- [Performance](/advanced/performance) - Site performance
