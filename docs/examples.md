# Examples

Real-world examples of BunPress features in action. Copy and adapt these examples for your own documentation.

[[toc]]

## Documentation Page Templates

### API Reference Page

A typical API documentation page with all features:

````markdown
---
title: API Reference
description: Complete API documentation for MyLib
layout: doc
toc:
  minDepth: 2
  maxDepth: 3
---

# API Reference

Complete reference for MyLib v2.0 <Badge type="tip" text="stable" />

[[toc]]

## Installation

> [!TIP]
> We recommend using the latest version for the best experience.

::: code-group

```bash [npm]
npm install mylib
```

```bash [yarn]
yarn add mylib
```

```bash [bun]
bun add mylib
```

:::

## Configuration

Import and configure the library:

<<< ./examples/config.ts{#basic-config}

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | required | Your API key |
| `timeout` | `number` | `5000` | Request timeout in ms |
| `retries` | `number` | `3` | Number of retry attempts |

> [!WARNING]
> Never commit your API keys to version control!

## Core Methods

### `initialize(config)`

Initialize the library with configuration.

**Parameters:**
- `config` (object): Configuration object

**Returns:** `Promise<Client>`

**Example:**

```typescript
import { initialize } from 'mylib'

const client = await initialize({
  apiKey: process.env.API_KEY,
  timeout: 10000
})
```

### `connect(options)` <Badge type="tip" text="v2.0+" />

Establish connection to the service.

**Parameters:**
- `options` (object): Connection options

**Example:**

::: code-group

```typescript [TypeScript]
interface ConnectOptions {
  timeout?: number
  retries?: number
}

await client.connect({
  timeout: 5000,
  retries: 3
})
```

```javascript [JavaScript]
await client.connect({
  timeout: 5000,
  retries: 3
})
```

:::

### `disconnect()`

Close the connection gracefully.

> [!IMPORTANT]
> Always call `disconnect()` when you're done to free resources.

```typescript
await client.disconnect()
```

## Advanced Usage

### Error Handling

Handle errors appropriately:

<<< ./examples/error-handling.ts

### Retry Logic

Implement custom retry logic:

<<< ./examples/retry-logic.ts{#retry-implementation}

## Migration Guide

### From v1.x to v2.0

> [!CAUTION]
> Version 2.0 includes breaking changes.

Key changes:

1. **Configuration** <Badge type="danger" text="breaking" />
   - `apiKey` is now required
   - `baseUrl` has been renamed to `endpoint`

2. **Methods** <Badge type="warning" text="deprecated" />
   - `connect()` replaces deprecated `init()`
   - `disconnect()` replaces deprecated `close()`

::: details View full migration guide
<!--@include: ./migration/v1-to-v2.md-->
:::

## See Also

- [Quick Start Guide](/quick-start)
- [Configuration Reference](/config)
- [GitHub Repository](https://github.com/example/mylib)
````

### Tutorial Page

Step-by-step tutorial with progressive disclosure:

````markdown
---
title: Building Your First App
description: Learn to build an app from scratch
layout: doc
---

# Building Your First App

Learn how to build your first application with our framework. :rocket:

## Prerequisites

> [!NOTE]
> Make sure you have the following installed:
> - Node.js 18+ or Bun 1.0+
> - Git
> - A code editor (VS Code recommended)

## Project Setup

### Step 1: Create Project

Create a new project directory:

```bash
mkdir my-first-app
cd my-first-app
bun init -y
```

### Step 2: Install Dependencies

::: code-group

```bash [Bun]
bun add express @types/express
bun add -d typescript
```

```bash [npm]
npm install express @types/express
npm install -D typescript
```

:::

### Step 3: Project Structure

Create the following structure:

```
my-first-app/
├── src/
│   ├── index.ts
│   ├── routes/
│   └── utils/
├── package.json
└── tsconfig.json
```

## Building the Server

### Basic Server Setup

Create `src/index.ts`:

<<< ./examples/tutorial/basic-server.ts

> [!TIP]
> Use TypeScript for better type safety and IDE support!

### Adding Routes

Create `src/routes/api.ts`:

<<< ./examples/tutorial/routes.ts{#api-routes}

### Middleware

Add middleware for common tasks:

::: code-group

```typescript [Logging Middleware]
<<< ./examples/tutorial/middleware.ts{#logging}
```

```typescript [Auth Middleware]
<<< ./examples/tutorial/middleware.ts{#auth}
```

```typescript [Error Handler]
<<< ./examples/tutorial/middleware.ts{#error-handler}
```

:::

## Testing

### Writing Tests

Create tests for your application:

```typescript:line-numbers {8-12}
import { describe, test, expect } from 'bun:test'
import { app } from './index'

describe('API Routes', () => {
  test('GET / returns 200', async () => {
    const response = await app.fetch(new Request('http://localhost/'))
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('message')
    expect(data.message).toBe('Hello World')
  })
})
```

### Running Tests

```bash
bun test
```

> [!NOTE]
> All tests should pass before deploying!

## Deployment

### Preparing for Production

::: warning Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Tests passing
- [ ] Error logging set up
- [ ] Performance monitoring enabled
:::

### Deploy to Cloud

Deploy your application:

```bash
# Build the application
bun run build

# Deploy (example with fly.io)
fly deploy
```

## Next Steps

Congratulations! :tada: You've built your first app!

### What's Next?

::: tip Continue Learning
1. Add a database layer
2. Implement authentication
3. Set up CI/CD pipeline
4. Monitor performance

Check out our [Advanced Guide](/advanced) for more.
:::

### Additional Resources

- [API Documentation](/api)
- [Best Practices](/best-practices)
- [Community Discord](https://discord.gg/example)
- [GitHub Examples](https://github.com/example/examples)
````

## Feature Showcase Examples

### Code Imports Example

Import code from your actual source files:

````markdown
## Installation

Import the installation code:

<<< ../package.json{1-10}

## Usage Examples

### Basic Example

<<< ./examples/basic-usage.ts

### With Configuration

Import just the config section:

<<< ./examples/advanced.ts{#configuration}

### Multiple Languages

::: code-group

```typescript [TypeScript]
<<< ./examples/demo.ts
```

```javascript [JavaScript]
<<< ./examples/demo.js
```

```python [Python]
<<< ./examples/demo.py
```

:::
````

### Markdown Includes Example

Reuse content across pages:

````markdown
# Product Documentation

<!--@include: ./shared/intro.md-->

## Features

<!--@include: ./features/overview.md{#feature-list}-->

## Getting Started

<!--@include: ./guides/quick-start.md{1-50}-->

## API Reference

<!--@include: ./api/endpoints.md{#rest-api}-->
````

### GitHub Alerts Example

Different alert types for different purposes:

```markdown
## Installation Notes

> [!NOTE]
> This package requires Node.js 18 or higher.

## Performance Tips

> [!TIP]
> Enable caching for better performance in production.

## Security

> [!IMPORTANT]
> Always validate user input before processing.

## Breaking Changes

> [!WARNING]
> Version 3.0 removes support for Node.js 16.

## Data Loss Prevention

> [!CAUTION]
> This operation cannot be undone. Backup your data first!
```

### Badge Usage Example

Version indicators and status badges:

```markdown
# Features

## Authentication <Badge type="tip" text="stable" />

Production-ready authentication system.

## Real-time Updates <Badge type="info" text="beta" />

Beta feature with active development.

## Legacy API <Badge type="warning" text="deprecated" />

Will be removed in v3.0.

## Breaking Changes <Badge type="danger" text="v2.0+" />

Not compatible with v1.x.
```

### Code Groups Example

Multi-language examples:

````markdown
## Installation

::: code-group

```bash [npm]
npm install package-name
```

```bash [yarn]
yarn add package-name
```

```bash [pnpm]
pnpm add package-name
```

```bash [bun]
bun add package-name
```

:::

## Configuration Files

::: code-group

```typescript [TypeScript]
import type { Config } from 'package-name'

export default {
  apiKey: process.env.API_KEY,
  timeout: 5000
} satisfies Config
```

```javascript [JavaScript]
module.exports = {
  apiKey: process.env.API_KEY,
  timeout: 5000
}
```

```json [JSON]
{
  "apiKey": "your-key",
  "timeout": 5000
}
```

:::
````

## Layout Examples

### Home Page Layout

Create an attractive landing page:

```yaml
---
layout: home
hero:
  name: ProjectName
  text: Modern Development Framework
  tagline: Build faster, ship better, scale easier
  image:
    src: /logo.png
    alt: Project Logo
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/user/project
features:
  - icon: ⚡
    title: Lightning Fast
    details: Optimized for speed with modern build tools
  - icon: 🔒
    title: Type Safe
    details: Full TypeScript support out of the box
  - icon: 🎨
    title: Customizable
    details: Flexible theming and plugin system
  - icon: 📦
    title: Zero Config
    details: Sensible defaults, works immediately
  - icon: 🚀
    title: Production Ready
    details: Battle-tested in production environments
  - icon: 📚
    title: Well Documented
    details: Comprehensive docs and examples
---

## Quick Start

Get up and running in seconds:

```bash
bun create my-project
cd my-project
bun dev
```

## Sponsors

Special thanks to our sponsors for supporting this project!
```

### Documentation Page Layout

Standard documentation layout:

```yaml
---
layout: doc
title: Configuration Guide
description: Learn how to configure your application
sidebar: true
editLink: true
lastUpdated: true
toc:
  minDepth: 2
  maxDepth: 3
---

# Configuration Guide

Your content here...
```

### Plain Page Layout

Minimal layout for special pages:

```yaml
---
layout: page
title: About
navbar: true
sidebar: false
---

# About Us

Custom content without documentation layout...
```

## Common Patterns

### Changelog Page

```markdown
# Changelog

All notable changes to this project are documented here.

## [2.0.0] - 2024-01-15 <Badge type="danger" text="breaking" />

### Added <Badge type="tip" text="new" />

- New feature X with improved performance
- Support for Y configuration
- Enhanced error messages

### Changed <Badge type="warning" text="breaking" />

> [!CAUTION]
> This release contains breaking changes!

- Renamed `oldMethod()` to `newMethod()`
- Changed configuration format
- Updated minimum Node.js version to 18

### Deprecated <Badge type="warning" text="deprecated" />

- `legacyFunction()` - Use `modernFunction()` instead
- Old configuration format (will be removed in v3.0)

### Fixed

- Fixed memory leak in connection pool
- Corrected TypeScript definitions
- Resolved race condition in async operations

## [1.5.0] - 2024-01-01

### Added

- Feature A
- Feature B
```

### FAQ Page

```markdown
# Frequently Asked Questions

Common questions and answers about the project.

[[toc]]

## General

### What is this project?

> [!NOTE]
> This project is a modern framework for building web applications.

<!--@include: ./shared/project-description.md-->

### Who should use this?

::: tip Ideal For
- Full-stack developers
- Frontend engineers
- DevOps teams
- Startup founders
:::

## Installation

### Which package manager should I use?

::: code-group

```bash [Recommended: Bun]
bun add package-name
```

```bash [npm]
npm install package-name
```

```bash [yarn]
yarn add package-name
```

:::

> [!TIP]
> We recommend Bun for the best performance!

### Minimum requirements?

> [!IMPORTANT]
> Requires Node.js 18+ or Bun 1.0+

## Troubleshooting

### Common Issues

#### Installation fails

> [!WARNING]
> Make sure you have the latest version of your package manager.

Try clearing the cache:

```bash
bun pm cache rm
bun install
```

#### Type errors

::: details Click to expand solution

Check your TypeScript configuration:

<<< ./examples/tsconfig.json

:::
```

### Comparison Page

```markdown
# BunPress vs Alternatives

How does BunPress compare to other static site generators?

## Quick Comparison

| Feature | BunPress | VitePress | Docusaurus |
|---------|----------|-----------|------------|
| Runtime | Bun | Node.js | Node.js |
| Build Speed | ⚡ Very Fast | Fast | Medium |
| GitHub Alerts | ✅ | ❌ | ❌ |
| Code Imports | ✅ | ✅ | ❌ |
| Markdown Includes | ✅ | ✅ | ❌ |
| React Support | ❌ | ❌ | ✅ |

## Detailed Comparison

### BunPress

::: tip Advantages
- Lightning-fast builds with Bun
- GitHub-flavored alerts
- Extensive markdown features
- Zero configuration needed
:::

::: warning Limitations
- Newer project, smaller ecosystem
- No React component support (yet)
:::

### VitePress

::: info Overview
Mature and stable documentation tool powered by Vite.
:::

Ideal for projects already using the Vite ecosystem.

### Docusaurus

::: info Overview
Feature-rich with React component support.
:::

Best for projects needing custom interactive components.

## Migration Guides

See our migration guides:

- [From VitePress](/migration/from-vitepress)
- [From Docusaurus](/migration/from-docusaurus)
```

## Best Practices

### Effective Use of Features

```markdown
# Best Practices for Feature Usage

## When to Use GitHub Alerts vs Containers

### Use GitHub Alerts for:

> [!TIP]
> Quick, inline callouts in documentation

### Use Containers for:

::: details Expandable Content
Long-form content that users can expand to read.
:::

## Code Organization

Import real code to keep docs in sync:

<<< ./src/config.ts{#defaults}

Don't hardcode examples that might become outdated!

## Content Reuse

Shared content across multiple pages:

<!--@include: ./shared/prerequisites.md-->

Reduces duplication and maintenance burden.
```

## Next Steps

- Explore the [Features Overview](/features) for all capabilities
- Check out the [Configuration Guide](/config) for customization
- Read [Markdown Extensions](/markdown-extensions) for syntax details
- Review [Best Practices](/best-practices) for optimization tips
