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
    }
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
      }
    }
  }
}
```

This configuration system provides flexibility while maintaining good defaults for most use cases.
