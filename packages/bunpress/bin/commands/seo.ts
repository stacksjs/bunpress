import * as fs from 'node:fs'
import * as path from 'node:path'
import { YAML } from 'bun'
import { colorize, logError, logInfo, logSuccess, logWarning, table } from '../utils'
import { config } from '../../src/config'
import type { BunPressConfig } from '../../src/types'

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
  let modified = false
  let newFrontmatter = { ...frontmatter }

  // Check for title
  if (!frontmatter.title) {
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
    const newContent = `---\n${YAML.stringify(newFrontmatter)}---\n${markdown}`
    await fs.promises.writeFile(filePath, newContent, 'utf-8')
  }

  if (!hasIssues) {
    report.passed++
  }
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
function findBrokenInternalLinks(
  markdown: string,
  docsDir: string,
  currentFile: string,
): string[] {
  const brokenLinks: string[] = []
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  let match

  while ((match = linkRegex.exec(markdown)) !== null) {
    const linkUrl = match[2]

    // Skip external links
    if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) {
      continue
    }

    // Skip anchors
    if (linkUrl.startsWith('#')) {
      continue
    }

    // Check if internal link exists
    const currentDir = path.dirname(currentFile)
    const targetPath = path.resolve(currentDir, linkUrl)

    // Try with .md extension
    const mdPath = targetPath.endsWith('.md') ? targetPath : `${targetPath}.md`

    // Check if file exists
    if (!fs.existsSync(mdPath) && !fs.existsSync(targetPath)) {
      brokenLinks.push(linkUrl)
    }
  }

  return brokenLinks
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
