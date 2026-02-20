import type { BunPressConfig } from './types'
import { YAML } from 'bun'
import * as fs from 'node:fs'
import * as path from 'node:path'

export interface RssFeedConfig {
  /**
   * Enable RSS feed generation
   * @default false
   */
  enabled?: boolean

  /**
   * Feed title
   */
  title?: string

  /**
   * Feed description
   */
  description?: string

  /**
   * Feed author name
   */
  author?: string

  /**
   * Feed author email
   */
  email?: string

  /**
   * Feed language (e.g., 'en-us')
   * @default 'en-us'
   */
  language?: string

  /**
   * Output filename
   * @default 'feed.xml'
   */
  filename?: string

  /**
   * Maximum number of items in feed
   * @default 20
   */
  maxItems?: number

  /**
   * Include full content in feed items
   * @default false
   */
  fullContent?: boolean
}

interface RssItem {
  title: string
  link: string
  description: string
  pubDate: Date
  author?: string
  content?: string
}

/**
 * Generate RSS feed from markdown files
 */
export async function generateRssFeed(
  docsDir: string,
  outputDir: string,
  config: BunPressConfig,
  rssConfig?: RssFeedConfig,
): Promise<void> {
  if (!rssConfig?.enabled) {
    return
  }

  const baseUrl = config.sitemap?.baseUrl
  if (!baseUrl) {
    if (config.verbose) {
      console.warn('⚠️  RSS feed generation skipped: baseUrl not configured')
    }
    return
  }

  const feedTitle = rssConfig.title || config.title || config.markdown?.title || 'Documentation Feed'
  const feedDescription = rssConfig.description || config.description || config.markdown?.meta?.description || 'Documentation updates'
  const feedAuthor = rssConfig.author || 'Documentation Team'
  const feedEmail = rssConfig.email || ''
  const feedLanguage = rssConfig.language || 'en-us'
  const filename = rssConfig.filename || 'feed.xml'
  const maxItems = rssConfig.maxItems || 20
  const fullContent = rssConfig.fullContent || false

  // Collect RSS items
  const items = await collectRssItems(docsDir, baseUrl, fullContent)

  // Sort by date (newest first)
  items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())

  // Limit number of items
  const limitedItems = items.slice(0, maxItems)

  // Generate RSS XML
  const xml = generateRssXml({
    title: feedTitle,
    description: feedDescription,
    link: baseUrl,
    language: feedLanguage,
    author: feedAuthor,
    email: feedEmail,
    items: limitedItems,
  })

  const outputPath = path.join(outputDir, filename)
  await fs.promises.writeFile(outputPath, xml, 'utf-8')

  if (config.verbose) {
    console.log(`✅ RSS feed generated: ${outputPath} (${limitedItems.length} items)`)
  }
}

/**
 * Collect RSS items from markdown files
 */
async function collectRssItems(
  docsDir: string,
  baseUrl: string,
  fullContent: boolean,
): Promise<RssItem[]> {
  const items: RssItem[] = []
  const files = await findMarkdownFiles(docsDir)

  for (const filePath of files) {
    const content = await fs.promises.readFile(filePath, 'utf-8')
    const { frontmatter, markdown } = parseFrontmatter(content)

    // Skip files without date or title
    if (!frontmatter.date || !frontmatter.title) {
      continue
    }

    const relativePath = path.relative(docsDir, filePath)
    let url = relativePath
      .replace(/\.md$/, '')
      .replace(/index$/, '')
      .replace(/\\/g, '/')

    if (!url.startsWith('/')) {
      url = `/${url}`
    }
    if (url.endsWith('/') && url !== '/') {
      url = url.slice(0, -1)
    }

    const link = `${baseUrl.replace(/\/$/, '')}${url}`
    const description = frontmatter.description || extractDescription(markdown)
    const pubDate = new Date(frontmatter.date)
    const author = frontmatter.author

    items.push({
      title: frontmatter.title,
      link,
      description,
      pubDate,
      author,
      content: fullContent ? markdown : undefined,
    })
  }

  return items
}

/**
 * Find all markdown files recursively
 */
async function findMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = []

  async function walk(currentDir: string) {
    const entries = await fs.promises.readdir(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)

      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await walk(fullPath)
        }
      }
      else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath)
      }
    }
  }

  await walk(dir)
  return files
}

/**
 * Parse frontmatter from markdown
 */
function parseFrontmatter(content: string): { frontmatter: any, markdown: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n?/
  const match = content.match(frontmatterRegex)

  if (!match) {
    return { frontmatter: {}, markdown: content }
  }

  const frontmatterText = match[1]
  const markdown = content.slice(match[0].length)

  try {
    const frontmatter = YAML.parse(frontmatterText)
    return { frontmatter, markdown }
  }
  catch {
    return { frontmatter: {}, markdown: content }
  }
}

/**
 * Extract description from markdown content
 */
function extractDescription(markdown: string, maxLength: number = 200): string {
  // Remove headings, code blocks, and other formatting
  const text = markdown
    .replace(/^#{1,6}\s+(?:\S.*|[\t\v\f \xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF])$/gm, '') // Remove headings
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
    .replace(/[*_~]/g, '') // Remove formatting
    .trim()

  // Take first paragraph
  const firstParagraph = text.split('\n\n')[0] || text

  // Truncate to max length
  if (firstParagraph.length > maxLength) {
    return `${firstParagraph.slice(0, maxLength)}...`
  }

  return firstParagraph
}

/**
 * Generate RSS XML
 */
function generateRssXml(feed: {
  title: string
  description: string
  link: string
  language: string
  author: string
  email: string
  items: RssItem[]
}): string {
  const now = new Date()
  const lastBuildDate = feed.items.length > 0 ? feed.items[0].pubDate : now

  const items = feed.items.map((item) => {
    const content = item.content
      ? `\n    <content:encoded><![CDATA[${item.content}]]></content:encoded>`
      : ''

    const author = item.author
      ? `\n    <dc:creator><![CDATA[${item.author}]]></dc:creator>`
      : ''

    return `  <item>
    <title><![CDATA[${item.title}]]></title>
    <link>${item.link}</link>
    <guid>${item.link}</guid>
    <description><![CDATA[${item.description}]]></description>
    <pubDate>${item.pubDate.toUTCString()}</pubDate>${author}${content}
  </item>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${feed.title}]]></title>
    <description><![CDATA[${feed.description}]]></description>
    <link>${feed.link}</link>
    <language>${feed.language}</language>
    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>
    <atom:link href="${feed.link}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`
}
