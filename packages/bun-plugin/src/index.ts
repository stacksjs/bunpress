/**
 * bun-plugin-bunpress
 *
 * Serve bunpress-built documentation within any Bun.serve() application.
 * Handles path prefix mounting, automatic internal link rewriting,
 * content-type detection, and lazy page scanning with caching.
 *
 * @example
 * ```ts
 * import { createDocsHandler } from 'bun-plugin-bunpress'
 *
 * const docs = await createDocsHandler({
 *   buildDir: './dist/.bunpress',
 *   pathPrefix: '/docs',
 * })
 *
 * Bun.serve({
 *   fetch(req) {
 *     const url = new URL(req.url)
 *     if (url.pathname === '/docs' || url.pathname.startsWith('/docs/')) {
 *       return docs.fetch(req)
 *     }
 *     return new Response('Not found', { status: 404 })
 *   },
 * })
 * ```
 */
import { readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'

export interface DocsHandlerOptions {
  /**
   * Path to the bunpress build output directory (the .bunpress folder).
   * Can be absolute or relative to cwd.
   * @example './dist/.bunpress'
   */
  buildDir: string

  /**
   * URL path prefix under which docs are served.
   * Internal links will be rewritten to include this prefix.
   * @default '/docs'
   * @example '/docs' — serves docs at /docs, /docs/intro, etc.
   */
  pathPrefix?: string

  /**
   * Cache-Control header value for served files.
   * @default 'public, max-age=3600'
   */
  cacheControl?: string
}

export interface DocsHandler {
  /**
   * Handle an incoming request. Returns a Response if the request
   * matches a docs page, or null if no match was found.
   */
  fetch: (req: Request) => Promise<Response | null>
}

const CONTENT_TYPES: Record<string, string> = {
  html: 'text/html; charset=utf-8',
  css: 'text/css; charset=utf-8',
  js: 'application/javascript; charset=utf-8',
  json: 'application/json',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  ico: 'image/x-icon',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  eot: 'application/vnd.ms-fontobject',
  xml: 'application/xml',
  txt: 'text/plain',
}

/**
 * Scan the build directory for all HTML page paths.
 * Used to build the set of known doc pages for link rewriting.
 */
async function scanDocPages(dir: string): Promise<Set<string>> {
  const pages = new Set<string>(['/'])

  async function walk(currentDir: string, currentPrefix: string): Promise<void> {
    try {
      const entries = await readdir(currentDir, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.html') && entry.name !== '404.html') {
          const name = entry.name.replace('.html', '')
          pages.add(name === 'index' ? currentPrefix || '/' : `${currentPrefix}/${name}`)
        }
        else if (entry.isDirectory() && !entry.name.startsWith('.')) {
          await walk(join(currentDir, entry.name), `${currentPrefix}/${entry.name}`)
        }
      }
    }
    catch {
      // directory doesn't exist or can't be read
    }
  }

  await walk(dir, '')
  return pages
}

/**
 * Rewrite internal href links in HTML to include the docs path prefix.
 */
function rewriteLinks(html: string, knownPages: Set<string>, pathPrefix: string): string {
  return html.replace(/href="(\/[^"]*?)"/g, (match, href) => {
    if (knownPages.has(href)) {
      const rewritten = href === '/' ? pathPrefix : `${pathPrefix}${href}`
      return `href="${rewritten}"`
    }
    return match
  })
}

/**
 * Create a docs handler for serving bunpress-built documentation
 * within an existing Bun.serve() application.
 *
 * @example
 * ```ts
 * const docs = await createDocsHandler({
 *   buildDir: './dist/.bunpress',
 *   pathPrefix: '/docs',
 * })
 *
 * Bun.serve({
 *   fetch(req) {
 *     const url = new URL(req.url)
 *
 *     // Docs handler
 *     if (url.pathname === '/docs' || url.pathname.startsWith('/docs/')) {
 *       const res = await docs.fetch(req)
 *       if (res) return res
 *     }
 *
 *     // Your other routes...
 *     return new Response('Not found', { status: 404 })
 *   },
 * })
 * ```
 */
export async function createDocsHandler(options: DocsHandlerOptions): Promise<DocsHandler> {
  const buildDir = resolve(options.buildDir)
  const pathPrefix = (options.pathPrefix || '/docs').replace(/\/$/, '')
  const cacheControl = options.cacheControl || 'public, max-age=3600'

  // Lazily scanned and cached page set
  let pagesCache: Set<string> | null = null

  async function getPages(): Promise<Set<string>> {
    if (pagesCache) return pagesCache
    pagesCache = await scanDocPages(buildDir)
    return pagesCache
  }

  async function resolveFile(subPath: string): Promise<{ file: ReturnType<typeof Bun.file>, path: string } | null> {
    const candidates = [
      resolve(buildDir, `.${subPath}`),
      resolve(buildDir, `.${subPath}.html`),
      resolve(buildDir, `.${subPath}/index.html`),
    ]

    for (const candidate of candidates) {
      const file = Bun.file(candidate)
      if (await file.exists()) {
        return { file, path: candidate }
      }
    }
    return null
  }

  async function serveHtml(file: ReturnType<typeof Bun.file>): Promise<Response> {
    const pages = await getPages()
    const html = rewriteLinks(await file.text(), pages, pathPrefix)
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': cacheControl,
      },
    })
  }

  return {
    async fetch(req: Request): Promise<Response | null> {
      const url = new URL(req.url)
      const reqPath = url.pathname

      // Strip the path prefix to get the sub-path
      let subPath: string
      if (reqPath === pathPrefix || reqPath === `${pathPrefix}/`) {
        subPath = '/index.html'
      }
      else if (reqPath.startsWith(`${pathPrefix}/`)) {
        subPath = reqPath.slice(pathPrefix.length)
      }
      else {
        return null
      }

      const resolved = await resolveFile(subPath)

      if (resolved) {
        const ext = resolved.path.split('.').pop()?.toLowerCase() || ''

        if (ext === 'html') {
          return serveHtml(resolved.file)
        }

        return new Response(resolved.file, {
          headers: {
            'Content-Type': CONTENT_TYPES[ext] || 'application/octet-stream',
            'Cache-Control': cacheControl,
          },
        })
      }

      // Fallback: serve index page for unknown paths (SPA-style)
      const indexFile = Bun.file(resolve(buildDir, 'index.html'))
      if (await indexFile.exists()) {
        return serveHtml(indexFile)
      }

      return null
    },
  }
}
