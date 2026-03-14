import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { logError, logSuccess } from '../utils'

interface NewOptions {
  title?: string
  template?: string
  verbose?: boolean
}

const TEMPLATES = {
  default: (title: string) => `---
title: ${title}
description:
---

# ${title}

Your content goes here...
`,

  guide: (title: string) => `---
title: ${title}
description: ${title} guide
---

# ${title}

## Introduction

Brief introduction to the topic.

## Getting Started

Step-by-step instructions.

## Examples

\`\`\`typescript
// Example code
\`\`\`

## Next Steps

- [ ] Task 1
- [ ] Task 2
`,

  api: (title: string) => `---
title: ${title}
description: API reference for ${title}
---

# ${title}

## Overview

Brief overview of the API.

## Methods

### \`methodName()\`

Description of the method.

**Parameters:**

- \`param1\` (\`type\`) - Description

**Returns:**

- \`ReturnType\` - Description

**Example:**

\`\`\`typescript
// Example usage
\`\`\`
`,

  blog: (title: string) => `---
title: ${title}
description:
date: ${new Date().toISOString().split('T')[0]}
author:
tags: []
---

# ${title}

Post content goes here...

## Section 1

Content...
`,
}

/**
 * Create a new markdown file
 */
export async function newCommand(path: string, options: NewOptions = {}): Promise<boolean> {
  try {
    // Normalize path
    const fullPath = path.endsWith('.md') ? path : `${path}.md`
    const filePath = join(process.cwd(), 'docs', fullPath)

    // Check if file already exists
    const exists = await Bun.file(filePath).exists()
    if (exists) {
      logError(`File already exists: ${fullPath}`)
      return false
    }

    // Get title (from option or prompt)
    let title = options.title
    if (!title) {
      // Extract title from path
      const basename = fullPath.split('/').pop()?.replace('.md', '') || ''
      title = basename
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    // Get template
    const template = options.template || 'default'
    const templateFn = TEMPLATES[template as keyof typeof TEMPLATES]

    if (!templateFn) {
      logError(`Unknown template: ${template}`)
      logError(`Available templates: ${Object.keys(TEMPLATES).join(', ')}`)
      return false
    }

    // Generate content
    const content = templateFn(title)

    // Create directory if needed
    const dir = dirname(filePath)
    await mkdir(dir, { recursive: true })

    // Write file
    await Bun.write(filePath, content)

    logSuccess(`Created ${fullPath}`)
    console.log()
    console.log(`  Title: ${title}`)
    console.log(`  Template: ${template}`)
    console.log(`  Path: ${filePath}`)

    return true
  }
  catch (err) {
    logError(`Failed to create file: ${err}`)
    return false
  }
}
