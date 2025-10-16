/* eslint-disable no-console */
import type { BunPressConfig } from './types'
import { YAML } from 'bun'
import { readdir } from 'node:fs/promises'
import process from 'node:process'
import { config } from './config'

/**
 * Generate sidebar HTML from BunPress config
 */
function generateSidebar(config: BunPressConfig, currentPath: string): string {
  if (!config.markdown?.sidebar) {
    return ''
  }

  let html = '<nav class="fixed top-[60px] left-0 bottom-0 w-[260px] bg-white border-r border-[#e2e2e3] overflow-y-auto py-6">'

  // Get sidebar for current path or default '/' sidebar
  const pathKey = Object.keys(config.markdown.sidebar).find(key =>
    currentPath.startsWith(key),
  ) || '/'

  const sidebarSections = config.markdown.sidebar[pathKey] || []

  for (const section of sidebarSections) {
    html += `<div class="mb-6">
      <h3 class="px-6 text-sm font-semibold mb-2">${section.text}</h3>
      <ul class="list-none">`

    if (section.items) {
      for (const item of section.items) {
        const isActive = item.link === currentPath
        html += `<li><a href="${item.link}" class="block py-1.5 px-6 text-[#476582] no-underline text-sm hover:text-[#3451b2] ${isActive ? 'text-[#3451b2] font-medium border-r-2 border-[#3451b2]' : ''}">${item.text}</a></li>`
      }
    }

    html += '</ul></div>'
  }

  html += '</nav>'
  return html
}

/**
 * Generate navigation HTML from BunPress config
 */
function generateNav(config: BunPressConfig): string {
  if (!config.nav || config.nav.length === 0) {
    return ''
  }

  let html = '<nav class="flex gap-6 items-center">'

  for (const item of config.nav) {
    // Handle items with sub-items (dropdown)
    if (item.items && item.items.length > 0) {
      html += `<div class="relative group">
        <span class="text-[#476582] no-underline text-sm cursor-pointer hover:text-[#3451b2]">${item.text} ▼</span>
        <div class="hidden group-hover:block absolute top-full left-0 bg-white border border-[#e2e2e3] rounded shadow-lg min-w-[150px] py-2 mt-2">`

      for (const subItem of item.items) {
        html += `<a href="${subItem.link}" class="block px-4 py-2 text-[#476582] no-underline text-sm hover:bg-[#f6f6f7] hover:text-[#3451b2]">${subItem.text}</a>`
      }

      html += '</div></div>'
    }
    else {
      html += `<a href="${item.link}" class="text-[#476582] no-underline text-sm hover:text-[#3451b2]">${item.text}</a>`
    }
  }

  html += '</nav>'
  return html
}

/**
 * Wrap content in BunPress documentation layout
 */
function wrapInLayout(content: string, config: BunPressConfig, currentPath: string, isHome: boolean = false): string {
  const title = config.markdown?.title || 'BunPress Documentation'
  const description = config.markdown?.meta?.description || 'Documentation built with BunPress'
  const customCSS = config.markdown?.css || ''

  // Home layout - no sidebar, minimal header
  if (isHome) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  ${Object.entries(config.markdown?.meta || {})
    .filter(([key]) => key !== 'description')
    .map(([key, value]) => `<meta name="${key}" content="${value}">`)
    .join('\n  ')}
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* Custom CSS from config */
    ${customCSS}
  </style>
</head>
<body class="m-0 p-0 box-border font-sans leading-relaxed">
  <header class="fixed top-0 left-0 right-0 h-[60px] bg-white/80 backdrop-blur-sm border-b border-gray-200 flex items-center px-6 z-[100]">
    <div class="text-xl font-semibold mr-8">${title}</div>
    ${generateNav(config)}
  </header>

  <main class="mt-[60px]">
    ${content}
  </main>

  ${config.markdown?.scripts?.map(script => `<script src="${script}"></script>`).join('\n') || ''}
</body>
</html>
    `
  }

  // Documentation layout - with sidebar
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  ${Object.entries(config.markdown?.meta || {})
    .filter(([key]) => key !== 'description')
    .map(([key, value]) => `<meta name="${key}" content="${value}">`)
    .join('\n  ')}
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* Custom CSS from config */
    ${customCSS}
  </style>
</head>
<body class="m-0 p-0 box-border font-sans leading-relaxed">
  <header class="fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-[#e2e2e3] flex items-center px-6 z-[100]">
    <div class="text-xl font-semibold mr-8">${title}</div>
    ${generateNav(config)}
  </header>

  ${generateSidebar(config, currentPath)}

  <main class="ml-[260px] mt-[60px] p-8 max-w-[900px]">
    <article class="prose prose-slate max-w-none
      prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4 prose-h1:pb-2 prose-h1:border-b prose-h1:border-[#e2e2e3]
      prose-h2:text-2xl prose-h2:mt-7 prose-h2:mb-3
      prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
      prose-p:my-4
      prose-a:text-[#3451b2] prose-a:no-underline hover:prose-a:underline
      prose-ul:my-4 prose-ul:pl-8
      prose-ol:my-4 prose-ol:pl-8
      prose-li:my-2
      prose-code:bg-[#f6f6f7] prose-code:px-1.5 prose-code:py-1 prose-code:rounded prose-code:font-mono prose-code:text-sm
      prose-pre:bg-[#f6f6f7] prose-pre:p-5 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-6
      prose-pre:code:bg-transparent prose-pre:code:p-0
      prose-blockquote:border-l-4 prose-blockquote:border-[#3451b2] prose-blockquote:pl-4 prose-blockquote:my-6 prose-blockquote:text-[#476582]
      prose-table:border-collapse prose-table:w-full prose-table:my-6
      prose-th:border prose-th:border-[#e2e2e3] prose-th:px-3 prose-th:py-3 prose-th:text-left prose-th:bg-[#f6f6f7] prose-th:font-semibold
      prose-td:border prose-td:border-[#e2e2e3] prose-td:px-3 prose-td:py-3">
      ${content}
    </article>
  </main>

  ${config.markdown?.scripts?.map(script => `<script src="${script}"></script>`).join('\n') || ''}
</body>
</html>
  `
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
function generateHero(hero: any): string {
  if (!hero) return ''

  return `
    <div class="relative px-6 lg:px-8">
      <div class="mx-auto max-w-5xl pt-20 pb-32 sm:pt-48 sm:pb-40">
        <div class="text-center">
          ${hero.name ? `<h1 class="text-4xl font-bold tracking-tight text-[#5672cd] sm:text-6xl mb-4">${hero.name}</h1>` : ''}
          ${hero.text ? `<p class="text-4xl sm:text-6xl font-bold tracking-tight text-gray-900 mb-6">${hero.text}</p>` : ''}
          ${hero.tagline ? `<p class="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">${hero.tagline}</p>` : ''}
          ${hero.actions ? `
            <div class="mt-10 flex items-center justify-center gap-x-6">
              ${hero.actions.map((action: any) => {
                const isPrimary = action.theme === 'brand'
                return `<a href="${action.link}" class="${isPrimary
                  ? 'rounded-md bg-[#5672cd] px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-[#4461bc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5672cd] transition-colors'
                  : 'rounded-md px-6 py-3 text-base font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors'}">${action.text}</a>`
              }).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `
}

/**
 * Generate features grid HTML from frontmatter
 */
function generateFeatures(features: any[]): string {
  if (!features || features.length === 0) return ''

  return `
    <div class="py-24 sm:py-32 bg-gray-50">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          ${features.map(feature => `
            <div class="relative bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              ${feature.icon ? `<div class="text-4xl mb-4">${feature.icon}</div>` : ''}
              <h3 class="text-lg font-semibold text-gray-900 mb-2">${feature.title || ''}</h3>
              <p class="text-sm text-gray-600 leading-relaxed">${feature.details || ''}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `
}

/**
 * Simple markdown to HTML converter (placeholder until full markdown plugin is enabled)
 */
function markdownToHtml(markdown: string): { html: string, frontmatter: any } {
  // Parse frontmatter
  const { frontmatter, content } = parseFrontmatter(markdown)

  // If it's a home layout, generate hero and features
  if (frontmatter.layout === 'home') {
    const heroHtml = generateHero(frontmatter.hero)
    const featuresHtml = generateFeatures(frontmatter.features)
    return {
      html: heroHtml + featuresHtml,
      frontmatter
    }
  }

  // Very basic markdown conversion - will be replaced with full plugin
  // Split into lines for better processing
  const lines = content.split('\n')
  const html: string[] = []
  let inCodeBlock = false
  let inList = false

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

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
      html.push(`<h3>${line.substring(4)}</h3>`)
      continue
    }
    if (line.startsWith('## ')) {
      if (inList) {
        html.push('</ul>')
        inList = false
      }
      html.push(`<h2>${line.substring(3)}</h2>`)
      continue
    }
    if (line.startsWith('# ')) {
      if (inList) {
        html.push('</ul>')
        inList = false
      }
      html.push(`<h1>${line.substring(2)}</h1>`)
      continue
    }

    // Lists
    if (line.match(/^\s*[-*]\s+/)) {
      if (!inList) {
        html.push('<ul>')
        inList = true
      }
      html.push(`<li>${line.replace(/^\s*[-*]\s+/, '')}</li>`)
      continue
    }

    // Close list if we're in one and hit a non-list line
    if (inList && line.trim() !== '') {
      html.push('</ul>')
      inList = false
    }

    // Empty lines
    if (line.trim() === '') {
      continue
    }

    // Regular paragraphs
    // Apply inline formatting: bold, italic, code, links
    line = line
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')

    html.push(`<p>${line}</p>`)
  }

  // Close list if still open
  if (inList) {
    html.push('</ul>')
  }

  return {
    html: html.join('\n'),
    frontmatter
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
          const { html, frontmatter } = markdownToHtml(markdown)
          const isHome = frontmatter.layout === 'home'
          const wrappedHtml = wrapInLayout(html, bunPressConfig, path, isHome)
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
        wrapInLayout(
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
      const files = await readdir(root, { recursive: true })

      let timeout: Timer | null = null
      const rebuildDebounced = () => {
        if (timeout)
          clearTimeout(timeout)
        timeout = setTimeout(async () => {
          console.log('File changed detected, reloading...')
          // The server will automatically serve the updated files on next request
          console.log('Ready for requests')
        }, 100) // Debounce 100ms
      }

      // Use file polling for simplicity
      setInterval(async () => {
        try {
          const newFiles = await readdir(root, { recursive: true })
          if (JSON.stringify(files) !== JSON.stringify(newFiles)) {
            files.length = 0
            files.push(...newFiles)
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
