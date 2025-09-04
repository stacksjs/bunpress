import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { markdown } from '../src/plugin'

const testDir = './examples/syntax-highlighting'
const outDir = './examples/syntax-highlighting/dist'

async function createSyntaxHighlightingExample() {
  try {
    // Create test directories
    await mkdir(testDir, { recursive: true })
    await mkdir(outDir, { recursive: true })

    // Create a comprehensive markdown file showcasing syntax highlighting features
    const markdownContent = `# Syntax Highlighting Showcase

This example demonstrates advanced syntax highlighting features including Shiki integration, copy-to-clipboard functionality, line numbers, and theme support.

## Basic Syntax Highlighting

### TypeScript Code

\`\`\`ts
interface User {
  name: string
  age: number
  email?: string
}

const user: User = {
  name: 'John Doe',
  age: 30,
  email: 'john@example.com'
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`
}

console.log(greet(user))
\`\`\`

### JavaScript Code

\`\`\`js
const { readFile } = require('fs').promises

async function readConfig() {
  try {
    const config = await readFile('./config.json', 'utf8')
    return JSON.parse(config)
  } catch (error) {
    console.error('Failed to read config:', error)
    return {}
  }
}
\`\`\`

### Python Code

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Example usage
result = fibonacci(10)
print(f"Fibonacci of 10: {result}")
\`\`\`

## Copy-to-Clipboard Functionality

Hover over any code block below and click the "Copy" button that appears in the top-right corner.

\`\`\`css
.highlighted {
  background-color: yellow;
  padding: 0.5em;
  border-radius: 0.375rem;
}

.error {
  color: red;
  font-weight: bold;
}
\`\`\`

## Line Numbers

### Basic Line Numbers

\`\`\`ts:line-numbers
function calculateTotal(items) {
  let total = 0
  for (const item of items) {
    total += item.price * item.quantity
  }
  return total
}

const items = [
  { name: 'Apple', price: 1.50, quantity: 3 },
  { name: 'Banana', price: 0.75, quantity: 2 }
]

console.log(calculateTotal(items))
\`\`\`

### Custom Starting Line Number

\`\`\`js:line-numbers=10
console.log('This starts at line 10')
console.log('This is line 11')
console.log('This is line 12')
console.log('This is line 13')
\`\`\`

## Line Highlighting

### Highlight Specific Lines

\`\`\`python {2,4-6}
def process_data(data):
    # This line is highlighted
    if not data:
        return None

    # These lines are highlighted
    processed = []
    for item in data:
        processed.append(item.upper())

    return processed
\`\`\`

### Combined Line Numbers and Highlighting

\`\`\`ts:line-numbers {3,7-9}
import { Component } from 'react'

interface Props {
  title: string
  items: string[]
}

export default function ListComponent({ title, items }: Props) {
  // This line is highlighted
  return (
    <div>
      <h2>{title}</h2>
      <ul>
        {/* These lines are highlighted */}
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
\`\`\`

## Multiple Languages

### Shell Script

\`\`\`bash
#!/bin/bash

# Build script
echo "Building project..."

# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build

echo "Build completed successfully!"
\`\`\`

### SQL Query

\`\`\`sql
-- Select active users with their profile information
SELECT
    u.id,
    u.username,
    u.email,
    p.first_name,
    p.last_name,
    u.created_at
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.active = true
    AND u.created_at >= '2023-01-01'
ORDER BY u.created_at DESC
LIMIT 100
\`\`\`

### JSON Configuration

\`\`\`json
{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "dev": "bun run dev",
    "build": "bun run build",
    "test": "bun test"
  },
  "dependencies": {
    "bunpress": "^0.9.0",
    "react": "^18.2.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0"
  }
}
\`\`\`

## Advanced Features

### Diff Highlighting

\`\`\`diff
+ const newFeature = 'This line was added'
+ const enhancedFunction = () => {
+   console.log('Enhanced functionality')
+ }

- const oldFeature = 'This line was removed'
- const basicFunction = () => {
-   console.log('Basic functionality')
- }

  const unchanged = 'This line stayed the same'
\`\`\`

### File Information

\`\`\`ts [src/utils/helpers.ts]
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
\`\`\`

### Title Information

\`\`\`js:title=config.js
module.exports = {
  port: process.env.PORT || 3000,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'myapp'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiresIn: '24h'
  }
}
\`\`\`

## Performance Features

This example includes performance optimizations like:

- **Syntax highlighting caching**: Code blocks are cached to avoid re-processing
- **Lazy loading**: Large code blocks can be virtualized for better performance
- **Optimized rendering**: Efficient DOM updates and minimal re-renders

## Theme Support

The syntax highlighting supports multiple themes:

- Light themes: \`light-plus\`, \`github-light\`
- Dark themes: \`dark-plus\`, \`github-dark\`, \`monokai\`

Theme switching can be implemented with CSS custom properties and JavaScript.

## Browser Compatibility

- **Modern browsers**: Full support for Clipboard API
- **Legacy browsers**: Fallback to \`document.execCommand\`
- **Progressive enhancement**: Graceful degradation for older browsers

## Accessibility

- **Keyboard navigation**: Copy buttons are keyboard accessible
- **Screen readers**: Proper ARIA labels and semantic HTML
- **High contrast**: Themes support high contrast mode
- **Focus indicators**: Clear focus states for interactive elements
`

    // Write the markdown file
    await writeFile(join(testDir, 'showcase.md'), markdownContent)

    // Create configuration for the build
    const buildConfig = {
      verbose: true,
      markdown: {
        title: 'Syntax Highlighting Showcase',
        meta: {
          description: 'Comprehensive showcase of syntax highlighting features including Shiki integration, copy-to-clipboard, line numbers, and themes',
          keywords: 'syntax highlighting, code blocks, copy clipboard, line numbers, themes',
          author: 'bunpress'
        },
        toc: {
          enabled: true,
          position: 'sidebar' as const,
          maxDepth: 3
        }
      }
    }

    console.log('Building syntax highlighting example...')

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

    console.log('\n🎉 Syntax highlighting example completed!')
    console.log('📖 Open the generated HTML file in your browser to see all the syntax highlighting features in action.')
    console.log('💡 Try hovering over code blocks to see the copy-to-clipboard buttons!')
    console.log('🔢 Check out the line numbers and highlighting features!')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Run the example
createSyntaxHighlightingExample()
