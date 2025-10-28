import { describe, expect, it } from 'bun:test'
import { startServer } from '../../../src/serve'

const TEST_MARKDOWN_DIR = './test/markdown/include'

describe('Markdown File Inclusion', () => {
  describe('Basic File Inclusion', () => {
    it('should include entire markdown file', async () => {
      const { server, stop } = await startServer({ port: 17001, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-include-basic.md`,
          `# Main Document

<!--@include: ./intro.md-->

## Conclusion

That's all!`,
        )

        const response = await fetch('http://localhost:17001/test-include-basic')
        const html = await response.text()

        // Should include content from intro.md
        expect(html).toContain('This is the introduction content from an external file')
        expect(html).toContain('Features')
        expect(html).toContain('Fast performance')
        expect(html).toContain('Easy to use')

        // Should have main document content
        expect(html).toContain('Main Document')
        expect(html).toContain('Conclusion')
        expect(html).toContain('That\'s all!')

        // Should NOT show the include syntax
        expect(html).not.toContain('<!--@include:')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-include-basic.md`, '')
      }
    })

    it('should handle multiple includes in same file', async () => {
      const { server, stop } = await startServer({ port: 17002, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-include-multiple.md`,
          `# Documentation

<!--@include: ./intro.md-->

## FAQ Section

<!--@include: ./faq.md-->

## End`,
        )

        const response = await fetch('http://localhost:17002/test-include-multiple')
        const html = await response.text()

        // Should include content from intro.md
        expect(html).toContain('This is the introduction content')

        // Should include content from faq.md
        expect(html).toContain('Getting Started')
        // Code is now syntax-highlighted with spans, so check for tokens
        expect(html).toContain('npm')
        expect(html).toContain('install')
        expect(html).toContain('bunpress')
        expect(html).toContain('Advanced Usage')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-include-multiple.md`, '')
      }
    })
  })

  describe('Line Range Inclusion', () => {
    it('should include specific line range', async () => {
      const { server, stop } = await startServer({ port: 17003, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-include-lines.md`,
          `# Documentation

Lines 1-4 from intro:

<!--@include: ./intro.md{1-4}-->

End of document.`,
        )

        const response = await fetch('http://localhost:17003/test-include-lines')
        const html = await response.text()

        // Should include first 4 lines
        expect(html).toContain('This is the introduction content from an external file')
        expect(html).toContain('Features')

        // Should NOT include content beyond line 4
        expect(html).not.toContain('Fast performance')
        expect(html).not.toContain('Easy to use')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-include-lines.md`, '')
      }
    })
  })

  describe('Region Inclusion', () => {
    it('should include specific region', async () => {
      const { server, stop } = await startServer({ port: 17004, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-include-region.md`,
          `# Documentation

## Installation

<!--@include: ./faq.md{#getting-started}-->

## More Info

<!--@include: ./faq.md{#advanced}-->`,
        )

        const response = await fetch('http://localhost:17004/test-include-region')
        const html = await response.text()

        // Should include getting-started region
        expect(html).toContain('Getting Started')
        // Code is now syntax-highlighted with spans, so check for tokens
        expect(html).toContain('npm')
        expect(html).toContain('install')
        expect(html).toContain('bunpress')

        // Should include advanced region
        expect(html).toContain('Advanced Usage')
        expect(html).toContain('see the documentation')

        // Should NOT include region markers
        expect(html).not.toContain('<!-- #region')
        expect(html).not.toContain('<!-- #endregion')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-include-region.md`, '')
      }
    })
  })

  describe('Nested Includes', () => {
    it('should support recursive includes', async () => {
      const { server, stop } = await startServer({ port: 17005, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-include-nested.md`,
          `# Main Document

<!--@include: ./nested-a.md-->

Done.`,
        )

        const response = await fetch('http://localhost:17005/test-include-nested')
        const html = await response.text()

        // Should include content from nested-a.md
        expect(html).toContain('Content from nested-a.md')
        expect(html).toContain('More content after include')

        // Should include content from nested-b.md (included by nested-a.md)
        expect(html).toContain('This is content from nested-b.md')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-include-nested.md`, '')
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle missing file gracefully', async () => {
      const { server, stop } = await startServer({ port: 17006, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-include-missing.md`,
          `# Document

<!--@include: ./nonexistent.md-->

Rest of document.`,
        )

        const response = await fetch('http://localhost:17006/test-include-missing')
        const html = await response.text()

        // Should render page without the missing include
        expect(html).toContain('Document')
        expect(html).toContain('Rest of document')
        expect(response.status).toBe(200)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-include-missing.md`, '')
      }
    })

    it('should handle invalid region gracefully', async () => {
      const { server, stop } = await startServer({ port: 17007, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-include-bad-region.md`,
          `# Document

<!--@include: ./faq.md{#nonexistent}-->

Rest of document.`,
        )

        const response = await fetch('http://localhost:17007/test-include-bad-region')
        const html = await response.text()

        // Should render page without the invalid region
        expect(html).toContain('Document')
        expect(html).toContain('Rest of document')
        expect(response.status).toBe(200)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-include-bad-region.md`, '')
      }
    })

    it('should prevent circular includes', async () => {
      const { server, stop } = await startServer({ port: 17008, root: TEST_MARKDOWN_DIR })

      try {
        // Create circular reference: circular-a.md includes circular-b.md
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/circular-a.md`,
          `Content A

<!--@include: ./circular-b.md-->`,
        )

        // circular-b.md includes circular-a.md (circular!)
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/circular-b.md`,
          `Content B

<!--@include: ./circular-a.md-->`,
        )

        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-include-circular.md`,
          `# Document

<!--@include: ./circular-a.md-->

Done.`,
        )

        const response = await fetch('http://localhost:17008/test-include-circular')
        const html = await response.text()

        // Should render without infinite loop
        expect(html).toContain('Content A')
        expect(html).toContain('Content B')
        expect(response.status).toBe(200)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-include-circular.md`, '')
        await Bun.write(`${TEST_MARKDOWN_DIR}/circular-a.md`, '')
        await Bun.write(`${TEST_MARKDOWN_DIR}/circular-b.md`, '')
      }
    })
  })

  describe('Integration with Other Features', () => {
    it('should process included markdown with other features', async () => {
      const { server, stop } = await startServer({ port: 17009, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/features.md`,
          `## Features :rocket:

- Fast <Badge type="tip" text="new" />
- Secure :lock:

\`\`\`js
console.log('Hello')
\`\`\``,
        )

        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-include-features.md`,
          `# Documentation

<!--@include: ./features.md-->

End.`,
        )

        const response = await fetch('http://localhost:17009/test-include-features')
        const html = await response.text()

        // Should process emojis in included content
        expect(html).toContain('🚀')
        expect(html).toContain('🔒')

        // Should process badges in included content
        expect(html).toContain('badge-tip')
        expect(html).toContain('new')

        // Should process code blocks in included content
        // Code is now syntax-highlighted with spans, so check for tokens
        expect(html).toContain('console')
        expect(html).toContain('log')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-include-features.md`, '')
        await Bun.write(`${TEST_MARKDOWN_DIR}/features.md`, '')
      }
    })

    it('should work with custom containers in included files', async () => {
      const { server, stop } = await startServer({ port: 17010, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/containers.md`,
          `::: tip
This is a tip from an included file.
:::`,
        )

        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-include-containers.md`,
          `# Guide

<!--@include: ./containers.md-->

Done.`,
        )

        const response = await fetch('http://localhost:17010/test-include-containers')
        const html = await response.text()

        // Should process containers in included content
        expect(html).toContain('custom-block')
        expect(html).toContain('This is a tip from an included file')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-include-containers.md`, '')
        await Bun.write(`${TEST_MARKDOWN_DIR}/containers.md`, '')
      }
    })
  })

  describe('Position and Formatting', () => {
    it('should preserve whitespace around includes', async () => {
      const { server, stop } = await startServer({ port: 17011, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-include-whitespace.md`,
          `# Document

Before include.

<!--@include: ./intro.md-->

After include.`,
        )

        const response = await fetch('http://localhost:17011/test-include-whitespace')
        const html = await response.text()

        // Should maintain document structure
        expect(html).toContain('Before include')
        expect(html).toContain('After include')
        expect(html).toContain('This is the introduction content')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-include-whitespace.md`, '')
      }
    })
  })
})
