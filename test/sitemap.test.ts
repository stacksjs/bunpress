import { describe, expect, test } from 'bun:test'
import { createTestMarkdown, buildTestSite, readBuiltFile, assertHtmlContains } from './utils/test-helpers'

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
          { path: 'page2.md', content: content2 }
        ]
      })

      expect(result.success).toBe(true)

      // Check if sitemap.xml is generated
      const sitemapExists = result.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!, 'sitemap.xml')
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
        'docs/api.md'
      ]

      const files = pages.map(page => ({
        path: page,
        content: createTestMarkdown(`
# ${page.replace('.md', '').replace('/', ' ')}

Content for ${page}
        `)
      }))

      const result = await buildTestSite({
        files
      })

      expect(result.success).toBe(true)

      const sitemapExists = result.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!, 'sitemap.xml')

        pages.forEach(page => {
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
---
priority: 1.0
---

# Home Page

Main page content.
      `)

      const content2 = createTestMarkdown(`
---
priority: 0.8
---

# About Page

About page content.
      `)

      const content3 = createTestMarkdown(`
---
priority: 0.5
---

# Contact Page

Contact page content.
      `)

      const result = await buildTestSite({
        files: [
          { path: 'index.md', content: content1 },
          { path: 'about.md', content: content2 },
          { path: 'contact.md', content: content3 }
        ]
      })

      expect(result.success).toBe(true)

      const sitemapExists = result.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!, 'sitemap.xml')

        expect(assertHtmlContains(sitemapContent, '<priority>1.0</priority>')).toBe(true)
        expect(assertHtmlContains(sitemapContent, '<priority>0.8</priority>')).toBe(true)
        expect(assertHtmlContains(sitemapContent, '<priority>0.5</priority>')).toBe(true)
      }
    })

    test('should handle lastmod dates', async () => {
      const content1 = createTestMarkdown(`
---
lastmod: 2024-01-01
---

# Page with Last Modified

Content here.
      `)

      const content2 = createTestMarkdown(`
---
lastmod: 2024-01-02T10:30:00Z
---

# Another Page

More content.
      `)

      const result = await buildTestSite({
        files: [
          { path: 'page1.md', content: content1 },
          { path: 'page2.md', content: content2 }
        ]
      })

      expect(result.success).toBe(true)

      const sitemapExists = result.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!, 'sitemap.xml')

        expect(assertHtmlContains(sitemapContent, '<lastmod>2024-01-01</lastmod>')).toBe(true)
        expect(assertHtmlContains(sitemapContent, '<lastmod>2024-01-02T10:30:00Z</lastmod>')).toBe(true)
      }
    })

    test('should handle changefreq settings', async () => {
      const content1 = createTestMarkdown(`
---
changefreq: daily
---

# Daily Updated Page

Frequently updated content.
      `)

      const content2 = createTestMarkdown(`
---
changefreq: monthly
---

# Monthly Updated Page

Monthly updated content.
      `)

      const content3 = createTestMarkdown(`
---
changefreq: never
---

# Static Page

Never changes.
      `)

      const result = await buildTestSite({
        files: [
          { path: 'daily.md', content: content1 },
          { path: 'monthly.md', content: content2 },
          { path: 'static.md', content: content3 }
        ]
      })

      expect(result.success).toBe(true)

      const sitemapExists = result.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!, 'sitemap.xml')

        expect(assertHtmlContains(sitemapContent, '<changefreq>daily</changefreq>')).toBe(true)
        expect(assertHtmlContains(sitemapContent, '<changefreq>monthly</changefreq>')).toBe(true)
        expect(assertHtmlContains(sitemapContent, '<changefreq>never</changefreq>')).toBe(true)
      }
    })

    test('should exclude pages from sitemap', async () => {
      const content1 = createTestMarkdown(`
---
sitemap: true
---

# Included Page

This page should be in sitemap.
      `)

      const content2 = createTestMarkdown(`
---
sitemap: false
---

# Excluded Page

This page should not be in sitemap.
      `)

      const content3 = createTestMarkdown(`
---
sitemap: exclude
---

# Also Excluded Page

This page should also not be in sitemap.
      `)

      const result = await buildTestSite({
        files: [
          { path: 'included.md', content: content1 },
          { path: 'excluded1.md', content: content2 },
          { path: 'excluded2.md', content: content3 }
        ]
      })

      expect(result.success).toBe(true)

      const sitemapExists = result.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!, 'sitemap.xml')

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
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const robotsExists = result.outputs.some(out => out.includes('robots.txt'))
      expect(robotsExists).toBe(true)

      if (robotsExists) {
        const robotsPath = result.outputs.find(out => out.includes('robots.txt'))
        const robotsContent = await readBuiltFile(robotsPath!, 'robots.txt')

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
          { path: 'page2.md', content: content2 }
        ]
      })

      expect(result.success).toBe(true)

      const robotsExists = result.outputs.some(out => out.includes('robots.txt'))
      expect(robotsExists).toBe(true)

      if (robotsExists) {
        const robotsPath = result.outputs.find(out => out.includes('robots.txt'))
        const robotsContent = await readBuiltFile(robotsPath!, 'robots.txt')

        expect(assertHtmlContains(robotsContent, 'Sitemap:')).toBe(true)
        expect(assertHtmlContains(robotsContent, 'sitemap.xml')).toBe(true)
        expect(assertHtmlContains(robotsContent, 'http')).toBe(true)
      }
    })

    test('should support custom robots.txt rules', async () => {
      const content = createTestMarkdown(`
---
robots:
  - User-agent: Googlebot
    Disallow: /private/
  - User-agent: Bingbot
    Disallow: /admin/
---

# Custom Robots Page

Content for custom robots test.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const robotsExists = result.outputs.some(out => out.includes('robots.txt'))
      expect(robotsExists).toBe(true)

      if (robotsExists) {
        const robotsPath = result.outputs.find(out => out.includes('robots.txt'))
        const robotsContent = await readBuiltFile(robotsPath!, 'robots.txt')

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
---
sitemap:
  changefreq: weekly
  priority: 0.8
  lastmod: 2024-01-01
---

# Configured Page

Content for sitemap configuration test.
      `)

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }]
      })

      expect(result.success).toBe(true)

      const sitemapExists = result.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!, 'sitemap.xml')

        expect(assertHtmlContains(sitemapContent, '<changefreq>weekly</changefreq>')).toBe(true)
        expect(assertHtmlContains(sitemapContent, '<priority>0.8</priority>')).toBe(true)
        expect(assertHtmlContains(sitemapContent, '<lastmod>2024-01-01</lastmod>')).toBe(true)
      }
    })

    test('should handle multiple sitemaps', async () => {
      const content1 = createTestMarkdown(`
---
sitemap: main
---

# Main Sitemap Page

Content for main sitemap.
      `)

      const content2 = createTestMarkdown(`
---
sitemap: blog
---

# Blog Sitemap Page

Content for blog sitemap.
      `)

      const result = await buildTestSite({
        files: [
          { path: 'page1.md', content: content1 },
          { path: 'blog/page2.md', content: content2 }
        ]
      })

      expect(result.success).toBe(true)

      const mainSitemapExists = result.outputs.some(out => out.includes('sitemap-main.xml'))
      const blogSitemapExists = result.outputs.some(out => out.includes('sitemap-blog.xml'))

      expect(mainSitemapExists).toBe(true)
      expect(blogSitemapExists).toBe(true)

      if (mainSitemapExists && blogSitemapExists) {
        const mainSitemapPath = result.outputs.find(out => out.includes('sitemap-main.xml'))
        const blogSitemapPath = result.outputs.find(out => out.includes('sitemap-blog.xml'))

        const mainContent = await readBuiltFile(mainSitemapPath!, 'sitemap-main.xml')
        const blogContent = await readBuiltFile(blogSitemapPath!, 'sitemap-blog.xml')

        expect(assertHtmlContains(mainContent, 'page1.html')).toBe(true)
        expect(assertHtmlContains(blogContent, 'blog/page2.html')).toBe(true)
      }
    })

    test('should support sitemap index files', async () => {
      const content1 = createTestMarkdown(`
---
sitemap: section1
---

# Section 1 Page

Content for section 1.
      `)

      const content2 = createTestMarkdown(`
---
sitemap: section2
---

# Section 2 Page

Content for section 2.
      `)

      const result = await buildTestSite({
        files: [
          { path: 'section1/page.md', content: content1 },
          { path: 'section2/page.md', content: content2 }
        ]
      })

      expect(result.success).toBe(true)

      const indexExists = result.outputs.some(out => out.includes('sitemap-index.xml'))
      expect(indexExists).toBe(true)

      if (indexExists) {
        const indexPath = result.outputs.find(out => out.includes('sitemap-index.xml'))
        const indexContent = await readBuiltFile(indexPath!, 'sitemap-index.xml')

        expect(assertHtmlContains(indexContent, '<sitemapindex>')).toBe(true)
        expect(assertHtmlContains(indexContent, '<sitemap>')).toBe(true)
        expect(assertHtmlContains(indexContent, 'sitemap-section1.xml')).toBe(true)
        expect(assertHtmlContains(indexContent, 'sitemap-section2.xml')).toBe(true)
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
        files: [{ path: 'simple.md', content }]
      })

      expect(result.success).toBe(true)

      const sitemapExists = result.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!, 'sitemap.xml')

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
        files: [{ path: 'spécial-chars-测试.md', content }]
      })

      expect(result.success).toBe(true)

      const sitemapExists = result.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!, 'sitemap.xml')

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
        files: [{ path: `${longPath}.md`, content }]
      })

      expect(result.success).toBe(true)

      const sitemapExists = result.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!, 'sitemap.xml')

        expect(assertHtmlContains(sitemapContent, `${longPath}.html`)).toBe(true)
      }
    })

    test('should handle empty directories', async () => {
      const content = createTestMarkdown(`
# Single Page

Only one page in sitemap.
      `)

      const result = await buildTestSite({
        files: [{ path: 'single.md', content }]
      })

      expect(result.success).toBe(true)

      const sitemapExists = result.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!, 'sitemap.xml')

        expect(assertHtmlContains(sitemapContent, 'single.html')).toBe(true)
        expect(assertHtmlContains(sitemapContent, '<urlset')).toBe(true)
        // Should still be valid XML even with single entry
      }
    })
  })

  describe('Sitemap Performance', () => {
    test('should handle large number of pages efficiently', async () => {
      const files = Array.from({ length: 100 }, (_, i) => ({
        path: `page${i}.md`,
        content: createTestMarkdown(`
# Page ${i}

Content for page ${i}.
        `)
      }))

      const result = await buildTestSite({
        files
      })

      expect(result.success).toBe(true)

      const sitemapExists = result.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!, 'sitemap.xml')

        // Check that all pages are included
        for (let i = 0; i < 100; i++) {
          expect(assertHtmlContains(sitemapContent, `page${i}.html`)).toBe(true)
        }

        expect(assertHtmlContains(sitemapContent, 'large-sitemap')).toBe(true)
        expect(assertHtmlContains(sitemapContent, 'performance-optimized')).toBe(true)
      }
    })

    test('should generate sitemaps incrementally', async () => {
      const content1 = createTestMarkdown(`
# Initial Page

Initial content.
      `)

      const result1 = await buildTestSite({
        files: [{ path: 'initial.md', content: content1 }]
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
          { path: 'additional.md', content: content2 }
        ]
      })

      expect(result2.success).toBe(true)

      const sitemapExists = result2.outputs.some(out => out.includes('sitemap.xml'))
      expect(sitemapExists).toBe(true)

      if (sitemapExists) {
        const sitemapPath = result2.outputs.find(out => out.includes('sitemap.xml'))
        const sitemapContent = await readBuiltFile(sitemapPath!, 'sitemap.xml')

        expect(assertHtmlContains(sitemapContent, 'initial.html')).toBe(true)
        expect(assertHtmlContains(sitemapContent, 'additional.html')).toBe(true)
        expect(assertHtmlContains(sitemapContent, 'incremental-generation')).toBe(true)
      }
    })
  })
})
