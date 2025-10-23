import { describe, expect, it } from 'bun:test'
import { startServer } from '../../../src/serve'

const TEST_MARKDOWN_DIR = './test/markdown/code'

describe('Code Groups (Tabs)', () => {
  describe('Basic Code Groups', () => {
    it('should render code group with two tabs', async () => {
      const { server, stop } = await startServer({ port: 11001, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-code-group-basic.md`,
          `::: code-group
\`\`\`js [config.js]
export default {
  foo: 'bar'
}
\`\`\`

\`\`\`ts [config.ts]
export default {
  foo: 'bar'
}
\`\`\`
:::`,
        )

        const response = await fetch('http://localhost:11001/test-code-group-basic')
        const html = await response.text()

        // Should have code-group container
        expect(html).toContain('class="code-group"')

        // Should have tabs
        expect(html).toContain('class="code-group-tabs"')
        expect(html).toContain('config.js')
        expect(html).toContain('config.ts')

        // Should have panels
        expect(html).toContain('class="code-group-panels"')

        // First tab should be active
        expect(html).toContain('code-group-tab active')
        expect(html).toContain('code-group-panel active')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-code-group-basic.md`, '')
      }
    })

    it('should render code group with three tabs', async () => {
      const { server, stop } = await startServer({ port: 11002, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-code-group-three.md`,
          `::: code-group
\`\`\`js [JavaScript]
const x = 1
\`\`\`

\`\`\`ts [TypeScript]
const x: number = 1
\`\`\`

\`\`\`py [Python]
x = 1
\`\`\`
:::`,
        )

        const response = await fetch('http://localhost:11002/test-code-group-three')
        const html = await response.text()

        // Should have all three tabs
        expect(html).toContain('JavaScript')
        expect(html).toContain('TypeScript')
        expect(html).toContain('Python')

        // Should have three panels (check for data-panel attributes)
        const panelCount = (html.match(/data-panel="/g) || []).length
        expect(panelCount).toBe(3)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-code-group-three.md`, '')
      }
    })
  })

  describe('Code Content', () => {
    it('should preserve code content correctly', async () => {
      const { server, stop } = await startServer({ port: 11003, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-code-group-content.md`,
          `::: code-group
\`\`\`js [index.js]
const greeting = "Hello World"
console.log(greeting)
\`\`\`

\`\`\`ts [index.ts]
const greeting: string = "Hello World"
console.log(greeting)
\`\`\`
:::`,
        )

        const response = await fetch('http://localhost:11003/test-code-group-content')
        const html = await response.text()

        // Should contain code content (HTML escaped)
        expect(html).toContain('const greeting')
        expect(html).toContain('console.log')
        expect(html).toContain('&quot;Hello World&quot;')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-code-group-content.md`, '')
      }
    })

    it('should handle HTML entities in code', async () => {
      const { server, stop } = await startServer({ port: 11004, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-code-group-html.md`,
          `::: code-group
\`\`\`html [template.html]
<div class="container">
  <p>Hello & Welcome</p>
</div>
\`\`\`

\`\`\`jsx [Component.jsx]
<div className="container">
  <p>Hello & Welcome</p>
</div>
\`\`\`
:::`,
        )

        const response = await fetch('http://localhost:11004/test-code-group-html')
        const html = await response.text()

        // Should escape HTML entities
        expect(html).toContain('&lt;div')
        expect(html).toContain('&gt;')
        expect(html).toContain('&amp;')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-code-group-html.md`, '')
      }
    })
  })

  describe('Tab Labels', () => {
    it('should support custom tab labels', async () => {
      const { server, stop } = await startServer({ port: 11005, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-code-group-labels.md`,
          `::: code-group
\`\`\`js [npm]
npm install package
\`\`\`

\`\`\`js [yarn]
yarn add package
\`\`\`

\`\`\`js [pnpm]
pnpm add package
\`\`\`
:::`,
        )

        const response = await fetch('http://localhost:11005/test-code-group-labels')
        const html = await response.text()

        // Should have custom labels
        expect(html).toContain('>npm<')
        expect(html).toContain('>yarn<')
        expect(html).toContain('>pnpm<')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-code-group-labels.md`, '')
      }
    })
  })

  describe('Language Classes', () => {
    it('should add correct language classes', async () => {
      const { server, stop } = await startServer({ port: 11006, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-code-group-languages.md`,
          `::: code-group
\`\`\`javascript [JS]
const x = 1
\`\`\`

\`\`\`typescript [TS]
const x: number = 1
\`\`\`
:::`,
        )

        const response = await fetch('http://localhost:11006/test-code-group-languages')
        const html = await response.text()

        // Should have language classes
        expect(html).toContain('class="language-javascript"')
        expect(html).toContain('class="language-typescript"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-code-group-languages.md`, '')
      }
    })
  })

  describe('JavaScript Functionality', () => {
    it('should include switchCodeTab function', async () => {
      const { server, stop } = await startServer({ port: 11007, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-code-group-js.md`,
          `::: code-group
\`\`\`js [A]
const a = 1
\`\`\`

\`\`\`js [B]
const b = 2
\`\`\`
:::`,
        )

        const response = await fetch('http://localhost:11007/test-code-group-js')
        const html = await response.text()

        // Should have switchCodeTab function
        expect(html).toContain('function switchCodeTab')
        expect(html).toContain('onclick="switchCodeTab')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-code-group-js.md`, '')
      }
    })
  })

  describe('Multiple Code Groups', () => {
    it('should handle multiple code groups on same page', async () => {
      const { server, stop } = await startServer({ port: 11008, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-code-group-multiple.md`,
          `::: code-group
\`\`\`js [A]
const a = 1
\`\`\`

\`\`\`ts [B]
const a: number = 1
\`\`\`
:::

Some text

::: code-group
\`\`\`py [Python]
a = 1
\`\`\`

\`\`\`rb [Ruby]
a = 1
\`\`\`
:::`,
        )

        const response = await fetch('http://localhost:11008/test-code-group-multiple')
        const html = await response.text()

        // Should have two code groups
        const groupCount = (html.match(/<div class="code-group"/g) || []).length
        expect(groupCount).toBe(2)

        // Each should have unique IDs
        expect(html).toContain('id="code-group-')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-code-group-multiple.md`, '')
      }
    })
  })

  describe('Mixed with Regular Content', () => {
    it('should work alongside regular markdown', async () => {
      const { server, stop } = await startServer({ port: 11009, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-code-group-mixed.md`,
          `# Heading

Regular paragraph

::: code-group
\`\`\`js [JS]
const x = 1
\`\`\`

\`\`\`ts [TS]
const x: number = 1
\`\`\`
:::

Another paragraph`,
        )

        const response = await fetch('http://localhost:11009/test-code-group-mixed')
        const html = await response.text()

        // Should have heading
        expect(html).toContain('<h1')

        // Should have paragraphs
        expect(html).toContain('Regular paragraph')
        expect(html).toContain('Another paragraph')

        // Should have code group
        expect(html).toContain('class="code-group"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-code-group-mixed.md`, '')
      }
    })
  })
})
