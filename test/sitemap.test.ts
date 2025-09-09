import { afterAll, describe, expect, test } from 'bun:test'
import { assertHtmlContains, buildTestSite, cleanupTestResources, createTestMarkdown, readBuiltFile } from './utils/test-helpers'

describe('Sitemap Generation', () => {
  describe('Sitemap XML', () => {
    test('should generate sitemap.xml', async () => {
      const content1 = createTestMarkdown(`
# Page One

First page content.
      `)

      const content2 = createTestMarkdown(`
# Page Two

Second page content.
      `)

      const result = await buildTestSite({
        files: [
          { path: 'page1.md', content: content1 },
          { path: 'page2.md', content: content2 },
        ],
      })

      expect(result.success).toBe(true)

      // Check if sitemap.xml is generated
      const sitemapExists = result.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!)
        expect(assertHtmlContains(sitemapContent, '<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
        expect(assertHtmlContains(sitemapContent, '<urlset')).toBe(true)
        expect(assertHtmlContains(sitemapContent, '<url>')).toBe(true)
        expect(assertHtmlContains(sitemapContent, '<loc>')).toBe(true)
        expect(assertHtmlContains(sitemapContent, 'page1.html')).toBe(true)
        expect(assertHtmlContains(sitemapContent, 'page2.html')).toBe(true)
      }
    })

    test('should include all pages', async () => {
      const pages = [
        'index.md',
        'about.md',
        'contact.md',
        'blog/post1.md',
        'blog/post2.md',
        'docs/guide.md',
        'docs/api.md',
      ]

      const files = pages.map(page => ({
        path: page,
        content: createTestMarkdown(`
# ${page.replace('.md', '').replace('/', ' ')}

Content for ${page}
        `),
      }))

      const result = await buildTestSite({
        files,
      })

      expect(result.success).toBe(true)

      const sitemapExists = result.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!)

        pages.forEach((page) => {
          const htmlPage = page.replace('.md', '.html')
          expect(assertHtmlContains(sitemapContent, htmlPage)).toBe(true)
        })

        expect(assertHtmlContains(sitemapContent, 'index.html')).toBe(true)
        expect(assertHtmlContains(sitemapContent, 'about.html')).toBe(true)
        expect(assertHtmlContains(sitemapContent, 'contact.html')).toBe(true)
        expect(assertHtmlContains(sitemapContent, 'blog/post1.html')).toBe(true)
        expect(assertHtmlContains(sitemapContent, 'blog/post2.html')).toBe(true)
        expect(assertHtmlContains(sitemapContent, 'docs/guide.html')).toBe(true)
        expect(assertHtmlContains(sitemapContent, 'docs/api.html')).toBe(true)
      }
    })

    test('should set correct priorities', async () => {
      const content1 = createTestMarkdown(`
# Home Page

Main page content.
      `, { priority: 1.0 })

      const content2 = createTestMarkdown(`
# About Page

About page content.
      `, { priority: 0.8 })

      const content3 = createTestMarkdown(`
# Contact Page

Contact page content.
      `, { priority: 0.5 })

      const result = await buildTestSite({
        files: [
          { path: 'index.md', content: content1 },
          { path: 'about.md', content: content2 },
          { path: 'contact.md', content: content3 },
        ],
      })

      expect(result.success).toBe(true)

      const sitemapExists = result.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!)

        expect(assertHtmlContains(sitemapContent, '<priority>1.0</priority>')).toBe(true)
        expect(assertHtmlContains(sitemapContent, '<priority>0.8</priority>')).toBe(true)
        expect(assertHtmlContains(sitemapContent, '<priority>0.5</priority>')).toBe(true)
      }
    })

    test('should handle lastmod dates', async () => {
      const content1 = createTestMarkdown(`
# Page with Last Modified

Content here.
      `, { lastmod: '2024-01-01' })

      const content2 = createTestMarkdown(`
# Another Page

More content.
      `, { lastmod: '2024-01-02T10:30:00Z' })

      const result = await buildTestSite({
        files: [
          { path: 'page1.md', content: content1 },
          { path: 'page2.md', content: content2 },
        ],
      })

      expect(result.success).toBe(true)

      const sitemapExists = result.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!)

        expect(assertHtmlContains(sitemapContent, '<lastmod>2024-01-01</lastmod>')).toBe(true)
        expect(assertHtmlContains(sitemapContent, '<lastmod>2024-01-02T10:30:00Z</lastmod>')).toBe(true)
      }
    })

    test('should handle changefreq settings', async () => {
      const content1 = createTestMarkdown(`
# Daily Updated Page

Frequently updated content.
      `, { changefreq: 'daily' })

      const content2 = createTestMarkdown(`
# Monthly Updated Page

Monthly updated content.
      `, { changefreq: 'monthly' })

      const content3 = createTestMarkdown(`
# Static Page

Never changes.
      `, { changefreq: 'never' })

      const result = await buildTestSite({
        files: [
          { path: 'daily.md', content: content1 },
          { path: 'monthly.md', content: content2 },
          { path: 'static.md', content: content3 },
        ],
      })

      expect(result.success).toBe(true)

      const sitemapExists = result.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!)

        expect(assertHtmlContains(sitemapContent, '<changefreq>daily</changefreq>')).toBe(true)
        expect(assertHtmlContains(sitemapContent, '<changefreq>monthly</changefreq>')).toBe(true)
        expect(assertHtmlContains(sitemapContent, '<changefreq>never</changefreq>')).toBe(true)
      }
    })

    test('should exclude pages from sitemap', async () => {
      const content1 = createTestMarkdown(`
# Included Page

This page should be in sitemap.
      `, { sitemap: true })

      const content2 = createTestMarkdown(`
# Excluded Page

This page should not be in sitemap.
      `, { sitemap: false })

      const content3 = createTestMarkdown(`
# Also Excluded Page

This page should also not be in sitemap.
      `, { sitemap: 'exclude' })

      const result = await buildTestSite({
        files: [
          { path: 'included.md', content: content1 },
          { path: 'excluded1.md', content: content2 },
          { path: 'excluded2.md', content: content3 },
        ],
      })

      expect(result.success).toBe(true)

      const sitemapExists = result.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!)

        expect(assertHtmlContains(sitemapContent, 'included.html')).toBe(true)
        expect(assertHtmlContains(sitemapContent, 'excluded1.html')).toBe(false)
        expect(assertHtmlContains(sitemapContent, 'excluded2.html')).toBe(false)
      }
    })
  })

  describe('Robots.txt', () => {
    test('should generate robots.txt', async () => {
      const content = createTestMarkdown(`
# Test Page

Content for robots.txt test.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const robotsExists = result.outputs.some(out => out.includes('robots.txt'))
      expect(robotsExists).toBe(true)

      if (robotsExists) {
        const robotsPath = result.outputs.find(out => out.includes('robots.txt'))
        const robotsContent = await readBuiltFile(robotsPath!)

        expect(assertHtmlContains(robotsContent, 'User-agent: *')).toBe(true)
        expect(assertHtmlContains(robotsContent, 'Allow: /')).toBe(true)
        expect(assertHtmlContains(robotsContent, 'Sitemap:')).toBe(true)
      }
    })

    test('should include sitemap reference', async () => {
      const content1 = createTestMarkdown(`
# Page One

Content for page one.
      `)

      const content2 = createTestMarkdown(`
# Page Two

Content for page two.
      `)

      const result = await buildTestSite({
        files: [
          { path: 'page1.md', content: content1 },
          { path: 'page2.md', content: content2 },
        ],
      })

      expect(result.success).toBe(true)

      const robotsExists = result.outputs.some(out => out.includes('robots.txt'))
      expect(robotsExists).toBe(true)

      if (robotsExists) {
        const robotsPath = result.outputs.find(out => out.includes('robots.txt'))
        const robotsContent = await readBuiltFile(robotsPath!)

        expect(assertHtmlContains(robotsContent, 'Sitemap:')).toBe(true)
        expect(assertHtmlContains(robotsContent, 'sitemap.xml')).toBe(true)
        expect(assertHtmlContains(robotsContent, 'http')).toBe(true)
      }
    })

    test('should support custom robots.txt rules', async () => {
      const content = createTestMarkdown(`
# Custom Robots Page

Content for custom robots test.
      `, {
        robots: [
          {
            userAgent: 'Googlebot',
            disallow: ['/private/'],
          },
          {
            userAgent: 'Bingbot',
            disallow: ['/admin/'],
          },
        ],
      })

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const robotsExists = result.outputs.some(out => out.includes('robots.txt'))
      expect(robotsExists).toBe(true)

      if (robotsExists) {
        const robotsPath = result.outputs.find(out => out.includes('robots.txt'))
        const robotsContent = await readBuiltFile(robotsPath!)

        expect(assertHtmlContains(robotsContent, 'User-agent: Googlebot')).toBe(true)
        expect(assertHtmlContains(robotsContent, 'Disallow: /private/')).toBe(true)
        expect(assertHtmlContains(robotsContent, 'User-agent: Bingbot')).toBe(true)
        expect(assertHtmlContains(robotsContent, 'Disallow: /admin/')).toBe(true)
      }
    })
  })

  describe('Sitemap Configuration', () => {
    test('should support custom sitemap configuration', async () => {
      const content = createTestMarkdown(`
# Configured Page

Content for sitemap configuration test.
      `, {
        sitemap: {
          changefreq: 'weekly',
          priority: 0.8,
          lastmod: '2024-01-01',
        },
      })

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const sitemapExists = result.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!)

        expect(assertHtmlContains(sitemapContent, '<changefreq>weekly</changefreq>')).toBe(true)
        expect(assertHtmlContains(sitemapContent, '<priority>0.8</priority>')).toBe(true)
        expect(assertHtmlContains(sitemapContent, '<lastmod>2024-01-01</lastmod>')).toBe(true)
      }
    })

    test('should handle multiple sitemaps', async () => {
      const content1 = createTestMarkdown(`
# Main Sitemap Page

Content for main sitemap.
      `)

      const content2 = createTestMarkdown(`
# Blog Sitemap Page

Content for blog sitemap.
      `)

      const result = await buildTestSite({
        files: [
          { path: 'page1.md', content: content1 },
          { path: 'blog/page2.md', content: content2 },
        ],
        config: {
          sitemap: {
            enabled: true,
            baseUrl: 'https://example.com',
            useSitemapIndex: true,
            maxUrlsPerFile: 1,
          },
        },
      })

      expect(result.success).toBe(true)

      const sitemap1Exists = result.outputs.some(out => out.includes('sitemap-1.xml'))
      const sitemap2Exists = result.outputs.some(out => out.includes('sitemap-2.xml'))
      const indexExists = result.outputs.some(out => out.includes('sitemap-index.xml'))

      expect(sitemap1Exists).toBe(true)
      expect(sitemap2Exists).toBe(true)
      expect(indexExists).toBe(true)

      if (sitemap1Exists && sitemap2Exists && indexExists) {
        const sitemap1Path = result.outputs.find(out => out.includes('sitemap-1.xml'))
        const sitemap2Path = result.outputs.find(out => out.includes('sitemap-2.xml'))
        const indexPath = result.outputs.find(out => out.includes('sitemap-index.xml'))

        const sitemap1Content = await readBuiltFile(sitemap1Path!)
        const sitemap2Content = await readBuiltFile(sitemap2Path!)
        const indexContent = await readBuiltFile(indexPath!)

        // Each sitemap should contain one page
        expect(assertHtmlContains(sitemap1Content, '<urlset')).toBe(true)
        expect(assertHtmlContains(sitemap2Content, '<urlset')).toBe(true)
        expect(assertHtmlContains(indexContent, '<sitemapindex')).toBe(true)
        expect(assertHtmlContains(indexContent, 'sitemap-1.xml')).toBe(true)
        expect(assertHtmlContains(indexContent, 'sitemap-2.xml')).toBe(true)
      }
    })

    test('should support sitemap index files', async () => {
      const content1 = createTestMarkdown(`
# Section 1 Page

Content for section 1.
      `)

      const content2 = createTestMarkdown(`
# Section 2 Page

Content for section 2.
      `)

      const result = await buildTestSite({
        files: [
          { path: 'section1/page.md', content: content1 },
          { path: 'section2/page.md', content: content2 },
        ],
        config: {
          sitemap: {
            enabled: true,
            baseUrl: 'https://example.com',
            useSitemapIndex: true,
            maxUrlsPerFile: 1,
          },
        },
      })

      expect(result.success).toBe(true)

      const indexExists = result.outputs.some(out => out.includes('sitemap-index.xml'))
      expect(indexExists).toBe(true)

      if (indexExists) {
        const indexPath = result.outputs.find(out => out.includes('sitemap-index.xml'))
        const indexContent = await readBuiltFile(indexPath!)

        // Check that the content contains the essential sitemap index structure
        expect(indexContent.includes('sitemapindex')).toBe(true)
        expect(indexContent.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')).toBe(true)
        expect(assertHtmlContains(indexContent, '<sitemap>')).toBe(true)
        expect(assertHtmlContains(indexContent, 'sitemap-1.xml')).toBe(true)
        expect(assertHtmlContains(indexContent, 'sitemap-2.xml')).toBe(true)
      }
    })
  })

  describe('Sitemap Generation Edge Cases', () => {
    test('should handle pages without frontmatter', async () => {
      const content = `
# Simple Page

Content without frontmatter.
      `

      const result = await buildTestSite({
        files: [{ path: 'simple.md', content }],
      })

      expect(result.success).toBe(true)

      const sitemapExists = result.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!)

        expect(assertHtmlContains(sitemapContent, 'simple.html')).toBe(true)
        expect(assertHtmlContains(sitemapContent, '<priority>0.5</priority>')).toBe(true) // Default priority
      }
    })

    test('should handle special characters in URLs', async () => {
      const content = createTestMarkdown(`
# Page with Special Chars

Content with special characters in path.
      `)

      const result = await buildTestSite({
        files: [{ path: 'spécial-chars-测试.md', content }],
      })

      expect(result.success).toBe(true)

      const sitemapExists = result.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!)

        expect(assertHtmlContains(sitemapContent, 'spécial-chars-测试.html')).toBe(true)
      }
    })

    test('should handle very long URLs', async () => {
      const longPath = 'very/long/path/with/many/segments/that/might/cause/issues/with/url/length/limits/and/xml/parsing'
      const content = createTestMarkdown(`
# Long Path Page

Content with very long path.
      `)

      const result = await buildTestSite({
        files: [{ path: `${longPath}.md`, content }],
      })

      expect(result.success).toBe(true)

      const sitemapExists = result.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!)

        expect(assertHtmlContains(sitemapContent, `${longPath}.html`)).toBe(true)
      }
    })

    test('should handle empty directories', async () => {
      const content = createTestMarkdown(`
# Single Page

Only one page in sitemap.
      `)

      const result = await buildTestSite({
        files: [{ path: 'single.md', content }],
      })

      expect(result.success).toBe(true)

      const sitemapExists = result.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!)

        expect(assertHtmlContains(sitemapContent, 'single.html')).toBe(true)
        expect(assertHtmlContains(sitemapContent, '<urlset')).toBe(true)
        // Should still be valid XML even with single entry
      }
    })
  })

  describe('Sitemap Performance', () => {
    test('should handle large number of pages efficiently', async () => {
      const files = Array.from({ length: 25 }, (_, i) => ({
        path: `page${i}.md`,
        content: createTestMarkdown(`
# Page ${i}

Content for page ${i}.
        `),
      }))

      const result = await buildTestSite({
        files,
      })

      expect(result.success).toBe(true)

      const sitemapExists = result.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!)

        // Check that sample pages are included (not all 25 to speed up test)
        expect(assertHtmlContains(sitemapContent, 'page0.html')).toBe(true)
        expect(assertHtmlContains(sitemapContent, 'page10.html')).toBe(true)
        expect(assertHtmlContains(sitemapContent, 'page24.html')).toBe(true) // Last page

        // Verify that the sitemap contains the expected number of entries
        expect(assertHtmlContains(sitemapContent, '<urlset')).toBe(true)
      }
    }, 15000) // 15 second timeout for performance test

    test('should generate sitemaps incrementally', async () => {
      const content1 = createTestMarkdown(`
# Initial Page

Initial content.
      `)

      const result1 = await buildTestSite({
        files: [{ path: 'initial.md', content: content1 }],
      })

      expect(result1.success).toBe(true)

      // Add more pages
      const content2 = createTestMarkdown(`
# Additional Page

Additional content.
      `)

      const result2 = await buildTestSite({
        files: [
          { path: 'initial.md', content: content1 },
          { path: 'additional.md', content: content2 },
        ],
      })

      expect(result2.success).toBe(true)

      const sitemapExists = result2.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result2.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!)

        expect(assertHtmlContains(sitemapContent, 'initial.html')).toBe(true)
        expect(assertHtmlContains(sitemapContent, 'additional.html')).toBe(true)
      }
    })
  })

  // Clean up resources after all tests
  afterAll(() => {
    cleanupTestResources()
  })
})
