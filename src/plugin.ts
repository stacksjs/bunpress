import type { BunPlugin } from 'bun'
import type { MarkdownPluginConfig } from './types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { marked } from 'marked'
import { config } from './config'

/**
 * Plugin options for the Markdown plugin
 */
export type MarkdownPluginOptions = MarkdownPluginConfig

/**
 * Create a Bun plugin that transforms markdown files into HTML
 *
 * @example
 * ```ts
 * // build.ts
 * import { markdown } from './plugin'
 *
 * await Bun.build({
 *   entrypoints: ['docs/index.md', 'docs/getting-started.md'],
 *   outdir: './dist',
 *   plugins: [markdown()],
 * })
 * ```
 */
export function markdown(options: MarkdownPluginOptions = {}): BunPlugin {
  // Merge user options with defaults from config
  const defaultOptions = config.markdown || {}

  const {
    template,
    css = defaultOptions.css || '',
    scripts = defaultOptions.scripts || [],
    title: defaultTitle = defaultOptions.title,
    meta = { ...defaultOptions.meta, ...options.meta },
    markedOptions = defaultOptions.markedOptions || {},
    preserveDirectoryStructure = defaultOptions.preserveDirectoryStructure !== false,
  } = options

  // Set up marked options for parsing
  const renderer = new marked.Renderer()

  return {
    name: 'markdown-plugin',

    // Target .md files only
    setup(build) {
      build.onLoad({ filter: /\.md$/ }, async (args) => {
        // Read the markdown file
        const mdContent = await fs.promises.readFile(args.path, 'utf8')

        // Convert markdown to HTML
        const htmlContent = marked.parse(mdContent, {
          ...markedOptions,
          renderer,
        })

        // Extract title from the first h1 if not provided
        let title = defaultTitle
        if (!title) {
          const titleMatch = mdContent.match(/^# (.+)$/m)
          title = titleMatch ? titleMatch[1] : 'Untitled Document'
        }

        // Generate meta tags
        const metaTags = Object.entries(meta)
          .map(([name, content]) => `<meta name="${name}" content="${content}">`)
          .join('\n    ')

        // Generate script tags
        const scriptTags = scripts
          .map(src => `<script src="${src}"></script>`)
          .join('\n    ')

        let finalHtml: string

        if (template) {
          // Use custom template with {{content}} placeholder
          finalHtml = template.replace(/\{\{content\}\}/g, htmlContent as string)
        }
        else {
          // Default HTML template
          finalHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${metaTags}
    <title>${title}</title>
    <style>
${css}
    </style>
  </head>
  <body>
    <article class="markdown-body">
      ${htmlContent}
    </article>
    ${scriptTags}
  </body>
</html>`
        }

        // Get the file name and create the output path
        const outdir = build.config.outdir as string | undefined
        if (outdir) {
          // Maintain directory structure relative to the entrypoint
          const relativePath = path.relative(process.cwd(), args.path)
          const dirPath = path.dirname(relativePath)
          const baseName = path.basename(args.path, '.md')

          // Create path for the HTML file
          let htmlFilePath = path.join(outdir, `${baseName}.html`)

          // If the markdown file is in a subdirectory and preserveDirectoryStructure is true
          if (preserveDirectoryStructure && dirPath !== '.') {
            const targetDir = path.join(outdir, dirPath)
            // Ensure the target directory exists
            await fs.promises.mkdir(targetDir, { recursive: true })
            htmlFilePath = path.join(targetDir, `${baseName}.html`)
          }

          // Write the HTML file directly to outdir
          await fs.promises.writeFile(htmlFilePath, finalHtml)

          // Log that we wrote the file
          if (config.verbose) {
            // eslint-disable-next-line no-console
            console.log(`Markdown: Generated ${htmlFilePath}`)
          }
        }

        // Return empty contents to satisfy Bun's build system
        return {
          contents: `// Converted markdown file: ${args.path}`,
          loader: 'js',
        }
      })
    },
  }
}
