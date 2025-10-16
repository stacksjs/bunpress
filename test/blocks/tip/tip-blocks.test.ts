import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { buildTestSite, readBuiltFile } from '../../utils/test-helpers'

describe('Tip Blocks', () => {
  const testDir = join(import.meta.dir, '..', '..', 'blocks', 'tip')

  test('should generate HTML with tip containers', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
      config: {
        markdown: {
          title: 'Tip Blocks Test',
          meta: {
            description: 'Comprehensive test of tip blocks',
            author: 'BunPress',
          },
        },
      },
    })

    expect(result.success).toBe(true)

    const generatedHtml = await readBuiltFile(result.outputs[0])

    // Check basic HTML structure
    expect(generatedHtml).toContain('<title>Tip Blocks Test</title>')
    expect(generatedHtml).toContain('Comprehensive test of tip blocks')
    expect(generatedHtml).toContain('BunPress')

    // Check that tip containers are present
    expect(generatedHtml).toContain('custom-block')
    expect(generatedHtml).toContain('tip')

    // Check for UnoCSS
    expect(generatedHtml).toContain('@unocss/runtime')
  })

  test('should process basic tip container correctly', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for basic tip container structure
    expect(html).toContain('<div class="custom-block tip">')
    expect(html).toContain('This is a basic tip container with default styling')
  })

  test('should process tip container with custom title', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for tip container with custom title
    expect(html).toContain('<p class="custom-block-title">Custom Tip Title</p>')
    expect(html).toContain('This tip container has a custom title specified')
  })

  test('should process tip container with emoji in title', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for tip container with emoji in title
    expect(html).toContain('<p class="custom-block-title">💡 Pro Tip</p>')
    expect(html).toContain('This tip container has a custom title with emoji')
  })

  test('should process tip container with multiple paragraphs', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for tip container with multiple paragraphs
    expect(html).toContain('<p class="custom-block-title">Important Information</p>')
    expect(html).toContain('This is the first paragraph in a tip container')
    expect(html).toContain('This is the second paragraph with more detailed information')
    expect(html).toContain('And here\'s a third paragraph with additional context')
  })

  test('should process tip container with code block', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for tip container with code block
    expect(html).toContain('<p class="custom-block-title">Code Example</p>')
    expect(html).toContain('Here\'s a code example inside a tip container:')
    expect(html).toContain('function greet(name)')
    // eslint-disable-next-line no-template-curly-in-string
    expect(html).toContain('return `Hello, ${name}!`')
  })

  test('should process tip container with list', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for tip container with list
    expect(html).toContain('<p class="custom-block-title">Best Practices</p>')
    expect(html).toContain('Here are some best practices:')
    expect(html).toContain('<li>Always validate user input</li>')
    expect(html).toContain('<li>Use descriptive variable names</li>')
    expect(html).toContain('<li>Write tests for your code</li>')
    expect(html).toContain('<li>Keep functions small and focused</li>')
  })

  test('should process tip container with links and emphasis', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for tip container with links and emphasis
    expect(html).toContain('<p class="custom-block-title">Helpful Resources</p>')
    expect(html).toContain('<strong>Important:</strong>')
    expect(html).toContain('<a href="/docs"')
    expect(html).toContain('documentation page')
    expect(html).toContain('<em>Note:</em>')
  })

  test('should handle nested tip containers', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for nested tip containers
    expect(html).toContain('<p class="custom-block-title">Outer Tip</p>')
    expect(html).toContain('<p class="custom-block-title">Nested Tip</p>')
    expect(html).toContain('This is a nested tip container')
    expect(html).toContain('Here\'s some more content in the outer tip')
  })

  test('should process tip container with special characters', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for tip container with special characters
    expect(html).toContain('Special Characters:')
    expect(html).toContain('!@#$%^&amp;*()_+-=[]{}|;:,.')
  })

  test('should process tip container with table', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for tip container with table
    expect(html).toContain('<p class="custom-block-title">Data Table</p>')
    expect(html).toContain('<table>')
    expect(html).toContain('<th>Feature</th>')
    expect(html).toContain('<th>Status</th>')
    expect(html).toContain('<th>Description</th>')
    expect(html).toContain('Basic Tip')
    expect(html).toContain('Custom Title')
    expect(html).toContain('Working')
  })

  test('should process tip container with blockquote', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for tip container with blockquote
    expect(html).toContain('<p class="custom-block-title">Quoted Content</p>')
    expect(html).toContain('<blockquote>')
    expect(html).toContain('This is a blockquote inside a tip container')
    expect(html).toContain('It can span multiple lines')
  })

  test('should process tip container with Unicode characters', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for tip container with Unicode characters
    expect(html).toContain('<p class="custom-block-title">🌟 Unicode Support</p>')
    expect(html).toContain('🚀✨💡🔥')
    expect(html).toContain('∑∆∞√∫')
    expect(html).toContain('αβγδεζηθικλμνξοπρστυφχψω')
    expect(html).toContain('你好世界')
    expect(html).toContain('مرحبا بالعالم')
  })
})
