import { describe, expect, test } from 'bun:test'
import { createTestMarkdown, buildTestSite, readBuiltFile, assertHtmlContains, cleanupTestDirectory } from './utils/test-helpers'

describe('Markdown Extensions', () => {
  describe('Custom Containers', () => {
    test('should render info containers', async () => {
      const content = createTestMarkdown(`
# Test Page

::: info
This is an info box.
:::
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'custom-block')).toBe(true)
      expect(assertHtmlContains(html, 'info')).toBe(true)
      expect(assertHtmlContains(html, 'This is an info box.')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should render tip containers', async () => {
      const content = createTestMarkdown(`
# Test Page

::: tip
This is a tip.
:::
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'custom-block')).toBe(true)
      expect(assertHtmlContains(html, 'tip')).toBe(true)
      expect(assertHtmlContains(html, 'This is a tip.')).toBe(true)
    })

    test('should render warning containers', async () => {
      const content = createTestMarkdown(`
# Test Page

::: warning
This is a warning.
:::
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'custom-block')).toBe(true)
      expect(assertHtmlContains(html, 'warning')).toBe(true)
      expect(assertHtmlContains(html, 'This is a warning.')).toBe(true)
    })

    test('should render danger containers', async () => {
      const content = createTestMarkdown(`
# Test Page

::: danger
This is a dangerous warning.
:::
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'custom-block')).toBe(true)
      expect(assertHtmlContains(html, 'danger')).toBe(true)
      expect(assertHtmlContains(html, 'This is a dangerous warning.')).toBe(true)
    })

    test('should render details containers', async () => {
      const content = createTestMarkdown(`
# Test Page

::: details
This is a details block.
:::
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, '<details>')).toBe(true)
      expect(assertHtmlContains(html, '<summary>')).toBe(true)
      expect(assertHtmlContains(html, 'This is a details block.')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should render containers with custom titles', async () => {
      const content = createTestMarkdown(`
# Test Page

::: info Custom Title
This is an info box with custom title.
:::
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'custom-block-title')).toBe(true)
      expect(assertHtmlContains(html, 'Custom Title')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })
  })

  describe('Emoji Support', () => {
    test('should convert emoji shortcodes to unicode', async () => {
      const content = createTestMarkdown(`
# Test Page

I :heart: VuePress and :thumbsup: this feature!
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, '❤️')).toBe(true)
      expect(assertHtmlContains(html, '👍')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should handle emoji in headings', async () => {
      const content = createTestMarkdown(`
# Getting Started :rocket:

This guide will help you get started :sparkles:.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, '🚀')).toBe(true)
      expect(assertHtmlContains(html, '✨')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should handle multiple emoji in same line', async () => {
      const content = createTestMarkdown(`
# Test Page

:smile: :heart: :thumbsup: :rocket: :sparkles:
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, '😊')).toBe(true)
      expect(assertHtmlContains(html, '❤️')).toBe(true)
      expect(assertHtmlContains(html, '👍')).toBe(true)
      expect(assertHtmlContains(html, '🚀')).toBe(true)
      expect(assertHtmlContains(html, '✨')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should preserve text around emoji', async () => {
      const content = createTestMarkdown(`
# Test Page

Welcome to our docs :wave: and enjoy the ride :rocket:!
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'Welcome to our docs')).toBe(true)
      expect(assertHtmlContains(html, '👋')).toBe(true)
      expect(assertHtmlContains(html, 'and enjoy the ride')).toBe(true)
      expect(assertHtmlContains(html, '🚀')).toBe(true)
    })
  })

  describe('Math Equations', () => {
    test('should render inline math expressions', async () => {
      const content = createTestMarkdown(`
# Test Page

When $a \\ne 0$, there are two solutions to $(ax^2 + bx + c = 0)$.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'math')).toBe(true)
      expect(assertHtmlContains(html, 'inline')).toBe(true)
      expect(assertHtmlContains(html, 'a \\ne 0')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should render block math expressions', async () => {
      const content = createTestMarkdown(`
# Test Page

The quadratic formula is:

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'math')).toBe(true)
      expect(assertHtmlContains(html, 'block')).toBe(true)
      expect(assertHtmlContains(html, 'quadratic formula')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should render complex math expressions', async () => {
      const content = createTestMarkdown(`
# Test Page

$$\\nabla \\times \\vec{\\mathbf{B}} - \\frac{1}{c} \\frac{\\partial\\vec{\\mathbf{E}}}{\\partial t} = \\frac{4\\pi}{c}\\vec{\\mathbf{j}}$$
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'math')).toBe(true)
      expect(assertHtmlContains(html, 'nabla')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should handle mixed inline and block math', async () => {
      const content = createTestMarkdown(`
# Test Page

Einstein's famous equation is $E = mc^2$.

The full equation is:

$$E = \\sqrt{(mc^2)^2 + (pc)^2}$$
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'E = mc^2')).toBe(true)
      expect(assertHtmlContains(html, 'Einstein')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })
  })

  describe('Line Highlighting', () => {
    test('should highlight specific lines in code blocks', async () => {
      const content = createTestMarkdown(`
# Test Page

\`\`\`ts {1,3-5}
const a = 1  // highlighted
const b = 2  // not highlighted
const c = 3  // highlighted
const d = 4  // highlighted
const e = 5  // highlighted
\`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'line-highlight')).toBe(true)
      expect(assertHtmlContains(html, 'hljs-keyword')).toBe(true)
      expect(assertHtmlContains(html, 'language-ts')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should support line numbers with highlighting', async () => {
      const content = createTestMarkdown(`
# Test Page

\`\`\`ts:line-numbers {2}
const line1 = 'line 1'
const line2 = 'line 2' // highlighted
const line3 = 'line 3'
\`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'line-numbers')).toBe(true)
      expect(assertHtmlContains(html, 'line-highlight')).toBe(true)
      expect(assertHtmlContains(html, 'hljs-keyword')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should highlight single line', async () => {
      const content = createTestMarkdown(`
# Test Page

\`\`\`js {3}
function test() {
  console.log('line 1')
  console.log('line 2') // highlighted
  console.log('line 3')
}
\`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'line-highlight')).toBe(true)
      expect(assertHtmlContains(html, 'hljs-keyword')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should highlight range of lines', async () => {
      const content = createTestMarkdown(`
# Test Page

\`\`\`python {1-3,5}
def hello():
  print("line 1")  # highlighted
  print("line 2")  # highlighted
  print("line 3")  # highlighted
  print("line 4")  # not highlighted
  print("line 5")  # highlighted
\`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'line-highlight')).toBe(true)
      expect(assertHtmlContains(html, 'hljs-keyword')).toBe(true)
      expect(assertHtmlContains(html, 'language-python')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })
  })

  describe('Combined Extensions', () => {
    test('should handle emoji in containers', async () => {
      const content = createTestMarkdown(`
# Test Page

::: tip :bulb:
This is a tip with emoji :thumbsup:!
:::
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'custom-block')).toBe(true)
      expect(assertHtmlContains(html, 'tip')).toBe(true)
      expect(assertHtmlContains(html, 'bulb')).toBe(true)
      expect(assertHtmlContains(html, 'thumbsup')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should handle math in containers', async () => {
      const content = createTestMarkdown(`
# Test Page

::: info
The formula $E = mc^2$ is very important.

$$F = ma$$
:::
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'custom-block')).toBe(true)
      expect(assertHtmlContains(html, 'math')).toBe(true)
      expect(assertHtmlContains(html, 'E = mc^2')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })
  })
})
