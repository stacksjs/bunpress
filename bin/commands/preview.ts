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

        // Construct full path
        const filePath = join(buildDir, pathname)

        // Try to serve the file
        const file = Bun.file(filePath)
        const exists = await file.exists()

        if (exists) {
          return new Response(file, {
            headers: {
              'Content-Type': getContentType(pathname),
            },
          })
        }

        // Try adding .html if not found
        const htmlPath = `${filePath}.html`
        const htmlFile = Bun.file(htmlPath)
        const htmlExists = await htmlFile.exists()

        if (htmlExists) {
          return new Response(htmlFile, {
            headers: {
              'Content-Type': 'text/html',
            },
          })
        }

        // 404 response
        return new Response('404 - Not Found', { status: 404 })
      },
    })

    logSuccess(`Preview server running at http://localhost:${port}`)
    console.log('Press Ctrl+C to stop\n')

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
