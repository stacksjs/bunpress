# Performance Optimization

BunPress is built for speed. This guide covers optimization techniques for even better performance.

## Build Performance

### Parallel Processing

BunPress builds pages in parallel by default:

```typescript
export default {
  build: {
    parallel: true,
    workers: 4, // Number of worker threads
  },
}
```

### Incremental Builds

Only rebuild changed files:

```bash
bunpress build --incremental
```

### Caching

Enable build caching:

```typescript
export default {
  build: {
    cache: true,
    cacheDir: '.bunpress/cache',
  },
}
```

## Asset Optimization

### Image Optimization

```typescript
export default {
  build: {
    images: {
      optimize: true,
      formats: ['webp', 'avif'],
      quality: 80,
      lazy: true,
    },
  },
}
```

### CSS Optimization

```typescript
export default {
  build: {
    css: {
      minify: true,
      purge: true, // Remove unused CSS
      inline: true, // Inline critical CSS
    },
  },
}
```

### JavaScript Optimization

```typescript
export default {
  build: {
    js: {
      minify: true,
      treeshake: true,
      split: true, // Code splitting
    },
  },
}
```

## Content Optimization

### Markdown Caching

```typescript
export default {
  markdown: {
    cache: true,
  },
}
```

### Syntax Highlighting

Preload common languages:

```typescript
export default {
  markdown: {
    syntaxHighlighting: {
      preloadLanguages: ['typescript', 'javascript', 'bash'],
      lazy: true, // Lazy load other languages
    },
  },
}
```

### Search Index

Build search index at build time:

```typescript
export default {
  search: {
    prebuilt: true,
    lazy: true, // Load on demand
  },
}
```

## Runtime Performance

### Lazy Loading

```typescript
export default {
  runtime: {
    lazyImages: true,
    lazyIframes: true,
    prefetch: true,
  },
}
```

### Prefetching

```typescript
export default {
  runtime: {
    prefetch: {
      enabled: true,
      strategy: 'viewport', // 'viewport' | 'hover' | 'load'
    },
  },
}
```

### Code Splitting

```typescript
export default {
  build: {
    splitChunks: {
      layout: true,
      pages: true,
      components: true,
    },
  },
}
```

## CDN and Caching

### Static Assets

```typescript
export default {
  build: {
    assets: {
      hash: true, // Add content hash to filenames
      maxAge: 31536000, // 1 year cache
    },
  },
}
```

### CDN Configuration

```typescript
export default {
  build: {
    base: 'https://cdn.example.com/',
    assetPrefix: 'https://cdn.example.com/assets/',
  },
}
```

## Compression

### Gzip/Brotli

```typescript
export default {
  build: {
    compress: {
      gzip: true,
      brotli: true,
    },
  },
}
```

### Pre-compress Assets

```bash
bunpress build --compress
```

## Benchmarking

### Build Time

```bash
bunpress build --profile
```

Output:
```
Build Profile:
  Markdown parsing: 1.2s
  Syntax highlighting: 0.8s
  Template rendering: 0.5s
  Asset optimization: 1.0s
  Total: 3.5s

Pages: 150
Assets: 45
Output size: 12.5 MB
```

### Page Speed

```bash
bunpress analyze
```

## Monitoring

### Build Stats

```typescript
export default {
  build: {
    stats: true,
    statsFile: './build-stats.json',
  },
}
```

### Bundle Analysis

```bash
bunpress build --analyze
```

## Best Practices

### Optimize Images

1. Use WebP/AVIF formats
2. Specify dimensions
3. Use lazy loading
4. Responsive images

```markdown
![Alt text](/image.webp){width=800 height=600 loading=lazy}
```

### Minimize JavaScript

1. Defer non-critical scripts
2. Use async loading
3. Tree-shake unused code
4. Split by route

### Optimize CSS

1. Purge unused styles
2. Inline critical CSS
3. Defer non-critical CSS
4. Minify in production

### Content Best Practices

1. Keep pages focused
2. Lazy load heavy content
3. Use appropriate heading levels
4. Optimize code examples

## Performance Checklist

- [ ] Enable build caching
- [ ] Optimize images
- [ ] Minify CSS/JS
- [ ] Enable compression
- [ ] Configure CDN
- [ ] Preload critical assets
- [ ] Lazy load non-critical content
- [ ] Enable prefetching
- [ ] Monitor build times
- [ ] Analyze bundle size

## Lighthouse Score

Target scores:

| Metric | Target |
|--------|--------|
| Performance | 95+ |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

## Related

- [Configuration](/advanced/configuration) - Build options
- [CI/CD Integration](/advanced/ci-cd) - Deployment optimization
- [Theming](/advanced/theming) - CSS optimization
