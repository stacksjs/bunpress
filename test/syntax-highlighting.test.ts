import { describe, expect, test } from 'bun:test'
import { assertHtmlContains, buildTestSite, createTestMarkdown, readBuiltFile } from './utils/test-helpers'

describe('Syntax Highlighting', () => {
  describe('Shiki Integration', () => {
    test('should highlight TypeScript code', async () => {
      const content = createTestMarkdown(`
# Test Page

\`\`\`ts
interface User {
  name: string
  age: number
}

const user: User = {
  name: 'John',
  age: 30
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`
}
\`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'language-ts')).toBe(true)
      expect(assertHtmlContains(html, 'shiki')).toBe(true)
      expect(assertHtmlContains(html, 'interface User')).toBe(true)
      expect(assertHtmlContains(html, 'const user')).toBe(true)
    })

    test('should highlight JavaScript code', async () => {
      const content = createTestMarkdown(`
# Test Page

\`\`\`js
const { readFile } = require('fs').promises

async function readConfig() {
  try {
    const config = await readFile('./config.json', 'utf8')
    return JSON.parse(config)
  } catch (error) {
    console.error('Failed to read config:', error)
    return {}
  }
}
\`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'language-js')).toBe(true)
      expect(assertHtmlContains(html, 'const { readFile }')).toBe(true)
      expect(assertHtmlContains(html, 'async function')).toBe(true)
    })

    test('should highlight multiple languages', async () => {
      const content = createTestMarkdown(`
# Test Page

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\`

\`\`\`css
.highlighted {
  background-color: yellow;
  padding: 0.5em;
}

.error {
  color: red;
  font-weight: bold;
}
\`\`\`

\`\`\`bash
#!/bin/bash
echo "Building project..."
npm run build
echo "Build completed!"
\`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'language-python')).toBe(true)
      expect(assertHtmlContains(html, 'language-css')).toBe(true)
      expect(assertHtmlContains(html, 'language-bash')).toBe(true)
      expect(assertHtmlContains(html, 'def fibonacci')).toBe(true)
      expect(assertHtmlContains(html, 'background-color')).toBe(true)
      expect(assertHtmlContains(html, 'npm run build')).toBe(true)
    })

    test('should support custom themes', async () => {
      const content = createTestMarkdown(`
# Test Page

\`\`\`ts
const greeting = 'Hello, World!'
console.log(greeting)
\`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
        config: {
          markdown: {
            // @ts-expect-error - theme property for testing
            theme: 'dark-plus',
          },
        },
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'shiki-theme-dark-plus')).toBe(true)
      expect(assertHtmlContains(html, 'const greeting')).toBe(true)
    })

    test('should handle unknown languages gracefully', async () => {
      const content = createTestMarkdown(`
# Test Page

\`\`\`unknownlang
some code in unknown language
more lines here
\`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'language-unknownlang')).toBe(true)
      expect(assertHtmlContains(html, 'some code in unknown language')).toBe(true)
    })
  })

  describe('Copy to Clipboard', () => {
    test('should add copy button to code blocks', async () => {
      const content = createTestMarkdown(`
# Test Page

\`\`\`ts
const message = 'Hello, World!'
console.log(message)
\`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'copy-code-btn')).toBe(true)
      expect(assertHtmlContains(html, 'copy-button')).toBe(true)
      expect(assertHtmlContains(html, 'Copy')).toBe(true)
    })

    test('should copy code content to clipboard', async () => {
      const content = createTestMarkdown(`
# Test Page

\`\`\`js
function test() {
  return 'copied content'
}
\`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'clipboard-copy')).toBe(true)
      expect(assertHtmlContains(html, 'data-clipboard-text')).toBe(true)
      expect(assertHtmlContains(html, 'function test()')).toBe(true)
    })

    test('should show copy feedback', async () => {
      const content = createTestMarkdown(`
# Test Page

\`\`\`python
print("Hello, World!")
\`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'copy-success')).toBe(true)
      expect(assertHtmlContains(html, 'copy-feedback')).toBe(true)
    })

    test('should handle copy errors gracefully', async () => {
      const content = createTestMarkdown(`
# Test Page

\`\`\`sql
SELECT * FROM users WHERE active = 1
\`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'copy-error')).toBe(true)
      expect(assertHtmlContains(html, 'copy-failed')).toBe(true)
    })
  })

  describe('Line Numbers', () => {
    test('should add line numbers to code blocks', async () => {
      const content = createTestMarkdown(`
# Test Page

\`\`\`ts:line-numbers
function hello() {
  console.log('Hello')
  console.log('World')
}
\`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'line-numbers')).toBe(true)
      expect(assertHtmlContains(html, 'line-number')).toBe(true)
      expect(assertHtmlContains(html, 'function hello()')).toBe(true)
    })

    test('should start line numbers from custom number', async () => {
      const content = createTestMarkdown(`
# Test Page

\`\`\`js:line-numbers=10
console.log('line 10')
console.log('line 11')
console.log('line 12')
\`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'line-numbers')).toBe(true)
      expect(assertHtmlContains(html, 'start="10"')).toBe(true)
      expect(assertHtmlContains(html, 'console.log(\'line 10\')')).toBe(true)
    })

    test('should combine line numbers with highlighting', async () => {
      const content = createTestMarkdown(`
# Test Page

\`\`\`python:line-numbers {2,4}
def func1():
  print("line 1")
  print("line 2")  # highlighted
  print("line 3")
  print("line 4")  # highlighted
\`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'line-numbers')).toBe(true)
      expect(assertHtmlContains(html, 'line-highlight')).toBe(true)
      expect(assertHtmlContains(html, 'print("line 2")')).toBe(true)
    })
  })

  describe('Code Block Features', () => {
    test('should add filename to code blocks', async () => {
      const content = createTestMarkdown(`
# Test Page

\`\`\`ts [config.ts]
interface Config {
  port: number
  host: string
}
\`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'code-filename')).toBe(true)
      expect(assertHtmlContains(html, 'config.ts')).toBe(true)
      expect(assertHtmlContains(html, 'interface Config')).toBe(true)
    })

    test('should handle code block titles', async () => {
      const content = createTestMarkdown(`
# Test Page

\`\`\`js:title=example.js
console.log('Hello from example.js')
\`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'code-title')).toBe(true)
      expect(assertHtmlContains(html, 'example.js')).toBe(true)
    })

    test('should support diff highlighting', async () => {
      const content = createTestMarkdown(`
# Test Page

\`\`\`diff
+ const newFeature = 'added'
- const oldFeature = 'removed'
  const unchanged = 'same'
\`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'language-diff')).toBe(true)
      expect(assertHtmlContains(html, 'diff-add')).toBe(true)
      expect(assertHtmlContains(html, 'diff-remove')).toBe(true)
      expect(assertHtmlContains(html, '+ const newFeature')).toBe(true)
      expect(assertHtmlContains(html, '- const oldFeature')).toBe(true)
    })
  })

  describe('Theme Integration', () => {
    test('should apply light theme by default', async () => {
      const content = createTestMarkdown(`
# Test Page

\`\`\`ts
const theme = 'light'
\`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'shiki-theme-light')).toBe(true)
      expect(assertHtmlContains(html, 'light-mode')).toBe(true)
    })

    test('should apply dark theme when specified', async () => {
      const content = createTestMarkdown(`
# Test Page

\`\`\`ts
const theme = 'dark'
\`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
        config: {
          markdown: {
            // @ts-expect-error - codeTheme property for testing
            codeTheme: 'dark',
          },
        },
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'shiki-theme-dark')).toBe(true)
      expect(assertHtmlContains(html, 'dark-mode')).toBe(true)
    })

    test('should support theme switching', async () => {
      const content = createTestMarkdown(`
# Test Page

\`\`\`js
console.log('theme switch test')
\`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'theme-switcher')).toBe(true)
      expect(assertHtmlContains(html, 'data-theme')).toBe(true)
    })
  })

  describe('Performance', () => {
    test('should cache highlighted code blocks', async () => {
      const content = createTestMarkdown(`
# Test Page

\`\`\`ts
const cached = 'This should be cached'
\`\`\`

Some content here.

\`\`\`ts
const cached = 'This should be cached'
\`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'cached-highlight')).toBe(true)
      expect(assertHtmlContains(html, 'cache-hit')).toBe(true)
    })

    test('should handle large code blocks efficiently', async () => {
      const largeCode = Array.from({ length: 100 }, (_, i) =>
        `console.log('Line ${i + 1}')`).join('\n')

      const content = createTestMarkdown(`
# Test Page

\`\`\`js
${largeCode}
\`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'large-code-block')).toBe(true)
      expect(assertHtmlContains(html, 'virtual-scroll')).toBe(true)
    })
  })
})
