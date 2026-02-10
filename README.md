<p align="center"><img src=".github/art/cover.jpg" alt="Social Card of this repo"></p>

[![npm version][npm-version-src]][npm-version-href]
[![GitHub Actions][github-actions-src]][github-actions-href]
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
<!-- [![npm downloads][npm-downloads-src]][npm-downloads-href] -->
<!-- [![Codecov][codecov-src]][codecov-href] -->

# BunPress

**Fast, modern documentation engine powered by Bun, inspired by VitePress**

BunPress is a lightning-fast static site generator designed specifically for documentation. Built on top of Bun's blazing performance with a developer-friendly API inspired by VitePress.

## Features

### Core Features
- ⚡ **Lightning Fast** - 0.18s build time (4,000 files), 11x faster than Eleventy
- 📝 **Rich Markdown** - VitePress-compatible markdown with containers, alerts, code groups, and syntax highlighting
- 📋 **Smart TOC** - Automatic table of contents with filtering, positioning (sidebar/inline/floating), and interactive navigation
- 🛠️ **Developer Friendly** - Native TypeScript support, comprehensive CLI (15+ commands), and extensive customization

### SEO & Analytics
- 🔍 **Complete SEO** - Auto-generated sitemap.xml, robots.txt, Open Graph tags, and JSON-LD structured data
- 📊 **Fathom Analytics** - Privacy-focused analytics with GDPR/CCPA compliance and DNT support
- 🔎 **SEO Validation** - Built-in SEO checker with auto-fix mode for common issues

### Markdown Extensions (VitePress-Compatible)
- ✅ Custom containers (info, tip, warning, danger, details, raw)
- ✅ GitHub-flavored alerts (note, tip, important, warning, caution)
- ✅ Code features (line highlighting, line numbers, focus, diffs, errors/warnings, groups)
- ✅ Code imports from files with line ranges and regions
- ✅ Tables with alignment and formatting
- ✅ Image enhancements with captions and lazy loading
- ✅ Custom header anchors and inline TOC

### Developer Experience
- 🚀 **Fast Dev Server** - ~100ms startup, hot reload, and instant feedback
- 📦 **Small Bundles** - ~45KB per page (HTML + JS + CSS)
- 💚 **Low Memory** - ~50MB dev server, ~250MB peak for 1000 files
- 🎯 **15+ CLI Commands** - Build, dev, preview, stats, doctor, SEO check, and more

## Quick Start

Get started with BunPress in seconds:

```bash
# Install BunPress
bun add @stacksjs/bunpress

# Create a new documentation site
mkdir my-docs
cd my-docs

# Initialize with basic structure
bunx @stacksjs/bunpress init

# Start development server
bun run dev

# Build for production
bun run build
```

## Basic Usage

Create your first documentation page:

```markdown
---
title: Welcome
layout: home
---

# Welcome to My Project

This is my awesome project documentation built with BunPress!

## Quick Links

- [Getting Started](/guide/getting-started)
- [API Reference](/api)
- [Examples](/examples)
```

Configure your site in `bunpress.config.ts`:

```typescript
export default {
  title: 'My Documentation',
  description: 'Built with BunPress',
  nav: [
    { text: 'Home', link: '/' },
    { text: 'Guide', link: '/guide' },
    { text: 'API', link: '/api' }
  ],

  // SEO Configuration
  sitemap: {
    enabled: true,
    baseUrl: 'https://mysite.com',
  },
  robots: {
    enabled: true,
  },

  // Analytics
  fathom: {
    enabled: true,
    siteId: 'YOUR_SITE_ID',
    honorDNT: true,
  },
}
```

## CLI Commands

BunPress provides a comprehensive CLI for managing your documentation:

```bash
# Development
bunpress dev              # Start dev server with hot reload
bunpress build            # Build for production
bunpress preview          # Preview production build

# Content Management
bunpress new <path>       # Create new markdown file
bunpress init             # Initialize new project

# Maintenance
bunpress clean            # Remove build artifacts
bunpress stats            # Show documentation statistics
bunpress doctor           # Run diagnostic checks

# SEO
bunpress seo:check        # Check SEO for all pages
bunpress seo:check --fix  # Auto-fix SEO issues

# Configuration
bunpress config:show      # Show current configuration
bunpress config:validate  # Validate configuration
```

## Performance Benchmarks

BunPress is **the fastest** documentation generator available. Our benchmarks use the same methodology as [11ty's official performance tests](https://www.11ty.dev/docs/performance/) with 4,000 markdown files:

### Build Performance (4,000 markdown files)

| Generator | Build Time | vs BunPress |
|-----------|-----------|-------------|
| **BunPress** | **0.18s** | - |
| Eleventy | 1.93s | 11x slower |
| Astro | 22.90s | 130x slower |
| Gatsby | 29.05s | 165x slower |
| Next.js | 70.65s | 401x slower |

### Full-Featured Build (with syntax highlighting)

| Generator | Build Time | vs BunPress |
|-----------|-----------|-------------|
| **BunPress** | **4.12s** | - |
| Astro | 22.90s | 5.6x slower |
| Gatsby | 29.05s | 7x slower |
| Next.js | 70.65s | 17x slower |

**BunPress processes 22,000+ files per second** in fast mode, making it the fastest static site generator for documentation.

Run the benchmark yourself:
```bash
bun test test/benchmark.test.ts
```

## Testing

```bash
bun test              # Run all tests
bun test:quick        # Quick test run (10s timeout)
bun run typecheck     # Type checking
bun run lint          # Lint code
```

## Changelog

Please see our [releases](https://github.com/stacksjs/bunpress/releases) page for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Community

For help, discussion about best practices, or any other conversation that would benefit from being searchable:

[Discussions on GitHub](https://github.com/stacksjs/bunpress/discussions)

For casual chit-chat with others using this package:

[Join the Stacks Discord Server](https://discord.gg/stacksjs)

## Postcardware

“Software that is free, but hopes for a postcard.” We love receiving postcards from around the world showing where Stacks is being used! We showcase them on our website too.

Our address: Stacks.js, 12665 Village Ln #2306, Playa Vista, CA 90094, United States 🌎

## Sponsors

We would like to extend our thanks to the following sponsors for funding Stacks development. If you are interested in becoming a sponsor, please reach out to us.

- [JetBrains](https://www.jetbrains.com/)
- [The Solana Foundation](https://solana.com/)

## License

The MIT License (MIT). Please see [LICENSE](LICENSE.md) for more information.

Made with 💙

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@stacksjs/bunpress?style=flat-square
[npm-version-href]: https://npmjs.com/package/@stacksjs/bunpress
[github-actions-src]: https://img.shields.io/github/actions/workflow/status/stacksjs/bunpress/ci.yml?style=flat-square&branch=main
[github-actions-href]: https://github.com/stacksjs/bunpress/actions?query=workflow%3Aci

<!-- [codecov-src]: https://img.shields.io/codecov/c/gh/stacksjs/bunpress/main?style=flat-square
[codecov-href]: https://codecov.io/gh/stacksjs/bunpress -->
