import { bench, group, run } from 'mitata'
import { buildTocHierarchy, extractHeadings, filterHeadings, generateInlineTocHtml } from '../src/toc'
import { highlightCode } from '../src/highlighter'
import { cleanupFiles, formatDuration, generateMarkdownFiles } from './utils'

/**
 * Features Performance Benchmarks
 *
 * Tests individual feature performance like TOC generation,
 * syntax highlighting, markdown parsing, etc.
 */

const FIXTURES_DIR = './benchmarks/fixtures/features'

group('Table of Contents', () => {
  const sampleMarkdown = `
# Main Title

## Section 1

### Subsection 1.1
### Subsection 1.2

## Section 2

### Subsection 2.1
#### Deep Section 2.1.1
##### Deeper Section 2.1.1.1

## Section 3

### Subsection 3.1
### Subsection 3.2
### Subsection 3.3
  `.repeat(10) // Repeat to create a large document

  bench('extract headings (large doc)', () => {
    const headings = extractHeadings(sampleMarkdown)
    console.log(`  Headings found: ${headings.length}`)
  })

  bench('build TOC hierarchy', () => {
    const headings = extractHeadings(sampleMarkdown)
    const hierarchy = buildTocHierarchy(headings)
    console.log(`  Root items: ${hierarchy.length}`)
  })

  bench('filter headings', () => {
    const headings = extractHeadings(sampleMarkdown)
    const filtered = filterHeadings(headings, {
      enabled: true,
      minDepth: 2,
      maxDepth: 4,
    })
    console.log(`  Filtered: ${filtered.length} (from ${headings.length})`)
  })

  bench('generate TOC HTML', async () => {
    const headings = extractHeadings(sampleMarkdown)
    const hierarchy = buildTocHierarchy(headings)
    const bunPressConfig = await import('../src/config').then(m => m.config)
    const tocData = {
      items: hierarchy,
      title: 'Table of Contents',
      config: bunPressConfig as any,
    }
    const html = generateInlineTocHtml(tocData)
    console.log(`  HTML size: ${(html.length / 1024).toFixed(2)}KB`)
  })

  bench('full TOC pipeline', async () => {
    const startTime = performance.now()

    const headings = extractHeadings(sampleMarkdown)
    const filtered = filterHeadings(headings, {
      enabled: true,
      minDepth: 2,
      maxDepth: 4,
    })
    const hierarchy = buildTocHierarchy(filtered)
    const bunPressConfig = await import('../src/config').then(m => m.config)
    const tocData = {
      items: hierarchy,
      title: 'Table of Contents',
      config: bunPressConfig as any,
    }
    const html = generateInlineTocHtml(tocData)

    const duration = performance.now() - startTime
    console.log(`  Pipeline time: ${formatDuration(duration)}`)
    console.log(`  Output: ${headings.length} → ${filtered.length} headings, ${html.length} chars`)
  })
})

group('Syntax highlighting', () => {
  const codeSnippets = {
    javascript: `
function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

const result = fibonacci(10)
console.log('Fibonacci(10):', result)
    `.trim(),

    typescript: `
interface User {
  id: number
  name: string
  email: string
  createdAt: Date
}

class UserService {
  private users: Map<number, User> = new Map()

  async createUser(data: Omit<User, 'id'>): Promise<User> {
    const id = Math.random()
    const user = { id, ...data }
    this.users.set(id, user)
    return user
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id)
  }
}
    `.trim(),

    python: `
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

# Example usage
data = [3, 6, 8, 10, 1, 2, 1]
sorted_data = quicksort(data)
print(sorted_data)
    `.trim(),

    rust: `
fn fibonacci(n: u32) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

fn main() {
    for i in 0..10 {
        println!("fibonacci({}) = {}", i, fibonacci(i));
    }
}
    `.trim(),
  }

  bench('highlight JavaScript', async () => {
    const html = await highlightCode(codeSnippets.javascript, 'javascript')
    console.log(`  Output size: ${(html.length / 1024).toFixed(2)}KB`)
  })

  bench('highlight TypeScript', async () => {
    const html = await highlightCode(codeSnippets.typescript, 'typescript')
    console.log(`  Output size: ${(html.length / 1024).toFixed(2)}KB`)
  })

  bench('highlight Python', async () => {
    const html = await highlightCode(codeSnippets.python, 'python')
    console.log(`  Output size: ${(html.length / 1024).toFixed(2)}KB`)
  })

  bench('highlight Rust', async () => {
    const html = await highlightCode(codeSnippets.rust, 'rust')
    console.log(`  Output size: ${(html.length / 1024).toFixed(2)}KB`)
  })

  bench('batch highlighting (10 blocks)', async () => {
    const startTime = performance.now()

    await Promise.all([
      highlightCode(codeSnippets.javascript, 'javascript'),
      highlightCode(codeSnippets.typescript, 'typescript'),
      highlightCode(codeSnippets.python, 'python'),
      highlightCode(codeSnippets.rust, 'rust'),
      highlightCode(codeSnippets.javascript, 'javascript'),
      highlightCode(codeSnippets.typescript, 'typescript'),
      highlightCode(codeSnippets.python, 'python'),
      highlightCode(codeSnippets.rust, 'rust'),
      highlightCode(codeSnippets.javascript, 'javascript'),
      highlightCode(codeSnippets.typescript, 'typescript'),
    ])

    const duration = performance.now() - startTime
    console.log(`  Total time: ${formatDuration(duration)}`)
    console.log(`  Avg per block: ${formatDuration(duration / 10)}`)
  })
})

group('Markdown processing', () => {
  const complexMarkdown = `
# Complex Document

This document contains **bold**, *italic*, \`code\`, and [links](https://example.com).

## Code Blocks

\`\`\`typescript{1,3-5}
interface Config {
  port: number
  host: string
}
\`\`\`

## Tables

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1 | Data 2 | Data 3 |
| Data 4 | Data 5 | Data 6 |

## Lists

- Item 1
  - Nested 1.1
  - Nested 1.2
- Item 2
  - Nested 2.1

## Containers

::: info
This is an info container with **formatting**.
:::

## Images

![Alt text](image.png "Title")

## Custom Anchors

## Heading with Custom ID {#custom}
  `.repeat(5)

  bench('inline formatting', () => {
    const startTime = performance.now()

    // Simulate inline formatting
    let processed = complexMarkdown
    processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>')
    processed = processed.replace(/`(.+?)`/g, '<code>$1</code>')
    processed = processed.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')

    const duration = performance.now() - startTime
    console.log(`  Processing time: ${formatDuration(duration)}`)
    console.log(`  Output size: ${(processed.length / 1024).toFixed(2)}KB`)
  })

  bench('container parsing', () => {
    const containerRegex = /:::\s+(info|tip|warning|danger)\s*(.*?)\n([\s\S]*?):::/g
    const matches = Array.from(complexMarkdown.matchAll(containerRegex))
    console.log(`  Containers found: ${matches.length}`)
  })

  bench('heading extraction', () => {
    const headingRegex = /^(#{1,6})\s+(.+?)(?:\s+\{#([\w-]+)\})?$/gm
    const matches = Array.from(complexMarkdown.matchAll(headingRegex))
    console.log(`  Headings found: ${matches.length}`)
  })
})

group('File generation', () => {
  bench('generate 10 markdown files', async () => {
    await cleanupFiles(FIXTURES_DIR)
    const startTime = performance.now()

    await generateMarkdownFiles(10, FIXTURES_DIR)

    const duration = performance.now() - startTime
    console.log(`  Generation time: ${formatDuration(duration)}`)
    console.log(`  Avg per file: ${formatDuration(duration / 10)}`)

    await cleanupFiles(FIXTURES_DIR)
  })

  bench('generate 100 markdown files', async () => {
    await cleanupFiles(FIXTURES_DIR)
    const startTime = performance.now()

    await generateMarkdownFiles(100, FIXTURES_DIR)

    const duration = performance.now() - startTime
    console.log(`  Generation time: ${formatDuration(duration)}`)
    console.log(`  Avg per file: ${formatDuration(duration / 100)}`)

    await cleanupFiles(FIXTURES_DIR)
  })

  bench('generate 1000 markdown files', async () => {
    await cleanupFiles(FIXTURES_DIR)
    const startTime = performance.now()

    await generateMarkdownFiles(1000, FIXTURES_DIR)

    const duration = performance.now() - startTime
    console.log(`  Generation time: ${formatDuration(duration)}`)
    console.log(`  Avg per file: ${formatDuration(duration / 1000)}`)

    await cleanupFiles(FIXTURES_DIR)
  })
})

console.log('\n🎯 BunPress Features Performance Benchmarks\n')
console.log('Testing individual feature performance\n')
console.log('Environment:')
console.log(`  Bun: ${Bun.version}`)
console.log(`  Platform: ${process.platform} ${process.arch}\n`)

await run({
  colors: true,
})

await cleanupFiles(FIXTURES_DIR)

console.log('\n✅ Feature benchmarks complete!\n')
