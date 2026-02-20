# BunPress Documentation

Complete documentation for BunPress - a lightning-fast static site generator powered by Bun.

## Documentation Structure

### Getting Started

- **[Install](./install.md)** - Installation instructions and requirements
- **[Quick Start](./quick-start.md)** - Get up and running in minutes
- **[Usage](./usage.md)** - Basic usage and CLI commands

### Core Concepts

- **[Features](./features.md)** - Comprehensive overview of all features
- **[Configuration](./config.md)** - Complete configuration reference
- **[Markdown Extensions](./markdown-extensions.md)** - Enhanced markdown syntax guide
- **[Table of Contents](./table-of-contents.md)** - TOC generation and customization

### Guides

- **[Examples](./examples.md)** - Real-world usage examples and patterns
- **[Advanced](./advanced.md)** - Advanced features and customization
- **[Best Practices](./best-practices.md)** - Optimization tips and recommendations

### Additional Resources

- **[Showcase](./showcase.md)** - Projects built with BunPress
- **[Partners](./partners.md)** - Partner organizations and sponsors
- **[License](./license.md)** - MIT License details
- **[Postcardware](./postcardware.md)** - Send us a postcard!

## Key Features Documented

### Phase 1-2: Foundation
- Basic markdown processing
- Syntax highlighting with ts-syntax-highlighter
- Copy-to-clipboard functionality
- Line numbers and line highlighting

### Phase 3: Table of Contents
- Automatic TOC generation from headings
- Configurable depth levels
- Multiple positions (sidebar, inline, floating)
- Active section highlighting
- Smooth scrolling navigation

### Phase 4: Code Features
- **Code Groups** - Tabbed code blocks for multi-language examples
- **Code Imports** - Import code from source files with line ranges and regions
- **File Information** - Display file names in code blocks
- **Diff Highlighting** - Show code changes

### Phase 5: Content Enhancement
- **Custom Containers** - VitePress-style callout boxes (tip, warning, danger, info, details)
- **GitHub Alerts** - GitHub-flavored alert syntax ([!NOTE], [!TIP], etc.)
- **Emoji Support** - Shortcode-based emoji insertion
- **Inline Badges** - Version indicators and status badges

### Phase 6: Content Reuse
- **Code Imports** - `<<< ./file.ts` syntax with line ranges and regions
- **Markdown Includes** - `<!--@include: ./file.md-->` with recursive support

## Feature Comparison

| Feature | Status | Documentation |
|---------|--------|---------------|
| Syntax Highlighting | ✅ Complete | [Markdown Extensions](./markdown-extensions.md#syntax-highlighting) |
| Table of Contents | ✅ Complete | [Table of Contents](./table-of-contents.md) |
| Code Groups | ✅ Complete | [Markdown Extensions](./markdown-extensions.md#code-groups) |
| Code Imports | ✅ Complete | [Markdown Extensions](./markdown-extensions.md#code-file-imports) |
| GitHub Alerts | ✅ Complete | [Markdown Extensions](./markdown-extensions.md#github-alerts) |
| Custom Containers | ✅ Complete | [Markdown Extensions](./markdown-extensions.md#custom-containers) |
| Inline Badges | ✅ Complete | [Markdown Extensions](./markdown-extensions.md#inline-badges) |
| Emoji Support | ✅ Complete | [Markdown Extensions](./markdown-extensions.md#emoji-support) |
| Markdown Includes | ✅ Complete | [Markdown Extensions](./markdown-extensions.md#markdown-file-inclusion) |

## Quick Reference

### Syntax Cheat Sheet

```markdown
# Markdown Extensions Quick Reference

## GitHub Alerts
> [!NOTE]
> [!TIP]
> [!IMPORTANT]
> [!WARNING]
> [!CAUTION]

## Custom Containers
::: tip
::: warning
::: danger
::: info
::: details

## Badges
<Badge type="tip" text="new" />
<Badge type="warning" text="deprecated" />
<Badge type="danger" text="breaking" />
<Badge type="info" text="beta" />

## Emoji
:heart: :fire: :rocket: :star:

## Code Groups
::: code-group
```js [JavaScript]
```
```ts [TypeScript]
```
:::

## Code Imports
<<< ./file.ts
<<< ./file.ts{10-20}
<<< ./file.ts{#region}

## Markdown Includes
<!--@include: ./file.md-->
<!--@include: ./file.md{1-50}-->
<!--@include: ./file.md{#section}-->

## Table of Contents
[[toc]]
```

## Configuration Examples

### Minimal Config

```typescript
// bunpress.config.ts
export default {
  title: 'My Documentation',
  description: 'Project documentation'
}
```

### Full Config

```typescript
// bunpress.config.ts
export default {
  title: 'My Docs',
  description: 'Complete documentation',

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/start' }
          ]
        }
      ]
    },
    footer: {
      message: 'MIT Licensed',
      copyright: 'Copyright © 2024'
    }
  },

  markdown: {
    toc: {
      minDepth: 2,
      maxDepth: 4
    }
  }
}
```

## CLI Commands

### Development

```bash
# Start dev server
bunx bunpress dev

# Custom port
bunx bunpress dev --port 8080

# With verbose logging
bunx bunpress dev --verbose
```

### Building

```bash
# Build for production
bunx bunpress build

# Custom output directory
bunx bunpress build --outdir dist

# Specify config file
bunx bunpress build --config custom.config.ts
```

## Directory Structure

```
project/
├── docs/                    # Documentation source
│   ├── public/             # Static assets
│   │   ├── images/
│   │   └── favicon.ico
│   ├── index.md            # Home page
│   ├── guide/              # Guide sections
│   │   ├── getting-started.md
│   │   └── advanced.md
│   └── api/                # API docs
│       └── reference.md
├── examples/                # Code examples (for imports)
│   ├── basic.ts
│   └── advanced.ts
├── bunpress.config.ts      # Configuration
└── package.json
```

## Testing

All features have comprehensive test coverage in `test/` directory:

- `test/templates/include/markdown-include.test.ts` - Markdown includes (10/11 passing)
- `test/templates/github-alerts.test.ts` - GitHub alerts
- `test/templates/code-groups.test.ts` - Code groups
- `test/templates/badges.test.ts` - Inline badges
- Additional test suites for all features

Run tests:

```bash
bun test
```

## Browser Support

- **Modern Browsers**: Full feature support
- **Progressive Enhancement**: Graceful degradation for older browsers
- **Mobile Responsive**: Optimized for all screen sizes
- **Accessibility**: WCAG compliant markup

## Performance

- **Build Speed**: Up to 10x faster than Node.js-based generators
- **Hot Reload**: Sub-100ms update times
- **Optimized Output**: Code splitting, minification, tree shaking
- **Efficient Loading**: Lazy loading and smart bundling

## Contributing

See the main [README](../README.md) for contribution guidelines.

## License

BunPress is open-source software licensed under the MIT License. See [LICENSE](./license.md) for details.

## Support

- **Documentation**: You're reading it!
- **GitHub Issues**: [Report bugs or request features](https://github.com/stacksjs/bunpress/issues)
- **Discord**: Join our community (link in main README)

## What's Next?

Future enhancements planned:
- Multi-language i18n support
- Version documentation
- Advanced theming system
- Interactive components
- Enhanced search with filters
- And more!

---

**Happy documenting!** 🚀

Built with ❤️ using Bun
