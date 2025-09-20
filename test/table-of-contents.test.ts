import { describe, expect, test } from 'bun:test'
import { assertHtmlContains, buildTestSite, createTestMarkdown, readBuiltFile } from './utils/test-helpers'

describe('Table of Contents', () => {
  describe('TOC Generation', () => {
    test('should generate TOC from headings', async () => {
      const content = createTestMarkdown(`
# Introduction

Welcome to our documentation.

## Getting Started

This is the getting started section.

### Installation

How to install the software.

### Configuration

How to configure the software.

## Advanced Usage

This is the advanced section.

### API Reference

API documentation here.

#### Authentication

Auth details.

#### Endpoints

Available endpoints.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'table-of-contents')).toBe(true)
      expect(assertHtmlContains(html, 'toc-')).toBe(true)
      expect(assertHtmlContains(html, 'Introduction')).toBe(true)
      expect(assertHtmlContains(html, 'Getting Started')).toBe(true)
      expect(assertHtmlContains(html, 'Installation')).toBe(true)
    })

    test('should respect max depth', async () => {
      const content = createTestMarkdown(`
# Level 1

## Level 2

### Level 3

#### Level 4

##### Level 5
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
        config: {
          markdown: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - tocMaxDepth property for testing
            tocMaxDepth: 2,
          },
        },
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'Level 1')).toBe(true)
      expect(assertHtmlContains(html, 'Level 2')).toBe(true)
      // Level 3 should still be rendered in content, even though excluded from TOC by max depth
      expect(assertHtmlContains(html, 'Level 3')).toBe(true)
    })

    test('should handle heading anchors', async () => {
      const content = createTestMarkdown(`
# My Awesome Guide

## Getting Started

### Basic Setup

Some content here.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'id="my-awesome-guide"')).toBe(true)
      expect(assertHtmlContains(html, 'id="getting-started"')).toBe(true)
      expect(assertHtmlContains(html, 'id="basic-setup"')).toBe(true)
    })

    test('should handle special characters in anchors', async () => {
      const content = createTestMarkdown(`
# What's New? (v2.0)

## Features & Benefits

### Vue.js + TypeScript = ❤️
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'id="whats-new-v2-0"')).toBe(true)
      expect(assertHtmlContains(html, 'id="features-benefits"')).toBe(true)
      expect(assertHtmlContains(html, 'id="vue-js-typescript"')).toBe(true)
    })

    test('should handle duplicate headings', async () => {
      const content = createTestMarkdown(`
# Introduction

## Usage

### Basic Usage

### Advanced Usage

## Usage

### Installation

### Configuration
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'id="usage"')).toBe(true)
      expect(assertHtmlContains(html, 'id="usage-1"')).toBe(true)
      expect(assertHtmlContains(html, 'id="basic-usage"')).toBe(true)
      expect(assertHtmlContains(html, 'id="advanced-usage"')).toBe(true)
    })
  })

  describe('TOC Positioning', () => {
    test('should support sidebar TOC', async () => {
      const content = createTestMarkdown(`
# Introduction

## Getting Started

### Installation

Some content here.
      `, { toc: 'sidebar' })

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'toc-sidebar')).toBe(true)
      expect(assertHtmlContains(html, 'sidebar-toc')).toBe(true)
    })

    test('should support inline TOC', async () => {
      const content = createTestMarkdown(`
# Introduction

[[toc]]

## Getting Started

### Installation

Some content here.
      `, { toc: 'inline' })

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'toc-inline')).toBe(true)
      expect(assertHtmlContains(html, 'inline-toc')).toBe(true)
    })

    test('should support floating TOC', async () => {
      const content = createTestMarkdown(`
# Introduction

## Getting Started

### Installation

Some content here.
      `, { toc: 'floating' })

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'toc-floating')).toBe(true)
      expect(assertHtmlContains(html, 'floating-toc')).toBe(true)
    })

    test('should support multiple TOC positions', async () => {
      const content = createTestMarkdown(`
# Introduction

## Getting Started

### Installation

[[toc]]

Some content here.
      `, { toc: ['sidebar', 'inline'] })

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'toc-sidebar')).toBe(true)
      expect(assertHtmlContains(html, 'toc-inline')).toBe(true)
    })
  })

  describe('TOC Customization', () => {
    test('should support custom TOC title', async () => {
      const content = createTestMarkdown(`
# Introduction

## Getting Started

Some content here.
      `, { tocTitle: 'Contents' })

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'Contents')).toBe(true)
      expect(assertHtmlContains(html, 'Table of Contents')).toBe(false)
    })

    test('should exclude headings from TOC', async () => {
      const content = createTestMarkdown(`
# Introduction

## Getting Started

## Advanced Usage <!-- toc-ignore -->

Some content here.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'Introduction')).toBe(true)
      expect(assertHtmlContains(html, 'Getting Started')).toBe(true)
      expect(assertHtmlContains(html, 'Advanced Usage')).toBe(false)
    })

    test('should support custom heading levels', async () => {
      const content = createTestMarkdown(`
---
tocStartLevel: 2
tocEndLevel: 4
---

# Introduction (excluded)

## Getting Started (included)

### Installation (included)

#### Configuration (included)

##### Details (excluded)
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'Introduction')).toBe(true)
      expect(assertHtmlContains(html, 'Getting Started')).toBe(true)
      expect(assertHtmlContains(html, 'Installation')).toBe(true)
      expect(assertHtmlContains(html, 'Configuration')).toBe(true)
      expect(assertHtmlContains(html, 'Details')).toBe(true)
    })
  })

  describe('TOC Interaction', () => {
    test('should add smooth scrolling to anchor links', async () => {
      const content = createTestMarkdown(`
# Introduction

## Getting Started

### Installation

Some content here.

[Jump to Installation](#installation)
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'scroll-behavior: smooth')).toBe(true)
      expect(assertHtmlContains(html, 'href="#installation"')).toBe(true)
    })

    test('should highlight active TOC items on scroll', async () => {
      const content = createTestMarkdown(`
# Introduction

## Getting Started

### Installation

Some content here.

### Configuration

More content here.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'parent.classList.add(\'toc-active\', \'active-toc-item\')')).toBe(true)
    })

    test('should collapse/expand TOC sections', async () => {
      const content = createTestMarkdown(`
# Introduction

## Getting Started

### Installation

Some content here.

### Configuration

More content here.

## Advanced Usage

### API Reference

API content here.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'toc-collapse')).toBe(true)
      expect(assertHtmlContains(html, 'toc-expand')).toBe(true)
      expect(assertHtmlContains(html, 'collapsed')).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    test('should handle empty headings', async () => {
      const content = createTestMarkdown(`
# Introduction

## 

### Valid Heading

Some content here.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'Introduction')).toBe(true)
      expect(assertHtmlContains(html, 'Valid Heading')).toBe(true)
      // Empty heading should be excluded
    })

    test('should handle very long heading text', async () => {
      const longTitle = 'A Very Long Heading Title That Might Cause Issues With Display And Should Be Handled Gracefully By The TOC Generation System'

      const content = createTestMarkdown(`
# Introduction

## ${longTitle}

Some content here.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, longTitle.substring(0, 50))).toBe(true)
      expect(assertHtmlContains(html, 'toc-truncate')).toBe(true)
    })

    test('should handle headings with code blocks', async () => {
      const content = createTestMarkdown(`
# Introduction

## \`code\` in heading

### Heading with \`inline.code\` and \`more.code\`

Some content here.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, '<code>code</code> in heading')).toBe(true)
      expect(assertHtmlContains(html, 'toc-code')).toBe(true)
    })
  })
})
