#!/usr/bin/env bun
/**
 * Programmatic Usage Example
 *
 * This example demonstrates how to prepare BunPress documentation files
 * with proper frontmatter and configuration for building.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

// Example 1: Basic file generation
async function basicExample() {
  console.log('🧪 Running basic file generation example...')

  try {
    // Create output directory
    await mkdir('./examples/dist/programmatic-basic', { recursive: true })

    // Define source files with proper frontmatter
    const files = [
      {
        path: 'index.md',
        content: `---
title: Welcome
layout: home
description: Welcome to our documentation
---

# Welcome to My Docs

This is a programmatically generated documentation site.

## Features

- ⚡ Fast builds with Bun
- 📝 Markdown support
- 🎨 Customizable themes
- 🔍 Search functionality
        `,
      },
      {
        path: 'guide/getting-started.md',
        content: `---
title: Getting Started
description: Learn how to get started
author: BunPress Team
date: 2024-01-15
---

# Getting Started

Welcome to the guide!

## Installation

\`\`\`bash
bun install @stacksjs/bunpress
\`\`\`

## Basic Usage

\`\`\`typescript
// Configure your documentation
export default {
  markdown: {
    title: 'My Documentation'
  }
}
\`\`\`
        `,
      },
    ]

    // Process each file
    for (const file of files) {
      const inputPath = join('./examples/dist/programmatic-basic', file.path)

      // Ensure directory exists
      await mkdir(join(inputPath, '..'), { recursive: true })

      // Write input file
      await writeFile(inputPath, file.content)

      console.log(`📝 Generated ${file.path}`)
    }

    console.log('✅ Basic example completed successfully!')
    console.log(`📁 Generated ${files.length} files with frontmatter`)
  }
  catch (error) {
    console.error('❌ Basic example failed:', error.message)
  }
}

// Example 2: Advanced frontmatter usage
async function advancedExample() {
  console.log('🚀 Running advanced frontmatter example...')

  try {
    // Create output directory
    await mkdir('./examples/dist/programmatic-advanced', { recursive: true })

    const files = [
      {
        path: 'advanced/index.md',
        content: `---
title: Advanced Documentation
layout: home
description: Advanced BunPress features and configurations
hero:
  name: Advanced Docs
  text: Built programmatically
  tagline: With advanced frontmatter and configurations
themeConfig:
  colors:
    primary: '#10b981'
    secondary: '#6b7280'
nav:
  - text: Home
    link: /
  - text: API
    link: /api
sidebar:
  - text: Home
    link: /
  - text: API Reference
    link: /api
---

# Advanced Documentation

This example showcases advanced BunPress frontmatter features.
      `,
      },
      {
        path: 'advanced/api.md',
        content: `---
title: API Reference
description: Complete API reference documentation
toc: sidebar
tocTitle: API Contents
search:
  enabled: true
  placeholder: Search API...
themeConfig:
  colors:
    primary: '#8b5cf6'
---

# API Reference

## Core Functions

### markdown()

Creates a BunPress markdown plugin with custom options.

\`\`\`typescript
const plugin = markdown({
  title: 'My Documentation',
  meta: {
    description: 'API documentation',
    author: 'BunPress Team'
  },
  themeConfig: {
    colors: {
      primary: '#8b5cf6'
    }
  }
})
\`\`\`

### Parameters

- \`title\`: Default page title
- \`meta\`: HTML meta tags
- \`themeConfig\`: Theme customization options
      `,
      },
    ]

    // Process each file
    for (const file of files) {
      const inputPath = join('./examples/dist/programmatic-advanced', file.path)

      // Ensure directory exists
      await mkdir(join(inputPath, '..'), { recursive: true })

      // Write input file
      await writeFile(inputPath, file.content)

      console.log(`📝 Generated advanced file: ${file.path}`)
    }

    console.log('✅ Advanced example completed successfully!')
    console.log(`📁 Generated ${files.length} files with advanced frontmatter`)
  }
  catch (error) {
    console.error('❌ Advanced example failed:', error.message)
  }
}

// Example 3: File organization patterns
async function organizationExample() {
  console.log('📁 Running file organization example...')

  try {
    // Create output directory
    await mkdir('./examples/dist/programmatic-organization', { recursive: true })

    const files = [
      {
        path: 'docs/index.md',
        content: `---
title: Documentation Index
description: Main documentation index
---

# Documentation Index

Welcome to our organized documentation structure.
        `,
      },
      {
        path: 'docs/guide/getting-started.md',
        content: `---
title: Getting Started
description: Learn how to get started
---

# Getting Started

This guide is organized in the \`docs/guide/\` directory.
        `,
      },
      {
        path: 'docs/api/core.md',
        content: `---
title: Core API
description: Core API documentation
toc: sidebar
---

# Core API

API documentation organized in the \`docs/api/\` directory.
        `,
      },
      {
        path: 'docs/examples/basic.md',
        content: `---
title: Basic Examples
description: Basic usage examples
---

# Basic Examples

Examples organized in the \`docs/examples/\` directory.
        `,
      },
    ]

    // Process each file
    for (const file of files) {
      const inputPath = join('./examples/dist/programmatic-organization', file.path)

      // Ensure directory exists
      await mkdir(join(inputPath, '..'), { recursive: true })

      // Write input file
      await writeFile(inputPath, file.content)

      console.log(`📝 Generated organized file: ${file.path}`)
    }

    console.log('✅ File organization example completed successfully!')
    console.log(`📁 Generated ${files.length} organized files`)
  }
  catch (error) {
    console.error('❌ File organization example failed:', error.message)
  }
}

// Run all examples
async function runAllExamples() {
  console.log('🎯 Running all programmatic usage examples...\n')

  try {
    await basicExample()
    console.log()

    await advancedExample()
    console.log()

    await organizationExample()
    console.log()

    console.log('🎉 All examples completed successfully!')
  }
  catch (error) {
    console.error('💥 Example execution failed:', error)
    process.exit(1)
  }
}

// Export individual examples for testing
export {
  advancedExample,
  basicExample,
  organizationExample,
}

// Run examples if executed directly
if (import.meta.main) {
  runAllExamples()
}
