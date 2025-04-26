import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { markdown } from '../src/plugin'

const testDir = './test-md'
const outDir = './test-out'
const mdFile = join(testDir, 'test.md')

async function runTest() {
  try {
    // Create test directories
    await mkdir(testDir, { recursive: true })
    await mkdir(outDir, { recursive: true })

    // Create a test markdown file
    await writeFile(
      mdFile,
      `# Test Markdown File

This is a simple test markdown file with **bold** and *italic* text.

## Code Example

\`\`\`ts
const hello = 'world'
console.log(hello)
\`\`\`
`,
    )

    console.error('Building markdown file...')

    // Build the markdown file
    const result = await Bun.build({
      entrypoints: [mdFile],
      outdir: outDir,
      plugins: [markdown({
        title: 'Test Markdown',
        meta: {
          description: 'A test markdown file',
        },
      })],
    })

    if (!result.success) {
      console.error('Build failed')
      for (const log of result.logs) {
        console.error(log)
      }
      process.exit(1)
    }

    console.error('Build successful!')
    console.error('Output files:')
    for (const output of result.outputs) {
      console.error(`- kind: ${output.kind}, path: ${output.path}, loader: ${output.loader}`)
    }

    console.error('\nListing output directory:')
    const files = await readdir(outDir)
    for (const file of files) {
      console.error(`- ${file}`)
    }
  }
  catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
  finally {
    // Clean up
    await rm(testDir, { recursive: true, force: true })
  }
}

runTest()
