import { mkdir, rm, writeFile } from 'node:fs/promises'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { file } from 'bun'
import { marked, Renderer } from 'marked'
import matter from 'gray-matter'
import markedAlert from 'marked-alert'
import { markedEmoji } from 'marked-emoji'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import type { BunPressOptions, MarkdownPluginOptions } from '../../src/types'
import { markdown } from '../../src/plugin'
import {
  generateTocData,
  generateTocPositions,
  processInlineTocSyntax,
  enhanceHeadingsWithAnchors,
  generateTocStyles,
  generateTocScripts,
  generateSlug,
  generateUniqueSlug
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
  frontmatter?: Record<string, any>
): string {
  if (!frontmatter) return content

  const frontmatterStr = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n')

  return `---\n${frontmatterStr}\n---\n\n${content}`
}

/**
 * Creates a test configuration
 */
export function createTestConfig(overrides?: Partial<BunPressOptions>): BunPressOptions {
  return {
    markdown: {
      title: 'Test Documentation',
      meta: {
        description: 'Test description',
        generator: 'BunPress Test'
      },
      css: 'body { background: #f0f0f0; }',
      scripts: ['/test.js']
    },
    verbose: true,
    ...overrides
  }
}

/**
 * Builds a test site using the markdown plugin
 */
export async function buildTestSite(options: TestSiteOptions): Promise<BuildResult> {
  const testDir = await createTestDirectory(options.files)
  const outDir = options.outDir || join(testDir, 'dist')

  try {
    await mkdir(outDir, { recursive: true })

    const markdownFiles = options.files.filter(f => f.path.endsWith('.md'))
    const outputs: string[] = []

    // Process each markdown file using the plugin's logic directly
    for (const file of markdownFiles) {
      const filePath = join(testDir, file.path)
      const baseName = file.path.replace(/\.md$/, '')
      const htmlFileName = `${baseName}.html`
      const htmlFilePath = join(outDir, htmlFileName)

      // Read and process the markdown file directly using plugin logic
      const content = await readFile(filePath, 'utf8')
      const { data: frontmatter, content: mdContentWithoutFrontmatter } = matter(content)

      // Use the plugin configuration or default
      const defaultConfig = {
        toc: { enabled: true }
      }

      // Handle nested config structure (config.markdown.*)
      let pluginConfig = options.config || defaultConfig
      if (pluginConfig.markdown) {
        const markdownConfig = pluginConfig.markdown
        const tocConfig: any = { ...pluginConfig.toc }

        // Map markdown config properties to TOC config
        if (markdownConfig.tocMaxDepth !== undefined) tocConfig.maxDepth = markdownConfig.tocMaxDepth
        if (markdownConfig.tocMinDepth !== undefined) tocConfig.minDepth = markdownConfig.tocMinDepth
        if (markdownConfig.tocStartLevel !== undefined) tocConfig.minDepth = markdownConfig.tocStartLevel
        if (markdownConfig.tocEndLevel !== undefined) tocConfig.maxDepth = markdownConfig.tocEndLevel
        if (markdownConfig.toc !== undefined) Object.assign(tocConfig, markdownConfig.toc)

        pluginConfig = {
          ...pluginConfig,
          toc: tocConfig
        }
      }

      // Merge frontmatter TOC config
      if (frontmatter.toc) {
        if (typeof frontmatter.toc === 'string') {
          // Handle cases like "toc: sidebar"
          pluginConfig.toc = {
            ...pluginConfig.toc,
            position: frontmatter.toc
          }
        } else {
          // Handle object cases like "toc: {position: sidebar}"
          pluginConfig.toc = {
            ...pluginConfig.toc,
            ...frontmatter.toc
          }
        }
      }

      // Handle tocTitle as a direct frontmatter property
      if (frontmatter.tocTitle) {
        pluginConfig.toc = {
          ...pluginConfig.toc,
          title: frontmatter.tocTitle
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
          bulb: '💡'
        },
        unicode: true
      }))
      marked.use(markedHighlight({
        highlight(code, lang) {
          const language = hljs.getLanguage(lang) ? lang : 'plaintext'
          return hljs.highlight(code, { language }).value
        }
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
                  text: match[1]
                }
              }
            },
            renderer(token: { text: string }): string {
              return `<span class="math inline">${token.text}</span>`
            }
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
                  text: match[1]
                }
              }
            },
            renderer(token: { text: string }): string {
              return `<div class="math block">${token.text}</div>`
            }
          }
        ]
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
                  content: match[3]
                }
              }
            },
            renderer(token: { containerType: string; title: string; content: string }): string {
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
            }
          }
        ]
      })

      // Global state for tracking slug uniqueness across all headings
      const globalExistingSlugs = new Set<string>()

      // Custom renderer for headings with TOC depth control
      const originalHeadingRenderer = renderer.heading
      renderer.heading = function(token: any, level?: number, raw?: string, slugger?: any): string {
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
      renderer.code = function(code: string, language?: string | undefined, escaped?: boolean | undefined): string {
        let finalLanguage = language || ''
        let lineNumbers: number[] = []

        // Handle line highlighting syntax: ```ts {1,3-5} or ```ts:line-numbers {2}
        const match = language?.match(/^(\w+)(?::line-numbers)?(?:\s*\{([^}]+)\})?$/)
        if (match) {
          const [_, lang, lines] = match
          finalLanguage = lang

          if (lines) {
            lineNumbers = lines.split(',').flatMap(range => {
              if (range.includes('-')) {
                const [start, end] = range.split('-').map(n => parseInt(n))
                return Array.from({ length: end - start + 1 }, (_, i) => start + i)
              }
              return [parseInt(range)]
            })
          }
        }

        // Apply syntax highlighting
        let highlightedCode = code
        if (finalLanguage) {
          const lang = hljs.getLanguage(finalLanguage) ? finalLanguage : 'plaintext'
          highlightedCode = hljs.highlight(code, { language: lang }).value
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
      let tocHtml = ''
      let tocStyles = ''
      let tocScripts = ''
      let sidebarTocHtml = ''
      let floatingTocHtml = ''

      if (pluginConfig.toc?.enabled !== false) {
        // Generate TOC data from the original markdown content
        const tocData = generateTocData(mdContentWithoutFrontmatter, {
          ...pluginConfig.toc,
          // Merge frontmatter TOC config
          ...frontmatter.toc
        })

        // Generate TOC positions
        const tocPositions = generateTocPositions(mdContentWithoutFrontmatter, {
          ...pluginConfig.toc,
          ...frontmatter.toc
        })

        // Extract TOC HTML for different positions
        const sidebarToc = tocPositions.find(p => p.position === 'sidebar')
        const floatingToc = tocPositions.find(p => p.position === 'floating')

        if (sidebarToc) sidebarTocHtml = sidebarToc.html
        if (floatingToc) floatingTocHtml = floatingToc.html

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
          ...frontmatter.toc
        })
        htmlContent = processInlineTocSyntax(htmlContent, tocData)
      }

      // Add heading anchors
      htmlContent = enhanceHeadingsWithAnchors(htmlContent)

      // Generate final HTML
      let title = frontmatter.title || defaultTitle
      if (!title) {
        const titleMatch = mdContentWithoutFrontmatter.match(/^# (.+)$/m)
        title = titleMatch ? titleMatch[1] : 'Untitled Document'
      }

      const metaTags = Object.entries(meta)
        .map(([name, content]) => `<meta name="${name}" content="${content}">`)
        .join('\n    ')

      const scriptTags = scripts
        .map((src: string) => `<script src="${src}"></script>`)
        .join('\n    ')

      const unoCssScript = `<script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>`
      const frontmatterScript = `<script>window.$frontmatter = ${JSON.stringify(frontmatter)};</script>`

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
    </style>
    ${frontmatterScript}
  </head>
  <body class="text-gray-800 bg-white">
    ${sidebarTocHtml}
    <article class="markdown-body">
      ${htmlContent}
    </article>
    ${floatingTocHtml}
    ${scriptTags}
    <script>${tocScripts}</script>
  </body>
</html>`

      await writeFile(htmlFilePath, finalHtml)
      outputs.push(htmlFilePath)
    }

    return {
      success: true,
      outputs,
      logs: []
    }
  }
  catch (error) {
    console.error('Build error:', error)
    return {
      success: false,
      outputs: [],
      logs: [error.message]
    }
  }
}

/**
 * Reads the content of a built HTML file
 */
export async function readBuiltFile(fullPathOrOutDir: string, filePath?: string): Promise<string> {
  let fullPath: string
  if (filePath) {
    fullPath = join(fullPathOrOutDir, filePath)
  } else {
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
      if (await f.exists()) return true
    }
    catch {
      // File doesn't exist yet
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return false
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
    email: Email`
    },
    {
      path: 'locales/es.yml',
      content: `home:
  title: Inicio
  description: Bienvenido a nuestro sitio
user:
  profile:
    name: Nombre
    email: Correo electrónico`
    },
    {
      path: 'locales/en/app.ts',
      content: `import type { Dictionary } from '@stacksjs/ts-i18n'

export default {
  dynamic: {
    welcome: ({ name }: { name: string }) => \`Welcome, \${name}!\`,
    items: ({ count }: { count: number }) => \`You have \${count} items\`
  }
} satisfies Dictionary`
    }
  ]
}
