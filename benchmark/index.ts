import { bench, group, run } from 'mitata'
import { marked } from 'marked'
import MarkdownIt from 'markdown-it'
import taskLists from 'markdown-it-task-lists'
import { micromark } from 'micromark'
import { gfm, gfmHtml } from 'micromark-extension-gfm'
import showdown from 'showdown'
import { HtmlRenderer, Parser as CommonmarkParser } from 'commonmark'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

/**
 * Markdown Engine Benchmarks
 *
 * Compares BunPress against documentation frameworks and popular engines.
 * Each engine is configured with equivalent GFM features enabled where
 * supported, ensuring a fair apples-to-apples comparison.
 *
 *   BunPress          - Bun.markdown (Zig-based, built into Bun runtime)
 *   VitePress          - markdown-it + task-lists (JS, as configured in VitePress)
 *   Eleventy           - markdown-it + task-lists (JS, default engine + GFM parity)
 *   Astro              - remark + remark-gfm + rehype (JS, unified ecosystem)
 *   marked             - JS, fast compiler (GFM enabled by default)
 *   micromark          - JS, small + safe + CommonMark (with GFM extension)
 *   showdown           - JS, bidirectional converter (with GFM options)
 *   commonmark (no GFM) - JS, reference CommonMark implementation (no GFM support)
 *
 * Fairness notes:
 *   - All engines have GFM features enabled where supported (tables,
 *     strikethrough, task lists, autolinks). commonmark.js does NOT support
 *     GFM, so it processes fewer features and appears artificially faster.
 *   - VitePress and Eleventy use markdown-it with the task-lists plugin
 *     for GFM task list parity.
 *   - Real VitePress adds significant overhead beyond markdown-it: Shiki
 *     syntax highlighting, @mdit-vue plugins (headers, SFC, components),
 *     and Vue template compilation. Our benchmark tests only the markdown
 *     engine, making these results conservative (real VitePress is slower).
 *   - Real Astro adds Shiki syntax highlighting on top of the remark/rehype
 *     pipeline. Our benchmark tests only the markdown engine, making these
 *     results conservative (real Astro is slower).
 *   - BunPress results include all GFM processing (tables, strikethrough,
 *     task lists, autolinks) with no features disabled.
 *
 * Run:
 *   bun install && bun run bench
 */

// --------------------------------------------------------------------------
// Setup parsers (instantiate once, reuse across iterations)
// --------------------------------------------------------------------------

// VitePress uses markdown-it with html + linkify + task lists plugin.
// Real VitePress also adds Shiki + @mdit-vue plugins (headers, SFC,
// components, title) which add further overhead not measured here.
const vitepressMd = new MarkdownIt({ html: true, linkify: true })
vitepressMd.use(taskLists)

// Eleventy uses markdown-it with html enabled (default config).
// Task lists plugin added for GFM feature parity.
const eleventyMd = new MarkdownIt({ html: true })
eleventyMd.use(taskLists)

// Astro uses unified (remark-parse + remark-gfm + remark-rehype + rehype-stringify).
// Real Astro also adds Shiki for syntax highlighting, not measured here.
const astroProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify)

// showdown with GFM features enabled
const showdownConverter = new showdown.Converter({
  tables: true,
  strikethrough: true,
  tasklists: true,
  ghCodeBlocks: true,
})

// commonmark.js - reference CommonMark implementation.
// Does NOT support GFM (no tables, strikethrough, task lists, or autolinks).
// It processes fewer features than all other engines in this benchmark.
const cmParser = new CommonmarkParser()
const cmRenderer = new HtmlRenderer()

const bunMarkdown = Bun.markdown

// --------------------------------------------------------------------------
// Test documents
// --------------------------------------------------------------------------

const simple = `# Hello World

This is a paragraph with **bold**, *italic*, and \`inline code\`.

Another paragraph with a [link](https://example.com) and some text.
`

const inlineHeavy = `This has **bold**, *italic*, \`code\`, ~~strikethrough~~, and [links](https://example.com).

More **bold text** with *emphasis* and \`code spans\` mixed in.

A sentence with **multiple** *different* \`formatting\` options ~~applied~~.

Final line with [one](/) [two](/) [three](/) [four](/) links.
`.repeat(10)

const headings = `# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

## Another Section

### Subsection A

### Subsection B

## Final Section
`.repeat(5)

const lists = `## Unordered Lists

- Item one
- Item two
  - Nested item
  - Another nested
    - Deep nested
- Item three

## Ordered Lists

1. First item
2. Second item
   1. Nested first
   2. Nested second
3. Third item

## Task Lists

- [x] Completed task
- [ ] Pending task
- [x] Another done
- [ ] Still todo
`.repeat(5)

const tables = `## Performance Comparison

| Engine | Language | Speed | GFM | CommonMark |
|--------|----------|-------|-----|------------|
| Bun.markdown | Zig | Very Fast | Yes | Yes |
| marked | JavaScript | Fast | Yes | Yes |
| markdown-it | JavaScript | Fast | Plugin | Yes |
| micromark | JavaScript | Moderate | Extension | Yes |
| showdown | JavaScript | Moderate | Partial | Partial |
| commonmark.js | JavaScript | Slow | No | Yes |

## Feature Matrix

| Feature | BunPress | VitePress | Docusaurus | Nextra |
|:--------|:--------:|:---------:|:----------:|:------:|
| Hot Reload | Yes | Yes | Yes | Yes |
| SSG | Yes | Yes | Yes | Yes |
| Search | Yes | Yes | Yes | Plugin |
| i18n | Planned | Yes | Yes | Yes |
| Themes | Yes | Yes | Yes | Yes |
`.repeat(5)

const codeBlocks = `## JavaScript

\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

const result = fibonacci(10)
console.log('Result:', result)
\`\`\`

## TypeScript

\`\`\`typescript
interface User {
  id: number
  name: string
  email: string
}

class UserService {
  private users: Map<number, User> = new Map()

  async create(data: Omit<User, 'id'>): Promise<User> {
    const id = Math.random()
    const user = { id, ...data }
    this.users.set(id, user)
    return user
  }
}
\`\`\`

## Python

\`\`\`python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)
\`\`\`
`.repeat(5)

const mixed = `# Documentation Page

## Introduction

This is a comprehensive document with **bold**, *italic*, and \`code\`.

## Quick Start

\`\`\`bash
npm install my-package
\`\`\`

## API Reference

| Method | Parameters | Returns |
|--------|-----------|---------|
| \`create()\` | \`data: object\` | \`Promise<Item>\` |
| \`read()\` | \`id: string\` | \`Promise<Item>\` |
| \`update()\` | \`id: string, data: object\` | \`Promise<Item>\` |
| \`delete()\` | \`id: string\` | \`Promise<void>\` |

## Examples

\`\`\`typescript
import { createClient } from 'my-package'

const client = createClient({
  apiKey: 'your-api-key',
  region: 'us-east-1',
})

const item = await client.create({
  name: 'Example',
  value: 42,
})
\`\`\`

## Features

- **Fast** - Built for speed
- **Type-safe** - Full TypeScript support
- **Extensible** - Plugin architecture
- [Documentation](https://example.com)
- [GitHub](https://github.com/example)

## Task List

- [x] Initial release
- [x] Add GFM support
- [ ] Plugin system
- [ ] Theme engine

> **Note:** This is a blockquote with **formatting** inside.

---

For more information, visit [our website](https://example.com).
`

// Simulate a real-world documentation page (~4KB)
const realWorldDoc = mixed.repeat(3)

// Large document for stress testing (~40KB)
const largeDoc = mixed.repeat(30)

// --------------------------------------------------------------------------
// Helper: define all engines for a group
// --------------------------------------------------------------------------

function benchAll(input: string) {
  bench('BunPress', () => {
    bunMarkdown.html(input, { tables: true, strikethrough: true, tasklists: true, autolinks: true })
  })

  bench('VitePress', () => {
    vitepressMd.render(input)
  })

  bench('Eleventy', () => {
    eleventyMd.render(input)
  })

  bench('Astro', () => {
    astroProcessor.processSync(input)
  })

  bench('marked', () => {
    marked.parse(input)
  })

  bench('micromark', () => {
    micromark(input, { extensions: [gfm()], htmlExtensions: [gfmHtml()] })
  })

  bench('showdown', () => {
    showdownConverter.makeHtml(input)
  })

  bench('commonmark (no GFM)', () => {
    cmRenderer.render(cmParser.parse(input))
  })
}

// --------------------------------------------------------------------------
// Benchmarks
// --------------------------------------------------------------------------

group('Simple paragraph + inline formatting', () => {
  benchAll(simple)
})

group('Inline-heavy content', () => {
  benchAll(inlineHeavy)
})

group('Headings', () => {
  benchAll(headings)
})

group('Lists (unordered, ordered, task lists)', () => {
  benchAll(lists)
})

group('GFM Tables', () => {
  benchAll(tables)
})

group('Code blocks', () => {
  benchAll(codeBlocks)
})

group('Mixed content (realistic doc page)', () => {
  benchAll(mixed)
})

group('Real-world doc page (~4KB markdown)', () => {
  benchAll(realWorldDoc)
})

group('Large document stress test (~40KB markdown)', () => {
  benchAll(largeDoc)
})

group({ name: 'Throughput: 100 mixed docs', summary: true }, () => {
  const docs = Array.from({ length: 100 }, (_, i) =>
    mixed.replace(/# Documentation Page/g, `# Documentation Page ${i}`),
  )

  bench('BunPress', () => {
    for (const doc of docs) bunMarkdown.html(doc, { tables: true, strikethrough: true, tasklists: true, autolinks: true })
  })

  bench('VitePress', () => {
    for (const doc of docs) vitepressMd.render(doc)
  })

  bench('Eleventy', () => {
    for (const doc of docs) eleventyMd.render(doc)
  })

  bench('Astro', () => {
    for (const doc of docs) astroProcessor.processSync(doc)
  })

  bench('marked', () => {
    for (const doc of docs) marked.parse(doc)
  })

  bench('micromark', () => {
    for (const doc of docs) micromark(doc, { extensions: [gfm()], htmlExtensions: [gfmHtml()] })
  })

  bench('showdown', () => {
    for (const doc of docs) showdownConverter.makeHtml(doc)
  })

  bench('commonmark (no GFM)', () => {
    for (const doc of docs) cmRenderer.render(cmParser.parse(doc))
  })
})

// --------------------------------------------------------------------------
// Run
// --------------------------------------------------------------------------

console.log('\n--- Markdown Engine Benchmarks ---\n')
console.log('Engines:')
console.log('  BunPress          - Bun.markdown (Zig-based, built into Bun)')
console.log('  VitePress          - markdown-it + task-lists plugin (JS, as used in VitePress)')
console.log('  Eleventy           - markdown-it + task-lists plugin (JS, default engine + GFM parity)')
console.log('  Astro              - remark + remark-gfm + rehype (JS, unified ecosystem)')
console.log('  marked             - JS, fast compiler (GFM on by default)')
console.log('  micromark          - JS, small + safe + CommonMark (with GFM extension)')
console.log('  showdown           - JS, bidirectional converter (with GFM options)')
console.log('  commonmark (no GFM) - JS, reference CommonMark impl (NO tables/strikethrough/tasklists)')
console.log('')
console.log('Fairness:')
console.log('  - All engines have GFM features enabled where supported')
console.log('  - commonmark.js does NOT support GFM (processes fewer features, appears faster)')
console.log('  - Real VitePress/Astro add Shiki + extra plugins (slower than shown here)')
console.log('')
console.log(`Bun ${Bun.version} | ${process.platform} ${process.arch}`)
console.log(`Document sizes: simple=${simple.length}B inline=${inlineHeavy.length}B tables=${tables.length}B code=${codeBlocks.length}B mixed=${mixed.length}B real=${realWorldDoc.length}B large=${largeDoc.length}B`)
console.log('')

await run()
