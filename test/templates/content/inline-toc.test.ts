import { describe, expect, it } from 'bun:test'
import { startServer } from '../../../src/serve'

const TEST_MARKDOWN_DIR = './test/markdown/content'

describe('Inline TOC [[toc]] Macro', () => {
  describe('Basic Inline TOC', () => {
    it('should render inline TOC from [[toc]] macro', async () => {
      const { server, stop } = await startServer({ port: 16001, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-inline-toc-basic.md`,
          `# Document Title

[[toc]]

## Introduction

This is the introduction section.

## Features

This section describes features.

### Performance

Performance details here.

### Security

Security information here.

## Conclusion

Final thoughts.`,
        )

        const response = await fetch('http://localhost:16001/test-inline-toc-basic')
        const html = await response.text()

        // Should contain TOC navigation element
        expect(html).toContain('table-of-contents')
        expect(html).toContain('toc-inline')

        // Should contain TOC title
        expect(html).toContain('Table of Contents')

        // Should contain links to headings (h2 and h3)
        expect(html).toContain('href="#introduction"')
        expect(html).toContain('href="#features"')
        expect(html).toContain('href="#performance"')
        expect(html).toContain('href="#security"')
        expect(html).toContain('href="#conclusion"')

        // Should NOT show the [[toc]] macro itself
        expect(html).not.toContain('[[toc]]')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-inline-toc-basic.md`, '')
      }
    })

    it('should render TOC with nested structure', async () => {
      const { server, stop } = await startServer({ port: 16002, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-inline-toc-nested.md`,
          `# Guide

[[toc]]

## Getting Started

### Installation

#### npm
#### yarn
#### bun

### Configuration

#### Basic Setup
#### Advanced Options

## Usage

### Basic Usage
### Advanced Usage`,
        )

        const response = await fetch('http://localhost:16002/test-inline-toc-nested')
        const html = await response.text()

        // Should have nested lists
        expect(html).toContain('toc-sublist')
        expect(html).toContain('toc-subitem')

        // Should contain all heading links
        expect(html).toContain('href="#getting-started"')
        expect(html).toContain('href="#installation"')
        expect(html).toContain('href="#configuration"')
        expect(html).toContain('href="#usage"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-inline-toc-nested.md`, '')
      }
    })
  })

  describe('TOC Position', () => {
    it('should render TOC at specified position in content', async () => {
      const { server, stop } = await startServer({ port: 16003, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-inline-toc-position.md`,
          `# Document

Introduction paragraph before TOC.

[[toc]]

Content after TOC.

## Section One
## Section Two`,
        )

        const response = await fetch('http://localhost:16003/test-inline-toc-position')
        const html = await response.text()

        // Should contain TOC
        expect(html).toContain('table-of-contents')

        // Extract content area (between <article> tags)
        const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/)
        const contentHtml = articleMatch ? articleMatch[1] : html

        // Check that TOC appears between the paragraphs in the content (order matters)
        const tocIndex = contentHtml.indexOf('table-of-contents')
        const beforeText = contentHtml.indexOf('Introduction paragraph before TOC')
        const afterText = contentHtml.indexOf('Content after TOC')

        expect(tocIndex).toBeGreaterThan(beforeText)
        expect(afterText).toBeGreaterThan(tocIndex)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-inline-toc-position.md`, '')
      }
    })

    it('should handle multiple [[toc]] macros', async () => {
      const { server, stop } = await startServer({ port: 16004, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-inline-toc-multiple.md`,
          `# Document

First TOC location:
[[toc]]

## Introduction

Second TOC location:
[[toc]]

## Conclusion`,
        )

        const response = await fetch('http://localhost:16004/test-inline-toc-multiple')
        const html = await response.text()

        // Count occurrences of TOC class
        const tocMatches = html.match(/table-of-contents/g)
        expect(tocMatches?.length).toBeGreaterThanOrEqual(2)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-inline-toc-multiple.md`, '')
      }
    })
  })

  describe('TOC Content', () => {
    it('should extract h2-h6 headings by default', async () => {
      const { server, stop } = await startServer({ port: 16005, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-inline-toc-levels.md`,
          `# Title (h1)

[[toc]]

## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6`,
        )

        const response = await fetch('http://localhost:16005/test-inline-toc-levels')
        const html = await response.text()

        // Should include h2-h6
        expect(html).toContain('href="#heading-2"')
        expect(html).toContain('href="#heading-3"')
        expect(html).toContain('href="#heading-4"')
        expect(html).toContain('href="#heading-5"')
        expect(html).toContain('href="#heading-6"')

        // Should NOT include h1 in TOC links (it's the page title)
        // The h1 text might appear in the content, but not as a TOC link
        const tocSection = html.substring(
          html.indexOf('table-of-contents'),
          html.indexOf('</nav>', html.indexOf('table-of-contents')),
        )
        expect(tocSection).not.toContain('href="#title-h1"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-inline-toc-levels.md`, '')
      }
    })

    it('should handle headings with inline code', async () => {
      const { server, stop } = await startServer({ port: 16006, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-inline-toc-code.md`,
          `# API Reference

[[toc]]

## Using \`console.log()\`
## The \`async\`/\`await\` Pattern
## \`fetch()\` Function`,
        )

        const response = await fetch('http://localhost:16006/test-inline-toc-code')
        const html = await response.text()

        // Should contain TOC with code elements
        expect(html).toContain('table-of-contents')

        // Should have links with proper IDs (code stripped for slugs)
        expect(html).toContain('href="#using-console-log"')
        expect(html).toContain('href="#the-async-await-pattern"')
        expect(html).toContain('href="#fetch-function"')

        // Should preserve code formatting in TOC text
        expect(html).toContain('<code>console.log()</code>')
        expect(html).toContain('<code>async</code>')
        expect(html).toContain('<code>await</code>')
        expect(html).toContain('<code>fetch()</code>')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-inline-toc-code.md`, '')
      }
    })

    it('should respect toc-ignore comments', async () => {
      const { server, stop } = await startServer({ port: 16007, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-inline-toc-ignore.md`,
          `# Document

[[toc]]

## Visible Section
## Hidden Section <!-- toc-ignore -->
## Another Visible Section`,
        )

        const response = await fetch('http://localhost:16007/test-inline-toc-ignore')
        const html = await response.text()

        // Should contain visible sections
        expect(html).toContain('href="#visible-section"')
        expect(html).toContain('href="#another-visible-section"')

        // Should NOT contain ignored section in TOC
        const tocSection = html.substring(
          html.indexOf('table-of-contents'),
          html.indexOf('</nav>', html.indexOf('table-of-contents')),
        )
        expect(tocSection).not.toContain('Hidden Section')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-inline-toc-ignore.md`, '')
      }
    })
  })

  describe('TOC Styling and Classes', () => {
    it('should have inline TOC specific classes', async () => {
      const { server, stop } = await startServer({ port: 16008, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-inline-toc-classes.md`,
          `# Document

[[toc]]

## Section`,
        )

        const response = await fetch('http://localhost:16008/test-inline-toc-classes')
        const html = await response.text()

        // Should have inline-specific classes
        expect(html).toContain('table-of-contents')
        expect(html).toContain('toc-inline')
        expect(html).toContain('inline-toc')

        // Should have standard TOC structure classes
        expect(html).toContain('toc-container')
        expect(html).toContain('toc-title')
        expect(html).toContain('toc-list')
        expect(html).toContain('toc-item')
        expect(html).toContain('toc-link')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-inline-toc-classes.md`, '')
      }
    })
  })

  describe('Empty TOC Cases', () => {
    it('should handle document with no headings', async () => {
      const { server, stop } = await startServer({ port: 16009, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-inline-toc-empty.md`,
          `# Title

[[toc]]

Just a paragraph with no additional headings.`,
        )

        const response = await fetch('http://localhost:16009/test-inline-toc-empty')
        const html = await response.text()

        // Should still render TOC structure even if empty
        expect(html).toContain('table-of-contents')
        expect(html).toContain('Table of Contents')

        // Should render but may be empty list
        expect(response.status).toBe(200)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-inline-toc-empty.md`, '')
      }
    })

    it('should handle document without [[toc]] macro', async () => {
      const { server, stop } = await startServer({ port: 16010, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-inline-toc-none.md`,
          `# Document

## Section One
## Section Two

No TOC macro in this document.`,
        )

        const response = await fetch('http://localhost:16010/test-inline-toc-none')
        const html = await response.text()

        // Should NOT contain inline TOC classes
        expect(html).not.toContain('toc-inline')

        // Content should render normally
        expect(html).toContain('Section One')
        expect(html).toContain('Section Two')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-inline-toc-none.md`, '')
      }
    })
  })

  describe('TOC with Special Headings', () => {
    it('should handle headings with emojis', async () => {
      const { server, stop } = await startServer({ port: 16011, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-inline-toc-emoji.md`,
          `# Guide

[[toc]]

## :rocket: Getting Started
## :fire: Advanced Topics
## :tada: Conclusion`,
        )

        const response = await fetch('http://localhost:16011/test-inline-toc-emoji')
        const html = await response.text()

        // Should contain TOC
        expect(html).toContain('table-of-contents')

        // Emojis should be converted in both headings and TOC
        expect(html).toContain('🚀')
        expect(html).toContain('🔥')
        expect(html).toContain('🎉')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-inline-toc-emoji.md`, '')
      }
    })

    it('should handle headings with custom anchors', async () => {
      const { server, stop } = await startServer({ port: 16012, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-inline-toc-custom-anchors.md`,
          `# Documentation

[[toc]]

## Installation {#install}
## Configuration {#config}
## Usage {#using}`,
        )

        const response = await fetch('http://localhost:16012/test-inline-toc-custom-anchors')
        const html = await response.text()

        // TOC should link to custom anchor IDs
        expect(html).toContain('href="#install"')
        expect(html).toContain('href="#config"')
        expect(html).toContain('href="#using"')

        // Should not show the {#custom-id} syntax in TOC text
        expect(html).toContain('Installation')
        expect(html).toContain('Configuration')
        expect(html).toContain('Usage')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-inline-toc-custom-anchors.md`, '')
      }
    })

    it('should handle headings with badges', async () => {
      const { server, stop } = await startServer({ port: 16013, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-inline-toc-badges.md`,
          `# API

[[toc]]

## Authentication <Badge type="info" text="v2.0" />
## Authorization <Badge type="warning" text="beta" />
## Rate Limiting <Badge type="tip" text="new" />`,
        )

        const response = await fetch('http://localhost:16013/test-inline-toc-badges')
        const html = await response.text()

        // Should contain TOC
        expect(html).toContain('table-of-contents')

        // Should have heading links
        expect(html).toContain('href="#authentication"')
        expect(html).toContain('href="#authorization"')
        expect(html).toContain('href="#rate-limiting"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-inline-toc-badges.md`, '')
      }
    })
  })

  describe('Integration with Content', () => {
    it('should work with code blocks', async () => {
      const { server, stop } = await startServer({ port: 16014, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-inline-toc-codeblocks.md`,
          `# Guide

[[toc]]

## Installation

\`\`\`bash
npm install bunpress
\`\`\`

## Usage

\`\`\`js
import bunpress from 'bunpress'
\`\`\``,
        )

        const response = await fetch('http://localhost:16014/test-inline-toc-codeblocks')
        const html = await response.text()

        // Should have TOC
        expect(html).toContain('table-of-contents')
        expect(html).toContain('href="#installation"')
        expect(html).toContain('href="#usage"')

        // Should preserve code blocks (syntax-highlighted)
        expect(html).toContain('npm')
        expect(html).toContain('install')
        expect(html).toContain('bunpress')
        expect(html).toContain('import')
        expect(html).toContain('from')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-inline-toc-codeblocks.md`, '')
      }
    })

    it('should work with containers', async () => {
      const { server, stop } = await startServer({ port: 16015, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-inline-toc-containers.md`,
          `# Guide

[[toc]]

## Important Notes

::: warning
This is a warning container.
:::

## Tips

::: tip
This is a tip container.
:::`,
        )

        const response = await fetch('http://localhost:16015/test-inline-toc-containers')
        const html = await response.text()

        // Should have TOC
        expect(html).toContain('table-of-contents')
        expect(html).toContain('href="#important-notes"')
        expect(html).toContain('href="#tips"')

        // Should preserve containers
        expect(html).toContain('custom-block')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-inline-toc-containers.md`, '')
      }
    })
  })
})
