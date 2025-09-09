import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { buildTestSite, readBuiltFile } from '../../utils/test-helpers'

describe('Use Case: Markdown Extensions Example', () => {
  const testCase = 'markdown-extensions-example'
  const testDir = '/Users/mac/repos/stacks-org/bunpress/test/use-cases/markdown-extensions-example'

  test('should process custom containers correctly', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Info container
    expect(html).toContain('info custom-block')
    expect(html).toContain('This is an informational message')

    // Tip container
    expect(html).toContain('tip custom-block')
    expect(html).toContain('💡 **Pro tip:**')

    // Warning container
    expect(html).toContain('warning custom-block')
    expect(html).toContain('⚠️ **Warning:**')

    // Danger container
    expect(html).toContain('danger custom-block')
    expect(html).toContain('🚨 **Danger:**')
  })

  test('should convert emoji shortcodes to Unicode', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Emoji conversion
    expect(html).toContain('❤️') // :heart:
    expect(html).toContain('👍') // :thumbsup:
    expect(html).toContain('🚀') // :rocket:
    expect(html).toContain('✨') // :sparkles:
    expect(html).toContain('😊') // :smile:
  })

  test('should process emoji in headings', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Emoji in headings should be processed
    expect(html).toContain('<h2')
    expect(html).toContain('Getting Started')
    expect(html).toContain('🚀')
  })

  test('should render math equations correctly', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Inline math
    expect(html).toContain('<span class="math inline">')
    expect(html).toContain('E = mc^2')

    // Block math
    expect(html).toContain('<div class="math block">')
    expect(html).toContain('x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}')
  })

  test('should highlight code blocks with syntax highlighting', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Code blocks should be present
    expect(html).toContain('<pre')
    expect(html).toContain('<code')

    // TypeScript code
    expect(html).toContain('interface User')
    expect(html).toContain('const user: User')

    // JavaScript code
    expect(html).toContain('function greet')
    expect(html).toContain('console.log(greet(\'World\'))')

    // Syntax highlighting classes
    expect(html).toContain('language-typescript')
    expect(html).toContain('language-javascript')
  })

  test('should process line highlighting in code blocks', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Line highlighting should be present
    expect(html).toContain('line-highlight')
    expect(html).toContain('// This line is highlighted')
    expect(html).toContain('const sum = x + y')
    expect(html).toContain('return sum * 2')
  })

  test('should include copy-to-clipboard functionality', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Copy functionality should be included
    expect(html).toContain('copy-code-btn')
    expect(html).toContain('copyToClipboard')
    expect(html).toContain('Copy')
    expect(html).toContain('code-block-container')
  })

  test('should process markdown formatting correctly', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Basic markdown formatting
    expect(html).toContain('<strong>')
    expect(html).toContain('<em>')

    // Headings
    expect(html).toContain('<h1')
    expect(html).toContain('<h2')
    expect(html).toContain('<h3')

    // Links and other elements
    expect(html).toContain('<p>')
  })

  test('should generate proper heading anchors', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Heading anchors should be generated
    expect(html).toContain('id="custom-containers"')
    expect(html).toContain('id="emoji-support"')
    expect(html).toContain('id="math-equations"')
    expect(html).toContain('id="code-highlighting"')
  })

  test('should include proper HTML structure and metadata', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // HTML structure
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('<html')
    expect(html).toContain('<head>')
    expect(html).toContain('<body>')
    expect(html).toContain('data-layout="doc"')

    // Meta tags
    expect(html).toContain('<title>Markdown Extensions Example</title>')
    expect(html).toContain('Showcasing enhanced markdown processing features')
    expect(html).toContain('BunPress Team')

    // CSS and JS includes
    expect(html).toContain('<style>')
    expect(html).toContain('<script>')
    expect(html).toContain('@unocss/runtime')
  })

  test('should handle complex markdown combinations', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Complex combinations should work together
    // Emoji in containers
    expect(html).toContain('tip custom-block')
    expect(html).toContain('💡')

    // Math in text
    expect(html).toContain('E = mc^2')
    expect(html).toContain('<span class="math inline">')

    // Code with highlighting
    expect(html).toContain('language-js')
    expect(html).toContain('line-highlight')

    // All features should coexist without conflicts
    expect(html).toContain('Markdown Extensions Showcase')
    expect(html).toContain('custom-block')
    expect(html).toContain('math')
    expect(html).toContain('code-block-container')
  })
})
