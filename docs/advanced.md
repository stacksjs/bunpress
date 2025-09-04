# Advanced

This section covers advanced features and configuration options for power users.

## Custom Templates

BunPress supports custom HTML templates for complete control over output.

### Basic Template

```html
<!-- custom-template.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <style>
    /* Custom styles */
  </style>
</head>
<body>
  <header>
    <nav>
      <!-- Navigation -->
    </nav>
  </header>

  <main>
    {{content}}
  </main>

  <footer>
    <!-- Footer content -->
  </footer>

  <script>
    // Custom JavaScript
  </script>
</body>
</html>
```

### Template Configuration

```typescript
// bunpress.config.ts
export default {
  markdown: {
    template: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{title}}</title>
  <style>
    body { font-family: 'Arial', sans-serif; }
    .content { max-width: 800px; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="content">
    {{content}}
  </div>
</body>
</html>
    `
  }
}
```

## Plugin System

BunPress uses Bun's plugin system for extensibility.

### Creating Custom Plugins

```typescript
// custom-plugin.ts
import type { BunPlugin } from 'bun'

export function customMarkdownPlugin(options: any = {}): BunPlugin {
  return {
    name: 'custom-markdown-plugin',
    setup(build) {
      build.onLoad({ filter: /\.md$/ }, async (args) => {
        const content = await Bun.file(args.path).text()

        // Process markdown content
        let processedContent = content

        // Apply custom transformations
        processedContent = processedContent.replace(/\{\{year\}\}/g, new Date().getFullYear().toString())

        // Custom frontmatter processing
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1]
          // Process frontmatter
        }

        return {
          contents: processedContent,
          loader: 'text'
        }
      })
    }
  }
}
```

### Using Custom Plugins

```typescript
// bunpress.config.ts
import { customMarkdownPlugin } from './custom-plugin'

export default {
  plugins: [customMarkdownPlugin({ /* options */ })]
}
```

## Build Optimization

### Code Splitting

BunPress automatically handles code splitting for optimal loading.

### Asset Optimization

- Images are automatically optimized
- CSS is minified
- JavaScript is bundled efficiently
- Unused code is tree-shaken

### Caching

```typescript
// Enable caching for better performance
export default {
  build: {
    cache: true,
    cacheDir: '.cache'
  }
}
```

## Custom CSS and JavaScript

### Global Styles

```typescript
export default {
  markdown: {
    css: `
.custom-style {
  color: #4c6ef5;
  font-weight: 600;
}

.highlight {
  background-color: #fff3cd;
  padding: 1rem;
  border-radius: 0.375rem;
}
    `
  }
}
```

### Custom Scripts

```typescript
export default {
  markdown: {
    scripts: [
      '/js/analytics.js',
      '/js/custom.js'
    ]
  }
}
```

## Environment Variables

BunPress supports environment variables for configuration.

```typescript
// Use environment variables
export default {
  verbose: process.env.NODE_ENV === 'development',
  markdown: {
    title: process.env.SITE_TITLE || 'My Documentation'
  }
}
```

## Custom Marked Extensions

Extend Marked.js with custom extensions.

```typescript
import { marked } from 'marked'

// Custom extension for spoilers
const spoilerExtension = {
  name: 'spoiler',
  level: 'inline',
  start: (src: string) => src.match(/\|\|/)?.index,
  tokenizer: (src: string) => {
    const match = src.match(/^\|\|([^\|]+)\|\|/)
    if (match) {
      return {
        type: 'spoiler',
        raw: match[0],
        text: match[1]
      }
    }
  },
  renderer: (token: any) => {
    return `<span class="spoiler">${token.text}</span>`
  }
}

marked.use({ extensions: [spoilerExtension] })
```

## Build Hooks

### Pre-build Hook

```typescript
export default {
  hooks: {
    preBuild: async () => {
      console.log('Starting build...')
      // Pre-build logic
    }
  }
}
```

### Post-build Hook

```typescript
export default {
  hooks: {
    postBuild: async (result) => {
      console.log('Build completed!')
      // Post-build logic
      // e.g., deploy to CDN, generate sitemap, etc.
    }
  }
}
```

## Data Loading and Content Management

BunPress provides powerful data loading capabilities for dynamic content generation.

### Frontmatter Configuration

Use frontmatter to configure individual pages:

```yaml
---
title: My Page
description: Page description
author: Author Name
date: 2024-01-15
tags: [tag1, tag2, tag3]
category: documentation
layout: doc
toc: sidebar
search:
  enabled: true
themeConfig:
  colors:
    primary: '#3b82f6'
---
```

### Programmatic Content Generation

Generate content programmatically using the BunPress API:

```typescript
import { build } from 'bunpress'

const result = await build({
  files: [
    {
      path: 'index.md',
      content: `---
title: Generated Page
---

# Generated Content

This page was generated programmatically.
      `
    }
  ],
  config: {
    markdown: {
      themeConfig: {
        colors: {
          primary: '#10b981'
        }
      }
    }
  }
})
```

### File Organization Patterns

Organize your documentation files for better maintainability:

```
docs/
├── index.md              # Homepage
├── guide/
│   ├── index.md         # Guide overview
│   ├── getting-started.md
│   └── installation.md
├── api/
│   ├── index.md         # API overview
│   └── endpoints.md     # API endpoints
└── examples/
    ├── index.md         # Examples overview
    └── basic-usage.md   # Usage examples
```

### Dynamic Route Generation

Create dynamic routes based on content:

```typescript
// For files like posts/[slug].md
// Generates routes like /posts/my-first-post.html
```

### Content Processing Pipeline

BunPress processes content through a comprehensive pipeline:

1. **File Discovery**: Finds all markdown files
2. **Frontmatter Parsing**: Extracts metadata
3. **Content Transformation**: Applies markdown processing
4. **Theme Application**: Applies configured themes
5. **HTML Generation**: Creates final HTML output

### Custom File Processing

Handle custom file types and processing.

```typescript
// bunpress.config.ts
export default {
  build: {
    loaders: {
      '.custom': 'text'
    }
  }
}
```

## Performance Monitoring

### Build Analytics

```typescript
export default {
  analytics: {
    enabled: true,
    trackBuildTime: true,
    trackFileSizes: true
  }
}
```

### Bundle Analysis

```bash
# Analyze bundle size
bun run build --analyze

# Generate bundle report
bun run build --report
```

## Internationalization (i18n)

Support multiple languages in your documentation.

```typescript
export default {
  i18n: {
    locales: ['en', 'es', 'fr'],
    defaultLocale: 'en',
    localePath: './locales'
  }
}
```

### Localized Content

```markdown
<!-- docs/intro.en.md -->
# Introduction

Welcome to our documentation!

<!-- docs/intro.es.md -->
# Introducción

¡Bienvenido a nuestra documentación!
```

## Sitemap Generation

BunPress automatically generates XML sitemaps for better SEO:

### Basic Sitemap Configuration

```typescript
export default {
  sitemap: {
    enabled: true,
    baseUrl: 'https://example.com',
    filename: 'sitemap.xml'
  }
}
```

### Advanced Sitemap Features

Configure priorities, change frequencies, and exclusions:

```typescript
export default {
  sitemap: {
    baseUrl: 'https://example.com',
    defaultPriority: 0.5,
    defaultChangefreq: 'monthly',
    exclude: ['/private/**', '/admin/**'],
    priorityMap: {
      '/': 1.0,
      '/docs/**': 0.8,
      '/blog/**': 0.7
    },
    changefreqMap: {
      '/blog/**': 'weekly',
      '/docs/**': 'monthly',
      '/': 'daily'
    }
  }
}
```

### Frontmatter Sitemap Configuration

Control sitemap settings per page:

```yaml
---
title: My Page
priority: 0.8
changefreq: weekly
lastmod: 2024-01-01
sitemap: true  # or false to exclude
---

Content here...
```

### Multi-Sitemap Support

For large sites, BunPress automatically splits sitemaps:

```typescript
export default {
  sitemap: {
    baseUrl: 'https://example.com',
    maxUrlsPerFile: 50000,  // Split after 50k URLs
    useSitemapIndex: true   // Generate sitemap index
  }
}
```

## Robots.txt Generation

Configure search engine crawling behavior:

### Basic Robots.txt

```typescript
export default {
  robots: {
    enabled: true,
    filename: 'robots.txt'
  }
}
```

### Advanced Robots Configuration

```typescript
export default {
  robots: {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/private/', '/admin/']
      },
      {
        userAgent: 'Googlebot',
        allow: ['/'],
        disallow: ['/admin/'],
        crawlDelay: 1
      }
    ],
    sitemaps: ['https://example.com/sitemap.xml'],
    host: 'example.com'
  }
}
```

### Frontmatter Robots Configuration

Add custom robots rules per page:

```yaml
---
title: Private Page
robots:
  - userAgent: '*'
    disallow: ['/private/']
---

This page should not be crawled.
```

## Custom Error Handling

```typescript
export default {
  errorHandler: (error, file) => {
    console.error(`Error in ${file}:`, error)
    // Custom error handling
  }
}
```

## Security Considerations

### Content Security Policy

```typescript
export default {
  security: {
    csp: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}
```

### Input Sanitization

BunPress automatically sanitizes user input to prevent XSS attacks.

## Deployment Options

### Static Site Generation

```bash
# Build for production
bun run build

# Preview production build
bun run preview
```

### Server-Side Rendering

```typescript
// Enable SSR
export default {
  ssr: true,
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
}
```

### CDN Deployment

```typescript
export default {
  deploy: {
    cdn: {
      provider: 'cloudflare',
      zone: 'your-zone-id'
    }
  }
}
```

## API Reference

### Programmatic Usage

```typescript
import { build } from 'bunpress'

await build({
  entrypoints: ['./docs/**/*.md'],
  outdir: './dist',
  config: {
    // Configuration options
  }
})
```

### Plugin API

```typescript
interface BunPressPlugin {
  name: string
  setup: (build: BuildContext) => void | Promise<void>
}

interface BuildContext {
  onLoad: (options: OnLoadOptions, callback: OnLoadCallback) => void
  onResolve: (options: OnResolveOptions, callback: OnResolveCallback) => void
}
```
