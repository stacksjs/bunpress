/* eslint-disable no-console */
import type { BunPressConfig } from './types'
import { YAML } from 'bun'
import process from 'node:process'
import { config } from './config'
import { clearTemplateCache, render } from './template-loader'

/**
 * Generate sidebar HTML from BunPress config
 */
async function generateSidebar(config: BunPressConfig, currentPath: string): Promise<string> {
  if (!config.markdown?.sidebar) {
    return ''
  }

  // Get sidebar for current path or default '/' sidebar
  const pathKey = Object.keys(config.markdown.sidebar).find(key =>
    currentPath.startsWith(key),
  ) || '/'

  const sidebarSections = config.markdown.sidebar[pathKey] || []

  const sectionsHtml = await Promise.all(sidebarSections.map(async (section) => {
    const itemsHtml = section.items
      ? section.items.map((item) => {
          const isActive = item.link === currentPath
          return `<li><a href="${item.link}" class="block py-1.5 px-6 text-[#476582] no-underline text-sm hover:text-[#3451b2] ${isActive ? 'text-[#3451b2] font-medium border-r-2 border-[#3451b2]' : ''}">${item.text}</a></li>`
        }).join('')
      : ''

    return await render('sidebar-section', {
      title: section.text,
      items: itemsHtml,
    })
  }))

  return await render('sidebar', {
    sections: sectionsHtml.join(''),
  })
}

/**
 * Extract headings from HTML content and generate page TOC
 */
async function generatePageTOC(html: string): Promise<string> {
  // Extract h2, h3, h4 headings from HTML
  const headingRegex = /<h([234])([^>]*)>(.*?)<\/h\1>/g
  const headings: Array<{ level: number, text: string, id: string }> = []

  let match
  while ((match = headingRegex.exec(html)) !== null) {
    const level = Number.parseInt(match[1])
    const attributes = match[2]
    let text = match[3]

    // Remove HTML tags from text
    text = text.replace(/<[^>]*>/g, '')

    // Extract or generate ID
    const idMatch = attributes.match(/id="([^"]*)"/)
    const id = idMatch ? idMatch[1] : text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')

    headings.push({ level, text, id })
  }

  if (headings.length === 0) {
    return ''
  }

  // Generate TOC items HTML
  const items = headings.map((heading) => {
    const levelClass = heading.level > 2 ? `level-${heading.level}` : ''
    return `<a href="#${heading.id}" class="${levelClass}">${heading.text}</a>`
  }).join('\n      ')

  return await render('page-toc', { items })
}

/**
 * Add IDs to headings in HTML content
 */
function addHeadingIds(html: string): string {
  return html.replace(/<h([234])([^>]*)>(.*?)<\/h\1>/g, (match, level, attributes, text) => {
    // Check if ID already exists
    if (attributes.includes('id=')) {
      return match
    }

    // Generate ID from text
    const plainText = text.replace(/<[^>]*>/g, '')
    const id = plainText.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')

    return `<h${level}${attributes} id="${id}">${text}</h${level}>`
  })
}

/**
 * Generate navigation HTML from BunPress config
 */
function generateNav(config: BunPressConfig): string {
  if (!config.nav || config.nav.length === 0) {
    return ''
  }

  const links = config.nav.map((item) => {
    // Handle items with sub-items (dropdown)
    if (item.items && item.items.length > 0) {
      return `<div class="relative group">
        <button class="text-[14px] font-medium text-[#213547] hover:text-[#5672cd] transition-colors cursor-pointer flex items-center gap-1">
          ${item.text}
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        <div class="hidden group-hover:block absolute top-full right-0 bg-white border border-[#e2e2e3] rounded-lg shadow-lg min-w-[160px] py-2 mt-2">
          ${item.items.map(subItem =>
            `<a href="${subItem.link}" class="block px-4 py-2 text-[13px] text-[#213547] hover:bg-[#f6f6f7] hover:text-[#5672cd] transition-colors">${subItem.text}</a>`,
          ).join('')}
        </div>
      </div>`
    }
    else {
      return `<a href="${item.link}" class="text-[14px] font-medium text-[#213547] hover:text-[#5672cd] transition-colors">${item.text}</a>`
    }
  }).join('')

  return links
}

/**
 * Wrap content in BunPress documentation layout
 */
async function wrapInLayout(content: string, config: BunPressConfig, currentPath: string, isHome: boolean = false): Promise<string> {
  const title = config.markdown?.title || 'BunPress Documentation'
  const description = config.markdown?.meta?.description || 'Documentation built with BunPress'
  const customCSS = config.markdown?.css || ''

  const meta = Object.entries(config.markdown?.meta || {})
    .filter(([key]) => key !== 'description')
    .map(([key, value]) => `<meta name="${key}" content="${value}">`)
    .join('\n  ')

  const scripts = config.markdown?.scripts?.map(script => `<script src="${script}"></script>`).join('\n') || ''

  // Home layout - no sidebar, no navigation, clean hero layout
  if (isHome) {
    return await render('layout-home', {
      title,
      description,
      meta,
      customCSS,
      content,
      scripts,
    })
  }

  // Documentation layout - with sidebar
  // Add IDs to headings and generate page TOC
  const contentWithIds = addHeadingIds(content)
  const pageTOC = await generatePageTOC(contentWithIds)

  return await render('layout-doc', {
    title,
    description,
    meta,
    customCSS,
    nav: generateNav(config),
    sidebar: await generateSidebar(config, currentPath),
    content: contentWithIds,
    pageTOC,
    scripts,
  })
}

/**
 * Parse YAML frontmatter from markdown using Bun's native YAML parser
 */
function parseFrontmatter(markdown: string): { frontmatter: any, content: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n?/
  const match = markdown.match(frontmatterRegex)

  if (!match) {
    return { frontmatter: {}, content: markdown }
  }

  const frontmatterText = match[1]
  const content = markdown.slice(match[0].length)

  try {
    // Use Bun's native YAML parser
    const frontmatter = YAML.parse(frontmatterText)
    return { frontmatter, content }
  }
  catch (error) {
    console.error('Failed to parse frontmatter YAML:', error)
    return { frontmatter: {}, content: markdown }
  }
}

/**
 * Generate hero section HTML from frontmatter
 */
async function generateHero(hero: any): Promise<string> {
  if (!hero)
    return ''

  const name = hero.name ? `<h1 class="text-[32px] leading-[40px] md:text-[48px] md:leading-[56px] font-bold tracking-tight text-[#5672cd] mb-3">${hero.name}</h1>` : ''
  const text = hero.text ? `<p class="text-[32px] leading-[40px] md:text-[56px] md:leading-[64px] font-bold tracking-tight text-[#213547]">${hero.text}</p>` : ''
  const tagline = hero.tagline ? `<p class="mt-4 text-[16px] md:text-[18px] leading-[28px] text-[#476582] font-medium">${hero.tagline}</p>` : ''

  let actions = ''
  if (hero.actions) {
    const actionButtons = hero.actions.map((action: any) => {
      const isPrimary = action.theme === 'brand'
      return `<a href="${action.link}" class="inline-block ${isPrimary
        ? 'bg-[#5672cd] text-white px-4 py-2 rounded-[20px] font-medium text-[14px] transition-colors hover:bg-[#4558b8]'
        : 'bg-[#f6f6f7] text-[#213547] px-4 py-2 rounded-[20px] font-medium text-[14px] border border-[#e2e2e3] transition-colors hover:bg-[#e7e7e8] hover:border-[#d0d0d1]'}">${action.text}</a>`
    }).join('')
    actions = `<div class="mt-8 flex flex-wrap items-center gap-3">${actionButtons}</div>`
  }

  return await render('hero', {
    name,
    text,
    tagline,
    actions,
  })
}

/**
 * Generate features grid HTML from frontmatter
 */
async function generateFeatures(features: any[]): Promise<string> {
  if (!features || features.length === 0)
    return ''

  const items = features.map(feature => `
    <div class="relative bg-[#f6f6f7] p-6 rounded-xl border border-[#e2e2e3] hover:border-[#5672cd] transition-colors">
      ${feature.icon ? `<div class="text-[40px] mb-3">${feature.icon}</div>` : ''}
      <h3 class="text-[18px] font-semibold text-[#213547] mb-2 leading-[24px]">${feature.title || ''}</h3>
      <p class="text-[14px] text-[#476582] leading-[22px]">${feature.details || ''}</p>
    </div>
  `).join('')

  return await render('features', {
    items,
  })
}

/**
 * Process inline markdown formatting
 * Supports: bold, italic, strikethrough, code, links, subscript, superscript, mark
 */
function processInlineFormatting(text: string): string {
  return text
    // Bold - both ** and __
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Strikethrough ~~
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Mark/highlight ==
    .replace(/==(.+?)==/g, '<mark>$1</mark>')
    // Superscript ^
    .replace(/\^(.+?)\^/g, '<sup>$1</sup>')
    // Code ` (before italic to avoid conflicts)
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Italic - both * and _ (single, not double)
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    .replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>')
    // Subscript ~ (single, not double like strikethrough)
    .replace(/(?<!~)~(?!~)(.+?)(?<!~)~(?!~)/g, '<sub>$1</sub>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
}

/**
 * Process GitHub-flavored alerts like > [!NOTE], > [!TIP], etc.
 */
async function processGitHubAlerts(content: string): Promise<string> {
  const alertRegex = /^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n((?:>\s*.*\n?)*)/gm

  const matches = Array.from(content.matchAll(alertRegex))

  let result = content
  for (const match of matches.reverse()) {
    const [fullMatch, type, alertContent] = match

    // Remove the > prefix from each line of content
    const processedContent = alertContent
      .split('\n')
      .map(line => line.replace(/^>\s*/, ''))
      .filter(line => line.trim())
      .map(line => `<p>${processInlineFormatting(line)}</p>`)
      .join('\n')

    const alertType = type.toLowerCase()
    const alertHtml = await render(`blocks/alerts/${alertType}`, {
      content: processedContent,
    })

    result = result.slice(0, match.index) + alertHtml + result.slice(match.index! + fullMatch.length)
  }

  return result
}

/**
 * Process custom containers like ::: info, ::: tip, etc.
 */
async function processContainers(content: string): Promise<string> {
  const containerRegex = /^:::\s+(info|tip|warning|danger|details|raw)(?: (.+?))?\s*?\n([\s\S]*?)^:::$/gm

  const matches = Array.from(content.matchAll(containerRegex))

  let result = content
  for (const match of matches.reverse()) { // Process in reverse to maintain correct indices
    const [fullMatch, type, customTitle, innerContent] = match
    const defaultTitles: Record<string, string> = {
      info: 'INFO',
      tip: 'TIP',
      warning: 'WARNING',
      danger: 'DANGER',
      details: 'Details',
      raw: '',
    }

    const title = (customTitle && customTitle.trim()) || defaultTitles[type]

    // Process inner content (convert markdown to HTML)
    const processedContent = innerContent
      .trim()
      .split('\n')
      .filter(line => line.trim())
      .map(line => `<p>${processInlineFormatting(line)}</p>`)
      .join('\n')

    const containerHtml = await render(`blocks/containers/${type}`, {
      title,
      content: processedContent,
    })

    result = result.slice(0, match.index) + containerHtml + result.slice(match.index! + fullMatch.length)
  }

  return result
}

/**
 * Simple markdown to HTML converter (placeholder until full markdown plugin is enabled)
 */
async function markdownToHtml(markdown: string): Promise<{ html: string, frontmatter: any }> {
  // Parse frontmatter
  const { frontmatter, content } = parseFrontmatter(markdown)

  // If it's a home layout, generate hero and features
  if (frontmatter.layout === 'home') {
    const heroHtml = await generateHero(frontmatter.hero)
    const featuresHtml = await generateFeatures(frontmatter.features)
    return {
      html: heroHtml + featuresHtml,
      frontmatter,
    }
  }

  // Process GitHub alerts first, then custom containers
  let processedContent = await processGitHubAlerts(content)
  processedContent = await processContainers(processedContent)

  // Very basic markdown conversion - will be replaced with full plugin
  // Split into lines for better processing
  const lines = processedContent.split('\n')
  const html: string[] = []
  let inCodeBlock = false
  let inList = false
  let inContainer = false

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    // Skip container markers (already processed)
    if (line.trim().startsWith(':::')) {
      continue
    }

    // Skip lines inside containers and alerts (already processed)
    if (line.includes('<div class="custom-block') || line.includes('<details class="custom-block') || line.includes('<div class="github-alert')) {
      inContainer = true
    }
    if (inContainer) {
      html.push(line)
      if (line.includes('</div>') || line.includes('</details>')) {
        inContainer = false
      }
      continue
    }

    // Code blocks
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        const lang = line.substring(3).trim()
        html.push(`<pre><code class="language-${lang}">`)
        inCodeBlock = true
      }
      else {
        html.push('</code></pre>')
        inCodeBlock = false
      }
      continue
    }

    if (inCodeBlock) {
      html.push(line)
      continue
    }

    // Headings
    if (line.startsWith('### ')) {
      if (inList) {
        html.push('</ul>')
        inList = false
      }
      html.push(`<h3>${processInlineFormatting(line.substring(4))}</h3>`)
      continue
    }
    if (line.startsWith('## ')) {
      if (inList) {
        html.push('</ul>')
        inList = false
      }
      html.push(`<h2>${processInlineFormatting(line.substring(3))}</h2>`)
      continue
    }
    if (line.startsWith('# ')) {
      if (inList) {
        html.push('</ul>')
        inList = false
      }
      html.push(`<h1>${processInlineFormatting(line.substring(2))}</h1>`)
      continue
    }

    // Lists
    if (line.match(/^\s*[-*]\s+/)) {
      if (!inList) {
        html.push('<ul>')
        inList = true
      }
      html.push(`<li>${processInlineFormatting(line.replace(/^\s*[-*]\s+/, ''))}</li>`)
      continue
    }

    // Close list if we're in one and hit a non-list line
    if (inList && line.trim() !== '') {
      html.push('</ul>')
      inList = false
    }

    // Tables - detect start of table
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableRows: string[] = []
      let tableIndex = i

      // Collect all table rows
      while (tableIndex < lines.length && lines[tableIndex].trim().startsWith('|')) {
        tableRows.push(lines[tableIndex].trim())
        tableIndex++
      }

      if (tableRows.length >= 2) {
        // Process table
        const processCell = (cell: string) => {
          // Apply inline formatting
          return processInlineFormatting(cell.trim())
        }

        html.push('<table>')

        // Header row
        const headerCells = tableRows[0].split('|').filter(cell => cell.trim())
        html.push('  <thead>')
        html.push('    <tr>')
        headerCells.forEach((cell) => {
          html.push(`      <th>${processCell(cell)}</th>`)
        })
        html.push('    </tr>')
        html.push('  </thead>')

        // Body rows (skip separator row at index 1)
        if (tableRows.length > 2) {
          html.push('  <tbody>')
          for (let j = 2; j < tableRows.length; j++) {
            const cells = tableRows[j].split('|').filter(cell => cell.trim())
            html.push('    <tr>')
            cells.forEach((cell) => {
              html.push(`      <td>${processCell(cell)}</td>`)
            })
            html.push('    </tr>')
          }
          html.push('  </tbody>')
        }

        html.push('</table>')

        // Skip the lines we just processed
        i = tableIndex - 1
        continue
      }
    }

    // Empty lines
    if (line.trim() === '') {
      continue
    }

    // Regular paragraphs
    // Apply inline formatting: bold, italic, code, links, etc.
    line = processInlineFormatting(line)

    html.push(`<p>${line}</p>`)
  }

  // Close list if still open
  if (inList) {
    html.push('</ul>')
  }

  return {
    html: html.join('\n'),
    frontmatter,
  }
}

/**
 * Start the BunPress documentation server
 */
export async function startServer(options: {
  port?: number
  root?: string
  watch?: boolean
  config?: BunPressConfig
} = {}): Promise<{ server: any, url: string, stop: () => void }> {
  const bunPressConfig = options.config || config as BunPressConfig
  const port = options.port || 3000
  const root = options.root || './docs'

  const server = Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url)
      let path = url.pathname

      // Serve root as index
      if (path === '/') {
        path = '/index'
      }

      // Try to serve static files first (images, css, js, etc.)
      const staticExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.css', '.js', '.ico', '.woff', '.woff2', '.ttf']
      if (staticExtensions.some(ext => path.endsWith(ext))) {
        try {
          // Try root/public first
          const publicPath = `${root}/public${path}`
          const publicFile = Bun.file(publicPath)
          if (await publicFile.exists()) {
            return new Response(publicFile)
          }

          // Try root directly
          const rootPath = `${root}${path}`
          const rootFile = Bun.file(rootPath)
          if (await rootFile.exists()) {
            return new Response(rootFile)
          }
        }
        catch {
          // Continue to 404
        }
      }

      // Try to serve markdown file
      const mdPath = `${root}${path}.md`
      try {
        const mdFile = Bun.file(mdPath)
        if (await mdFile.exists()) {
          const markdown = await mdFile.text()
          const { html, frontmatter } = await markdownToHtml(markdown)
          const isHome = frontmatter.layout === 'home'
          const wrappedHtml = await wrapInLayout(html, bunPressConfig, path, isHome)
          return new Response(wrappedHtml, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          })
        }
      }
      catch {
        // Continue to 404
      }

      // 404 response
      return new Response(
        await wrapInLayout(
          '<h1>404 - Page Not Found</h1><p>The page you are looking for does not exist.</p>',
          bunPressConfig,
          path,
        ),
        {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        },
      )
    },
  })

  const url = `http://localhost:${server.port}`
  const stop = () => server.stop()

  console.log(`\n📚 BunPress documentation server running at ${url}`)
  console.log('Press Ctrl+C to stop\n')

  return { server, url, stop }
}

/**
 * CLI-friendly server start function with graceful shutdown
 */
export async function serveCLI(options: {
  port?: number
  root?: string
  watch?: boolean
  config?: BunPressConfig
} = {}): Promise<void> {
  const { stop } = await startServer(options)
  const watch = options.watch !== undefined ? options.watch : true
  const root = options.root || './docs'

  // Watch for changes
  if (watch) {
    console.log(`Watching for changes in ${root} directory...\n`)

    try {
      const { Glob } = await import('bun')
      const { stat } = await import('node:fs/promises')
      const { join } = await import('node:path')

      // Track file modification times
      const fileStats = new Map<string, number>()

      // Initialize file stats
      const glob = new Glob('**/*.{md,stx,ts,js,css,html}')
      for await (const file of glob.scan(root)) {
        try {
          const filePath = join(root, file)
          const stats = await stat(filePath)
          fileStats.set(file, stats.mtimeMs)
        }
        catch {
          // Ignore files that can't be stat'd
        }
      }

      let timeout: Timer | null = null
      const rebuildDebounced = () => {
        if (timeout)
          clearTimeout(timeout)
        timeout = setTimeout(async () => {
          console.log('File changed detected, reloading...')
          // Clear template cache to pick up template changes
          clearTemplateCache()
          // The server will automatically serve the updated files on next request
          console.log('Ready for requests')
        }, 100) // Debounce 100ms
      }

      // Use file polling for simplicity
      setInterval(async () => {
        try {
          let hasChanges = false
          const currentFiles = new Set<string>()

          const glob = new Glob('**/*.{md,stx,ts,js,css,html}')
          for await (const file of glob.scan(root)) {
            currentFiles.add(file)
            try {
              const filePath = join(root, file)
              const stats = await stat(filePath)
              const lastMtime = fileStats.get(file)

              // Check if file is new or modified
              if (lastMtime === undefined || stats.mtimeMs > lastMtime) {
                hasChanges = true
                fileStats.set(file, stats.mtimeMs)
              }
            }
            catch {
              // Ignore files that can't be stat'd
            }
          }

          // Check for deleted files
          for (const trackedFile of fileStats.keys()) {
            if (!currentFiles.has(trackedFile)) {
              hasChanges = true
              fileStats.delete(trackedFile)
            }
          }

          if (hasChanges) {
            rebuildDebounced()
          }
        }
        catch {
          // Ignore errors during polling
        }
      }, 1000) // Check every second
    }
    catch (err) {
      console.error('Error setting up file watcher:', err)
    }
  }

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down server...')
    stop()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    console.log('\nShutting down server...')
    stop()
    process.exit(0)
  })

  // Keep process alive
  await new Promise(() => {})
}

// Start server if run directly
if (import.meta.main) {
  serveCLI().catch(console.error)
}
