import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { buildTestSite, readBuiltFile } from '../../utils/test-helpers'

describe('Use Case: Search Example', () => {
  const testCase = 'search-example'
  const testDir = join(import.meta.dir, '..', '..', 'test', 'use-cases', testCase)

  test('should generate HTML with search configuration examples', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ],
      config: {
        markdown: {
          title: 'Search Example',
          meta: {
            description: 'How to configure search functionality in BunPress',
            author: 'BunPress'
          }
        }
      }
    })

    expect(result.success).toBe(true)

    const generatedHtml = await readBuiltFile(result.outputs[0])

    // Check for basic HTML structure
    expect(generatedHtml).toContain('<title>Search Example</title>')
    expect(generatedHtml).toContain('How to configure search functionality in BunPress')
    expect(generatedHtml).toContain('BunPress')

    // Check for search-related content
    expect(generatedHtml).toContain('search')
    expect(generatedHtml).toContain('keyboard shortcuts')
    expect(generatedHtml).toContain('real-time')
    expect(generatedHtml).toContain('ranking')

    // Check for code blocks with search configuration
    expect(generatedHtml).toContain('bunpress.config.ts')
    expect(generatedHtml).toContain('export default')

    // Check for markdown processing
    expect(generatedHtml).toContain('<h1')
    expect(generatedHtml).toContain('<h2')

    // Check for UnoCSS
    expect(generatedHtml).toContain('@unocss/runtime')
  })

  test('should include search configuration examples', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for search configuration examples
    expect(html).toContain('search:')
    expect(html).toContain('enabled:')
    expect(html).toContain('placeholder:')
    expect(html).toContain('maxResults:')
    expect(html).toContain('keyboardShortcuts:')

    // Check for search features
    expect(html).toContain('Real-time search')
    expect(html).toContain('Smart ranking')
    expect(html).toContain('Keyboard shortcuts')
    expect(html).toContain('Content snippets')
    expect(html).toContain('Mobile friendly')

    // Check for performance features
    expect(html).toContain('Lazy loading')
    expect(html).toContain('Debounced input')
    expect(html).toContain('Cached results')
  })

  test('should validate HTML structure and search elements', async () => {
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

    // Search-specific validation
    expect(html).toContain('Ctrl+K')
    expect(html).toContain('Cmd+K')
    expect(html).toContain('Escape')
    expect(html).toContain('mobile')
    expect(html).toContain('responsive')
  })
})
