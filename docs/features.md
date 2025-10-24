# Features Overview

BunPress is a powerful static site generator with extensive markdown processing capabilities. This document provides a comprehensive overview of all available features.

## Core Features

### Lightning-Fast Performance

Built on Bun runtime for exceptional speed:
- **Instant builds**: Up to 10x faster than Node.js-based generators
- **Hot module replacement**: See changes instantly during development
- **Optimized bundling**: Efficient code splitting and minification
- **Zero-config**: Works out of the box with sensible defaults

### Advanced Markdown Processing

#### Standard Markdown Support

Full CommonMark and GitHub-Flavored Markdown support:
- Headings, paragraphs, lists
- Tables, blockquotes, horizontal rules
- Links, images, inline code
- Task lists and strikethrough

#### Custom Containers

Create visually distinct content blocks:

```markdown
::: tip
Helpful advice and best practices
:::

::: warning
Important warnings and cautions
:::

::: danger
Critical information requiring immediate attention
:::

::: info
General informational notes
:::

::: details
Collapsible content sections
:::
```

#### GitHub Alerts

Modern alert syntax for attention-grabbing callouts:

```markdown
> [!NOTE]
> Essential information for users

> [!TIP]
> Helpful advice for better outcomes

> [!IMPORTANT]
> Critical information for success

> [!WARNING]
> Urgent attention required

> [!CAUTION]
> Potential risks and negative outcomes
```

**Key Differences from Containers:**
- More semantic HTML structure
- Distinctive icon indicators
- GitHub-compatible syntax
- Better accessibility support

### Code Highlighting & Features

#### Syntax Highlighting

Powered by Shiki with support for 40+ languages:

```typescript
// Full TypeScript support with type inference
interface Config {
  port: number
  host: string
}

const config: Config = {
  port: 3000,
  host: 'localhost'
}
```

#### Line Numbers

```typescript:line-numbers
function calculateSum(numbers: number[]): number {
  return numbers.reduce((sum, num) => sum + num, 0)
}
```

#### Line Highlighting

Highlight specific lines for emphasis:

```typescript {2,4-6}
function processData(data: string[]) {
  // This line is highlighted
  if (!data.length) return []

  // These lines are highlighted
  return data
    .filter(item => item.length > 0)
    .map(item => item.trim())
}
```

#### File Information

Show file paths in code blocks:

```typescript [src/config.ts]
export const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
}
```

#### Copy-to-Clipboard

Every code block includes a copy button with visual feedback:
- Hover to reveal copy button
- Click to copy entire code block
- Visual confirmation on successful copy
- Fallback for older browsers

#### Code Groups

Tabbed code blocks for multiple examples:

````markdown
::: code-group

```javascript [JavaScript]
const greeting = 'Hello World'
console.log(greeting)
```

```typescript [TypeScript]
const greeting: string = 'Hello World'
console.log(greeting)
```

```python [Python]
greeting = "Hello World"
print(greeting)
```

:::
````

**Features:**
- Tab navigation between code samples
- Independent syntax highlighting per tab
- Compatible with line numbers and highlighting
- Supports all programming languages

### Code Imports

Import code directly from source files to keep documentation in sync with your codebase.

#### Full File Import

```markdown
<<< ./examples/server.ts
```

Imports the entire file with automatic language detection.

#### Line Range Import

```markdown
<<< ./examples/api.ts{10-25}
```

Import specific line ranges to focus on relevant sections.

#### Named Region Import

```markdown
<<< ./src/app.ts{#setup}
```

Import code between region markers:

```typescript
// #region setup
const app = express()
app.use(cors())
app.use(express.json())
// #endregion setup
```

**Benefits:**
- Always up-to-date code examples
- Single source of truth for documentation
- Reduced documentation maintenance
- Syntax highlighting preserved
- Error handling for missing files

### Markdown File Inclusion

Reuse markdown content across multiple pages.

#### Full File Inclusion

```markdown
<!--@include: ./components/intro.md-->
```

#### Partial Inclusion

**Line Ranges:**
```markdown
<!--@include: ./guide.md{1-50}-->
```

**Named Regions:**
```markdown
<!--@include: ./docs/auth.md{#overview}-->
```

With region markers in the source file:

```markdown
<!-- #region overview -->
## Authentication Overview

Content here...
<!-- #endregion -->
```

**Advanced Features:**
- Recursive includes (included files can include others)
- Circular reference protection
- Full markdown processing of included content
- Relative path resolution
- Graceful error handling

**Use Cases:**
- Shared content across documentation
- Modular documentation structure
- Version-specific content management
- Multi-language documentation

### Typography Enhancements

#### Emoji Support

Use shortcodes for easy emoji insertion:

```markdown
I :heart: BunPress! :rocket:

This feature is :fire:!
```

Renders as: I ❤️ BunPress! 🚀

**Popular Shortcodes:**
- `:heart:` → ❤️
- `:fire:` → 🔥
- `:rocket:` → 🚀
- `:star:` → ⭐
- `:thumbsup:` → 👍
- `:tada:` → 🎉
- `:warning:` → ⚠️
- `:check:` → ✅

#### Inline Badges

Highlight important information with inline badges:

```markdown
Available in <Badge type="tip" text="v2.0+" />

<Badge type="warning" text="deprecated" />
<Badge type="danger" text="breaking change" />
<Badge type="info" text="experimental" />
```

**Badge Types:**
- `tip` - Green for new features and recommendations
- `warning` - Yellow for deprecations and cautions
- `danger` - Red for breaking changes and critical warnings
- `info` - Blue for general information

**Use Cases:**
- Version indicators
- Feature status (beta, stable, deprecated)
- Breaking change warnings
- API stability markers

### Navigation & Discovery

#### Table of Contents

Automatic TOC generation from headings:

```markdown
[[toc]]
```

**Features:**
- Automatic slug generation
- Nested hierarchy support
- Configurable depth levels (h1-h6)
- Active section highlighting
- Smooth scrolling navigation
- Exclude specific headings with `<!-- toc-ignore -->`

**Positions:**
- **Sidebar**: Floating navigation panel
- **Inline**: Embedded in page content
- **Floating**: Fixed position overlay

#### Search

Full-text search across all documentation:
- Fast client-side search
- Keyboard shortcuts
- Result highlighting
- Fuzzy matching support

#### Site Navigation

- **Navbar**: Top-level navigation with dropdowns
- **Sidebar**: Hierarchical documentation structure
- **Breadcrumbs**: Page hierarchy visualization
- **Prev/Next**: Sequential page navigation

### Content Organization

#### Frontmatter

YAML frontmatter for page metadata:

```yaml
---
title: Getting Started
description: Learn how to use BunPress
layout: doc
---
```

**Supported Fields:**
- `title`: Page title
- `description`: Meta description for SEO
- `layout`: Page layout (home, doc, page)
- `hero`: Hero section configuration
- `features`: Feature grid for home layout
- `sidebar`: Custom sidebar configuration
- `toc`: Table of contents settings
- `editLink`: Source file edit link
- `lastUpdated`: Show last modified date

#### Home Page Layout

Create beautiful landing pages:

```yaml
---
layout: home
hero:
  name: BunPress
  text: Lightning-fast documentation
  tagline: Build beautiful docs in seconds
  actions:
    - theme: brand
      text: Get Started
      link: /install
    - theme: alt
      text: View on GitHub
      link: https://github.com/stacksjs/bunpress
features:
  - title: Fast
    details: Built on Bun for exceptional performance
  - title: Flexible
    details: Extensive markdown extensions and customization
  - title: Simple
    details: Zero-config with sensible defaults
---
```

### Developer Experience

#### Development Server

Fast development server with hot reload:

```bash
bun dev
# Server starts at http://localhost:3000
```

**Features:**
- Instant hot module replacement
- Error overlay
- Source maps
- Automatic page reload
- Custom port configuration

#### Build System

Optimized production builds:

```bash
bun run build
```

**Optimization:**
- Code minification
- Asset optimization
- Code splitting
- Tree shaking
- CSS purging

#### TypeScript Support

Full TypeScript support throughout:
- Type-safe configuration
- Typed plugins and themes
- IntelliSense support
- Strict mode compliance

### SEO & Performance

#### SEO Features

- Auto-generated meta tags
- Semantic HTML structure
- Sitemap generation
- Robots.txt support
- Open Graph tags
- Twitter Card support
- Canonical URLs

#### Performance Optimizations

- Lazy loading for images
- Code splitting by route
- Minimal runtime overhead
- Efficient CSS delivery
- Optimized asset loading

### Extensibility

#### Plugin System

Extend BunPress with custom plugins:

```typescript
export default {
  plugins: [
    customPlugin(),
    anotherPlugin({
      // options
    })
  ]
}
```

#### Theme Customization

Full control over appearance:
- Custom CSS
- Theme overrides
- Component replacement
- Layout customization

#### Configuration

Flexible configuration via `bunpress.config.ts`:

```typescript
export default {
  title: 'My Documentation',
  description: 'Comprehensive project documentation',

  themeConfig: {
    nav: [...],
    sidebar: {...},
    search: {...},
    footer: {...}
  },

  markdown: {
    toc: {...},
    highlighting: {...}
  }
}
```

## Feature Comparison

### Containers vs GitHub Alerts

| Feature | Containers | GitHub Alerts |
|---------|-----------|---------------|
| Syntax | `::: type` | `> [!TYPE]` |
| GitHub Compatible | ❌ | ✅ |
| Collapsible | ✅ (details) | ❌ |
| Icons | Basic | Distinctive |
| Semantic HTML | Good | Better |
| Use Case | VitePress-style | GitHub-style |

### Code Imports vs Markdown Includes

| Feature | Code Imports | Markdown Includes |
|---------|--------------|-------------------|
| Syntax | `<<<` | `<!--@include:-->` |
| Content Type | Source code | Markdown |
| Syntax Highlighting | ✅ | ✅ (in result) |
| Line Ranges | ✅ | ✅ |
| Named Regions | ✅ | ✅ |
| Recursive | ❌ | ✅ |
| Language Detection | Auto | N/A |

## Browser Support

- **Modern browsers**: Full feature support
- **Progressive enhancement**: Graceful degradation
- **Accessibility**: WCAG compliant markup
- **Mobile responsive**: Optimized for all screen sizes

## Performance Benchmarks

- **Build speed**: Up to 10x faster than VitePress
- **Page load**: Sub-second initial load
- **Hot reload**: < 100ms update time
- **Search**: Instant client-side results

## What's Next?

BunPress continues to evolve with new features in development:

- Enhanced theming system
- Advanced search with filters
- Multi-language i18n support
- Interactive components
- Version documentation support
- And much more!

Check out our [roadmap](#) for upcoming features and improvements.
