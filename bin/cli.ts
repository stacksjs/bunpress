import { Glob } from 'bun'
import { copyFile, mkdir, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { CLI } from '@stacksjs/clapp'
import { version } from '../package.json'
import { config } from '../src/config'
// import { markdown, stx } from '../src/plugin'

const cli: CLI = new CLI('bunpress')

interface CliOption {
  outdir?: string
  config?: string
  port?: number
  open?: boolean
  watch?: boolean
  verbose?: boolean
  dir?: string
}

const defaultOptions = {
  outdir: './dist',
  port: 3000,
  open: true,
  watch: true,
  verbose: config.verbose,
}

/**
 * Find all markdown files in the given directory
 */
export async function findMarkdownFiles(dir: string): Promise<string[]> {
  const mdGlob = new Glob('**/*.md')
  const markdownFiles: string[] = []

  for await (const file of mdGlob.scan(dir)) {
    markdownFiles.push(join(dir, file))
  }

  return markdownFiles
}

/**
 * Copy static assets from docs/public to the output directory
 */
async function copyStaticAssets(outdir: string, verbose: boolean = false): Promise<void> {
  const publicDir = './docs/public'

  try {
    // Check if public directory exists
    await readdir(publicDir)

    // Copy all files from public directory to output directory
    const publicGlob = new Glob('**/*')
    for await (const file of publicGlob.scan(publicDir)) {
      const sourcePath = join(publicDir, file)
      const targetPath = join(outdir, file)

      // Ensure target directory exists
      await mkdir(join(outdir, file.split('/').slice(0, -1).join('/')), { recursive: true })

      // Copy the file
      await copyFile(sourcePath, targetPath)
    }
  }
  catch {
    // Public directory doesn't exist, which is fine
    if (verbose) {
      console.log('No public directory found, skipping static assets copy')
    }
  }
}

/**
 * Build the documentation files
 */
export async function buildDocs(options: CliOption = {}): Promise<boolean> {
  const outdir = options.outdir || defaultOptions.outdir
  const verbose = options.verbose ?? defaultOptions.verbose

  // Ensure output directory exists
  await mkdir(outdir, { recursive: true })

  // Find all markdown files
  const docsDir = './docs'
  const markdownFiles = await findMarkdownFiles(docsDir)

  if (markdownFiles.length === 0) {
    console.log('No markdown files found in docs directory')
    return false
  }

  if (verbose) {
    console.log(`Found ${markdownFiles.length} markdown files:`)
    markdownFiles.forEach(file => console.log(`- ${file}`))
  }

  try {
    const result = await Bun.build({
      entrypoints: markdownFiles,
      outdir,
      // plugins: [markdown(), stx()],
    })

    if (!result.success) {
      console.error('Build failed:')
      for (const log of result.logs) {
        console.error(log)
      }
      return false
    }

    // Copy static assets from docs/public to output directory
    await copyStaticAssets(outdir, verbose)

    if (verbose) {
      console.log('Build successful!')
      console.log('Generated files:')
      for (const output of result.outputs) {
        console.log(`- ${output.path}`)
      }
    }

    // Create index.html for navigation
    await generateIndexHtml(outdir, markdownFiles)

    return true
  }
  catch (err) {
    console.error('Error during build:', err)
    return false
  }
}

/**
 * Generate an index.html file with links to all documentation pages
 */
async function generateIndexHtml(outdir: string, markdownFiles: string[]) {
  const linksList = markdownFiles.map((file) => {
    const relativePath = file.replace('./docs/', '')
    const htmlPath = relativePath.replace('.md', '.html')
    const name = relativePath.replace('.md', '').replace(/\.([^.]+)$/, '')
    // Capitalize first letter and replace dashes with spaces
    const displayName = name.charAt(0).toUpperCase()
      + name.slice(1).replace(/-/g, ' ')

    return `<li><a href="${htmlPath}">${displayName}</a></li>`
  }).join('\n      ')

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BunPress Documentation</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .markdown-body {
      padding: 1rem;
    }

    a {
      color: #1F1FE9;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    h1 {
      border-bottom: 1px solid #eaecef;
      padding-bottom: 0.3em;
    }

    ul {
      padding-left: 2rem;
    }

    li {
      margin-bottom: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="markdown-body">
    <h1>BunPress Documentation</h1>

    <p>Welcome to the BunPress documentation! BunPress is a modern documentation engine powered by Bun.</p>

    <h2>Documentation Pages</h2>

    <ul>
      ${linksList}
    </ul>

    <h2>About BunPress</h2>

    <p>BunPress is a documentation engine that converts Markdown files to HTML. It offers full customization of the generated HTML, including custom CSS, scripts, and templates.</p>

    <p>Visit the <a href="https://github.com/stacksjs/bunpress">GitHub repository</a> to learn more.</p>
  </div>
</body>
</html>`

  await Bun.write(join(outdir, 'index.html'), indexHtml)
}

cli
  .command('build', 'Build the documentation site')
  .option('--outdir <outdir>', 'Output directory', { default: defaultOptions.outdir })
  .option('--config <config>', 'Path to config file')
  .option('--verbose', 'Enable verbose logging', { default: defaultOptions.verbose })
  .action(async (options: CliOption) => {
    const success = await buildDocs(options)
    if (!success)
      process.exit(1)

    console.log('Documentation built successfully!')
  })

cli
  .command('dev', 'Build and serve documentation using Bun\'s HTML server')
  .option('--port <port>', 'Port to listen on', { default: defaultOptions.port })
  .option('--outdir <outdir>', 'Output directory', { default: defaultOptions.outdir })
  .option('--open', 'Open in browser', { default: defaultOptions.open })
  .option('--watch', 'Watch for changes', { default: defaultOptions.watch })
  .option('--verbose', 'Enable verbose logging', { default: defaultOptions.verbose })
  .action(async (options: CliOption) => {
    console.log('dev', options)
    const outdir = options.outdir || defaultOptions.outdir
    const port = options.port || defaultOptions.port
    const verbose = options.verbose ?? defaultOptions.verbose
    const watch = options.watch ?? defaultOptions.watch

    // Initial build
    console.log('Building documentation...')
    const success = await buildDocs({ ...options, verbose })
    if (!success) {
      console.error('Failed to build documentation')
      process.exit(1)
    }

    console.log(`Documentation built successfully in ${outdir}`)
    console.log(`Starting Bun's HTML server at http://localhost:${port}`)

    // Use our custom server implementation that provides both HTML formatting and static asset serving
    const server = Bun.serve({
      port,
      async fetch(req) {
        const url = new URL(req.url)
        const path = url.pathname

        // Try to serve static files first (images, css, js, etc.)
        const staticPath = `${outdir}${path}`
        try {
          const file = Bun.file(staticPath)
          if (await file.exists()) {
            return new Response(file)
          }
        }
        catch {
          // File doesn't exist, continue to HTML routing
        }

        // Also try serving from the docs subdirectory
        const docsStaticPath = `${outdir}/docs${path}`
        try {
          const docsFile = Bun.file(docsStaticPath)
          if (await docsFile.exists()) {
            return new Response(docsFile)
          }
        }
        catch {
          // File doesn't exist, continue to HTML routing
        }

        // Handle HTML files - try docs subdirectory first (where the formatted HTML is)
        let docsHtmlPath = `${outdir}/docs${path}`
        if (!docsHtmlPath.endsWith('.html')) {
          docsHtmlPath += '.html'
        }

        try {
          const docsHtmlFile = Bun.file(docsHtmlPath)
          if (await docsHtmlFile.exists()) {
            return new Response(docsHtmlFile, {
              headers: { 'Content-Type': 'text/html' },
            })
          }
        }
        catch {
          // HTML file doesn't exist
        }

        // Try direct path as fallback
        let htmlPath = `${outdir}${path}`
        if (!htmlPath.endsWith('.html')) {
          htmlPath += '.html'
        }

        try {
          const htmlFile = Bun.file(htmlPath)
          if (await htmlFile.exists()) {
            return new Response(htmlFile, {
              headers: { 'Content-Type': 'text/html' },
            })
          }
        }
        catch {
          // HTML file doesn't exist
        }

        // Fallback to docs/index.html
        const docsIndexPath = `${outdir}/docs/index.html`
        try {
          const docsIndexFile = Bun.file(docsIndexPath)
          if (await docsIndexFile.exists()) {
            return new Response(docsIndexFile, {
              headers: { 'Content-Type': 'text/html' },
            })
          }
        }
        catch {
          // Index file doesn't exist
        }

        // Final fallback to root index.html
        const indexPath = `${outdir}/index.html`
        try {
          const indexFile = Bun.file(indexPath)
          if (await indexFile.exists()) {
            return new Response(indexFile, {
              headers: { 'Content-Type': 'text/html' },
            })
          }
        }
        catch {
          // Index file doesn't exist
        }

        return new Response('Not Found', { status: 404 })
      },
    })

    console.log(`Server running at http://localhost:${server.port}`)

    // Open in browser if requested
    if (options.open) {
      const openUrl = `http://localhost:${port}`
      setTimeout(() => Bun.spawn(['open', openUrl]), 500)
    }

    // Watch for changes
    if (watch) {
      console.log('Watching for changes in docs directory...')

      // Watch for file changes using fs.watch
      const watchDir = async () => {
        try {
          const files = await readdir('./docs', { recursive: true })

          let timeout: Timer | null = null
          const rebuildDebounced = () => {
            if (timeout)
              clearTimeout(timeout)
            timeout = setTimeout(async () => {
              console.log('File changed, rebuilding...')
              await buildDocs({ ...options, verbose: false })
              console.log('Rebuild complete')
            }, 100) // Debounce 100ms
          }

          // Use file polling for simplicity
          setInterval(async () => {
            const newFiles = await readdir('./docs', { recursive: true })
            if (JSON.stringify(files) !== JSON.stringify(newFiles)) {
              files.length = 0
              files.push(...newFiles)
              rebuildDebounced()
            }
          }, 1000) // Check every second
        }
        catch (err) {
          console.error('Error watching files:', err)
        }
      }

      watchDir()
    }

    // Keep the server running
    await new Promise(() => {})
  })

cli.help()
cli.version(version)
cli.parse()
