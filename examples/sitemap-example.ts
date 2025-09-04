import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { markdown, generateSitemapAndRobots } from '../src/plugin'

const testDir = './examples/sitemap-output'
const outDir = './examples/sitemap-output/dist'

async function createSitemapExample() {
  try {
    // Create test directories
    await mkdir(testDir, { recursive: true })
    await mkdir(outDir, { recursive: true })

    // Create sample pages with different frontmatter configurations
    const pages = [
      {
        path: 'index.md',
        content: `---
title: Home Page
description: Welcome to our documentation
priority: 1.0
changefreq: daily
---

# Welcome to Our Documentation

This is the home page of our documentation site.
`
      },
      {
        path: 'docs/getting-started.md',
        content: `---
title: Getting Started
description: Learn how to get started
priority: 0.8
changefreq: monthly
---

# Getting Started

Learn how to get started with our platform.
`
      },
      {
        path: 'docs/advanced.md',
        content: `---
title: Advanced Features
description: Advanced features and configuration
priority: 0.7
changefreq: monthly
---

# Advanced Features

Explore advanced features and configuration options.
`
      },
      {
        path: 'blog/post1.md',
        content: `---
title: First Blog Post
description: Our first blog post
priority: 0.6
changefreq: weekly
lastmod: 2024-01-15
---

# First Blog Post

This is our first blog post with the latest updates.
`
      },
      {
        path: 'blog/post2.md',
        content: `---
title: Second Blog Post
description: Our second blog post
priority: 0.6
changefreq: weekly
lastmod: 2024-01-20
---

# Second Blog Post

This is our second blog post with more updates.
`
      },
      {
        path: 'private/admin.md',
        content: `---
title: Admin Panel
description: Private admin panel
sitemap: false
---

# Admin Panel

This page should not appear in the sitemap.
`
      },
      {
        path: 'examples/basic.md',
        content: `---
title: Basic Example
description: A basic example
priority: 0.5
---

# Basic Example

This is a basic example page.
`
      }
    ]

    // Write pages to disk
    for (const page of pages) {
      const filePath = join(testDir, page.path)
      await mkdir(join(filePath, '..'), { recursive: true })
      await writeFile(filePath, page.content)
    }

    console.log('📝 Created sample pages')

    // Build with markdown plugin
    const buildResult = await Bun.build({
      entrypoints: pages.map(p => join(testDir, p.path)),
      outdir: outDir,
      plugins: [markdown({
        sitemap: {
          enabled: true,
          baseUrl: 'https://example.com',
          filename: 'sitemap.xml',
          defaultPriority: 0.5,
          defaultChangefreq: 'monthly',
          exclude: ['/private/**'],
          priorityMap: {
            '/': 1.0,
            '/docs/**': 0.8,
            '/blog/**': 0.7,
            '/examples/**': 0.6
          },
          changefreqMap: {
            '/blog/**': 'weekly',
            '/docs/**': 'monthly',
            '/': 'daily'
          }
        },
        robots: {
          enabled: true,
          filename: 'robots.txt',
          rules: [
            {
              userAgent: '*',
              allow: ['/'],
              disallow: ['/private/', '/admin/']
            },
            {
              userAgent: 'Googlebot',
              allow: ['/'],
              disallow: ['/admin/'],
              crawlDelay: 1
            }
          ],
          host: 'example.com'
        }
      })]
    })

    if (!buildResult.success) {
      console.error('❌ Build failed:', buildResult.logs)
      return
    }

    console.log('✅ Build completed successfully')

    // Generate sitemap and robots.txt (called separately for demonstration)
    const pageData = await Promise.all(
      pages.map(async (page) => {
        const filePath = join(testDir, page.path)
        const content = await Bun.file(filePath).text()
        const frontmatter = content.match(/^---\n([\s\S]*?)\n---/)?.[1] || ''
        const parsedFrontmatter: any = {}

        if (frontmatter) {
          frontmatter.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split(':')
            if (key && valueParts.length > 0) {
              const value = valueParts.join(':').trim()
              if (value.startsWith('"') && value.endsWith('"')) {
                parsedFrontmatter[key.trim()] = value.slice(1, -1)
              } else if (value === 'true' || value === 'false') {
                parsedFrontmatter[key.trim()] = value === 'true'
              } else if (!isNaN(Number(value))) {
                parsedFrontmatter[key.trim()] = Number(value)
              } else {
                parsedFrontmatter[key.trim()] = value
              }
            }
          })
        }

        return {
          path: page.path,
          frontmatter: parsedFrontmatter
        }
      })
    )

    await generateSitemapAndRobots(pageData, outDir, {
      enabled: true,
      baseUrl: 'https://example.com',
      filename: 'sitemap.xml',
      defaultPriority: 0.5,
      defaultChangefreq: 'monthly' as const,
      exclude: ['/private/**'],
      priorityMap: {
        '/': 1.0,
        '/docs/**': 0.8,
        '/blog/**': 0.7,
        '/examples/**': 0.6
      },
      changefreqMap: {
        '/blog/**': 'weekly',
        '/docs/**': 'monthly',
        '/': 'daily'
      }
    }, {
      enabled: true,
      filename: 'robots.txt',
      rules: [
        {
          userAgent: '*',
          allow: ['/'],
          disallow: ['/private/', '/admin/']
        },
        {
          userAgent: 'Googlebot',
          allow: ['/'],
          disallow: ['/admin/'],
          crawlDelay: 1
        }
      ],
      host: 'example.com'
    })

    console.log('🎉 Sitemap and robots.txt generation completed!')

    // Display results
    console.log('\n📋 Generated files:')
    const files = await readdir(outDir)
    for (const file of files) {
      if (file.endsWith('.xml') || file.endsWith('.txt')) {
        const filePath = join(outDir, file)
        const content = await Bun.file(filePath).text()
        console.log(`\n📄 ${file}:`)
        console.log(content.slice(0, 500) + (content.length > 500 ? '...' : ''))
      }
    }

    console.log('\n🔍 Sitemap includes the following pages:')
    const sitemapPath = join(outDir, 'sitemap.xml')
    const sitemapContent = await Bun.file(sitemapPath).text()
    const urls = sitemapContent.match(/<loc>(.*?)<\/loc>/g)?.map(match =>
      match.replace('<loc>', '').replace('</loc>', '').replace('https://example.com', '')
    ) || []

    urls.forEach(url => console.log(`  ✅ ${url}`))

    console.log('\n🚫 Excluded from sitemap:')
    console.log('  ❌ /private/admin.html (sitemap: false)')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the example
createSitemapExample().then(() => {
  console.log('\n✨ Example completed! Check the examples/sitemap-output/dist/ directory for generated files.')
})
