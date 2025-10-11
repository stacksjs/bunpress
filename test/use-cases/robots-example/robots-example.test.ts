import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { buildTestSite, readBuiltFile } from '../../utils/test-helpers'

describe('Use Case: Robots Example', () => {
  const _testCase = 'robots-example'
  const testDir = join(import.meta.dir, '..', '..', 'test', 'use-cases', testCase)

  test('should generate HTML with robots.txt configuration examples', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
      config: {
        markdown: {
          title: 'Robots.txt Configuration Examples',
          meta: {
            description: 'Complete guide to robots.txt configuration in BunPress',
            author: 'BunPress',
          },
        },
      },
    })

    expect(result.success).toBe(true)

    const generatedHtml = await readBuiltFile(result.outputs[0])

    // Check for basic HTML structure
    expect(generatedHtml).toContain('<title>Robots.txt Configuration Examples</title>')
    expect(generatedHtml).toContain('Complete guide to robots.txt configuration in BunPress')
    expect(generatedHtml).toContain('BunPress')

    // Check for robots-related content
    expect(generatedHtml).toContain('robots.txt')
    expect(generatedHtml).toContain('User-agent')
    expect(generatedHtml).toContain('Disallow')
    expect(generatedHtml).toContain('Allow')
    expect(generatedHtml).toContain('Sitemap')

    // Check for code blocks with configuration examples
    expect(generatedHtml).toContain('bunpress.config.ts')
    expect(generatedHtml).toContain('export default')

    // Check for markdown processing
    expect(generatedHtml).toContain('<h1')
    expect(generatedHtml).toContain('<h2')
    expect(generatedHtml).toContain('<h3')

    // Check for UnoCSS
    expect(generatedHtml).toContain('@unocss/runtime')
  })

  test('should include robots configuration examples', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for robots configuration examples
    expect(html).toContain('rules:')
    expect(html).toContain('userAgent:')
    expect(html).toContain('allow:')
    expect(html).toContain('disallow:')
    expect(html).toContain('crawlDelay:')
    expect(html).toContain('sitemaps:')
    expect(html).toContain('host:')

    // Check for different use cases
    expect(html).toContain('E-commerce Site')
    expect(html).toContain('Documentation Site')

    // Check for best practices
    expect(html).toContain('SEO-Friendly')
    expect(html).toContain('Crawl Delays')
    expect(html).toContain('Sitemaps')
  })

  test('should validate HTML structure and robots elements', async () => {
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

    // Robots-specific validation
    expect(html).toContain('robots.txt')
    expect(html).toContain('crawling')
    expect(html).toContain('search engines')
    expect(html).toContain('Googlebot')
    expect(html).toContain('Bingbot')
  })
})
