# Quick Start Guide

Get up and running with BunPress in minutes. This guide covers the essentials to start building beautiful documentation.

## Installation

### Prerequisites

- **Bun runtime** v1.0 or higher

Install Bun if you haven't already:

```bash
curl -fsSL https://bun.sh/install | bash
```

### Install BunPress

```bash
bun add bunpress
```

Or install globally:

```bash
bun add -g bunpress
```

## Your First Documentation Site

### 1. Create Project Structure

```bash
mkdir my-docs
cd my-docs
```

Create a basic directory structure:

```
my-docs/
├── docs/
│   ├── index.md
│   ├── getting-started.md
│   └── guide/
│       └── features.md
├── bunpress.config.ts
└── package.json
```

### 2. Create Your First Page

Create `docs/index.md`:

```markdown
---
layout: home
hero:
  name: My Project
  text: Build something amazing
  tagline: Fast, simple, and powerful
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/yourusername/project
features:
  - title: ⚡️ Lightning Fast
    details: Built on Bun for exceptional performance
  - title: 📝 Markdown Powered
    details: Write content in Markdown with powerful extensions
  - title: 🎨 Customizable
    details: Flexible theming and configuration options
---
```

### 3. Add Documentation Content

Create `docs/getting-started.md`:

```markdown
# Getting Started

Welcome to the documentation!

[[toc]]

## Installation

Install the package:

```bash
npm install my-package
```

## Quick Example

Here's a basic example:

```typescript
import { myFunction } from 'my-package'

const result = myFunction('hello')
console.log(result)
```

## Key Features

> [!TIP]
> Check out our advanced features for more capabilities!

- Feature 1
- Feature 2
- Feature 3
```

### 4. Configure BunPress

Create `bunpress.config.ts`:

```typescript
export default {
  title: 'My Documentation',
  description: 'Documentation for my awesome project',

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/getting-started' },
      { text: 'GitHub', link: 'https://github.com/yourusername/project' }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/getting-started' },
          { text: 'Features', link: '/guide/features' }
        ]
      }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Your Name'
    }
  }
}
```

### 5. Start Development Server

```bash
bunx bunpress dev
```

Visit `http://localhost:3000` to see your documentation site!

### 6. Build for Production

```bash
bunx bunpress build
```

The built site will be in `dist/` directory.

## Essential Features

### Enhanced Markdown

#### GitHub Alerts

```markdown
> [!NOTE]
> This is important information.

> [!TIP]
> Here's a helpful tip!

> [!WARNING]
> Be careful with this action.
```

#### Custom Containers

```markdown
::: tip
This is a tip container.
:::

::: warning
This is a warning container.
:::

::: danger
Critical information here.
:::
```

#### Inline Badges

```markdown
New in <Badge type="tip" text="v2.0+" />

<Badge type="warning" text="deprecated" />
```

#### Code Groups

````markdown
::: code-group

```javascript [JavaScript]
console.log('Hello World')
```

```typescript [TypeScript]
console.log('Hello World' as string)
```

:::
````

#### Emoji Support

```markdown
I :heart: BunPress! :rocket:
```

Renders as: I ❤️ BunPress! 🚀

### Advanced Code Features

#### Line Highlighting

````markdown
```typescript {2,4-6}
function example() {
  // This line is highlighted
  const data = fetchData()
  // These lines are highlighted
  if (data) {
    return processData(data)
  }
}
```
````

#### Line Numbers

````markdown
```typescript:line-numbers
function calculate(x: number): number {
  return x * 2
}
```
````

#### File Names

````markdown
```typescript [src/utils.ts]
export function helper() {
  // implementation
}
```
````

### Code Imports

Import code from actual files:

```markdown
<<< ./examples/demo.ts

<<< ./src/api.ts{10-20}

<<< ./src/config.ts{#setup}
```

In your source file:

```typescript
// #region setup
export const config = {
  apiUrl: 'https://api.example.com'
}
// #endregion setup
```

### Markdown File Inclusion

Reuse content across pages:

```markdown
<!--@include: ./shared/intro.md-->

<!--@include: ./docs/guide.md{1-50}-->

<!--@include: ./components/features.md{#overview}-->
```

### Table of Contents

Add TOC anywhere in your page:

```markdown
[[toc]]
```

Configure in frontmatter:

```yaml
---
title: My Page
toc:
  minDepth: 2
  maxDepth: 4
---
```

## Project Structure

Recommended structure for documentation:

```
my-docs/
├── docs/
│   ├── public/           # Static assets
│   │   ├── images/
│   │   └── favicon.ico
│   ├── .vitepress/       # (optional) theme customization
│   ├── index.md          # Home page
│   ├── getting-started.md
│   └── guide/
│       ├── introduction.md
│       ├── installation.md
│       └── features.md
├── examples/             # Code examples for imports
│   ├── basic.ts
│   └── advanced.ts
├── bunpress.config.ts    # Configuration
└── package.json
```

## Configuration Basics

### Essential Config Options

```typescript
export default {
  // Site metadata
  title: 'My Docs',
  description: 'Site description',
  base: '/',  // Base URL path

  // Theme config
  themeConfig: {
    logo: '/logo.png',

    // Navigation
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      {
        text: 'Resources',
        items: [
          { text: 'API', link: '/api/' },
          { text: 'Examples', link: '/examples/' }
        ]
      }
    ],

    // Sidebar
    sidebar: [
      {
        text: 'Guide',
        collapsed: false,
        items: [
          { text: 'Introduction', link: '/guide/intro' },
          { text: 'Getting Started', link: '/guide/start' }
        ]
      }
    ],

    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/yourrepo' }
    ],

    // Footer
    footer: {
      message: 'Released under MIT License',
      copyright: 'Copyright © 2024'
    }
  },

  // Markdown config
  markdown: {
    toc: {
      minDepth: 2,
      maxDepth: 4
    }
  }
}
```

## Development Workflow

### Development Server

Start the dev server:

```bash
bunx bunpress dev
```

With custom port:

```bash
bunx bunpress dev --port 8080
```

### Building

Build for production:

```bash
bunx bunpress build
```

Preview the build:

```bash
bunx bunpress serve
```

### Writing Content

1. Create `.md` files in `docs/` directory
2. Add frontmatter for page metadata
3. Write content using enhanced markdown
4. Preview changes instantly in dev server
5. Build when ready to deploy

## Tips & Best Practices

### Content Organization

- **Use descriptive filenames**: `getting-started.md` instead of `gs.md`
- **Group related content**: Use subdirectories for logical groupings
- **Consistent naming**: Follow a naming convention (kebab-case recommended)

### Markdown Writing

- **Use headings hierarchically**: Don't skip heading levels
- **Add frontmatter**: Include title and description for better SEO
- **Use TOC wisely**: Place `[[toc]]` after introduction paragraph
- **Leverage includes**: Reuse common content with markdown includes

### Code Examples

- **Import from source**: Use code imports for real code examples
- **Add context**: Explain what code does before showing it
- **Use line highlighting**: Draw attention to important lines
- **Provide alternatives**: Use code groups for multi-language examples

### Performance

- **Optimize images**: Compress images before adding to `public/`
- **Lazy load**: Large images and assets benefit from lazy loading
- **Code splitting**: Organize content to enable efficient bundling

## Common Patterns

### API Documentation Page

```markdown
---
title: API Reference
description: Complete API documentation
---

# API Reference

[[toc]]

## Configuration

Configuration options for the library:

<<< ./src/types.ts{#config}

## Core Methods

### `initialize()`

Initialize the library with configuration.

```typescript
import { initialize } from 'my-lib'

initialize({
  apiKey: 'your-key',
  debug: true
})
```

> [!WARNING]
> Never commit API keys to version control!

### `connect()`

Establish connection to the service.

Available in <Badge type="tip" text="v2.0+" />

::: code-group

```typescript [TypeScript]
await connect({
  timeout: 5000,
  retries: 3
})
```

```javascript [JavaScript]
await connect({
  timeout: 5000,
  retries: 3
})
```

:::
```

### Tutorial Page

```markdown
---
title: Building Your First App
description: Step-by-step tutorial
---

# Building Your First App

Learn how to build your first application with our framework.

[[toc]]

## Prerequisites

> [!NOTE]
> Make sure you have Node.js 18+ and npm installed.

## Step 1: Setup

Create a new project:

```bash
npm create my-app@latest
cd my-app
npm install
```

## Step 2: Configuration

<!--@include: ./shared/config-setup.md-->

## Step 3: First Component

Create your first component:

<<< ./examples/first-component.tsx

> [!TIP]
> Use TypeScript for better type safety!

## Next Steps

::: tip What's Next?
- Read the [advanced guide](/advanced)
- Check out [examples](/examples)
- Join our [community](https://discord.gg/example)
:::
```

## Next Steps

Now that you're familiar with the basics:

1. **Explore features**: Check out the [features overview](/features)
2. **Advanced configuration**: Read the [config guide](/config)
3. **Markdown extensions**: Learn about [markdown extensions](/markdown-extensions)
4. **Best practices**: Follow our [best practices guide](/best-practices)

## Getting Help

- **Documentation**: Browse the full docs
- **GitHub Issues**: Report bugs or request features
- **Community**: Join our Discord server
- **Examples**: Check out example projects

Happy documenting! 🚀
