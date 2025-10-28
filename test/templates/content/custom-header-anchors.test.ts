import { describe, expect, it } from 'bun:test'
import { startServer } from '../../../src/serve'

const TEST_MARKDOWN_DIR = './test/markdown/content'

describe('Custom Header Anchors', () => {
  describe('Basic Custom Anchors', () => {
    it('should use custom ID for h2 heading', async () => {
      const { server, stop } = await startServer({ port: 13001, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-custom-anchor-h2.md`,
          `## My Custom Heading {#my-id}`,
        )

        const response = await fetch('http://localhost:13001/test-custom-anchor-h2')
        const html = await response.text()

        // Should have custom ID
        expect(html).toContain('id="my-id"')

        // Should NOT display the {#my-id} syntax
        expect(html).not.toContain('{#my-id}')

        // Should display clean heading text
        expect(html).toContain('>My Custom Heading<')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-custom-anchor-h2.md`, '')
      }
    })

    it('should use custom ID for h3 heading', async () => {
      const { server, stop } = await startServer({ port: 13002, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-custom-anchor-h3.md`,
          `### Section Title {#section}`,
        )

        const response = await fetch('http://localhost:13002/test-custom-anchor-h3')
        const html = await response.text()

        expect(html).toContain('id="section"')
        expect(html).not.toContain('{#section}')
        expect(html).toContain('>Section Title<')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-custom-anchor-h3.md`, '')
      }
    })

    it('should use custom ID for h4 heading', async () => {
      const { server, stop } = await startServer({ port: 13003, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-custom-anchor-h4.md`,
          `## Main Section

### Subsection {#subsection-123}

Content here.`,
        )

        const response = await fetch('http://localhost:13003/test-custom-anchor-h4')
        const html = await response.text()

        expect(html).toContain('id="subsection-123"')
        expect(html).not.toContain('{#subsection-123}')
        expect(html).toContain('>Subsection<')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-custom-anchor-h4.md`, '')
      }
    })
  })

  describe('Custom ID Formats', () => {
    it('should support hyphens in custom IDs', async () => {
      const { server, stop } = await startServer({ port: 13004, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-custom-hyphen.md`,
          `## Getting Started {#getting-started}`,
        )

        const response = await fetch('http://localhost:13004/test-custom-hyphen')
        const html = await response.text()

        expect(html).toContain('id="getting-started"')
        expect(html).toContain('>Getting Started<')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-custom-hyphen.md`, '')
      }
    })

    it('should support underscores in custom IDs', async () => {
      const { server, stop } = await startServer({ port: 13005, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-custom-underscore.md`,
          `## API Reference {#api_reference}`,
        )

        const response = await fetch('http://localhost:13005/test-custom-underscore')
        const html = await response.text()

        expect(html).toContain('id="api_reference"')
        expect(html).toContain('>API Reference<')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-custom-underscore.md`, '')
      }
    })

    it('should support numbers in custom IDs', async () => {
      const { server, stop } = await startServer({ port: 13006, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-custom-numbers.md`,
          `## Version 2.0 Features {#v2-features}`,
        )

        const response = await fetch('http://localhost:13006/test-custom-numbers')
        const html = await response.text()

        expect(html).toContain('id="v2-features"')
        expect(html).toContain('>Version 2.0 Features<')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-custom-numbers.md`, '')
      }
    })
  })

  describe('Auto-generated IDs (no custom anchor)', () => {
    it('should auto-generate ID when no custom anchor provided', async () => {
      const { server, stop } = await startServer({ port: 13007, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-auto-id.md`,
          `## This is Auto Generated`,
        )

        const response = await fetch('http://localhost:13007/test-auto-id')
        const html = await response.text()

        // Should auto-generate ID from text
        expect(html).toContain('id="this-is-auto-generated"')
        expect(html).toContain('>This is Auto Generated<')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-auto-id.md`, '')
      }
    })

    it('should handle special characters in auto-generated IDs', async () => {
      const { server, stop } = await startServer({ port: 13008, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-auto-special.md`,
          `## FAQ: What's New?`,
        )

        const response = await fetch('http://localhost:13008/test-auto-special')
        const html = await response.text()

        // Should remove special characters and use only words and hyphens
        expect(html).toContain('id="faq-whats-new"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-auto-special.md`, '')
      }
    })
  })

  describe('Multiple Headings', () => {
    it('should handle mix of custom and auto-generated IDs', async () => {
      const { server, stop } = await startServer({ port: 13009, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-mixed-ids.md`,
          `# Main Title

## Introduction {#intro}

Some content here.

## Features

More content.

### Advanced Features {#advanced}

Even more content.

### Basic Features

Final content.`,
        )

        const response = await fetch('http://localhost:13009/test-mixed-ids')
        const html = await response.text()

        // Custom IDs
        expect(html).toContain('id="intro"')
        expect(html).toContain('id="advanced"')

        // Auto-generated IDs
        expect(html).toContain('id="features"')
        expect(html).toContain('id="basic-features"')

        // Should not show custom anchor syntax
        expect(html).not.toContain('{#intro}')
        expect(html).not.toContain('{#advanced}')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-mixed-ids.md`, '')
      }
    })
  })

  describe('TOC Integration', () => {
    it('should use custom IDs in table of contents links', async () => {
      const { server, stop } = await startServer({ port: 13010, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-toc-custom-id.md`,
          `# Document

## Section One {#sec1}

Content for section one.

## Section Two {#sec2}

Content for section two.

### Subsection {#subsec}

Content for subsection.`,
        )

        const response = await fetch('http://localhost:13010/test-toc-custom-id')
        const html = await response.text()

        // TOC should link to custom IDs
        expect(html).toContain('href="#sec1"')
        expect(html).toContain('href="#sec2"')
        expect(html).toContain('href="#subsec"')

        // Headings should have custom IDs
        expect(html).toContain('id="sec1"')
        expect(html).toContain('id="sec2"')
        expect(html).toContain('id="subsec"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-toc-custom-id.md`, '')
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle whitespace around custom anchor', async () => {
      const { server, stop } = await startServer({ port: 13011, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-whitespace.md`,
          `## Heading With Spaces   {#my-anchor}  `,
        )

        const response = await fetch('http://localhost:13011/test-whitespace')
        const html = await response.text()

        expect(html).toContain('id="my-anchor"')
        expect(html).not.toContain('{#my-anchor}')
        // Should trim whitespace from display text
        expect(html).toContain('>Heading With Spaces<')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-whitespace.md`, '')
      }
    })

    it('should handle headings with inline code', async () => {
      const { server, stop } = await startServer({ port: 13012, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-inline-code.md`,
          '## Using `console.log()` {#console-log}',
        )

        const response = await fetch('http://localhost:13012/test-inline-code')
        const html = await response.text()

        expect(html).toContain('id="console-log"')
        expect(html).not.toContain('{#console-log}')
        expect(html).toContain('<code>console.log()</code>')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-inline-code.md`, '')
      }
    })

    it('should handle headings with emphasis', async () => {
      const { server, stop } = await startServer({ port: 13013, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-emphasis.md`,
          '## **Important** Section {#important}',
        )

        const response = await fetch('http://localhost:13013/test-emphasis')
        const html = await response.text()

        expect(html).toContain('id="important"')
        expect(html).not.toContain('{#important}')
        expect(html).toContain('<strong>Important</strong>')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-emphasis.md`, '')
      }
    })
  })

  describe('VitePress Compatibility', () => {
    it('should match VitePress custom anchor syntax', async () => {
      const { server, stop } = await startServer({ port: 13014, root: TEST_MARKDOWN_DIR })

      try {
        // VitePress example from documentation
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-vitepress-compat.md`,
          `## Links {#my-anchor}

Content with [link to anchor](#my-anchor).`,
        )

        const response = await fetch('http://localhost:13014/test-vitepress-compat')
        const html = await response.text()

        // Should have custom anchor
        expect(html).toContain('id="my-anchor"')

        // Link should work
        expect(html).toContain('href="#my-anchor"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-vitepress-compat.md`, '')
      }
    })
  })
})
