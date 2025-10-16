/* eslint-disable no-console */
import type { BunPressConfig } from './types'
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

  let html = '<nav class="sidebar">'

  // Get sidebar for current path or default '/' sidebar
  const pathKey = Object.keys(config.markdown.sidebar).find(key =>
    currentPath.startsWith(key),
  ) || '/'

  const sidebarSections = config.markdown.sidebar[pathKey] || []

  for (const section of sidebarSections) {
    html += `<div class="sidebar-section">
      <h3 class="sidebar-title">${section.text}</h3>
      <ul class="sidebar-items">`

    if (section.items) {
      for (const item of section.items) {
        const isActive = item.link === currentPath
        html += `<li><a href="${item.link}" class="${isActive ? 'active' : ''}">${item.text}</a></li>`
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

  let html = '<nav class="header-nav">'

  for (const item of config.nav) {
    // Handle items with sub-items (dropdown)
    if (item.items && item.items.length > 0) {
      html += `<div class="nav-dropdown">
        <span class="nav-link">${item.text} ▼</span>
        <div class="dropdown-content">`

      for (const subItem of item.items) {
        html += `<a href="${subItem.link}" class="dropdown-link">${subItem.text}</a>`
      }

      html += '</div></div>'
    }
    else {
      html += `<a href="${item.link}" class="nav-link">${item.text}</a>`
    }
  }

  html += '</nav>'
  return html
}

/**
 * Wrap content in BunPress documentation layout
 */
function wrapInLayout(content: string, config: BunPressConfig, currentPath: string): string {
  const title = config.markdown?.title || 'BunPress Documentation'
  const description = config.markdown?.meta?.description || 'Documentation built with BunPress'
  const customCSS = config.markdown?.css || ''

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
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.7;
    }
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: #fff;
      border-bottom: 1px solid #e2e2e3;
      display: flex;
      align-items: center;
      padding: 0 1.5rem;
      z-index: 100;
    }
    .header-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-right: 2rem;
    }
    .header-nav {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }
    .nav-link {
      color: #476582;
      text-decoration: none;
      font-size: 0.9rem;
      cursor: pointer;
    }
    .nav-link:hover {
      color: #3451b2;
    }
    .nav-dropdown {
      position: relative;
    }
    .dropdown-content {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      background: #fff;
      border: 1px solid #e2e2e3;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      min-width: 150px;
      padding: 0.5rem 0;
      margin-top: 0.5rem;
    }
    .nav-dropdown:hover .dropdown-content {
      display: block;
    }
    .dropdown-link {
      display: block;
      padding: 0.5rem 1rem;
      color: #476582;
      text-decoration: none;
      font-size: 0.9rem;
    }
    .dropdown-link:hover {
      background: #f6f6f7;
      color: #3451b2;
    }
    .sidebar {
      position: fixed;
      top: 60px;
      left: 0;
      bottom: 0;
      width: 260px;
      background: #fff;
      border-right: 1px solid #e2e2e3;
      overflow-y: auto;
      padding: 1.5rem 0;
    }
    .sidebar-section {
      margin-bottom: 1.5rem;
    }
    .sidebar-title {
      padding: 0 1.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    .sidebar-items {
      list-style: none;
    }
    .sidebar-items a {
      display: block;
      padding: 0.4rem 1.5rem;
      color: #476582;
      text-decoration: none;
      font-size: 0.9rem;
    }
    .sidebar-items a:hover {
      color: #3451b2;
    }
    .sidebar-items a.active {
      color: #3451b2;
      font-weight: 500;
      border-right: 2px solid #3451b2;
    }
    .main {
      margin-left: 260px;
      margin-top: 60px;
      padding: 2rem 3rem;
      max-width: 900px;
    }
    .content h1 {
      font-size: 2rem;
      margin: 2rem 0 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e2e2e3;
    }
    .content h2 {
      font-size: 1.5rem;
      margin: 1.8rem 0 0.8rem;
    }
    .content h3 {
      font-size: 1.25rem;
      margin: 1.5rem 0 0.7rem;
    }
    .content p {
      margin: 1rem 0;
    }
    .content a {
      color: #3451b2;
      text-decoration: none;
    }
    .content a:hover {
      text-decoration: underline;
    }
    .content ul, .content ol {
      margin: 1rem 0;
      padding-left: 2rem;
    }
    .content li {
      margin: 0.5rem 0;
    }
    .content code {
      background: #f6f6f7;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
    }
    .content pre {
      background: #f6f6f7;
      padding: 1.2rem;
      border-radius: 6px;
      overflow-x: auto;
      margin: 1.5rem 0;
    }
    .content pre code {
      background: none;
      padding: 0;
    }
    .content blockquote {
      border-left: 4px solid #3451b2;
      padding-left: 1rem;
      margin: 1.5rem 0;
      color: #476582;
    }
    .content table {
      border-collapse: collapse;
      width: 100%;
      margin: 1.5rem 0;
    }
    .content th, .content td {
      border: 1px solid #e2e2e3;
      padding: 0.75rem;
      text-align: left;
    }
    .content th {
      background: #f6f6f7;
      font-weight: 600;
    }
    ${customCSS}
  </style>
</head>
<body>
  <header class="header">
    <div class="header-title">${title}</div>
    ${generateNav(config)}
  </header>

  ${generateSidebar(config, currentPath)}

  <main class="main">
    <article class="content">
      ${content}
    </article>
  </main>

  ${config.markdown?.scripts?.map(script => `<script src="${script}"></script>`).join('\n') || ''}
</body>
</html>
  `
}

/**
 * Simple markdown to HTML converter (placeholder until full markdown plugin is enabled)
 */
function markdownToHtml(markdown: string): string {
  // Remove frontmatter (YAML between ---)
  const content = markdown.replace(/^---\n[\s\S]*?\n---\n?/, '')

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

  return html.join('\n')
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
          const html = markdownToHtml(markdown)
          const wrappedHtml = wrapInLayout(html, bunPressConfig, path)
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
