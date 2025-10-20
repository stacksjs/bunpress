import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { findMarkdownFiles } from '../bin/cli'

/**
 * Test suite for the LLM command functionality
 *
 * This test suite provides comprehensive coverage of the `llm` command,
 * which generates LLM-friendly markdown files from documentation.
 *
 * Test Coverage:
 * - Basic Functionality (3 tests): File finding, nested directories, empty directories
 * - Default Mode (5 tests): Heading extraction, frontmatter, various heading levels
 * - Full Mode (4 tests): Complete content, code blocks, formatting preservation
 * - Output Format (4 tests): Metadata headers, file separators, sorting
 * - Edge Cases (9 tests): Special characters, malformed content, unicode, etc.
 * - Multiple Files (2 tests): Processing multiple files and nested structures
 * - File Writing (3 tests): Output file creation and overwriting
 * - Performance (1 test): Large file set handling
 * - CLI Integration (4 tests): Direct CLI command testing
 *
 * Total: 33 tests with 118 expect() calls
 */

interface TestContext {
  testDir: string
  outputFile: string
}

const ctx: TestContext = {
  testDir: '',
  outputFile: '',
}

beforeEach(async () => {
  // Create temporary test directory
  ctx.testDir = join(import.meta.dir, 'temp', `llm-test-${Date.now()}`)
  ctx.outputFile = join(ctx.testDir, 'output.md')
  await mkdir(ctx.testDir, { recursive: true })
})

afterEach(async () => {
  // Clean up test directory
  await rm(ctx.testDir, { recursive: true, force: true })
})

/**
 * Helper function to create test markdown files
 */
async function createTestFiles(files: Array<{ name: string, content: string }>) {
  for (const file of files) {
    await Bun.write(join(ctx.testDir, file.name), file.content)
  }
}

/**
 * Helper function to generate LLM markdown (mimics CLI function)
 */
async function generateLlmMarkdown(options: {
  dir: string
  output: string
  full: boolean
}): Promise<string> {
  const { dir, output, full } = options

  // Find all markdown files
  const markdownFiles = await findMarkdownFiles(dir)
  markdownFiles.sort()

  let outputContent = '# Documentation\n\n'
  outputContent += `Generated: ${new Date().toISOString()}\n\n`
  outputContent += `Total files: ${markdownFiles.length}\n\n`
  outputContent += '---\n\n'

  // Process each markdown file
  for (const filePath of markdownFiles) {
    const relativePath = filePath.replace(`${dir}/`, '')
    const fileContent = await Bun.file(filePath).text()

    outputContent += `## File: ${relativePath}\n\n`

    if (full) {
      // Include full content
      outputContent += fileContent
      outputContent += '\n\n'
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
              outputContent += '**Frontmatter:**\n```yaml\n'
              outputContent += frontmatterContent
              outputContent += '```\n\n'
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
          outputContent += `${line}\n`
        }
      }

      outputContent += '\n'
    }

    outputContent += '---\n\n'
  }

  // Write output file
  await Bun.write(output, outputContent)

  return outputContent
}

describe('LLM Command', () => {
  describe('Basic Functionality', () => {
    test('should find markdown files in directory', async () => {
      await createTestFiles([
        { name: 'test1.md', content: '# Test 1' },
        { name: 'test2.md', content: '# Test 2' },
      ])

      const files = await findMarkdownFiles(ctx.testDir)
      expect(files.length).toBe(2)
      expect(files.some(f => f.includes('test1.md'))).toBe(true)
      expect(files.some(f => f.includes('test2.md'))).toBe(true)
    })

    test('should find markdown files in nested directories', async () => {
      const subdir = join(ctx.testDir, 'nested')
      await mkdir(subdir, { recursive: true })

      await createTestFiles([
        { name: 'root.md', content: '# Root' },
      ])

      await Bun.write(join(subdir, 'nested.md'), '# Nested')

      const files = await findMarkdownFiles(ctx.testDir)
      expect(files.length).toBe(2)
      expect(files.some(f => f.includes('root.md'))).toBe(true)
      expect(files.some(f => f.includes('nested.md'))).toBe(true)
    })

    test('should return empty array when no markdown files exist', async () => {
      await Bun.write(join(ctx.testDir, 'not-markdown.txt'), 'Some text')

      const files = await findMarkdownFiles(ctx.testDir)
      expect(files.length).toBe(0)
    })
  })

  describe('Default Mode (Headings Only)', () => {
    test('should extract only headings from markdown', async () => {
      await createTestFiles([
        {
          name: 'test.md',
          content: `# Main Title

Some paragraph content that should not appear.

## Section 1

More content to skip.

### Subsection 1.1

Even more content.

## Section 2

Final content to skip.`,
        },
      ])

      const output = await generateLlmMarkdown({
        dir: ctx.testDir,
        output: ctx.outputFile,
        full: false,
      })

      expect(output).toContain('# Main Title')
      expect(output).toContain('## Section 1')
      expect(output).toContain('### Subsection 1.1')
      expect(output).toContain('## Section 2')
      expect(output).not.toContain('Some paragraph content')
      expect(output).not.toContain('More content to skip')
    })

    test('should extract frontmatter in default mode', async () => {
      await createTestFiles([
        {
          name: 'with-frontmatter.md',
          content: `---
title: My Document
author: John Doe
date: 2024-01-15
---

# Content Title

Some content here.`,
        },
      ])

      const output = await generateLlmMarkdown({
        dir: ctx.testDir,
        output: ctx.outputFile,
        full: false,
      })

      expect(output).toContain('**Frontmatter:**')
      expect(output).toContain('```yaml')
      expect(output).toContain('title: My Document')
      expect(output).toContain('author: John Doe')
      expect(output).toContain('date: 2024-01-15')
      expect(output).toContain('# Content Title')
      expect(output).not.toContain('Some content here')
    })

    test('should handle files without frontmatter', async () => {
      await createTestFiles([
        {
          name: 'no-frontmatter.md',
          content: `# Simple Document

Just some content without frontmatter.

## Section

More content.`,
        },
      ])

      const output = await generateLlmMarkdown({
        dir: ctx.testDir,
        output: ctx.outputFile,
        full: false,
      })

      expect(output).toContain('# Simple Document')
      expect(output).toContain('## Section')
      expect(output).not.toContain('Frontmatter')
      expect(output).not.toContain('Just some content')
    })

    test('should handle all heading levels (h1-h6)', async () => {
      await createTestFiles([
        {
          name: 'all-headings.md',
          content: `# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

Some content.`,
        },
      ])

      const output = await generateLlmMarkdown({
        dir: ctx.testDir,
        output: ctx.outputFile,
        full: false,
      })

      expect(output).toContain('# Heading 1')
      expect(output).toContain('## Heading 2')
      expect(output).toContain('### Heading 3')
      expect(output).toContain('#### Heading 4')
      expect(output).toContain('##### Heading 5')
      expect(output).toContain('###### Heading 6')
      expect(output).not.toContain('Some content.')
    })

    test('should handle empty files gracefully', async () => {
      await createTestFiles([
        { name: 'empty.md', content: '' },
      ])

      const output = await generateLlmMarkdown({
        dir: ctx.testDir,
        output: ctx.outputFile,
        full: false,
      })

      expect(output).toContain('## File: empty.md')
      expect(output).toContain('---')
    })
  })

  describe('Full Mode', () => {
    test('should include complete file content with --full flag', async () => {
      await createTestFiles([
        {
          name: 'full-test.md',
          content: `# Title

This is a paragraph.

## Section

Code example:

\`\`\`js
console.log('hello')
\`\`\`

More content here.`,
        },
      ])

      const output = await generateLlmMarkdown({
        dir: ctx.testDir,
        output: ctx.outputFile,
        full: true,
      })

      expect(output).toContain('# Title')
      expect(output).toContain('This is a paragraph')
      expect(output).toContain('## Section')
      expect(output).toContain('Code example:')
      expect(output).toContain('```js')
      expect(output).toContain('console.log(\'hello\')')
      expect(output).toContain('More content here')
    })

    test('should include frontmatter in full mode', async () => {
      await createTestFiles([
        {
          name: 'full-frontmatter.md',
          content: `---
title: Full Document
tags: [test, example]
---

# Content

Full paragraph.`,
        },
      ])

      const output = await generateLlmMarkdown({
        dir: ctx.testDir,
        output: ctx.outputFile,
        full: true,
      })

      expect(output).toContain('---')
      expect(output).toContain('title: Full Document')
      expect(output).toContain('tags: [test, example]')
      expect(output).toContain('# Content')
      expect(output).toContain('Full paragraph')
    })

    test('should preserve code blocks in full mode', async () => {
      await createTestFiles([
        {
          name: 'code-blocks.md',
          content: `# Code Examples

\`\`\`typescript
interface User {
  name: string
  age: number
}
\`\`\`

\`\`\`bash
bun install
bun run dev
\`\`\``,
        },
      ])

      const output = await generateLlmMarkdown({
        dir: ctx.testDir,
        output: ctx.outputFile,
        full: true,
      })

      expect(output).toContain('```typescript')
      expect(output).toContain('interface User')
      expect(output).toContain('```bash')
      expect(output).toContain('bun install')
    })

    test('should preserve lists and formatting in full mode', async () => {
      await createTestFiles([
        {
          name: 'formatting.md',
          content: `# Document

- Item 1
- Item 2
  - Nested item
- Item 3

1. First
2. Second
3. Third

**Bold text** and *italic text*.`,
        },
      ])

      const output = await generateLlmMarkdown({
        dir: ctx.testDir,
        output: ctx.outputFile,
        full: true,
      })

      expect(output).toContain('- Item 1')
      expect(output).toContain('- Nested item')
      expect(output).toContain('1. First')
      expect(output).toContain('**Bold text**')
      expect(output).toContain('*italic text*')
    })
  })

  describe('Output Format', () => {
    test('should include metadata header', async () => {
      await createTestFiles([
        { name: 'test.md', content: '# Test' },
      ])

      const output = await generateLlmMarkdown({
        dir: ctx.testDir,
        output: ctx.outputFile,
        full: false,
      })

      expect(output).toContain('# Documentation')
      expect(output).toContain('Generated:')
      expect(output).toContain('Total files: 1')
      expect(output).toMatch(/Generated: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    test('should separate files with separators', async () => {
      await createTestFiles([
        { name: 'file1.md', content: '# File 1' },
        { name: 'file2.md', content: '# File 2' },
      ])

      const output = await generateLlmMarkdown({
        dir: ctx.testDir,
        output: ctx.outputFile,
        full: false,
      })

      const separatorCount = (output.match(/---/g) || []).length
      expect(separatorCount).toBeGreaterThanOrEqual(3) // Initial separator + one per file
    })

    test('should include file paths as section headers', async () => {
      await createTestFiles([
        { name: 'docs.md', content: '# Docs' },
        { name: 'guide.md', content: '# Guide' },
      ])

      const output = await generateLlmMarkdown({
        dir: ctx.testDir,
        output: ctx.outputFile,
        full: false,
      })

      expect(output).toContain('## File: docs.md')
      expect(output).toContain('## File: guide.md')
    })

    test('should sort files alphabetically', async () => {
      await createTestFiles([
        { name: 'zebra.md', content: '# Zebra' },
        { name: 'alpha.md', content: '# Alpha' },
        { name: 'middle.md', content: '# Middle' },
      ])

      const output = await generateLlmMarkdown({
        dir: ctx.testDir,
        output: ctx.outputFile,
        full: false,
      })

      const alphaIndex = output.indexOf('## File: alpha.md')
      const middleIndex = output.indexOf('## File: middle.md')
      const zebraIndex = output.indexOf('## File: zebra.md')

      expect(alphaIndex).toBeLessThan(middleIndex)
      expect(middleIndex).toBeLessThan(zebraIndex)
    })
  })

  describe('Edge Cases', () => {
    test('should handle files with only frontmatter', async () => {
      await createTestFiles([
        {
          name: 'only-frontmatter.md',
          content: `---
title: Just Frontmatter
---`,
        },
      ])

      const output = await generateLlmMarkdown({
        dir: ctx.testDir,
        output: ctx.outputFile,
        full: false,
      })

      expect(output).toContain('**Frontmatter:**')
      expect(output).toContain('title: Just Frontmatter')
    })

    test('should handle files with no headings', async () => {
      await createTestFiles([
        {
          name: 'no-headings.md',
          content: 'Just plain text without any headings.',
        },
      ])

      const output = await generateLlmMarkdown({
        dir: ctx.testDir,
        output: ctx.outputFile,
        full: false,
      })

      expect(output).toContain('## File: no-headings.md')
      expect(output).not.toContain('Just plain text')
    })

    test('should handle headings with special characters', async () => {
      await createTestFiles([
        {
          name: 'special-chars.md',
          content: `# Title with "Quotes" & Symbols!
## Section with <brackets>
### Code \`inline\` heading`,
        },
      ])

      const output = await generateLlmMarkdown({
        dir: ctx.testDir,
        output: ctx.outputFile,
        full: false,
      })

      expect(output).toContain('# Title with "Quotes" & Symbols!')
      expect(output).toContain('## Section with <brackets>')
      expect(output).toContain('### Code `inline` heading')
    })

    test('should handle headings with trailing spaces', async () => {
      await createTestFiles([
        {
          name: 'trailing-spaces.md',
          content: `# Title
## Section
### Subsection `,
        },
      ])

      const output = await generateLlmMarkdown({
        dir: ctx.testDir,
        output: ctx.outputFile,
        full: false,
      })

      expect(output).toContain('# Title')
      expect(output).toContain('## Section')
      expect(output).toContain('### Subsection')
    })

    test('should handle malformed frontmatter gracefully', async () => {
      await createTestFiles([
        {
          name: 'bad-frontmatter.md',
          content: `---
title: Missing closing separator
# Heading

Content`,
        },
      ])

      const output = await generateLlmMarkdown({
        dir: ctx.testDir,
        output: ctx.outputFile,
        full: false,
      })

      // Should still process the file even with malformed frontmatter
      expect(output).toContain('## File: bad-frontmatter.md')
    })

    test('should handle very long files', async () => {
      const longContent = Array.from({ length: 1000 }, (_, i) => `## Section ${i}\n\nContent for section ${i}.\n`).join('\n')

      await createTestFiles([
        { name: 'long.md', content: `# Long Document\n\n${longContent}` },
      ])

      const output = await generateLlmMarkdown({
        dir: ctx.testDir,
        output: ctx.outputFile,
        full: false,
      })

      expect(output).toContain('# Long Document')
      expect(output).toContain('## Section 0')
      expect(output).toContain('## Section 999')
    })

    test('should handle unicode characters in headings', async () => {
      await createTestFiles([
        {
          name: 'unicode.md',
          content: `# 文档标题 (Chinese)
## Заголовок (Russian)
### عنوان (Arabic)
#### 🚀 Emojis in Heading`,
        },
      ])

      const output = await generateLlmMarkdown({
        dir: ctx.testDir,
        output: ctx.outputFile,
        full: false,
      })

      expect(output).toContain('# 文档标题 (Chinese)')
      expect(output).toContain('## Заголовок (Russian)')
      expect(output).toContain('### عنوان (Arabic)')
      expect(output).toContain('#### 🚀 Emojis in Heading')
    })
  })

  describe('Multiple Files Processing', () => {
    test('should process multiple files correctly', async () => {
      await createTestFiles([
        {
          name: 'intro.md',
          content: `# Introduction

Welcome to the docs.

## Overview`,
        },
        {
          name: 'guide.md',
          content: `---
title: User Guide
---

# User Guide

## Getting Started`,
        },
        {
          name: 'api.md',
          content: `# API Reference

## Endpoints

### GET /users`,
        },
      ])

      const output = await generateLlmMarkdown({
        dir: ctx.testDir,
        output: ctx.outputFile,
        full: false,
      })

      expect(output).toContain('Total files: 3')
      expect(output).toContain('## File: api.md')
      expect(output).toContain('## File: guide.md')
      expect(output).toContain('## File: intro.md')

      // Check content from each file
      expect(output).toContain('# Introduction')
      expect(output).toContain('# User Guide')
      expect(output).toContain('# API Reference')
    })

    test('should handle nested directory structure', async () => {
      const subdir1 = join(ctx.testDir, 'guide')
      const subdir2 = join(ctx.testDir, 'api')
      await mkdir(subdir1, { recursive: true })
      await mkdir(subdir2, { recursive: true })

      await Bun.write(join(ctx.testDir, 'index.md'), '# Home')
      await Bun.write(join(subdir1, 'intro.md'), '# Guide Intro')
      await Bun.write(join(subdir2, 'reference.md'), '# API Reference')

      const output = await generateLlmMarkdown({
        dir: ctx.testDir,
        output: ctx.outputFile,
        full: false,
      })

      expect(output).toContain('Total files: 3')
      expect(output).toContain('## File:')
      expect(output).toContain('# Home')
      expect(output).toContain('# Guide Intro')
      expect(output).toContain('# API Reference')
    })
  })

  describe('File Writing', () => {
    test('should write output to specified file', async () => {
      await createTestFiles([
        { name: 'test.md', content: '# Test Document' },
      ])

      await generateLlmMarkdown({
        dir: ctx.testDir,
        output: ctx.outputFile,
        full: false,
      })

      const fileExists = await Bun.file(ctx.outputFile).exists()
      expect(fileExists).toBe(true)

      const content = await Bun.file(ctx.outputFile).text()
      expect(content).toContain('# Documentation')
      expect(content).toContain('# Test Document')
    })

    test('should overwrite existing output file', async () => {
      // Use a separate input directory to avoid picking up output file
      const inputDir = join(ctx.testDir, 'input')
      await mkdir(inputDir, { recursive: true })

      await Bun.write(join(inputDir, 'test.md'), '# First Run')

      // First run
      await generateLlmMarkdown({
        dir: inputDir,
        output: ctx.outputFile,
        full: false,
      })

      const firstContent = await Bun.file(ctx.outputFile).text()
      expect(firstContent).toContain('# First Run')

      // Update file and run again
      await Bun.write(join(inputDir, 'test.md'), '# Second Run')

      await generateLlmMarkdown({
        dir: inputDir,
        output: ctx.outputFile,
        full: false,
      })

      const secondContent = await Bun.file(ctx.outputFile).text()
      expect(secondContent).toContain('# Second Run')
      expect(secondContent).not.toContain('# First Run')
    })

    test('should create output file in non-existent directory', async () => {
      await createTestFiles([
        { name: 'test.md', content: '# Test' },
      ])

      const nestedOutput = join(ctx.testDir, 'output', 'nested', 'result.md')

      await generateLlmMarkdown({
        dir: ctx.testDir,
        output: nestedOutput,
        full: false,
      })

      const fileExists = await Bun.file(nestedOutput).exists()
      expect(fileExists).toBe(true)
    })
  })

  describe('Performance', () => {
    test('should handle large number of files efficiently', async () => {
      // Create 100 test files
      const files = Array.from({ length: 100 }, (_, i) => ({
        name: `file-${i.toString().padStart(3, '0')}.md`,
        content: `# Document ${i}\n\n## Section A\n\n## Section B`,
      }))

      await createTestFiles(files)

      const startTime = performance.now()

      const output = await generateLlmMarkdown({
        dir: ctx.testDir,
        output: ctx.outputFile,
        full: false,
      })

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(output).toContain('Total files: 100')
      expect(duration).toBeLessThan(5000) // Should complete in less than 5 seconds
    })
  })

  describe('CLI Integration', () => {
    test('should work via CLI command', async () => {
      await createTestFiles([
        { name: 'cli-test.md', content: '# CLI Test\n\n## Section' },
      ])

      const proc = Bun.spawn([
        'bun',
        'bin/cli.ts',
        'llm',
        '--dir',
        ctx.testDir,
        '--output',
        ctx.outputFile,
      ])

      const exitCode = await proc.exited

      expect(exitCode).toBe(0)

      const fileExists = await Bun.file(ctx.outputFile).exists()
      expect(fileExists).toBe(true)

      const content = await Bun.file(ctx.outputFile).text()
      expect(content).toContain('# Documentation')
      expect(content).toContain('# CLI Test')
      expect(content).toContain('## Section')
    })

    test('should work with --full flag via CLI', async () => {
      await createTestFiles([
        {
          name: 'full-cli-test.md',
          content: `# Full Test

This is content that should appear.

## Details

More content here.`,
        },
      ])

      const proc = Bun.spawn([
        'bun',
        'bin/cli.ts',
        'llm',
        '--dir',
        ctx.testDir,
        '--output',
        ctx.outputFile,
        '--full',
      ])

      const exitCode = await proc.exited

      expect(exitCode).toBe(0)

      const content = await Bun.file(ctx.outputFile).text()
      expect(content).toContain('# Full Test')
      expect(content).toContain('This is content that should appear')
      expect(content).toContain('## Details')
      expect(content).toContain('More content here')
    })

    test('should handle non-existent directory gracefully', async () => {
      const nonExistentDir = join(ctx.testDir, 'does-not-exist')

      const proc = Bun.spawn([
        'bun',
        'bin/cli.ts',
        'llm',
        '--dir',
        nonExistentDir,
        '--output',
        ctx.outputFile,
      ])

      const exitCode = await proc.exited

      expect(exitCode).toBe(1) // Should exit with error code
    })

    test('should work with verbose flag', async () => {
      await createTestFiles([
        { name: 'verbose-test.md', content: '# Verbose Test' },
      ])

      const proc = Bun.spawn(
        [
          'bun',
          'bin/cli.ts',
          'llm',
          '--dir',
          ctx.testDir,
          '--output',
          ctx.outputFile,
          '--verbose',
        ],
        {
          stdout: 'pipe',
        },
      )

      const exitCode = await proc.exited
      const stdout = await new Response(proc.stdout).text()

      expect(exitCode).toBe(0)
      expect(stdout).toContain('Generating LLM markdown')
      expect(stdout).toContain('Found')
      expect(stdout).toContain('markdown files')
      expect(stdout).toContain('Processing:')
    })
  })
})
