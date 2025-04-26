import { mkdir } from 'node:fs/promises'
import process from 'node:process'
import { markdown } from './src/plugin'

// Example usage of the markdown plugin
async function buildMarkdownFiles() {
  // Ensure output directory exists
  await mkdir('./dist', { recursive: true })
  await mkdir('./test/fixtures', { recursive: true })

  const result = await Bun.build({
    entrypoints: [
      'docs/config.md',
    ],
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
    console.error('Build failed:')
    for (const log of result.logs) {
      console.error(log)
    }
    process.exit(1)
  }

  // Log results to stderr to avoid linter issues
  console.error('Build successful!')
  console.error('Generated files:')
  for (const output of result.outputs) {
    console.error(`- ${output.path}`)
  }
  console.error('HTML files in dist:')
  console.error('- dist/docs/config.html')
}

// Run the example
buildMarkdownFiles().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
