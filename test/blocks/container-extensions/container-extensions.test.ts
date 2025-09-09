import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { buildTestSite, readBuiltFile } from '../../utils/test-helpers'

describe('Container Extensions (Blocks)', () => {
  const testDir = join(import.meta.dir, '..', '..', 'blocks', 'container-extensions')

  test('should generate HTML with all container types', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
      config: {
        markdown: {
          title: 'Container Extensions Test',
          meta: {
            description: 'Comprehensive test of container extensions',
            author: 'BunPress',
          },
        },
      },
    })

    expect(result.success).toBe(true)

    const generatedHtml = await readBuiltFile(result.outputs[0])

    // Check basic HTML structure
    expect(generatedHtml).toContain('<title>Container Extensions Test</title>')
    expect(generatedHtml).toContain('Comprehensive test of container extensions')
    expect(generatedHtml).toContain('BunPress')

    // Check that all container types are present (note: containers are processed but content may vary)
    expect(generatedHtml).toContain('custom-block')
    expect(generatedHtml).toContain('info')
    expect(generatedHtml).toContain('tip')
    expect(generatedHtml).toContain('warning')
    expect(generatedHtml).toContain('danger')
    expect(generatedHtml).toContain('note')

    // Check for UnoCSS
    expect(generatedHtml).toContain('@unocss/runtime')
  })

  test('should process info containers correctly', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for info container structure (some containers work, some don't due to processing order)
    expect(html).toContain('<div class="custom-block info">')
    // Note: Content inside containers may not be fully processed due to current implementation limitations
    expect(html).toContain('This is a basic info container')
  })

  test('should process tip containers correctly', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for tip container structure
    expect(html).toContain('<div class="custom-block tip">')
    expect(html).toContain('This is a tip container that provides helpful advice')

    // Check for nested containers in tip
    expect(html).toContain('Nested Warning')
    expect(html).toContain('This warning is nested inside a tip container.')
  })

  test('should process warning containers correctly', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for warning container structure
    expect(html).toContain('<div class="custom-block warning">')
    expect(html).toContain('This is a warning container that alerts users to potential issues')

    // Check for special characters in warning (note: some characters get HTML encoded)
    expect(html).toContain('Special Characters: @#$%^&')
    expect(html).toContain('<em>()</em>')
  })

  test('should process danger containers correctly', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for danger container structure
    expect(html).toContain('<div class="custom-block danger">')
    expect(html).toContain('This is a danger container that warns about critical issues')

    // Check for HTML entities
    expect(html).toContain('&lt; less than')
    expect(html).toContain('&gt; greater than')
    expect(html).toContain('&amp; ampersand')
  })

  test('should process details containers correctly', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for details container structure (note: details containers use <details> tag)
    expect(html).toContain('<details>')
    expect(html).toContain('This is a details container that can be collapsed/expanded')

    // Check for long content in details
    expect(html).toContain('Sed ut perspiciatis unde omnis iste natus')
    expect(html).toContain('Nemo enim ipsam voluptatem quia voluptas')
  })

  test('should handle custom container types', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for custom container type (note)
    expect(html).toContain('<div class="note custom-block">')
    expect(html).toContain('<p class="custom-block-title">NOTE</p>')
    expect(html).toContain('This is a custom container type that doesn\'t have specific styling')
  })

  test('should process containers with various content types', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for code blocks inside containers
    expect(html).toContain('function greet(name)')
    expect(html).toContain('return `Hello, ${name}!`')

    // Check for lists inside containers
    expect(html).toContain('Always validate user input')
    expect(html).toContain('Use descriptive variable names')
    expect(html).toContain('Write tests for your code')

    // Check for tables inside containers
    expect(html).toContain('Info Container')
    expect(html).toContain('Working')

    // Check for blockquotes inside containers
    expect(html).toContain('This is a blockquote inside a container extension.')
  })

  test('should handle edge cases and special content', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for empty containers
    expect(html).toContain('<div class="tip custom-block">')
    expect(html).toContain('<div class="info custom-block">')

    // Check for Unicode characters
    expect(html).toContain('🌟 Unicode Support')
    expect(html).toContain('🚀✨💡🔥')
    expect(html).toContain('∑∆∞√∫')
    expect(html).toContain('αβγδεζηθικλμνξοπρστυφχψω')

    // Check for markdown links
    expect(html).toContain('#container-extensions-test')
    expect(html).toContain('https://github.com')
    expect(html).toContain('https://example.com')
  })

  test('should handle nested containers', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for nested container structure
    expect(html).toContain('<div class="tip custom-block">')
    expect(html).toContain('<div class="warning custom-block">')
    expect(html).toContain('This warning is nested inside a tip container.')
  })

  test('should handle multiple code blocks in containers', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for multiple code blocks
    expect(html).toContain('interface User')
    expect(html).toContain('def greet_user(user)')
    expect(html).toContain('#!/bin/bash')
    expect(html).toContain('echo "Processing complete"')
  })

  test('should handle mixed content in containers', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for mixed content types
    expect(html).toContain('Mixed Content Container')
    expect(html).toContain('<h3>Heading</h3>')
    expect(html).toContain('<strong>bold text</strong>')
    expect(html).toContain('<em>italic text</em>')
    expect(html).toContain('<li>List item 1</li>')
    expect(html).toContain('<li>List item 2</li>')
    expect(html).toContain('console.log("Code block")')
    expect(html).toContain('<blockquote>')
    expect(html).toContain('Blockquote in container')
  })

  test('should validate HTML structure and styling', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Basic HTML validation
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true)
    expect(html).toContain('<html')
    expect(html).toContain('<head>')
    expect(html).toContain('<body>')
    expect(html).toContain('</body>')
    expect(html).toContain('</html>')

    // Meta tags
    expect(html).toContain('<meta charset="UTF-8">')
    expect(html).toContain('<meta name="viewport"')

    // Container styling classes
    expect(html).toContain('custom-block')
    expect(html).toContain('custom-block-title')

    // Content validation
    expect(html).toContain('markdown-body')
    expect(html).toContain('class=')
    expect(html).toContain('id=')

    // Check for container CSS styles
    expect(html).toContain('.custom-block {')
    expect(html).toContain('.tip {')
    expect(html).toContain('.warning {')
    expect(html).toContain('.danger {')
  })

  test('should handle very long content in containers', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for long content handling
    expect(html).toContain('Long Content Example')
    expect(html).toContain('Lorem ipsum dolor sit amet')
    expect(html).toContain('Duis aute irure dolor in reprehenderit')
    expect(html).toContain('Sed ut perspiciatis unde omnis iste natus')
  })

  test('should handle containers with horizontal rules', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for horizontal rule in container
    expect(html).toContain('Section Break')
    expect(html).toContain('<hr>')
    expect(html).toContain('Content before the rule')
    expect(html).toContain('Content after the rule')
  })

  test('should handle containers with links and emphasis', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for links and emphasis in containers
    expect(html).toContain('<strong>Important:</strong>')
    expect(html).toContain('<em>Note:</em>')
    expect(html).toContain('security updates page')
    expect(html).toContain('/security')
  })
})
