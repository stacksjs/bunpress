import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { buildTestSite, readBuiltFile } from '../../utils/test-helpers'

describe('Use Case: Theme Example', () => {
  const testCase = 'theme-example'
  const testDir = '/Users/mac/repos/stacks-org/bunpress/test/use-cases/theme-example'

  test('should generate HTML that matches expected output', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ],
      config: {
        markdown: {
          title: 'Test Documentation',
          meta: {
            description: 'Test description',
            author: 'BunPress'
          }
        }
      }
    })

    expect(result.success).toBe(true)

    const generatedHtml = await readBuiltFile(result.outputs[0])

    // The generated HTML should contain the same essential content as expected
    expect(generatedHtml).toContain('<title>Theme Example</title>')
    expect(generatedHtml).toContain('Complete theme implementations showcasing different visual styles and branding for BunPress')
    expect(generatedHtml).toContain('BunPress Team')

    // Check for frontmatter processing
    expect(generatedHtml).toContain('data-layout="doc"')
    expect(generatedHtml).toContain('Theme Example')

    // Check for sidebar structure
    expect(generatedHtml).toContain('Overview')
    expect(generatedHtml).toContain('Light Theme')
    expect(generatedHtml).toContain('Dark Theme')
    expect(generatedHtml).toContain('Corporate Theme')
    expect(generatedHtml).toContain('Developer Theme')
    expect(generatedHtml).toContain('Minimal Theme')
    expect(generatedHtml).toContain('Custom Branding')

    // Check for markdown processing
    expect(generatedHtml).toContain('<h1')
    expect(generatedHtml).toContain('<h2')
    expect(generatedHtml).toContain('<h3')

    // Check for code blocks
    expect(generatedHtml).toContain('<code')
    expect(generatedHtml).toContain('<pre')

    // Check for UnoCSS
    expect(generatedHtml).toContain('@unocss/runtime')

    // Check for basic HTML structure
    expect(generatedHtml).toContain('<!DOCTYPE html>')
    expect(generatedHtml).toContain('<meta charset="UTF-8">')
    expect(generatedHtml).toContain('<meta name="viewport"')
  })

  test('should process frontmatter correctly', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Verify frontmatter values are used
    expect(html).toContain('Theme Example')
    expect(html).toContain('BunPress Team')
    expect(html).toContain('doc')
    expect(html).toContain('sidebar')

    // Verify sidebar items are processed
    expect(html).toContain('Overview')
    expect(html).toContain('/theme-example#overview')
    expect(html).toContain('Light Theme')
    expect(html).toContain('/theme-example#light-theme')
    expect(html).toContain('Dark Theme')
    expect(html).toContain('/theme-example#dark-theme')
  })

  test('should generate proper heading structure', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for proper heading hierarchy
    expect(html).toContain('<h1')
    expect(html).toContain('<h2')
    expect(html).toContain('<h3')

    // Check for heading anchors
    expect(html).toContain('id="overview"')
    expect(html).toContain('id="light-theme"')
    expect(html).toContain('id="dark-theme"')
    expect(html).toContain('id="corporate-theme"')
    expect(html).toContain('id="developer-theme"')
    expect(html).toContain('id="minimal-theme"')
    expect(html).toContain('id="custom-branding"')
  })

  test('should include code blocks with syntax highlighting', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for code blocks
    expect(html).toContain('<pre')
    expect(html).toContain('<code')

    // Check for code block content
    expect(html).toContain('export const lightTheme')
    expect(html).toContain('colors:')
    expect(html).toContain('typography:')

    // Check for copy-to-clipboard functionality
    expect(html).toContain('copy-code-btn')
    expect(html).toContain('copyToClipboard')

    // Check for syntax highlighting classes
    expect(html).toContain('language-')
  })

  test('should process markdown extensions correctly', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for markdown processing
    expect(html).toContain('<strong>')
    expect(html).toContain('<em>')

    // Check for links
    expect(html).toContain('<a href=')

    // Check for lists
    expect(html).toContain('<ul>')
    expect(html).toContain('<li>')
  })

  test('should include proper CSS and JavaScript', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for UnoCSS
    expect(html).toContain('@unocss/runtime')

    // Check for custom styles
    expect(html).toContain('<style>')

    // Check for copy-to-clipboard scripts
    expect(html).toContain('copyToClipboard')
    expect(html).toContain('function copyToClipboard')

    // Check for TOC scripts
    expect(html).toContain('initToc')
  })

  test('should handle different build configurations', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    // Test with custom configuration
    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ],
      config: {
        markdown: {
          title: 'Custom Title',
          meta: {
            description: 'Custom description',
            author: 'Custom Author'
          }
        }
      }
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Should still have the frontmatter title, not the config title
    expect(html).toContain('Theme Example')
    expect(html).toContain('BunPress Team')
  })

  test('should validate HTML structure', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
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
    expect(html).toContain('<title>')

    // Content validation
    expect(html).toContain('markdown-body')
    expect(html).toContain('class=')
    expect(html).toContain('id=')
  })
})
