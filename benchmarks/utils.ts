import * as fs from 'node:fs'
import * as path from 'node:path'

/**
 * Generate sample markdown files for benchmarking
 */
export async function generateMarkdownFiles(count: number, outputDir: string): Promise<void> {
  // Ensure output directory exists
  await fs.promises.mkdir(outputDir, { recursive: true })

  // Generate markdown files with varying complexity
  for (let i = 0; i < count; i++) {
    const content = generateMarkdownContent(i)
    const filename = `doc-${String(i).padStart(4, '0')}.md`
    await fs.promises.writeFile(path.join(outputDir, filename), content, 'utf-8')
  }
}

/**
 * Generate realistic markdown content
 */
function generateMarkdownContent(index: number): string {
  const templates = [
    generateSimpleDoc(index),
    generateCodeHeavyDoc(index),
    generateTableDoc(index),
    generateImageDoc(index),
  ]

  return templates[index % templates.length]
}

function generateSimpleDoc(index: number): string {
  return `---
title: Document ${index}
description: This is document number ${index}
date: 2024-10-29
---

# Document ${index}

This is a sample documentation page for benchmarking purposes.

## Introduction

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## Features

- Feature one with **bold** text
- Feature two with *italic* text
- Feature three with \`inline code\`
- Feature four with [links](https://example.com)

## Code Example

\`\`\`typescript
function hello(name: string): string {
  return \`Hello, \${name}!\`
}

console.log(hello('World'))
\`\`\`

## Conclusion

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
`
}

function generateCodeHeavyDoc(index: number): string {
  return `---
title: Code Examples ${index}
description: Code-heavy documentation
---

# Code Examples ${index}

## JavaScript Example

\`\`\`javascript{1,3-5}
function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

console.log(fibonacci(10))
\`\`\`

## TypeScript Example

\`\`\`typescript:line-numbers
interface User {
  id: number
  name: string
  email: string
}

function createUser(data: Partial<User>): User {
  return {
    id: Math.random(),
    name: data.name || 'Anonymous',
    email: data.email || 'noreply@example.com',
  }
}
\`\`\`

## Python Example

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

## Code Groups

::: code-group

\`\`\`js [npm]
npm install bunpress
\`\`\`

\`\`\`bash [yarn]
yarn add bunpress
\`\`\`

\`\`\`bash [pnpm]
pnpm add bunpress
\`\`\`

\`\`\`bash [bun]
bun add bunpress
\`\`\`

:::
`
}

function generateTableDoc(index: number): string {
  return `---
title: Tables and Data ${index}
description: Table-heavy documentation
---

# Tables and Data ${index}

## Performance Comparison

| Framework | Build Time | Bundle Size | Memory Usage |
|-----------|-----------|-------------|--------------|
| BunPress | 500ms | 45KB | 50MB |
| VitePress | 2.5s | 120KB | 150MB |
| Docusaurus | 8s | 250KB | 300MB |

## Feature Matrix

| Feature | BunPress | VitePress | Docusaurus |
|:--------|:--------:|:---------:|:----------:|
| Hot Reload | ✅ | ✅ | ✅ |
| SSG | ✅ | ✅ | ✅ |
| Search | ✅ | ✅ | ✅ |
| i18n | 🔜 | ✅ | ✅ |
| Themes | ✅ | ✅ | ✅ |

## API Reference

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| \`build()\` | \`options: BuildOptions\` | \`Promise<void>\` | Builds the documentation |
| \`dev()\` | \`port?: number\` | \`Promise<Server>\` | Starts dev server |
| \`preview()\` | \`port?: number\` | \`Promise<Server>\` | Preview production build |
`
}

function generateImageDoc(index: number): string {
  return `---
title: Media Content ${index}
description: Image and media documentation
---

# Media Content ${index}

## Screenshots

![Dashboard](https://via.placeholder.com/800x400 "Dashboard Screenshot")

![Settings Page](https://via.placeholder.com/800x400 "Settings Screenshot")

## Architecture Diagram

![System Architecture](https://via.placeholder.com/1200x600 "Architecture Diagram")

## Icons and Logos

- ![Icon 1](https://via.placeholder.com/32x32)
- ![Icon 2](https://via.placeholder.com/32x32)
- ![Icon 3](https://via.placeholder.com/32x32)

## Video Embeds

\`\`\`html
<video src="demo.mp4" controls></video>
\`\`\`

## Custom Containers

::: info
This is an info box with an image inside.

![Info Image](https://via.placeholder.com/400x200)
:::

::: warning
This is a warning box with important information.
:::
`
}

/**
 * Clean up generated files
 */
export async function cleanupFiles(dir: string): Promise<void> {
  try {
    await fs.promises.rm(dir, { recursive: true, force: true })
  }
  catch {
    // Ignore errors
  }
}

/**
 * Measure memory usage
 */
export function measureMemory(): number {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage()
    return Math.round(usage.heapUsed / 1024 / 1024) // MB
  }
  return 0
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0)
    return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

/**
 * Format duration to human-readable time
 */
export function formatDuration(ms: number): string {
  if (ms < 1000)
    return `${ms.toFixed(2)}ms`
  if (ms < 60000)
    return `${(ms / 1000).toFixed(2)}s`
  return `${(ms / 60000).toFixed(2)}m`
}

/**
 * Get directory size
 */
export async function getDirectorySize(dir: string): Promise<number> {
  let size = 0

  try {
    const files = await fs.promises.readdir(dir, { withFileTypes: true })

    for (const file of files) {
      const filePath = path.join(dir, file.name)

      if (file.isDirectory()) {
        size += await getDirectorySize(filePath)
      }
      else {
        const stats = await fs.promises.stat(filePath)
        size += stats.size
      }
    }
  }
  catch {
    // Ignore errors
  }

  return size
}

/**
 * Count files in directory
 */
export async function countFiles(dir: string, extension?: string): Promise<number> {
  let count = 0

  try {
    const files = await fs.promises.readdir(dir, { withFileTypes: true })

    for (const file of files) {
      const filePath = path.join(dir, file.name)

      if (file.isDirectory()) {
        count += await countFiles(filePath, extension)
      }
      else if (!extension || file.name.endsWith(extension)) {
        count++
      }
    }
  }
  catch {
    // Ignore errors
  }

  return count
}
