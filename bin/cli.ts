import { Glob } from 'bun'
import { copyFile, mkdir, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { CLI } from '@stacksjs/clapp'
import { version } from '../package.json'
import { config } from '../src/config'
import type { BunPressConfig } from '../src/types'
import { generateRobotsTxt } from '../src/robots'
import { generateSitemap } from '../src/sitemap'
import { serveCLI } from '../src/serve'
import { cleanCommand } from './commands/clean'
import { configInitCommand, configShowCommand, configValidateCommand } from './commands/config'
import { doctorCommand } from './commands/doctor'
import { initCommand } from './commands/init'
import { newCommand } from './commands/new'
import { previewCommand } from './commands/preview'
import { seoCheck } from './commands/seo'
import { statsCommand } from './commands/stats'
import { formatTime, logSuccess, Spinner } from './utils'
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
  full?: boolean
  output?: string
  minify?: boolean
  sourcemap?: boolean
  name?: string
  template?: string
  title?: string
  force?: boolean
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
 * Generate SEO files (sitemap, robots.txt, RSS feed)
 */
async function generateSeoFiles(docsDir: string, outdir: string, verbose: boolean): Promise<void> {
  try {
    const bunPressConfig = await config as BunPressConfig

    // Generate sitemap
    if (bunPressConfig.sitemap?.enabled !== false && bunPressConfig.sitemap?.baseUrl) {
      await generateSitemap(docsDir, outdir, bunPressConfig)
    }

    // Generate robots.txt
    if (bunPressConfig.robots?.enabled !== false) {
      await generateRobotsTxt(outdir, bunPressConfig)
    }

    // Note: RSS feed generation requires additional configuration
    // and would be added here when RssFeedConfig is added to BunPressConfig
  }
  catch (error) {
    if (verbose) {
      console.error('Error generating SEO files:', error)
    }
  }
}

/**
 * Build the documentation files
 */
export async function buildDocs(options: CliOption = {}): Promise<boolean> {
  const outdir = options.outdir || defaultOptions.outdir
  const verbose = options.verbose ?? defaultOptions.verbose
  const minify = options.minify ?? false
  const sourcemap = options.sourcemap ?? false

  const startTime = performance.now()
  const spinner = new Spinner('Building documentation...')

  if (!verbose) {
    spinner.start()
  }

  // Ensure output directory exists
  await mkdir(outdir, { recursive: true })

  // Find all markdown files
  const docsDir = './docs'
  const markdownFiles = await findMarkdownFiles(docsDir)

  if (markdownFiles.length === 0) {
    if (!verbose) {
      spinner.fail('No markdown files found in docs directory')
    }
    else {
      console.log('No markdown files found in docs directory')
    }
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
      minify,
      sourcemap: sourcemap ? 'external' : 'none',
      // plugins: [markdown(), stx()],
    })

    if (!result.success) {
      if (!verbose) {
        spinner.fail('Build failed')
      }
      console.error('Build failed:')
      for (const log of result.logs) {
        console.error(log)
      }
      return false
    }

    // Copy static assets from docs/public to output directory
    await copyStaticAssets(outdir, verbose)

    // Create index.html for navigation
    await generateIndexHtml(outdir, markdownFiles)

    // Generate sitemap, robots.txt, and RSS feed
    await generateSeoFiles(docsDir, outdir, verbose || false)

    const endTime = performance.now()
    const duration = endTime - startTime

    if (!verbose) {
      spinner.succeed(`Built ${markdownFiles.length} files in ${formatTime(duration)}`)
    }
    else {
      console.log('Build successful!')
      console.log('Generated files:')
      for (const output of result.outputs) {
        console.log(`- ${output.path}`)
      }
      logSuccess(`Build completed in ${formatTime(duration)}`)
    }

    return true
  }
  catch (err) {
    if (!verbose) {
      spinner.fail('Build failed')
    }
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
  .option('--minify', 'Minify output files', { default: false })
  .option('--sourcemap', 'Generate source maps', { default: false })
  .option('--watch', 'Watch for changes and rebuild', { default: false })
  .option('--verbose', 'Enable verbose logging', { default: defaultOptions.verbose })
  .action(async (options: CliOption) => {
    const success = await buildDocs(options)
    if (!success)
      process.exit(1)

    // Watch mode
    if (options.watch) {
      const { watch } = await import('node:fs')
      const docsDir = './docs'

      console.log('\nWatching for changes...')

      watch(docsDir, { recursive: true }, async (eventType, filename) => {
        if (filename && filename.endsWith('.md')) {
          console.log(`\nDetected change in ${filename}, rebuilding...`)
          await buildDocs(options)
        }
      })

      // Keep process alive
      await new Promise(() => {})
    }
  })

cli
  .command('dev', 'Build and serve documentation using BunPress server')
  .option('--port <port>', 'Port to listen on', { default: defaultOptions.port })
  .option('--dir <dir>', 'Documentation directory', { default: './docs' })
  .option('--watch', 'Watch for changes', { default: defaultOptions.watch })
  .option('--verbose', 'Enable verbose logging', { default: defaultOptions.verbose })
  .action(async (options: CliOption) => {
    const port = options.port || defaultOptions.port
    const root = options.dir || './docs'
    const watch = options.watch ?? defaultOptions.watch
    const verbose = options.verbose ?? defaultOptions.verbose

    if (verbose) {
      console.log('Starting BunPress dev server with options:', {
        port,
        root,
        watch,
        verbose,
      })
    }

    // Start the server using the serve.ts implementation
    await serveCLI({
      port,
      root,
      watch,
      config: config as any,
    })
  })

/**
 * Generate LLM-friendly markdown file from all documentation
 */
async function generateLlmMarkdown(options: CliOption = {}): Promise<boolean> {
  const docsDir = options.dir || './docs'
  const outputFile = options.output || './docs.md'
  const full = options.full ?? false
  const verbose = options.verbose ?? defaultOptions.verbose

  if (verbose) {
    console.log(`Generating LLM markdown from ${docsDir}`)
    console.log(`Output file: ${outputFile}`)
    console.log(`Full content: ${full}`)
  }

  // Find all markdown files
  const markdownFiles = await findMarkdownFiles(docsDir)

  if (markdownFiles.length === 0) {
    console.log('No markdown files found in docs directory')
    return false
  }

  if (verbose) {
    console.log(`Found ${markdownFiles.length} markdown files`)
  }

  // Sort files for consistent output
  markdownFiles.sort()

  let output = '# Documentation\n\n'
  output += `Generated: ${new Date().toISOString()}\n\n`
  output += `Total files: ${markdownFiles.length}\n\n`
  output += '---\n\n'

  // Process each markdown file
  for (const filePath of markdownFiles) {
    const relativePath = filePath.replace(`${docsDir}/`, '')
    const fileContent = await Bun.file(filePath).text()

    if (verbose) {
      console.log(`Processing: ${relativePath}`)
    }

    output += `## File: ${relativePath}\n\n`

    if (full) {
      // Include full content
      output += fileContent
      output += '\n\n'
    }
    else {
      // Extract metadata and structure (titles and headings only)
      const lines = fileContent.split('\n')
      let inFrontmatter = false
      let frontmatterContent = ''

      for (const line of lines) {
        // Handle frontmatter
        if (line.trim() === '---') {
          if (!inFrontmatter) {
            inFrontmatter = true
            continue
          }
          else {
            inFrontmatter = false
            if (frontmatterContent) {
              output += '**Frontmatter:**\n```yaml\n'
              output += frontmatterContent
              output += '```\n\n'
              frontmatterContent = ''
            }
            continue
          }
        }

        if (inFrontmatter) {
          frontmatterContent += `${line}\n`
          continue
        }

        // Include headings for structure
        if (line.match(/^#{1,6}\s+/)) {
          output += `${line}\n`
        }
      }

      output += '\n'
    }

    output += '---\n\n'
  }

  // Write output file
  await Bun.write(outputFile, output)

  console.log(`\nLLM markdown generated successfully: ${outputFile}`)
  console.log(`Total size: ${(output.length / 1024).toFixed(2)} KB`)

  return true
}

cli
  .command('llm', 'Generate LLM-friendly markdown file from documentation')
  .option('--dir <dir>', 'Documentation directory', { default: './docs' })
  .option('--output <output>', 'Output file path', { default: './docs.md' })
  .option('--full', 'Include full content (not just titles and headings)', { default: false })
  .option('--verbose', 'Enable verbose logging', { default: defaultOptions.verbose })
  .action(async (options: CliOption) => {
    const success = await generateLlmMarkdown(options)
    if (!success)
      process.exit(1)
  })

cli
  .command('init', 'Initialize a new BunPress project')
  .option('--name <name>', 'Project name')
  .option('--template <template>', 'Template to use')
  .option('--force', 'Overwrite existing files', { default: false })
  .action(async (options: CliOption) => {
    const success = await initCommand(options)
    if (!success)
      process.exit(1)
  })

cli
  .command('preview', 'Preview the production build')
  .option('--port <port>', 'Port to listen on', { default: defaultOptions.port })
  .option('--outdir <outdir>', 'Build directory', { default: defaultOptions.outdir })
  .option('--open', 'Open in browser', { default: false })
  .option('--verbose', 'Enable verbose logging', { default: defaultOptions.verbose })
  .action(async (options: CliOption) => {
    await previewCommand(options)
  })

cli
  .command('clean', 'Clean build artifacts')
  .option('--outdir <outdir>', 'Output directory to clean', { default: defaultOptions.outdir })
  .option('--force', 'Skip confirmation prompt', { default: false })
  .option('--verbose', 'Enable verbose logging', { default: defaultOptions.verbose })
  .action(async (options: CliOption) => {
    const success = await cleanCommand(options)
    if (!success)
      process.exit(1)
  })

cli
  .command('doctor', 'Run diagnostic checks on the project')
  .option('--verbose', 'Enable verbose logging', { default: defaultOptions.verbose })
  .action(async (options: CliOption) => {
    const success = await doctorCommand(options)
    if (!success)
      process.exit(1)
  })

cli
  .command('config:show', 'Show current configuration')
  .option('--verbose', 'Enable verbose logging', { default: defaultOptions.verbose })
  .action(async (options: CliOption) => {
    const success = await configShowCommand(options)
    if (!success)
      process.exit(1)
  })

cli
  .command('config:validate', 'Validate configuration file')
  .option('--verbose', 'Enable verbose logging', { default: defaultOptions.verbose })
  .action(async (options: CliOption) => {
    const success = await configValidateCommand(options)
    if (!success)
      process.exit(1)
  })

cli
  .command('config:init', 'Initialize configuration file')
  .action(async (options: CliOption) => {
    const success = await configInitCommand(options)
    if (!success)
      process.exit(1)
  })

cli
  .command('new <path>', 'Create a new markdown file')
  .option('--title <title>', 'Page title')
  .option('--template <template>', 'Template to use (default, guide, api, blog)', { default: 'default' })
  .option('--verbose', 'Enable verbose logging', { default: defaultOptions.verbose })
  .action(async (path: string, options: CliOption) => {
    const success = await newCommand(path, options)
    if (!success)
      process.exit(1)
  })

cli
  .command('stats', 'Show documentation statistics')
  .option('--dir <dir>', 'Documentation directory', { default: './docs' })
  .option('--verbose', 'Enable verbose logging', { default: defaultOptions.verbose })
  .action(async (options: CliOption) => {
    const success = await statsCommand(options)
    if (!success)
      process.exit(1)
  })

cli
  .command('seo:check', 'Check SEO for all documentation pages')
  .option('--dir <dir>', 'Documentation directory', { default: './docs' })
  .option('--fix', 'Automatically fix issues (add missing titles/descriptions)', { default: false })
  .action(async (options: CliOption) => {
    await seoCheck(options)
  })

cli.help()
cli.version(version)
cli.parse()
