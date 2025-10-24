import { describe, expect, it } from 'bun:test'
import { startServer } from '../../../src/serve'

const TEST_MARKDOWN_DIR = './test/markdown/table'

describe('Table Enhancements', () => {
  describe('Column Alignment', () => {
    it('should support left-aligned columns (default)', async () => {
      const { server, stop } = await startServer({ port: 19001, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-left-align.md`,
          `# Left Alignment

| Name | Age | City |
| --- | --- | --- |
| Alice | 25 | NYC |
| Bob | 30 | LA |`,
        )

        const response = await fetch('http://localhost:19001/test-left-align')
        const html = await response.text()

        // Should have table with proper structure
        expect(html).toContain('<table class="enhanced-table">')
        expect(html).toContain('<div class="table-responsive">')

        // Default alignment should be left
        expect(html).toContain('text-align: left')

        // Should have all cells
        expect(html).toContain('Alice')
        expect(html).toContain('Bob')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-left-align.md`, '')
      }
    })

    it('should support center-aligned columns', async () => {
      const { server, stop } = await startServer({ port: 19002, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-center-align.md`,
          `# Center Alignment

| Name | Age | City |
| :---: | :---: | :---: |
| Alice | 25 | NYC |
| Bob | 30 | LA |`,
        )

        const response = await fetch('http://localhost:19002/test-center-align')
        const html = await response.text()

        // Should have center alignment for all columns
        const centerAlignCount = (html.match(/text-align: center/g) || []).length
        expect(centerAlignCount).toBeGreaterThanOrEqual(9) // 3 headers + 6 cells
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-center-align.md`, '')
      }
    })

    it('should support right-aligned columns', async () => {
      const { server, stop } = await startServer({ port: 19003, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-right-align.md`,
          `# Right Alignment

| Name | Age | Salary |
| ---: | ---: | ---: |
| Alice | 25 | $50,000 |
| Bob | 30 | $60,000 |`,
        )

        const response = await fetch('http://localhost:19003/test-right-align')
        const html = await response.text()

        // Should have right alignment for all columns
        const rightAlignCount = (html.match(/text-align: right/g) || []).length
        expect(rightAlignCount).toBeGreaterThanOrEqual(9) // 3 headers + 6 cells
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-right-align.md`, '')
      }
    })

    it('should support mixed alignment in same table', async () => {
      const { server, stop } = await startServer({ port: 19004, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-mixed-align.md`,
          `# Mixed Alignment

| Name | Age | Salary | Status |
| :--- | :---: | ---: | --- |
| Alice | 25 | $50,000 | Active |
| Bob | 30 | $60,000 | Active |`,
        )

        const response = await fetch('http://localhost:19004/test-mixed-align')
        const html = await response.text()

        // Should have different alignments
        expect(html).toContain('text-align: left')
        expect(html).toContain('text-align: center')
        expect(html).toContain('text-align: right')

        // Extract article content to check alignments in correct order
        const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/)
        const content = articleMatch ? articleMatch[1] : html

        // Name column (left)
        expect(content).toMatch(/<th[^>]*text-align: left[^>]*>Name<\/th>/)
        // Age column (center)
        expect(content).toMatch(/<th[^>]*text-align: center[^>]*>Age<\/th>/)
        // Salary column (right)
        expect(content).toMatch(/<th[^>]*text-align: right[^>]*>Salary<\/th>/)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-mixed-align.md`, '')
      }
    })
  })

  describe('Table Styling', () => {
    it('should apply enhanced table classes', async () => {
      const { server, stop } = await startServer({ port: 19005, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-styling.md`,
          `# Table Styling

| Feature | Status |
| --- | --- |
| Responsive | ✅ |
| Striped | ✅ |
| Hover | ✅ |`,
        )

        const response = await fetch('http://localhost:19005/test-styling')
        const html = await response.text()

        // Should have enhanced classes
        expect(html).toContain('class="table-responsive"')
        expect(html).toContain('class="enhanced-table"')

        // Should have proper table structure
        expect(html).toContain('<thead>')
        expect(html).toContain('<tbody>')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-styling.md`, '')
      }
    })

    it('should handle tables with inline formatting', async () => {
      const { server, stop } = await startServer({ port: 19006, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-inline-formatting.md`,
          `# Table with Formatting

| Feature | Description |
| --- | --- |
| **Bold** | This is *italic* |
| \`Code\` | Regular text |
| [Link](/) | More content |`,
        )

        const response = await fetch('http://localhost:19006/test-inline-formatting')
        const html = await response.text()

        // Should process inline formatting
        expect(html).toContain('<strong>Bold</strong>')
        expect(html).toContain('<em>italic</em>')
        expect(html).toContain('<code>Code</code>')
        expect(html).toContain('<a href="/')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-inline-formatting.md`, '')
      }
    })
  })

  describe('Responsive Tables', () => {
    it('should wrap tables in responsive container', async () => {
      const { server, stop } = await startServer({ port: 19007, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-responsive.md`,
          `# Responsive Table

| Col1 | Col2 | Col3 | Col4 | Col5 | Col6 | Col7 | Col8 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Data | Data | Data | Data | Data | Data | Data | Data |`,
        )

        const response = await fetch('http://localhost:19007/test-responsive')
        const html = await response.text()

        // Should have responsive wrapper
        expect(html).toContain('<div class="table-responsive">')
        expect(html).toContain('</div>')

        // Table should be inside wrapper
        const responsiveMatch = html.match(/<div class="table-responsive">([\s\S]*?)<\/div>/);
        expect(responsiveMatch).toBeTruthy()
        expect(responsiveMatch![1]).toContain('<table')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-responsive.md`, '')
      }
    })

    it('should handle wide tables with many columns', async () => {
      const { server, stop } = await startServer({ port: 19008, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-wide-table.md`,
          `# Wide Table

| ID | Name | Email | Phone | Address | City | State | Zip | Country | Status |
| :---: | --- | --- | --- | --- | --- | --- | ---: | --- | :---: |
| 1 | Alice | alice@example.com | 555-0001 | 123 Main St | NYC | NY | 10001 | USA | Active |
| 2 | Bob | bob@example.com | 555-0002 | 456 Oak Ave | LA | CA | 90001 | USA | Active |`,
        )

        const response = await fetch('http://localhost:19008/test-wide-table')
        const html = await response.text()

        // Should have all columns
        expect(html).toContain('Name')
        expect(html).toContain('Email')
        expect(html).toContain('Phone')
        expect(html).toContain('alice@example.com')

        // Should have responsive wrapper
        expect(html).toContain('table-responsive')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-wide-table.md`, '')
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty cells', async () => {
      const { server, stop } = await startServer({ port: 19009, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-empty-cells.md`,
          `# Empty Cells

| Name | Age | City |
| --- | --- | --- |
| Alice | | NYC |
| | 30 | |`,
        )

        const response = await fetch('http://localhost:19009/test-empty-cells')
        const html = await response.text()

        // Should still create table structure
        expect(html).toContain('<table')
        expect(html).toContain('<td')

        // Should have cells even if empty
        expect(html).toContain('Alice')
        expect(html).toContain('NYC')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-empty-cells.md`, '')
      }
    })

    it('should handle tables with special characters', async () => {
      const { server, stop } = await startServer({ port: 19010, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-special-chars.md`,
          `# Special Characters

| Symbol | Name | Unicode |
| :---: | --- | --- |
| → | Arrow | U+2192 |
| ✓ | Check | U+2713 |
| © | Copyright | U+00A9 |`,
        )

        const response = await fetch('http://localhost:19010/test-special-chars')
        const html = await response.text()

        // Should preserve special characters
        expect(html).toContain('→')
        expect(html).toContain('✓')
        expect(html).toContain('©')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-special-chars.md`, '')
      }
    })

    it('should handle multiple tables in same document', async () => {
      const { server, stop } = await startServer({ port: 19011, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-multiple-tables.md`,
          `# Multiple Tables

## Table 1

| Name | Age |
| --- | --- |
| Alice | 25 |

## Table 2

| City | Population |
| --- | ---: |
| NYC | 8,000,000 |`,
        )

        const response = await fetch('http://localhost:19011/test-multiple-tables')
        const html = await response.text()

        // Should have both tables
        const tableCount = (html.match(/<table class="enhanced-table">/g) || []).length
        expect(tableCount).toBe(2)

        // Should have both responsive wrappers
        const wrapperCount = (html.match(/<div class="table-responsive">/g) || []).length
        expect(wrapperCount).toBe(2)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-multiple-tables.md`, '')
      }
    })
  })

  describe('Integration', () => {
    it('should work with other markdown features', async () => {
      const { server, stop } = await startServer({ port: 19012, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-integration.md`,
          `# Integration Test

::: tip
Check out this data table below:
:::

| Feature | Support | Notes |
| --- | :---: | --- |
| Emoji | ✅ | :tada: Works great |
| **Bold** | ✅ | In cells |
| \`Code\` | ✅ | Syntax works |

> [!NOTE]
> Tables support all inline formatting!`,
        )

        const response = await fetch('http://localhost:19012/test-integration')
        const html = await response.text()

        // Should have table
        expect(html).toContain('enhanced-table')

        // Should have tip container
        expect(html).toContain('custom-block tip')

        // Should have GitHub alert
        expect(html).toContain('github-alert-note')

        // Should have emoji
        expect(html).toContain('🎉')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-integration.md`, '')
      }
    })
  })
})
