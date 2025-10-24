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
 * Supports custom IDs with {#custom-id} syntax
 */
function addHeadingIds(html: string): string {
  return html.replace(/<h([234])([^>]*)>(.*?)<\/h\1>/g, (match, level, attributes, text) => {
    // Check if ID already exists
    if (attributes.includes('id=')) {
      return match
    }

    // Check for custom ID syntax {#custom-id}
    const customIdMatch = text.match(/\s*\{#([\w-]+)\}\s*$/)
    let id: string
    let displayText = text

    if (customIdMatch) {
      // Use custom ID and remove the {#custom-id} from display text
      id = customIdMatch[1]
      displayText = text.replace(/\s*\{#[\w-]+\}\s*$/, '')
    }
    else {
      // Generate ID from text
      const plainText = text.replace(/<[^>]*>/g, '')
      id = plainText.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    }

    return `<h${level}${attributes} id="${id}">${displayText}</h${level}>`
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

  const scripts = config.markdown?.scripts?.map(script => `<script>${script}</script>`).join('\n') || ''

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
 * Process code imports from files
 * Syntax: <<< @/filepath or <<< @/filepath{1-10} or <<< @/filepath#region
 * Optional label: <<< @/filepath [label]
 */
async function processCodeImports(content: string, rootDir: string): Promise<string> {
  const importRegex = /^<<<\s+@\/(.+?)(?:\{(\d+)-(\d+)\}|#(\w+))?\s*(?:\[.+?\]\s*)?$/gm
  const matches = Array.from(content.matchAll(importRegex))

  let result = content
  for (const match of matches.reverse()) {
    const [fullMatch, filepath, startLine, endLine, regionName] = match

    try {
      // Resolve file path relative to root directory
      const { join } = await import('node:path')
      const fullPath = join(rootDir, filepath)

      // Read the file
      const file = Bun.file(fullPath)
      if (!(await file.exists())) {
        console.warn(`Code import: File not found: ${fullPath}`)
        continue
      }

      const fileContent = await file.text()
      let lines = fileContent.split('\n')

      // Extract language from file extension
      const ext = filepath.split('.').pop() || ''
      const langMap: Record<string, string> = {
        js: 'javascript',
        ts: 'typescript',
        jsx: 'jsx',
        tsx: 'tsx',
        py: 'python',
        rb: 'ruby',
        go: 'go',
        rs: 'rust',
        java: 'java',
        cpp: 'cpp',
        c: 'c',
        cs: 'csharp',
        php: 'php',
        sh: 'bash',
        bash: 'bash',
        yaml: 'yaml',
        yml: 'yaml',
        json: 'json',
        md: 'markdown',
        html: 'html',
        css: 'css',
        scss: 'scss',
        vue: 'vue',
      }
      const lang = langMap[ext] || ext

      // Process line range
      if (startLine && endLine) {
        const start = Number.parseInt(startLine) - 1 // Convert to 0-indexed
        const end = Number.parseInt(endLine)
        lines = lines.slice(start, end)
      }
      // Process region
      else if (regionName) {
        const regionStart = lines.findIndex(line =>
          line.includes(`#region ${regionName}`)
          || line.includes(`// region ${regionName}`)
          || line.includes(`# region ${regionName}`),
        )
        const regionEnd = lines.findIndex((line, idx) =>
          idx > regionStart && (line.includes('#endregion') || line.includes('// endregion') || line.includes('# endregion')),
        )

        if (regionStart !== -1 && regionEnd !== -1) {
          lines = lines.slice(regionStart + 1, regionEnd)
        }
        else {
          console.warn(`Code import: Region '${regionName}' not found in ${filepath}`)
        }
      }

      // Generate code block
      const code = lines.join('\n')
      const codeBlock = `\`\`\`${lang}\n${code}\n\`\`\``

      result = result.slice(0, match.index) + codeBlock + result.slice(match.index! + fullMatch.length)
    }
    catch (error) {
      console.error(`Error importing code from ${filepath}:`, error)
    }
  }

  return result
}

/**
 * Process code groups (tabbed code blocks)
 */
async function processCodeGroups(content: string): Promise<string> {
  const codeGroupRegex = /^:::\s+code-group\s*?\n([\s\S]*?)^:::$/gm
  const matches = Array.from(content.matchAll(codeGroupRegex))

  let result = content
  for (const match of matches.reverse()) {
    const [fullMatch, innerContent] = match

    // Extract individual code blocks with labels
    const codeBlockRegex = /^```(\w+)\s+\[(.+?)\]\s*?\n([\s\S]*?)^```$/gm
    const codeBlocks = Array.from(innerContent.matchAll(codeBlockRegex))

    if (codeBlocks.length === 0)
      continue

    // Generate unique ID for this code group
    const groupId = `code-group-${Math.random().toString(36).substr(2, 9)}`

    // Generate tab buttons HTML
    const tabsHtml = codeBlocks
      .map((block, index) => {
        const label = block[2]
        const isActive = index === 0
        return `<button class="code-group-tab ${isActive ? 'active' : ''}" onclick="switchCodeTab('${groupId}', ${index})">${label}</button>`
      })
      .join('')

    // Generate code panels HTML
    const panelsHtml = await Promise.all(
      codeBlocks.map(async (block, index) => {
        const lang = block[1]
        const code = block[3]
        const isActive = index === 0

        // Escape HTML in code
        const escapedCode = code
          .split('\n')
          .map(line =>
            line
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;'),
          )
          .map(line => `<span>${line}</span>`)
          .join('\n')

        return `<div class="code-group-panel ${isActive ? 'active' : ''}" data-panel="${index}">
  <pre><code class="language-${lang}">${escapedCode}</code></pre>
</div>`
      }),
    )

    const codeGroupHtml = `<div class="code-group" id="${groupId}">
  <div class="code-group-tabs">
    ${tabsHtml}
  </div>
  <div class="code-group-panels">
    ${panelsHtml.join('\n')}
  </div>
</div>`

    result = result.slice(0, match.index) + codeGroupHtml + result.slice(match.index! + fullMatch.length)
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
 * Parse code fence info string to extract language, line highlights, and flags
 * Examples:
 * - js{4} -> { lang: 'js', highlights: [4], showLineNumbers: false }
 * - ts{1,4,6-8}:line-numbers -> { lang: 'ts', highlights: [1,4,6,7,8], showLineNumbers: true }
 */
function parseCodeFenceInfo(infoString: string): {
  lang: string
  highlights: number[]
  showLineNumbers: boolean
} {
  // Extract language (everything before { or :)
  const langMatch = infoString.match(/^(\w+)/)
  const lang = langMatch ? langMatch[1] : ''

  // Extract line highlights
  const highlightMatch = infoString.match(/\{([^}]+)\}/)
  const highlights: number[] = []

  if (highlightMatch) {
    const ranges = highlightMatch[1].split(',')
    for (const range of ranges) {
      const trimmed = range.trim()
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(Number)
        for (let i = start; i <= end; i++) {
          highlights.push(i)
        }
      }
      else {
        highlights.push(Number(trimmed))
      }
    }
  }

  // Check for :line-numbers flag
  const showLineNumbers = infoString.includes(':line-numbers')

  return { lang, highlights, showLineNumbers }
}

/**
 * Process code blocks with advanced features (line highlighting, line numbers, focus, etc.)
 */
function processCodeBlock(lines: string[], startIndex: number): { html: string, endIndex: number } {
  const firstLine = lines[startIndex]
  const infoString = firstLine.substring(3).trim() // Remove ```

  // Parse info string
  const { lang, highlights, showLineNumbers } = parseCodeFenceInfo(infoString)

  // Collect code content
  const codeLines: string[] = []
  let endIndex = startIndex + 1

  while (endIndex < lines.length && !lines[endIndex].startsWith('```')) {
    codeLines.push(lines[endIndex])
    endIndex++
  }

  // Detect focus, diff, error, warning, and other markers
  const focusLines = new Set<number>()
  const diffAddLines = new Set<number>()
  const diffRemoveLines = new Set<number>()
  const errorLines = new Set<number>()
  const warningLines = new Set<number>()

  const processedLines = codeLines.map((line, index) => {
    let processedLine = line

    // Check for focus marker
    if (processedLine.includes('// [!code focus]')) {
      focusLines.add(index)
      processedLine = processedLine.replace(/\/\/ \[!code focus\]/, '').trimEnd()
    }

    // Check for diff add marker
    if (processedLine.includes('// [!code ++]')) {
      diffAddLines.add(index)
      processedLine = processedLine.replace(/\/\/ \[!code \+\+\]/, '').trimEnd()
    }

    // Check for diff remove marker
    if (processedLine.includes('// [!code --]')) {
      diffRemoveLines.add(index)
      processedLine = processedLine.replace(/\/\/ \[!code --\]/, '').trimEnd()
    }

    // Check for error marker
    if (processedLine.includes('// [!code error]')) {
      errorLines.add(index)
      processedLine = processedLine.replace(/\/\/ \[!code error\]/, '').trimEnd()
    }

    // Check for warning marker
    if (processedLine.includes('// [!code warning]')) {
      warningLines.add(index)
      processedLine = processedLine.replace(/\/\/ \[!code warning\]/, '').trimEnd()
    }

    return processedLine
  })

  const hasFocusedLines = focusLines.size > 0

  // Generate HTML with all features (highlighting, focus, diff, error, warning, line numbers)
  const codeHtml = processedLines
    .map((line, index) => {
      const lineNumber = index + 1
      const isHighlighted = highlights.includes(lineNumber)
      const isFocused = focusLines.has(index)
      const isDiffAdd = diffAddLines.has(index)
      const isDiffRemove = diffRemoveLines.has(index)
      const isError = errorLines.has(index)
      const isWarning = warningLines.has(index)

      const classes: string[] = []
      if (isHighlighted)
        classes.push('highlighted')
      if (isFocused)
        classes.push('focused')
      if (hasFocusedLines && !isFocused)
        classes.push('dimmed')
      if (isDiffAdd)
        classes.push('diff-add')
      if (isDiffRemove)
        classes.push('diff-remove')
      if (isError)
        classes.push('has-error')
      if (isWarning)
        classes.push('has-warning')

      const lineClass = classes.length > 0 ? ` class="${classes.join(' ')}"` : ''

      // Escape HTML entities in code
      const escapedLine = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

      // Add line number if enabled
      if (showLineNumbers) {
        return `<span${lineClass}><span class="line-number">${lineNumber}</span>${escapedLine}</span>`
      }

      return `<span${lineClass}>${escapedLine}</span>`
    })
    .join('\n')

  const preClasses: string[] = []
  if (showLineNumbers)
    preClasses.push('line-numbers-mode')
  if (hasFocusedLines)
    preClasses.push('has-focused-lines')

  const preClass = preClasses.length > 0 ? ` class="${preClasses.join(' ')}"` : ''
  const html = `<pre${preClass}><code class="language-${lang}">${codeHtml}</code></pre>`

  return { html, endIndex }
}

/**
 * Simple markdown to HTML converter (placeholder until full markdown plugin is enabled)
 */
async function markdownToHtml(markdown: string, rootDir: string = './docs'): Promise<{ html: string, frontmatter: any }> {
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

  // Process in order: code imports, code groups, GitHub alerts, then custom containers
  let processedContent = await processCodeImports(content, rootDir)
  processedContent = await processCodeGroups(processedContent)
  processedContent = await processGitHubAlerts(processedContent)
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
        // Process the entire code block
        const { html: codeHtml, endIndex } = processCodeBlock(lines, i)
        html.push(codeHtml)
        i = endIndex // Skip to end of code block
        inCodeBlock = false
      }
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
          const { html, frontmatter } = await markdownToHtml(markdown, root)
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
