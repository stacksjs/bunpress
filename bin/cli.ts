import { Glob } from 'bun'
import { mkdir, readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { CAC } from 'cac'
import { version } from '../package.json'
import { config } from '../src/config'
import { markdown } from '../src/plugin'

const cli: CAC = new CAC('bunpress')

interface CliOption {
  outdir?: string
  config?: string
  port?: number
  open?: boolean
  watch?: boolean
  verbose?: boolean
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
      plugins: [markdown()],
    })

    if (!result.success) {
      console.error('Build failed:')
      for (const log of result.logs) {
        console.error(log)
      }
      return false
    }

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

    return `<li><a href="docs/${htmlPath}">${displayName}</a></li>`
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
  .command('dev', 'Start development server')
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

    // Start dev server
    console.log(`Starting development server at http://localhost:${port}`)
    Bun.serve({
      port,
      async fetch(req) {
        const url = new URL(req.url)
        let path = url.pathname

        // Serve index.html for root
        if (path === '/')
          path = '/index.html'

        // Add .html extension if not present and not a file with extension
        if (!path.includes('.') && !path.endsWith('/'))
          path = `${path}.html`

        // Remove trailing slash and add .html
        if (path.endsWith('/'))
          path = `${path}index.html`

        const filePath = resolve(outdir, path.slice(1))
        const file = Bun.file(filePath)

        const exists = await file.exists()
        if (exists)
          return new Response(file)
        else
          return new Response('Not Found', { status: 404 })
      },
    })

    console.log(`Server running at http://localhost:${port}`)

    // Open in browser
    if (options.open) {
      const openUrl = `http://localhost:${port}`
      Bun.spawn(['open', openUrl])
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

    // Keep process alive
    await new Promise(() => {})
  })

cli.command('version', 'Show the version of the CLI').action(() => {
  console.log(version)
})

cli.help()
cli.version(version)
cli.parse()
