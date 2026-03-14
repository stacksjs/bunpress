import { mkdir } from 'node:fs/promises'
import { confirm, logError, logInfo, logSuccess, Spinner } from '../utils'

interface InitOptions {
  name?: string
  template?: string
  force?: boolean
}

const DEFAULT_CONFIG = `import type { BunPressConfig } from '@stacksjs/bunpress'

export default {
  verbose: false,

  markdown: {
    toc: {
      enabled: true,
      position: 'sidebar',
      minDepth: 2,
      maxDepth: 3,
    },
    features: {
      inlineFormatting: true,
      containers: true,
      githubAlerts: true,
      codeBlocks: {
        lineNumbers: true,
        lineHighlighting: true,
        focus: true,
        diff: true,
        errorWarning: true,
      },
      codeGroups: true,
      codeImports: true,
      inlineToc: true,
      customAnchors: true,
      emoji: true,
      badges: true,
      includes: true,
      externalLinks: {
        enabled: true,
        openInNewTab: true,
        addIcon: true,
      },
      imageLazyLoading: true,
      tables: {
        responsive: true,
        striped: true,
        hover: true,
      },
    },
  },

  nav: [
    { text: 'Home', link: '/' },
    { text: 'Guide', link: '/guide/' },
    { text: 'GitHub', link: 'https://github.com/stacksjs/bunpress' },
  ],

  sitemap: {
    hostname: 'https://example.com',
  },
} satisfies BunPressConfig
`

const DEFAULT_INDEX_MD = `---
layout: home
title: Welcome to My Documentation

hero:
  name: My Project
  text: Modern documentation made easy
  tagline: Fast, flexible, and beautiful documentation powered by BunPress
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: View on GitHub
      link: https://github.com/yourusername/your-repo

features:
  - icon: ⚡
    title: Lightning Fast
    details: Powered by Bun runtime for incredible build and dev server performance
  - icon: 🎨
    title: Beautiful by Default
    details: Clean, modern design with dark mode support out of the box
  - icon: 📝
    title: Markdown Enhanced
    details: Extended markdown features including containers, code groups, and more
---

# Welcome

This is your new BunPress documentation site. Start editing files in the \`docs/\` directory to customize your content.
`

const DEFAULT_GUIDE_MD = `# Getting Started

Welcome to the getting started guide!

## Installation

\`\`\`bash
bun install @stacksjs/bunpress
\`\`\`

## Quick Start

Create your first documentation page:

\`\`\`bash
bunpress new my-page
\`\`\`

## Next Steps

::: tip
Check out the [markdown extensions](/guide/markdown) to learn about all the powerful features available.
:::

- Learn about [configuration](/guide/configuration)
- Explore [advanced features](/guide/advanced)
- Read the [API reference](/api/)
`

const DEFAULT_GITIGNORE = `node_modules/
dist/
.DS_Store
*.log
.env
.env.*
!.env.example
`

const DEFAULT_README = `# My BunPress Documentation

Documentation powered by [BunPress](https://github.com/stacksjs/bunpress).

## Development

Start the dev server:

\`\`\`bash
bun run dev
\`\`\`

## Build

Build the documentation:

\`\`\`bash
bun run build
\`\`\`

## Preview

Preview the built site:

\`\`\`bash
bun run preview
\`\`\`
`

/**
 * Initialize a new BunPress project
 */
export async function initCommand(options: InitOptions = {}): Promise<boolean> {
  try {
    // Check if docs directory already exists
    const docsExists = await Bun.file('./docs').exists()

    if (docsExists && !options.force) {
      const shouldContinue = await confirm(
        'Documentation directory already exists. Continue?',
        false,
      )

      if (!shouldContinue) {
        logInfo('Initialization cancelled')
        return false
      }
    }

    const spinner = new Spinner('Initializing BunPress project...')
    spinner.start()

    // Create directory structure
    await mkdir('./docs', { recursive: true })
    await mkdir('./docs/guide', { recursive: true })
    await mkdir('./docs/public', { recursive: true })

    // Create config file
    await Bun.write('./bunpress.config.ts', DEFAULT_CONFIG)

    // Create documentation files
    await Bun.write('./docs/index.md', DEFAULT_INDEX_MD)
    await Bun.write('./docs/guide/index.md', DEFAULT_GUIDE_MD)

    // Create .gitignore if it doesn't exist
    const gitignoreExists = await Bun.file('./.gitignore').exists()
    if (!gitignoreExists) {
      await Bun.write('./.gitignore', DEFAULT_GITIGNORE)
    }

    // Create README if it doesn't exist
    const readmeExists = await Bun.file('./README.md').exists()
    if (!readmeExists) {
      await Bun.write('./README.md', DEFAULT_README)
    }

    // Update package.json with scripts if it exists
    const packageJsonPath = './package.json'
    const packageJsonExists = await Bun.file(packageJsonPath).exists()

    if (packageJsonExists) {
      const packageJson = await Bun.file(packageJsonPath).json()

      packageJson.scripts = packageJson.scripts || {}
      packageJson.scripts.dev = packageJson.scripts.dev || 'bunpress dev'
      packageJson.scripts.build = packageJson.scripts.build || 'bunpress build'
      packageJson.scripts.preview = packageJson.scripts.preview || 'bunpress preview'

      await Bun.write(packageJsonPath, JSON.stringify(packageJson, null, 2))
    }

    spinner.succeed('BunPress project initialized successfully!')

    console.log()
    logSuccess('Created files:')
    console.log('  • bunpress.config.ts')
    console.log('  • docs/index.md')
    console.log('  • docs/guide/index.md')
    console.log('  • docs/public/')

    if (!gitignoreExists) {
      console.log('  • .gitignore')
    }

    if (!readmeExists) {
      console.log('  • README.md')
    }

    console.log()
    logInfo('Next steps:')
    console.log('  1. Install BunPress: bun add @stacksjs/bunpress')
    console.log('  2. Start dev server: bun run dev')
    console.log('  3. Edit docs/index.md to customize your home page')

    return true
  }
  catch (err) {
    logError(`Failed to initialize project: ${err}`)
    return false
  }
}
