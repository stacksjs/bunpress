import { describe, expect, test } from 'bun:test'
import { assertHtmlContains, buildTestSite, cleanupTestDirectory, createTestMarkdown, readBuiltFile } from './utils/test-helpers'

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
        files: [{ path: 'test.md', content }],
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
        files: [{ path: 'test.md', content }],
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
        files: [{ path: 'test.md', content }],
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
        files: [{ path: 'test.md', content }],
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
        files: [{ path: 'test.md', content }],
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
        files: [{ path: 'test.md', content }],
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
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, '❤️')).toBe(true)
      expect(assertHtmlContains(html, '👍')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test.skip('should handle emoji in headings', async () => {
      const content = createTestMarkdown(`
# Getting Started :rocket:

This guide will help you get started :sparkles:.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
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
        files: [{ path: 'test.md', content }],
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
        files: [{ path: 'test.md', content }],
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
        files: [{ path: 'test.md', content }],
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
        files: [{ path: 'test.md', content }],
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
        files: [{ path: 'test.md', content }],
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
        files: [{ path: 'test.md', content }],
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
    test.skip('should highlight specific lines in code blocks', async () => {
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
        files: [{ path: 'test.md', content }],
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

    test.skip('should support line numbers with highlighting', async () => {
      const content = createTestMarkdown(`
# Test Page

\`\`\`ts:line-numbers {2}
const line1 = 'line 1'
const line2 = 'line 2' // highlighted
const line3 = 'line 3'
\`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
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

    test.skip('should highlight single line', async () => {
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
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'line-highlight')).toBe(true)
      expect(assertHtmlContains(html, 'hljs-keyword')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test.skip('should highlight range of lines', async () => {
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
        files: [{ path: 'test.md', content }],
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

  describe('GitHub-style Callouts', () => {
    test('should render NOTE callouts with GitHub syntax', async () => {
      const content = createTestMarkdown(`
# Test Page

> [!NOTE]
> This is a note callout using GitHub syntax.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'markdown-alert')).toBe(true)
      expect(assertHtmlContains(html, 'markdown-alert-note')).toBe(true)
      expect(assertHtmlContains(html, 'markdown-alert-title')).toBe(true)
      expect(assertHtmlContains(html, 'octicon octicon-info')).toBe(true)
      expect(assertHtmlContains(html, 'This is a note callout using GitHub syntax.')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should render TIP callouts with GitHub syntax', async () => {
      const content = createTestMarkdown(`
# Test Page

> [!TIP]
> This is a tip callout using GitHub syntax.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'markdown-alert-tip')).toBe(true)
      expect(assertHtmlContains(html, 'octicon octicon-light-bulb')).toBe(true)
      expect(assertHtmlContains(html, 'This is a tip callout using GitHub syntax.')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should render IMPORTANT callouts with GitHub syntax', async () => {
      const content = createTestMarkdown(`
# Test Page

> [!IMPORTANT]
> This is an important callout using GitHub syntax.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'markdown-alert-important')).toBe(true)
      expect(assertHtmlContains(html, 'octicon octicon-report')).toBe(true)
      expect(assertHtmlContains(html, 'This is an important callout using GitHub syntax.')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should render WARNING callouts with GitHub syntax', async () => {
      const content = createTestMarkdown(`
# Test Page

> [!WARNING]
> This is a warning callout using GitHub syntax.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'markdown-alert-warning')).toBe(true)
      expect(assertHtmlContains(html, 'octicon octicon-alert')).toBe(true)
      expect(assertHtmlContains(html, 'This is a warning callout using GitHub syntax.')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should render CAUTION callouts with GitHub syntax', async () => {
      const content = createTestMarkdown(`
# Test Page

> [!CAUTION]
> This is a caution callout using GitHub syntax.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'markdown-alert-caution')).toBe(true)
      expect(assertHtmlContains(html, 'octicon octicon-stop')).toBe(true)
      expect(assertHtmlContains(html, 'This is a caution callout using GitHub syntax.')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should handle multi-line content in GitHub callouts', async () => {
      const content = createTestMarkdown(`
# Test Page

> [!NOTE]
> This is a multi-line note callout.
>
> It contains **bold text** and *italic text*.
>
> - Item 1
> - Item 2
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'markdown-alert-note')).toBe(true)
      expect(assertHtmlContains(html, 'multi-line note callout')).toBe(true)
      expect(assertHtmlContains(html, '<strong>bold text</strong>')).toBe(true)
      expect(assertHtmlContains(html, '<em>italic text</em>')).toBe(true)
      expect(assertHtmlContains(html, 'Item 1')).toBe(true)
      expect(assertHtmlContains(html, 'Item 2')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })
  })

  describe('Alternative Syntax Callouts', () => {
    test('should render Note callouts with alternative syntax', async () => {
      const content = createTestMarkdown(`
# Test Page

> **Note**
> This is a note callout using alternative syntax.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'markdown-alert')).toBe(true)
      expect(assertHtmlContains(html, 'markdown-alert-note')).toBe(true)
      expect(assertHtmlContains(html, 'markdown-alert-title')).toBe(true)
      expect(assertHtmlContains(html, 'octicon octicon-info')).toBe(true)
      expect(assertHtmlContains(html, 'This is a note callout using alternative syntax.')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should render Tip callouts with alternative syntax', async () => {
      const content = createTestMarkdown(`
# Test Page

> **Tip**
> This is a tip callout using alternative syntax.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'markdown-alert-tip')).toBe(true)
      expect(assertHtmlContains(html, 'octicon octicon-light-bulb')).toBe(true)
      expect(assertHtmlContains(html, 'This is a tip callout using alternative syntax.')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should render Important callouts with alternative syntax', async () => {
      const content = createTestMarkdown(`
# Test Page

> **Important**
> This is an important callout using alternative syntax.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'markdown-alert-important')).toBe(true)
      expect(assertHtmlContains(html, 'octicon octicon-report')).toBe(true)
      expect(assertHtmlContains(html, 'This is an important callout using alternative syntax.')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should render Warning callouts with alternative syntax', async () => {
      const content = createTestMarkdown(`
# Test Page

> **Warning**
> This is a warning callout using alternative syntax.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'markdown-alert-warning')).toBe(true)
      expect(assertHtmlContains(html, 'octicon octicon-alert')).toBe(true)
      expect(assertHtmlContains(html, 'This is a warning callout using alternative syntax.')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should render Caution callouts with alternative syntax', async () => {
      const content = createTestMarkdown(`
# Test Page

> **Caution**
> This is a caution callout using alternative syntax.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'markdown-alert-caution')).toBe(true)
      expect(assertHtmlContains(html, 'octicon octicon-stop')).toBe(true)
      expect(assertHtmlContains(html, 'This is a caution callout using alternative syntax.')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should handle case variations in alternative syntax', async () => {
      const content = createTestMarkdown(`
# Test Page

> **note**
> Lowercase note.

> **TIP**
> Uppercase tip.

> **Warning**
> Mixed case warning.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'markdown-alert-note')).toBe(true)
      expect(assertHtmlContains(html, 'markdown-alert-tip')).toBe(true)
      expect(assertHtmlContains(html, 'markdown-alert-warning')).toBe(true)
      expect(assertHtmlContains(html, 'Lowercase note.')).toBe(true)
      expect(assertHtmlContains(html, 'Uppercase tip.')).toBe(true)
      expect(assertHtmlContains(html, 'Mixed case warning.')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should handle multi-line content in alternative syntax', async () => {
      const content = createTestMarkdown(`
# Test Page

> **Important**
> This is a multi-line important callout.
>
> It contains \`inline code\` and other formatting.
>
> 1. Numbered item 1
> 2. Numbered item 2
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'markdown-alert-important')).toBe(true)
      expect(assertHtmlContains(html, 'multi-line important callout')).toBe(true)
      expect(assertHtmlContains(html, '<code>inline code</code>')).toBe(true)
      expect(assertHtmlContains(html, 'Numbered item 1')).toBe(true)
      expect(assertHtmlContains(html, 'Numbered item 2')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })
  })

  describe('Mixed Callout Syntaxes', () => {
    test('should handle both GitHub and alternative syntax in same document', async () => {
      const content = createTestMarkdown(`
# Test Page

> [!NOTE]
> GitHub-style note callout.

> **Warning**
> Alternative syntax warning callout.

> [!TIP]
> GitHub-style tip callout.

> **Important**
> Alternative syntax important callout.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])

      // Check GitHub-style callouts
      expect(assertHtmlContains(html, 'GitHub-style note callout.')).toBe(true)
      expect(assertHtmlContains(html, 'GitHub-style tip callout.')).toBe(true)

      // Check alternative syntax callouts
      expect(assertHtmlContains(html, 'Alternative syntax warning callout.')).toBe(true)
      expect(assertHtmlContains(html, 'Alternative syntax important callout.')).toBe(true)

      // Verify they all use the same class structure
      expect((html.match(/markdown-alert-note/g) || []).length).toBe(1)
      expect((html.match(/markdown-alert-warning/g) || []).length).toBe(1)
      expect((html.match(/markdown-alert-tip/g) || []).length).toBe(1)
      expect((html.match(/markdown-alert-important/g) || []).length).toBe(1)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should preserve regular blockquotes alongside callouts', async () => {
      const content = createTestMarkdown(`
# Test Page

> This is a regular blockquote that should not be converted.

> [!NOTE]
> This is a GitHub-style callout.

> This is another regular blockquote.

> **Warning**
> This is an alternative syntax callout.

> Yet another regular blockquote.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])

      // Check that regular blockquotes are preserved
      expect(assertHtmlContains(html, '<blockquote>')).toBe(true)
      expect(assertHtmlContains(html, 'This is a regular blockquote that should not be converted.')).toBe(true)
      expect(assertHtmlContains(html, 'This is another regular blockquote.')).toBe(true)
      expect(assertHtmlContains(html, 'Yet another regular blockquote.')).toBe(true)

      // Check that callouts are converted
      expect(assertHtmlContains(html, 'markdown-alert-note')).toBe(true)
      expect(assertHtmlContains(html, 'markdown-alert-warning')).toBe(true)
      expect(assertHtmlContains(html, 'This is a GitHub-style callout.')).toBe(true)
      expect(assertHtmlContains(html, 'This is an alternative syntax callout.')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should handle callouts with code blocks', async () => {
      const content = createTestMarkdown(`
# Test Page

> [!TIP]
> You can include code blocks in callouts:
>
> \`\`\`javascript
> function greet(name) {
>   return \`Hello, \${name}!\`
> }
> \`\`\`

> **Note**
> Alternative syntax also supports code:
>
> \`\`\`bash
> npm install bunpress
> \`\`\`
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])

      // Check callout structure
      expect(assertHtmlContains(html, 'markdown-alert-tip')).toBe(true)
      expect(assertHtmlContains(html, 'markdown-alert-note')).toBe(true)

      // Check code blocks
      expect(assertHtmlContains(html, 'function greet(name)')).toBe(true)
      expect(assertHtmlContains(html, 'npm install bunpress')).toBe(true)
      expect(assertHtmlContains(html, 'language-javascript')).toBe(true)
      expect(assertHtmlContains(html, 'language-bash')).toBe(true)

      // Clean up test directory
      const testDir = result.outputs[0].replace(/\/[^/]*$/, '').replace(/\/dist$/, '')
      await cleanupTestDirectory(testDir)
    })

    test('should apply consistent CSS styling to both syntaxes', async () => {
      const content = createTestMarkdown(`
# Test Page

> [!NOTE]
> GitHub syntax note.

> **Note**
> Alternative syntax note.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])

      // Both should have the same CSS classes and structure
      expect((html.match(/markdown-alert-note/g) || []).length).toBe(2)
      expect((html.match(/markdown-alert-title/g) || []).length).toBe(2)
      expect((html.match(/octicon octicon-info/g) || []).length).toBe(2)

      // Check CSS styles are included
      expect(assertHtmlContains(html, '.markdown-alert {')).toBe(true)
      expect(assertHtmlContains(html, '.markdown-alert-note {')).toBe(true)
      expect(assertHtmlContains(html, '--alert-bg:')).toBe(true)
      expect(assertHtmlContains(html, '--alert-border:')).toBe(true)

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
        files: [{ path: 'test.md', content }],
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
        files: [{ path: 'test.md', content }],
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
