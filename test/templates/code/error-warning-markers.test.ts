import { describe, expect, it } from 'bun:test'
import { startServer } from '../../../src/serve'

const TEST_MARKDOWN_DIR = './test/markdown/code'

describe('Code Block Error/Warning Markers', () => {
  describe('Error Markers', () => {
    it('should mark error lines with // [!code error]', async () => {
      const { server, stop } = await startServer({ port: 10001, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-error-single.md`,
          '```js\nconst a = 1\nconst b = undefined.foo // [!code error]\nconst c = 3\n```',
        )

        const response = await fetch('http://localhost:10001/test-error-single')
        const html = await response.text()

        expect(html).toContain('has-error')
        expect(html).not.toContain('[!code error]')
        expect(html).toContain('const b = undefined.foo')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-error-single.md`, '')
      }
    })

    it('should mark multiple error lines', async () => {
      const { server, stop } = await startServer({ port: 10002, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-error-multiple.md`,
          '```js\nconst a = null.value // [!code error]\nconst b = 2\nconst c = undefined.foo // [!code error]\n```',
        )

        const response = await fetch('http://localhost:10002/test-error-multiple')
        const html = await response.text()

        // Count error markers in span elements (not CSS)
        const errorCount = (html.match(/<span[^>]*has-error/g) || []).length
        expect(errorCount).toBe(2)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-error-multiple.md`, '')
      }
    })
  })

  describe('Warning Markers', () => {
    it('should mark warning lines with // [!code warning]', async () => {
      const { server, stop } = await startServer({ port: 10003, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-warning-single.md`,
          '```js\nconst a = 1\nvar b = 2 // [!code warning]\nconst c = 3\n```',
        )

        const response = await fetch('http://localhost:10003/test-warning-single')
        const html = await response.text()

        expect(html).toContain('has-warning')
        expect(html).not.toContain('[!code warning]')
        expect(html).toContain('var b = 2')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-warning-single.md`, '')
      }
    })

    it('should mark multiple warning lines', async () => {
      const { server, stop } = await startServer({ port: 10004, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-warning-multiple.md`,
          '```js\nvar a = 1 // [!code warning]\nconst b = 2\nvar c = 3 // [!code warning]\nvar d = 4 // [!code warning]\n```',
        )

        const response = await fetch('http://localhost:10004/test-warning-multiple')
        const html = await response.text()

        // Count warning markers in span elements (not CSS)
        const warningCount = (html.match(/<span[^>]*has-warning/g) || []).length
        expect(warningCount).toBe(3)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-warning-multiple.md`, '')
      }
    })
  })

  describe('Mixed Error and Warning', () => {
    it('should handle both errors and warnings', async () => {
      const { server, stop } = await startServer({ port: 10005, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-error-warning-mixed.md`,
          '```js\nconst a = 1\nvar b = 2 // [!code warning]\nconst c = null.prop // [!code error]\nconst d = 4\n```',
        )

        const response = await fetch('http://localhost:10005/test-error-warning-mixed')
        const html = await response.text()

        expect(html).toContain('has-error')
        expect(html).toContain('has-warning')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-error-warning-mixed.md`, '')
      }
    })
  })

  describe('Error/Warning with Other Features', () => {
    it('should combine error with line highlighting', async () => {
      const { server, stop } = await startServer({ port: 10006, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-error-highlight.md`,
          '```js{2}\nconst a = 1\nconst b = null.value // [!code error]\nconst c = 3\n```',
        )

        const response = await fetch('http://localhost:10006/test-error-highlight')
        const html = await response.text()

        expect(html).toContain('highlighted')
        expect(html).toContain('has-error')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-error-highlight.md`, '')
      }
    })

    it('should combine warning with line numbers', async () => {
      const { server, stop } = await startServer({ port: 10007, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-warning-line-numbers.md`,
          '```js:line-numbers\nconst a = 1\nvar b = 2 // [!code warning]\nconst c = 3\n```',
        )

        const response = await fetch('http://localhost:10007/test-warning-line-numbers')
        const html = await response.text()

        expect(html).toContain('line-numbers-mode')
        expect(html).toContain('has-warning')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-warning-line-numbers.md`, '')
      }
    })

    it('should combine error/warning with diff markers', async () => {
      const { server, stop } = await startServer({ port: 10008, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-error-diff.md`,
          '```js\nconst a = 1 // [!code ++] // [!code warning]\nconst b = null.foo // [!code --] // [!code error]\nconst c = 3\n```',
        )

        const response = await fetch('http://localhost:10008/test-error-diff')
        const html = await response.text()

        expect(html).toContain('diff-add')
        expect(html).toContain('diff-remove')
        expect(html).toContain('has-error')
        expect(html).toContain('has-warning')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-error-diff.md`, '')
      }
    })
  })

  describe('Different Languages', () => {
    it('should support error markers for TypeScript', async () => {
      const { server, stop } = await startServer({ port: 10009, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-error-ts.md`,
          '```ts\nconst num: string = 123 // [!code error]\nconst str: string = "hello"\n```',
        )

        const response = await fetch('http://localhost:10009/test-error-ts')
        const html = await response.text()

        expect(html).toContain('class="language-ts"')
        expect(html).toContain('has-error')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-error-ts.md`, '')
      }
    })

    it('should support warning markers for Python', async () => {
      const { server, stop } = await startServer({ port: 10010, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-warning-python.md`,
          '```python\ndef test(): // [!code warning]\n    pass\n```',
        )

        const response = await fetch('http://localhost:10010/test-warning-python')
        const html = await response.text()

        expect(html).toContain('class="language-python"')
        expect(html).toContain('has-warning')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-warning-python.md`, '')
      }
    })
  })

  describe('All Features Combined', () => {
    it('should combine all code features including error/warning', async () => {
      const { server, stop } = await startServer({ port: 10011, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-all-features-with-errors.md`,
          '```js{4}:line-numbers\nconst a = 1 // [!code ++]\nvar b = 2 // [!code warning] // [!code focus]\nconst c = null.prop // [!code error]\nconst d = 4 // [!code --]\n```',
        )

        const response = await fetch('http://localhost:10011/test-all-features-with-errors')
        const html = await response.text()

        expect(html).toContain('line-numbers-mode')
        expect(html).toContain('has-focused-lines')
        expect(html).toContain('diff-add')
        expect(html).toContain('diff-remove')
        expect(html).toContain('has-error')
        expect(html).toContain('has-warning')
        expect(html).toContain('highlighted')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-all-features-with-errors.md`, '')
      }
    })
  })
})
