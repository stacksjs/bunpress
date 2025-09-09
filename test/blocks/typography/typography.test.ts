import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { buildTestSite, readBuiltFile } from '../../utils/test-helpers'

describe('Typography Elements', () => {
  const testDir = join(import.meta.dir, '..', '..', 'blocks', 'typography')

  test('should generate HTML with proper typography structure', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ],
      config: {
        markdown: {
          title: 'Typography Test',
          meta: {
            description: 'Comprehensive test of typography elements',
            author: 'BunPress'
          }
        }
      }
    })

    expect(result.success).toBe(true)

    const generatedHtml = await readBuiltFile(result.outputs[0])

    // Check basic HTML structure
    expect(generatedHtml).toContain('<title>Typography Test</title>')
    expect(generatedHtml).toContain('Comprehensive test of typography elements')
    expect(generatedHtml).toContain('BunPress')

    // Check for all heading levels
    expect(generatedHtml).toContain('<h1')
    expect(generatedHtml).toContain('<h2')
    expect(generatedHtml).toContain('<h3')
    expect(generatedHtml).toContain('<h4')
    expect(generatedHtml).toContain('<h5')
    expect(generatedHtml).toContain('<h6')

    // Check for UnoCSS
    expect(generatedHtml).toContain('@unocss/runtime')
  })

  test('should handle emphasis and text formatting', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for bold text
    expect(html).toContain('<strong>bold text</strong>')
    expect(html).toContain('<strong>bold and italic</strong>')

    // Check for italic text
    expect(html).toContain('<em>italic text</em>')
    expect(html).toContain('<em>bold and italic</em>')

    // Check for strikethrough
    expect(html).toContain('<del>strikethrough text</del>')

    // Check for nested formatting
    expect(html).toContain('<strong>bold with <em>italic</em> inside</strong>')
    expect(html).toContain('<em>italic with <strong>bold</strong> inside</em>')
  })

  test('should handle links correctly', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for basic links
    expect(html).toContain('<a href="https://google.com">Link to Google</a>')
    expect(html).toContain('title="Google Homepage"')

    // Check for reference links
    expect(html).toContain('<a href="https://google.com">Reference link</a>')
    expect(html).toContain('<a href="https://github.com">Another reference</a>')

    // Check for autolinks
    expect(html).toContain('<a href="https://github.com">https://github.com</a>')
    expect(html).toContain('<a href="mailto:user@example.com">user@example.com</a>')

    // Check for links with formatting
    expect(html).toContain('<strong><a href="https://google.com">Bold link</a></strong>')
    expect(html).toContain('<em><a href="https://github.com">Italic link</a></em>')
    expect(html).toContain('<del><a href="https://example.com">Strikethrough link</a></del>')
  })

  test('should handle lists correctly', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for unordered lists
    expect(html).toContain('<ul>')
    expect(html).toContain('<li>Item 1</li>')
    expect(html).toContain('<li>Nested item 2.1</li>')

    // Check for ordered lists
    expect(html).toContain('<ol>')
    expect(html).toContain('<li>First item</li>')
    expect(html).toContain('<li>Nested ordered item 2.1</li>')

    // Check for mixed nested lists
    expect(html).toContain('Ordered item 1')
    expect(html).toContain('Unordered sub-item 1.1')
    expect(html).toContain('Deep ordered sub-item 2.1.1')

    // Check for task lists (should be rendered as regular lists with checkboxes)
    expect(html).toContain('Uncompleted task')
    expect(html).toContain('Completed task')
  })

  test('should handle blockquotes correctly', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for simple blockquotes
    expect(html).toContain('<blockquote>')
    expect(html).toContain('<p>This is a simple blockquote.</p>')
    expect(html).toContain('<p>It can span multiple lines.</p>')

    // Check for nested blockquotes
    expect(html).toContain('<blockquote>')
    expect(html).toContain('<blockquote>')
    expect(html).toContain('<blockquote>')
    expect(html).toContain('This is deeply nested blockquote.')

    // Check for blockquotes with other elements
    expect(html).toContain('<h4>Heading in Blockquote</h4>')
    expect(html).toContain('<strong>Bold text</strong>')
    expect(html).toContain('<em>Italic text</em>')
    expect(html).toContain('<code>inline code</code>')
    expect(html).toContain('<a href="https://example.com">link</a>')
  })

  test('should handle horizontal rules', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for horizontal rules
    expect(html).toContain('<hr>')
    expect(html).toContain('Content before the rule')
    expect(html).toContain('Content after the first rule')
    expect(html).toContain('Content after the second rule')
    expect(html).toContain('Content after the third rule')
  })

  test('should handle hard line breaks', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for line breaks (rendered as <br> tags)
    expect(html).toContain('<br>')
    expect(html).toContain('This is the first line.')
    expect(html).toContain('This is the second line with a hard break.')
  })

  test('should handle special characters and entities', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for HTML entities
    expect(html).toContain('&copy;')
    expect(html).toContain('&reg;')
    expect(html).toContain('&trade;')
    expect(html).toContain('&hearts;')
    expect(html).toContain('&frac12;')
    expect(html).toContain('&deg;')

    // Check for Unicode characters
    expect(html).toContain('™')
    expect(html).toContain('©')
    expect(html).toContain('®')
    expect(html).toContain('♥')
    expect(html).toContain('½')
    expect(html).toContain('°')

    // Check for emojis
    expect(html).toContain('😀')
    expect(html).toContain('❤️')
    expect(html).toContain('🚀')
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
    expect(html).toContain('<code>console.log()</code>')
    expect(html).toContain('<code>const variable = \'value\'</code>')
    expect(html).toContain('<code>functionName()</code>')
  })

  test('should handle tables correctly', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for table structure
    expect(html).toContain('<table>')
    expect(html).toContain('<thead>')
    expect(html).toContain('<tbody>')
    expect(html).toContain('<tr>')
    expect(html).toContain('<th>')
    expect(html).toContain('<td>')

    // Check for table content
    expect(html).toContain('<th>Header 1</th>')
    expect(html).toContain('<td>Cell 1</td>')
    expect(html).toContain('<td>Left</td>')
    expect(html).toContain('<td>Center</td>')
    expect(html).toContain('<td>Right</td>')

    // Check for table with formatting
    expect(html).toContain('<strong>Bold</strong>')
    expect(html).toContain('<em>Italic</em>')
    expect(html).toContain('<code>Code</code>')
  })

  test('should handle definition lists', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for definition list structure
    expect(html).toContain('<dl>')
    expect(html).toContain('<dt>Term 1</dt>')
    expect(html).toContain('<dd>Definition 1</dd>')
    expect(html).toContain('<dt>Complex Term</dt>')
    expect(html).toContain('<dd>A more complex definition')
  })

  test('should handle footnotes', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for footnote content
    expect(html).toContain('Here\'s a sentence with a footnote')
    expect(html).toContain('This is the first footnote.')
    expect(html).toContain('This is the second footnote')
  })

  test('should handle mathematical expressions', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for math content (may be rendered differently based on extensions)
    expect(html).toContain('E = mc²')
    expect(html).toContain('The quadratic formula')
    expect(html).toContain('Maxwell\'s equations')
  })

  test('should handle keyboard shortcuts', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for keyboard shortcut elements
    expect(html).toContain('<kbd>Ctrl</kbd>')
    expect(html).toContain('<kbd>C</kbd>')
    expect(html).toContain('<kbd>V</kbd>')
    expect(html).toContain('<kbd>Alt</kbd>')
    expect(html).toContain('<kbd>F4</kbd>')
  })

  test('should handle highlighted and marked text', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for highlighted text
    expect(html).toContain('<mark>highlighted text</mark>')
    expect(html).toContain('<mark>HTML mark tags</mark>')
  })

  test('should handle HTML5 semantic elements', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for details/summary
    expect(html).toContain('<details>')
    expect(html).toContain('<summary>Click to expand this section</summary>')

    // Check for time element
    expect(html).toContain('<time datetime="2024-01-15T10:00">January 15, 2024 at 10:00 AM</time>')

    // Check for progress and meter
    expect(html).toContain('<progress value="75" max="100">75%</progress>')
    expect(html).toContain('<meter value="0.8" min="0" max="1"')
  })

  test('should handle text-level semantic elements', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for underline
    expect(html).toContain('<u>underline formatting</u>')

    // Check for small and big text
    expect(html).toContain('<small>small text</small>')
    expect(html).toContain('<big>big text</big>')

    // Check for ins and del
    expect(html).toContain('<ins>inserted</ins>')
    expect(html).toContain('<del>deleted</del>')

    // Check for bidirectional text
    expect(html).toContain('<bdo dir="rtl">هذا نص عربي</bdo>')

    // Check for ruby annotations
    expect(html).toContain('<ruby>')
    expect(html).toContain('<rt>Hàn</rt>')
    expect(html).toContain('<rt>zì</rt>')
  })

  test('should handle word break opportunities and non-breaking spaces', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content }
      ]
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Check for word break opportunities
    expect(html).toContain('<wbr>')
    expect(html).toContain('supercalifragilisticexpialidocious')

    // Check for non-breaking spaces
    expect(html).toContain('10&nbsp;kg')
    expect(html).toContain('Mr.&nbsp;Smith')
    expect(html).toContain('Chapter&nbsp;1')
  })

  test('should validate HTML structure and typography styling', async () => {
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

    // Typography styling
    expect(html).toContain('h1, h2, h3, h4, h5, h6 {')
    expect(html).toContain('a {')
    expect(html).toContain('strong, b {')
    expect(html).toContain('em, i {')

    // Content validation
    expect(html).toContain('markdown-body')
    expect(html).toContain('class=')
    expect(html).toContain('id=')
  })
})
