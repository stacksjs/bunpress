# Best Practices and Examples

This section provides practical examples and best practices for creating excellent documentation with BunPress.

## Project Structure

### Recommended Directory Structure

```
my-docs/
├── docs/
│   ├── index.md                 # Homepage with frontmatter
│   ├── guide/
│   │   ├── index.md            # Guide overview
│   │   ├── getting-started.md  # Getting started guide
│   │   ├── installation.md     # Installation instructions
│   │   └── configuration.md    # Configuration guide
│   ├── api/
│   │   ├── index.md           # API overview
│   │   ├── core.md            # Core API reference
│   │   ├── plugins.md         # Plugin API
│   │   └── extensions.md      # API extensions
│   ├── examples/
│   │   ├── index.md           # Examples overview
│   │   ├── basic-usage.md     # Basic usage examples
│   │   └── advanced-examples.md # Advanced examples
│   └── _assets/
│       ├── images/            # Images and diagrams
│       └── styles/            # Custom CSS files
├── bunpress.config.ts          # Main configuration
├── package.json
└── README.md
```

### Alternative Organization Patterns

#### Feature-Based Structure

```
docs/
├── authentication/
│   ├── index.md
│   ├── login.md
│   ├── signup.md
│   └── permissions.md
├── database/
│   ├── index.md
│   ├── queries.md
│   ├── migrations.md
│   └── optimization.md
└── deployment/
    ├── index.md
    ├── docker.md
    ├── kubernetes.md
    └── cloud.md
```

#### Audience-Based Structure

```
docs/
├── users/
│   ├── index.md         # User guide overview
│   ├── dashboard.md     # Dashboard usage
│   ├── settings.md      # User settings
│   └── troubleshooting.md # Common issues
├── developers/
│   ├── index.md         # Developer guide
│   ├── api.md          # API reference
│   ├── sdk.md          # SDK documentation
│   └── contributing.md  # Contribution guidelines
└── administrators/
    ├── index.md         # Admin guide
    ├── setup.md        # System setup
    ├── maintenance.md  # Maintenance tasks
    └── monitoring.md   # System monitoring
```

### File Naming Convention

- Use kebab-case for file names: `getting-started.md`
- Use descriptive names: `installation-guide.md` vs `install.md`
- Group related files in directories
- Keep URLs clean and memorable

## Writing Content

### Clear and Concise Headings

```markdown
# Bad: Getting Started With The Framework

# Good: Getting Started

## Installation

## Basic Usage

## Configuration
```

### Consistent Code Examples

```markdown
<!-- Bad: Inconsistent formatting -->
```js
function greet(name){
return "Hello " + name
}
```

<!-- Good: Consistent formatting -->
```javascript
function greet(name) {
  return `Hello ${name}!`
}
```

```

### Meaningful Code Comments

```javascript
// Bad: Unhelpful comment
// This function does something
function processData(data) {
  // TODO: implement this
}

// Good: Descriptive comments
/**
 * Processes user data and validates input
 * @param {Object} data - User input data
 * @returns {Object} Processed and validated data
 */
function processUserData(data) {
  // Validate email format
  if (!isValidEmail(data.email)) {
    throw new Error('Invalid email address')
  }

  // Sanitize input
  const sanitized = sanitizeInput(data)

  return sanitized
}
```

## Documentation Patterns

### API Documentation

```markdown
## UserService

Manages user operations and authentication.

### Constructor

```typescript
const userService = new UserService(config)
```

### Methods

#### `createUser(userData)`

Creates a new user account.

**Parameters:**

- `userData` (Object): User information
  - `email` (string): User's email address
  - `name` (string): User's full name

**Returns:** Promise<User>

**Example:**

```javascript
const newUser = await userService.createUser({
  email: 'john@example.com',
  name: 'John Doe'
})
```

**Throws:**

- `ValidationError`: When user data is invalid
- `DuplicateUserError`: When user already exists

```

### Configuration Examples

```markdown
## Basic Configuration

Create a `bunpress.config.ts` file in your project root:

```typescript
// bunpress.config.ts
export default {
  verbose: true,
  markdown: {
    title: 'My Documentation',
    meta: {
      description: 'Project documentation',
      author: 'Your Name'
    }
  }
}
```

## Data Loading Best Practices

### Frontmatter Organization

Use consistent frontmatter patterns across your documentation:

```yaml
---
title: Page Title
description: Brief description for SEO
author: Content Author
date: 2024-01-15
tags: [tag1, tag2, tag3]
category: documentation
order: 1
layout: doc
toc: sidebar
search:
  enabled: true
---
```

### Programmatic Content Generation

Leverage BunPress's programmatic API for dynamic content:

```typescript
import { build } from 'bunpress'

// Generate content programmatically
const result = await build({
  files: [
    {
      path: 'api/index.md',
      content: generateApiDocs(apiSpec)
    },
    {
      path: 'changelog.md',
      content: generateChangelog(commits)
    }
  ],
  config: {
    markdown: {
      themeConfig: {
        colors: { primary: '#3b82f6' }
      }
    }
  }
})
```

### Configuration Management

#### Global Configuration

```typescript
// bunpress.config.ts
export default {
  verbose: true,
  markdown: {
    title: 'My Documentation',
    meta: {
      description: 'Project documentation',
      author: 'Your Name',
      generator: 'BunPress'
    },
    themeConfig: {
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b'
      },
      fonts: {
        heading: 'Inter, sans-serif',
        body: 'Inter, sans-serif'
      }
    }
  }
}
```

#### Page-Specific Overrides

```yaml
---
title: Custom Page
themeConfig:
  colors:
    primary: '#10b981'  # Override global primary color
---
```

## Advanced Examples

### Custom Landing Page

```markdown
---
layout: home

hero:
  name: "MyProject"
  text: "Build amazing things"
  tagline: "Fast, reliable, and easy to use"
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View Source
      link: https://github.com/myproject

features:
  - title: "Easy Setup"
    icon: "🚀"
    details: "Get started in minutes with our simple setup process"
  - title: "Powerful Features"
    icon: "⚡"
    details: "Everything you need to build modern applications"
  - title: "Great Community"
    icon: "👥"
    details: "Join thousands of developers building with MyProject"
---
```

### Interactive Examples

```markdown
## Try It Out

::: tip Interactive Example
You can edit the code below and see the results instantly:
:::

```javascript
// Try changing these values
const greeting = "Hello"
const name = "World"

console.log(`${greeting}, ${name}!`)
// Output: Hello, World!
```

### Comparison Tables

| Feature | Basic Plan | Pro Plan | Enterprise |
|---------|------------|----------|------------|
| Users | 1 | 10 | Unlimited |
| Storage | 1GB | 100GB | 1TB |
| Support | Community | Email | Phone + Email |
| API Access | ❌ | ✅ | ✅ |
| Custom Domain | ❌ | ❌ | ✅ |
| SLA | - | 99.9% | 99.99% |

### Step-by-Step Tutorials

```markdown
## Building Your First App

Follow these steps to create your first application:

### Step 1: Set Up Your Environment

First, make sure you have Node.js installed:

```bash
node --version
# Should output: v18.0.0 or higher
```

### Step 2: Create a New Project

```bash
mkdir my-first-app
cd my-first-app
npm init -y
```

### Step 3: Install Dependencies

```bash
npm install myproject
```

### Step 4: Create Your First File

```javascript
// index.js
const MyProject = require('myproject')

const app = new MyProject()

app.start()
```

### Step 5: Run Your App

```bash
node index.js
```

🎉 Congratulations! You've created your first app.

### Next Steps

- [Learn about configuration options](/guide/configuration)
- [Explore advanced features](/advanced)
- [Join our community](https://discord.gg/myproject)

```

## SEO Optimization

### Meta Tags

```markdown
---
title: Getting Started with BunPress
description: Learn how to get started with BunPress in minutes
keywords: bunpress, documentation, getting-started
author: BunPress Team
---
```

### Structured Headings

```markdown
# Main Topic

## Primary Subtopic

### Secondary Subtopic

## Another Primary Subtopic

### Implementation Details

#### Code Examples

#### Configuration Options
```

### Alt Text for Images

```markdown
<!-- Bad -->
![Screenshot]()

<!-- Good -->
![Application dashboard showing user analytics](/images/dashboard.png)
```

## Performance Best Practices

### Optimize Images

```markdown
<!-- Use appropriate formats and sizes -->
![Logo](logo.webp)
![Diagram](diagram.svg)
![Screenshot](screenshot.avif)
```

### Minimize Bundle Size

```typescript
// Only import what you need
import { build } from 'bunpress'
import type { Config } from 'bunpress'

// Avoid large dependencies in client-side code
```

### Lazy Loading

```markdown
<!-- Images -->
<img loading="lazy" src="large-image.jpg" alt="Large image">

<!-- Code blocks (future feature) -->
```javascript
// Large code example
```

```

## Accessibility

### Semantic HTML

```markdown
<!-- Good: Uses proper heading hierarchy -->
# Main Title

## Section Title

### Subsection Title

<!-- Bad: Skips heading levels -->
# Main Title

### Subsection Title (skips h2)
```

### Color Contrast

```markdown
<!-- Ensure good contrast ratios -->
::: warning
⚠️ This content requires attention
:::

::: tip
💡 This is helpful information
:::
```

### Keyboard Navigation

```markdown
<!-- Links and interactive elements -->
[Learn more about accessibility](/accessibility)

<!-- Code examples with keyboard instructions -->
```bash
# Press Ctrl+C to stop the server
npm run dev
```

```

## Internationalization

### Language-Specific Content

```markdown
<!-- Use frontmatter for language detection -->
---
lang: es
---

# Introducción

Bienvenido a la documentación.
```

### Date and Number Formatting

```javascript
// Use Intl API for proper localization
const date = new Date()
console.log(date.toLocaleDateString('es-ES'))
// Output: 25/12/2023 (Spain)

const number = 1234567.89
console.log(number.toLocaleString('de-DE'))
// Output: 1.234.567,89 (Germany)
```

## Testing Documentation

### Automated Testing

```typescript
// Test code examples
import { expect, test } from 'bun:test'

test('documentation examples work', () => {
  // Test that code examples in docs actually work
  const result = greet('World')
  expect(result).toBe('Hello, World!')
})
```

### Link Checking

```bash
# Check for broken links
npm run lint:links

# Validate internal references
npm run validate:refs
```

## Deployment Best Practices

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Documentation

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - run: bun run deploy
```

### Environment-Specific Builds

```typescript
// Different configs for different environments
const isProduction = process.env.NODE_ENV === 'production'

export default {
  base: isProduction ? '/docs/' : '/',
  build: {
    outDir: isProduction ? 'dist-prod' : 'dist-dev'
  }
}
```

## Maintenance

### Regular Updates

- Keep dependencies updated
- Review and update examples regularly
- Monitor for broken links
- Update screenshots and diagrams

### Content Review Process

```markdown
## Content Review Checklist

- [ ] All links are working
- [ ] Code examples are tested
- [ ] Screenshots are up to date
- [ ] Content is accessible
- [ ] SEO optimization is applied
- [ ] Cross-browser compatibility verified
```

## Community Engagement

### Contributing Guidelines

```markdown
## How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

### Code of Conduct

We expect all contributors to follow our code of conduct:
- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers learn
- Maintain professional communication
```

### Issue Templates

```markdown
<!-- Bug Report Template -->
## Bug Report

**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.
```
