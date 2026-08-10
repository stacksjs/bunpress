import * as fs from 'node:fs'
import * as path from 'node:path'
import { YAML } from 'bun'
import { colorize, logError, logInfo, logSuccess, logWarning, table } from '../utils'
import { config } from '../../src/config'
import type { BunPressConfig } from '../../src/types'
import { stripFencedCode } from '../../src/markdown-fences'
import { generateSlug } from '../../src/toc'

interface SeoIssue {
  type: 'error' | 'warning'
  category: string
  file: string
  message: string
}

interface SeoReport {
  totalPages: number
  errors: SeoIssue[]
  warnings: SeoIssue[]
  passed: number
}

/**
 * Check SEO for all documentation pages
 */
export async function seoCheck(options: {
  dir?: string
  fix?: boolean
} = {}): Promise<void> {
  const bunPressConfig = await config as BunPressConfig
  const docsDir = options.dir || bunPressConfig.docsDir || './docs'
  const fix = options.fix || false

  logInfo('🔍 Running SEO checks...')
  console.log('')

  // Check if docs directory exists
  if (!fs.existsSync(docsDir)) {
    logError(`Documentation directory not found: ${docsDir}`)
    process.exit(1)
  }

  const report: SeoReport = {
    totalPages: 0,
    errors: [],
    warnings: [],
    passed: 0,
  }

  // Find all markdown files
  const files = await findMarkdownFiles(docsDir)
  report.totalPages = files.length

  // Check each file
  for (const filePath of files) {
    await checkFile(filePath, docsDir, report, fix)
  }

  // Nav and sidebar links appear on every page, so one broken entry there is
  // the most-visible kind of broken link — and the only one no page's own
  // content check can see.
  checkConfiguredLinks(bunPressConfig, docsDir, report)

  // Print report
  printReport(report)

  // Exit with error code if there are errors
  if (report.errors.length > 0) {
    process.exit(1)
  }
}

/**
 * Check a single markdown file for SEO issues
 */
async function checkFile(
  filePath: string,
  docsDir: string,
  report: SeoReport,
  fix: boolean,
): Promise<void> {
  const content = await fs.promises.readFile(filePath, 'utf-8')
  const { frontmatter, markdown } = parseFrontmatter(content)
  const relativePath = path.relative(docsDir, filePath)
  let hasIssues = false
  // In fix mode, normalize existing metadata too. This guarantees a prior
  // flow-style or hand-formatted header round-trips through the same valid
  // block serializer used for newly generated fields.
  let modified = fix && Object.keys(frontmatter).length > 0
  let newFrontmatter = { ...frontmatter }

  // Check for title
  //
  // A home-layout page has no `# heading` — its title comes from the hero, and
  // the renderer uses it for <title>. Reporting that as a missing title made
  // `seo:check` exit 1 on a correct landing page.
  const heroTitle = frontmatter.layout === 'home'
    ? (frontmatter.hero?.text || frontmatter.hero?.name)
    : undefined

  if (!frontmatter.title && heroTitle) {
    // Nothing to report: the page has a title, just not under that key.
  }
  else if (!frontmatter.title) {
    const title = extractTitleFromContent(markdown)
    if (!title) {
      report.errors.push({
        type: 'error',
        category: 'Title',
        file: relativePath,
        message: 'Missing title in frontmatter',
      })
      hasIssues = true
    }
    else if (fix) {
      newFrontmatter.title = title
      modified = true
      logInfo(`✓ Added title to ${relativePath}: "${title}"`)
    }
    else {
      report.warnings.push({
        type: 'warning',
        category: 'Title',
        file: relativePath,
        message: `No title in frontmatter (could extract: "${title}")`,
      })
      hasIssues = true
    }
  }
  else {
    // Check title length
    const titleLength = frontmatter.title.length
    if (titleLength > 60) {
      report.warnings.push({
        type: 'warning',
        category: 'Title',
        file: relativePath,
        message: `Title too long (${titleLength} chars, recommended <60)`,
      })
      hasIssues = true
    }
    else if (titleLength < 10) {
      report.warnings.push({
        type: 'warning',
        category: 'Title',
        file: relativePath,
        message: `Title too short (${titleLength} chars, recommended >10)`,
      })
      hasIssues = true
    }
  }

  // Check for description
  if (!frontmatter.description) {
    const description = extractDescription(markdown)
    if (fix) {
      newFrontmatter.description = description
      modified = true
      logInfo(`✓ Added description to ${relativePath}`)
    }
    else {
      report.warnings.push({
        type: 'warning',
        category: 'Description',
        file: relativePath,
        message: 'Missing description in frontmatter',
      })
      hasIssues = true
    }
  }
  else {
    // Check description length
    const descLength = frontmatter.description.length
    if (descLength > 160) {
      report.warnings.push({
        type: 'warning',
        category: 'Description',
        file: relativePath,
        message: `Description too long (${descLength} chars, recommended <160)`,
      })
      hasIssues = true
    }
    else if (descLength < 50) {
      report.warnings.push({
        type: 'warning',
        category: 'Description',
        file: relativePath,
        message: `Description too short (${descLength} chars, recommended >50)`,
      })
      hasIssues = true
    }
  }

  // Check for duplicate titles
  // This would require tracking all titles across files, skipping for now

  // Check for broken internal links
  const brokenLinks = findBrokenInternalLinks(markdown, docsDir, filePath)
  for (const link of brokenLinks) {
    report.errors.push({
      type: 'error',
      category: 'Links',
      file: relativePath,
      message: `Broken internal link: ${link}`,
    })
    hasIssues = true
  }

  // Check for missing alt text on images
  const imagesWithoutAlt = findImagesWithoutAlt(markdown)
  for (const image of imagesWithoutAlt) {
    report.warnings.push({
      type: 'warning',
      category: 'Images',
      file: relativePath,
      message: `Image missing alt text: ${image}`,
    })
    hasIssues = true
  }

  // Write back if modified
  if (modified) {
    const newContent = serializeFrontmatter(newFrontmatter, markdown)
    await fs.promises.writeFile(filePath, newContent, 'utf-8')
  }

  if (!hasIssues) {
    report.passed++
  }
}

/**
 * Walk the configured nav and sidebar and report entries that do not resolve.
 */
export function checkConfiguredLinks(config: BunPressConfig, docsDir: string, report: SeoReport): void {
  const seen = new Set<string>()

  const check = (link: unknown, source: string): void => {
    if (typeof link !== 'string' || !link.startsWith('/'))
      return
    const key = `${source}:${link}`
    if (seen.has(key))
      return
    seen.add(key)

    const [rawPath, fragment] = link.split('#')
    const resolved = resolveDocFile(path.resolve(docsDir, `.${rawPath}`))
    if (!resolved) {
      report.errors.push({ type: 'error', category: 'Links', file: source, message: `Broken link: ${link}` })
      return
    }
    if (fragment && !headingAnchors(resolved).has(fragment))
      report.errors.push({ type: 'error', category: 'Links', file: source, message: `Broken anchor: ${link}` })
  }

  const walk = (items: unknown, source: string): void => {
    if (!Array.isArray(items))
      return
    for (const item of items) {
      if (!item || typeof item !== 'object')
        continue
      const entry = item as { link?: unknown, items?: unknown }
      check(entry.link, source)
      walk(entry.items, source)
    }
  }

  walk(config.nav, 'config nav')
  walk(config.themeConfig?.nav, 'themeConfig nav')

  // Sidebars live in two places and take two shapes: a flat list, or groups
  // keyed by the path prefix they apply to.
  const sidebars: Array<[unknown, string]> = [
    [config.markdown?.sidebar, 'config sidebar'],
    [config.themeConfig?.sidebar, 'themeConfig sidebar'],
  ]

  for (const [sidebar, label] of sidebars) {
    if (Array.isArray(sidebar)) {
      walk(sidebar, label)
    }
    else if (sidebar && typeof sidebar === 'object') {
      for (const [prefix, group] of Object.entries(sidebar as Record<string, unknown>))
        walk(group, `${label} ${prefix}`)
    }
  }
}

/** Serialize frontmatter in block style with delimiters on their own lines. */
export function serializeFrontmatter(frontmatter: Record<string, unknown>, markdown: string): string {
  return `---\n${YAML.stringify(frontmatter, null, 2)}\n---\n${markdown}`
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
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'public') {
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
 * Extract title from markdown content
 */
function extractTitleFromContent(markdown: string): string | null {
  const h1Match = markdown.match(/^#\s+(.+)$/m)
  return h1Match ? h1Match[1].trim() : null
}

/**
 * Extract description from markdown content
 */
function extractDescription(markdown: string, maxLength: number = 155): string {
  // Remove headings, code blocks, and other formatting
  let text = markdown
    .replace(/^#{1,6}\s+.+$/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~]/g, '')
    .trim()

  // Take first paragraph
  const firstParagraph = text.split('\n\n')[0] || text

  // Truncate to max length
  if (firstParagraph.length > maxLength) {
    return `${firstParagraph.slice(0, maxLength)}...`
  }

  return firstParagraph || 'Documentation page'
}

/**
 * Find broken internal links in markdown
 */
export function findBrokenInternalLinks(
  markdown: string,
  docsDir: string,
  currentFile: string,
): string[] {
  const brokenLinks: string[] = []
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  // stripFencedCode pairs fences the way CommonMark does. The regex this
  // replaced desynced on a four-backtick block wrapping three-backtick ones,
  // which is how docs show examples — so example links were checked as if real.
  const searchableMarkdown = stripFencedCode(markdown)
    .replace(/`+[^`\n]*`+/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
  let match

  while ((match = linkRegex.exec(searchableMarkdown)) !== null) {
    const linkUrl = match[2].trim()

    // Skip external links and links handled by other protocols.
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(linkUrl)) {
      continue
    }

    const fragment = linkUrl.includes('#') ? linkUrl.slice(linkUrl.indexOf('#') + 1) : ''

    // A same-page anchor is checked against this page's own headings.
    if (linkUrl.startsWith('#')) {
      if (fragment && !headingAnchors(currentFile).has(fragment))
        brokenLinks.push(linkUrl)
      continue
    }

    const rawPath = linkUrl.split('#', 1)[0].split('?', 1)[0]
    if (!rawPath) {
      continue
    }

    let decodedPath: string
    try {
      decodedPath = decodeURIComponent(rawPath.replace(/^<|>$/g, ''))
    }
    catch {
      brokenLinks.push(linkUrl)
      continue
    }

    // Site-absolute links resolve from docsDir. Relative links resolve from
    // the current page, matching how BunPress maps markdown to URLs.
    const targetPath = decodedPath.startsWith('/')
      ? path.resolve(docsDir, `.${decodedPath}`)
      : path.resolve(path.dirname(currentFile), decodedPath)

    const resolved = resolveDocFile(targetPath)
    if (!resolved) {
      brokenLinks.push(linkUrl)
      continue
    }

    // The fragment used to be discarded, so a link to a real page with a
    // heading that does not exist read as healthy.
    if (fragment && !headingAnchors(resolved).has(fragment))
      brokenLinks.push(linkUrl)
  }

  return brokenLinks
}

/**
 * The markdown file serving a link target, or null.
 *
 * Each candidate must be a *file*: `/advanced` names both `advanced.md` and an
 * `advanced/` directory here, and a bare existence check happily returns the
 * directory, which then reads as a page with no headings at all.
 */
function resolveDocFile(target: string): string | null {
  const candidates = target.endsWith('.md')
    ? [target]
    : [target, `${target}.md`, path.join(target, 'index.md')]

  for (const candidate of candidates) {
    try {
      if (fs.statSync(candidate).isFile())
        return candidate
    }
    catch {
      // Missing candidate; try the next shape.
    }
  }
  return null
}

/**
 * Every anchor a page offers: one slug per heading, plus any explicit
 * `{#custom-id}`, matching how the renderer assigns heading ids.
 */
const anchorCache = new Map<string, Set<string>>()

export function headingAnchors(file: string): Set<string> {
  const cached = anchorCache.get(file)
  if (cached)
    return cached

  const anchors = new Set<string>()
  try {
    const source = stripFencedCode(fs.readFileSync(file, 'utf8'))
    for (const line of source.split('\n')) {
      const heading = line.match(/^#{1,6}\s+(.*)$/)
      if (!heading)
        continue

      const text = heading[1].trim()

      // An explicit {#id} replaces the generated slug rather than adding to
      // it, matching the renderer — so the heading text is NOT also an anchor.
      const custom = text.match(/\{#([\w-]+)\}\s*$/)
      if (custom) {
        anchors.add(custom[1])
        continue
      }

      const slug = generateSlug(text)
      if (!slug)
        continue

      // Repeated headings get -1, -2, … suffixes, so reserve them too rather
      // than reporting a legitimate deep link as broken.
      if (!anchors.has(slug)) {
        anchors.add(slug)
      }
      else {
        let n = 1
        while (anchors.has(`${slug}-${n}`)) n++
        anchors.add(`${slug}-${n}`)
      }
    }
  }
  catch {
    // An unreadable target is already reported as a broken page link.
  }

  anchorCache.set(file, anchors)
  return anchors
}

/**
 * Find images without alt text
 */
function findImagesWithoutAlt(markdown: string): string[] {
  const images: string[] = []
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  let match

  while ((match = imageRegex.exec(markdown)) !== null) {
    const altText = match[1]
    const imagePath = match[2]

    if (!altText || altText.trim() === '') {
      images.push(imagePath)
    }
  }

  return images
}

/**
 * Print SEO report
 */
function printReport(report: SeoReport): void {
  console.log('')
  logInfo('📊 SEO Report')
  console.log('')

  // Summary
  console.log(`Total pages checked: ${colorize(report.totalPages.toString(), 'blue')}`)
  console.log(`Passed: ${colorize(report.passed.toString(), 'green')}`)
  console.log(`Errors: ${colorize(report.errors.length.toString(), report.errors.length > 0 ? 'red' : 'green')}`)
  console.log(`Warnings: ${colorize(report.warnings.length.toString(), report.warnings.length > 0 ? 'yellow' : 'green')}`)
  console.log('')

  // Errors
  if (report.errors.length > 0) {
    logError(`✗ ${report.errors.length} errors found:`)
    console.log('')

    const errorTable = report.errors.map(issue => ({
      Category: issue.category,
      File: issue.file,
      Message: issue.message,
    }))

    table(errorTable)
    console.log('')
  }

  // Warnings
  if (report.warnings.length > 0) {
    logWarning(`⚠ ${report.warnings.length} warnings found:`)
    console.log('')

    const warningTable = report.warnings.map(issue => ({
      Category: issue.category,
      File: issue.file,
      Message: issue.message,
    }))

    table(warningTable)
    console.log('')
  }

  // Success message
  if (report.errors.length === 0 && report.warnings.length === 0) {
    logSuccess('✓ All SEO checks passed!')
  }
  else if (report.errors.length === 0) {
    logSuccess('✓ No errors found (only warnings)')
  }
}
