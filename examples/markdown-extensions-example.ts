import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { markdown } from '../src/plugin'

const testDir = './examples/markdown-extensions'
const outDir = './examples/markdown-extensions/dist'

async function createMarkdownExtensionsExample() {
  try {
    // Create test directories
    await mkdir(testDir, { recursive: true })
    await mkdir(outDir, { recursive: true })

    // Create a comprehensive markdown file with all extensions
    const markdownContent = `# Markdown Extensions Showcase

This example demonstrates all the enhanced markdown processing features available in bunpress.

## Custom Containers

### Info Container
::: info
This is an informational message that provides helpful context to users.
:::

### Tip Container
::: tip
💡 **Pro tip:** Use keyboard shortcuts to speed up your workflow!
:::

### Warning Container
::: warning
⚠️ **Warning:** This action cannot be undone. Please proceed with caution.
:::

### Danger Container
::: danger
🚨 **Danger:** This operation will permanently delete all data.
:::

### Details Container
::: details
This is a collapsible details section. Click to expand/collapse.
:::

## Emoji Support

I :heart: working with markdown and :thumbsup: these features!

### Emoji in Headings
## Getting Started :rocket:

### Multiple Emojis
:smile: :heart: :thumbsup: :rocket: :sparkles:

## Math Equations

### Inline Math
The famous equation $E = mc^2$ shows the relationship between energy and mass.

### Block Math
The quadratic formula is:

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

### Complex Math
Maxwell's equations in differential form:

$$\\nabla \\times \\vec{\\mathbf{E}} = -\\frac{\\partial \\vec{\\mathbf{B}}}{\\partial t}$$

## Line Highlighting

### Basic Line Highlighting
\`\`\`typescript {1,3-5}
const greeting = 'Hello World!'  // highlighted
const name = 'bunpress'

console.log(greeting)  // highlighted
console.log('Welcome to ' + name)  // highlighted
console.log('Enjoy coding!')  // highlighted

const farewell = 'Goodbye!'
\`\`\`

### Line Numbers with Highlighting
\`\`\`typescript:line-numbers {2}
function greetUser(name: string) {
  const message = \`Hello, \${name}!\`  // highlighted
  console.log(message)
  return message
}
\`\`\`

### Range Highlighting
\`\`\`python {1-3,5}
def calculate_area(radius):
    import math  # highlighted
    pi = math.pi  # highlighted
    area = pi * radius ** 2  # highlighted
    return area

result = calculate_area(5)  # highlighted
print(f"Area: {result}")
\`\`\`

## Combined Extensions

### Emoji in Containers
::: tip :bulb:
This tip contains both emoji :thumbsup: and styling!
:::

### Math in Containers
::: info
The formula $a^2 + b^2 = c^2$ is the Pythagorean theorem.

$$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$
:::

### Code with Line Highlighting in Containers
::: warning
Here's some code with line highlighting:

\`\`\`javascript {1,3}
const config = {  // highlighted
  debug: false,
  port: 3000  // highlighted
}
\`\`\`
:::

## Advanced Features

### Nested Lists with Code
1. First item
   - Sub item with \`inline code\`
   - Another sub item
2. Second item
   - Code block:
     \`\`\`bash
     npm install bunpress
     \`\`\`

### Tables with Markdown
| Feature | Status | Description |
|---------|--------|-------------|
| Custom Containers | ✅ | Working perfectly |
| Emoji Support | ✅ | Full Unicode support |
| Math Equations | ✅ | LaTeX rendering |
| Line Highlighting | ✅ | Advanced syntax |

### Links and References
- [Internal link](#markdown-extensions-showcase)
- [External link](https://github.com/stacksjs/stx)
- [Reference-style link][ref]

[ref]: https://github.com/stacksjs/bunpress

## Footer

This example showcases all the enhanced markdown features. Try building this file to see the results!

---

*Built with bunpress - Modern documentation engine powered by Bun.*
`

    await writeFile(join(testDir, 'showcase.md'), markdownContent)

    // Create a build configuration
    const buildConfig = {
      title: 'Markdown Extensions Showcase',
      meta: {
        description: 'Comprehensive showcase of enhanced markdown processing features',
        keywords: 'markdown, documentation, showcase, extensions',
        author: 'bunpress'
      },
      toc: {
        enabled: true,
        position: ['sidebar'],
        maxDepth: 3
      }
    }

    console.log('Building markdown extensions example...')

    // Build the markdown file
    const result = await Bun.build({
      entrypoints: [join(testDir, 'showcase.md')],
      outdir: outDir,
      plugins: [markdown(buildConfig)]
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

    console.log('\n🎉 Example completed!')
    console.log('📖 Open the generated HTML file in your browser to see all the markdown extensions in action.')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    // Note: Not cleaning up automatically so user can examine the output
    console.log('\n📁 Example files are in:', testDir)
    console.log('📁 Built files are in:', outDir)
  }
}

createMarkdownExtensionsExample()
