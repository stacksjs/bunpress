---
title: Configuration
description: Complete guide to configuring BunPress
---
    title: 'My Project Docs',
    meta: {
      description: 'Comprehensive documentation for My Project',
    },

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
    ],

    sidebar: {
      '/guide/': [
        { text: 'Getting Started', link: '/guide/' },
        { text: 'Configuration', link: '/guide/configuration' },
      ],
    },

    toc: {
      enabled: true,
      position: 'sidebar',
      minDepth: 2,
      maxDepth: 4,
    },

    syntaxHighlightTheme: 'github-dark',
  },

  sitemap: {
    enabled: true,
    baseUrl: 'https://docs.myproject.com',
  },

  robots: {
    enabled: true,
  },

  fathom: {
    enabled: true,
    siteId: 'ABCD1234',
    honorDNT: true,
  },
}

export default config
```

## Environment Variables

You can use environment variables in your configuration:

```typescript
const config: BunPressOptions = {
  fathom: {
    enabled: process.env.NODE_ENV === 'production',
    siteId: process.env.FATHOM_SITE_ID,
  },

  sitemap: {
    baseUrl: process.env.SITE_URL || 'https://localhost:3000',
  },
}
```

## Validating Configuration

Use the CLI to validate your configuration:

```bash
bunpress config:validate
```

This checks for:

- Required fields
- Valid nav/sidebar structure
- Correct option types
- Markdown configuration validity
