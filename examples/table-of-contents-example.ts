import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { markdown } from '../src/plugin'

const testDir = './examples/table-of-contents'
const outDir = './examples/table-of-contents/dist'

async function createTableOfContentsExample() {
  try {
    // Create test directories
    await mkdir(testDir, { recursive: true })
    await mkdir(outDir, { recursive: true })

    // Create a comprehensive markdown file demonstrating TOC features
    const tocShowcaseContent = `---
title: Table of Contents Showcase
description: Comprehensive demonstration of TOC features in bunpress
toc:
  enabled: true
  position: [sidebar, inline]
  title: "Navigation"
  maxDepth: 4
  minDepth: 2
---

# Table of Contents Showcase

This comprehensive example demonstrates all Table of Contents features in bunpress.

## Introduction

Welcome to the Table of Contents showcase! This document demonstrates:

- Automatic TOC generation from headings
- Multiple TOC positioning options
- Custom TOC configuration
- Interactive features
- Edge case handling

## TOC Generation

### Basic TOC Generation

The TOC is automatically generated from all headings in your markdown document.

#### Heading Levels

- H1 headings (#) are typically page titles
- H2 headings (##) are major sections
- H3 headings (###) are subsections
- H4 headings (####) are sub-subsections
- H5 and H6 headings are also supported

### Heading Anchors

Each heading automatically gets an anchor link for direct navigation.

#### Special Characters in Anchors

Headings with special characters are properly slugified:

- **What's New? (v2.0)** → \`#whats-new-v20\`
- **Features & Benefits** → \`#features-benefits\`
- **Vue.js + TypeScript = ❤️** → \`#vue-js-typescript\`

## TOC Positioning

### Sidebar TOC

The sidebar TOC is positioned on the left side of the page and remains visible while scrolling.

### Inline TOC

[[toc]]

You can also include TOC inline within your content using the \`[[toc]]\` syntax.

### Floating TOC

---
toc: floating
---

Floating TOCs appear as overlay elements, perfect for mobile devices.

## TOC Customization

### Custom TOC Title

You can customize the TOC title in frontmatter:

\`\`\`yaml
toc:
  title: "Contents"
\`\`\`

### Depth Control

Control which heading levels appear in the TOC:

\`\`\`yaml
toc:
  minDepth: 2  # Start from H2
  maxDepth: 4  # Go up to H4
\`\`\`

### Excluding Headings

Exclude specific headings from TOC:

\`\`\`yaml
toc:
  exclude:
    - "Private API"
    - "Internal Notes"
\`\`\`

Or use HTML comments:

## Regular Heading

<!-- toc-ignore -->

## Excluded Heading

This heading won't appear in the TOC.

## Interactive Features

### Smooth Scrolling

TOC links use smooth scrolling for better user experience.

### Active Item Highlighting

The currently visible section is automatically highlighted in the TOC.

### Collapsible Sections

Deep TOC hierarchies can be collapsed/expanded for better navigation.

## Advanced Usage

### Multiple TOC Positions

You can have multiple TOCs on the same page:

\`\`\`yaml
toc:
  position: [sidebar, inline]
\`\`\`

### Custom Styling

TOC elements have semantic CSS classes for easy customization:

- \`.table-of-contents\` - Main TOC container
- \`.toc-title\` - TOC title
- \`.toc-list\` - Main list
- \`.toc-sublist\` - Nested lists
- \`.toc-link\` - Individual links
- \`.toc-active\` - Active item

## Edge Cases

### Empty Headings

## Valid Heading

###

Invalid empty heading above won't appear in TOC.

### Very Long Headings

## A Very Long Heading Title That Might Cause Issues With Display And Should Be Handled Gracefully By The TOC Generation System

Long headings are properly handled and truncated if necessary.

### Code in Headings

## Function \`processUserInput()\` Documentation

Headings with inline code are properly processed for anchor generation.

## Performance Features

### Lazy Loading

TOC items are only processed when needed for better performance.

### Optimized Rendering

Efficient DOM updates ensure smooth scrolling and highlighting.

## Integration Examples

### With Custom Containers

::: info
This info box contains information about TOC integration.
:::

### With Math Equations

The formula $E = mc^2$ is fundamental to modern physics.

$$\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}$$

### With Code Blocks

\`\`\`typescript {1,3-5}
function initToc() {
  // Initialize TOC functionality  // highlighted
  const links = document.querySelectorAll('.toc-link')

  links.forEach(link => {  // highlighted
    link.addEventListener('click', handleClick)  // highlighted
  })
}
\`\`\`

## Conclusion

This showcase demonstrates the comprehensive TOC capabilities of bunpress:

- ✅ Automatic generation from headings
- ✅ Multiple positioning options
- ✅ Customizable appearance and behavior
- ✅ Interactive features
- ✅ Edge case handling
- ✅ Performance optimizations

---

*Built with bunpress - Table of Contents powered by Bun.*
`

    await writeFile(join(testDir, 'toc-showcase.md'), tocShowcaseContent)

    // Create additional example files
    const sidebarExample = `---
title: Sidebar TOC Example
toc:
  enabled: true
  position: sidebar
  title: "Page Contents"
---

# Sidebar TOC Example

This page demonstrates a sidebar TOC.

## Section 1

Content for section 1.

### Subsection 1.1

More detailed content.

### Subsection 1.2

Even more content.

## Section 2

Content for section 2.

### Subsection 2.1

Nested content here.

#### Deep Subsection 2.1.1

Very detailed information.
`

    const inlineExample = `---
title: Inline TOC Example
toc:
  enabled: true
  position: inline
---

# Inline TOC Example

This page demonstrates an inline TOC.

## Introduction

Welcome to the inline TOC example.

[[toc]]

## Main Content

After the TOC, here's the main content.

### Subsection A

Content in subsection A.

### Subsection B

Content in subsection B.

## Conclusion

This concludes the inline TOC example.
`

    const floatingExample = `---
title: Floating TOC Example
toc:
  enabled: true
  position: floating
---

# Floating TOC Example

This page demonstrates a floating TOC (best viewed on mobile or small screens).

## Section 1

Content for section 1.

### Subsection 1.1

More content.

### Subsection 1.2

Even more content.

## Section 2

Content for section 2.

### Subsection 2.1

Additional content.

## Section 3

Final section content.
`

    await writeFile(join(testDir, 'sidebar-toc.md'), sidebarExample)
    await writeFile(join(testDir, 'inline-toc.md'), inlineExample)
    await writeFile(join(testDir, 'floating-toc.md'), floatingExample)

    console.log('Building table of contents examples...')

    // Build all the example files
    const entrypoints = [
      join(testDir, 'toc-showcase.md'),
      join(testDir, 'sidebar-toc.md'),
      join(testDir, 'inline-toc.md'),
      join(testDir, 'floating-toc.md'),
    ]

    const result = await Bun.build({
      entrypoints,
      outdir: outDir,
      plugins: [markdown({
        title: 'TOC Examples',
        meta: {
          description: 'Comprehensive Table of Contents examples',
          author: 'bunpress',
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

    console.log('✅ Build successful!')
    console.log('📁 Output files:')
    for (const output of result.outputs) {
      console.log(`  - ${output.path}`)
    }

    console.log('\n📂 Generated files:')
    const files = await readdir(outDir)
    for (const file of files) {
      console.log(`  - ${file}`)
    }

    console.log('\n🎉 Table of Contents examples completed!')
    console.log('📖 Open the generated HTML files in your browser to explore different TOC configurations:')
    console.log('  - toc-showcase.html - Complete feature showcase')
    console.log('  - sidebar-toc.html - Sidebar TOC example')
    console.log('  - inline-toc.html - Inline TOC example')
    console.log('  - floating-toc.html - Floating TOC example')
  }
  catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
  finally {
    console.log('\n📁 Example files are in:', testDir)
    console.log('📁 Built files are in:', outDir)
  }
}

createTableOfContentsExample()
