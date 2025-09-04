import { describe, expect, test } from 'bun:test'
import { createTestMarkdown, buildTestSite, readBuiltFile, assertHtmlContains } from './utils/test-helpers'

describe('Data Loading', () => {
  describe('Content Loaders', () => {
    test('should process markdown with frontmatter', async () => {
      const content = `---
title: Posts Index
layout: home
---

# Blog Posts

Here are all our blog posts.

Welcome to our blog!
      `

      const result = await buildTestSite({
        files: [
          { path: 'posts.md', content }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'Blog Posts')).toBe(true)
      expect(assertHtmlContains(html, 'Posts Index')).toBe(true)
      expect(assertHtmlContains(html, 'layout-home')).toBe(true)
    })

    test('should process multiple markdown files', async () => {
      const content = `
# Posts from Markdown

Posts loaded from markdown files.
      `

      const post1 = `---
title: Post One
date: 2024-01-01
author: John Doe
---

# Post One

This is the first post content.
      `

      const post2 = `---
title: Post Two
date: 2024-01-02
author: Jane Smith
---

# Post Two

This is the second post content.
      `

      const result = await buildTestSite({
        files: [
          { path: 'posts.md', content },
          { path: 'posts/post1.md', content: post1 },
          { path: 'posts/post2.md', content: post2 }
        ]
      })

      expect(result.success).toBe(true)

      // Check main posts page
      const mainHtml = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(mainHtml, 'Posts from Markdown')).toBe(true)

      // Check individual post pages
      const post1Html = await readBuiltFile(result.outputs[1])
      expect(assertHtmlContains(post1Html, 'Post One')).toBe(true)
      expect(assertHtmlContains(post1Html, 'John Doe')).toBe(true)

      const post2Html = await readBuiltFile(result.outputs[2])
      expect(assertHtmlContains(post2Html, 'Post Two')).toBe(true)
      expect(assertHtmlContains(post2Html, 'Jane Smith')).toBe(true)
    })

    test('should handle frontmatter with custom fields', async () => {
      const content = `---
title: Custom Fields Test
description: Testing custom frontmatter fields
author: Test Author
tags: [test, example, markdown]
date: 2024-01-01
---

# Custom Fields Test

Testing custom frontmatter fields and metadata.
      `

      const result = await buildTestSite({
        files: [
          { path: 'custom.md', content }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'Custom Fields Test')).toBe(true)
      expect(assertHtmlContains(html, 'Test Author')).toBe(true)
      expect(assertHtmlContains(html, '2024-01-01')).toBe(true)
    })

    test('should process theme configuration', async () => {
      const content = `---
title: Theme Test
themeConfig:
  colors:
    primary: '#ff0000'
    secondary: '#00ff00'
  nav:
    - text: Home
      link: /
    - text: About
      link: /about
---

# Theme Test

Testing theme configuration in frontmatter.
      `

      const result = await buildTestSite({
        files: [
          { path: 'theme.md', content }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'Theme Test')).toBe(true)
      expect(assertHtmlContains(html, '--color-primary: #ff0000')).toBe(true)
      expect(assertHtmlContains(html, '--color-secondary: #00ff00')).toBe(true)
      expect(assertHtmlContains(html, 'Home')).toBe(true)
      expect(assertHtmlContains(html, 'About')).toBe(true)
    })

    test('should handle sidebar configuration', async () => {
      const content = `---
title: Sidebar Test
sidebar:
  - text: Getting Started
    link: /getting-started
  - text: API Reference
    items:
      - text: Core API
        link: /api/core
      - text: Plugins
        link: /api/plugins
---

# Sidebar Test

Testing sidebar configuration.
      `

      const result = await buildTestSite({
        files: [
          { path: 'sidebar.md', content }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'Sidebar Test')).toBe(true)
      expect(assertHtmlContains(html, 'Getting Started')).toBe(true)
      expect(assertHtmlContains(html, 'API Reference')).toBe(true)
      expect(assertHtmlContains(html, 'Core API')).toBe(true)
      expect(assertHtmlContains(html, 'Plugins')).toBe(true)
    })
  })

  describe('File Organization', () => {
    test('should handle files in subdirectories', async () => {
      const indexContent = `---
title: Blog Index
---

# Blog Index

Welcome to our blog.
      `

      const post1Content = `---
title: First Post
---

# First Post

This is the first blog post.
      `

      const post2Content = `---
title: Second Post
---

# Second Post

This is the second blog post.
      `

      const result = await buildTestSite({
        files: [
          { path: 'blog/index.md', content: indexContent },
          { path: 'blog/post1.md', content: post1Content },
          { path: 'blog/post2.md', content: post2Content }
        ]
      })

      expect(result.success).toBe(true)

      // Should generate 3 HTML files
      expect(result.outputs).toHaveLength(3)

      // Check that files are generated in correct structure
      const indexHtml = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(indexHtml, 'Blog Index')).toBe(true)

      const post1Html = await readBuiltFile(result.outputs[1])
      expect(assertHtmlContains(post1Html, 'First Post')).toBe(true)

      const post2Html = await readBuiltFile(result.outputs[2])
      expect(assertHtmlContains(post2Html, 'Second Post')).toBe(true)
    })

    test('should handle flat file structure', async () => {
      const homeContent = `---
title: Home Page
---

# Home

Welcome to our site.
      `

      const aboutContent = `---
title: About Page
---

# About

Learn more about us.
      `

      const contactContent = `---
title: Contact Page
---

# Contact

Get in touch with us.
      `

      const result = await buildTestSite({
        files: [
          { path: 'index.md', content: homeContent },
          { path: 'about.md', content: aboutContent },
          { path: 'contact.md', content: contactContent }
        ]
      })

      expect(result.success).toBe(true)

      // Should generate 3 HTML files
      expect(result.outputs).toHaveLength(3)

      const homeHtml = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(homeHtml, 'Home')).toBe(true)

      const aboutHtml = await readBuiltFile(result.outputs[1])
      expect(assertHtmlContains(aboutHtml, 'About')).toBe(true)

      const contactHtml = await readBuiltFile(result.outputs[2])
      expect(assertHtmlContains(contactHtml, 'Contact')).toBe(true)
    })

    test('should preserve directory structure when configured', async () => {
      const guideIndex = `---
title: Guide Index
---

# Guide

Developer guide index.
      `

      const installation = `---
title: Installation
---

# Installation

How to install our software.
      `

      const result = await buildTestSite({
        files: [
          { path: 'guide/index.md', content: guideIndex },
          { path: 'guide/installation.md', content: installation }
        ],
        config: {
          markdown: {
            preserveDirectoryStructure: true
          }
        }
      })

      expect(result.success).toBe(true)

      // Should generate 2 HTML files
      expect(result.outputs).toHaveLength(2)

      const guideIndexHtml = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(guideIndexHtml, 'Guide')).toBe(true)

      const installationHtml = await readBuiltFile(result.outputs[1])
      expect(assertHtmlContains(installationHtml, 'Installation')).toBe(true)
    })
  })

  describe('Configuration and Metadata', () => {
    test('should handle TOC configuration in frontmatter', async () => {
      const content = `---
title: TOC Test
toc: sidebar
tocTitle: Table of Contents
---

# Section 1

This is the first section.

## Subsection 1.1

This is a subsection.

## Subsection 1.2

This is another subsection.

# Section 2

This is the second section.

## Subsection 2.1

This is another subsection.
      `

      const result = await buildTestSite({
        files: [
          { path: 'toc-test.md', content }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'TOC Test')).toBe(true)
      expect(assertHtmlContains(html, 'Section 1')).toBe(true)
      expect(assertHtmlContains(html, 'Section 2')).toBe(true)
      expect(assertHtmlContains(html, 'Table of Contents')).toBe(true)
    })

    test('should process search configuration', async () => {
      const content = `---
title: Search Test
search:
  enabled: true
  placeholder: Search docs...
  maxResults: 5
---

# Search Test

This page has search configuration.
      `

      const result = await buildTestSite({
        files: [
          { path: 'search-test.md', content }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'Search Test')).toBe(true)
      expect(assertHtmlContains(html, 'Search docs...')).toBe(true)
    })

    test('should handle layout configuration', async () => {
      const homeContent = `---
title: Home Layout
layout: home
hero:
  name: My Project
  text: Amazing documentation
  tagline: Built with BunPress
---

Welcome to our home page.
      `

      const docContent = `---
title: Doc Layout
layout: doc
---

# Documentation Page

This is a documentation page.
      `

      const result = await buildTestSite({
        files: [
          { path: 'home.md', content: homeContent },
          { path: 'doc.md', content: docContent }
        ]
      })

      expect(result.success).toBe(true)

      const homeHtml = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(homeHtml, 'My Project')).toBe(true)
      expect(assertHtmlContains(homeHtml, 'Amazing documentation')).toBe(true)
      expect(assertHtmlContains(homeHtml, 'layout-home')).toBe(true)

      const docHtml = await readBuiltFile(result.outputs[1])
      expect(assertHtmlContains(docHtml, 'Documentation Page')).toBe(true)
      expect(assertHtmlContains(docHtml, 'layout-doc')).toBe(true)
    })
  })
})
