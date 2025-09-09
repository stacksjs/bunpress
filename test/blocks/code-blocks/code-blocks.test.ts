import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { buildTestSite, readBuiltFile } from '../../utils/test-helpers'

describe('Code Blocks', () => {
  const testDir = join(import.meta.dir, '..', '..', 'blocks', 'code-blocks')

  test('should generate HTML with syntax highlighting', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ],
      config: {
        markdown: {
          title: 'Code Blocks Test',
          meta: {
            description: 'Comprehensive test of code block syntax highlighting',
            author: 'BunPress'
          }
        }
      }
    })

    expect(result.success).toBe(true)

    const generatedHtml = await readBuiltFile(result.outputs[0])

    // Check basic HTML structure
    expect(generatedHtml).toContain('<title>Code Blocks Test</title>')
    expect(generatedHtml).toContain('Comprehensive test of code block syntax highlighting')
    expect(generatedHtml).toContain('BunPress')

    // Check for code blocks
    expect(generatedHtml).toContain('<pre')
    expect(generatedHtml).toContain('<code')

    // Check for UnoCSS
    expect(generatedHtml).toContain('@unocss/runtime')
  })

  test('should handle JavaScript/TypeScript syntax highlighting', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for JavaScript/TypeScript content
    expect(html).toContain('function greet(name)')
    expect(html).toContain('return `Hello, ${name}!`')
    expect(html).toContain('interface User')
    expect(html).toContain('class UserService')

    // Check for TypeScript-specific syntax
    expect(html).toContain('async createUser')
    expect(html).toContain('Promise&lt;User&gt;')
    expect(html).toContain('Partial&lt;User&gt;')
  })

  test('should handle line numbers', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for line numbers content
    expect(html).toContain('import { readFile, writeFile }')
    expect(html).toContain('async function processFile')
    expect(html).toContain('const content = await readFile')

    // Check for TypeScript async/await syntax
    expect(html).toContain('try {')
    expect(html).toContain('} catch (error) {')
  })

  test('should handle line highlighting', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for line highlighting content
    expect(html).toContain('const express = require(\'express\')')
    expect(html).toContain('app.use(express.json())')
    expect(html).toContain('app.get(\'/\', (req, res)')
    expect(html).toContain('res.json({ message: \'Hello World!\' })')
  })

  test('should handle range highlighting', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for Python async/await content
    expect(html).toContain('import asyncio')
    expect(html).toContain('import aiohttp')
    expect(html).toContain('async def fetch_user_data')
    expect(html).toContain('async def process_users')

    // Check for Python type hints
    expect(html).toContain('List[int]')
    expect(html).toContain('Dict[str, Any]')
  })

  test('should handle multiple languages', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for HTML content
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('<meta charset="UTF-8">')
    expect(html).toContain('<title>Sample Page</title>')

    // Check for CSS content
    expect(html).toContain('* {')
    expect(html).toContain('margin: 0;')
    expect(html).toContain('box-sizing: border-box;')
    expect(html).toContain('linear-gradient(135deg')

    // Check for JSON content
    expect(html).toContain('"name": "bunpress"')
    expect(html).toContain('"version": "1.0.0"')
    expect(html).toContain('"description": "Modern documentation engine"')
  })

  test('should handle code blocks in lists', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for list structure
    expect(html).toContain('<ol>')
    expect(html).toContain('<li>')

    // Check for code in lists
    expect(html).toContain('npm install bunpress')
    expect(html).toContain('npx bunpress build')
  })

  test('should handle special characters and Unicode', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for SQL content
    expect(html).toContain('CREATE TABLE users')
    expect(html).toContain('INSERT INTO users')
    expect(html).toContain('SELECT id, username, email')

    // Check for Rust content with Unicode comments
    expect(html).toContain('// 用户数据')
    expect(html).toContain('// 遍历用户')
    expect(html).toContain('// 特殊字符')
    expect(html).toContain('∑∆∞√∫αβγδεζηθικλμνξοπρστυφχψω')
  })

  test('should handle inline code', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for inline code
    expect(html).toContain('<code>inline code</code>')
    expect(html).toContain('<code>const variable = \'value\'</code>')
    expect(html).toContain('<code>functionName()</code>')
  })

  test('should handle empty and whitespace-only code blocks', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for empty code blocks (should still render as valid HTML)
    expect(html).toContain('<pre><code></code></pre>')
  })

  test('should handle very long code blocks', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for long Python function
    expect(html).toContain('def fibonacci_generator(n: int):')
    expect(html).toContain('"""')
    expect(html).toContain('Generate the first n Fibonacci numbers')
    expect(html).toContain('>>> list(fibonacci_generator(10))')
    expect(html).toContain('if n <= 0:')
    expect(html).toContain('fib_nums = []')
    expect(html).toContain('print(fib_nums)')
  })

  test('should handle mixed languages in same document', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for Bash script
    expect(html).toContain('#!/bin/bash')
    expect(html).toContain('echo "Building BunPress documentation..."')
    expect(html).toContain('npm install')
    expect(html).toContain('if [ $? -eq 0 ]; then')

    // Check for PowerShell script
    expect(html).toContain('# PowerShell build script')
    expect(html).toContain('Write-Host "Building BunPress documentation..."')
    expect(html).toContain('npm run build')
    expect(html).toContain('if ($LASTEXITCODE -eq 0)')
  })

  test('should validate HTML structure and code block styling', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Basic HTML validation
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true)
    expect(html).toContain('<html')
    expect(html).toContain('<head>')
    expect(html).toContain('<body>')
    expect(html).toContain('</body>')
    expect(html).toContain('</html>')

    // Meta tags
    expect(html).toContain('<meta charset="UTF-8">')
    expect(html).toContain('<meta name="viewport"')

    // Code block styling
    expect(html).toContain('pre {')
    expect(html).toContain('code {')
    expect(html).toContain('font-family: ui-monospace')

    // Content validation
    expect(html).toContain('markdown-body')
    expect(html).toContain('class=')
    expect(html).toContain('id=')
  })

  test('should include copy-to-clipboard functionality', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for copy-to-clipboard styles
    expect(html).toContain('.code-block-container')
    expect(html).toContain('.copy-code-btn')

    // Check for copy-to-clipboard scripts
    expect(html).toContain('copyToClipboard')
    expect(html).toContain('function copyToClipboard')
  })
})
