import { Glob } from 'bun'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { dts } from 'bun-plugin-dtsx'
import { markdown } from './src/plugin'

await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: './dist',
  plugins: [dts()],
})

console.log('Library build successfully!')

// Example usage of the markdown plugin
async function buildMarkdownFiles() {
  // Ensure output directory exists
  await mkdir('./dist', { recursive: true })

  // Find all markdown files in the docs directory
  const mdGlob = new Glob('**/*.md')
  const markdownFiles: string[] = []

  for await (const file of mdGlob.scan('./docs')) {
    markdownFiles.push(join('docs', file))
  }

  if (markdownFiles.length === 0) {
    console.log('No markdown files found in docs directory')
    return
  }

  console.log(`Found ${markdownFiles.length} markdown files:`)
  markdownFiles.forEach(file => console.log(`- ${file}`))

  const result = await Bun.build({
    entrypoints: markdownFiles,
    outdir: './dist',
    plugins: [
      markdown({
        // You can customize the HTML output with these options
        title: 'BunPress Documentation',
        meta: {
          description: 'Modern documentation engine powered by Bun',
          author: 'BunPress Team',
        },
        css: `
          /* Additional custom styles */
          .markdown-body {
            padding: 2rem;
          }
          h1 {
            color: #1F1FE9;
          }
        `,
        // scripts: [
        //   '/js/highlight.js',
        // ],
      }),
    ],
  })

  if (!result.success) {
    console.log('Build failed:')
    for (const log of result.logs) {
      console.log(log)
    }
    process.exit(1)
  }

  // Log results
  console.log('Build successful!')
  console.log('Generated files:')
  for (const output of result.outputs) {
    console.log(`- ${output.path}`)
  }
  console.log('HTML files generated in dist/docs/')
}

// Run the example
buildMarkdownFiles().catch((err) => {
  console.log('Error:', err)
  process.exit(1)
})
