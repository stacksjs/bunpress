# Configuration Deep-Dive

BunPress supports comprehensive configuration for customizing every aspect of your documentation site.

## Configuration File

Create a `bunpress.config.ts` in your project root:

```typescript
import type { BunPressOptions } from 'bunpress'

const config: BunPressOptions = {
  // Basic settings
  verbose: false,
  docsDir: './docs',
  outDir: './dist',

  // Navigation
  nav: [...],

  // Markdown settings
  markdown: {
    title: 'My Documentation',
    sidebar: {...},
    toc: {...},
    features: {...},
  },

  // Site features
  search: {...},
  sitemap: {...},
  robots: {...},
}

export default config
```

## Directory Configuration

```typescript
export default {
  // Source directory
  docsDir: './docs',

  // Output directory
  outDir: './dist',

  // Public assets directory
  publicDir: './public',

  // Cache directory
  cacheDir: './.bunpress/cache',
}
```

## Navigation

### Top Navigation

```typescript
export default {
  nav: [
    { text: 'Home', link: '/' },
    { text: 'Guide', link: '/guide/' },
    {
      text: 'Dropdown',
      items: [
        { text: 'Item 1', link: '/item1' },
        { text: 'Item 2', link: '/item2' },
      ],
    },
    { text: 'GitHub', link: 'https://github.com/...' },
  ],
}
```

### Sidebar

```typescript
export default {
  markdown: {
    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
          ],
        },
        {
          text: 'Advanced',
          collapsed: true,
          items: [
            { text: 'Configuration', link: '/guide/config' },
          ],
        },
      ],
      '/api/': [
        { text: 'API Reference', link: '/api/' },
      ],
    },
  },
}
```

## Markdown Configuration

### Title and Meta

```typescript
export default {
  markdown: {
    title: 'My Documentation',
    meta: {
      description: 'Documentation for my project',
      author: 'Your Name',
      keywords: 'docs, documentation, guide',
    },
  },
}
```

### Table of Contents

```typescript
export default {
  markdown: {
    toc: {
      enabled: true,
      position: 'sidebar', // 'sidebar' | 'inline' | 'floating'
      title: 'On this page',
      minDepth: 2,
      maxDepth: 4,
      smoothScroll: true,
      activeHighlight: true,
    },
  },
}
```

### Syntax Highlighting

```typescript
export default {
  markdown: {
    syntaxHighlightTheme: 'github-dark',
    // or dual themes
    syntaxHighlightTheme: {
      light: 'github-light',
      dark: 'github-dark',
    },
  },
}
```

### Features

```typescript
export default {
  markdown: {
    features: {
      containers: true,
      githubAlerts: true,
      codeBlocks: {
        lineNumbers: true,
        lineHighlighting: true,
        focus: true,
        diffs: true,
        errorWarningMarkers: true,
      },
      codeGroups: true,
      emoji: true,
      badges: true,
    },
  },
}
```

## SEO Configuration

### Sitemap

```typescript
export default {
  sitemap: {
    enabled: true,
    baseUrl: 'https://your-docs.com',
    changefreq: 'weekly',
    priority: 0.8,
    priorityMap: {
      '/': 1.0,
      '/guide/*': 0.9,
      '/api/*': 0.8,
    },
  },
}
```

### Robots.txt

```typescript
export default {
  robots: {
    enabled: true,
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/draft/', '/private/'],
      },
    ],
  },
}
```

## Analytics

### Fathom Analytics

```typescript
export default {
  fathom: {
    enabled: true,
    siteId: 'YOUR_SITE_ID',
    honorDNT: true,
  },
}
```

### Custom Analytics

```typescript
export default {
  head: [
    [
      'script',
      {},
      `
        // Your analytics code
      `,
    ],
  ],
}
```

## Search Configuration

```typescript
export default {
  search: {
    enabled: true,
    provider: 'local',
    options: {
      maxResults: 10,
      minQueryLength: 2,
    },
  },
}
```

## Theme Configuration

```typescript
export default {
  themeConfig: {
    colors: {
      primary: '#3b82f6',
      accent: '#8b5cf6',
    },
    fonts: {
      sans: 'Inter, sans-serif',
      mono: 'Fira Code, monospace',
    },
    darkMode: {
      enabled: true,
      default: 'auto',
    },
  },
}
```

## Build Options

```typescript
export default {
  build: {
    minify: true,
    sourcemap: false,
    clean: true,
    base: '/',
  },
}
```

## Development Options

```typescript
export default {
  dev: {
    port: 3000,
    host: 'localhost',
    open: true,
    watch: true,
  },
}
```

## Environment Variables

```typescript
export default {
  // Use environment variables
  sitemap: {
    baseUrl: process.env.SITE_URL || 'https://localhost:3000',
  },

  fathom: {
    enabled: process.env.NODE_ENV === 'production',
  },
}
```

## Extending Configuration

### Multiple Config Files

```typescript
// bunpress.config.ts
import baseConfig from './config/base'
import prodConfig from './config/prod'

export default {
  ...baseConfig,
  ...(process.env.NODE_ENV === 'production' ? prodConfig : {}),
}
```

### Config Validation

```typescript
import { defineConfig } from 'bunpress'

export default defineConfig({
  // Type-safe configuration
})
```

## Related

- [Theming](/advanced/theming) - Theme customization
- [Performance](/advanced/performance) - Build optimization
- [CI/CD Integration](/advanced/ci-cd) - Deployment
