import type { BunPlugin } from 'bun'
import type { Highlighter } from 'shiki'
import type { Frontmatter, MarkdownPluginOptions, NavItem, RobotsConfig, SearchConfig, SearchResult, SidebarItem, SitemapChangefreq, SitemapConfig, SitemapEntry, ThemeConfig } from './types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import matter from 'gray-matter'
import { marked } from 'marked'
import markedAlert from 'marked-alert'
import { markedEmoji } from 'marked-emoji'
import { markedHighlight } from 'marked-highlight'
import { createHighlighter } from 'shiki'

import { config } from './config'
import {
  enhanceHeadingsWithAnchors,
  generateTocData,
  generateTocPositions,
  generateTocScripts,
  generateTocStyles,
  processInlineTocSyntax,
} from './toc'

// Singleton highlighter to prevent creating multiple instances
let globalHighlighter: Highlighter | null = null
let highlighterPromise: Promise<Highlighter> | null = null
let instanceCount = 0

export async function getHighlighter(): Promise<Highlighter> {
  instanceCount++
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`Shiki highlighter requested (total requests: ${instanceCount})`)
  }
  if (globalHighlighter) {
    return globalHighlighter
  }

  if (highlighterPromise) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Waiting for existing highlighter promise')
    }
    return highlighterPromise
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn('Creating new highlighter instance')
  }
  highlighterPromise = createHighlighter({
    themes: ['light-plus', 'dark-plus'],
    langs: [
      'javascript',
      'typescript',
      'python',
      'css',
      'html',
      'json',
      'bash',
      'shell',
      'sql',
      'markdown',
      'yaml',
      'xml',
      'php',
      'java',
      'cpp',
      'c',
      'go',
      'rust',
      'ruby',
      'swift',
      'kotlin',
      'scala',
      'dart',
      'lua',
      'perl',
      'r',
      'matlab',
      'powershell',
      'dockerfile',
      'nginx',
      'apache',
      'toml',
      'ini',
      'diff',
      'log',
      'plaintext',
      // STX language support (treat as HTML)
      'html',
    ],
  })

  globalHighlighter = await highlighterPromise
  return globalHighlighter
}

// Cleanup function for tests and cleanup
export function disposeHighlighter(): void {
  instanceCount = 0
  if (globalHighlighter) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Disposing highlighter instance')
    }
    globalHighlighter.dispose()
    globalHighlighter = null
  }
  highlighterPromise = null
}

// No global storage needed - direct HTML replacement

/**
 * Process VitePress-style code groups
 * Replace ::: code-group markers directly with HTML
 */
function processCodeGroups(content: string): string {
  // Use a more specific regex that only matches proper code-group blocks
  // Make sure to not capture content after the code-group
  const codeGroupRegex = /::: code-group\n((?:(?!::: (?!code-group))[\s\S])*?)\n:::/g

  return content.replace(codeGroupRegex, (match, groupContent) => {
    const codeBlocks: Array<{ language: string, title: string, code: string }> = []

    // Extract all code blocks within the code group
    const codeBlockRegex = /```(\w+)(?:\s*\[([^\]]+)\])?\n([\s\S]*?)\n```/g
    let blockMatch

    while ((blockMatch = codeBlockRegex.exec(groupContent)) !== null) {
      const [, language, title, code] = blockMatch
      codeBlocks.push({
        language,
        title: title || language,
        code: code.trim(),
      })
    }

    if (codeBlocks.length === 0)
      return match

    const groupId = Math.random().toString(36).substr(2, 9)

    // Generate tabs
    const tabs = codeBlocks.map((block: any, index: number) => {
      const tabId = `tab-${groupId}-${index}`
      const checked = index === 0 ? 'checked' : ''
      return `<input type="radio" name="group-${groupId}" id="${tabId}" ${checked}><label data-title="${block.title}" for="${tabId}">${block.title}</label>`
    }).join('')

    // Generate code blocks with syntax highlighting
    const blocks = codeBlocks.map((block: any, index: number) => {
      const isActive = index === 0 ? 'active' : ''
      const copyButtonId = `copy-btn-${Math.random().toString(36).substr(2, 9)}`

      // Create highlighted code using the existing code block structure
      return `<div class="language-${block.language} vp-adaptive-theme ${isActive}">
<div class="code-block-container">
<button class="copy-code-btn" id="${copyButtonId}" onclick="copyToClipboard('${copyButtonId}', '${block.code.replace(/'/g, '\\\'').replace(/"/g, '\\&quot;')}')">Copy</button>
<pre><code class="language-${block.language}">${block.code}</code></pre>
</div>
</div>`
    }).join('')

    return `<div class="vp-code-group vp-adaptive-theme">
<div class="tabs">
${tabs}
</div>
<div class="blocks">
${blocks}
</div>
</div>`
  })
}

/**
 * Process VitePress-style containers (tip, warning, danger, etc.)
 * Replace entire container blocks with proper HTML
 */
async function processContainers(content: string, renderer: any, markedOptions: any, _highlighter: Highlighter | null = null): Promise<string> {
  // Match complete container blocks, but exclude code-group and code blocks
  // More flexible regex to handle various whitespace patterns
  const containerRegex = /^:::\s*(?!code-group)(\w+)(?:\s+(.*?))?\s*\n([\s\S]*?)\n:::$/gm

  const promises: Promise<{ match: string, replacement: string }>[] = []
  const matches: RegExpMatchArray[] = []

  let match
  while ((match = containerRegex.exec(content)) !== null) {
    matches.push(match)
  }

  for (const match of matches) {
    const [fullMatch, type, title, containerContent] = match
    const containerTitle = title || type.toUpperCase()

    // Process the content inside the container as markdown
    const processedResult = marked.parse(containerContent.trim(), {
      ...markedOptions,
      renderer,
    })

    // Handle both Promise and direct string returns from marked.parse
    if (processedResult instanceof Promise) {
      promises.push(processedResult.then(processedContainerContent => ({
        match: fullMatch,
        replacement: `<div class="${type} custom-block">
<p class="custom-block-title">${containerTitle}</p>
${processedContainerContent}
</div>`,
      })))
    } else {
      // Handle direct string return
      const processedContainerContent = processedResult as string
      promises.push(Promise.resolve({
        match: fullMatch,
        replacement: `<div class="${type} custom-block">
<p class="custom-block-title">${containerTitle}</p>
${processedContainerContent}
</div>`,
      }))
    }
  }

  const results = await Promise.all(promises)
  let result = content

  for (const { match, replacement } of results) {
    result = result.replace(match, replacement)
  }

  return result
}

/**
 * Process code groups from HTML (post markdown conversion)
 */
function processCodeGroupsFromHtml(html: string): string {
  // Match the pattern that markdown creates from ::: code-group ... :::
  const htmlCodeGroupRegex = /<p>::: code-group<\/p>([\s\S]*?)<p>:::<\/p>/g

  return html.replace(htmlCodeGroupRegex, (match, content) => {
    // Extract code blocks from the HTML content
    const codeBlockRegex = /<div class="code-block-container">\s*<button[^>]*>[^<]*<\/button>\s*<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>\s*<\/div>/g
    const codeBlocks: Array<{ language: string, title: string, code: string, html: string }> = []

    let blockMatch
    let currentLang = 'sh' // default
    let currentTitle = ''

    // Look for language indicators in the content
    const langMatches = content.match(/```(\w+)(?:\s*\[([^\]]+)\])?/g)
    let langIndex = 0

    while ((blockMatch = codeBlockRegex.exec(content)) !== null) {
      const [fullMatch, codeHtml] = blockMatch

      // Extract the actual code content from the HTML
      const codeText = codeHtml.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim()

      if (langMatches && langIndex < langMatches.length) {
        const langMatch = langMatches[langIndex].match(/```(\w+)(?:\s*\[([^\]]+)\])?/)
        if (langMatch) {
          currentLang = langMatch[1]
          currentTitle = langMatch[2] || currentLang
        }
      }

      codeBlocks.push({
        language: currentLang,
        title: currentTitle,
        code: codeText,
        html: fullMatch,
      })

      langIndex++
    }

    if (codeBlocks.length === 0)
      return match

    const groupId = Math.random().toString(36).substr(2, 9)

    // Generate tabs
    const tabs = codeBlocks.map((block, index) => {
      const tabId = `tab-${groupId}-${index}`
      const checked = index === 0 ? 'checked' : ''
      return `<input type="radio" name="group-${groupId}" id="${tabId}" ${checked}><label data-title="${block.title}" for="${tabId}">${block.title}</label>`
    }).join('')

    // Generate code blocks with proper class names
    const blocks = codeBlocks.map((block, index) => {
      const isActive = index === 0 ? 'active' : ''
      return `<div class="language-${block.language} vp-adaptive-theme ${isActive}">${block.html}</div>`
    }).join('')

    return `<div class="vp-code-group vp-adaptive-theme">
<div class="tabs">
${tabs}
</div>
<div class="blocks">
${blocks}
</div>
</div>`
  })
}

/**
 * Process containers from HTML (post markdown conversion)
 */
async function processContainersFromHtml(html: string, renderer: any, markedOptions: any, _highlighter: Highlighter | null = null): Promise<string> {
  // Match the pattern that markdown creates from ::: tip ... :::
  // Handle various cases of container markup in HTML
  // This includes cases where the container might be after other elements
  const htmlContainerRegex = /(?:<p>)?:::\s*(\w+)(?:\s+(.+?))?(?:<\/p>)?([\s\S]*?)(?:<p>)?:::(?:<\/p>)?/g

  const promises: Promise<{ match: string, replacement: string }>[] = []
  const matches: RegExpMatchArray[] = []

  let match
  while ((match = htmlContainerRegex.exec(html)) !== null) {
    matches.push(match)
  }

  for (const match of matches) {
    const [fullMatch, type, title, content] = match
    const containerTitle = title || type.toUpperCase()

    // Process the content inside the container as markdown
    const processedResult = marked.parse(content.trim(), {
      ...markedOptions,
      renderer,
    })

    // Handle both Promise and direct string returns from marked.parse
    if (processedResult instanceof Promise) {
      promises.push(processedResult.then(processedContainerContent => ({
        match: fullMatch,
        replacement: `<div class="${type} custom-block">
<p class="custom-block-title">${containerTitle}</p>
${processedContainerContent}
</div>`,
      })))
    } else {
      // Handle direct string return
      const processedContainerContent = processedResult as string
      promises.push(Promise.resolve({
        match: fullMatch,
        replacement: `<div class="${type} custom-block">
<p class="custom-block-title">${containerTitle}</p>
${processedContainerContent}
</div>`,
      }))
    }
  }

  const results = await Promise.all(promises)
  let result = html

  for (const { match, replacement } of results) {
    result = result.replace(match, replacement)
  }

  return result
}

/**
 * Process STX templates (HTML with Blade-like syntax)
 *
 * Converts STX template syntax to regular HTML
 */
export function processStxTemplate(content: string, frontmatter: any, globalConfig: any = {}): string {
  // Process @if/@else/@endif conditions
  let result = content.replace(/@if\(\$frontmatter\.([^)]+)\)([\s\S]*?)@endif/g, (_, path, fullContent) => {
    // Parse the dot path to get the actual value
    const parts = path.split('.')
    let value = frontmatter

    for (const part of parts) {
      if (value === undefined)
        return ''
      value = value[part]
    }

    // Split content by @else if it exists
    const elseIndex = fullContent.indexOf('@else')
    if (elseIndex !== -1) {
      const ifContent = fullContent.substring(0, elseIndex).trim()
      const elseContent = fullContent.substring(elseIndex + 5).trim() // +5 to skip '@else'
      return value ? ifContent : elseContent
    }
    else {
      // No @else, just return ifContent or empty
      return value ? fullContent.trim() : ''
    }
  })

  // Process @foreach loops
  result = result.replace(/@foreach\(\$frontmatter\.([^)]+) as \$([^)]+)\)([\s\S]*?)@endforeach/g, (_, path, itemVar, loopContent) => {
    // Parse the dot path to get the actual value
    const parts = path.split('.')
    let collection = frontmatter

    for (const part of parts) {
      if (collection === undefined)
        return ''
      collection = collection[part]
    }

    if (!collection)
      return ''

    // Handle both arrays and objects
    if (Array.isArray(collection)) {
      return collection.map((item, _index) => {
        // Replace each occurrence of the item variable with the actual value
        let processedContent = loopContent
        if (typeof item === 'object' && item !== null) {
          for (const [key, value] of Object.entries(item)) {
            const regex = new RegExp(`\\{\\{\\$${itemVar}\\.${key}\\}\\}`, 'g')
            processedContent = processedContent.replace(regex, String(value))
          }
        }
        else {
          // For primitive values, replace the item variable directly
          processedContent = processedContent.replace(new RegExp(`\\{\\{\\$${itemVar}\\}\\}`, 'g'), String(item))
        }
        return processedContent
      }).join('')
    }
    else if (typeof collection === 'object') {
      // Handle objects - iterate over key-value pairs
      const result = Object.entries(collection).map(([key, value]) => {
        let processedContent = loopContent
        // Replace $key with the object key (with optional spaces)
        processedContent = processedContent.replace(/\{\{\s*\$key\s*\}\}/g, key)
        // Replace $value with the object value (with optional spaces)
        processedContent = processedContent.replace(/\{\{\s*\$value\s*\}\}/g, String(value))
        return processedContent
      }).join('')
      return result
    }

    return ''
  })

  // Process {{ expressions }} for frontmatter variables
  result = result.replace(/\{\{\s*\$frontmatter\.([^}]+)\s*\}\}/g, (_, path) => {
    const trimmedPath = path.trim()

    // Handle expressions with default values (e.g., $frontmatter.title || 'Default')
    if (trimmedPath.includes(' || ')) {
      const [varPath, defaultValue] = trimmedPath.split(' || ')
      const parts = varPath.split('.')
      let value = frontmatter

      for (const part of parts) {
        if (value === undefined || value === null)
          break
        value = value[part]
      }

      // Return the value if it exists, otherwise return the default value
      return value !== undefined && value !== null ? String(value) : defaultValue.replace(/['"]/g, '')
    }

    // Parse the dot path to get the actual value
    const parts = trimmedPath.split('.')
    let value = frontmatter

    for (const part of parts) {
      if (value === undefined || value === null)
        return ''
      value = value[part]
    }

    return String(value || '')
  })

  // Process {{ expressions }} for global variables ($site, $config, etc.)
  result = result.replace(/\{\{\s*\$(\w+)\.([^}]+)\s*\}\}/g, (_, varName, path) => {
    const trimmedPath = path.trim()

    // Map variable names to their sources
    let source = globalConfig
    if (varName === 'site') {
      source = globalConfig // $site maps to global config
    }
    else if (varName === 'config') {
      source = globalConfig // $config also maps to global config
    }

    if (!source)
      return ''

    // Parse the dot path to get the actual value
    const parts = trimmedPath.split('.')
    let value = source

    for (const part of parts) {
      if (value === undefined || value === null)
        return ''
      value = value[part]
    }

    return String(value || '')
  })

  // Handle remaining @if conditions from loops
  result = result.replace(/@if\(\$(\w+)\.(\w+)\)([\s\S]*?)@endif/g, (_, varName, propName, content) => {
    // We can't fully resolve these at build time, but we can check if loop variables exist
    return content
  })

  return result
}

/**
 * Create HTML for a hero section using UnoCSS classes
 */
function createHeroHTML(hero: Frontmatter['hero']): string {
  if (!hero)
    return ''

  const actions = hero.actions?.map((action) => {
    const baseClasses = 'inline-flex items-center px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 whitespace-nowrap'
    const themeClasses = action.theme === 'brand'
      ? 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 hover:border-blue-700'
      : 'bg-transparent text-blue-600 border border-gray-300 hover:border-blue-600'

    return `<a href="${action.link}" class="${baseClasses} ${themeClasses}">
      ${action.text}
    </a>`
  }).join('\n') || ''

  return `
  <section class="pt-16 pb-12 px-6">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center gap-12">
        <div class="flex-1 text-left">
          ${hero.name ? `<h1 class="text-5xl font-semibold leading-none text-blue-600 mb-4">${hero.name}</h1>` : ''}
          ${hero.text ? `<h2 class="text-5xl font-bold leading-tight text-gray-900 mb-4">${hero.text}</h2>` : ''}
          ${hero.tagline ? `<p class="text-lg text-gray-600 mb-8 leading-relaxed">${hero.tagline}</p>` : ''}
          ${actions ? `<div class="flex flex-wrap gap-4 mt-8">${actions}</div>` : ''}
        </div>
        ${hero.image
          ? `<div class="flex-shrink-0 w-48 h-48 flex items-center justify-center">
          <img src="${hero.image}" alt="Hero Image" class="max-w-full max-h-full object-contain">
        </div>`
          : ''}
      </div>
    </div>
  </section>
  `
}

/**
 * Create HTML for features section using UnoCSS classes
 */
function createFeaturesHTML(features: Frontmatter['features']): string {
  if (!features || features.length === 0)
    return ''

  const featureItems = features.map(feature => `
    <div class="bg-gray-50 border border-gray-200 rounded-xl p-6 text-left">
      ${feature.icon ? `<div class="text-5xl mb-4">${feature.icon}</div>` : ''}
      <h2 class="text-xl font-semibold text-gray-900 mb-2">${feature.title}</h2>
      <p class="text-sm text-gray-600 leading-relaxed">${feature.details}</p>
    </div>
  `).join('\n')

  return `
  <section class="py-12 px-6">
    <div class="max-w-6xl mx-auto">
      <div class="grid grid-cols-4 gap-8">
        ${featureItems}
      </div>
    </div>
  </section>
  `
}

/**
 * Create HTML for navigation bar
 */
function createNavHtml(navItems: NavItem[], currentPath: string = '/'): string {
  if (!navItems || navItems.length === 0)
    return ''

  const navLinks = navItems.map((item) => {
    const isActive = isNavItemActive(item, currentPath)
    const hasChildren = item.items && item.items.length > 0

    if (hasChildren) {
      const dropdownItems = item.items!.map((child) => {
        const childIsActive = isNavItemActive(child, currentPath)
        const isExternal = child.link && (child.link.startsWith('http://') || child.link.startsWith('https://'))
        const externalAttrs = isExternal ? ' target="_blank" rel="noopener"' : ''
        return `<a href="${child.link || '#'}" class="nav-dropdown-item${childIsActive ? ' active' : ''}"${externalAttrs}>${child.icon ? `<span class="nav-icon">${child.icon}</span>` : ''}${child.text}</a>`
      }).join('\n')

      return `
        <div class="nav-item dropdown ${isActive ? 'active' : ''}">
          <button class="nav-link dropdown-toggle" aria-haspopup="true" aria-expanded="false">
            ${item.icon ? `<span class="nav-icon">${item.icon}</span>` : ''}${item.text}
          </button>
          <div class="nav-dropdown">
            ${dropdownItems}
          </div>
        </div>
      `
    }
    else {
      const isExternal = item.link && (item.link.startsWith('http://') || item.link.startsWith('https://'))
      const externalAttrs = isExternal ? ' target="_blank" rel="noopener"' : ''
      return `<a href="${item.link || '#'}" class="nav-link${isActive ? ' active' : ''}"${externalAttrs}>${item.icon ? `<span class="nav-icon">${item.icon}</span>` : ''}${item.text}</a>`
    }
  }).join('\n')

  return `
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <a href="/" class="nav-brand-link">BunPress</a>
        </div>
        <div class="nav-menu">
          ${navLinks}
        </div>
        <button class="nav-toggle" aria-label="Toggle navigation">
          <span class="hamburger"></span>
        </button>
      </div>
    </nav>
  `
}

/**
 * Check if a navigation item is active
 */
function isNavItemActive(item: NavItem, currentPath: string): boolean {
  if (item.link && currentPath === item.link)
    return true
  if (item.activeMatch && currentPath.startsWith(item.activeMatch))
    return true
  if (item.items) {
    return item.items.some(child => isNavItemActive(child, currentPath))
  }
  return false
}

/**
 * Create HTML for a home page layout
 */
function createHomePageHtml(frontmatter: Frontmatter, htmlContent: string, mdPath?: string, globalConfig?: any): string {
  // Check if we have a custom STX template for the Home component
  let stxTemplatePath = path.join(process.cwd(), 'dist/docs/Home.stx')

  // If we have a markdown path, also check for STX template in the same directory
  if (mdPath) {
    const mdDir = path.dirname(mdPath)
    const localStxPath = path.join(mdDir, 'Home.stx')
    if (fs.existsSync(localStxPath)) {
      stxTemplatePath = localStxPath
    }
  }

  if (fs.existsSync(stxTemplatePath)) {
    try {
      const stxTemplate = fs.readFileSync(stxTemplatePath, 'utf8')
      return processStxTemplate(stxTemplate, frontmatter, globalConfig)
    }
    catch (error) {
      console.error('Error processing STX template:', error)
      // Fall back to default implementation
    }
  }

  return `
    <div class="home-page">
      ${createHeroHTML(frontmatter.hero)}
      ${createFeaturesHTML(frontmatter.features)}
      <div class="max-w-4xl mx-auto px-6 py-8">
        ${htmlContent}
      </div>
    </div>
  `
}

/**
 * Create a Bun plugin that transforms markdown files into HTML
 *
 * @example
 * ```ts
 * // build.ts
 * import { markdown } from './plugin'
 *
 * await Bun.build({
 *   entrypoints: ['docs/index.md', 'docs/getting-started.md'],
 *   outdir: './dist',
 *   plugins: [markdown()],
 * })
 * ```
 */
// Export navigation, sidebar, search, and theme helper functions for testing
export {
  createNavHtml,
  createSearchHtml,
  createSidebarHtml,
  generateSearchIndex,
  generateThemeCSS,
  isNavItemActive,
  isSidebarItemActive,
  performSearch,
}

export function markdown(options: MarkdownPluginOptions = {}): BunPlugin {
  // Merge user options with defaults from config
  const defaultOptions = config.markdown || {}

  const {
    template,
    css = defaultOptions.css || '',
    scripts = defaultOptions.scripts || [],
    title: defaultTitle = defaultOptions.title,
    meta = { ...defaultOptions.meta, ...options.meta },
    markedOptions = defaultOptions.markedOptions || {},
    preserveDirectoryStructure = defaultOptions.preserveDirectoryStructure !== false,
  } = options

  // Sitemap and robots configuration
  const sitemapConfig = (options as any).sitemap || (config as any).sitemap || { enabled: true }
  const _robotsConfig = (options as any).robots || (config as any).robots || { enabled: true }

  // Track pages for sitemap generation
  const pages: Array<{ path: string, frontmatter: any }> = []

  return {
    name: 'markdown-plugin',
    setup(build) {
      let highlighter: Highlighter | null = null

      // Set up marked options for parsing
      const renderer = new marked.Renderer()

      build.onStart(async () => {
        // Initialize Shiki highlighter using singleton
        highlighter = await getHighlighter()

        // Configure marked extensions after highlighter is initialized
        marked.use(markedAlert())
        marked.use(markedEmoji({
          emojis: {
            heart: '❤️',
            thumbsup: '👍',
            smile: '😊',
            rocket: '🚀',
            sparkles: '✨',
            wave: '👋',
            bulb: '💡',
          },
        }))

        // Add Shiki highlighting
        marked.use(markedHighlight({
          highlight(code, lang) {
            if (!highlighter)
              return code

            try {
              const language = highlighter.getLoadedLanguages().includes(lang as any) ? lang : 'plaintext'
              const html = highlighter.codeToHtml(code, {
                lang: language,
                theme: 'light-plus',
              })

              // Ensure we return a string
              let htmlString: string
              if (typeof html === 'string') {
                htmlString = html
              }
              else if (html && typeof html === 'object' && 'toString' in html) {
                htmlString = (html as any).toString()
              }
              else {
                console.warn(`Unexpected type from Shiki codeToHtml:`, typeof html, html)
                return code
              }

              // Extract just the inner content (remove <pre><code> wrapper)
              const match = htmlString.match(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/s)
              return match ? match[1] : code
            }
            catch (error) {
              console.warn(`Shiki highlighting failed for language "${lang}":`, error)
              return code
            }
          },
        }))
      })

      // Custom math extension for inline and block math
      marked.use({
        extensions: [
          {
            name: 'inlineMath',
            level: 'inline' as const,
            start: (src: string): number => src.indexOf('$'),
            tokenizer(src: string) {
              const match = src.match(/^\$([^$\n]+)\$/)
              if (match) {
                return {
                  type: 'inlineMath' as const,
                  raw: match[0],
                  text: match[1],
                }
              }
            },
            renderer(token: any): string {
              return `<span class="math inline">${token.text}</span>`
            },
          },
          {
            name: 'blockMath',
            level: 'block' as const,
            start: (src: string): number => src.indexOf('$$'),
            tokenizer(src: string) {
              const match = src.match(/^\$\$([\s\S]*?)\$\$/)
              if (match) {
                return {
                  type: 'blockMath' as const,
                  raw: match[0],
                  text: match[1],
                }
              }
            },
            renderer(token: any): string {
              return `<div class="math block">${token.text}</div>`
            },
          },
        ],
      })

      // Custom renderer for code blocks with copy-to-clipboard and line highlighting
      const _originalCodeRenderer = renderer.code
      renderer.code = function (code: any, language?: string | undefined, _escaped?: boolean | undefined): string {
        // Ensure code is a string and handle object cases properly
        let codeString = ''
        if (typeof code === 'string') {
          codeString = code
        }
        else if (code && typeof code === 'object' && 'text' in code) {
          codeString = code.text || ''
        }
        else if (code && typeof code === 'object' && 'raw' in code) {
          codeString = code.raw || ''
        }
        else {
          codeString = String(code || '')
        }
        const langString = typeof language === 'string' ? language : ''

        // Handle line highlighting syntax: ```ts {1,3-5}
        let finalLanguage = langString || ''
        let lineNumbers: number[] = []
        let hasLineNumbers = false

        const match = langString?.match(/^(\w+)(?::line-numbers)?(?:\s*\{([^}]+)\})?$/)
        if (match) {
          const [_, lang, lines] = match
          finalLanguage = lang
          hasLineNumbers = langString?.includes(':line-numbers') || false

          if (lines) {
            // Parse line numbers: "1,3-5" -> [1, 3, 4, 5]
            lineNumbers = lines.split(',').flatMap((range) => {
              if (range.includes('-')) {
                const [start, end] = range.split('-').map(n => Number.parseInt(n))
                return Array.from({ length: end - start + 1 }, (_, i) => start + i)
              }
              return [Number.parseInt(range)]
            })
            hasLineNumbers = true
          }
        }

        // Apply syntax highlighting
        let highlightedCode = codeString
        let langClass = ''

        if (finalLanguage) {
          if (highlighter) {
            try {
              let language = finalLanguage
              // Handle STX files as HTML
              if (finalLanguage === 'stx') {
                language = 'html'
              }
              language = highlighter.getLoadedLanguages().includes(language as any) ? language : 'plaintext'
              const html = highlighter.codeToHtml(codeString, {
                lang: language,
                theme: 'light-plus',
              })

              // Extract the inner content and preserve classes
              const match = html.match(/<pre[^>]*class="([^"]*)"[^>]*><code[^>]*>(.*?)<\/code><\/pre>/s)
              if (match) {
                highlightedCode = match[2]
                // Use Shiki's classes and add our language class
                const shikiClasses = match[1]
                langClass = `${shikiClasses} language-${finalLanguage}`
              }
              else {
                // Fallback regex if the first one doesn't match
                const fallbackMatch = html.match(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/s)
                if (fallbackMatch) {
                  highlightedCode = fallbackMatch[1]
                  langClass = `language-${finalLanguage}`
                }
              }
            }
            catch (error) {
              console.warn(`Shiki highlighting failed for language "${finalLanguage}":`, error)
              langClass = `language-${finalLanguage}`
            }
          }
          else {
            // Fallback to basic highlighting
            langClass = `language-${finalLanguage}`
          }
        }

        // If we have line highlighting, wrap lines with classes
        if (lineNumbers.length > 0) {
          const lines = highlightedCode.split('\n')
          const highlightedLines = lines.map((line, index) => {
            const lineNum = index + 1
            const isHighlighted = lineNumbers.includes(lineNum)
            if (isHighlighted) {
              return `<span class="line-highlight">${line}</span>`
            }
            return line
          })
          highlightedCode = highlightedLines.join('\n')
        }

        const lineNumbersClass = hasLineNumbers ? 'line-numbers' : ''
        const copyButtonId = `copy-btn-${Math.random().toString(36).substr(2, 9)}`

        // Create the copy-to-clipboard button and functionality
        const copyButton = `<button class="copy-code-btn" id="${copyButtonId}" data-clipboard-text="${codeString.replace(/"/g, '&quot;')}" onclick="copyToClipboard('${copyButtonId}', '${codeString.replace(/'/g, '\\\'').replace(/"/g, '&quot;')}')">Copy</button>`

        return `<div class="code-block-container">
          ${copyButton}
          <pre><code class="${langClass} ${lineNumbersClass}">${highlightedCode}</code></pre>
        </div>`
      }

      // Target .md files only
      build.onLoad({ filter: /\.md$/ }, async (args) => {
        // Read the markdown file
        const mdContent = await fs.promises.readFile(args.path, 'utf8')

        // Parse frontmatter using gray-matter
        const { data: frontmatter, content: mdContentWithoutFrontmatter } = matter(mdContent)

        // Collect page information for sitemap generation
        if (sitemapConfig.enabled !== false) {
          const relativePath = path.relative(process.cwd(), args.path)
          pages.push({
            path: relativePath,
            frontmatter,
          })
        }

        // Process VitePress-style extensions before markdown conversion
        let processedContent = mdContentWithoutFrontmatter

        // Process code groups first
        processedContent = processCodeGroups(processedContent)
        
        // Process containers after code groups
        processedContent = await processContainers(processedContent, renderer, markedOptions, highlighter)

        // Convert markdown to HTML
        let htmlContent = await marked.parse(processedContent, {
          ...markedOptions,
          renderer,
        }) as string

        // Process containers that weren't handled by pre-processing
        htmlContent = await processContainersFromHtml(htmlContent, renderer, markedOptions, highlighter)
        // Process code groups that weren't handled by pre-processing
        htmlContent = processCodeGroupsFromHtml(htmlContent)
        
        // Special case: Handle tip blocks that might appear after code groups
        // This fixes cases where the tip block is rendered as plain text
        // Use a more specific regex to avoid interfering with code blocks
        htmlContent = htmlContent.replace(/(\<\/div\>\s*\<\/div\>\s*\<\/div\>\s*\<\/div\>)(\s*tip\s*)(.*?)(\s*:::)/gs, (match, codeGroupEnd, tipPrefix, tipContent, tipSuffix) => {
          return `${codeGroupEnd}<div class="custom-block tip"><p class="custom-block-title">TIP</p><p>${tipContent}</p></div>`;
        })

        // No need for placeholder replacement anymore - HTML is directly inserted

        // Clean up the Home component reference if it's the only content in a home layout
        let cleanedHtmlContent = htmlContent
        if (frontmatter.layout === 'home') {
          // Match only the Home component with possible whitespace around it
          if (cleanedHtmlContent.trim() === '<Home />') {
            cleanedHtmlContent = '' // Remove it since we're using our Home layout
          }
        }

        // Extract title from frontmatter, or first h1, or default
        let title = frontmatter.title || defaultTitle
        if (!title) {
          const titleMatch = mdContentWithoutFrontmatter.match(/^# (.+)$/m)
          title = titleMatch ? titleMatch[1] : 'Untitled Document'
        }

        // Generate meta tags
        const metaTags = Object.entries(meta)
          .map(([name, content]) => `<meta name="${name}" content="${content}">`)
          .join('\n    ')

        // Generate script tags
        const scriptTags = scripts
          .map((src: string) => `<script src="${src}"></script>`)
          .join('\n    ')

        // Check for layout in frontmatter first
        const layout = frontmatter.layout || 'doc'

        // Generate navigation HTML (show on all layouts)
        const navItems = options.nav || config.nav || []
        const currentPath = path.relative(process.cwd(), args.path)
          .replace(/\.md$/, '.html')
          .replace(/\\/g, '/')
          .replace(/^[^/]/, '/$&')
        const navHtml = createNavHtml(navItems, currentPath)

        // Generate sidebar HTML (only for non-home layouts)
        const sidebarItems = options.sidebar?.['/'] || config.markdown.sidebar?.['/'] || []
        const sidebarHtml = layout === 'home' ? '' : createSidebarHtml(sidebarItems, currentPath)

        // Generate search HTML (only for non-home layouts)
        const searchConfig = options.search || config.markdown.search || { enabled: false }
        const searchHtml = layout === 'home' ? '' : createSearchHtml(searchConfig)

        // Generate theme CSS
        const themeConfig = options.themeConfig || config.markdown.themeConfig || {}
        const themeCss = generateThemeCSS(themeConfig)

        // Add UnoCSS
        const unoCssScript = `<script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>`

        // Add frontmatter data as a global variable
        const frontmatterScript = `<script>window.$frontmatter = ${JSON.stringify(frontmatter)};</script>`

        // Prepare content based on layout
        let pageContent = cleanedHtmlContent

        // Process TOC if enabled (but not for home layout)
        const _tocHtml = ''
        let tocStyles = ''
        let tocScripts = ''
        let sidebarTocHtml = ''
        let floatingTocHtml = ''

        if (layout !== 'home' && options.toc?.enabled !== false) {
          // Generate TOC data from the original markdown content
          const tocData = generateTocData(mdContentWithoutFrontmatter, {
            ...options.toc,
            // Merge frontmatter TOC config
            ...frontmatter.toc,
          })

          // Process inline TOC syntax
          pageContent = processInlineTocSyntax(pageContent, tocData)

          // Generate TOC positions
          const tocPositions = generateTocPositions(mdContentWithoutFrontmatter, {
            ...options.toc,
            ...frontmatter.toc,
          })

          // Extract TOC HTML for different positions
          const sidebarToc = tocPositions.find(p => p.position === 'sidebar')
          const floatingToc = tocPositions.find(p => p.position === 'floating')

          if (sidebarToc)
            sidebarTocHtml = sidebarToc.html
          if (floatingToc)
            floatingTocHtml = floatingToc.html

          // Generate TOC styles and scripts
          tocStyles = generateTocStyles()
          tocScripts = generateTocScripts()
        }

        // Add heading anchors
        pageContent = enhanceHeadingsWithAnchors(pageContent)

        // Get the file name and create the output path
        const outdir = build.config.outdir as string | undefined
        if (!outdir) {
          throw new Error('No outdir specified in build config')
        }

        // Maintain directory structure relative to the entrypoint
        const relativePath = path.relative(process.cwd(), args.path)

        const dirPath = path.dirname(relativePath)
        const baseName = path.basename(args.path, '.md')

        // Create path for the HTML file
        let htmlFilePath = path.join(outdir, `${baseName}.html`)

        // If the markdown file is in a subdirectory and preserveDirectoryStructure is true
        if (preserveDirectoryStructure && dirPath !== '.') {
          const targetDir = path.join(outdir, dirPath)
          // Ensure the target directory exists
          await fs.promises.mkdir(targetDir, { recursive: true })
          htmlFilePath = path.join(targetDir, `${baseName}.html`)
        }

        // If layout is 'home', use the custom home page layout
        if (layout === 'home') {
          pageContent = createHomePageHtml(frontmatter as Frontmatter, cleanedHtmlContent, args.path, config)
        }

        // Add copy-to-clipboard styles and scripts
        const copyStyles = `
/* Copy-to-clipboard button styles */
.code-block-container {
  position: relative;
  margin: 1rem 0;
}

.copy-code-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, background-color 0.2s;
  z-index: 10;
}

.code-block-container:hover .copy-code-btn {
  opacity: 1;
}

.copy-code-btn:hover {
  background: rgba(0, 0, 0, 0.9);
}

.copy-code-btn.copied {
  background: #10b981;
}

.copy-code-btn.copied::after {
  content: 'Copied!';
  margin-left: 0.5rem;
}

/* Line highlighting styles */
.line-highlight {
  background-color: rgba(255, 255, 0, 0.2);
  display: block;
  margin: 0 -1rem;
  padding: 0 1rem;
}

/* Line numbers styles */
.line-numbers {
  counter-reset: line-number;
}

.line-numbers code {
  display: block;
  position: relative;
}

.line-numbers code::before {
  content: counter(line-number);
  counter-increment: line-number;
  position: absolute;
  left: -3rem;
  width: 2rem;
  text-align: right;
  color: #666;
  font-size: 0.875rem;
  user-select: none;
}
`

        const copyScripts = `
// Copy-to-clipboard functionality
function copyToClipboard(buttonId, text) {
  const button = document.getElementById(buttonId)

  if (navigator.clipboard && window.isSecureContext) {
    // Use the Clipboard API when available
    navigator.clipboard.writeText(text).then(() => {
      showCopyFeedback(button)
    }).catch(() => {
      fallbackCopyTextToClipboard(text, button)
    })
  } else {
    // Fallback for older browsers
    fallbackCopyTextToClipboard(text, button)
  }
}

function fallbackCopyTextToClipboard(text, button) {
  const textArea = document.createElement('textarea')
  textArea.value = text

  // Avoid scrolling to bottom
  textArea.style.top = '0'
  textArea.style.left = '0'
  textArea.style.position = 'fixed'
  textArea.style.opacity = '0'

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    const successful = document.execCommand('copy')
    if (successful) {
      showCopyFeedback(button)
    } else {
      showCopyError(button)
    }
  } catch (err) {
    showCopyError(button)
  }

  document.body.removeChild(textArea)
}

function showCopyFeedback(button) {
  const originalText = button.textContent
  button.textContent = 'Copied!'
  button.classList.add('copied')

  setTimeout(() => {
    button.textContent = originalText
    button.classList.remove('copied')
  }, 2000)
}

function showCopyError(button) {
  const originalText = button.textContent
  button.textContent = 'Failed'
  button.style.background = '#ef4444'

  setTimeout(() => {
    button.textContent = originalText
    button.style.background = ''
  }, 2000)
}

// Handle code group tab switching
document.addEventListener('DOMContentLoaded', function() {
  const codeGroups = document.querySelectorAll('.vp-code-group')
  
  codeGroups.forEach(group => {
    const radios = group.querySelectorAll('input[type="radio"]')
    const blocks = group.querySelectorAll('.blocks > div')
    
    radios.forEach((radio, index) => {
      radio.addEventListener('change', function() {
        if (this.checked) {
          // Hide all blocks
          blocks.forEach(block => block.classList.remove('active'))
          // Show selected block
          if (blocks[index]) {
            blocks[index].classList.add('active')
          }
        }
      })
    })
  })
})
`

        let finalHtml: string

        if (template) {
          // Use custom template with {{content}} placeholder
          finalHtml = template.replace(/\{\{content\}\}/g, pageContent)

          // Replace {{frontmatter.X}} placeholders with frontmatter values
          Object.entries(frontmatter).forEach(([key, value]) => {
            const stringValue = typeof value === 'object' && value !== null
              ? JSON.stringify(value)
              : String(value || '')
            finalHtml = finalHtml.replace(new RegExp(`\\{\\{frontmatter\\.${key}\\}\\}`, 'g'), stringValue)
          })

          // Add TOC styles and scripts if not already present
          if (tocStyles && !finalHtml.includes('table-of-contents')) {
            finalHtml = finalHtml.replace('</head>', `<style>${tocStyles}</style></head>`)
          }
          if (tocScripts && !finalHtml.includes('initToc')) {
            finalHtml = finalHtml.replace('</body>', `<script>${tocScripts}</script></body>`)
          }

          // Add copy styles and scripts
          if (finalHtml.includes('copy-code-btn')) {
            finalHtml = finalHtml.replace('</head>', `<style>${copyStyles}</style></head>`)
            finalHtml = finalHtml.replace('</body>', `<script>${copyScripts}</script></body>`)
          }
        }
        else {
          // Default HTML template
          finalHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${metaTags}
    <title>${title}</title>
    ${unoCssScript}
    <style>
${css}
${tocStyles}
${copyStyles}
${getNavStyles()}
${getSidebarStyles()}
${getSearchStyles()}
${themeCss}
    </style>
    ${frontmatterScript}
  </head>
  <body data-layout="${layout}" class="text-gray-800 bg-white">
    ${navHtml}
    ${searchHtml}
    ${sidebarHtml}
    ${sidebarTocHtml}
    <article class="markdown-body">
      ${pageContent}
    </article>
    ${floatingTocHtml}
    ${scriptTags}
    <script>${tocScripts}</script>
    <script>${copyScripts}</script>
    <script>${getNavScripts()}</script>
    <script>${getSidebarScripts()}</script>
    <script>${getSearchScripts(searchConfig)}</script>
  </body>
</html>`
        }

        // Write the HTML file directly to outdir
        await fs.promises.writeFile(htmlFilePath, finalHtml)

        // Log that we wrote the file
        if (config.verbose) {
          // eslint-disable-next-line no-console
          console.log(`Markdown: Generated ${htmlFilePath}`)
          if (Object.keys(frontmatter).length > 0 && config.verbose) {
            // eslint-disable-next-line no-console
            console.log(`Frontmatter parsed: ${JSON.stringify(frontmatter, null, 2)}`)
          }
        }

        // Return empty contents to satisfy Bun's build system
        return {
          contents: `// Converted markdown file: ${args.path}`,
          loader: 'js',
        }
      })
    },
  }
}

// Add STX plugin to handle .stx files
export function stx(): BunPlugin {
  return {
    name: 'stx-plugin',
    setup(build) {
      build.onLoad({ filter: /\.stx$/ }, async (args) => {
        // Read the STX template file
        const stxContent = await fs.promises.readFile(args.path, 'utf8')

        // Process STX template directives (without frontmatter for now)
        const processedContent = processStxTemplate(stxContent, {}, {})

        return {
          contents: `export default ${JSON.stringify(processedContent)};`,
          loader: 'js',
        }
      })
    },
  }
}

/**
 * Generate sitemap and robots.txt files after build completion
 */
export async function generateSitemapAndRobots(
  pages: Array<{ path: string, frontmatter: any }>,
  outdir: string,
  sitemapConfig: SitemapConfig,
  robotsConfig: RobotsConfig,
): Promise<void> {
  // Generate sitemap
  if (sitemapConfig.enabled !== false && sitemapConfig.baseUrl) {
    try {
      const entries = createSitemapEntries(pages, sitemapConfig, sitemapConfig.baseUrl)

      // Choose the appropriate generation method based on size and configuration
      const maxUrlsPerFile = sitemapConfig.maxUrlsPerFile || 50000
      const useMultiSitemap = sitemapConfig.useSitemapIndex || entries.length > maxUrlsPerFile
      const useStreaming = entries.length > 100000 // Use streaming for very large sitemaps

      if (useStreaming) {
        // Use memory-efficient streaming for very large sites
        await generateLargeSitemap(entries, sitemapConfig.baseUrl, sitemapConfig, outdir)
      }
      else if (useMultiSitemap) {
        // Use multi-sitemap generation for large sites
        await generateMultiSitemap(entries, sitemapConfig.baseUrl, sitemapConfig, outdir)
      }
      else {
        // Use standard single sitemap generation
        const sitemapXml = generateSitemapXml(entries, sitemapConfig.baseUrl)
        const sitemapFilename = sitemapConfig.filename || 'sitemap.xml'
        const sitemapPath = path.join(outdir, sitemapFilename)

        await fs.promises.writeFile(sitemapPath, sitemapXml)

        if (config.verbose) {
          console.warn(`Sitemap: Generated ${sitemapPath} with ${entries.length} entries`)
        }
      }
    }
    catch (error) {
      console.error('Failed to generate sitemap:', error)
    }
  }

  // Generate robots.txt
  if (robotsConfig.enabled !== false) {
    try {
      // Check for frontmatter-based robots configuration
      const frontmatterRobots = pages
        .map(p => p.frontmatter.robots)
        .filter(Boolean)
        .flat()

      // Merge frontmatter robots rules with config
      const mergedRobotsConfig = {
        ...robotsConfig,
        rules: robotsConfig.rules ? [...robotsConfig.rules, ...frontmatterRobots] : frontmatterRobots,
      }

      // Prepare sitemap URLs for robots.txt
      const sitemapUrls: string[] = []

      if (sitemapConfig.enabled !== false && sitemapConfig.baseUrl) {
        const entries = createSitemapEntries(pages, sitemapConfig, sitemapConfig.baseUrl)
        const maxUrlsPerFile = sitemapConfig.maxUrlsPerFile || 50000
        const useMultiSitemap = sitemapConfig.useSitemapIndex || entries.length > maxUrlsPerFile
        const useStreaming = entries.length > 100000

        if (useStreaming) {
          // Include single sitemap (streaming)
          const sitemapFilename = sitemapConfig.filename || 'sitemap.xml'
          sitemapUrls.push(`${sitemapConfig.baseUrl}/${sitemapFilename}`.replace(/\/+/g, '/'))
        }
        else if (useMultiSitemap) {
          // Include sitemap index and individual sitemaps
          sitemapUrls.push(`${sitemapConfig.baseUrl}/sitemap-index.xml`.replace(/\/+/g, '/'))

          const chunks = splitSitemapEntries(entries, maxUrlsPerFile)
          const baseName = (sitemapConfig.filename || 'sitemap.xml').replace('.xml', '')

          for (let i = 0; i < chunks.length; i++) {
            let filename: string
            if (chunks.length === 1) {
              filename = sitemapConfig.filename || 'sitemap.xml'
            }
            else {
              filename = `${baseName}-${i + 1}.xml`
            }
            sitemapUrls.push(`${sitemapConfig.baseUrl}/${filename}`.replace(/\/+/g, '/'))
          }
        }
        else {
          // Include single sitemap
          const sitemapFilename = sitemapConfig.filename || 'sitemap.xml'
          sitemapUrls.push(`${sitemapConfig.baseUrl}/${sitemapFilename}`.replace(/\/+/g, '/'))
        }
      }

      const robotsConfigWithSitemaps = {
        ...mergedRobotsConfig,
        sitemaps: mergedRobotsConfig.sitemaps ? [...mergedRobotsConfig.sitemaps, ...sitemapUrls] : sitemapUrls,
      }

      const robotsTxt = generateRobotsTxt(robotsConfigWithSitemaps)
      const robotsFilename = robotsConfig.filename || 'robots.txt'
      const robotsPath = path.join(outdir, robotsFilename)

      await fs.promises.writeFile(robotsPath, robotsTxt)

      if (config.verbose) {
        console.warn(`Robots: Generated ${robotsPath}`)
      }
    }
    catch (error) {
      console.error('Failed to generate robots.txt:', error)
    }
  }
}

/**
 * Create HTML for sidebar navigation
 */
function createSidebarHtml(sidebarItems: SidebarItem[], currentPath: string = '/'): string {
  if (!sidebarItems || sidebarItems.length === 0)
    return ''

  const sidebarLinks = sidebarItems.map((item) => {
    return generateSidebarItemHtml(item, currentPath, 0)
  }).join('\n')

  return `
    <aside class="sidebar">
      <div class="sidebar-content">
        ${sidebarLinks}
      </div>
    </aside>
  `
}

/**
 * Generate HTML for a single sidebar item
 */
function generateSidebarItemHtml(item: SidebarItem, currentPath: string, depth: number = 0): string {
  const isActive = isSidebarItemActive(item, currentPath)
  const hasChildren = item.items && item.items.length > 0
  const indentClass = depth > 0 ? `sidebar-indent-${depth}` : ''

  if (hasChildren) {
    const childrenHtml = item.items!.map(child => generateSidebarItemHtml(child, currentPath, depth + 1)).join('\n')
    const expandedClass = isActive ? 'sidebar-expanded' : ''

    const groupClasses = ['sidebar-group', indentClass, expandedClass].filter(Boolean).join(' ')

    return `
      <div class="${groupClasses}">
        <div class="sidebar-group-header">
          <span class="sidebar-group-title">${item.text}</span>
          <button class="sidebar-toggle" aria-expanded="${isActive}">
            <span class="sidebar-toggle-icon"></span>
          </button>
        </div>
        <div class="sidebar-group-content">
          ${childrenHtml}
        </div>
      </div>
    `
  }
  else {
    const activeClass = isActive ? 'sidebar-active' : ''
    const classes = ['sidebar-link', indentClass, activeClass].filter(Boolean).join(' ')
    return `<a href="${item.link || '#'}" class="${classes}">${item.text}</a>`
  }
}

/**
 * Check if a sidebar item is active
 */
function isSidebarItemActive(item: SidebarItem, currentPath: string): boolean {
  if (item.link && currentPath === item.link)
    return true
  if (item.items) {
    return item.items.some(child => isSidebarItemActive(child, currentPath))
  }
  return false
}

/**
 * Get navigation styles
 */
function getNavStyles(): string {
  return `
/* Navigation bar styles */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 1000;
  padding: 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.nav-brand {
  font-size: 1.375rem;
  font-weight: 600;
}

.nav-brand-link {
  color: #1a1a1a;
  text-decoration: none;
  transition: color 0.2s ease;
}

.nav-brand-link:hover {
  color: #3451b2;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-link {
  color: #4c4c4c;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  padding: 8px 0;
  transition: color 0.25s ease;
  position: relative;
}

.nav-link:hover {
  color: #3451b2;
}

.nav-link.active {
  color: #3451b2;
}

.nav-icon {
  font-size: 1.1em;
}

/* Dropdown styles */
.nav-item.dropdown {
  position: relative;
}

.dropdown-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font: inherit;
  color: inherit;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dropdown-toggle:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dropdown-toggle::after {
  content: '';
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid currentColor;
  margin-left: 0.25rem;
  transition: transform 0.2s;
}

.nav-item.dropdown.active .dropdown-toggle {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.1);
}

.nav-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.375rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s;
  z-index: 1000;
}

.nav-item.dropdown:hover .nav-dropdown,
.nav-item.dropdown:focus-within .nav-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.nav-dropdown-item {
  display: block;
  padding: 0.75rem 1rem;
  color: #4b5563;
  text-decoration: none;
  transition: all 0.2s;
  border-radius: 0.25rem;
  margin: 0.25rem;
}

.nav-dropdown-item:hover {
  color: #1f2937;
  background-color: rgba(0, 0, 0, 0.05);
}

.nav-dropdown-item.active {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.1);
}

/* Mobile navigation toggle */
.nav-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.nav-toggle:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.hamburger {
  display: block;
  width: 20px;
  height: 2px;
  background: #4b5563;
  position: relative;
  transition: background-color 0.2s;
}

.hamburger::before,
.hamburger::after {
  content: '';
  display: block;
  width: 20px;
  height: 2px;
  background: #4b5563;
  position: absolute;
  transition: all 0.2s;
}

.hamburger::before {
  top: -6px;
}

.hamburger::after {
  top: 6px;
}

/* Mobile navigation menu */
.nav-menu.mobile-open {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1rem;
  gap: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Responsive design */
@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }

  .nav-menu.mobile-open {
    display: flex;
  }

  .nav-toggle {
    display: block;
  }

  .nav-brand {
    font-size: 1.25rem;
  }

  .nav-container {
    padding: 0 0.75rem;
    height: 50px;
  }
}

@media (max-width: 480px) {
  .nav-brand {
    font-size: 1.1rem;
  }

  .nav-container {
    padding: 0 0.5rem;
  }
}
`
}

/**
 * Generate sitemap XML content (single sitemap)
 */
function generateSitemapXml(entries: SitemapEntry[], baseUrl: string): string {
  const urlEntries = entries.map((entry) => {
    const loc = `${baseUrl}${entry.url}`.replace(/\/$/, '') // Remove trailing slash
    let xmlEntry = `  <url>\n    <loc>${escapeXml(loc)}</loc>`

    if (entry.lastmod) {
      const lastmod = entry.lastmod instanceof Date ? entry.lastmod.toISOString().split('T')[0] : entry.lastmod
      xmlEntry += `\n    <lastmod>${lastmod}</lastmod>`
    }

    if (entry.changefreq) {
      xmlEntry += `\n    <changefreq>${entry.changefreq}</changefreq>`
    }

    if (entry.priority !== undefined && entry.priority >= 0 && entry.priority <= 1) {
      xmlEntry += `\n    <priority>${entry.priority.toFixed(1)}</priority>`
    }

    xmlEntry += '\n  </url>'
    return xmlEntry
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries}
</urlset>`
}

/**
 * Split entries into multiple sitemaps if needed
 */
function splitSitemapEntries(entries: SitemapEntry[], maxUrlsPerFile: number): SitemapEntry[][] {
  if (entries.length <= maxUrlsPerFile) {
    return [entries]
  }

  const chunks: SitemapEntry[][] = []
  for (let i = 0; i < entries.length; i += maxUrlsPerFile) {
    chunks.push(entries.slice(i, i + maxUrlsPerFile))
  }

  return chunks
}

/**
 * Generate multiple sitemaps and a sitemap index with performance optimizations
 */
async function generateMultiSitemap(
  entries: SitemapEntry[],
  baseUrl: string,
  config: SitemapConfig,
  outdir: string,
): Promise<void> {
  const maxUrlsPerFile = config.maxUrlsPerFile || 50000
  const chunks = splitSitemapEntries(entries, maxUrlsPerFile)

  const sitemapFiles: Array<{ url: string, lastmod: string }> = []

  // Generate individual sitemap files with parallel processing for better performance
  const writePromises: Promise<void>[] = []

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const sitemapXml = generateSitemapXml(chunk, baseUrl)

    let filename: string
    if (chunks.length === 1) {
      filename = config.filename || 'sitemap.xml'
    }
    else {
      const baseName = (config.filename || 'sitemap.xml').replace('.xml', '')
      filename = `${baseName}-${i + 1}.xml`
    }

    const sitemapPath = path.join(outdir, filename)

    // Use parallel file writes for better performance
    const writePromise = fs.promises.writeFile(sitemapPath, sitemapXml).then(() => {
      if (config.verbose) {
        console.warn(`Sitemap: Generated ${sitemapPath} with ${chunk.length} entries`)
      }
    })
    writePromises.push(writePromise)

    // Get the latest lastmod from this chunk (optimized)
    let latestLastmod = new Date(0).toISOString().split('T')[0]
    for (const entry of chunk) {
      if (entry.lastmod) {
        const entryDate = entry.lastmod instanceof Date ? entry.lastmod.toISOString().split('T')[0] : entry.lastmod
        if (entryDate > latestLastmod) {
          latestLastmod = entryDate
        }
      }
    }

    sitemapFiles.push({
      url: `/${filename}`,
      lastmod: latestLastmod,
    })
  }

  // Wait for all sitemap files to be written
  await Promise.all(writePromises)

  // Generate sitemap index if multiple files were created
  if (chunks.length > 1) {
    const indexXml = generateSitemapIndexXml(sitemapFiles, baseUrl)
    const indexFilename = 'sitemap-index.xml'
    const indexPath = path.join(outdir, indexFilename)

    await fs.promises.writeFile(indexPath, indexXml)

    if (config.verbose) {
      console.warn(`Sitemap: Generated ${indexPath} with ${sitemapFiles.length} sitemaps`)
    }
  }
}

/**
 * Memory-efficient sitemap generation with streaming for very large sites
 */
async function generateLargeSitemap(
  entries: SitemapEntry[],
  baseUrl: string,
  config: SitemapConfig,
  outdir: string,
): Promise<void> {
  const filename = config.filename || 'sitemap.xml'
  const sitemapPath = path.join(outdir, filename)

  // For very large sitemaps, write incrementally to avoid memory issues
  const writeStream = fs.createWriteStream(sitemapPath)

  // Write XML header
  writeStream.write('<?xml version="1.0" encoding="UTF-8"?>\n')
  writeStream.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n')
  writeStream.write('        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n')
  writeStream.write('        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n')
  writeStream.write('        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n')

  // Write entries in chunks to avoid memory issues
  const chunkSize = 1000
  for (let i = 0; i < entries.length; i += chunkSize) {
    const chunk = entries.slice(i, i + chunkSize)
    const xmlChunk = chunk.map((entry) => {
      const loc = `${baseUrl}${entry.url}`.replace(/\/$/, '')
      let xmlEntry = `  <url>\n    <loc>${escapeXml(loc)}</loc>`

      if (entry.lastmod) {
        const lastmod = entry.lastmod instanceof Date ? entry.lastmod.toISOString().split('T')[0] : entry.lastmod
        xmlEntry += `\n    <lastmod>${lastmod}</lastmod>`
      }

      if (entry.changefreq) {
        xmlEntry += `\n    <changefreq>${entry.changefreq}</changefreq>`
      }

      if (entry.priority !== undefined && entry.priority >= 0 && entry.priority <= 1) {
        xmlEntry += `\n    <priority>${entry.priority.toFixed(1)}</priority>`
      }

      xmlEntry += '\n  </url>\n'
      return xmlEntry
    }).join('')

    writeStream.write(xmlChunk)

    // Allow other operations to proceed
    if (i % (chunkSize * 10) === 0) {
      await new Promise(resolve => setImmediate(resolve))
    }
  }

  // Write XML footer
  writeStream.write('</urlset>')

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      if (config.verbose) {
        console.warn(`Sitemap: Generated ${sitemapPath} with ${entries.length} entries (streaming)`)
      }
      resolve()
    })
    writeStream.on('error', reject)
    writeStream.end()
  })
}

/**
 * Generate sitemap index XML content
 */
function generateSitemapIndexXml(sitemaps: Array<{ url: string, lastmod?: string }>, baseUrl: string): string {
  const sitemapEntries = sitemaps.map((sitemap) => {
    const loc = `${baseUrl}${sitemap.url}`.replace(/\/$/, '')
    let xmlEntry = `  <sitemap>\n    <loc>${escapeXml(loc)}</loc>`

    if (sitemap.lastmod) {
      xmlEntry += `\n    <lastmod>${sitemap.lastmod}</lastmod>`
    }

    xmlEntry += '\n  </sitemap>'
    return xmlEntry
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`
}

/**
 * Generate robots.txt content
 */
function generateRobotsTxt(config: RobotsConfig): string {
  const lines: string[] = []

  // Add user-agent rules
  if (config.rules && config.rules.length > 0) {
    for (const rule of config.rules) {
      lines.push(`User-agent: ${rule.userAgent}`)

      if (rule.allow && rule.allow.length > 0) {
        for (const allow of rule.allow) {
          lines.push(`Allow: ${allow}`)
        }
      }

      if (rule.disallow && rule.disallow.length > 0) {
        for (const disallow of rule.disallow) {
          lines.push(`Disallow: ${disallow}`)
        }
      }

      if (rule.crawlDelay !== undefined) {
        lines.push(`Crawl-delay: ${rule.crawlDelay}`)
      }

      lines.push('') // Empty line between rules
    }
  }
  else {
    // Default rule
    lines.push('User-agent: *')
    lines.push('Allow: /')
    lines.push('')
  }

  // Add sitemap references
  if (config.sitemaps && config.sitemaps.length > 0) {
    for (const sitemap of config.sitemaps) {
      lines.push(`Sitemap: ${sitemap}`)
    }
  }

  // Add host directive
  if (config.host) {
    lines.push(`Host: ${config.host}`)
  }

  // Add custom content
  if (config.customContent) {
    lines.push('')
    lines.push(config.customContent)
  }

  return lines.join('\n')
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case '\'': return '&#39;'
      case '"': return '&quot;'
      default: return c
    }
  })
}

/**
 * Create sitemap entries from pages with performance optimizations
 */
function createSitemapEntries(
  pages: Array<{ path: string, frontmatter: any }>,
  config: SitemapConfig,
  _baseUrl: string,
): SitemapEntry[] {
  const entries: SitemapEntry[] = []
  const currentDate = new Date().toISOString().split('T')[0]

  // Pre-compile regex patterns for better performance
  const excludePatterns = config.exclude?.map((pattern) => {
    try {
      return new RegExp(pattern)
    }
    catch {
      console.warn(`Invalid exclude pattern: ${pattern}`)
      return null
    }
  }).filter((pattern): pattern is RegExp => pattern !== null) || []

  // Pre-compile priority and changefreq patterns
  const priorityPatterns = config.priorityMap
    ? Object.entries(config.priorityMap).map(([pattern, priority]) => {
        try {
          return { regex: new RegExp(pattern), priority }
        }
        catch {
          console.warn(`Invalid priority pattern: ${pattern}`)
          return null
        }
      }).filter((pattern): pattern is { regex: RegExp, priority: number } => pattern !== null)
    : []

  const changefreqPatterns = config.changefreqMap
    ? Object.entries(config.changefreqMap).map(([pattern, changefreq]) => {
        try {
          return { regex: new RegExp(pattern), changefreq }
        }
        catch {
          console.warn(`Invalid changefreq pattern: ${pattern}`)
          return null
        }
      }).filter((pattern): pattern is { regex: RegExp, changefreq: SitemapChangefreq } => pattern !== null)
    : []

  for (const page of pages) {
    // Skip pages that should be excluded (optimized with pre-compiled patterns)
    if (shouldExcludePageOptimized(page.path, excludePatterns)) {
      continue
    }

    // Check if page should be excluded from sitemap
    const sitemapSetting = page.frontmatter.sitemap
    if (sitemapSetting === false || sitemapSetting === 'exclude') {
      continue
    }

    // Convert markdown path to HTML path
    const htmlPath = page.path.replace(/\.md$/, '.html')
    const url = htmlPath.startsWith('/') ? htmlPath : `/${htmlPath}`

    // Handle nested sitemap configuration in frontmatter
    const sitemapConfig = typeof sitemapSetting === 'object' && sitemapSetting !== null ? sitemapSetting : {}

    const entry: SitemapEntry = {
      url,
      lastmod: sitemapConfig.lastmod || page.frontmatter.lastmod || currentDate,
      changefreq: sitemapConfig.changefreq || page.frontmatter.changefreq || getChangefreqFromPathOptimized(url, changefreqPatterns, config),
      priority: sitemapConfig.priority || page.frontmatter.priority || getPriorityFromPathOptimized(url, priorityPatterns, config),
    }

    // Apply custom transformation if provided
    const transformedEntry = config.transform ? config.transform(entry) : entry
    if (transformedEntry) {
      entries.push(transformedEntry)
    }
  }

  return entries
}

/**
 * Optimized version of shouldExcludePage using pre-compiled patterns
 */
function shouldExcludePageOptimized(path: string, excludePatterns: RegExp[]): boolean {
  return excludePatterns.some(pattern => pattern.test(path))
}

/**
 * Optimized version of getPriorityFromPath using pre-compiled patterns
 */
function getPriorityFromPathOptimized(path: string, priorityPatterns: Array<{ regex: RegExp, priority: number }>, config: SitemapConfig): number {
  for (const { regex, priority } of priorityPatterns) {
    if (regex.test(path)) {
      return priority
    }
  }

  // Default priority based on path depth and type (optimized)
  if (path === '/' || path === '/index.html') {
    return 1.0
  }
  else if (path.includes('/docs/') || path.includes('/guide/')) {
    return 0.8
  }
  else if (path.includes('/blog/') || path.includes('/posts/')) {
    return 0.7
  }
  else if (path.includes('/examples/') || path.includes('/showcase/')) {
    return 0.6
  }

  return config.defaultPriority || 0.5
}

/**
 * Optimized version of getChangefreqFromPath using pre-compiled patterns
 */
function getChangefreqFromPathOptimized(path: string, changefreqPatterns: Array<{ regex: RegExp, changefreq: SitemapChangefreq }>, config: SitemapConfig): SitemapChangefreq {
  for (const { regex, changefreq } of changefreqPatterns) {
    if (regex.test(path)) {
      return changefreq
    }
  }

  // Default changefreq based on path type (optimized)
  if (path.includes('/blog/') || path.includes('/posts/') || path.includes('/news/')) {
    return 'weekly'
  }
  else if (path.includes('/docs/') || path.includes('/guide/')) {
    return 'monthly'
  }
  else if (path === '/' || path === '/index.html') {
    return 'daily'
  }

  return config.defaultChangefreq || 'monthly'
}

/**
 * Get sidebar scripts
 */
function getSidebarScripts(): string {
  return `
// Sidebar functionality
document.addEventListener('DOMContentLoaded', function() {
  const sidebarToggles = document.querySelectorAll('.sidebar-toggle')

  sidebarToggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
      const group = toggle.closest('.sidebar-group')
      const content = group.querySelector('.sidebar-group-content')
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true'

      if (isExpanded) {
        group.classList.remove('sidebar-expanded')
        toggle.setAttribute('aria-expanded', 'false')
        content.style.maxHeight = '0'
      } else {
        group.classList.add('sidebar-expanded')
        toggle.setAttribute('aria-expanded', 'true')
        content.style.maxHeight = content.scrollHeight + 'px'
      }
    })
  })

  // Auto-expand active groups
  const activeLinks = document.querySelectorAll('.sidebar-active')
  activeLinks.forEach(link => {
    let parent = link.parentElement
    while (parent && !parent.classList.contains('sidebar-group')) {
      parent = parent.parentElement
    }

    if (parent && parent.classList.contains('sidebar-group')) {
      const toggle = parent.querySelector('.sidebar-toggle')
      const content = parent.querySelector('.sidebar-group-content')

      if (toggle && content) {
        parent.classList.add('sidebar-expanded')
        toggle.setAttribute('aria-expanded', 'true')
        content.style.maxHeight = content.scrollHeight + 'px'
      }
    }
  })

  // Mobile sidebar functionality
  function updateSidebarForScreenSize() {
    const sidebar = document.querySelector('.sidebar')
    const overlay = document.querySelector('.sidebar-overlay')

    if (window.innerWidth <= 1024) {
      // Create overlay if it doesn't exist
      if (!overlay) {
        const newOverlay = document.createElement('div')
        newOverlay.className = 'sidebar-overlay'
        document.body.appendChild(newOverlay)

        // Add click handler to close sidebar
        newOverlay.addEventListener('click', function() {
          sidebar.classList.remove('sidebar-open')
          newOverlay.classList.remove('sidebar-overlay-visible')
        })
      }

      // Add mobile toggle functionality to nav toggle
      const navToggle = document.querySelector('.nav-toggle')
      if (navToggle) {
        navToggle.addEventListener('click', function() {
          sidebar.classList.toggle('sidebar-open')
          const overlay = document.querySelector('.sidebar-overlay')
          if (overlay) {
            overlay.classList.toggle('sidebar-overlay-visible')
          }
        })
      }
    } else {
      // Remove mobile functionality on larger screens
      if (sidebar) {
        sidebar.classList.remove('sidebar-open')
      }
      if (overlay) {
        overlay.classList.remove('sidebar-overlay-visible')
      }
    }
  }

  // Update on load and resize
  updateSidebarForScreenSize()
  window.addEventListener('resize', updateSidebarForScreenSize)
})
`
}

/**
 * Create HTML for search input
 */
function createSearchHtml(searchConfig: SearchConfig): string {
  if (!searchConfig.enabled)
    return ''

  const placeholder = searchConfig.placeholder || 'Search...'

  return `
    <div class="search-container">
      <div class="search-box">
        <input
          type="search"
          id="search-input"
          placeholder="${placeholder}"
          autocomplete="off"
          spellcheck="false"
        />
        <button class="search-button" aria-label="Search">
          <span class="search-icon">🔍</span>
        </button>
        ${searchConfig.keyboardShortcuts !== false ? '<div class="search-shortcut">⌘K</div>' : ''}
      </div>
      <div class="search-results" id="search-results" style="display: none;"></div>
    </div>
  `
}

/**
 * Generate search index data from content
 */
function generateSearchIndex(mdContent: string, title: string, url: string): string {
  // Extract headings and content for indexing
  const headings = mdContent.match(/^#{1,6}\s+(?:\S.*|[\t\v\f \xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF])$/gm) || []
  const paragraphs = mdContent.split('\n\n').filter(p => p.trim().length > 0)

  const indexData = {
    title,
    url,
    content: paragraphs.slice(0, 5).join(' '), // First 5 paragraphs
    headings: headings.map(h => h.replace(/^#{1,6}\s+/, '').trim()),
  }

  return JSON.stringify(indexData)
}

/**
 * Perform simple text search
 */
function performSearch(query: string, searchIndex: any[]): SearchResult[] {
  if (!query.trim())
    return []

  const results: SearchResult[] = []
  const queryLower = query.toLowerCase()

  for (const item of searchIndex) {
    let score = 0
    let matchedContent = ''

    // Title match (highest weight)
    if (item.title.toLowerCase().includes(queryLower)) {
      score += 10
      matchedContent = item.title
    }

    // Heading match
    for (const heading of item.headings) {
      if (heading.toLowerCase().includes(queryLower)) {
        score += 5
        matchedContent = heading
        break
      }
    }

    // Content match
    if (item.content.toLowerCase().includes(queryLower)) {
      score += 1
      if (!matchedContent) {
        // Extract snippet around the match
        const contentLower = item.content.toLowerCase()
        const index = contentLower.indexOf(queryLower)
        const start = Math.max(0, index - 50)
        const end = Math.min(item.content.length, index + query.length + 50)
        matchedContent = item.content.substring(start, end)
      }
    }

    if (score > 0) {
      results.push({
        title: item.title,
        url: item.url,
        content: matchedContent,
        score,
      })
    }
  }

  // Sort by score and return top results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 10) // Default max results
}

/**
 * Generate theme CSS from configuration
 */
function generateThemeCSS(themeConfig: ThemeConfig): string {
  let css = ''

  // Generate CSS custom properties for colors
  if (themeConfig.colors) {
    const colors = themeConfig.colors
    css += `
/* Theme color variables */
:root {
  ${colors.primary ? `--color-primary: ${colors.primary};` : ''}
  ${colors.secondary ? `--color-secondary: ${colors.secondary};` : ''}
  ${colors.accent ? `--color-accent: ${colors.accent};` : ''}
  ${colors.background ? `--color-background: ${colors.background};` : ''}
  ${colors.surface ? `--color-surface: ${colors.surface};` : ''}
  ${colors.text ? `--color-text: ${colors.text};` : ''}
  ${colors.muted ? `--color-muted: ${colors.muted};` : ''}
}
`
  }

  // Generate font family CSS
  if (themeConfig.fonts) {
    const fonts = themeConfig.fonts
    css += `
/* Theme font variables */
:root {
  ${fonts.heading ? `--font-heading: ${fonts.heading};` : ''}
  ${fonts.body ? `--font-body: ${fonts.body};` : ''}
  ${fonts.mono ? `--font-mono: ${fonts.mono};` : ''}
}

/* Apply fonts */
${fonts.heading ? `h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }` : ''}
${fonts.body ? `body { font-family: var(--font-body); }` : ''}
${fonts.mono ? `code, pre, .code-block-container { font-family: var(--font-mono); }` : ''}
`
  }

  // Generate dark mode CSS
  if (themeConfig.darkMode) {
    css += `
/* Dark mode styles */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #1a1a1a;
    --color-surface: #2a2a2a;
    --color-text: #ffffff;
    --color-muted: #888888;
  }

  body {
    background-color: var(--color-background);
    color: var(--color-text);
  }
}
`
  }

  // Add custom CSS variables
  if (themeConfig.cssVars) {
    css += `
/* Custom CSS variables */
:root {
${Object.entries(themeConfig.cssVars)
  .map(([key, value]) => `  --${key}: ${value};`)
  .join('\n')}
}
`
  }

  // Add custom CSS
  if (themeConfig.css) {
    css += `
/* Custom theme CSS */
${themeConfig.css}
`
  }

  return css
}

/**
 * Get search styles
 */
function getSearchStyles(): string {
  return `
/* Search styles */
.search-container {
  position: relative;
  max-width: 400px;
  margin: 0 auto;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

#search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
}

#search-input:focus {
  outline: none;
}

.search-button {
  background: none;
  border: none;
  padding: 0.75rem;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
}

.search-button:hover {
  color: #374151;
}

.search-icon {
  font-size: 1rem;
}

.search-shortcut {
  position: absolute;
  right: 3rem;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.05);
  color: #6b7280;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  user-select: none;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: 0.5rem;
}

.search-result-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result-item:hover,
.search-result-item:focus {
  background-color: rgba(0, 0, 0, 0.05);
  outline: none;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.search-result-url {
  color: #3b82f6;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
  text-decoration: none;
}

.search-result-content {
  color: #6b7280;
  font-size: 0.85rem;
  line-height: 1.4;
}

.search-no-results {
  padding: 1rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
}

/* Mobile search */
@media (max-width: 768px) {
  .search-container {
    max-width: 100%;
    margin: 0 1rem;
  }

  .search-shortcut {
    display: none;
  }
}
`
}

/**
 * Get search scripts
 */
function getSearchScripts(searchConfig: SearchConfig): string {
  return `
// Search functionality
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search-input')
  const searchResults = document.getElementById('search-results')

  if (!searchInput || !searchResults) return

  let searchIndex = []
  let searchTimeout = null

  // Load search index
  fetch('/search-index.json')
    .then(response => response.json())
    .then(data => {
      searchIndex = data
    })
    .catch(error => {
      console.warn('Failed to load search index:', error)
    })

  // Search function
  function performSearch(query) {
    if (!query.trim() || searchIndex.length === 0) {
      searchResults.style.display = 'none'
      return
    }

    const results = performSearch(query, searchIndex)
    displayResults(results)
  }

  // Display search results
  function displayResults(results) {
    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-no-results">No results found</div>'
      searchResults.style.display = 'block'
      return
    }

    const html = results.map(result => \`
      <div class="search-result-item" onclick="window.location.href='\${result.url}'">
        <div class="search-result-title">\${result.title}</div>
        <div class="search-result-url">\${result.url}</div>
        <div class="search-result-content">\${result.content}</div>
      </div>
    \`).join('')

    searchResults.innerHTML = html
    searchResults.style.display = 'block'
  }

  // Input event listener
  searchInput.addEventListener('input', function(e) {
    const query = e.target.value

    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    searchTimeout = setTimeout(() => {
      performSearch(query)
    }, 300)
  })

  // Keyboard shortcuts
  ${searchConfig.keyboardShortcuts !== false
    ? `
  document.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      searchInput.focus()
    }

    if (e.key === 'Escape') {
      searchInput.blur()
      searchResults.style.display = 'none'
    }
  })
  `
    : ''}

  // Hide results when clicking outside
  document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.style.display = 'none'
    }
  })

  // Show results when input is focused
  searchInput.addEventListener('focus', function() {
    if (searchInput.value.trim()) {
      performSearch(searchInput.value)
    }
  })
})
`
}

function getNavScripts(): string {
  return `
// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
  const navToggle = document.querySelector('.nav-toggle')
  const navMenu = document.querySelector('.nav-menu')

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      navMenu.classList.toggle('mobile-open')
      navToggle.setAttribute('aria-expanded',
        navToggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true')
    })

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
        navMenu.classList.remove('mobile-open')
        navToggle.setAttribute('aria-expanded', 'false')
      }
    })
  }

  // Handle dropdown accessibility
  const dropdowns = document.querySelectorAll('.nav-item.dropdown')
  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle')
    const menu = dropdown.querySelector('.nav-dropdown')

    if (toggle && menu) {
      toggle.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          const isExpanded = toggle.getAttribute('aria-expanded') === 'true'
          toggle.setAttribute('aria-expanded', !isExpanded)
        }

        if (event.key === 'Escape') {
          toggle.setAttribute('aria-expanded', 'false')
          toggle.focus()
        }
      })

      // Close dropdown when clicking outside
      document.addEventListener('click', function(event) {
        if (!dropdown.contains(event.target)) {
          toggle.setAttribute('aria-expanded', 'false')
        }
      })
    }
  })
})
`
}

/**
 * Get sidebar styles
 */
function getSidebarStyles(): string {
  return `
/* Sidebar styles */
.sidebar {
  position: fixed;
  left: 0;
  top: 60px;
  width: 280px;
  height: calc(100vh - 60px);
  background: white;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1rem;
  overflow-y: auto;
  z-index: 900;
}

.sidebar-content {
  padding: 1rem 0;
}

/* Sidebar links */
.sidebar-link {
  display: block;
  color: #4b5563;
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  margin-bottom: 0.25rem;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.sidebar-link:hover {
  color: #1f2937;
  background-color: rgba(0, 0, 0, 0.05);
}

.sidebar-link.sidebar-active {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.1);
  font-weight: 500;
}

/* Sidebar groups */
.sidebar-group {
  margin-bottom: 0.5rem;
}

.sidebar-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.sidebar-group-header:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.sidebar-group-title {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.9rem;
}

.sidebar-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.sidebar-toggle:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.sidebar-toggle-icon {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid currentColor;
  transition: transform 0.2s;
}

.sidebar-group[aria-expanded="true"] .sidebar-toggle-icon {
  transform: rotate(90deg);
}

.sidebar-group-content {
  margin-left: 0.5rem;
  margin-top: 0.5rem;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.sidebar-group.sidebar-expanded .sidebar-group-content {
  max-height: 1000px;
}

/* Indentation for nested items */
.sidebar-indent-1 { margin-left: 1rem; }
.sidebar-indent-2 { margin-left: 2rem; }
.sidebar-indent-3 { margin-left: 3rem; }
.sidebar-indent-4 { margin-left: 4rem; }

/* Mobile sidebar */
@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 1000;
  }

  .sidebar.sidebar-open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s;
  }

  .sidebar-overlay.sidebar-overlay-visible {
    opacity: 1;
    visibility: visible;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 250px;
  }
}
`
}
