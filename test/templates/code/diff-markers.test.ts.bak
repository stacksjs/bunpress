import { describe, expect, it } from 'bun:test'
import { startServer } from '../../../src/serve'

const TEST_MARKDOWN_DIR = './test/markdown/code'

describe('Code Block Diff Markers', () => {
  describe('Added Lines', () => {
    it('should mark added lines with // [!code ++]', async () => {
      const { server, stop } = await startServer({ port: 9001, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-diff-add.md`,
          '```js\nconst a = 1\nconst b = 2 // [!code ++]\nconst c = 3\n```',
        )

        const response = await fetch('http://localhost:9001/test-diff-add')
        const html = await response.text()

        // Should have diff-add class
        expect(html).toContain('class="diff-add"')

        // Should not display the marker
        expect(html).not.toContain('[!code ++]')

        // Should contain the code
        expect(html).toContain('const b = 2')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-diff-add.md`, '')
      }
    })

    it('should mark multiple added lines', async () => {
      const { server, stop } = await startServer({ port: 9002, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-diff-add-multiple.md`,
          '```js\nconst a = 1 // [!code ++]\nconst b = 2\nconst c = 3 // [!code ++]\nconst d = 4\n```',
        )

        const response = await fetch('http://localhost:9002/test-diff-add-multiple')
        const html = await response.text()

        // Should have 2 diff-add classes
        const diffAddCount = (html.match(/class="diff-add"/g) || []).length
        expect(diffAddCount).toBe(2)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-diff-add-multiple.md`, '')
      }
    })
  })

  describe('Removed Lines', () => {
    it('should mark removed lines with // [!code --]', async () => {
      const { server, stop } = await startServer({ port: 9003, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-diff-remove.md`,
          '```js\nconst a = 1\nconst b = 2 // [!code --]\nconst c = 3\n```',
        )

        const response = await fetch('http://localhost:9003/test-diff-remove')
        const html = await response.text()

        // Should have diff-remove class
        expect(html).toContain('class="diff-remove"')

        // Should not display the marker
        expect(html).not.toContain('[!code --]')

        // Should contain the code
        expect(html).toContain('const b = 2')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-diff-remove.md`, '')
      }
    })

    it('should mark multiple removed lines', async () => {
      const { server, stop } = await startServer({ port: 9004, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-diff-remove-multiple.md`,
          '```js\nconst a = 1 // [!code --]\nconst b = 2\nconst c = 3 // [!code --]\nconst d = 4 // [!code --]\n```',
        )

        const response = await fetch('http://localhost:9004/test-diff-remove-multiple')
        const html = await response.text()

        // Should have 3 diff-remove classes
        const diffRemoveCount = (html.match(/class="diff-remove"/g) || []).length
        expect(diffRemoveCount).toBe(3)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-diff-remove-multiple.md`, '')
      }
    })
  })

  describe('Mixed Diff Markers', () => {
    it('should handle both added and removed lines', async () => {
      const { server, stop } = await startServer({ port: 9005, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-diff-mixed.md`,
          '```js\nconst a = 1\nconst old = 2 // [!code --]\nconst new = 3 // [!code ++]\nconst b = 4\n```',
        )

        const response = await fetch('http://localhost:9005/test-diff-mixed')
        const html = await response.text()

        // Should have both diff-add and diff-remove
        expect(html).toContain('class="diff-add"')
        expect(html).toContain('class="diff-remove"')

        // Should not display markers
        expect(html).not.toContain('[!code ++]')
        expect(html).not.toContain('[!code --]')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-diff-mixed.md`, '')
      }
    })
  })

  describe('Diff with Line Highlighting', () => {
    it('should combine diff-add with line highlighting', async () => {
      const { server, stop } = await startServer({ port: 9006, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-diff-highlight.md`,
          '```js{2}\nconst a = 1\nconst b = 2 // [!code ++]\nconst c = 3\n```',
        )

        const response = await fetch('http://localhost:9006/test-diff-highlight')
        const html = await response.text()

        // Line 2 should have both highlighted and diff-add
        expect(html).toContain('class="highlighted diff-add"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-diff-highlight.md`, '')
      }
    })
  })

  describe('Diff with Line Numbers', () => {
    it('should combine diff markers with line numbers', async () => {
      const { server, stop } = await startServer({ port: 9007, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-diff-line-numbers.md`,
          '```js:line-numbers\nconst a = 1\nconst b = 2 // [!code ++]\nconst c = 3 // [!code --]\n```',
        )

        const response = await fetch('http://localhost:9007/test-diff-line-numbers')
        const html = await response.text()

        // Should have line numbers mode
        expect(html).toContain('line-numbers-mode')

        // Should have diff markers
        expect(html).toContain('class="diff-add"')
        expect(html).toContain('class="diff-remove"')

        // Should have line numbers
        expect(html).toContain('class="line-number"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-diff-line-numbers.md`, '')
      }
    })
  })

  describe('Diff with Focus', () => {
    it('should combine diff markers with focus', async () => {
      const { server, stop } = await startServer({ port: 9008, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-diff-focus.md`,
          '```js\nconst a = 1\nconst b = 2 // [!code ++] // [!code focus]\nconst c = 3\n```',
        )

        const response = await fetch('http://localhost:9008/test-diff-focus')
        const html = await response.text()

        // Should have both focused and diff-add
        expect(html).toContain('class="focused diff-add"')

        // Other lines should be dimmed
        expect(html).toContain('class="dimmed"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-diff-focus.md`, '')
      }
    })
  })

  describe('Different Languages', () => {
    it('should support diff for TypeScript', async () => {
      const { server, stop } = await startServer({ port: 9009, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-diff-ts.md`,
          '```ts\ninterface User {\n  name: string // [!code ++]\n  age: number // [!code --]\n}\n```',
        )

        const response = await fetch('http://localhost:9009/test-diff-ts')
        const html = await response.text()

        expect(html).toContain('class="language-ts"')
        expect(html).toContain('class="diff-add"')
        expect(html).toContain('class="diff-remove"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-diff-ts.md`, '')
      }
    })

    it('should support diff for Python', async () => {
      const { server, stop } = await startServer({ port: 9010, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-diff-python.md`,
          '```python\ndef hello(): // [!code ++]\n    print("Hello")\n    return False // [!code --]\n```',
        )

        const response = await fetch('http://localhost:9010/test-diff-python')
        const html = await response.text()

        expect(html).toContain('class="language-python"')
        expect(html).toContain('class="diff-add"')
        expect(html).toContain('class="diff-remove"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-diff-python.md`, '')
      }
    })
  })

  describe('Consecutive Diff Lines', () => {
    it('should handle consecutive added lines', async () => {
      const { server, stop } = await startServer({ port: 9011, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-diff-consecutive-add.md`,
          '```js\nconst a = 1\nconst b = 2 // [!code ++]\nconst c = 3 // [!code ++]\nconst d = 4 // [!code ++]\nconst e = 5\n```',
        )

        const response = await fetch('http://localhost:9011/test-diff-consecutive-add')
        const html = await response.text()

        // Should have 3 diff-add lines
        const diffAddCount = (html.match(/class="diff-add"/g) || []).length
        expect(diffAddCount).toBe(3)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-diff-consecutive-add.md`, '')
      }
    })

    it('should handle consecutive removed lines', async () => {
      const { server, stop } = await startServer({ port: 9012, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-diff-consecutive-remove.md`,
          '```js\nconst a = 1\nconst b = 2 // [!code --]\nconst c = 3 // [!code --]\nconst d = 4\n```',
        )

        const response = await fetch('http://localhost:9012/test-diff-consecutive-remove')
        const html = await response.text()

        // Should have 2 diff-remove lines
        const diffRemoveCount = (html.match(/class="diff-remove"/g) || []).length
        expect(diffRemoveCount).toBe(2)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-diff-consecutive-remove.md`, '')
      }
    })
  })

  describe('Marker Removal', () => {
    it('should properly remove diff markers from code', async () => {
      const { server, stop } = await startServer({ port: 9013, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-diff-removal.md`,
          '```js\nconst test = "value" // [!code ++]\nconst old = "removed" // [!code --]\n```',
        )

        const response = await fetch('http://localhost:9013/test-diff-removal')
        const html = await response.text()

        // Should contain the code without trailing spaces or markers
        expect(html).toContain('const test = &quot;value&quot;')
        expect(html).toContain('const old = &quot;removed&quot;')
        expect(html).not.toContain('[!code ++]')
        expect(html).not.toContain('[!code --]')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-diff-removal.md`, '')
      }
    })
  })

  describe('Multiple Code Blocks', () => {
    it('should handle multiple code blocks with different diff patterns', async () => {
      const { server, stop } = await startServer({ port: 9014, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-diff-multiple-blocks.md`,
          '```js\nconst a = 1 // [!code ++]\nconst b = 2\n```\n\nText\n\n```ts\nconst c = 3 // [!code --]\nconst d = 4\n```',
        )

        const response = await fetch('http://localhost:9014/test-diff-multiple-blocks')
        const html = await response.text()

        // Should have both diff types
        expect(html).toContain('class="diff-add"')
        expect(html).toContain('class="diff-remove"')

        // Should have both languages
        expect(html).toContain('class="language-js"')
        expect(html).toContain('class="language-ts"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-diff-multiple-blocks.md`, '')
      }
    })
  })

  describe('All Features Combined', () => {
    it('should combine highlighting, line numbers, focus, and diff markers', async () => {
      const { server, stop } = await startServer({ port: 9015, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-diff-all-features.md`,
          '```js{3}:line-numbers\nconst a = 1 // [!code --]\nconst b = 2 // [!code focus]\nconst c = 3 // [!code ++]\nconst d = 4\n```',
        )

        const response = await fetch('http://localhost:9015/test-diff-all-features')
        const html = await response.text()

        // Should have line numbers
        expect(html).toContain('line-numbers-mode')

        // Should have focus
        expect(html).toContain('has-focused-lines')

        // Should have diff markers (may be combined with other classes)
        expect(html).toContain('diff-add')
        expect(html).toContain('diff-remove')

        // Should have highlighted line
        expect(html).toContain('highlighted')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-diff-all-features.md`, '')
      }
    })
  })
})
