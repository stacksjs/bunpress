# Getting Started

This guide will walk you through setting up BunPress and creating your first documentation site.

## Prerequisites

Before you begin, ensure you have:

- [Bun](https://bun.sh) v1.0 or higher installed
- A code editor (VS Code recommended)
- Basic familiarity with Markdown

```bash
# Check Bun version
bun --version
```

## Quick Start

### Installation

Install BunPress as a development dependency:

```bash
# Using bun
bun add -D @stacksjs/bunpress

# Using npm
npm install -D @stacksjs/bunpress

# Using pnpm
pnpm add -D @stacksjs/bunpress
```

### Initialize Project

Create a new documentation project:

```bash
bunpress init
```

This creates the following structure:

```
my-docs/
├── docs/
│   ├── index.md          # Home page
│   └── guide/
│       └── index.md      # Guide landing
├── bunpress.config.ts    # Configuration
├── .gitignore
└── README.md
```

### Start Development

Launch the development server:

```bash
bunpress dev
```

Your documentation is now live at `http://localhost:3000` with hot reload enabled.

## Project Structure

A typical BunPress project follows this structure:

```
project/
├── docs/                     # Documentation source
│   ├── index.md             # Home page (uses home layout)
│   ├── guide/               # Guide section
│   │   ├── index.md
│   │   ├── getting-started.md
│   │   └── configuration.md
│   ├── api/                 # API reference
│   │   └── index.md
│   └── public/              # Static assets
│       ├── images/
│       └── favicon.ico
├── bunpress.config.ts       # BunPress configuration
├── package.json
└── tsconfig.json
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `docs/` | Markdown source files |
| `docs/public/` | Static assets (images, fonts, etc.) |
| `dist/` | Build output (generated) |

## Creating Content

### Home Page

The `docs/index.md` serves as your landing page. Use the `home` layout:

```markdown
---
layout: home

hero:
  name: "My Project"
  text: "Fast & Modern"
  tagline: "Build amazing documentation"
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/your/repo

features:
  - title: Lightning Fast
    details: Built on Bun for exceptional performance
  - title: Easy to Use
    details: Markdown-first with sensible defaults
  - title: Fully Featured
    details: SEO, search, and analytics built-in
---
```

### Documentation Pages

Regular documentation pages use the `doc` layout (default):

```markdown
---
title: Getting Started
description: Learn how to set up your project
---

# Getting Started

Welcome to the documentation...
```

### Navigation

Configure navigation in `bunpress.config.ts`:

```typescript
export default {
  nav: [
    { text: 'Home', link: '/' },
    { text: 'Guide', link: '/guide/' },
    { text: 'API', link: '/api/' },
  ],

  markdown: {
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Configuration', link: '/guide/configuration' },
          ]
        }
      ]
    }
  }
}
```

## Building for Production

Build your documentation for deployment:

```bash
bunpress build
```

This generates optimized static files in the `dist/` directory.

### Preview Build

Preview the production build locally:

```bash
bunpress preview
```

## Next Steps

- [Configuration Guide](/config) - Customize your site
- [Markdown Extensions](/markdown-extensions) - Learn advanced syntax
- [CLI Reference](/cli) - All available commands
- [SEO Guide](/seo) - Optimize for search engines
