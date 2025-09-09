import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { buildTestSite, readBuiltFile } from '../../utils/test-helpers'

describe('Use Case: Layout Example', () => {
  const testCase = 'layout-example'
  const testDir = join(import.meta.dir, '..', '..', 'test', 'use-cases', testCase)

  test('should generate HTML with proper layout structure', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ],
      config: {
        markdown: {
          title: 'Layout Examples',
          meta: {
            description: 'Different layout variants available in BunPress',
            author: 'BunPress'
          }
        }
      }
    })

    expect(result.success).toBe(true)

    const generatedHtml = await readBuiltFile(result.outputs[0])

    // Check for basic HTML structure
    expect(generatedHtml).toContain('<title>Layout Examples</title>')
    expect(generatedHtml).toContain('Different layout variants available in BunPress')
    expect(generatedHtml).toContain('BunPress')

    // Check for layout-specific classes and data attributes
    expect(generatedHtml).toContain('data-layout')
    expect(generatedHtml).toContain('layout-')

    // Check for markdown processing
    expect(generatedHtml).toContain('<h1')
    expect(generatedHtml).toContain('<h2')
    expect(generatedHtml).toContain('<h3')

    // Check for code blocks
    expect(generatedHtml).toContain('<code')
    expect(generatedHtml).toContain('<pre')

    // Check for layout-specific content
    expect(generatedHtml).toContain('Home Layout')
    expect(generatedHtml).toContain('Doc Layout')
    expect(generatedHtml).toContain('Page Layout')

    // Check for UnoCSS
    expect(generatedHtml).toContain('@unocss/runtime')
  })

  test('should handle different layout types', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for layout-related content
    expect(html).toContain('layout: home')
    expect(html).toContain('layout: doc')
    expect(html).toContain('layout: page')

    // Check for responsive design mentions
    expect(html).toContain('responsive')
    expect(html).toContain('mobile')
    expect(html).toContain('sidebar')
  })

  test('should include layout configuration examples', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for configuration code blocks
    expect(html).toContain('bunpress.config.ts')
    expect(html).toContain('export default')

    // Check for CSS examples
    expect(html).toContain('body[data-layout')
    expect(html).toContain('background:')
  })

  test('should validate HTML structure and styling', async () => {
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

    // Content validation
    expect(html).toContain('markdown-body')
    expect(html).toContain('class=')
    expect(html).toContain('id=')

    // Layout-specific validation
    expect(html).toContain('sidebar')
    expect(html).toContain('navigation')
    expect(html).toContain('responsive')
  })
})
