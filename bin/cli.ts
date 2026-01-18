#!/usr/bin/env bun
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
    // Use the same markdown-to-HTML transformation as the dev server
    const { markdownToHtml, wrapInLayout } = await import('../src/serve')
    const { mkdir: mkdirAsync, writeFile: writeFileAsync } = await import('node:fs/promises')

    if (verbose) {
      console.log('Transforming markdown to HTML...')
    }

    // Process each markdown file
    for (const file of markdownFiles) {
      const markdown = await Bun.file(file).text()

      // Convert markdown to HTML (handles frontmatter, hero, features, etc.)
      const { html, frontmatter } = await markdownToHtml(markdown, docsDir)

      // Determine current path for navigation
      const relativePath = file.replace(docsDir, '').replace(/^\//, '').replace(/\.md$/, '')
      const currentPath = `/${relativePath}`

      // Check if this is a home page
      const isHome = frontmatter.layout === 'home'

      // Wrap in layout (handles navbar, sidebar, SEO, etc.)
      const fullHtml = await wrapInLayout(html, bunPressConfig, currentPath, isHome)

      // Determine output path
      const outputPath = join(outdir, relativePath + '.html')

      // Ensure output directory exists
      const outputDir = outputPath.substring(0, outputPath.lastIndexOf('/'))
      if (outputDir) {
        await mkdirAsync(outputDir, { recursive: true })
      }

      // Write HTML file
      await writeFileAsync(outputPath, fullHtml)

      if (verbose) {
        console.log(`Generated: ${outputPath}`)
      }
    }

    if (verbose) {
      console.log(`Processed ${markdownFiles.length} markdown files.`)
    }

    // Copy static assets from docs/public to output directory
    await copyStaticAssets(outdir, docsDir, verbose)

    // Copy docs/index.html to root as index.html (hero page)
    await copyHeroToRoot(outdir)

    // Generate 404 page
    await generate404Page(outdir, bunPressConfig)

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
 * Generate a styled 404 page for the documentation site
 * Styled to match VitePress's NotFound component
 */
async function generate404Page(outdir: string, bunPressConfig: BunPressConfig): Promise<void> {
  const { wrapInLayout } = await import('../src/serve')

  const notFoundContent = `
<style>
.NotFound {
  padding: 64px 24px 96px;
  text-align: center;
}

@media (min-width: 768px) {
  .NotFound {
    padding: 96px 32px 168px;
  }
}

.NotFound .code {
  line-height: 64px;
  font-size: 64px;
  font-weight: 600;
}

.NotFound .title {
  padding-top: 12px;
  letter-spacing: 2px;
  line-height: 20px;
  font-size: 20px;
  font-weight: 700;
}

.NotFound .divider {
  margin: 24px auto 18px;
  width: 64px;
  height: 1px;
  background-color: var(--vp-c-divider);
}

.NotFound .quote {
  margin: 0 auto;
  max-width: 256px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.NotFound .action {
  padding-top: 20px;
}

.NotFound .link {
  display: inline-block;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 16px;
  padding: 3px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  transition: border-color 0.25s, color 0.25s;
  text-decoration: none;
}

.NotFound .link:hover {
  border-color: var(--vp-c-brand-2);
  color: var(--vp-c-brand-2);
}
</style>

<div class="NotFound">
  <p class="code">404</p>
  <h1 class="title">PAGE NOT FOUND</h1>
  <div class="divider"></div>
  <blockquote class="quote">
    But if you don't change your direction, and if you keep looking, you may end up where you are heading.
  </blockquote>
  <div class="action">
    <a class="link" href="/docs/" aria-label="go to home">
      Take me home
    </a>
  </div>
</div>
`

  const fullHtml = await wrapInLayout(notFoundContent, bunPressConfig, '/404', false)

  // Write 404.html to the output directory root
  await Bun.write(join(outdir, '404.html'), fullHtml)
}

/**
 * Copy the hero page (docs/index.html) to the root as index.html
 * and fix internal links to point to /docs/ directory
 */
async function copyHeroToRoot(outdir: string) {
  const heroPath = join(outdir, 'docs', 'index.html')
  const rootIndexPath = join(outdir, 'index.html')

  try {
    let heroContent = await Bun.file(heroPath).text()

    // Fix internal documentation links to point to /docs/ directory
    // Match href="/<path>" where path doesn't start with http/https
    heroContent = heroContent.replace(
      /href="\/(?!docs\/|http|https)([^"]+)"/g,
      'href="/docs/$1"'
    )

    await Bun.write(rootIndexPath, heroContent)
  }
  catch (err) {
    console.error('Error copying hero page to root:', err)
    // If hero page doesn't exist, create a simple redirect
    const redirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=/docs/">
  <title>Redirecting...</title>
</head>
<body>
  <p>Redirecting to <a href="/docs/">documentation</a>...</p>
</body>
</html>`
    await Bun.write(rootIndexPath, redirectHtml)
  }
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
