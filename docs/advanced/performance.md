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

### Markdown Engine Performance

BunPress uses Bun's built-in Zig-based markdown parser (`Bun.markdown`), which is significantly faster than all JavaScript-based alternatives. All engines are configured with equivalent GFM features (tables, strikethrough, task lists, autolinks) for a fair comparison. These results were measured on Apple M3 Pro, 18GB RAM, Bun 1.3.10, using [mitata](https://github.com/evanwashere/mitata).

> **Fairness note:** These results are conservative. Real VitePress adds Shiki syntax highlighting + Vue plugins (`@mdit-vue/plugin-headers`, `@mdit-vue/plugin-sfc`, `@mdit-vue/plugin-component`) on top of markdown-it. Real Astro adds Shiki on top of remark/rehype. commonmark.js does not support GFM (no tables, strikethrough, or task lists), so it processes fewer features and appears artificially fast.

Engines tested:

- **BunPress** - Bun.markdown (Zig-based, built into Bun) with full GFM
- **VitePress** - markdown-it + task-lists plugin (JS, as configured in VitePress)
- **Eleventy** - markdown-it + task-lists plugin (JS, default engine + GFM parity)
- **Astro** - remark + remark-gfm + rehype (JS, unified ecosystem)
- **marked** - JS, fast compiler (GFM enabled by default)
- **micromark** - JS, small + safe + CommonMark (with GFM extension)
- **showdown** - JS, bidirectional converter (with GFM options)
- **commonmark (no GFM)** - JS, reference CommonMark impl (NO GFM support)

#### Simple Markdown (paragraph + inline formatting)

| Engine | Avg Time | vs BunPress |
|--------|---------|-------------|
| **BunPress** | **2.09 µs** | - |
| commonmark (no GFM) | 3.91 µs | 1.9x slower |
| Eleventy | 4.93 µs | 2.4x slower |
| VitePress | 7.87 µs | 3.8x slower |
| marked | 29.67 µs | 14x slower |
| showdown | 32.48 µs | 16x slower |
| micromark | 120.10 µs | 57x slower |
| Astro | 126.36 µs | 60x slower |

#### Inline-Heavy Content (~3KB)

| Engine | Avg Time | vs BunPress |
|--------|---------|-------------|
| **BunPress** | **22.09 µs** | - |
| commonmark (no GFM) | 79.92 µs | 3.6x slower |
| Eleventy | 119.70 µs | 5.4x slower |
| VitePress | 174.47 µs | 7.9x slower |
| showdown | 489.20 µs | 22x slower |
| marked | 1.57 ms | 71x slower |
| micromark | 1.70 ms | 77x slower |
| Astro | 2.26 ms | 102x slower |

#### Headings

| Engine | Avg Time | vs BunPress |
|--------|---------|-------------|
| **BunPress** | **6.14 µs** | - |
| Eleventy | 22.28 µs | 3.6x slower |
| commonmark (no GFM) | 24.62 µs | 4x slower |
| VitePress | 30.52 µs | 5x slower |
| marked | 54.01 µs | 8.8x slower |
| showdown | 160.55 µs | 26x slower |
| micromark | 543.45 µs | 89x slower |
| Astro | 634.46 µs | 103x slower |

#### Lists (unordered, ordered, task lists)

| Engine | Avg Time | vs BunPress |
|--------|---------|-------------|
| **BunPress** | **15.32 µs** | - |
| Eleventy | 68.88 µs | 4.5x slower |
| commonmark (no GFM) | 83.98 µs | 5.5x slower |
| VitePress | 90.52 µs | 5.9x slower |
| marked | 562.89 µs | 37x slower |
| showdown | 767.39 µs | 50x slower |
| micromark | 1.66 ms | 108x slower |
| Astro | 2.10 ms | 137x slower |

#### GFM Tables

| Engine | Avg Time | vs BunPress |
|--------|---------|-------------|
| **BunPress** | **27.03 µs** | - |
| commonmark (no GFM) | 32.99 µs | 1.2x slower |
| Eleventy | 142.51 µs | 5.3x slower |
| VitePress | 182.55 µs | 6.8x slower |
| marked | 525.06 µs | 19x slower |
| showdown | 685.48 µs | 25x slower |
| micromark | 3.36 ms | 124x slower |
| Astro | 4.26 ms | 158x slower |

#### Code Blocks

| Engine | Avg Time | vs BunPress |
|--------|---------|-------------|
| **BunPress** | **19.16 µs** | - |
| Eleventy | 31.85 µs | 1.7x slower |
| marked | 33.58 µs | 1.8x slower |
| VitePress | 34.66 µs | 1.8x slower |
| commonmark (no GFM) | 37.47 µs | 2x slower |
| showdown | 149.52 µs | 7.8x slower |
| micromark | 774.78 µs | 40x slower |
| Astro | 825.23 µs | 43x slower |

#### Mixed Content (realistic doc page)

| Engine | Avg Time | vs BunPress |
|--------|---------|-------------|
| **BunPress** | **7.92 µs** | - |
| commonmark (no GFM) | 34.69 µs | 4.4x slower |
| Eleventy | 37.16 µs | 4.7x slower |
| VitePress | 48.82 µs | 6.2x slower |
| marked | 178.76 µs | 23x slower |
| showdown | 247.80 µs | 31x slower |
| micromark | 743.17 µs | 94x slower |
| Astro | 878.50 µs | 111x slower |

#### Real-World Doc Page (~3KB markdown)

| Engine | Avg Time | vs BunPress |
|--------|---------|-------------|
| **BunPress** | **28.60 µs** | - |
| commonmark (no GFM) | 101.47 µs | 3.5x slower |
| Eleventy | 124.67 µs | 4.4x slower |
| VitePress | 178.68 µs | 6.2x slower |
| showdown | 791.29 µs | 28x slower |
| marked | 841.17 µs | 29x slower |
| micromark | 2.03 ms | 71x slower |
| Astro | 2.56 ms | 90x slower |

#### Large Document Stress Test (~33KB markdown)

| Engine | Avg Time | vs BunPress |
|--------|---------|-------------|
| **BunPress** | **204.97 µs** | - |
| commonmark (no GFM) | 1.01 ms | 4.9x slower |
| Eleventy | 1.07 ms | 5.2x slower |
| VitePress | 1.40 ms | 6.8x slower |
| showdown | 12.76 ms | 62x slower |
| micromark | 21.61 ms | 105x slower |
| Astro | 26.56 ms | 130x slower |
| marked | 47.41 ms | 231x slower |

#### Throughput: 100 Mixed Documents

| Engine | Avg Time | vs BunPress |
|--------|---------|-------------|
| **BunPress** | **827.40 µs** | - |
| commonmark (no GFM) | 3.45 ms | 4.2x slower |
| Eleventy | 3.80 ms | 4.6x slower |
| VitePress | 4.85 ms | 5.9x slower |
| marked | 17.43 ms | 21x slower |
| showdown | 25.29 ms | 31x slower |
| micromark | 72.79 ms | 88x slower |
| Astro | 84.95 ms | 103x slower |

### Build Performance (4,000 markdown files)

Using the same methodology as [11ty's official performance tests](https://www.11ty.dev/docs/performance/):

| Generator | Build Time | Files/Second | vs BunPress |
|-----------|-----------|--------------|-------------|
| **BunPress** | **0.18s** | **22,714** | - |
| Eleventy | 1.93s | 2,073 | 11x slower |
| VitePress | 8.50s | 471 | 47x slower |
| Astro | 22.90s | 175 | 130x slower |
| Gatsby | 29.05s | 138 | 165x slower |
| Next.js | 70.65s | 57 | 401x slower |

### Full-Featured Build (with syntax highlighting, templates, TOC)

| Generator | Build Time | vs BunPress |
|-----------|-----------|-------------|
| **BunPress** | **4.12s** | - |
| VitePress | 8.50s | 2x slower |
| Astro | 22.90s | 5.6x slower |
| Gatsby | 29.05s | 7x slower |
| Next.js | 70.65s | 17x slower |

### Running Benchmarks

```bash
# Markdown engine benchmarks (self-contained)
cd benchmark && bun install && bun run bench

# All benchmarks (build, server, features)
cd benchmark && bun run bench:all
```

### Build Time

```bash
bunpress build --profile
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
