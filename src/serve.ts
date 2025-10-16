/* eslint-disable no-console */
import type { ServeOptions } from '@stacksjs/stx'
import type { BunPressConfig } from './types'
import process from 'node:process'
import { createMiddleware, serve } from '@stacksjs/stx'
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
 * Middleware to wrap markdown/stx output in BunPress layout
 */
function createLayoutMiddleware(config: BunPressConfig) {
  return createMiddleware(async (request, next) => {
    const response = await next()

    // Only wrap HTML responses
    const contentType = response.headers.get('Content-Type')
    if (!contentType?.includes('text/html')) {
      return response
    }

    const content = await response.text()
    const url = new URL(request.url)
    const wrappedContent = wrapInLayout(content, config, url.pathname)

    return new Response(wrappedContent, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  })
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
  const watch = options.watch !== undefined ? options.watch : true

  const serverConfig: ServeOptions = {
    port,
    root,
    watch,
    middleware: [createLayoutMiddleware(bunPressConfig)],
    stxOptions: {
      markdown: {
        syntaxHighlighting: {
          enabled: true,
          serverSide: true,
          defaultTheme: 'github-dark',
        },
      },
    },
    onError: (error, request) => {
      console.error('Error:', error)
      return new Response(
        wrapInLayout(
          `<h1>Error</h1><pre>${error.message}\n${error.stack || ''}</pre>`,
          bunPressConfig,
          new URL(request.url).pathname,
        ),
        {
          status: 500,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        },
      )
    },
    on404: (request) => {
      return new Response(
        wrapInLayout(
          '<h1>404 - Page Not Found</h1><p>The page you are looking for does not exist.</p>',
          bunPressConfig,
          new URL(request.url).pathname,
        ),
        {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        },
      )
    },
  }

  const { server, url, stop } = await serve(serverConfig)

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
