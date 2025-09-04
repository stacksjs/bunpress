import { describe, expect, test } from 'bun:test'
import { createTestMarkdown, buildTestSite, readBuiltFile, assertHtmlContains } from './utils/test-helpers'

describe('Default Theme', () => {
  describe('Navigation', () => {
    test('should render navigation bar', async () => {
      const content = createTestMarkdown(`
---
nav:
  - text: Home
    link: /
  - text: Guide
    link: /guide/
  - text: API
    link: /api/
---

# Home Page

Welcome to our site.
      `)

      const result = await buildTestSite({
        files: [{ path: 'index.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'index.html')
      expect(assertHtmlContains(html, '<nav')).toBe(true)
      expect(assertHtmlContains(html, 'navbar')).toBe(true)
      expect(assertHtmlContains(html, 'Home')).toBe(true)
      expect(assertHtmlContains(html, 'Guide')).toBe(true)
      expect(assertHtmlContains(html, 'API')).toBe(true)
    })

    test('should handle active navigation state', async () => {
      const content = createTestMarkdown(`
---
nav:
  - text: Home
    link: /
  - text: Guide
    link: /guide/
---

# Guide Page

Guide content here.
      `)

      const result = await buildTestSite({
        files: [{ path: 'guide/index.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'guide/index.html')
      expect(assertHtmlContains(html, 'nav-active')).toBe(true)
      expect(assertHtmlContains(html, 'active-link')).toBe(true)
      expect(assertHtmlContains(html, 'Guide')).toBe(true)
    })

    test('should support nested navigation', async () => {
      const content = createTestMarkdown(`
---
nav:
  - text: Guide
    items:
      - text: Getting Started
        link: /guide/getting-started
      - text: Advanced
        link: /guide/advanced
  - text: API
    link: /api/
---

# API Page

API documentation here.
      `)

      const result = await buildTestSite({
        files: [{ path: 'api/index.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'api/index.html')
      expect(assertHtmlContains(html, 'nav-dropdown')).toBe(true)
      expect(assertHtmlContains(html, 'submenu')).toBe(true)
      expect(assertHtmlContains(html, 'Getting Started')).toBe(true)
      expect(assertHtmlContains(html, 'Advanced')).toBe(true)
    })

    test('should handle navigation with icons', async () => {
      const content = createTestMarkdown(`
---
nav:
  - text: Home
    link: /
    icon: home
  - text: GitHub
    link: https://github.com
    icon: github
---

# Home Page

Welcome home.
      `)

      const result = await buildTestSite({
        files: [{ path: 'index.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'index.html')
      expect(assertHtmlContains(html, 'nav-icon')).toBe(true)
      expect(assertHtmlContains(html, 'icon-home')).toBe(true)
      expect(assertHtmlContains(html, 'icon-github')).toBe(true)
    })

    test('should support external links in navigation', async () => {
      const content = createTestMarkdown(`
---
nav:
  - text: Documentation
    link: /docs/
  - text: GitHub
    link: https://github.com/example
---

# Documentation

Docs content.
      `)

      const result = await buildTestSite({
        files: [{ path: 'docs/index.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'docs/index.html')
      expect(assertHtmlContains(html, 'target="_blank"')).toBe(true)
      expect(assertHtmlContains(html, 'rel="noopener"')).toBe(true)
      expect(assertHtmlContains(html, 'https://github.com/example')).toBe(true)
    })
  })

  describe('Sidebar', () => {
    test('should generate sidebar from file structure', async () => {
      const content = createTestMarkdown(`
# Getting Started

Getting started content.
      `)

      const result = await buildTestSite({
        files: [
          { path: 'index.md', content: '# Home\nHome content' },
          { path: 'guide/index.md', content },
          { path: 'guide/install.md', content: '# Install\nInstall content' },
          { path: 'api/index.md', content: '# API\nAPI content' }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'guide/index.html')
      expect(assertHtmlContains(html, '<aside')).toBe(true)
      expect(assertHtmlContains(html, 'sidebar')).toBe(true)
      expect(assertHtmlContains(html, 'Getting Started')).toBe(true)
      expect(assertHtmlContains(html, 'Install')).toBe(true)
    })

    test('should support custom sidebar configuration', async () => {
      const content = createTestMarkdown(`
---
sidebar:
  - text: Introduction
    link: /intro
  - text: Guide
    items:
      - text: Quick Start
        link: /guide/quick-start
      - text: Advanced
        link: /guide/advanced
  - text: API Reference
    link: /api
---

# Custom Sidebar Page

Content with custom sidebar.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, 'sidebar-custom')).toBe(true)
      expect(assertHtmlContains(html, 'Introduction')).toBe(true)
      expect(assertHtmlContains(html, 'Quick Start')).toBe(true)
      expect(assertHtmlContains(html, 'API Reference')).toBe(true)
    })

    test('should handle sidebar groups and sections', async () => {
      const content = createTestMarkdown(`
---
sidebar:
  - text: Getting Started
    collapsible: true
    items:
      - text: Installation
        link: /install
      - text: Configuration
        link: /config
  - text: API
    collapsible: false
    items:
      - text: REST API
        link: /api/rest
      - text: GraphQL
        link: /api/graphql
---

# Sidebar Groups

Content with grouped sidebar.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, 'sidebar-group')).toBe(true)
      expect(assertHtmlContains(html, 'collapsible')).toBe(true)
      expect(assertHtmlContains(html, 'Installation')).toBe(true)
      expect(assertHtmlContains(html, 'REST API')).toBe(true)
    })

    test('should highlight active sidebar items', async () => {
      const content = createTestMarkdown(`
---
sidebar:
  - text: Home
    link: /
  - text: Guide
    link: /guide
  - text: API
    link: /api
---

# Guide Page

Guide content.
      `)

      const result = await buildTestSite({
        files: [{ path: 'guide.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'guide.html')
      expect(assertHtmlContains(html, 'sidebar-active')).toBe(true)
      expect(assertHtmlContains(html, 'active-sidebar-item')).toBe(true)
      expect(assertHtmlContains(html, 'Guide')).toBe(true)
    })

    test('should support nested sidebar items', async () => {
      const content = createTestMarkdown(`
---
sidebar:
  - text: Level 1
    items:
      - text: Level 2
        items:
          - text: Level 3
            link: /level3
---

# Nested Sidebar

Content with deeply nested sidebar.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, 'sidebar-nested')).toBe(true)
      expect(assertHtmlContains(html, 'nested-level-3')).toBe(true)
      expect(assertHtmlContains(html, 'Level 3')).toBe(true)
    })
  })

  describe('Search', () => {
    test('should render search input', async () => {
      const content = createTestMarkdown(`
---
search: true
---

# Search Enabled Page

Content with search functionality.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, '<input')).toBe(true)
      expect(assertHtmlContains(html, 'search-box')).toBe(true)
      expect(assertHtmlContains(html, 'type="search"')).toBe(true)
    })

    test('should index content for search', async () => {
      const content = createTestMarkdown(`
# Searchable Content

This page contains searchable content about TypeScript and JavaScript development.

## TypeScript Features

TypeScript provides static typing for JavaScript.

## JavaScript Basics

JavaScript is a programming language.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, 'search-index')).toBe(true)
      expect(assertHtmlContains(html, 'data-search-content')).toBe(true)
      expect(assertHtmlContains(html, 'TypeScript')).toBe(true)
      expect(assertHtmlContains(html, 'JavaScript')).toBe(true)
    })

    test('should filter results based on query', async () => {
      const content = createTestMarkdown(`
# Search Test

Content about algorithms and data structures.

## Sorting Algorithms

Learn about quicksort and mergesort.

## Data Structures

Arrays, linked lists, and trees.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, 'search-results')).toBe(true)
      expect(assertHtmlContains(html, 'search-filter')).toBe(true)
      expect(assertHtmlContains(html, 'algorithms')).toBe(true)
      expect(assertHtmlContains(html, 'data structures')).toBe(true)
    })

    test('should support keyboard shortcuts', async () => {
      const content = createTestMarkdown(`
---
search: true
---

# Keyboard Search

Content with keyboard shortcut support.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, 'search-shortcut')).toBe(true)
      expect(assertHtmlContains(html, 'keydown')).toBe(true)
      expect(assertHtmlContains(html, 'Ctrl+K')).toBe(true)
    })

    test('should handle search suggestions', async () => {
      const content = createTestMarkdown(`
# Suggestions Page

Content about React, Vue, and Angular frameworks.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, 'search-suggestions')).toBe(true)
      expect(assertHtmlContains(html, 'autocomplete')).toBe(true)
      expect(assertHtmlContains(html, 'React')).toBe(true)
      expect(assertHtmlContains(html, 'Vue')).toBe(true)
    })
  })

  describe('Layout Variants', () => {
    test('should render home layout', async () => {
      const content = createTestMarkdown(`
---
layout: home
hero:
  name: My Project
  text: Amazing Project
  tagline: The best project ever
  actions:
    - text: Get Started
      link: /guide
    - text: GitHub
      link: https://github.com
features:
  - title: Fast
    details: Very fast performance
  - title: Easy
    details: Easy to use
---

Hero and features content.
      `)

      const result = await buildTestSite({
        files: [{ path: 'index.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'index.html')
      expect(assertHtmlContains(html, 'layout-home')).toBe(true)
      expect(assertHtmlContains(html, 'hero-section')).toBe(true)
      expect(assertHtmlContains(html, 'features-section')).toBe(true)
      expect(assertHtmlContains(html, 'My Project')).toBe(true)
      expect(assertHtmlContains(html, 'Amazing Project')).toBe(true)
    })

    test('should render doc layout', async () => {
      const content = createTestMarkdown(`
---
layout: doc
---

# Documentation Page

This is a documentation page with sidebar.
      `)

      const result = await buildTestSite({
        files: [{ path: 'docs/test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'docs/test.html')
      expect(assertHtmlContains(html, 'layout-doc')).toBe(true)
      expect(assertHtmlContains(html, 'sidebar')).toBe(true)
      expect(assertHtmlContains(html, 'main-content')).toBe(true)
    })

    test('should render page layout', async () => {
      const content = createTestMarkdown(`
---
layout: page
---

# Plain Page

This is a plain page without sidebar.
      `)

      const result = await buildTestSite({
        files: [{ path: 'about.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'about.html')
      expect(assertHtmlContains(html, 'layout-page')).toBe(true)
      expect(assertHtmlContains(html, 'full-width')).toBe(true)
      expect(assertHtmlContains(html, 'Plain Page')).toBe(true)
    })

    test('should handle custom layouts', async () => {
      const content = createTestMarkdown(`
---
layout: custom
---

# Custom Layout Page

This uses a custom layout.
      `)

      const result = await buildTestSite({
        files: [{ path: 'custom.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'custom.html')
      expect(assertHtmlContains(html, 'layout-custom')).toBe(true)
      expect(assertHtmlContains(html, 'custom-layout')).toBe(true)
    })
  })

  describe('Responsive Design', () => {
    test('should render mobile navigation', async () => {
      const content = createTestMarkdown(`
---
nav:
  - text: Home
    link: /
  - text: Guide
    link: /guide
  - text: API
    link: /api
---

# Mobile Test

Content for mobile testing.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, 'mobile-nav')).toBe(true)
      expect(assertHtmlContains(html, 'hamburger-menu')).toBe(true)
      expect(assertHtmlContains(html, 'nav-toggle')).toBe(true)
    })

    test('should handle responsive sidebar', async () => {
      const content = createTestMarkdown(`
---
sidebar:
  - text: Getting Started
    link: /start
  - text: Advanced
    link: /advanced
---

# Responsive Sidebar

Content with responsive sidebar.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, 'sidebar-responsive')).toBe(true)
      expect(assertHtmlContains(html, 'sidebar-mobile')).toBe(true)
      expect(assertHtmlContains(html, 'sidebar-overlay')).toBe(true)
    })

    test('should support responsive tables', async () => {
      const content = createTestMarkdown(`
# Responsive Table

| Feature | Description | Status |
|---------|-------------|---------|
| Tables | Responsive tables | ✅ |
| Mobile | Mobile support | ✅ |
| Touch | Touch gestures | ✅ |
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, 'table-responsive')).toBe(true)
      expect(assertHtmlContains(html, 'mobile-table')).toBe(true)
      expect(assertHtmlContains(html, 'Feature')).toBe(true)
      expect(assertHtmlContains(html, 'Description')).toBe(true)
    })
  })

  describe('Theme Customization', () => {
    test('should apply custom colors', async () => {
      const content = createTestMarkdown(`
---
themeConfig:
  colors:
    primary: '#ff6b6b'
    accent: '#4ecdc4'
---

# Custom Colors

Content with custom theme colors.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, 'custom-colors')).toBe(true)
      expect(assertHtmlContains(html, '#ff6b6b')).toBe(true)
      expect(assertHtmlContains(html, '#4ecdc4')).toBe(true)
    })

    test('should support custom fonts', async () => {
      const content = createTestMarkdown(`
---
themeConfig:
  fonts:
    heading: 'Inter, sans-serif'
    body: 'Roboto, sans-serif'
---

# Custom Fonts

Content with custom fonts.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, 'custom-fonts')).toBe(true)
      expect(assertHtmlContains(html, 'Inter, sans-serif')).toBe(true)
      expect(assertHtmlContains(html, 'Roboto, sans-serif')).toBe(true)
    })

    test('should handle dark mode', async () => {
      const content = createTestMarkdown(`
---
themeConfig:
  darkMode: true
---

# Dark Mode

Content with dark mode support.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, 'dark-mode')).toBe(true)
      expect(assertHtmlContains(html, 'theme-toggle')).toBe(true)
      expect(assertHtmlContains(html, 'dark-theme')).toBe(true)
    })
  })
})
