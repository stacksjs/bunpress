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

- ⚡ **Lightning Fast** - Powered by Bun runtime for incredible performance
- 📝 **Rich Markdown** - Enhanced markdown with containers, emojis, math, and syntax highlighting
- 📋 **Smart TOC** - Automatic table of contents with customization and interactive features
- 🛠️ **Developer Friendly** - TypeScript support, plugin system, and extensive customization options
- 🔍 **Advanced Search** - Local search with indexing, keyboard shortcuts, and smart ranking
- 🎨 **Theme System** - Complete theme customization with colors, fonts, and dark mode
- 📱 **Responsive Design** - Mobile-first design that works beautifully on all devices
- 🧭 **Navigation** - Flexible navigation with active states, nested menus, and icons
- 📊 **Sidebar** - Collapsible sidebar with groups, search, and smooth animations
- 🎯 **Multiple Layouts** - Home, documentation, and page layouts with custom templates

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
  nav: [
    { text: 'Home', link: '/' },
    { text: 'Guide', link: '/guide' },
    { text: 'API', link: '/api' }
  ],
  markdown: {
    themeConfig: {
      colors: {
        primary: '#3b82f6'
      }
    }
  }
}
```

## Testing

```bash
bun test
```

## Changelog

Please see our [releases](https://github.com/stackjs/bun-ts-starter/releases) page for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Community

For help, discussion about best practices, or any other conversation that would benefit from being searchable:

[Discussions on GitHub](https://github.com/stacksjs/ts-starter/discussions)

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
[npm-version-src]: https://img.shields.io/npm/v/bun-ts-starter?style=flat-square
[npm-version-href]: https://npmjs.com/package/bun-ts-starter
[github-actions-src]: https://img.shields.io/github/actions/workflow/status/stacksjs/ts-starter/ci.yml?style=flat-square&branch=main
[github-actions-href]: https://github.com/stacksjs/ts-starter/actions?query=workflow%3Aci

<!-- [codecov-src]: https://img.shields.io/codecov/c/gh/stacksjs/ts-starter/main?style=flat-square
[codecov-href]: https://codecov.io/gh/stacksjs/ts-starter -->
