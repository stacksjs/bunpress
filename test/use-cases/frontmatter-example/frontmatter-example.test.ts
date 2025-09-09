import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { buildTestSite, readBuiltFile } from '../../utils/test-helpers'

describe('Use Case: Frontmatter Example', () => {
  const testCase = 'frontmatter-example'
  const testDir = '/Users/mac/repos/stacks-org/bunpress/test/use-cases/frontmatter-example'

  test('should parse complex frontmatter correctly', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Basic frontmatter fields
    expect(html).toContain('Frontmatter Example')
    expect(html).toContain('BunPress Team')
    expect(html).toContain('Demonstrating various frontmatter configurations')
    expect(html).toContain('2024-01-15')
    expect(html).toContain('data-layout="doc"')

    // Array fields (tags)
    expect(html).toContain('frontmatter')
    expect(html).toContain('example')
    expect(html).toContain('documentation')

    // Boolean fields
    expect(html).toContain('featured')

    // Nested objects
    expect(html).toContain('Search this example...')
    expect(html).toContain('--color-primary: #10b981')
    expect(html).toContain('--font-heading: Inter, system-ui, sans-serif')
  })

  test('should process theme configuration from frontmatter', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Theme colors
    expect(html).toContain('--color-primary: #10b981')
    expect(html).toContain('--color-secondary: #6b7280')
    expect(html).toContain('--color-accent: #f59e0b')
    expect(html).toContain('--color-background: #ffffff')

    // Theme fonts
    expect(html).toContain('--font-heading: Inter, system-ui, sans-serif')
    expect(html).toContain('--font-body: Inter, system-ui, sans-serif')
    expect(html).toContain('--font-mono: JetBrains Mono, ui-monospace, monospace')

    // CSS variables
    expect(html).toContain('--border-radius: 8px')
    expect(html).toContain('--shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)')

    // Custom CSS
    expect(html).toContain('.custom-button')
    expect(html).toContain('background: var(--color-primary)')
    expect(html).toContain('border-radius: var(--border-radius)')
  })

  test('should process navigation from frontmatter', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Navigation items
    expect(html).toContain('Home')
    expect(html).toContain('Examples')
    expect(html).toContain('<a href="/"')
    expect(html).toContain('<a href="/examples"')
  })

  test('should process sidebar from frontmatter', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Sidebar structure
    expect(html).toContain('Getting Started')
    expect(html).toContain('Frontmatter')
    expect(html).toContain('Basic Fields')
    expect(html).toContain('Advanced Configuration')
    expect(html).toContain('/getting-started')
    expect(html).toContain('/frontmatter#basic-fields')
    expect(html).toContain('/frontmatter#advanced-configuration')
  })

  test('should process search configuration from frontmatter', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Search configuration
    expect(html).toContain('Search this example...')
    expect(html).toContain('search-container')
    expect(html).toContain('search-input')
  })

  test('should process TOC configuration from frontmatter', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // TOC configuration
    expect(html).toContain('Contents')
    expect(html).toContain('table-of-contents')
    expect(html).toContain('toc-sidebar')

    // TOC items
    expect(html).toContain('Basic Fields')
    expect(html).toContain('Advanced Configuration')
  })

  test('should handle date parsing correctly', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Date should be processed
    expect(html).toContain('2024-01-15')
  })

  test('should handle custom fields', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Custom fields should be available
    expect(html).toContain('featured')
    expect(html).toContain('examples') // category
  })

  test('should generate proper HTML structure with frontmatter data', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // HTML structure
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('<html')
    expect(html).toContain('<head>')
    expect(html).toContain('<body>')
    expect(html).toContain('data-layout="doc"')

    // Meta tags from frontmatter
    expect(html).toContain('<title>Frontmatter Example</title>')
    expect(html).toContain('Demonstrating various frontmatter configurations')
    expect(html).toContain('BunPress Team')

    // Theme variables should be applied
    expect(html).toContain(':root {')
    expect(html).toContain('--color-primary')
    expect(html).toContain('--font-heading')
  })

  test('should handle complex nested frontmatter structures', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Complex nested structures should be processed
    expect(html).toContain('--color-primary: #10b981')
    expect(html).toContain('--font-heading: Inter, system-ui, sans-serif')
    expect(html).toContain('--border-radius: 8px')
    expect(html).toContain('--shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)')
    expect(html).toContain('.custom-button')
    expect(html).toContain('background: var(--color-primary)')
    expect(html).toContain('box-shadow: var(--shadow)')
  })

  test('should validate frontmatter processing integrity', async () => {
    const content = await readFile(join(testDir, 'test.md'), 'utf8')

    const result = await buildTestSite({
      files: [
        { path: 'test.md', content },
      ],
    })

    expect(result.success).toBe(true)

    const html = await readBuiltFile(result.outputs[0])

    // Ensure all frontmatter fields are properly processed
    const frontmatterFields = [
      'title',
      'description',
      'author',
      'date',
      'tags',
      'category',
      'featured',
      'layout',
      'toc',
      'tocTitle',
      'search',
      'themeConfig',
      'nav',
      'sidebar',
    ]

    // All fields should be reflected in the output somehow
    expect(html).toContain('Frontmatter Example') // title
    expect(html).toContain('BunPress Team') // author
    expect(html).toContain('Demonstrating various frontmatter configurations') // description
    expect(html).toContain('2024-01-15') // date
    expect(html).toContain('data-layout="doc"') // layout
    expect(html).toContain('Contents') // tocTitle
    expect(html).toContain('Search this example...') // search placeholder
  })
})
