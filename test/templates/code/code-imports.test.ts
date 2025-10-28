import { describe, expect, it } from 'bun:test'
import { startServer } from '../../../src/serve'

const TEST_MARKDOWN_DIR = './test/markdown/code'

describe('Code Imports from Files', () => {
  describe('Full File Import', () => {
    it('should import entire JavaScript file', async () => {
      const { server: _server, stop } = await startServer({ port: 12001, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-import-full-js.md`,
          `# Code Import Example\n\n<<< @/snippets/example.js`,
        )

        const response = await fetch('http://localhost:12001/test-import-full-js')
        const html = await response.text()

        // Should contain code from the file (syntax-highlighted with tokens)
        expect(html).toContain('export')
        expect(html).toContain('function')
        expect(html).toContain('greet')
        expect(html).toContain('add')
        expect(html).toContain('multiply')

        // Should have correct language class
        expect(html).toContain('class="language-javascript"')

        // Should not show the import syntax
        expect(html).not.toContain('<<< @/')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-import-full-js.md`, '')
      }
    })

    it('should import entire TypeScript file', async () => {
      const { server: _server, stop } = await startServer({ port: 12002, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-import-full-ts.md`,
          `# TypeScript Import\n\n<<< @/snippets/example.ts`,
        )

        const response = await fetch('http://localhost:12002/test-import-full-ts')
        const html = await response.text()

        // Syntax-highlighted with tokens
        expect(html).toContain('interface')
        expect(html).toContain('User')
        expect(html).toContain('validateEmail')
        expect(html).toContain('createUser')
        expect(html).toContain('class="language-typescript"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-import-full-ts.md`, '')
      }
    })

    it('should import entire Python file', async () => {
      const { server: _server, stop } = await startServer({ port: 12003, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-import-full-py.md`,
          `# Python Import\n\n<<< @/snippets/example.py`,
        )

        const response = await fetch('http://localhost:12003/test-import-full-py')
        const html = await response.text()

        expect(html).toContain('def greet(name):')
        expect(html).toContain('def multiply(a, b):')
        expect(html).toContain('class="language-python"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-import-full-py.md`, '')
      }
    })
  })

  describe('Line Range Import', () => {
    it('should import specific line range', async () => {
      const { server: _server, stop } = await startServer({ port: 12004, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-import-lines.md`,
          `# Line Range Import\n\n<<< @/snippets/example.js{2-4}`,
        )

        const response = await fetch('http://localhost:12004/test-import-lines')
        const html = await response.text()

        // Should contain lines 2-4 (greet function) - syntax-highlighted
        expect(html).toContain('export')
        expect(html).toContain('function')
        expect(html).toContain('greet')
        expect(html).toContain('name')
        expect(html).toContain('return')
        expect(html).toContain('Hello')

        // Should NOT contain other functions
        expect(html).not.toContain('export function add(a, b)')
        expect(html).not.toContain('export function multiply(a, b)')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-import-lines.md`, '')
      }
    })

    it('should import middle section with line range', async () => {
      const { server: _server, stop } = await startServer({ port: 12005, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-import-middle.md`,
          `# Middle Section Import\n\n<<< @/snippets/example.js{6-8}`,
        )

        const response = await fetch('http://localhost:12005/test-import-middle')
        const html = await response.text()

        // Should contain lines 6-8 (add function) - syntax-highlighted
        expect(html).toContain('export')
        expect(html).toContain('function')
        expect(html).toContain('add')
        expect(html).toContain('return')

        // Should NOT contain other parts
        expect(html).not.toContain('export function greet(name)')
        expect(html).not.toContain('export function multiply(a, b)')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-import-middle.md`, '')
      }
    })
  })

  describe('Region Import', () => {
    it('should import code from named region', async () => {
      const { server: _server, stop } = await startServer({ port: 12006, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-import-region.md`,
          `# Region Import\n\n<<< @/snippets/example.js#math`,
        )

        const response = await fetch('http://localhost:12006/test-import-region')
        const html = await response.text()

        // Should contain code from math region - syntax-highlighted
        expect(html).toContain('export')
        expect(html).toContain('function')
        expect(html).toContain('multiply')
        expect(html).toContain('divide')
        expect(html).toContain('Division')
        expect(html).toContain('zero')

        // Should NOT contain region markers
        expect(html).not.toContain('#region')
        expect(html).not.toContain('#endregion')

        // Should NOT contain code outside region
        expect(html).not.toContain('export function greet(name)')
        expect(html).not.toContain('export function subtract(a, b)')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-import-region.md`, '')
      }
    })

    it('should import TypeScript region', async () => {
      const { server: _server, stop } = await startServer({ port: 12007, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-import-ts-region.md`,
          `# TypeScript Region\n\n<<< @/snippets/example.ts#validation`,
        )

        const response = await fetch('http://localhost:12007/test-import-ts-region')
        const html = await response.text()

        expect(html).toContain('validateEmail')
        expect(html).toContain('validateUser')
        expect(html).toContain('emailRegex')

        // Should NOT contain code outside region
        expect(html).not.toContain('interface User')
        expect(html).not.toContain('createUser')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-import-ts-region.md`, '')
      }
    })

    it('should import Python region with // region syntax', async () => {
      const { server: _server, stop } = await startServer({ port: 12008, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-import-py-region.md`,
          `# Python Region\n\n<<< @/snippets/example.py#calculations`,
        )

        const response = await fetch('http://localhost:12008/test-import-py-region')
        const html = await response.text()

        expect(html).toContain('def multiply(a, b):')
        expect(html).toContain('def divide(a, b):')

        // Should NOT contain code outside region
        expect(html).not.toContain('def greet(name):')
        expect(html).not.toContain('def subtract(a, b):')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-import-py-region.md`, '')
      }
    })
  })

  describe('Multiple Imports', () => {
    it('should handle multiple imports in same file', async () => {
      const { server: _server, stop } = await startServer({ port: 12009, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-import-multiple.md`,
          `# Multiple Imports

## JavaScript Example

<<< @/snippets/example.js{2-4}

## TypeScript Example

<<< @/snippets/example.ts#validation

## Python Example

<<< @/snippets/example.py{2-5}`,
        )

        const response = await fetch('http://localhost:12009/test-import-multiple')
        const html = await response.text()

        // Should have all three imports - syntax-highlighted
        expect(html).toContain('export')
        expect(html).toContain('function')
        expect(html).toContain('greet')
        expect(html).toContain('validateEmail')
        expect(html).toContain('def')

        // Should have correct language classes
        expect(html).toContain('class="language-javascript"')
        expect(html).toContain('class="language-typescript"')
        expect(html).toContain('class="language-python"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-import-multiple.md`, '')
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle missing file gracefully', async () => {
      const { server: _server, stop } = await startServer({ port: 12010, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-import-missing.md`,
          `# Missing File\n\n<<< @/snippets/nonexistent.js`,
        )

        const response = await fetch('http://localhost:12010/test-import-missing')
        const html = await response.text()

        // Should render the page without the import
        expect(html).toContain('Missing File')
        expect(response.status).toBe(200)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-import-missing.md`, '')
      }
    })

    it('should handle invalid region gracefully', async () => {
      const { server: _server, stop } = await startServer({ port: 12011, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-import-invalid-region.md`,
          `# Invalid Region\n\n<<< @/snippets/example.js#nonexistent`,
        )

        const response = await fetch('http://localhost:12011/test-import-invalid-region')
        const html = await response.text()

        // Should render the page without the import
        expect(html).toContain('Invalid Region')
        expect(response.status).toBe(200)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-import-invalid-region.md`, '')
      }
    })
  })

  describe('Integration with Other Features', () => {
    it('should work with line highlighting', async () => {
      const { server: _server, stop } = await startServer({ port: 12012, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-import-highlight.md`,
          `# Import with Highlighting\n\nImported code can use other features:\n\n<<< @/snippets/example.js{2-8}`,
        )

        const response = await fetch('http://localhost:12012/test-import-highlight')
        const html = await response.text()

        // Should import the code - syntax-highlighted
        expect(html).toContain('export')
        expect(html).toContain('function')
        expect(html).toContain('greet')
        expect(html).toContain('add')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-import-highlight.md`, '')
      }
    })

    it('should work with multiple imports forming a code group', async () => {
      const { server: _server, stop } = await startServer({ port: 12013, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-import-code-group.md`,
          `# Multiple Imports

## JavaScript Example
<<< @/snippets/example.js{2-4}

## TypeScript Example
<<< @/snippets/example.ts{8-12}

## Python Example
<<< @/snippets/example.py{2-5}`,
        )

        const response = await fetch('http://localhost:12013/test-import-code-group')
        const html = await response.text()

        // Should have imported code from all three files - syntax-highlighted
        expect(html).toContain('export')
        expect(html).toContain('function')
        expect(html).toContain('greet')
        expect(html).toContain('validateEmail')
        expect(html).toContain('def')

        // Should have correct language classes
        expect(html).toContain('class="language-javascript"')
        expect(html).toContain('class="language-typescript"')
        expect(html).toContain('class="language-python"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-import-code-group.md`, '')
      }
    })
  })

  describe('Mixed with Regular Content', () => {
    it('should work alongside regular markdown and code blocks', async () => {
      const { server: _server, stop } = await startServer({ port: 12014, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-import-mixed.md`,
          `# Mixed Content

Regular paragraph here.

## Inline Code

\`\`\`js
const inline = 'code'
\`\`\`

## Imported Code

<<< @/snippets/example.js#math

## More Content

Another paragraph.`,
        )

        const response = await fetch('http://localhost:12014/test-import-mixed')
        const html = await response.text()

        // Should have regular content
        expect(html).toContain('Regular paragraph here')
        expect(html).toContain('Another paragraph')

        // Should have inline code (syntax-highlighted)
        expect(html).toContain('const')
        expect(html).toContain('inline')
        expect(html).toContain('code')

        // Should have imported code - syntax-highlighted
        expect(html).toContain('export')
        expect(html).toContain('function')
        expect(html).toContain('multiply')

        // Should have headings
        expect(html).toContain('Inline Code')
        expect(html).toContain('Imported Code')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-import-mixed.md`, '')
      }
    })
  })
})
