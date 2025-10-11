import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { buildTestSite, readBuiltFile } from '../../utils/test-helpers'

describe('Use Case: Navigation Example', () => {
  const _testCase = 'navigation-example'
  const testDir = join(import.meta.dir, '..', '..', 'test', 'use-cases', _testCase)

  test('should generate HTML with navigation structure', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
      config: {
        markdown: {
          title: 'Navigation Example',
          meta: {
            description: 'How to configure navigation in BunPress',
            author: 'BunPress',
          },
        },
      },
    })

    expect(result.success).toBe(true)

    const generatedHtml = await readBuiltFile(result.outputs[0])

    // Check for basic HTML structure
    expect(generatedHtml).toContain('<title>Navigation Example</title>')
    expect(generatedHtml).toContain('How to configure navigation in BunPress')
    expect(generatedHtml).toContain('BunPress')

    // Check for navigation-related content
    expect(generatedHtml).toContain('navigation')
    expect(generatedHtml).toContain('nav')
    expect(generatedHtml).toContain('dropdown')
    expect(generatedHtml).toContain('responsive')

    // Check for code blocks with navigation configuration
    expect(generatedHtml).toContain('bunpress.config.ts')
    expect(generatedHtml).toContain('export default')

    // Check for markdown processing
    expect(generatedHtml).toContain('<h1')
    expect(generatedHtml).toContain('<h2')

    // Check for UnoCSS
    expect(generatedHtml).toContain('@unocss/runtime')
  })

  test('should include navigation configuration examples', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for navigation configuration examples
    expect(html).toContain('nav:')
    expect(html).toContain('text:')
    expect(html).toContain('link:')
    expect(html).toContain('items:')

    // Check for navigation features
    expect(html).toContain('Active state detection')
    expect(html).toContain('Nested dropdown menus')
    expect(html).toContain('Icon support')
    expect(html).toContain('External link handling')
    expect(html).toContain('Mobile responsive')
  })

  test('should validate HTML structure and navigation elements', async () => {
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

    // Navigation-specific validation
    expect(html).toContain('dropdown')
    expect(html).toContain('hamburger')
    expect(html).toContain('mobile')
    expect(html).toContain('responsive')
  })
})
