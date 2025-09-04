import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { markdown } from '../src/plugin'

const testDir = './examples/simple-syntax-highlighting'
const outDir = './examples/simple-syntax-highlighting/dist'

async function createSimpleSyntaxHighlightingExample() {
  try {
    // Create test directories
    await mkdir(testDir, { recursive: true })
    await mkdir(outDir, { recursive: true })

    // Create a simple markdown file with basic syntax highlighting
    const markdownContent = `# Simple Syntax Highlighting Example

This is a basic example showing syntax highlighting with copy-to-clipboard functionality.

## TypeScript Example

\`\`\`ts
interface Person {
  name: string
  age: number
}

const person: Person = {
  name: 'Alice',
  age: 30
}

console.log(\`Hello, \${person.name}!\`)
\`\`\`

## JavaScript Example

\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`
}

console.log(greet('World'))
\`\`\`

## Python Example

\`\`\`python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))
\`\`\`

## With Line Numbers

\`\`\`ts:line-numbers
function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

console.log(fibonacci(10))
\`\`\`

## With Line Highlighting

\`\`\`js {2,4}
function calculate(x, y) {
  // This line is highlighted
  const sum = x + y
  // This line is also highlighted
  return sum * 2
}
\`\`\`
`

    // Write the markdown file
    await writeFile(join(testDir, 'example.md'), markdownContent)

    // Create configuration
    const buildConfig = {
      verbose: true,
      markdown: {
        title: 'Simple Syntax Highlighting',
        meta: {
          description: 'Basic syntax highlighting example',
          author: 'bunpress'
        }
      }
    }

    console.log('Building simple syntax highlighting example...')

    // Build the markdown file
    const result = await Bun.build({
      entrypoints: [join(testDir, 'example.md')],
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
    console.log('🎉 Simple syntax highlighting example completed!')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Run the example
createSimpleSyntaxHighlightingExample()
