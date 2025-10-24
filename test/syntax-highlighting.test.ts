import { describe, expect, it } from 'bun:test'
import { getSyntaxHighlightingStyles, highlightCode, isLanguageSupported, normalizeLanguage } from '../src/highlighter'

describe('syntax highlighting', () => {
  describe('normalizeLanguage', () => {
    it('should normalize language aliases', () => {
      expect(normalizeLanguage('js')).toBe('javascript')
      expect(normalizeLanguage('ts')).toBe('typescript')
      expect(normalizeLanguage('jsx')).toBe('javascript')
      expect(normalizeLanguage('tsx')).toBe('typescript')
    })

    it('should handle unknown languages', () => {
      expect(normalizeLanguage('unknown')).toBe('unknown')
      expect(normalizeLanguage('plaintext')).toBe('plaintext')
    })

    it('should be case-insensitive', () => {
      expect(normalizeLanguage('JavaScript')).toBe('javascript')
      expect(normalizeLanguage('TypeScript')).toBe('typescript')
      expect(normalizeLanguage('HTML')).toBe('html')
    })
  })

  describe('isLanguageSupported', () => {
    it('should return true for supported languages', () => {
      expect(isLanguageSupported('javascript')).toBe(true)
      expect(isLanguageSupported('typescript')).toBe(true)
      expect(isLanguageSupported('html')).toBe(true)
      expect(isLanguageSupported('css')).toBe(true)
      expect(isLanguageSupported('json')).toBe(true)
      expect(isLanguageSupported('stx')).toBe(true)
    })

    it('should return true for language aliases', () => {
      expect(isLanguageSupported('js')).toBe(true)
      expect(isLanguageSupported('ts')).toBe(true)
      expect(isLanguageSupported('jsx')).toBe(true)
      expect(isLanguageSupported('tsx')).toBe(true)
    })

    it('should return false for unsupported languages', () => {
      expect(isLanguageSupported('cobol')).toBe(false)
      expect(isLanguageSupported('fortran')).toBe(false)
    })
  })

  describe('highlightCode', () => {
    it('should highlight JavaScript code', async () => {
      const code = `const greeting = 'Hello World'
console.log(greeting)`

      const html = await highlightCode(code, 'javascript')

      // Should return HTML (not just escaped text)
      expect(html).toBeTruthy()

      // Should preserve code structure
      expect(html).toContain('greeting')
      expect(html).toContain('Hello World')
    })

    it('should highlight TypeScript code with types', async () => {
      const code = `function add(a: number, b: number): number {
  return a + b
}`

      const html = await highlightCode(code, 'typescript')

      // Should preserve function structure
      expect(html).toContain('add')
      expect(html).toContain('number')
    })

    it('should highlight HTML code', async () => {
      const code = `<div class="container">
  <h1>Hello</h1>
</div>`

      const html = await highlightCode(code, 'html')

      // Should escape HTML entities
      expect(html).toContain('&lt;')
      expect(html).toContain('&gt;')
    })

    it('should highlight CSS code', async () => {
      const code = `.container {
  display: flex;
  color: #333;
}`

      const html = await highlightCode(code, 'css')

      // Should preserve code structure
      expect(html).toContain('container')
      expect(html).toContain('flex')
    })

    it('should highlight JSON code', async () => {
      const code = `{
  "name": "test",
  "version": "1.0.0"
}`

      const html = await highlightCode(code, 'json')

      // Should preserve code structure
      expect(html).toContain('name')
      expect(html).toContain('test')
    })

    it('should escape HTML for unsupported languages', async () => {
      const code = '<script>alert("xss")</script>'

      const html = await highlightCode(code, 'unsupported')

      // Should escape HTML entities
      expect(html).toContain('&lt;script&gt;')
      expect(html).not.toContain('<script>')
    })

    it('should handle empty code', async () => {
      const html = await highlightCode('', 'javascript')
      expect(html).toBeDefined()
    })

    it('should handle code with special characters', async () => {
      const code = 'const str = "Hello & <world>"'

      const html = await highlightCode(code, 'javascript')

      // Should escape special characters properly
      expect(html).toBeTruthy()
      expect(html).toContain('Hello')
    })

    it('should handle multiline code', async () => {
      const code = `function test() {
  const x = 1
  const y = 2
  return x + y
}`

      const html = await highlightCode(code, 'javascript')

      // Should preserve all lines
      expect(html).toContain('test')
      expect(html).toContain('return')
    })

    it('should handle code with inline comments', async () => {
      const code = `// This is a comment
const x = 42 // Inline comment`

      const html = await highlightCode(code, 'javascript')

      // Should preserve code
      expect(html).toContain('const')
      expect(html).toContain('42')
    })

    it('should handle code with block comments', async () => {
      const code = `/* Multi-line
   comment */
const x = 42`

      const html = await highlightCode(code, 'javascript')

      // Should preserve code
      expect(html).toContain('const')
    })
  })

  describe('getSyntaxHighlightingStyles', () => {
    it('should return CSS styles', () => {
      const styles = getSyntaxHighlightingStyles()

      expect(styles).toBeTruthy()
      expect(typeof styles).toBe('string')

      // Should contain basic code block styling
      expect(styles).toContain('pre')
      expect(styles).toContain('code')
    })

    it('should include dark theme support', () => {
      const styles = getSyntaxHighlightingStyles()

      // Should contain dark theme media query
      expect(styles).toContain('@media (prefers-color-scheme: dark)')
    })

    it('should include line highlighting styles', () => {
      const styles = getSyntaxHighlightingStyles()

      expect(styles).toContain('.line')
      expect(styles).toContain('.highlighted')
      expect(styles).toContain('.focused')
      expect(styles).toContain('.dimmed')
    })

    it('should include diff highlighting styles', () => {
      const styles = getSyntaxHighlightingStyles()

      expect(styles).toContain('.diff-add')
      expect(styles).toContain('.diff-remove')
    })

    it('should include error and warning styles', () => {
      const styles = getSyntaxHighlightingStyles()

      expect(styles).toContain('.has-error')
      expect(styles).toContain('.has-warning')
    })

    it('should include line number styles', () => {
      const styles = getSyntaxHighlightingStyles()

      expect(styles).toContain('.line-number')
      expect(styles).toContain('.line-numbers-mode')
    })
  })

  describe('integration tests', () => {
    it('should work with typical markdown code blocks', async () => {
      const jsCode = `function greet(name) {
  return \`Hello, \${name}!\`
}`

      const highlighted = await highlightCode(jsCode, 'js')

      // Should contain proper highlighting
      expect(highlighted).toBeTruthy()
      expect(highlighted).toContain('greet')
      expect(highlighted).toContain('name')
    })

    it('should handle JSX/TSX code', async () => {
      const jsxCode = `function App() {
  return <div className="app">Hello</div>
}`

      const highlighted = await highlightCode(jsxCode, 'jsx')

      // Should highlight JSX
      expect(highlighted).toBeTruthy()
      expect(highlighted).toContain('App')
    })

    it('should handle complex TypeScript types', async () => {
      const tsCode = `interface User {
  name: string
  age: number
}

function getUser(): User {
  return { name: 'John', age: 30 }
}`

      const highlighted = await highlightCode(tsCode, 'typescript')

      // Should highlight types
      expect(highlighted).toBeTruthy()
      expect(highlighted).toContain('User')
    })

    it('should handle CSS with modern features', async () => {
      const cssCode = `.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}`

      const highlighted = await highlightCode(cssCode, 'css')

      // Should highlight CSS
      expect(highlighted).toBeTruthy()
      expect(highlighted).toContain('container')
    })

    it('should handle HTML with attributes', async () => {
      const htmlCode = `<div class="container" data-value="test">
  <button id="btn">Click me</button>
</div>`

      const highlighted = await highlightCode(htmlCode, 'html')

      // Should escape HTML
      expect(highlighted).toContain('&lt;')
      expect(highlighted).toContain('&gt;')
    })
  })

  describe('performance tests', () => {
    it('should highlight code in reasonable time', async () => {
      const code = Array.from({ length: 50 }, (_, i) => `const var${i} = ${i}`).join('\n')

      const start = performance.now()
      await highlightCode(code, 'javascript')
      const duration = performance.now() - start

      // Should complete in less than 500ms
      expect(duration).toBeLessThan(500)
    })

    it('should handle multiple highlights efficiently', async () => {
      const codes = [
        'const x = 1',
        'function test() {}',
        'class MyClass {}',
        'const arr = [1, 2, 3]',
        'import { foo } from "bar"',
      ]

      const start = performance.now()
      await Promise.all(codes.map(code => highlightCode(code, 'javascript')))
      const duration = performance.now() - start

      // Should complete all in less than 1000ms
      expect(duration).toBeLessThan(1000)
    })
  })
})
