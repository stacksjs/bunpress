import { describe, expect, it } from 'bun:test'
import { startServer } from '../../../packages/bunpress/src/serve'

const TEST_MARKDOWN_DIR = './test/markdown/stx'
const BASE_PORT = 19001

describe('STX in Markdown', () => {
  describe('Server Scripts', () => {
    it('should evaluate <script server> and expose variables', async () => {
      const { server: _server, stop } = await startServer({ port: BASE_PORT, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-server-script.md`,
          `<script server>
const greeting = 'Hello from STX'
</script>

# {{ greeting }}`,
        )

        const response = await fetch(`http://localhost:${BASE_PORT}/test-server-script`)
        const html = await response.text()

        expect(html).toContain('Hello from STX')
        expect(html).not.toContain('{{ greeting }}')
        expect(html).not.toContain('<script server>')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-server-script.md`, '')
      }
    })

    it('should support computed values in server scripts', async () => {
      const { server: _server, stop } = await startServer({ port: BASE_PORT + 1, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-computed.md`,
          `<script server>
const items = ['Alpha', 'Beta', 'Gamma']
const count = items.length
</script>

There are {{ count }} items.`,
        )

        const response = await fetch(`http://localhost:${BASE_PORT + 1}/test-computed`)
        const html = await response.text()

        expect(html).toContain('There are 3 items.')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-computed.md`, '')
      }
    })
  })

  describe('Conditionals (@if/@else/@endif)', () => {
    it('should render @if block when condition is true', async () => {
      const { server: _server, stop } = await startServer({ port: BASE_PORT + 2, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-if-true.md`,
          `<script server>
const showSection = true
</script>

@if (showSection)
## Visible Section

This content is shown.
@endif`,
        )

        const response = await fetch(`http://localhost:${BASE_PORT + 2}/test-if-true`)
        const html = await response.text()

        expect(html).toContain('Visible Section')
        expect(html).toContain('This content is shown.')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-if-true.md`, '')
      }
    })

    it('should hide @if block when condition is false', async () => {
      const { server: _server, stop } = await startServer({ port: BASE_PORT + 3, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-if-false.md`,
          `<script server>
const showSection = false
</script>

@if (showSection)
## Hidden Section

This should not appear.
@endif

## Always Visible`,
        )

        const response = await fetch(`http://localhost:${BASE_PORT + 3}/test-if-false`)
        const html = await response.text()

        expect(html).not.toContain('Hidden Section')
        expect(html).not.toContain('This should not appear.')
        expect(html).toContain('Always Visible')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-if-false.md`, '')
      }
    })

    it('should support @if/@else blocks', async () => {
      const { server: _server, stop } = await startServer({ port: BASE_PORT + 4, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-if-else.md`,
          `<script server>
const isProduction = false
</script>

@if (isProduction)
Running in production mode.
@else
Running in development mode.
@endif`,
        )

        const response = await fetch(`http://localhost:${BASE_PORT + 4}/test-if-else`)
        const html = await response.text()

        expect(html).toContain('Running in development mode.')
        expect(html).not.toContain('Running in production mode.')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-if-else.md`, '')
      }
    })
  })

  describe('Loops (@foreach)', () => {
    it('should iterate over arrays with @foreach', async () => {
      const { server: _server, stop } = await startServer({ port: BASE_PORT + 5, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-foreach.md`,
          `<script server>
const tools = ['Bun', 'Node.js', 'Deno']
</script>

@foreach (tools as tool)
- {{ tool }}
@endforeach`,
        )

        const response = await fetch(`http://localhost:${BASE_PORT + 5}/test-foreach`)
        const html = await response.text()

        expect(html).toContain('Bun')
        expect(html).toContain('Node.js')
        expect(html).toContain('Deno')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-foreach.md`, '')
      }
    })

    it('should support index in @foreach', async () => {
      const { server: _server, stop } = await startServer({ port: BASE_PORT + 6, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-foreach-index.md`,
          `<script server>
const steps = ['Install', 'Configure', 'Deploy']
</script>

@foreach (steps as step, i)
{{ i + 1 }}. {{ step }}
@endforeach`,
        )

        const response = await fetch(`http://localhost:${BASE_PORT + 6}/test-foreach-index`)
        const html = await response.text()

        expect(html).toContain('1.')
        expect(html).toContain('Install')
        expect(html).toContain('2.')
        expect(html).toContain('Configure')
        expect(html).toContain('3.')
        expect(html).toContain('Deploy')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-foreach-index.md`, '')
      }
    })
  })

  describe('Expressions', () => {
    it('should evaluate {{ }} expressions', async () => {
      const { server: _server, stop } = await startServer({ port: BASE_PORT + 7, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-expressions.md`,
          `<script server>
const name = 'BunPress'
const version = '1.0.0'
</script>

Welcome to **{{ name }}** v{{ version }}.`,
        )

        const response = await fetch(`http://localhost:${BASE_PORT + 7}/test-expressions`)
        const html = await response.text()

        expect(html).toContain('BunPress')
        expect(html).toContain('1.0.0')
        expect(html).not.toContain('{{ name }}')
        expect(html).not.toContain('{{ version }}')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-expressions.md`, '')
      }
    })

    it('should support inline expressions in computed context', async () => {
      const { server: _server, stop } = await startServer({ port: BASE_PORT + 8, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-inline-expr.md`,
          `<script server>
const a = 10
const b = 20
</script>

The sum is {{ a + b }}.`,
        )

        const response = await fetch(`http://localhost:${BASE_PORT + 8}/test-inline-expr`)
        const html = await response.text()

        expect(html).toContain('The sum is 30.')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-inline-expr.md`, '')
      }
    })
  })

  describe('Frontmatter Integration', () => {
    it('should make frontmatter variables available in stx context', async () => {
      const { server: _server, stop } = await startServer({ port: BASE_PORT + 9, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-frontmatter.md`,
          `---
title: My Page
author: Chris
---

# {{ title }}

Written by {{ author }}.`,
        )

        const response = await fetch(`http://localhost:${BASE_PORT + 9}/test-frontmatter`)
        const html = await response.text()

        expect(html).toContain('My Page')
        expect(html).toContain('Written by Chris.')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-frontmatter.md`, '')
      }
    })
  })

  describe('Plain Markdown Compatibility', () => {
    it('should not break plain markdown without stx directives', async () => {
      const { server: _server, stop } = await startServer({ port: BASE_PORT + 10, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-plain.md`,
          `# Plain Markdown

This is **bold** and *italic* and \`inline code\`.

- List item 1
- List item 2

> A blockquote`,
        )

        const response = await fetch(`http://localhost:${BASE_PORT + 10}/test-plain`)
        const html = await response.text()

        expect(html).toContain('Plain Markdown')
        expect(html).toContain('<strong>bold</strong>')
        expect(html).toContain('<em>italic</em>')
        expect(html).toContain('<code>inline code</code>')
        expect(html).toContain('List item 1')
        expect(html).toContain('blockquote')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-plain.md`, '')
      }
    })
  })

  describe('Combined Features', () => {
    it('should support stx with markdown formatting', async () => {
      const { server: _server, stop } = await startServer({ port: BASE_PORT + 11, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-combined.md`,
          `<script server>
const features = [
  { name: 'Fast', desc: 'Built with Zig' },
  { name: 'Modern', desc: 'ES modules' },
]
const showFooter = true
</script>

# Features

@foreach (features as feature)
### {{ feature.name }}

{{ feature.desc }}

@endforeach

@if (showFooter)
---

*Generated dynamically with STX*
@endif`,
        )

        const response = await fetch(`http://localhost:${BASE_PORT + 11}/test-combined`)
        const html = await response.text()

        expect(html).toContain('Fast')
        expect(html).toContain('Built with Zig')
        expect(html).toContain('Modern')
        expect(html).toContain('ES modules')
        expect(html).toContain('Generated dynamically with STX')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-combined.md`, '')
      }
    })
  })
})
