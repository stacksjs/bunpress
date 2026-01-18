---
title: Configuration
description: Complete guide to configuring BunPress
---

# Configuration

BunPress is configured through a `bunpress.config.ts` file in your project root. This page covers all available configuration options.

## Basic Configuration

Create a `bunpress.config.ts` file:

```typescript
import type { BunPressOptions } from '@stacksjs/bunpress'

const config: BunPressOptions = {
  verbose: false,
  docsDir: './docs',
  outDir: './dist',
  theme: 'vitepress',

  markdown: {
    title: 'My Documentation',
  },
}

export default config
```

## Configuration Options

### General Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `verbose` | `boolean` | `false` | Enable verbose logging |
| `docsDir` | `string` | `'./docs'` | Source directory for markdown files |
| `outDir` | `string` | `'./dist'` | Output directory for build |
| `theme` | `'vitepress'` | `'vitepress'` | Theme to use |

### Markdown Configuration

The `markdown` object contains extensive options:

```typescript
markdown: {
  title: 'My Documentation',
  meta: {
    description: 'Site description',
    author: 'Your Name',
  },

  template: '<div class="content">{{content}}</div>',

  css: `
    .content { max-width: 800px; margin: 0 auto; }
  `,

  scripts: [
    'https://example.com/analytics.js',
  ],

  syntaxHighlightTheme: 'github-dark',

  preserveDirectoryStructure: true,
}
```

### Navigation

Configure the top navigation bar:

```typescript
nav: [
  { text: 'Home', link: '/' },
  { text: 'Guide', link: '/guide/' },
  {
    text: 'API',
    items: [
      { text: 'Overview', link: '/api/' },
      { text: 'Methods', link: '/api/methods' },
    ],
  },
  {
    text: 'GitHub',
    link: 'https://github.com/stacksjs/bunpress',
    icon: 'github',
  },
]
```

### Sidebar

Configure sidebar navigation per section:

```typescript
sidebar: {
  '/guide/': [
    {
      text: 'Introduction',
      items: [
        { text: 'Getting Started', link: '/guide/' },
        { text: 'Configuration', link: '/guide/configuration' },
      ],
    },
    {
      text: 'Advanced',
      items: [
        { text: 'Markdown Features', link: '/guide/markdown-features' },
        { text: 'SEO', link: '/guide/seo' },
      ],
    },
  ],
  '/api/': [
    { text: 'Overview', link: '/api/' },
    { text: 'Methods', link: '/api/methods' },
  ],
}
```

### Table of Contents

Configure automatic TOC generation:

```typescript
toc: {
  enabled: true,
  position: 'sidebar',
  title: 'On this page',
  minDepth: 2,
  maxDepth: 4,
  smoothScroll: true,
  activeHighlight: true,
  collapsible: true,
  exclude: ['/^Internal/'],
}
```

### Theme Configuration

Customize the visual appearance:

```typescript
themeConfig: {
  colors: {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#8b5cf6',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    muted: '#64748b',
  },

  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
    mono: 'Fira Code, monospace',
  },

  darkMode: 'auto',

  cssVars: {
    '--custom-spacing': '1.5rem',
  },
}
```

### Search Configuration

Enable and configure site search:

```typescript
search: {
  enabled: true,
  placeholder: 'Search documentation...',
  maxResults: 10,
  keyboardShortcuts: true,
}
```

### Markdown Features

Toggle specific markdown features:

```typescript
features: {
  inlineFormatting: true,

  containers: {
    info: true,
    tip: true,
    warning: true,
    danger: true,
    details: true,
    raw: true,
  },

  githubAlerts: true,

  codeBlocks: {
    lineHighlighting: true,
    lineNumbers: true,
    focus: true,
    diffs: true,
    errorWarningMarkers: true,
  },

  codeGroups: true,
  codeImports: true,
  inlineToc: true,
  customAnchors: true,
  emoji: true,
  badges: true,
  includes: true,
  externalLinks: true,
  imageLazyLoading: true,
  tables: true,
}
```

## Complete Example

Here's a complete configuration example:

```typescript
import type { BunPressOptions } from '@stacksjs/bunpress'

const config: BunPressOptions = {
  verbose: false,
  docsDir: './docs',
  outDir: './dist',

  markdown: {
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
