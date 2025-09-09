import { file } from 'bun'
import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { markdown, disposeHighlighter } from '../src/plugin'

describe('Markdown Plugin', () => {
  const testDir = join(import.meta.dir, 'fixtures')
  const outDir = join(import.meta.dir, 'out')

  // Setup test files
  beforeAll(async () => {
    await mkdir(testDir, { recursive: true })
    await mkdir(outDir, { recursive: true })

    // Create a test markdown file
    await writeFile(
      join(testDir, 'test.md'),
      `# Test Markdown

This is a test markdown file with **bold** and *italic* text.

## Code Example

\`\`\`ts
const hello = 'world'
console.log(hello)
\`\`\`
`,
    )
  })

  // Clean up test files and highlighter
  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true })
    await rm(outDir, { recursive: true, force: true })
    disposeHighlighter() // Clean up singleton highlighter
  })

  test('should build markdown file to html', async () => {
    const result = await Bun.build({
      entrypoints: [join(testDir, 'test.md')],
      outdir: outDir,
      plugins: [markdown()],
    })

    // Verify build succeeded
    expect(result.success).toBe(true)

    // Verify output HTML file exists (in preserved directory structure)
    const htmlFile = file(join(outDir, 'test', 'fixtures', 'test.html'))
    expect(await htmlFile.exists()).toBe(true)

    // Verify output content
    const content = await htmlFile.text()
    expect(content).toContain('<!DOCTYPE html>')
    expect(content).toContain('<h1 id="test-markdown">')
    expect(content).toContain('Test Markdown</h1>')
    expect(content).toContain('<strong>bold</strong>')
    expect(content).toContain('<em>italic</em>')
    expect(content).toContain('<h2 id="code-example">')
    expect(content).toContain('Code Example</h2>')
    expect(content).toContain('<div class="code-block-container">')
    expect(content).toContain('<pre><code')
    expect(content).toContain('copy-code-btn')
  })

  test('should apply custom options', async () => {
    const result = await Bun.build({
      entrypoints: [join(testDir, 'test.md')],
      outdir: outDir,
      plugins: [
        markdown({
          title: 'Custom Title',
          meta: {
            description: 'Test description',
          },
          css: 'body { background: #f0f0f0; }',
          scripts: ['/test.js'],
        }),
      ],
    })

    // Verify build succeeded
    expect(result.success).toBe(true)

    // Verify output HTML file exists (in preserved directory structure)
    const htmlFile = file(join(outDir, 'test', 'fixtures', 'test.html'))
    expect(await htmlFile.exists()).toBe(true)

    // Verify output content with custom options
    const content = await htmlFile.text()
    expect(content).toContain('<title>Custom Title</title>')
    expect(content).toContain('<meta name="description" content="Test description">')
    expect(content).toContain('body { background: #f0f0f0; }')
    expect(content).toContain('<script src="/test.js"></script>')
  })
})
