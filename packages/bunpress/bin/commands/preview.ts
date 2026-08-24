import { join } from 'node:path'
import { logError, logInfo, logSuccess } from '../utils'
import { config } from '../../src/config'
import type { BunPressConfig } from '../../src/types'
import { startServer } from '../../src/serve'

interface PreviewOptions {
  port?: number
  outdir?: string
  open?: boolean
  verbose?: boolean
}

/**
 * Preview the built documentation site
 * Serves files from the .bunpress folder inside the output directory
 */
export async function previewCommand(options: PreviewOptions = {}): Promise<void> {
  const port = options.port || 3000
  const bunPressConfig = (await config) as BunPressConfig
  const baseOutdir = options.outdir || bunPressConfig.outDir || './dist'
  // Preview from .bunpress folder inside the output directory
  const buildDir = join(baseOutdir, '.bunpress')
  const verbose = options.verbose || false

  try {
    // Check if build directory exists
    const { stat } = await import('node:fs/promises')
    try {
      const stats = await stat(buildDir)
      if (!stats.isDirectory()) {
        logError(`"${buildDir}" is not a directory.`)
        logError(`Run "bunpress build" first to generate the documentation.`)
        process.exit(1)
      }
    }
    catch {
      logError(`Build directory "${buildDir}" not found.`)
      logError(`Run "bunpress build" first to generate the documentation.`)
      process.exit(1)
    }

    logInfo(`Starting preview server from ${buildDir}`)

    // Serve static files from the build directory
    try {
      const server = Bun.serve({
        port,
        fetch: async (req: Request) => {
          const url = new URL(req.url)
          let pathname = url.pathname

          // Remove leading slash
          if (pathname.startsWith('/'))
            pathname = pathname.slice(1)

          // Default to index.html
          if (pathname === '' || pathname === '/')
            pathname = 'index.html'

          // A page builds to `<route>/index.html`, so a request for `/guide/intro`
          // only resolves once the directory-index form is tried. Without it the
          // preview server answered 404 for every page but the home page, which
          // read as a broken build rather than a broken server.
          const candidates = [
            pathname,
            `${pathname}.html`,
            join(pathname, 'index.html'),
          ]

          for (const candidate of candidates) {
            const file = Bun.file(join(buildDir, candidate))
            if (await file.exists()) {
              return new Response(file, {
                headers: { 'Content-Type': getContentType(candidate) },
              })
            }
          }

          // Serve the generated 404 page when there is one, so a wrong link looks
          // the way it will in production rather than like a server fault.
          const notFound = Bun.file(join(buildDir, '404.html'))
          if (await notFound.exists()) {
            return new Response(notFound, {
              status: 404,
              headers: { 'Content-Type': 'text/html' },
            })
          }

          return new Response('404 - Not Found', { status: 404 })
        },
      })

      logSuccess(`Preview server running at http://localhost:${port}`)
      console.log('Press Ctrl+C to stop\n')

      // Keep process alive
      await new Promise(() => {})
    }
    catch (serverError: any) {
      if (serverError.message?.includes('EADDRINUSE') || serverError.code === 'EADDRINUSE') {
        logError(`Port ${port} is already in use.`)
        logError(`Try running with a different port: bunpress preview --port <port>`)
        logError(`Or stop any processes using port ${port}`)
      }
      else {
        logError(`Failed to start server: ${serverError.message || serverError}`)
      }
      process.exit(1)
    }
  }
  catch (err) {
    logError(`Failed to start preview server: ${err}`)
    process.exit(1)
  }
}

/**
 * Get content type based on file extension
 */
function getContentType(pathname: string): string {
  const ext = pathname.split('.').pop()?.toLowerCase()

  const types: Record<string, string> = {
    html: 'text/html; charset=utf-8',
    css: 'text/css; charset=utf-8',
    js: 'application/javascript; charset=utf-8',
    mjs: 'application/javascript; charset=utf-8',
    json: 'application/json; charset=utf-8',
    map: 'application/json; charset=utf-8',
    // A sitemap or RSS feed served as text/plain is not read as a feed at all.
    xml: 'application/xml; charset=utf-8',
    txt: 'text/plain; charset=utf-8',
    webmanifest: 'application/manifest+json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    avif: 'image/avif',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    otf: 'font/otf',
    eot: 'application/vnd.ms-fontobject',
  }

  // An unknown type is a download, not text: guessing text/plain renders
  // binaries as mojibake in the browser.
  return types[ext || ''] || 'application/octet-stream'
}
