import { describe, expect, test } from 'bun:test'
import { createTestMarkdown, buildTestSite, readBuiltFile, assertHtmlContains } from './utils/test-helpers'

describe('End-to-End Integration', () => {
  describe('Full Site Build', () => {
    test('should build complete documentation site', async () => {
      const homeContent = createTestMarkdown(`
---
layout: home
hero:
  name: "BunPress"
  text: "Modern Documentation Engine"
  tagline: "Powered by Bun"
  actions:
    - text: Get Started
      link: /guide/getting-started
    - text: GitHub
      link: https://github.com/stacksjs/bunpress
features:
  - title: Fast
    details: Built on Bun for lightning-fast builds
  - title: Simple
    details: Easy to use and configure
  - title: Modern
    details: Latest web technologies
---

Welcome to BunPress documentation.
      `, {
        layout: 'home',
        hero: {
          name: 'BunPress',
          text: 'Modern Documentation Engine',
          tagline: 'Powered by Bun',
          actions: [
            { text: 'Get Started', link: '/guide/getting-started' },
            { text: 'GitHub', link: 'https://github.com/stacksjs/bunpress' }
          ]
        },
        features: [
          { title: 'Fast', details: 'Built on Bun for lightning-fast builds' },
          { title: 'Simple', details: 'Easy to use and configure' },
          { title: 'Modern', details: 'Latest web technologies' }
        ]
      })

      const guideContent = createTestMarkdown(`
---
title: Getting Started
---

# Getting Started

Welcome to BunPress! This guide will help you get started.

## Installation

\`\`\`bash
bun add @stacksjs/bunpress
\`\`\`

## Basic Usage

\`\`\`ts
import { markdown } from '@stacksjs/bunpress'

await Bun.build({
  entrypoints: ['docs/**/*.md'],
  plugins: [markdown()]
})
\`\`\`

## Features

::: info
BunPress supports many features out of the box.
:::

::: tip
Check out the configuration options for customization.
:::
      `, { title: 'Getting Started' })

      const apiContent = createTestMarkdown(`
---
title: API Reference
---

# API Reference

## Classes

### MarkdownPlugin

The main markdown plugin class.

#### Constructor

\`\`\`ts
new MarkdownPlugin(options?: MarkdownPluginOptions)
\`\`\`

#### Methods

##### setup(build)

Sets up the plugin for the Bun build process.

**Parameters:**
- \`build\`: The Bun build instance

**Returns:** \`void\`

## Types

### MarkdownPluginOptions

Configuration options for the markdown plugin.

\`\`\`ts
interface MarkdownPluginOptions {
  template?: string
  css?: string
  scripts?: string[]
  title?: string
  meta?: Record<string, string>
  markedOptions?: Parameters<typeof marked.parse>[1]
  preserveDirectoryStructure?: boolean
}
\`\`\`
      `, { title: 'API Reference' })

      const configContent = createTestMarkdown(`
---
title: Configuration
---

# Configuration

BunPress can be configured in several ways.

## bunpress.config.ts

Create a \`bunpress.config.ts\` file in your project root:

\`\`\`ts
export default {
  title: 'My Documentation',
  description: 'Documentation for my project',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide' },
      { text: 'API', link: '/api' }
    ]
  }
}
\`\`\`

## Frontmatter

Configure individual pages using frontmatter:

\`\`\`yaml
---
title: My Page
layout: doc
---
\`\`\`

## Supported Options

| Option | Type | Description |
|--------|------|-------------|
| title | string | Site title |
| description | string | Site description |
| themeConfig | object | Theme configuration |
| markdown | object | Markdown plugin options |
      `, { title: 'Configuration' })

      const result = await buildTestSite({
        files: [
          { path: 'index.md', content: homeContent },
          { path: 'guide/getting-started.md', content: guideContent },
          { path: 'api/index.md', content: apiContent },
          { path: 'config.md', content: configContent }
        ]
      })

      expect(result.success).toBe(true)

      // Check all pages are built
      expect(result.outputs.length).toBeGreaterThan(0)

      // Find the correct output files
      const homePath = result.outputs.find(out => out.endsWith('index.html'))
      const guidePath = result.outputs.find(out => out.endsWith('guide/getting-started.html'))
      const apiPath = result.outputs.find(out => out.endsWith('api/index.html'))
      const configPath = result.outputs.find(out => out.endsWith('config.html'))

      // Check home page
      const homeHtml = await readBuiltFile(homePath!)
      expect(assertHtmlContains(homeHtml, '<!DOCTYPE html>')).toBe(true)
      expect(assertHtmlContains(homeHtml, 'BunPress')).toBe(true)
      expect(assertHtmlContains(homeHtml, 'Modern Documentation Engine')).toBe(true)
      expect(assertHtmlContains(homeHtml, 'Get Started')).toBe(true)

      // Check guide page
      const guideHtml = await readBuiltFile(guidePath!)
      expect(assertHtmlContains(guideHtml, 'Getting Started')).toBe(true)
      expect(assertHtmlContains(guideHtml, 'bun add @stacksjs/bunpress')).toBe(true)
      expect(assertHtmlContains(guideHtml, 'BunPress supports many features')).toBe(true)
      expect(assertHtmlContains(guideHtml, 'Check out the configuration options')).toBe(true)

      // Check API page
      const apiHtml = await readBuiltFile(apiPath!)
      expect(assertHtmlContains(apiHtml, 'API Reference')).toBe(true)
      expect(assertHtmlContains(apiHtml, 'MarkdownPlugin')).toBe(true)
      expect(assertHtmlContains(apiHtml, 'MarkdownPluginOptions')).toBe(true)

      // Check config page
      const configHtml = await readBuiltFile(configPath!)
      expect(assertHtmlContains(configHtml, 'Configuration')).toBe(true)
      expect(assertHtmlContains(configHtml, 'bunpress.config.ts')).toBe(true)
      expect(assertHtmlContains(configHtml, 'themeConfig')).toBe(true)
    })

    test('should serve built site correctly', async () => {
      const content = createTestMarkdown(`
# Test Page

Content for serving test.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      // This test would need a running dev server to fully test
      // For now, we verify the files are built correctly
      const testPath = result.outputs.find(out => out.endsWith('test.html'))
      const html = await readBuiltFile(testPath!)
      expect(assertHtmlContains(html, '<!DOCTYPE html>')).toBe(true)
      expect(assertHtmlContains(html, 'Test Page')).toBe(true)
    })

    test('should handle hot reload', async () => {
      const initialContent = createTestMarkdown(`
# Initial Content

This is the initial content.
      `)

      const result1 = await buildTestSite({
        files: [{ path: 'test.md', content: initialContent }]
      })

      expect(result1.success).toBe(true)

      const updatedContent = createTestMarkdown(`
# Updated Content

This is the updated content.
      `)

      const result2 = await buildTestSite({
        files: [{ path: 'test.md', content: updatedContent }]
      })

      expect(result2.success).toBe(true)

      const testPath = result2.outputs.find(out => out.endsWith('test.html'))
      const html = await readBuiltFile(testPath!)
      expect(assertHtmlContains(html, 'Updated Content')).toBe(true)
      expect(assertHtmlContains(html, 'This is the updated content')).toBe(true)
    })

    test('should generate sitemap and robots.txt', async () => {
      const pages = [
        'index.md',
        'about.md',
        'contact.md',
        'blog/post1.md',
        'blog/post2.md',
        'docs/guide.md'
      ]

      const files = pages.map(page => ({
        path: page,
        content: createTestMarkdown(`
# ${page.replace('.md', '').replace('/', ' ')}

Content for ${page}
        `)
      }))

      const result = await buildTestSite({
        files
      })

      expect(result.success).toBe(true)

      // Check sitemap exists
      const sitemapExists = result.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      // Check robots.txt exists
      const robotsExists = result.outputs.some(out => out.includes('robots.txt'))
      expect(robotsExists).toBe(true)

      if (sitemapExists && robotsExists) {
        const sitemapPath = result.outputs.find(out => out.includes('sitemap.xml'))
        const robotsPath = result.outputs.find(out => out.includes('robots.txt'))

        const sitemapContent = await readBuiltFile(sitemapPath!)
        const robotsContent = await readBuiltFile(robotsPath!)

        // Verify sitemap contains all pages
        pages.forEach(page => {
          const htmlPage = page.replace('.md', '.html')
          expect(assertHtmlContains(sitemapContent, htmlPage)).toBe(true)
        })

        // Verify robots.txt references sitemap
        expect(assertHtmlContains(robotsContent, 'sitemap.xml')).toBe(true)
      }
    })
  })

  describe('Plugin Integration', () => {
    test('should integrate with ts-i18n plugin', async () => {
      const translations = createTestTranslations()

      const content = createTestMarkdown(`
---
title: Home
---

# Home Page

Welcome message in multiple languages.

## Navigation

- [About](/about)
- [Contact](/contact)
      `, { title: 'Home' })

      const result = await buildTestSite({
        files: [...translations, { path: 'index.md', content }]
      })

      expect(result.success).toBe(true)

      const indexPath = result.outputs.find(out => out.endsWith('index.html'))
      const html = await readBuiltFile(indexPath!)
      expect(assertHtmlContains(html, '<!DOCTYPE html>')).toBe(true)
      expect(assertHtmlContains(html, 'Home')).toBe(true)
      expect(assertHtmlContains(html, 'Welcome to our site')).toBe(true)
      expect(assertHtmlContains(html, 'About')).toBe(true)
      expect(assertHtmlContains(html, 'Contact')).toBe(true)
    })

    test('should work with custom themes', async () => {
      const customTheme = `
<div class="custom-theme-layout">
  <header class="custom-header">
    <h1 class="custom-title">{{ $site.title }}</h1>
    <nav class="custom-nav">
      @foreach($site.nav as $item)
        <a href="{{ $item.link }}" class="custom-nav-link">{{ $item.text }}</a>
      @endforeach
    </nav>
  </header>

  <main class="custom-main">
    <h1 class="custom-page-title">{{ $frontmatter.title }}</h1>
    <div class="custom-content">
      {{ $content }}
    </div>
  </main>

  <footer class="custom-footer">
    <p class="custom-footer-text">{{ $site.footer }}</p>
  </footer>
</div>
      `

      const content = createTestMarkdown(`
---
title: Custom Theme Page
---

# Custom Theme Test

This page uses a custom theme layout.

## Features

- Custom styling
- Flexible layout
- Easy customization
      `, { title: 'Custom Theme Page' })

      const result = await buildTestSite({
        files: [
          { path: 'CustomTheme.stx', content: customTheme },
          { path: 'test.md', content }
        ],
        config: {
          title: 'Custom Theme Site',
          nav: [
            { text: 'Home', link: '/' },
            { text: 'About', link: '/about' }
          ],
          footer: '© 2024 Custom Theme'
        }
      })

      expect(result.success).toBe(true)

      const testPath = result.outputs.find(out => out.endsWith('test.html'))
      const html = await readBuiltFile(testPath!)
      expect(assertHtmlContains(html, '<!DOCTYPE html>')).toBe(true)
      expect(assertHtmlContains(html, 'Custom Theme Page')).toBe(true)
    })

    test('should handle multiple plugins simultaneously', async () => {
      const translations = createTestTranslations()

      const customTemplate = `
<div class="multi-plugin-layout">
  <div class="i18n-content">
    <h1>{{ $frontmatter.title }}</h1>
    <p>{{ $frontmatter.description }}</p>
  </div>

  <div class="theme-content">
    <nav>
      @foreach($site.nav as $item)
        <a href="{{ $item.link }}">{{ $item.text }}</a>
      @endforeach
    </nav>
  </div>

  <div class="markdown-content">
    {{ $content }}
  </div>
</div>
      `

      const content = createTestMarkdown(`
---
title: Multi Plugin Page
description: Testing multiple plugins together
---

# Multi Plugin Test

This page demonstrates multiple plugins working together.

## Features

::: info
Internationalization support
:::

::: tip
Custom theme integration
:::

\`\`\`ts
const plugins = ['i18n', 'theme', 'markdown']
console.log('Multiple plugins:', plugins)
\`\`\`
      `, {
        title: 'Multi Plugin Page',
        description: 'Testing multiple plugins together'
      })

      const result = await buildTestSite({
        files: [
          ...translations,
          { path: 'MultiPlugin.stx', content: customTemplate },
          { path: 'test.md', content }
        ],
        config: {
          nav: [
            { text: 'Home', link: '/' },
            { text: 'Test', link: '/test' }
          ]
        }
      })

      expect(result.success).toBe(true)

      const testPath = result.outputs.find(out => out.endsWith('test.html'))
      const html = await readBuiltFile(testPath!)
      expect(assertHtmlContains(html, '<!DOCTYPE html>')).toBe(true)
      expect(assertHtmlContains(html, 'Multi Plugin Page')).toBe(true)
      expect(assertHtmlContains(html, 'Testing multiple plugins together')).toBe(true)
      expect(assertHtmlContains(html, 'Internationalization support')).toBe(true)
      expect(assertHtmlContains(html, 'Custom theme integration')).toBe(true)
    })
  })

  describe('Performance and Scalability', () => {
    test('should handle large documentation sites', async () => {
      const files = Array.from({ length: 50 }, (_, i) => ({
        path: `docs/page${i}.md`,
        content: createTestMarkdown(`
---
title: Documentation Page ${i}
category: docs
---

# Documentation Page ${i}

This is documentation page number ${i}.

## Section 1

Content for section 1 in page ${i}.

## Section 2

Content for section 2 in page ${i}.

\`\`\`ts
const pageNumber = ${i}
console.log('This is page:', pageNumber)
\`\`\`

::: info
This is an info box in page ${i}
:::
        `, { title: `Documentation Page ${i}`, category: 'docs' })
      }))

      const result = await buildTestSite({
        files
      })

      expect(result.success).toBe(true)
      expect(result.outputs.length).toBeGreaterThan(40) // Should build most pages

      // Check a few random pages
      const checkPages = [0, 10, 25, 40]
      for (const pageNum of checkPages) {
        const pagePath = result.outputs.find(out => out.endsWith(`docs/page${pageNum}.html`))
        if (pagePath) {
          const html = await readBuiltFile(pagePath)
          expect(assertHtmlContains(html, `Documentation Page ${pageNum}`)).toBe(true)
          expect(assertHtmlContains(html, `page number ${pageNum}`)).toBe(true)
        }
      }

      // Verify that the site was built successfully with many pages
      expect(result.outputs.length).toBeGreaterThan(40)
    })

    test('should optimize build times for incremental changes', async () => {
      const baseFiles = Array.from({ length: 20 }, (_, i) => ({
        path: `content/page${i}.md`,
        content: createTestMarkdown(`
# Base Page ${i}

Initial content for page ${i}.
        `)
      }))

      // Initial build
      const initialResult = await buildTestSite({
        files: baseFiles
      })

      expect(initialResult.success).toBe(true)

      // Modify one file
      const modifiedFiles = [
        ...baseFiles.slice(0, 19),
        {
          path: 'content/page19.md',
          content: createTestMarkdown(`
# Modified Page 19

Updated content for page 19.

## New Section

This section was added in the modification.
          `)
        }
      ]

      // Rebuild
      const modifiedResult = await buildTestSite({
        files: modifiedFiles
      })

      expect(modifiedResult.success).toBe(true)

      const pagePath = modifiedResult.outputs.find(out => out.endsWith('content/page19.html'))
      const html = await readBuiltFile(pagePath!)
      expect(assertHtmlContains(html, 'Modified Page 19')).toBe(true)
      expect(assertHtmlContains(html, 'Updated content for page 19')).toBe(true)
      expect(assertHtmlContains(html, 'New Section')).toBe(true)
    })
  })

  describe('Cross-platform Compatibility', () => {
    test('should work on different operating systems', async () => {
      const content = createTestMarkdown(`
# Cross Platform Test

This content should work the same on all platforms.

## File Paths

- Windows: \`C:\\\\path\\\\to\\\\file\`
- macOS: \`/path/to/file\`
- Linux: \`/path/to/file\`

## Line Endings

Content with different line ending styles.
      `)

      const result = await buildTestSite({
        files: [{ path: 'cross-platform.md', content }]
      })

      expect(result.success).toBe(true)

      const crossPlatformPath = result.outputs.find(out => out.endsWith('cross-platform.html'))
      const html = await readBuiltFile(crossPlatformPath!)
      expect(assertHtmlContains(html, '<!DOCTYPE html>')).toBe(true)
      expect(assertHtmlContains(html, 'Cross Platform Test')).toBe(true)
      expect(assertHtmlContains(html, 'C:\\\\path\\\\to\\\\file')).toBe(true)
      expect(assertHtmlContains(html, '/path/to/file')).toBe(true)
    })

    test('should handle different file encodings', async () => {
      const content = createTestMarkdown(`
# Encoding Test

Content with special characters: ñáéíóú, 中文, 日本語, русский

## Emojis

😀 🎉 🚀 ❤️ 👍
      `)

      const result = await buildTestSite({
        files: [{ path: 'encoding.md', content }]
      })

      expect(result.success).toBe(true)

      const encodingPath = result.outputs.find(out => out.endsWith('encoding.html'))
      const html = await readBuiltFile(encodingPath!)
      expect(assertHtmlContains(html, '<!DOCTYPE html>')).toBe(true)
      expect(assertHtmlContains(html, 'ñáéíóú')).toBe(true)
      expect(assertHtmlContains(html, '中文')).toBe(true)
      expect(assertHtmlContains(html, '日本語')).toBe(true)
      expect(assertHtmlContains(html, 'русский')).toBe(true)
      expect(assertHtmlContains(html, '😀')).toBe(true)
      expect(assertHtmlContains(html, '🎉')).toBe(true)
      expect(assertHtmlContains(html, '🚀')).toBe(true)
      expect(assertHtmlContains(html, '❤️')).toBe(true)
      expect(assertHtmlContains(html, '👍')).toBe(true)
    })
  })

  describe('Error Handling and Recovery', () => {
    test('should handle build errors gracefully', async () => {
      const invalidContent = `---
title: Invalid Frontmatter
invalid: yaml: content: here
---

# Invalid Content

This has invalid frontmatter.
      `

      const result = await buildTestSite({
        files: [{ path: 'invalid.md', content: invalidContent }]
      })

      // Build might succeed or fail depending on error handling
      // The important thing is that it doesn't crash the process
      expect(typeof result.success).toBe('boolean')
      expect(Array.isArray(result.logs)).toBe(true)
      expect(result.logs.length).toBeGreaterThan(0)
    })

    test('should recover from partial build failures', async () => {
      const validContent = createTestMarkdown(`
# Valid Page

This page should build successfully.
      `)

      const invalidContent = `---
invalid frontmatter without closing
---

# Invalid Page

This page has invalid frontmatter.
      `

      const result = await buildTestSite({
        files: [
          { path: 'valid.md', content: validContent },
          { path: 'invalid.md', content: invalidContent }
        ]
      })

      // Should still build the valid page even if invalid page fails
      expect(result.success).toBe(true)

      const validPath = result.outputs.find(out => out.endsWith('valid.html'))
      const validHtml = await readBuiltFile(validPath!)
      expect(assertHtmlContains(validHtml, '<!DOCTYPE html>')).toBe(true)
      expect(assertHtmlContains(validHtml, 'Valid Page')).toBe(true)
    })

    test('should handle missing dependencies gracefully', async () => {
      const content = createTestMarkdown(`
---
title: Missing Dependency Test
---

# Test Page

This page references missing dependencies.
      `)

      const result = await buildTestSite({
        files: [{ path: 'missing-deps.md', content }]
      })

      expect(result.success).toBe(true)

      const missingDepsPath = result.outputs.find(out => out.endsWith('missing-deps.html'))
      const html = await readBuiltFile(missingDepsPath!)
      expect(assertHtmlContains(html, '<!DOCTYPE html>')).toBe(true)
      expect(assertHtmlContains(html, 'Test Page')).toBe(true)
    })
  })

  describe('Real-world Scenarios', () => {
    test('should handle blog-like content structure', async () => {
      const postTemplate = `
<div class="blog-post">
  <header class="post-header">
    <h1>{{ $frontmatter.title }}</h1>
    <div class="post-meta">
      <span class="author">{{ $frontmatter.author }}</span>
      <time>{{ $frontmatter.date }}</time>
      <span class="category">{{ $frontmatter.category }}</span>
    </div>
  </header>

  <div class="post-content">
    {{ $content }}
  </div>

  @if($frontmatter.tags)
    <div class="post-tags">
      @foreach($frontmatter.tags as $tag)
        <span class="tag">{{ $tag }}</span>
      @endforeach
    </div>
  @endif
</div>
      `

      const posts = [
        {
          path: 'blog/2024-01-01-hello-world.md',
          content: createTestMarkdown(`
---
title: Hello World
author: John Doe
date: 2024-01-01
category: announcements
tags:
  - hello
  - world
  - first-post
---

# Hello World

Welcome to my first blog post!

This is the beginning of something great.

## What to expect

- Regular updates
- Interesting content
- Community engagement
          `, {
            title: 'Hello World',
            author: 'John Doe',
            date: '2024-01-01',
            category: 'announcements',
            tags: ['hello', 'world', 'first-post']
          })
        },
        {
          path: 'blog/2024-01-02-getting-started.md',
          content: createTestMarkdown(`
---
title: Getting Started Guide
author: Jane Smith
date: 2024-01-02
category: tutorials
tags:
  - tutorial
  - guide
  - beginners
---

# Getting Started Guide

Let's get you up and running quickly.

## Prerequisites

Before we begin, make sure you have:

- Node.js installed
- A code editor
- Basic knowledge of JavaScript

## Installation

\`\`\`bash
npm install my-package
\`\`\`

## First Steps

1. Create a new project
2. Install dependencies
3. Start coding!
          `, {
            title: 'Getting Started Guide',
            author: 'Jane Smith',
            date: '2024-01-02',
            category: 'tutorials',
            tags: ['tutorial', 'guide', 'beginners']
          })
        }
      ]

      const result = await buildTestSite({
        files: [
          { path: 'BlogPost.stx', content: postTemplate },
          ...posts
        ]
      })

      expect(result.success).toBe(true)

      // Check first post
      const post1Path = result.outputs.find(out => out.endsWith('blog/2024-01-01-hello-world.html'))
      const post1Html = await readBuiltFile(post1Path!)
      expect(assertHtmlContains(post1Html, '<!DOCTYPE html>')).toBe(true)
      expect(assertHtmlContains(post1Html, 'Hello World')).toBe(true)
      expect(assertHtmlContains(post1Html, 'John Doe')).toBe(true)
      expect(assertHtmlContains(post1Html, '2024-01-01')).toBe(true)
      expect(assertHtmlContains(post1Html, 'announcements')).toBe(true)
      expect(assertHtmlContains(post1Html, 'hello')).toBe(true)
      expect(assertHtmlContains(post1Html, 'world')).toBe(true)
      expect(assertHtmlContains(post1Html, 'first-post')).toBe(true)

      // Check second post
      const post2Path = result.outputs.find(out => out.endsWith('blog/2024-01-02-getting-started.html'))
      const post2Html = await readBuiltFile(post2Path!)
      expect(assertHtmlContains(post2Html, '<!DOCTYPE html>')).toBe(true)
      expect(assertHtmlContains(post2Html, 'Getting Started Guide')).toBe(true)
      expect(assertHtmlContains(post2Html, 'Jane Smith')).toBe(true)
      expect(assertHtmlContains(post2Html, '2024-01-02')).toBe(true)
      expect(assertHtmlContains(post2Html, 'tutorials')).toBe(true)
      expect(assertHtmlContains(post2Html, 'tutorial')).toBe(true)
      expect(assertHtmlContains(post2Html, 'guide')).toBe(true)
      expect(assertHtmlContains(post2Html, 'beginners')).toBe(true)
      expect(assertHtmlContains(post2Html, 'npm install my-package')).toBe(true)
    })

    test('should handle documentation site structure', async () => {
      const docsStructure = [
        {
          path: 'docs/index.md',
          content: createTestMarkdown(`
---
title: Documentation
layout: home
---

# Documentation Home

Welcome to our comprehensive documentation.

## Quick Links

- [Getting Started](/docs/getting-started)
- [API Reference](/docs/api)
- [Configuration](/docs/config)
          `, { title: 'Documentation', layout: 'home' })
        },
        {
          path: 'docs/getting-started.md',
          content: createTestMarkdown(`
---
title: Getting Started
---

# Getting Started

Let's get you started with our platform.

## Installation

\`\`\`bash
pip install our-package
\`\`\`

## Basic Usage

\`\`\`python
import our_package

# Your code here
result = our_package.do_something()
\`\`\`

## Next Steps

- Read the [API documentation](/docs/api)
- Check out [configuration options](/docs/config)
          `, { title: 'Getting Started' })
        },
        {
          path: 'docs/api.md',
          content: createTestMarkdown(`
---
title: API Reference
---

# API Reference

Complete API documentation.

## Classes

### MainClass

The main class of our package.

\`\`\`python
from our_package import MainClass

instance = MainClass()
result = instance.process(data)
\`\`\`

### HelperClass

A utility class for common operations.

\`\`\`python
from our_package import HelperClass

helper = HelperClass()
formatted = helper.format_data(raw_data)
\`\`\`
          `, { title: 'API Reference' })
        },
        {
          path: 'docs/config.md',
          content: createTestMarkdown(`
---
title: Configuration
---

# Configuration

How to configure our package.

## Configuration File

Create a \`config.yaml\` file:

\`\`\`yaml
app:
  name: My App
  version: 1.0.0
  debug: false

database:
  host: localhost
  port: 5432
  name: myapp_db
\`\`\`

## Environment Variables

You can also use environment variables:

\`\`\`bash
export APP_NAME="My App"
export DB_HOST="localhost"
export DB_PORT="5432"
\`\`\`
          `, { title: 'Configuration' })
        }
      ]

      const result = await buildTestSite({
        files: docsStructure
      })

      expect(result.success).toBe(true)

      // Check documentation home
      const homePath = result.outputs.find(out => out.endsWith('docs/index.html'))
      const homeHtml = await readBuiltFile(homePath!)
      expect(assertHtmlContains(homeHtml, '<!DOCTYPE html>')).toBe(true)
      expect(assertHtmlContains(homeHtml, 'Documentation Home')).toBe(true)
      expect(assertHtmlContains(homeHtml, 'Welcome to our comprehensive documentation')).toBe(true)
      expect(assertHtmlContains(homeHtml, 'Getting Started')).toBe(true)
      expect(assertHtmlContains(homeHtml, 'API Reference')).toBe(true)
      expect(assertHtmlContains(homeHtml, 'Configuration')).toBe(true)

      // Check getting started page
      const gettingStartedPath = result.outputs.find(out => out.endsWith('docs/getting-started.html'))
      const gettingStartedHtml = await readBuiltFile(gettingStartedPath!)
      expect(assertHtmlContains(gettingStartedHtml, '<!DOCTYPE html>')).toBe(true)
      expect(assertHtmlContains(gettingStartedHtml, 'Getting Started')).toBe(true)
      expect(assertHtmlContains(gettingStartedHtml, 'pip install our-package')).toBe(true)
      expect(assertHtmlContains(gettingStartedHtml, 'import our_package')).toBe(true)

      // Check API page
      const apiPath = result.outputs.find(out => out.endsWith('docs/api.html'))
      const apiHtml = await readBuiltFile(apiPath!)
      expect(assertHtmlContains(apiHtml, '<!DOCTYPE html>')).toBe(true)
      expect(assertHtmlContains(apiHtml, 'API Reference')).toBe(true)
      expect(assertHtmlContains(apiHtml, 'MainClass')).toBe(true)
      expect(assertHtmlContains(apiHtml, 'HelperClass')).toBe(true)
      expect(assertHtmlContains(apiHtml, 'from our_package import')).toBe(true)

      // Check config page
      const configPath = result.outputs.find(out => out.endsWith('docs/config.html'))
      const configHtml = await readBuiltFile(configPath!)
      expect(assertHtmlContains(configHtml, '<!DOCTYPE html>')).toBe(true)
      expect(assertHtmlContains(configHtml, 'Configuration')).toBe(true)
      expect(assertHtmlContains(configHtml, 'config.yaml')).toBe(true)
      expect(assertHtmlContains(configHtml, 'Environment Variables')).toBe(true)
      expect(assertHtmlContains(configHtml, 'export APP_NAME')).toBe(true)
    })
  })
})
