import type { BunPlugin } from 'bun'
import type { Frontmatter, MarkdownPluginOptions } from './types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import matter from 'gray-matter'
import { marked } from 'marked'
import markedAlert from 'marked-alert'
import { markedEmoji } from 'marked-emoji'
import { markedHighlight } from 'marked-highlight'
import { createHighlighter, type Highlighter } from 'shiki'
import {
  generateTocData,
  generateTocPositions,
  processInlineTocSyntax,
  enhanceHeadingsWithAnchors,
  generateTocStyles,
  generateTocScripts
} from './toc'
import { config } from './config'

/**
 * Process STX templates (HTML with Blade-like syntax)
 *
 * Converts STX template syntax to regular HTML
 */
function processStxTemplate(content: string, frontmatter: any): string {
  // Process @if conditions
  let result = content.replace(/@if\(\$frontmatter\.([^)]+)\)([\s\S]*?)@endif/g, (_, path, ifContent) => {
    // Parse the dot path to get the actual value
    const parts = path.split('.')
    let value = frontmatter

    for (const part of parts) {
      if (value === undefined)
        return ''
      value = value[part]
    }

    return value ? ifContent : ''
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

    if (!Array.isArray(collection))
      return ''

    return collection.map((item) => {
      // Replace each occurrence of the item variable with the actual value
      let processedContent = loopContent
      for (const [key, value] of Object.entries(item)) {
        const regex = new RegExp(`\\{\\{\\$${itemVar}\\.${key}\\}\\}`, 'g')
        processedContent = processedContent.replace(regex, String(value))
      }
      return processedContent
    }).join('')
  })

  // Process {{ expressions }} for frontmatter variables
  result = result.replace(/\{\{\$frontmatter\.([^}]+)\}\}/g, (_, path) => {
    // Parse the dot path to get the actual value
    const parts = path.split('.')
    let value = frontmatter

    for (const part of parts) {
      if (value === undefined)
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
    const baseClasses = 'inline-flex items-center px-4 py-2 rounded-md font-medium transition-colors'
    const themeClasses = action.theme === 'brand'
      ? 'bg-primary text-white hover:bg-blue-800'
      : 'bg-blue-100 text-primary hover:bg-blue-200'

    return `<a href="${action.link}" class="${baseClasses} ${themeClasses}">
      ${action.text}
    </a>`
  }).join('\n') || ''

  return `
  <section class="py-16 mb-16">
    <div class="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
      <div class="flex-1">
        ${hero.name ? `<h1 class="text-lg font-semibold mb-2">${hero.name}</h1>` : ''}
        ${hero.text ? `<p class="text-4xl font-bold leading-tight mb-4">${hero.text}</p>` : ''}
        ${hero.tagline ? `<p class="text-xl text-gray-600 mb-8">${hero.tagline}</p>` : ''}

        ${actions ? `<div class="flex flex-wrap gap-4">${actions}</div>` : ''}
      </div>

      ${hero.image
        ? `
      <div class="flex-1 text-center">
        <img src="${hero.image}" alt="Hero Image" class="max-w-full h-auto">
      </div>`
        : ''}
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
    <div class="p-6 rounded-lg bg-blue-50 bg-opacity-30 transition-transform hover:translate-y-[-5px] hover:shadow-lg">
      ${feature.icon ? `<div class="text-3xl mb-4">${feature.icon}</div>` : ''}
      <h2 class="text-xl font-semibold mb-3">${feature.title}</h2>
      <p class="text-gray-600">${feature.details}</p>
    </div>
  `).join('\n')

  return `
  <section class="py-16">
    <div class="max-w-6xl mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(4, features.length)} gap-8">
        ${featureItems}
      </div>
    </div>
  </section>
  `
}

/**
 * Create HTML for a home page layout
 */
function createHomePageHtml(frontmatter: Frontmatter, htmlContent: string): string {
  // Check if we have a custom STX template for the Home component
  const stxTemplatePath = path.join(process.cwd(), 'dist/docs/Home.stx')

  if (fs.existsSync(stxTemplatePath)) {
    try {
      const stxTemplate = fs.readFileSync(stxTemplatePath, 'utf8')
      return processStxTemplate(stxTemplate, frontmatter)
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
      <div class="home-content max-w-4xl mx-auto px-4 py-8">
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

  return {
    name: 'markdown-plugin',
    setup(build) {
      let highlighter: Highlighter | null = null

      build.onStart(async () => {
        // Initialize Shiki highlighter
        highlighter = await createHighlighter({
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
            'plaintext'
          ]
        })
      })

      // Set up marked options for parsing
      const renderer = new marked.Renderer()

      // Configure marked extensions
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
        }
      }))

      // Add Shiki highlighting
      marked.use(markedHighlight({
        highlight(code, lang) {
          if (!highlighter) return code

          try {
            const language = highlighter.getLoadedLanguages().includes(lang as any) ? lang : 'plaintext'
            const html = highlighter.codeToHtml(code, {
              lang: language,
              theme: 'light-plus'
            })


            // Shiki returns HTML string
            if (typeof html === 'string') {
              // Extract just the inner content (remove <pre><code> wrapper)
              const match = html.match(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/s)
              return match ? match[1] : code
            }

            return code
          } catch (error) {
            console.warn(`Shiki highlighting failed for language "${lang}":`, error)
            return code
          }
        }
      }))

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

      // Custom renderer for code blocks with copy-to-clipboard and line highlighting
      const originalCodeRenderer = renderer.code
      renderer.code = function(code: string, language?: string | undefined, escaped?: boolean | undefined): string {
        // Ensure code is a string
        const codeString = typeof code === 'string' ? code : String(code || '')
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
            lineNumbers = lines.split(',').flatMap(range => {
              if (range.includes('-')) {
                const [start, end] = range.split('-').map(n => parseInt(n))
                return Array.from({ length: end - start + 1 }, (_, i) => start + i)
              }
              return [parseInt(range)]
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
              const language = highlighter.getLoadedLanguages().includes(finalLanguage as any) ? finalLanguage : 'plaintext'
              const html = highlighter.codeToHtml(codeString, {
                lang: language,
                theme: 'light-plus'
              })

              // Extract just the inner content (remove <pre><code> wrapper)
              const match = html.match(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/s)
              if (match) {
                highlightedCode = match[1]
                langClass = `language-${finalLanguage}`
              }
            } catch (error) {
              console.warn(`Shiki highlighting failed for language "${finalLanguage}":`, error)
              langClass = `language-${finalLanguage}`
            }
          } else {
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

        // Convert markdown to HTML
        const htmlContent = marked.parse(mdContentWithoutFrontmatter, {
          ...markedOptions,
          renderer,
        }) as string

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

        // Add UnoCSS
        const unoCssScript = `<script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>`

        // Add frontmatter data as a global variable
        const frontmatterScript = `<script>window.$frontmatter = ${JSON.stringify(frontmatter)};</script>`

        // Check for layout in frontmatter
        const layout = frontmatter.layout || 'doc'

        // Prepare content based on layout
        let pageContent = cleanedHtmlContent

        // Process TOC if enabled
        let tocHtml = ''
        let tocStyles = ''
        let tocScripts = ''
        let sidebarTocHtml = ''
        let floatingTocHtml = ''

        if (options.toc?.enabled !== false) {
          // Generate TOC data from the original markdown content
          const tocData = generateTocData(mdContentWithoutFrontmatter, {
            ...options.toc,
            // Merge frontmatter TOC config
            ...frontmatter.toc
          })

          // Process inline TOC syntax
          pageContent = processInlineTocSyntax(pageContent, tocData)

          // Generate TOC positions
          const tocPositions = generateTocPositions(mdContentWithoutFrontmatter, {
            ...options.toc,
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
          pageContent = createHomePageHtml(frontmatter as Frontmatter, cleanedHtmlContent)
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
`

        let finalHtml: string

        if (template) {
          // Use custom template with {{content}} placeholder
          finalHtml = template.replace(/\{\{content\}\}/g, pageContent)

          // Replace {{frontmatter.X}} placeholders with frontmatter values
          Object.entries(frontmatter).forEach(([key, value]) => {
            finalHtml = finalHtml.replace(new RegExp(`\\{\\{frontmatter\\.${key}\\}\\}`, 'g'), String(value))
          })

          // Add TOC styles and scripts if not already present
          if (tocStyles && !finalHtml.includes('table-of-contents')) {
            finalHtml = finalHtml.replace('</head>', `<style>${tocStyles}</style></head>`)
          }
          if (tocScripts && !finalHtml.includes('initToc')) {
            finalHtml = finalHtml.replace('</body>', `<script>${tocScripts}</script></body>`)
          }

          // Add copy styles and scripts
          if (!finalHtml.includes('copy-code-btn')) {
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
    </style>
    ${frontmatterScript}
  </head>
  <body data-layout="${layout}" class="text-gray-800 bg-white">
    ${sidebarTocHtml}
    <article class="markdown-body">
      ${pageContent}
    </article>
    ${floatingTocHtml}
    ${scriptTags}
    <script>${tocScripts}</script>
    <script>${copyScripts}</script>
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
    }
  }
}

// Add STX plugin to handle .stx files
export function stx(): BunPlugin {
  return {
    name: 'stx-plugin',
    setup(build) {
      build.onLoad({ filter: /\.stx$/ }, async (args) => {
        // Just register the file for now
        // The actual processing happens when we generate the HTML

        return {
          contents: `// STX template file: ${args.path}`,
          loader: 'js',
        }
      })
    },
  }
}
