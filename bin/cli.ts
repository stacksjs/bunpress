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
  outdir: config.outDir || './dist',
  docsdir: config.docsDir || './docs',
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
async function copyStaticAssets(outdir: string, docsDir: string, verbose: boolean = false): Promise<void> {
  const publicDir = `${docsDir}/public`

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
  const bunPressConfig = await config as BunPressConfig
  const baseOutdir = options.outdir || bunPressConfig.outDir || defaultOptions.outdir
  // Build to .bunpress folder inside the output directory
  const outdir = join(baseOutdir, '.bunpress')
  const docsDir = options.dir || bunPressConfig.docsDir || defaultOptions.docsdir
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
    // Direct markdown-to-HTML transformation (no plugins needed!)
    const { marked } = await import('marked')
    const { mkdir: mkdirAsync, writeFile: writeFileAsync } = await import('node:fs/promises')

    if (verbose) {
      console.log('Transforming markdown to HTML...')
    }

    // Generate navigation HTML from config
    const generateNavHtml = (nav: any[] = []) => {
      if (!nav || nav.length === 0) return ''
      return `
        <nav class="navbar">
          <div class="nav-brand">
            <a href="/">BunPress</a>
          </div>
          <ul class="nav-links">
            ${nav.map(item => `
              <li><a href="${item.link}">${item.text}</a></li>
            `).join('')}
          </ul>
        </nav>
      `
    }

    // Generate sidebar HTML from config
    const generateSidebarHtml = (sidebar: any = {}) => {
      const sidebarItems = sidebar['/'] || []
      if (!sidebarItems || sidebarItems.length === 0) return ''

      return `
        <aside class="sidebar">
          ${sidebarItems.map((section: any) => `
            <div class="sidebar-section">
              <h3 class="sidebar-heading">${section.text}</h3>
              <ul class="sidebar-items">
                ${section.items?.map((item: any) => `
                  <li><a href="${item.link}">${item.text}</a></li>
                `).join('') || ''}
              </ul>
            </div>
          `).join('')}
        </aside>
      `
    }

    const navHtml = generateNavHtml(bunPressConfig.nav)
    const sidebarHtml = generateSidebarHtml(bunPressConfig.markdown?.sidebar)

    // Get custom CSS from config
    const customCss = bunPressConfig.markdown?.css || ''

    // Process each markdown file
    for (const file of markdownFiles) {
      const content = await Bun.file(file).text()

      // Parse markdown to HTML
      const htmlContent = await marked.parse(content)

      // Get Fathom analytics script if enabled
      const fathomScript = bunPressConfig.fathom?.enabled
        ? `<script src="https://cdn.usefathom.com/script.js" data-site="${bunPressConfig.fathom.siteId}" ${bunPressConfig.fathom.honorDNT ? 'data-honor-dnt="true"' : ''} ${bunPressConfig.fathom.auto ? 'data-auto="true"' : ''} ${bunPressConfig.fathom.spa ? 'data-spa="auto"' : ''} defer></script>`
        : ''

      // Comprehensive HTML template with navigation and sidebar
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${bunPressConfig.markdown?.title || 'BunPress Documentation'}</title>
  <meta name="description" content="${bunPressConfig.markdown?.meta?.description || 'Documentation built with BunPress'}">
  <meta name="generator" content="${bunPressConfig.markdown?.meta?.generator || 'BunPress'}">
  ${fathomScript}
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #213547;
      background: #ffffff;
    }

    /* Navbar */
    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1.5rem;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
    }

    .nav-brand a {
      font-size: 1.25rem;
      font-weight: 600;
      color: #3451b2;
      text-decoration: none;
    }

    .nav-links {
      display: flex;
      list-style: none;
      gap: 2rem;
    }

    .nav-links a {
      color: #213547;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }

    .nav-links a:hover {
      color: #3451b2;
    }

    /* Layout */
    .layout {
      display: flex;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Sidebar */
    .sidebar {
      width: 280px;
      padding: 2rem 1.5rem;
      background: #f8fafc;
      border-right: 1px solid #e2e8f0;
      height: calc(100vh - 60px);
      overflow-y: auto;
      position: sticky;
      top: 60px;
    }

    .sidebar-section {
      margin-bottom: 2rem;
    }

    .sidebar-heading {
      font-size: 0.875rem;
      font-weight: 600;
      color: #213547;
      margin-bottom: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .sidebar-items {
      list-style: none;
    }

    .sidebar-items li {
      margin-bottom: 0.5rem;
    }

    .sidebar-items a {
      color: #64748b;
      text-decoration: none;
      font-size: 0.9375rem;
      transition: color 0.2s;
      display: block;
      padding: 0.25rem 0;
    }

    .sidebar-items a:hover {
      color: #3451b2;
    }

    /* Content */
    .content {
      flex: 1;
      padding: 3rem;
      max-width: 900px;
    }

    /* Typography */
    .content h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .content h2 {
      font-size: 1.875rem;
      font-weight: 600;
      margin-top: 2.5rem;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .content h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-top: 2rem;
      margin-bottom: 0.75rem;
    }

    .content h4 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .content p {
      margin-bottom: 1rem;
      line-height: 1.75;
    }

    .content a {
      color: #3451b2;
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: border-color 0.2s;
    }

    .content a:hover {
      border-bottom-color: #3451b2;
    }

    .content ul, .content ol {
      margin-bottom: 1rem;
      padding-left: 2rem;
    }

    .content li {
      margin-bottom: 0.5rem;
    }

    .content blockquote {
      margin: 1rem 0;
      padding: 0.5rem 1rem;
      border-left: 4px solid #3451b2;
      background: #f8fafc;
      font-style: italic;
    }

    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
    }

    .content th,
    .content td {
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      text-align: left;
    }

    .content th {
      background: #f8fafc;
      font-weight: 600;
    }

    .content img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 1rem 0;
    }

    /* Code */
    .content pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 1.25rem;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1rem 0;
      font-size: 0.875rem;
      line-height: 1.7;
    }

    .content code {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.875em;
    }

    .content pre code {
      background: none;
      padding: 0;
      color: inherit;
    }

    .content :not(pre) > code {
      background: #f1f5f9;
      color: #e11d48;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-size: 0.875em;
    }

    /* Custom CSS from config */
    ${customCss}

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        display: none;
      }

      .content {
        padding: 1.5rem;
      }

      .navbar {
        flex-direction: column;
        gap: 1rem;
      }

      .nav-links {
        gap: 1rem;
      }
    }
  </style>
</head>
<body>
  ${navHtml}
  <div class="layout">
    ${sidebarHtml}
    <main class="content">
      ${htmlContent}
    </main>
  </div>
</body>
</html>`

      // Determine output path
      const relativePath = file.replace(docsDir, '').replace(/^\//, '')
      const outputPath = join(outdir, relativePath.replace('.md', '.html'))

      // Ensure output directory exists
      const outputDir = outputPath.substring(0, outputPath.lastIndexOf('/'))
      await mkdirAsync(outputDir, { recursive: true })

      // Write HTML file
      await writeFileAsync(outputPath, html)

      if (verbose) {
        console.log(`Generated: ${outputPath}`)
      }
    }

    if (verbose) {
      console.log(`Processed ${markdownFiles.length} markdown files.`)
    }

    // Copy static assets from docs/public to output directory
    await copyStaticAssets(outdir, docsDir, verbose)

    // Create index.html for navigation
    await generateIndexHtml(outdir, markdownFiles, docsDir)

    // Generate sitemap, robots.txt, and RSS feed
    await generateSeoFiles(docsDir, outdir, verbose || false)

    const endTime = performance.now()
    const duration = endTime - startTime

    if (!verbose) {
      spinner.succeed(`Built ${markdownFiles.length} pages to HTML in ${formatTime(duration)}`)
    }
    else {
      logSuccess(`Build completed in ${formatTime(duration)}`)
      console.log(`\nGenerated ${markdownFiles.length} HTML files in ${outdir}`)
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
async function generateIndexHtml(outdir: string, markdownFiles: string[], docsDir: string) {
  const linksList = markdownFiles.map((file) => {
    const relativePath = file.replace(`${docsDir}/`, '')
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
  .option('--outdir <outdir>', 'Output directory')
  .option('--dir <dir>', 'Documentation directory')
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
      const bunPressConfig = await config as BunPressConfig
      const docsDir = options.dir || bunPressConfig.docsDir || './docs'

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
  .option('--dir <dir>', 'Documentation directory')
  .option('--watch', 'Watch for changes', { default: defaultOptions.watch })
  .option('--verbose', 'Enable verbose logging', { default: defaultOptions.verbose })
  .action(async (options: CliOption) => {
    const bunPressConfig = await config as BunPressConfig
    const port = options.port || defaultOptions.port
    const root = options.dir || bunPressConfig.docsDir || defaultOptions.docsdir
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
      config: bunPressConfig as any,
    })
  })

/**
 * Generate LLM-friendly markdown file from all documentation
 */
async function generateLlmMarkdown(options: CliOption = {}): Promise<boolean> {
  const bunPressConfig = await config as BunPressConfig
  const docsDir = options.dir || bunPressConfig.docsDir || defaultOptions.docsdir
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
  .command('preview', 'Preview the built documentation site')
  .option('--port <port>', 'Port to listen on', { default: defaultOptions.port })
  .option('--outdir <outdir>', 'Output directory (looks for .bunpress folder inside)')
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
