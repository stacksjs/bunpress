import { describe, expect, it } from 'bun:test'
import { startServer } from '../../../src/serve'

const TEST_MARKDOWN_DIR = './test/markdown/code'

describe('Code Block Focus Markers', () => {
  describe('Basic Focus', () => {
    it('should focus a single line with // [!code focus]', async () => {
      const { server, stop } = await startServer({ port: 8001, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-focus-single.md`,
          '```js\nconst a = 1\nconst b = 2 // [!code focus]\nconst c = 3\n```',
        )

        const response = await fetch('http://localhost:8001/test-focus-single')
        const html = await response.text()

        // Should have has-focused-lines class
        expect(html).toContain('has-focused-lines')

        // Should have focused class
        expect(html).toContain('class="focused"')

        // Should have dimmed classes for non-focused lines
        expect(html).toContain('class="dimmed"')

        // Should not display the marker comment
        expect(html).not.toContain('[!code focus]')

        // Should contain the code content
        expect(html).toContain('const b = 2')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-focus-single.md`, '')
      }
    })

    it('should focus multiple lines', async () => {
      const { server, stop } = await startServer({ port: 8002, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-focus-multiple.md`,
          '```js\nconst a = 1 // [!code focus]\nconst b = 2\nconst c = 3 // [!code focus]\nconst d = 4\n```',
        )

        const response = await fetch('http://localhost:8002/test-focus-multiple')
        const html = await response.text()

        // Should have 2 focused lines
        const focusedCount = (html.match(/class="focused"/g) || []).length
        expect(focusedCount).toBe(2)

        // Should have 2 dimmed lines
        const dimmedCount = (html.match(/class="dimmed"/g) || []).length
        expect(dimmedCount).toBe(2)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-focus-multiple.md`, '')
      }
    })
  })

  describe('Focus without Dimming', () => {
    it('should not add dimmed class when no focus markers', async () => {
      const { server, stop } = await startServer({ port: 8003, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-no-focus.md`,
          '```js\nconst a = 1\nconst b = 2\nconst c = 3\n```',
        )

        const response = await fetch('http://localhost:8003/test-no-focus')
        const html = await response.text()

        // Should NOT have has-focused-lines class
        expect(html).not.toContain('has-focused-lines')

        // Should NOT have focused or dimmed classes
        expect(html).not.toContain('class="focused"')
        expect(html).not.toContain('class="dimmed"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-no-focus.md`, '')
      }
    })
  })

  describe('Focus with Line Highlighting', () => {
    it('should combine focus and line highlighting', async () => {
      const { server, stop } = await startServer({ port: 8004, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-focus-highlight.md`,
          '```js{2}\nconst a = 1\nconst b = 2 // [!code focus]\nconst c = 3\n```',
        )

        const response = await fetch('http://localhost:8004/test-focus-highlight')
        const html = await response.text()

        // Line 2 should have both focused and highlighted classes
        expect(html).toContain('class="highlighted focused"')

        // Should have dimmed lines
        expect(html).toContain('class="dimmed"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-focus-highlight.md`, '')
      }
    })

    it('should handle focus on highlighted ranges', async () => {
      const { server, stop } = await startServer({ port: 8005, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-focus-highlight-range.md`,
          '```js{2-3}\nconst a = 1\nconst b = 2 // [!code focus]\nconst c = 3\nconst d = 4\n```',
        )

        const response = await fetch('http://localhost:8005/test-focus-highlight-range')
        const html = await response.text()

        // Line 2 should have both highlighted and focused
        expect(html).toContain('class="highlighted focused"')

        // Line 3 should only have highlighted and dimmed
        expect(html).toContain('class="highlighted dimmed"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-focus-highlight-range.md`, '')
      }
    })
  })

  describe('Focus with Line Numbers', () => {
    it('should combine focus with line numbers', async () => {
      const { server, stop } = await startServer({ port: 8006, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-focus-line-numbers.md`,
          '```js:line-numbers\nconst a = 1\nconst b = 2 // [!code focus]\nconst c = 3\n```',
        )

        const response = await fetch('http://localhost:8006/test-focus-line-numbers')
        const html = await response.text()

        // Should have both classes
        expect(html).toContain('line-numbers-mode has-focused-lines')

        // Should have line numbers
        expect(html).toContain('class="line-number"')

        // Should have focused and dimmed
        expect(html).toContain('class="focused"')
        expect(html).toContain('class="dimmed"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-focus-line-numbers.md`, '')
      }
    })
  })

  describe('Different Languages', () => {
    it('should support focus for TypeScript', async () => {
      const { server, stop } = await startServer({ port: 8007, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-focus-ts.md`,
          '```ts\ninterface User {\n  name: string // [!code focus]\n  age: number\n}\n```',
        )

        const response = await fetch('http://localhost:8007/test-focus-ts')
        const html = await response.text()

        expect(html).toContain('class="language-ts"')
        expect(html).toContain('has-focused-lines')
        expect(html).toContain('class="focused"')
        expect(html).not.toContain('[!code focus]')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-focus-ts.md`, '')
      }
    })

    it('should support focus for Python', async () => {
      const { server, stop } = await startServer({ port: 8008, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-focus-python.md`,
          '```python\ndef hello(): // [!code focus]\n    print("Hello")\n    return True\n```',
        )

        const response = await fetch('http://localhost:8008/test-focus-python')
        const html = await response.text()

        expect(html).toContain('class="language-python"')
        expect(html).toContain('has-focused-lines')

        // VitePress uses // for markers regardless of language
        // Should not display the marker comment
        expect(html).not.toContain('[!code focus]')
        expect(html).toContain('def hello()')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-focus-python.md`, '')
      }
    })
  })

  describe('Consecutive Focused Lines', () => {
    it('should handle multiple consecutive focused lines', async () => {
      const { server, stop } = await startServer({ port: 8009, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-focus-consecutive.md`,
          '```js\nconst a = 1\nconst b = 2 // [!code focus]\nconst c = 3 // [!code focus]\nconst d = 4 // [!code focus]\nconst e = 5\n```',
        )

        const response = await fetch('http://localhost:8009/test-focus-consecutive')
        const html = await response.text()

        // Should have 3 focused lines
        const focusedCount = (html.match(/class="focused"/g) || []).length
        expect(focusedCount).toBe(3)

        // Should have 2 dimmed lines
        const dimmedCount = (html.match(/class="dimmed"/g) || []).length
        expect(dimmedCount).toBe(2)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-focus-consecutive.md`, '')
      }
    })
  })

  describe('All Lines Focused', () => {
    it('should handle when all lines are focused', async () => {
      const { server, stop } = await startServer({ port: 8010, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-focus-all.md`,
          '```js\nconst a = 1 // [!code focus]\nconst b = 2 // [!code focus]\nconst c = 3 // [!code focus]\n```',
        )

        const response = await fetch('http://localhost:8010/test-focus-all')
        const html = await response.text()

        // Should have 3 focused lines
        const focusedCount = (html.match(/class="focused"/g) || []).length
        expect(focusedCount).toBe(3)

        // Should have NO dimmed lines
        const dimmedCount = (html.match(/class="dimmed"/g) || []).length
        expect(dimmedCount).toBe(0)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-focus-all.md`, '')
      }
    })
  })

  describe('Marker Removal', () => {
    it('should properly remove focus marker from code', async () => {
      const { server, stop } = await startServer({ port: 8011, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-focus-removal.md`,
          '```js\nconst test = "value" // [!code focus]\n```',
        )

        const response = await fetch('http://localhost:8011/test-focus-removal')
        const html = await response.text()

        // Should contain the code without trailing spaces or marker
        expect(html).toContain('const test = &quot;value&quot;')
        expect(html).not.toContain('// [!code focus]')
        expect(html).not.toContain('[!code focus]')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-focus-removal.md`, '')
      }
    })
  })

  describe('Multiple Blocks', () => {
    it('should handle multiple code blocks with different focus patterns', async () => {
      const { server, stop } = await startServer({ port: 8012, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-focus-multiple-blocks.md`,
          '```js\nconst a = 1 // [!code focus]\nconst b = 2\n```\n\nText\n\n```ts\ninterface Test {}\nconst x = 1\n```',
        )

        const response = await fetch('http://localhost:8012/test-focus-multiple-blocks')
        const html = await response.text()

        // First block should have focused lines
        const hasFocusedCount = (html.match(/has-focused-lines/g) || []).length
        expect(hasFocusedCount).toBe(1)

        // Should have both languages
        expect(html).toContain('class="language-js"')
        expect(html).toContain('class="language-ts"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-focus-multiple-blocks.md`, '')
      }
    })
  })
})
