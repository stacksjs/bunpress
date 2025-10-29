import { join } from 'node:path'
import { logError, logInfo, logSuccess } from '../utils'

interface PreviewOptions {
  port?: number
  outdir?: string
  open?: boolean
  verbose?: boolean
}

/**
 * Preview the production build
 */
export async function previewCommand(options: PreviewOptions = {}): Promise<void> {
  const port = options.port || 3000
  const outdir = options.outdir || './dist'
  const verbose = options.verbose || false

  try {
    // Check if dist directory exists
    const distExists = await Bun.file(outdir).exists()

    if (!distExists) {
      logError(`Build directory "${outdir}" not found. Run "bunpress build" first.`)
      process.exit(1)
    }

    if (verbose) {
      logInfo(`Starting preview server from ${outdir}`)
    }

    // Create server
    const server = Bun.serve({
      port,
      fetch: async (req) => {
        const url = new URL(req.url)
        let pathname = url.pathname

        // Redirect root to index.html
        if (pathname === '/') {
          pathname = '/index.html'
        }

        // Add .html extension if not present
        if (!pathname.includes('.') && !pathname.endsWith('/')) {
          pathname += '.html'
        }

        const filePath = join(outdir, pathname)

        try {
          const file = Bun.file(filePath)

          if (await file.exists()) {
            return new Response(file, {
              headers: {
                'Content-Type': getContentType(pathname),
              },
            })
          }

          // Try with /index.html
          const indexPath = join(outdir, pathname, 'index.html')
          const indexFile = Bun.file(indexPath)

          if (await indexFile.exists()) {
            return new Response(indexFile, {
              headers: {
                'Content-Type': 'text/html',
              },
            })
          }

          // 404
          return new Response('404 Not Found', { status: 404 })
        }
        catch (err) {
          return new Response(`Error: ${err}`, { status: 500 })
        }
      },
    })

    logSuccess(`Preview server running at http://localhost:${port}`)
    console.log()
    logInfo('Press Ctrl+C to stop')

    // Keep process alive
    await new Promise(() => {})
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
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    eot: 'application/vnd.ms-fontobject',
  }

  return types[ext || ''] || 'text/plain'
}
