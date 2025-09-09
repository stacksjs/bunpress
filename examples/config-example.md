---
title: Configuration Example
description: Comprehensive BunPress configuration examples
author: BunPress Team
layout: doc
toc: sidebar
tocTitle: Configuration Guide
sidebar:
  - text: Basic Configuration
    link: /config-example#basic-configuration
  - text: Markdown Options
    link: /config-example#markdown-options
  - text: Theme Configuration
    link: /config-example#theme-configuration
  - text: Navigation Setup
    link: /config-example#navigation-setup
  - text: Advanced Options
    link: /config-example#advanced-options
---

# Configuration Example

This comprehensive example shows how to configure BunPress for optimal documentation generation.

## Basic Configuration

Create a `bunpress.config.ts` file in your project root:

```typescript
// bunpress.config.ts
export default {
  // Enable verbose logging during build
  verbose: true,

  // Markdown processing configuration
  markdown: {
    // Default title for pages without frontmatter
    title: 'My Documentation',

    // Meta tags for all pages
    meta: {
      description: 'Documentation built with BunPress',
      author: 'My Team',
      generator: 'BunPress'
    },

    // Custom CSS to include
    css: `
      .custom-style {
        color: #3b82f6;
        font-weight: 600;
      }
    `,

    // External scripts to include
    scripts: [
      '/js/analytics.js',
      'https://cdn.example.com/script.js'
    ]
  }
}
```

## Markdown Options

Advanced markdown processing configuration:

```typescript
export default {
  markdown: {
    // Custom Marked.js options
    markedOptions: {
      breaks: true, // Convert line breaks to <br>
      gfm: true, // Enable GitHub Flavored Markdown
      headerIds: true, // Auto-generate header IDs
      mangle: false // Don't mangle email addresses
    },

    // Table of contents configuration
    toc: {
      enabled: true,
      position: 'sidebar', // 'sidebar', 'floating', or false
      title: 'Contents',
      depth: 3, // Maximum heading depth
      ignore: ['toc-ignore'] // CSS classes to ignore
    },

    // Syntax highlighting options
    highlight: {
      theme: 'github-light', // Code highlighting theme
      languages: ['javascript', 'typescript', 'bash', 'json']
    },

    // Preserve directory structure in output
    preserveDirectoryStructure: true,

    // Custom template (overrides default HTML)
    template: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{title}}</title>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 800px; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="container">
    {{content}}
  </div>
</body>
</html>
    `
  }
}
```

## Theme Configuration

Comprehensive theming options:

```typescript
export default {
  markdown: {
    themeConfig: {
      // Color palette
      colors: {
        primary: '#3b82f6', // Primary brand color
        secondary: '#64748b', // Secondary elements
        accent: '#f59e0b', // Accent/highlight color
        background: '#ffffff', // Page background
        surface: '#f8fafc', // Cards, sidebars
        text: '#1e293b', // Primary text
        muted: '#64748b' // Secondary text
      },

      // Typography
      fonts: {
        heading: 'Inter, system-ui, sans-serif',
        body: 'Inter, system-ui, sans-serif',
        mono: 'JetBrains Mono, ui-monospace, monospace'
      },

      // Dark mode configuration
      darkMode: 'auto', // 'auto', true, or false

      // Custom CSS variables
      cssVars: {
        'border-radius': '8px',
        'shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      },

      // Custom CSS
      css: `
        .highlight {
          background: var(--color-accent);
          padding: 1rem;
          border-radius: var(--border-radius);
        }
      `
    }
  }
}
```

## Navigation Setup

Configure navigation and site structure:

```typescript
export default {
  // Main navigation bar
  nav: [
    {
      text: 'Home',
      link: '/',
      icon: '🏠'
    },
    {
      text: 'Guide',
      activeMatch: '/guide',
      items: [
        { text: 'Getting Started', link: '/guide/getting-started' },
        { text: 'Installation', link: '/guide/installation' },
        { text: 'Configuration', link: '/guide/configuration' }
      ]
    },
    {
      text: 'API',
      link: '/api'
    },
    {
      text: 'GitHub',
      link: 'https://github.com/your-repo',
      icon: '🐙'
    }
  ],

  // Sidebar configuration per section
  markdown: {
    sidebar: {
      '/guide': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'Advanced', link: '/guide/advanced' }
          ]
        }
      ],
      '/api': [
        { text: 'API Reference', link: '/api' },
        {
          text: 'Endpoints',
          items: [
            { text: 'Users', link: '/api/users' },
            { text: 'Posts', link: '/api/posts' },
            { text: 'Comments', link: '/api/comments' }
          ]
        }
      ]
    }
  }
}
```

## Advanced Options

Advanced configuration options:

```typescript
export default {
  // Build configuration
  build: {
    // Output directory
    outDir: 'dist',

    // Base public path
    base: '/',

    // Files to include/exclude
    include: ['**/*.md'],
    exclude: ['**/node_modules/**', '**/dist/**'],

    // Build optimization
    minify: true,
    sourcemap: false,

    // Cache configuration
    cache: {
      enabled: true,
      dir: '.cache',
      maxAge: 3600000 // 1 hour
    }
  },

  // Development server
  server: {
    host: '0.0.0.0',
    port: 3000,
    https: false,
    open: true
  },

  // Plugin configuration
  plugins: [
    // Add custom plugins here
  ],

  // Environment variables
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    BASE_URL: process.env.BASE_URL || '/'
  },

  // Custom hooks
  hooks: {
    // Before build starts
    preBuild: async () => {
      console.log('Starting build...')
    },

    // After build completes
    postBuild: async (result) => {
      console.log('Build completed!')
      console.log(`Generated ${result.pages.length} pages`)
    },

    // Handle build errors
    onError: (error) => {
      console.error('Build error:', error)
    }
  },

  // Search configuration
  search: {
    enabled: true,
    placeholder: 'Search documentation...',
    maxResults: 10,
    keyboardShortcut: 'ctrl+k'
  },

  // Analytics and tracking
  analytics: {
    enabled: true,
    trackingId: 'GA_MEASUREMENT_ID'
  }
}
```

## Configuration Validation

BunPress validates your configuration and provides helpful error messages:

```typescript
// This will show validation errors
export default {
  nav: 'invalid', // Should be an array
  markdown: {
    toc: {
      position: 'invalid' // Should be 'sidebar', 'floating', or false
    }
  }
}
```

## Environment-Specific Configuration

Use environment variables for different deployment targets:

```typescript
// bunpress.config.ts
const isProduction = process.env.NODE_ENV === 'production'
const isStaging = process.env.NODE_ENV === 'staging'

export default {
  base: isProduction ? '/docs/' : '/',
  build: {
    minify: isProduction,
    sourcemap: !isProduction
  },
  analytics: {
    enabled: isProduction,
    trackingId: isProduction ? 'GA_PROD_ID' : 'GA_DEV_ID'
  }
}
```

## Configuration Splitting

Split configuration into multiple files for better organization:

```typescript
import { navConfig } from './config/navigation'
// config/theme.ts
// bunpress.config.ts
import { themeConfig } from './config/theme'

export const themeConfig = {
  colors: { /* ... */ },
  fonts: { /* ... */ }
}

// config/navigation.ts
export const navConfig = [
  // Navigation items...
]

export default {
  nav: navConfig,
  markdown: {
    themeConfig
  }
}
```

This configuration system provides flexibility while maintaining good defaults for most use cases.
