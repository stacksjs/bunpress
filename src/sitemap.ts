import type { BunPressConfig, SitemapChangefreq, SitemapEntry } from './types'
import * as fs from 'node:fs'
import * as path from 'node:path'

/**
 * Generate XML sitemap from markdown files
 */
export async function generateSitemap(
  docsDir: string,
  outputDir: string,
  config: BunPressConfig,
): Promise<void> {
  const sitemapConfig = config.sitemap

  // Check if sitemap generation is enabled
  if (sitemapConfig?.enabled === false) {
    return
  }

  // Require baseUrl
  if (!sitemapConfig?.baseUrl) {
    if (config.verbose) {
      console.warn('⚠️  Sitemap generation skipped: baseUrl not configured')
    }
    return
  }

  const baseUrl = sitemapConfig.baseUrl.replace(/\/$/, '') // Remove trailing slash
  const filename = sitemapConfig.filename || 'sitemap.xml'
  const defaultPriority = sitemapConfig.defaultPriority ?? 0.5
  const defaultChangefreq: SitemapChangefreq = sitemapConfig.defaultChangefreq || 'monthly'
  const maxUrlsPerFile = sitemapConfig.maxUrlsPerFile || 50000
  const useSitemapIndex = sitemapConfig.useSitemapIndex || false

  // Find all markdown files
  const entries = await collectSitemapEntries(
    docsDir,
    baseUrl,
    defaultPriority,
    defaultChangefreq,
    sitemapConfig.exclude || [],
    sitemapConfig.priorityMap || {},
    sitemapConfig.changefreqMap || {},
  )

  // Apply custom transform if provided
  const transformedEntries = sitemapConfig.transform
    ? entries.map(entry => sitemapConfig.transform!(entry)).filter(Boolean) as SitemapEntry[]
    : entries

  // Log verbose output
  if (config.verbose) {
    console.log(`📄 Generated ${transformedEntries.length} sitemap entries`)
  }

  // Generate sitemap(s)
  if (useSitemapIndex && transformedEntries.length > maxUrlsPerFile) {
    await generateSitemapIndex(transformedEntries, outputDir, baseUrl, filename, maxUrlsPerFile)
  }
  else {
    const xml = generateSitemapXml(transformedEntries)
    const outputPath = path.join(outputDir, filename)
    await fs.promises.writeFile(outputPath, xml, 'utf-8')

    if (config.verbose) {
      console.log(`✅ Sitemap generated: ${outputPath}`)
    }
  }
}

/**
 * Collect sitemap entries from markdown files
 */
async function collectSitemapEntries(
  docsDir: string,
  baseUrl: string,
  defaultPriority: number,
  defaultChangefreq: SitemapChangefreq,
  exclude: string[],
  priorityMap: Record<string, number>,
  changefreqMap: Record<string, SitemapChangefreq>,
): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = []
  const files = await findMarkdownFiles(docsDir)

  for (const filePath of files) {
    const relativePath = path.relative(docsDir, filePath)
    let url = relativePath
      .replace(/\.md$/, '')
      .replace(/index$/, '')
      .replace(/\\/g, '/') // Windows support

    // Normalize URL
    if (!url.startsWith('/')) {
      url = `/${url}`
    }
    if (url.endsWith('/') && url !== '/') {
      url = url.slice(0, -1)
    }

    // Check exclusions
    if (isExcluded(url, exclude)) {
      continue
    }

    // Get file stats for lastmod
    const stats = await fs.promises.stat(filePath)
    const lastmod = stats.mtime.toISOString()

    // Determine priority
    let priority = defaultPriority
    for (const [pattern, customPriority] of Object.entries(priorityMap)) {
      if (matchesPattern(url, pattern)) {
        priority = customPriority
        break
      }
    }

    // Determine changefreq
    let changefreq = defaultChangefreq
    for (const [pattern, customChangefreq] of Object.entries(changefreqMap)) {
      if (matchesPattern(url, pattern)) {
        changefreq = customChangefreq
        break
      }
    }

    entries.push({
      url,
      lastmod,
      changefreq,
      priority,
    })
  }

  return entries
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
        // Skip node_modules, .git, etc.
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
 * Check if URL matches exclusion pattern
 */
function isExcluded(url: string, excludePatterns: string[]): boolean {
  for (const pattern of excludePatterns) {
    if (matchesPattern(url, pattern)) {
      return true
    }
  }
  return false
}

/**
 * Match URL against pattern (supports wildcards)
 */
function matchesPattern(url: string, pattern: string): boolean {
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/\*\*/g, '.*') // ** matches any path
    .replace(/\*/g, '[^/]*') // * matches any non-slash characters
    .replace(/\?/g, '.') // ? matches single character

  const regex = new RegExp(`^${regexPattern}$`)
  return regex.test(url)
}

/**
 * Generate sitemap XML
 */
function generateSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries.map((entry) => {
    const loc = entry.url
    const lastmod = entry.lastmod ? `\n    <lastmod>${formatDate(entry.lastmod)}</lastmod>` : ''
    const changefreq = entry.changefreq ? `\n    <changefreq>${entry.changefreq}</changefreq>` : ''
    const priority = entry.priority !== undefined ? `\n    <priority>${entry.priority.toFixed(1)}</priority>` : ''

    return `  <url>
    <loc>${loc}</loc>${lastmod}${changefreq}${priority}
  </url>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}

/**
 * Generate sitemap index for large sites
 */
async function generateSitemapIndex(
  entries: SitemapEntry[],
  outputDir: string,
  baseUrl: string,
  baseFilename: string,
  maxUrlsPerFile: number,
): Promise<void> {
  const chunks = chunkArray(entries, maxUrlsPerFile)
  const sitemapFiles: string[] = []

  // Generate individual sitemap files
  for (let i = 0; i < chunks.length; i++) {
    const filename = `sitemap-${i + 1}.xml`
    const xml = generateSitemapXml(chunks[i])
    const outputPath = path.join(outputDir, filename)
    await fs.promises.writeFile(outputPath, xml, 'utf-8')
    sitemapFiles.push(filename)
  }

  // Generate sitemap index
  const sitemaps = sitemapFiles.map((filename) => {
    const loc = `${baseUrl}/${filename}`
    const lastmod = new Date().toISOString()

    return `  <sitemap>
    <loc>${loc}</loc>
    <lastmod>${formatDate(lastmod)}</lastmod>
  </sitemap>`
  }).join('\n')

  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps}
</sitemapindex>`

  const indexPath = path.join(outputDir, baseFilename)
  await fs.promises.writeFile(indexPath, indexXml, 'utf-8')
}

/**
 * Format date for sitemap (YYYY-MM-DD)
 */
function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]
}

/**
 * Chunk array into smaller arrays
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}
