#!/usr/bin/env bun
import { Glob } from 'bun'
import { copyFile, mkdir, readdir, rename, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { CLI } from '@stacksjs/clapp'
import { version } from '../package.json'
import { applyConfigPlugins, config } from '../src/config'
import type { BunPressConfig } from '../src/types'
import { generateRobotsTxt } from '../src/robots'
import { generateRssFeed } from '../src/rss'
import { buildSearchIndex, SEARCH_INDEX_PATH } from '../src/search-index'
import { generateSitemap } from '../src/sitemap'
import { verifyBuildManifest, writeBuildManifest } from '../src/build-manifest'
import { cleanCommand } from './commands/clean'
import { configInitCommand, configShowCommand, configValidateCommand } from './commands/config'
import { doctorCommand } from './commands/doctor'
import { initCommand } from './commands/init'
import { newCommand } from './commands/new'
import { previewCommand } from './commands/preview'
import { seoCheck } from './commands/seo'
import { statsCommand } from './commands/stats'
// Lazy-loaded to avoid failing when @stacksjs/ts-cloud is not available
// import { deployCommand } from './commands/deploy'
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
  manifest?: string
  checkManifest?: string
  name?: string
  template?: string
  title?: string
  force?: boolean
  searchIndex?: boolean
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

interface RenderTarget {
  /** Markdown file to render. */
  sourceFile: string
  /** Path within the locale, without extension or locale prefix. */
  relativePath: string
  /** Locale this page is rendered for. */
  locale: string
}

/**
 * Expand the markdown files into one render target per (locale, page).
 *
 * Locale-specific sources are folded into the page they translate rather than
 * being emitted as pages of their own: without this, `docs/es/guide.md` would
 * also render at `/es/es/guide` under the default locale, and `guide.es.md`
 * would render at the nonsense URL `/guide.es`.
 */
function buildRenderTargets(markdownFiles: string[], docsDir: string, i18n: any): RenderTarget[] {
  const normalizedDocsDir = docsDir.replace(/^\.\//, '')
  const toRelative = (file: string): string => file
    .replace(/^\.\//, '')
    .replace(normalizedDocsDir, '')
    .replace(/^\//, '')
    .replace(/\.md$/, '')

  if (!i18n.enabled) {
    return markdownFiles.map(file => ({ sourceFile: file, relativePath: toRelative(file), locale: i18n.defaultLocale }))
  }

  const locales: string[] = i18n.locales
  const localeSet = new Set(locales)

  // Index every source by the (locale, page) it provides.
  const byLocale = new Map<string, Map<string, string>>()
  for (const locale of locales) byLocale.set(locale, new Map())

  const canonicalPages = new Set<string>()

  for (const file of markdownFiles) {
    const relative = toRelative(file)
    const segments = relative.split('/')

    // `<locale>/rest` — a directory per locale.
    if (segments.length > 1 && localeSet.has(segments[0]) && segments[0] !== i18n.defaultLocale) {
      const page = segments.slice(1).join('/')
      byLocale.get(segments[0])!.set(page, file)
      canonicalPages.add(page)
      continue
    }

    // `page.<locale>` — a suffix per file.
    const suffix = relative.match(/^(.*)\.([A-Za-z-]+)$/)
    if (suffix && localeSet.has(suffix[2])) {
      byLocale.get(suffix[2])!.set(suffix[1], file)
      canonicalPages.add(suffix[1])
      continue
    }

    byLocale.get(i18n.defaultLocale)!.set(relative, file)
    canonicalPages.add(relative)
  }

  const targets: RenderTarget[] = []
  for (const locale of locales) {
    for (const page of canonicalPages) {
      // An untranslated page renders from the default locale's source, so a
      // reader browsing in Spanish never hits a 404 mid-site.
      const sourceFile = byLocale.get(locale)!.get(page) ?? byLocale.get(i18n.defaultLocale)!.get(page)
      if (!sourceFile)
        continue
      targets.push({ sourceFile, relativePath: page, locale })
    }
  }

  return targets
}

/**
 * Write the client search index next to the built pages.
 */
async function generateSearchIndex(docsDir: string, outdir: string, bunPressConfig: BunPressConfig, verbose: boolean): Promise<void> {
  if ((bunPressConfig.search ?? bunPressConfig.markdown?.search)?.enabled === false)
    return

  try {
    const index = await buildSearchIndex(docsDir, bunPressConfig)
    await Bun.write(join(outdir, SEARCH_INDEX_PATH.replace(/^\//, '')), JSON.stringify(index))

    if (verbose)
      console.log(`Indexed ${index.length} sections for search.`)
  }
  catch (error) {
    // A missing index degrades search to "no results", never a broken build.
    if (verbose)
      console.error('Error generating search index:', error)
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

    // Generate RSS feed
    if (bunPressConfig.rss?.enabled) {
      await generateRssFeed(docsDir, outdir, bunPressConfig, bunPressConfig.rss)
    }
  }
  catch (error) {
    if (verbose) {
      console.error('Error generating SEO files:', error)
    }
  }
}

/**
 * Resolve the effective config for a command.
 *
 * Without `--config`, this is the config bunfig discovered relative to the
 * working directory at import time. With `--config <path>`, that file's default
 * export is layered on top.
 *
 * The flag was previously declared on `build` but never read, so a config
 * passed that way was silently ignored and the site rendered with defaults —
 * no theme, no nav, no analytics — while reporting success.
 */
export async function resolveConfig(options: CliOption = {}): Promise<BunPressConfig> {
  const discovered = await config as BunPressConfig
  if (!options.config)
    return discovered

  const path = resolve(process.cwd(), options.config)
  if (!existsSync(path))
    throw new Error(`Config file not found: ${path}`)

  const loaded = await import(path)
  const override = (loaded.default ?? loaded) as BunPressConfig
  // A config supplied with --config declares its own plugins, so they have to
  // run against the merged result rather than only the discovered config.
  return applyConfigPlugins({ ...discovered, ...override })
}

/**
 * Build the documentation files
 */
export async function buildDocs(options: CliOption = {}): Promise<boolean> {
  if (options.manifest && options.checkManifest)
    throw new Error('--manifest and --check-manifest are mutually exclusive')

  const bunPressConfig = await resolveConfig(options)
  const baseOutdir = options.outdir || bunPressConfig.outDir || defaultOptions.outdir
  // Build a complete replacement tree. A failed build leaves the last good
  // output intact and a removed source page cannot survive as a stale file.
  const finalOutdir = join(baseOutdir, '.bunpress')
  const outdir = `${finalOutdir}.tmp-${process.pid}`
  const docsDir = options.dir || bunPressConfig.docsDir || defaultOptions.docsdir
  const verbose = options.verbose ?? defaultOptions.verbose
  const minify = options.minify ?? false
  const sourcemap = options.sourcemap ?? false

  const startTime = performance.now()
  const spinner = new Spinner('Building documentation...')

  if (!verbose) {
    spinner.start()
  }

  await rm(outdir, { recursive: true, force: true })
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
    const { loadI18nTranslations, resolveI18nConfig } = await import('../src/i18n')
    const { mkdir: mkdirAsync, writeFile: writeFileAsync } = await import('node:fs/promises')

    const i18n = await loadI18nTranslations(resolveI18nConfig(bunPressConfig), bunPressConfig)

    if (verbose) {
      console.log('Transforming markdown to HTML...')
    }

    // The set of pages to emit. Without i18n this is one entry per markdown
    // file; with it, one per (locale, page) pair — including pages a locale has
    // not translated, which fall back to the default locale's source so every
    // locale is browsable end to end.
    const renderTargets = buildRenderTargets(markdownFiles, docsDir, i18n)

    for (const target of renderTargets) {
      const markdown = await Bun.file(target.sourceFile).text()

      // Convert markdown to HTML (handles frontmatter, hero, features, etc.)
      const { html, frontmatter } = await markdownToHtml(markdown, docsDir)

      const relativePath = target.relativePath
      const currentPath = `/${relativePath}`

      // Determine layout type
      const layout = frontmatter.layout || 'doc'

      // Wrap in layout (handles navbar, sidebar, SEO, etc.)
      const fullHtml = await wrapInLayout(html, bunPressConfig, currentPath, layout, frontmatter, i18n, target.locale)

      // Determine output path. Emit directory-style (`<path>/index.html`) so the
      // clean, extensionless URLs bunpress links to (`/guide/install`) resolve on
      // directory-rewriting hosts and static servers alike. The homepage and any
      // page already named `index` stay flat.
      const isIndex = relativePath === 'index' || relativePath.endsWith('/index')
      // Non-default locales live under their own prefix, matching the URLs the
      // dev server serves and the switcher links to.
      const outputBase = target.locale && target.locale !== i18n.defaultLocale && i18n.enabled
        ? join(outdir, target.locale)
        : outdir
      const outputPath = isIndex
        ? join(outputBase, `${relativePath}.html`)
        : join(outputBase, relativePath, 'index.html')

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
      console.log(`Processed ${markdownFiles.length} markdown files into ${renderTargets.length} pages.`)
    }

    // Copy static assets from docs/public to output directory
    await copyStaticAssets(outdir, docsDir, verbose)

    // Copy docs/index.html to root as index.html (hero page)
    await copyHeroToRoot(outdir)

    // Generate 404 page
    await generate404Page(outdir, bunPressConfig)

    // Search index consumed by the nav search dialog. The dev server builds
    // this on demand at the same path; here it becomes a static file.
    if (options.searchIndex !== false)
      await generateSearchIndex(docsDir, outdir, bunPressConfig, verbose || false)

    // Generate sitemap, robots.txt, and RSS feed
    await generateSeoFiles(docsDir, outdir, verbose || false)

    if (options.checkManifest)
      await verifyBuildManifest(outdir, options.checkManifest, version)

    await rm(finalOutdir, { recursive: true, force: true })
    await rename(outdir, finalOutdir)

    if (options.manifest)
      await writeBuildManifest(finalOutdir, options.manifest, version)

    const endTime = performance.now()
    const duration = endTime - startTime

    if (!verbose) {
      spinner.succeed(`Built ${markdownFiles.length} pages to HTML in ${formatTime(duration)}`)
    }
    else {
      logSuccess(`Build completed in ${formatTime(duration)}`)
      console.log(`\nGenerated ${markdownFiles.length} HTML files in ${finalOutdir}`)
    }

    return true
  }
  catch (err) {
    await rm(outdir, { recursive: true, force: true })
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

  const fullHtml = await wrapInLayout(notFoundContent, bunPressConfig, '/404', 'doc')

  // Write 404.html to the output directory root
  await Bun.write(join(outdir, '404.html'), fullHtml)
}

/**
 * Copy the hero page (docs/index.html) to the root as index.html
 * and fix internal links to point to /docs/ directory
 */
async function copyHeroToRoot(outdir: string) {
  // With the new flat file structure, index.html is already generated at the root
  // No copying needed - just verify it exists
  const rootIndexPath = join(outdir, 'index.html')

  try {
    const exists = await Bun.file(rootIndexPath).exists()
    if (!exists) {
      // If no index.html exists, something went wrong with the build
      console.error('Warning: No index.html found at root')
    }
  }
  catch (err) {
    console.error('Error checking root index.html:', err)
  }
}

cli
  .command('build', 'Build the documentation site')
  .option('--outdir <outdir>', 'Output directory')
  .option('--dir <dir>', 'Documentation directory')
  .option('--config <config>', 'Path to config file')
  .option('--minify', 'Minify output files', { default: false })
  .option('--sourcemap', 'Generate source maps', { default: false })
  .option('--manifest <path>', 'Write a deterministic rendered-tree manifest')
  .option('--check-manifest <path>', 'Fail unless the rendered tree matches a checked manifest')
  .option('--search-index', 'Write the client search index (on by default; --no-search-index skips it)', { default: true })
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

    // Start the server using the serve.ts implementation. Keep this lazy so
    // build-only CLI startup does not load dev-server dependencies.
    const { serveCLI } = await import('../src/serve')
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

cli
  .command('deploy', 'Deploy documentation to AWS using CloudFormation (S3 + CloudFront + Route53)')
  .option('--region <region>', 'AWS region for S3 bucket', { default: 'us-east-1' })
  .option('--bucket <bucket>', 'S3 bucket name (auto-generated if not provided)')
  .option('--domain <domain>', 'Custom domain (e.g., docs.example.com)')
  .option('--subdomain <subdomain>', 'Subdomain (used with --base-domain)')
  .option('--base-domain <baseDomain>', 'Base domain (e.g., example.com) - must have Route53 hosted zone')
  .option('--stack-name <stackName>', 'CloudFormation stack name')
  .option('--hosted-zone-id <hostedZoneId>', 'Route53 hosted zone ID (auto-detected from domain)')
  .option('--certificate-arn <certificateArn>', 'ACM certificate ARN (auto-created if not provided)')
  .option('--dry-run', 'Show configuration without deploying', { default: false })
  .option('--verbose', 'Enable verbose logging', { default: defaultOptions.verbose })
  .action(async (options: CliOption & {
    baseDomain?: string
    stackName?: string
    hostedZoneId?: string
    certificateArn?: string
    dryRun?: boolean
  }) => {
    const { deployCommand } = await import('./commands/deploy')
    const success = await deployCommand(options)
    if (!success)
      process.exit(1)
  })

cli.help()
cli.version(version)

const argvEntrypoint = Bun.argv[1] || ''
const isCliEntrypoint = argvEntrypoint.endsWith('/bunpress') || argvEntrypoint.endsWith('/cli.ts') || argvEntrypoint.endsWith('/cli.js')

if (isCliEntrypoint) {
  cli.parse()
}
