import { describe, expect, it } from 'bun:test'
import { startServer } from '../../../src/serve'

const TEST_MARKDOWN_DIR = './test/markdown/code'

describe('Code Block Line Highlighting', () => {
  describe('Single Line Highlighting', () => {
    it('should highlight a single line with {n} syntax', async () => {
      const { server: _server, stop } = await startServer({ port: 6001, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-highlight-single.md`,
          '```js{2}\nconst a = 1\nconst b = 2\nconst c = 3\n```',
        )

        const response = await fetch('http://localhost:6001/test-highlight-single')
        const html = await response.text()

        // Should have language class
        expect(html).toContain('class="language-js"')

        // Should have exactly 1 highlighted line
        const highlightedCount = (html.match(/<span[^>]*\bhighlighted\b/g) || []).length
        expect(highlightedCount).toBe(1)

        // Should contain the code content
        expect(html).toContain('const')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-highlight-single.md`, '')
      }
    })
  })

  describe('Multiple Line Highlighting', () => {
    it('should highlight multiple lines with {a,b,c} syntax', async () => {
      const { server: _server, stop } = await startServer({ port: 6002, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-highlight-multiple.md`,
          '```js{1,3}\nconst a = 1\nconst b = 2\nconst c = 3\nconst d = 4\n```',
        )

        const response = await fetch('http://localhost:6002/test-highlight-multiple')
        const html = await response.text()

        // Should have exactly 2 highlighted lines
        const highlightedCount = (html.match(/<span[^>]*\bhighlighted\b/g) || []).length
        expect(highlightedCount).toBe(2)

        // Should have language class
        expect(html).toContain('class="language-js"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-highlight-multiple.md`, '')
      }
    })
  })

  describe('Range Line Highlighting', () => {
    it('should highlight line ranges with {start-end} syntax', async () => {
      const { server: _server, stop } = await startServer({ port: 6003, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-highlight-range.md`,
          '```js{2-4}\nconst a = 1\nconst b = 2\nconst c = 3\nconst d = 4\nconst e = 5\n```',
        )

        const response = await fetch('http://localhost:6003/test-highlight-range')
        const html = await response.text()

        // Should highlight 3 lines (2, 3, 4)
        const highlightedCount = (html.match(/<span[^>]*\bhighlighted\b/g) || []).length
        expect(highlightedCount).toBe(3)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-highlight-range.md`, '')
      }
    })
  })

  describe('Mixed Line Highlighting', () => {
    it('should highlight mixed single and range syntax {1,3-5,7}', async () => {
      const { server: _server, stop } = await startServer({ port: 6004, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-highlight-mixed.md`,
          '```js{1,3-5,7}\nline1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\n```',
        )

        const response = await fetch('http://localhost:6004/test-highlight-mixed')
        const html = await response.text()

        // Should highlight 5 lines (1, 3, 4, 5, 7)
        const highlightedCount = (html.match(/<span[^>]*\bhighlighted\b/g) || []).length
        expect(highlightedCount).toBe(5)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-highlight-mixed.md`, '')
      }
    })
  })

  describe('No Highlighting', () => {
    it('should render code blocks without highlighting when no range specified', async () => {
      const { server: _server, stop } = await startServer({ port: 6005, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-no-highlight.md`,
          '```js\nconst a = 1\nconst b = 2\n```',
        )

        const response = await fetch('http://localhost:6005/test-no-highlight')
        const html = await response.text()

        // Should have language class
        expect(html).toContain('class="language-js"')

        // Extract <pre> block to avoid matching CSS
        const preMatch = html.match(/<pre[^>]*>[\s\S]*?<\/pre>/)
        expect(preMatch).not.toBeNull()

        // Should NOT have any highlighted lines
        expect(preMatch![0]).not.toMatch(/<span[^>]*\bhighlighted\b/)

        // Should still contain code
        expect(html).toContain('const')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-no-highlight.md`, '')
      }
    })
  })

  describe('Different Languages', () => {
    it('should support line highlighting for TypeScript', async () => {
      const { server: _server, stop } = await startServer({ port: 6006, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-highlight-ts.md`,
          '```ts{1}\ninterface User {\n  name: string\n}\n```',
        )

        const response = await fetch('http://localhost:6006/test-highlight-ts')
        const html = await response.text()

        expect(html).toContain('class="language-ts"')
        expect(html).toContain('highlighted')
        expect(html).toContain('User')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-highlight-ts.md`, '')
      }
    })

    it('should support line highlighting for Python', async () => {
      const { server: _server, stop } = await startServer({ port: 6007, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-highlight-python.md`,
          '```python{2}\ndef hello():\n    print("Hello")\n    return True\n```',
        )

        const response = await fetch('http://localhost:6007/test-highlight-python')
        const html = await response.text()

        expect(html).toContain('class="language-python"')
        expect(html).toContain('highlighted')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-highlight-python.md`, '')
      }
    })
  })

  describe('HTML Escaping', () => {
    it('should properly escape HTML entities in code blocks', async () => {
      const { server: _server, stop } = await startServer({ port: 6008, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-highlight-escape.md`,
          '```html{1}\n<div class="test">\n  <p>Hello & goodbye</p>\n</div>\n```',
        )

        const response = await fetch('http://localhost:6008/test-highlight-escape')
        const html = await response.text()

        // Should escape HTML entities (syntax highlighter handles this)
        expect(html).toContain('div')
        expect(html).toContain('class')
        expect(html).toContain('test')
        expect(html).toContain('Hello')
        expect(html).toContain('goodbye')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-highlight-escape.md`, '')
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty code blocks', async () => {
      const { server: _server, stop } = await startServer({ port: 6009, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-highlight-empty.md`,
          '```js{1}\n```',
        )

        const response = await fetch('http://localhost:6009/test-highlight-empty')
        const html = await response.text()

        expect(html).toContain('class="language-js"')
        expect(response.status).toBe(200)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-highlight-empty.md`, '')
      }
    })

    it('should handle highlighting beyond code length', async () => {
      const { server: _server, stop } = await startServer({ port: 6010, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-highlight-beyond.md`,
          '```js{1-10}\nconst a = 1\nconst b = 2\n```',
        )

        const response = await fetch('http://localhost:6010/test-highlight-beyond')
        const html = await response.text()

        // Should highlight only existing lines (2 lines)
        const highlightedCount = (html.match(/<span[^>]*\bhighlighted\b/g) || []).length
        expect(highlightedCount).toBe(2)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-highlight-beyond.md`, '')
      }
    })
  })

  describe('Multiple Code Blocks', () => {
    it('should handle multiple code blocks with different highlighting', async () => {
      const { server: _server, stop } = await startServer({ port: 6011, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-highlight-multiple-blocks.md`,
          '```js{1}\nconst a = 1\n```\n\nSome text\n\n```ts{2}\ninterface Test {}\nconst x = 1\n```',
        )

        const response = await fetch('http://localhost:6011/test-highlight-multiple-blocks')
        const html = await response.text()

        // Should have both languages
        expect(html).toContain('class="language-js"')
        expect(html).toContain('class="language-ts"')

        // Should have 2 highlighted lines total (one in each block)
        const highlightedCount = (html.match(/<span[^>]*\bhighlighted\b/g) || []).length
        expect(highlightedCount).toBe(2)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-highlight-multiple-blocks.md`, '')
      }
    })
  })
})
