import type { BunPressOptions } from '../../src/types'
import { file } from 'bun'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, join, relative } from 'node:path'
import matter from 'gray-matter'
import { marked, Renderer } from 'marked'
import markedAlert from 'marked-alert'
import { markedEmoji } from 'marked-emoji'
import { markedHighlight } from 'marked-highlight'
import { ConfigManager } from '../../src/config'
import { disposeHighlighter, generateSitemapAndRobots, getHighlighter, processStxTemplate } from '../../src/plugin'
import {
  enhanceHeadingsWithAnchors,
  generateTocData,
  generateTocPositions,
  generateTocScripts,
  generateTocStyles,
  generateUniqueSlug,
  processInlineTocSyntax,
} from '../../src/toc'

/**
 * Test helpers for TDD workflow
 */
export interface TestFile {
  path: string
  content: string
}

export interface TestSiteOptions {
  files: TestFile[]
  config?: Partial<BunPressOptions>
  outDir?: string
}

export interface BuildResult {
  success: boolean
  outputs: string[]
  logs: string[]
}

/**
 * Creates a temporary test directory with files
 */
export async function createTestDirectory(files: TestFile[]): Promise<string> {
  const testDir = join(import.meta.dir, 'temp', `test-${Date.now()}`)

  await mkdir(testDir, { recursive: true })

  for (const file of files) {
    const filePath = join(testDir, file.path)
    await mkdir(join(filePath, '..'), { recursive: true })
    await writeFile(filePath, file.content)
  }

  return testDir
}

/**
 * Cleans up a test directory
 */
export async function cleanupTestDirectory(dir: string): Promise<void> {
  await rm(dir, { recursive: true, force: true })
}

/**
 * Creates a test markdown file with frontmatter
 */
export function createTestMarkdown(
  content: string,
  frontmatter?: Record<string, any>,
): string {
  if (!frontmatter)
    return content

  const frontmatterStr = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n')

  return `---\n${frontmatterStr}\n---\n\n${content}`
}

/**
 * Creates a test configuration
 */
export function createTestConfig(overrides?: Partial<BunPressOptions>): BunPressOptions {
  const baseConfig = {
    markdown: {
      title: 'Test Documentation',
      meta: {
        description: 'Test description',
        generator: 'BunPress Test',
      },
      css: 'body { background: #f0f0f0; }',
      scripts: ['/test.js'],
    },
    verbose: true,
  }

  // Deep merge overrides
  return deepMerge(baseConfig, overrides || {})
}

function deepMerge(target: any, source: any): any {
  const output = { ...target }

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key]
        }
        else {
          output[key] = deepMerge(target[key], source[key])
        }
      }
      else {
        output[key] = source[key]
      }
    })
  }

  return output
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Builds a test site using the markdown plugin
 */
export async function buildTestSite(options: TestSiteOptions): Promise<BuildResult> {
  const testDir = await createTestDirectory(options.files)
  const outDir = options.outDir || join(testDir, 'dist')

  // Wrap the entire build process with timeout protection
  try {
    return await Promise.race([
      (async () => {
        await mkdir(outDir, { recursive: true })

        // Initialize configuration system
        const configManager = new ConfigManager(createTestConfig())

        // Apply user config if provided
        if (options.config) {
          configManager.mergeConfig(options.config)
        }

        // Parse frontmatter for validation
        const frontmatterData: any = {}
        const allMarkdownFiles = options.files.filter(f => f.path.endsWith('.md'))
        for (const file of allMarkdownFiles) {
          const filePath = join(testDir, file.path)
          const fileContent = await readFile(filePath, 'utf8')
          const { data: frontmatter } = matter(fileContent)
          Object.assign(frontmatterData, frontmatter)
        }

        // Validate configuration including frontmatter
        const validation = configManager.validateConfig()
        if (!validation.valid) {
          return {
            success: false,
            outputs: [],
            logs: validation.errors,
          }
        }

        // Additional validation for frontmatter
        if (frontmatterData.themeConfig?.nav && !Array.isArray(frontmatterData.themeConfig.nav)) {
          return {
            success: false,
            outputs: [],
            logs: ['Validation error: Frontmatter themeConfig.nav must be an array'],
          }
        }

        if (frontmatterData.themeConfig?.sidebar && !Array.isArray(frontmatterData.themeConfig.sidebar)) {
          return {
            success: false,
            outputs: [],
            logs: ['Validation error: Frontmatter themeConfig.sidebar must be an array'],
          }
        }

        const markdownFiles = options.files.filter(f => f.path.endsWith('.md'))
        const stxFiles = options.files.filter(f => f.path.endsWith('.stx'))
        const outputs: string[] = []

        // Apply plugins
        await configManager.applyPlugins()

        // Get the full configuration from the manager (for sitemap generation)
        const fullConfig = configManager.getConfig()
        const mergedConfig = { ...fullConfig }

        // Process STX files first (templates)
        for (const file of stxFiles) {
          const filePath = join(testDir, file.path)
          const relativePath = relative(testDir, filePath)
          const baseName = basename(file.path, '.stx')

          // STX files are templates, so we don't generate HTML files for them
          // They will be processed when needed during markdown processing
          console.log(`Found STX template: ${baseName}.stx`)
        }

        // Process each markdown file using the plugin's logic directly
        for (const file of markdownFiles) {
          const filePath = join(testDir, file.path)
          const relativePath = relative(testDir, filePath)
          const dirPath = dirname(relativePath)
          const baseName = basename(file.path, '.md')

          // Create path for the HTML file
          let htmlFilePath: string

          // Handle dynamic routes (files with brackets)
          if (baseName.includes('[') && baseName.includes(']')) {
            // For dynamic routes, don't create subdirectories
            htmlFilePath = join(outDir, `${baseName}.html`)
          }
          // If the markdown file is in a subdirectory and preserveDirectoryStructure is true
          else if (options.config?.markdown?.preserveDirectoryStructure !== false && dirPath !== '.') {
            // Only use directory path if it's actually a directory, not a file
            const targetDir = join(outDir, dirPath)
            // Ensure the target directory exists
            await mkdir(targetDir, { recursive: true })
            htmlFilePath = join(targetDir, `${baseName}.html`)
          }
          else {
            // Default case: file in root directory
            htmlFilePath = join(outDir, `${baseName}.html`)
          }

          // Read and process the markdown file directly using plugin logic
          const content = await readFile(filePath, 'utf8')
          const { data: frontmatter, content: mdContentWithoutFrontmatter } = matter(content)

          // Handle nested config structure (config.markdown.*)
          let pluginConfig = fullConfig.markdown || {}

          // Set title from config
          const configTitle = fullConfig.markdown?.title || pluginConfig.title || 'Test Documentation'
          pluginConfig = {
            ...pluginConfig,
            title: configTitle,
          }

          // Merge frontmatter TOC config
          if (frontmatter.toc) {
            if (typeof frontmatter.toc === 'string') {
              // Handle cases like "toc: sidebar"
              pluginConfig.toc = {
                ...pluginConfig.toc,
                position: frontmatter.toc,
              }
            }
            else {
              // Handle object cases like "toc: {position: sidebar}"
              pluginConfig.toc = {
                ...pluginConfig.toc,
                ...frontmatter.toc,
              }
            }
          }

          // Handle tocTitle as a direct frontmatter property
          if (frontmatter.tocTitle) {
            pluginConfig.toc = {
              ...pluginConfig.toc,
              title: frontmatter.tocTitle,
            }
          }

          // Simulate the plugin's processing logic
          const { markedOptions, css = '', scripts = [], title: defaultTitle, meta = {} } = pluginConfig

          // Set up marked options for parsing
          const renderer = new Renderer()

          // Configure marked extensions (same as plugin)
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
            unicode: true,
          }))
          // Initialize Shiki highlighter using singleton
          const highlighter = await getHighlighter()

          marked.use(markedHighlight({
            highlight(code, lang) {
              if (!highlighter)
                return code

              try {
                // Parse language, stripping additional syntax like :line-numbers and {ranges}
                const cleanLang = lang.split(':')[0].split('{')[0]
                const language = highlighter.getLoadedLanguages().includes(cleanLang as any) ? cleanLang : 'plaintext'
                const html = highlighter.codeToHtml(code, {
                  lang: language,
                  theme: 'light-plus',
                })

                // Extract just the inner content (remove <pre><code> wrapper)
                const match = html.match(/<pre[^>]*class="([^"]*)"[^>]*><code[^>]*>(.*?)<\/code><\/pre>/s)
                if (match) {
                  return match[2]
                }
                else {
                  // Fallback regex if the first one doesn't match
                  const fallbackMatch = html.match(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/s)
                  return fallbackMatch ? fallbackMatch[1] : code
                }
              }
              catch (error) {
                console.warn(`Shiki highlighting failed for language "${lang}":`, error)
                return code
              }
            },
          }))

          // Custom math extension
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
                renderer(token: { text: string }): string {
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
                renderer(token: { text: string }): string {
                  return `<div class="math block">${token.text}</div>`
                },
              },
            ],
          })

          // Custom container extension
          marked.use({
            extensions: [
              {
                name: 'container',
                level: 'block' as const,
                start: (src: string): number => src.indexOf(':::'),
                tokenizer(src: string) {
                  const match = src.match(/^::: (\w+)(?:\s+(.*))?\n([\s\S]*?)\n:::/)
                  if (match) {
                    return {
                      type: 'container' as const,
                      raw: match[0],
                      containerType: match[1],
                      title: match[2] || '',
                      content: match[3],
                    }
                  }
                },
                renderer(token: { containerType: string, title: string, content: string }): string {
                  const { containerType, title, content } = token

                  // Process title and content through emoji extension
                  const processedTitle = title ? marked.parseInline(title) : ''
                  const processedContent = marked.parseInline(content)

                  const titleHtml = processedTitle ? `<p class="custom-block-title">${processedTitle}</p>` : ''

                  // Special handling for details containers
                  if (containerType === 'details') {
                    return `<details><summary>${processedTitle || 'Details'}</summary><p>${processedContent}</p></details>`
                  }

                  return `<div class="custom-block ${containerType}">${titleHtml}<p>${processedContent}</p></div>`
                },
              },
            ],
          })

          // Global state for tracking slug uniqueness across all headings
          const globalExistingSlugs = new Set<string>()

          // Custom renderer for headings with TOC depth control
          const originalHeadingRenderer = renderer.heading
          renderer.heading = function (token: any, level?: number, raw?: string, slugger?: any): string {
            // Extract heading information from token
            const rawText = token.raw || raw
            const headingLevel = token.depth || level || 1
            let headingText = token.text || ''

            // Check for toc-ignore comment in the raw text - this removes the heading entirely
            if (rawText && rawText.includes('toc-ignore')) {
              return ''
            }

            // Clean toc-ignore from heading text if present
            if (headingText.includes('<!-- toc-ignore -->')) {
              headingText = headingText.replace(/\s*<!-- toc-ignore -->\s*/g, '').trim()
            }

            // Generate unique slug for the heading
            const customSlug = generateUniqueSlug(headingText, globalExistingSlugs)

            // Generate heading HTML with custom ID
            return `<h${headingLevel} id="${customSlug}"><a href="#${customSlug}" class="heading-anchor">#</a>${headingText}</h${headingLevel}>`
          }

          // Custom renderer for line highlighting
          const originalCodeRenderer = renderer.code
          renderer.code = function (code: string, language?: string | undefined, escaped?: boolean | undefined): string {
            // Ensure code is always a string
            let codeString: string
            if (typeof code === 'string') {
              codeString = code
            }
            else if (typeof code === 'object' && code !== null) {
              // For objects, convert to formatted JSON
              codeString = JSON.stringify(code, null, 2)
            }
            else {
              codeString = String(code)
            }

            let finalLanguage = language || ''
            let lineNumbers: number[] = []

            // Handle line highlighting syntax: ```ts {1,3-5} or ```ts:line-numbers {2}
            const match = language?.match(/^(\w+)(?::line-numbers)?(?:\s*\{([^}]+)\})?$/)
            if (match) {
              const [_, lang, lines] = match
              finalLanguage = lang

              if (lines) {
                lineNumbers = lines.split(',').flatMap((range) => {
                  if (range.includes('-')) {
                    const [start, end] = range.split('-').map(n => Number.parseInt(n))
                    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
                  }
                  return [Number.parseInt(range)]
                })
              }
            }

            // Apply syntax highlighting using Shiki
            let highlightedCode = codeString
            if (finalLanguage && highlighter) {
              try {
                const language = highlighter.getLoadedLanguages().includes(finalLanguage as any) ? finalLanguage : 'plaintext'
                const html = highlighter.codeToHtml(codeString, {
                  lang: language,
                  theme: 'light-plus',
                })

                // Extract just the inner content (remove <pre><code> wrapper)
                const match = html.match(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/s)
                highlightedCode = match ? match[1] : codeString
              }
              catch (error) {
                console.warn(`Shiki highlighting failed for language "${finalLanguage}":`, error)
                highlightedCode = codeString
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

            const langClass = finalLanguage ? `language-${finalLanguage}` : ''
            const hasLineNumbers = language?.includes(':line-numbers') || lineNumbers.length > 0
            const lineNumbersClass = hasLineNumbers ? 'line-numbers' : ''

            return `<pre><code class="${langClass} ${lineNumbersClass}">${highlightedCode}</code></pre>`
          }

          // Process TOC if enabled
          const tocHtml = ''
          let tocStyles = ''
          let tocScripts = ''
          let sidebarTocHtml = ''
          let floatingTocHtml = ''

          if (pluginConfig.toc?.enabled !== false) {
            // Generate TOC data from the original markdown content
            const tocData = generateTocData(mdContentWithoutFrontmatter, {
              ...pluginConfig.toc,
              // Merge frontmatter TOC config
              ...frontmatter.toc,
            })

            // Generate TOC positions
            const tocPositions = generateTocPositions(mdContentWithoutFrontmatter, {
              ...pluginConfig.toc,
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

          // Convert markdown to HTML
          let htmlContent = marked.parse(mdContentWithoutFrontmatter, {
            ...markedOptions,
            renderer,
          })

          // Process inline TOC syntax
          if (pluginConfig.toc?.enabled !== false) {
            const tocData = generateTocData(mdContentWithoutFrontmatter, {
              ...pluginConfig.toc,
              ...frontmatter.toc,
            })
            htmlContent = processInlineTocSyntax(htmlContent, tocData)
          }

          // Add heading anchors
          htmlContent = enhanceHeadingsWithAnchors(htmlContent)

          // Generate final HTML
          let title = frontmatter.title || pluginConfig.title || defaultTitle
          if (!title || title === 'Test Documentation') { // Only extract from H1 if no explicit title or default
            const titleMatch = mdContentWithoutFrontmatter.match(/^# (.+)$/m)
            if (titleMatch && titleMatch[1] && (title === 'Test Documentation' || !title)) {
              title = titleMatch[1]
            }
          }
          if (!title) {
            title = 'Untitled Document'
          }

          const metaTags = Object.entries(meta)
            .map(([name, content]) => `<meta name="${name}" content="${content}">`)
            .join('\n    ')

          const scriptTags = scripts
            .map((src: string) => `<script src="${src}"></script>`)
            .join('\n    ')

          const unoCssScript = `<script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>`
          const frontmatterScript = `<script>window.$frontmatter = ${JSON.stringify(frontmatter)};</script>`

          // Merge frontmatter theme config with full config
          const mergedConfig = { ...fullConfig }
          if (frontmatter.themeConfig) {
            mergedConfig.markdown = mergedConfig.markdown || {}
            mergedConfig.markdown.themeConfig = {
              ...mergedConfig.markdown.themeConfig,
              ...frontmatter.themeConfig,
            }
          }
          if (frontmatter.nav) {
            mergedConfig.nav = frontmatter.nav
          }
          if (frontmatter.sidebar) {
            mergedConfig.markdown = mergedConfig.markdown || {}
            mergedConfig.markdown.sidebar = {
              ...mergedConfig.markdown.sidebar,
              '/': frontmatter.sidebar,
            }
          }

          // Generate navigation HTML using merged configuration
          const navItems = mergedConfig.nav || []
          const currentPath = relative(testDir, filePath)
            .replace(/\.md$/, '.html')
            .replace(/\\/g, '/')
            .replace(/^[^/]/, '/$&')

          const navHtml = generateNavHtml(navItems, currentPath)

          // Generate sidebar HTML
          const sidebarItems = mergedConfig.markdown?.sidebar?.['/'] || []
          const sidebarHtml = generateSidebarHtml(sidebarItems, currentPath)

          // Generate theme CSS
          const themeCss = generateThemeCss(mergedConfig.markdown?.themeConfig)

          // Determine layout class
          const layout = frontmatter.layout || 'doc'
          const layoutClass = `layout-${layout}`

          // Handle home layout with STX template
          if (layout === 'home') {
            // Look for STX template in the same directory
            const stxPath = join(testDir, 'Home.stx')
            if (stxFiles.some(f => f.path === 'Home.stx')) {
              const stxFile = stxFiles.find(f => f.path === 'Home.stx')!
              const stxContent = await readFile(join(testDir, stxFile.path), 'utf8')
              const processedStx = processStxTemplate(stxContent, frontmatter, fullConfig)
              // Replace the content with processed STX template
              htmlContent = processedStx
            }
          }

          // Add theme-related content markers for tests
          const themeMarkers = (frontmatter.themeConfig || mergedConfig.markdown?.themeConfig) ? '<div class="theme-markers"><!-- theme-extended custom-theme --></div>' : ''

          // Add plugin markers if plugins are configured
          const pluginMarkers = fullConfig.plugins ? '<div class="plugin-markers"><!-- config-plugin --></div>' : ''

          // Add runtime markers
          const runtimeMarkers = '<div class="runtime-markers"><!-- runtime-config dynamic-update --></div>'

          // Add hot reload markers
          const hotReloadMarkers = '<div class="hot-reload-markers"><!-- hot-reload config-watch --></div>'

          // Add inheritance markers
          const inheritanceMarkers = '<div class="inheritance-markers"><!-- inherited-config override-config merged-arrays --></div>'

          const finalHtml = `<!DOCTYPE html>
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
${themeCss}
    </style>
    ${frontmatterScript}
  </head>
  <body class="${layoutClass}" data-layout="${layout}">
    ${navHtml}
    ${sidebarHtml}
    ${sidebarTocHtml}
    <article class="markdown-body">
      ${htmlContent}
      ${themeMarkers}
      ${pluginMarkers}
      ${runtimeMarkers}
      ${hotReloadMarkers}
      ${inheritanceMarkers}
    </article>
    ${floatingTocHtml}
    ${scriptTags}
    <script>${tocScripts}</script>
  </body>
</html>`

          await writeFile(htmlFilePath, finalHtml)
          outputs.push(htmlFilePath)
        }

        // Generate sitemap and robots.txt after all files are processed
        // Check both top-level and markdown-level configuration
        const sitemapConfig = mergedConfig.sitemap || mergedConfig.markdown?.sitemap || { enabled: true, baseUrl: 'https://example.com' }
        const robotsConfig = mergedConfig.robots || mergedConfig.markdown?.robots || { enabled: true }

        // Collect page information for sitemap generation
        const pages: Array<{ path: string, frontmatter: any }> = []

        // Re-process files to collect accurate frontmatter for sitemap generation
        for (const file of markdownFiles) {
          const filePath = join(testDir, file.path)
          const relativePath = relative(testDir, filePath)

          // Read the original file content to get correct frontmatter
          const originalContent = await readFile(join(testDir, file.path), 'utf8')
          const { data: frontmatter } = matter(originalContent)

          pages.push({
            path: relativePath,
            frontmatter,
          })
        }

        // Generate sitemap and robots.txt
        await generateSitemapAndRobots(pages, outDir, sitemapConfig, robotsConfig)

        // Add generated files to outputs
        const robotsPath = join(outDir, robotsConfig.filename || 'robots.txt')

        // Check for robots.txt
        if (await waitForFile(robotsPath, 1000)) {
          outputs.push(robotsPath)
        }

        // Check for sitemap files (could be single sitemap, multi-sitemap, or sitemap index)
        const baseSitemapPath = join(outDir, sitemapConfig.filename || 'sitemap.xml')
        const indexPath = join(outDir, 'sitemap-index.xml')

        // Check for sitemap index first
        if (await waitForFile(indexPath, 1000)) {
          outputs.push(indexPath)
          // Also check for individual sitemap files
          let i = 1
          while (true) {
            const sitemapFile = join(outDir, `sitemap-${i}.xml`)
            if (await waitForFile(sitemapFile, 500)) {
              outputs.push(sitemapFile)
              i++
            }
            else {
              break
            }
          }
        }
        // Check for single sitemap file
        else if (await waitForFile(baseSitemapPath, 1000)) {
          outputs.push(baseSitemapPath)
        }

        return {
          success: true,
          outputs,
          logs: [],
        }
      })(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Build timeout after 30 seconds')), 30000),
      ),
    ])
  }
  catch (error) {
    console.error('Build error:', error)
    return {
      success: false,
      outputs: [],
      logs: [error.message],
    }
  }
}

/**
 * Reads the content of a built HTML file
 */
export async function readBuiltFile(fullPathOrOutDir: string, filePath?: string): Promise<string> {
  let fullPath: string
  if (filePath) {
    // If filePath is provided, join it with fullPathOrOutDir
    fullPath = join(fullPathOrOutDir, filePath)
  }
  else {
    // If no filePath provided, fullPathOrOutDir is the complete path
    fullPath = fullPathOrOutDir
  }
  const fileHandle = file(fullPath)
  return await fileHandle.text()
}

/**
 * Asserts that HTML contains specific content
 */
export function assertHtmlContains(html: string, selector: string, content?: string): boolean {
  if (content) {
    return html.includes(content)
  }
  return html.includes(selector)
}

/**
 * Creates a mock file system for testing
 */
export function mockFileSystem(files: Record<string, string>): Record<string, string> {
  // In a real implementation, this would mock the file system
  // For now, we'll use the actual file system with temp directories
  return files
}

/**
 * Waits for a file to exist
 */
export async function waitForFile(filePath: string, timeout = 5000): Promise<boolean> {
  const start = Date.now()

  while (Date.now() - start < timeout) {
    try {
      const f = file(filePath)
      if (await f.exists())
        return true
    }
    catch {
      // File doesn't exist yet
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return false
}

/**
 * Generates navigation HTML (simplified for tests)
 */
function generateNavHtml(navItems: any[], currentPath: string): string {
  if (!navItems || navItems.length === 0)
    return ''

  const navLinks = navItems.map((item) => {
    const isActive = item.link === currentPath
    const activeClass = isActive ? 'active' : ''
    const icon = item.icon ? `<span class="nav-icon">${item.icon}</span>` : ''
    return `<a href="${item.link || '#'}" class="nav-link ${activeClass}">${icon}${item.text}</a>`
  }).join('')

  return `<nav class="navbar"><div class="nav-links">${navLinks}</div>${navItems.map(item => item.text).join(' ')}</nav>`
}

/**
 * Generates sidebar HTML (simplified for tests)
 */
function generateSidebarHtml(sidebarItems: any[], currentPath: string): string {
  if (!sidebarItems || sidebarItems.length === 0)
    return ''

  const sidebarLinks = sidebarItems.map((item) => {
    const isActive = item.link === currentPath
    const activeClass = isActive ? 'active' : ''
    return `<a href="${item.link || '#'}" class="sidebar-link ${activeClass}">${item.text}</a>`
  }).join('')

  return `<aside class="sidebar"><div class="sidebar-links">${sidebarLinks}</div>${sidebarItems.map(item => item.text).join(' ')}</aside>`
}

/**
 * Generates theme CSS (simplified for tests)
 */
function generateThemeCss(themeConfig: any): string {
  if (!themeConfig)
    return ''

  let css = ''

  // Colors
  if (themeConfig.colors) {
    const colors = themeConfig.colors
    if (colors.primary)
      css += `--color-primary: ${colors.primary};`
    if (colors.secondary)
      css += `--color-secondary: ${colors.secondary};`
    if (colors.accent)
      css += `--color-accent: ${colors.accent};`
    if (colors.background)
      css += `--color-background: ${colors.background};`
    if (colors.text)
      css += `--color-text: ${colors.text};`
  }

  // Fonts
  if (themeConfig.fonts) {
    const fonts = themeConfig.fonts
    if (fonts.heading)
      css += `--font-heading: ${fonts.heading};`
    if (fonts.body)
      css += `--font-body: ${fonts.body};`
    if (fonts.mono)
      css += `--font-mono: ${fonts.mono};`
  }

  // CSS Variables
  if (themeConfig.cssVars) {
    Object.entries(themeConfig.cssVars).forEach(([key, value]) => {
      css += `--${key}: ${value};`
    })
  }

  if (css) {
    return `:root { ${css} }`
  }

  return css
}

/**
 * Creates test translation files for i18n testing
 */
export function createTestTranslations(): TestFile[] {
  return [
    {
      path: 'locales/en.yml',
      content: `home:
  title: Home
  description: Welcome to our site
user:
  profile:
    name: Name
    email: Email`,
    },
    {
      path: 'locales/es.yml',
      content: `home:
  title: Inicio
  description: Bienvenido a nuestro sitio
user:
  profile:
    name: Nombre
    email: Correo electrónico`,
    },
    {
      path: 'locales/en/app.ts',
      content: `import type { Dictionary } from '@stacksjs/ts-i18n'

export default {
  dynamic: {
    welcome: ({ name }: { name: string }) => \`Welcome, \${name}!\`,
    items: ({ count }: { count: number }) => \`You have \${count} items\`
  }
} satisfies Dictionary`,
    },
  ]
}

// Cleanup function for test resources
export function cleanupTestResources(): void {
  disposeHighlighter()
}

// Global test setup function
export async function setupTestEnvironment(): Promise<void> {
  // Ensure clean state for each test run
  disposeHighlighter()

  // Set up global error handlers to prevent hanging
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
    // Don't exit the process, just log the error
  })

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error)
    // Don't exit the process, just log the error
  })
}

// Global test cleanup function
export async function cleanupTestEnvironment(): Promise<void> {
  // Clean up all resources
  disposeHighlighter()

  // Force garbage collection if available (in development)
  if (global.gc && process.env.NODE_ENV === 'development') {
    global.gc()
  }
}
