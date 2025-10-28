import { describe, expect, it } from 'bun:test'
import { startServer } from '../../../src/serve'

const TEST_MARKDOWN_DIR = './test/markdown/image'

describe('Image Captions', () => {
  describe('Basic Caption Syntax', () => {
    it('should render image with caption as figure/figcaption', async () => {
      const { server: _server, stop } = await startServer({ port: 20001, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-basic-caption.md`,
          `# Image with Caption

![Architecture Diagram](/images/architecture.png "This is the system architecture diagram")`,
        )

        const response = await fetch('http://localhost:20001/test-basic-caption')
        const html = await response.text()

        // Should wrap in figure element
        expect(html).toContain('<figure class="image-figure">')
        expect(html).toContain('</figure>')

        // Should have image (note: processImagesHtml adds loading/decoding attributes)
        expect(html).toContain('src="/images/architecture.png"')
        expect(html).toContain('alt="Architecture Diagram"')

        // Should have figcaption with caption text
        expect(html).toContain('<figcaption>This is the system architecture diagram</figcaption>')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-basic-caption.md`, '')
      }
    })

    it('should render image without caption as regular img tag', async () => {
      const { server: _server, stop } = await startServer({ port: 20002, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-no-caption.md`,
          `# Image without Caption

![Logo](/images/logo.png)`,
        )

        const response = await fetch('http://localhost:20002/test-no-caption')
        const html = await response.text()

        // Should NOT wrap in figure element
        expect(html).not.toContain('<figure')

        // Should have regular img tag
        expect(html).toContain('src="/images/logo.png"')
        expect(html).toContain('alt="Logo"')

        // Should NOT have figcaption
        expect(html).not.toContain('<figcaption>')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-no-caption.md`, '')
      }
    })
  })

  describe('Caption Content', () => {
    it('should handle captions with special characters', async () => {
      const { server: _server, stop } = await startServer({ port: 20003, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-special-chars.md`,
          `# Special Characters

![Chart](/chart.png "Sales increased by 150% in Q1'24!")`,
        )

        const response = await fetch('http://localhost:20003/test-special-chars')
        const html = await response.text()

        // Caption should preserve special characters (not HTML-encoded)
        expect(html).toContain('<figcaption>Sales increased by 150% in Q1\'24!</figcaption>')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-special-chars.md`, '')
      }
    })

    it('should handle long captions', async () => {
      const { server: _server, stop } = await startServer({ port: 20004, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-long-caption.md`,
          `# Long Caption

![Workflow](/workflow.png "This detailed workflow diagram illustrates the complete data processing pipeline from ingestion through transformation and validation to final storage")`,
        )

        const response = await fetch('http://localhost:20004/test-long-caption')
        const html = await response.text()

        // Should contain the full caption
        expect(html).toContain('This detailed workflow diagram')
        expect(html).toContain('final storage')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-long-caption.md`, '')
      }
    })

    it('should handle captions with hyphens and underscores', async () => {
      const { server: _server, stop } = await startServer({ port: 20005, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-hyphen-caption.md`,
          `# Hyphen Caption

![Diagram](/diagram.png "API-Gateway to Micro-Service_v2 connection")`,
        )

        const response = await fetch('http://localhost:20005/test-hyphen-caption')
        const html = await response.text()

        expect(html).toContain('API-Gateway to Micro-Service_v2 connection')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-hyphen-caption.md`, '')
      }
    })
  })

  describe('Multiple Images', () => {
    it('should handle multiple images with mixed captions', async () => {
      const { server: _server, stop } = await startServer({ port: 20006, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-mixed-images.md`,
          `# Mixed Images

![Logo](/logo.png)

![Architecture](/arch.png "System architecture")

![Screenshot](/screen.png "Application dashboard")

![Icon](/icon.png)`,
        )

        const response = await fetch('http://localhost:20006/test-mixed-images')
        const html = await response.text()

        // Should have 2 figure elements (images with captions)
        const figureMatches = html.match(/<figure class="image-figure">/g)
        expect(figureMatches?.length).toBe(2)

        // Should have 2 figcaptions
        const captionMatches = html.match(/<figcaption>/g)
        expect(captionMatches?.length).toBe(2)

        // All 4 images should be present
        expect(html).toContain('src="/logo.png"')
        expect(html).toContain('src="/arch.png"')
        expect(html).toContain('src="/screen.png"')
        expect(html).toContain('src="/icon.png"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-mixed-images.md`, '')
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty alt text with caption', async () => {
      const { server: _server, stop } = await startServer({ port: 20007, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-empty-alt.md`,
          `# Empty Alt

![]( /image.png "Caption without alt text")`,
        )

        const response = await fetch('http://localhost:20007/test-empty-alt')
        const html = await response.text()

        // Should still render with figure
        expect(html).toContain('<figure class="image-figure">')
        expect(html).toContain('<figcaption>Caption without alt text</figcaption>')
        expect(html).toContain('alt=""')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-empty-alt.md`, '')
      }
    })

    it('should handle images in lists with captions', async () => {
      const { server: _server, stop } = await startServer({ port: 20008, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-list-images.md`,
          `# Images in Lists

- Item 1
  ![Chart](/chart1.png "Q1 Results")
- Item 2
  ![Chart](/chart2.png "Q2 Results")`,
        )

        const response = await fetch('http://localhost:20008/test-list-images')
        const html = await response.text()

        // Should have figures in list
        expect(html).toContain('<figure class="image-figure">')
        expect(html).toContain('Q1 Results')
        expect(html).toContain('Q2 Results')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-list-images.md`, '')
      }
    })

    it('should handle images with URLs containing query params', async () => {
      const { server: _server, stop } = await startServer({ port: 20009, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-url-params.md`,
          `# URL Parameters

![Photo](/photo.jpg?w=800&h=600 "Resized photo")`,
        )

        const response = await fetch('http://localhost:20009/test-url-params')
        const html = await response.text()

        // Should handle URL with query params
        expect(html).toContain('src="/photo.jpg?w=800&h=600"')
        expect(html).toContain('<figcaption>Resized photo</figcaption>')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-url-params.md`, '')
      }
    })
  })

  describe('Integration with Other Features', () => {
    it('should work with lazy loading attributes', async () => {
      const { server: _server, stop } = await startServer({ port: 20010, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-lazy-loading.md`,
          `# Lazy Loading

![Product](/product.png "Our flagship product")`,
        )

        const response = await fetch('http://localhost:20010/test-lazy-loading')
        const html = await response.text()

        // Should have lazy loading attributes (applied by processImagesHtml)
        expect(html).toContain('loading="lazy"')
        expect(html).toContain('decoding="async"')
        expect(html).toContain('<figcaption>Our flagship product</figcaption>')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-lazy-loading.md`, '')
      }
    })

    it('should work in custom containers', async () => {
      const { server: _server, stop } = await startServer({ port: 20011, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-container-image.md`,
          `# Container Images

::: tip
Check out this diagram:

![Diagram](/diagram.png "Architecture overview")
:::`,
        )

        const response = await fetch('http://localhost:20011/test-container-image')
        const html = await response.text()

        // Should have both container and figure
        expect(html).toContain('custom-block tip')
        expect(html).toContain('<figure class="image-figure">')
        expect(html).toContain('<figcaption>Architecture overview</figcaption>')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-container-image.md`, '')
      }
    })
  })

  describe('CSS Classes', () => {
    it('should apply correct CSS classes', async () => {
      const { server: _server, stop } = await startServer({ port: 20012, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-css-classes.md`,
          `# CSS Classes

![Test](/test.png "Test caption")`,
        )

        const response = await fetch('http://localhost:20012/test-css-classes')
        const html = await response.text()

        // Should have image-figure class
        expect(html).toContain('class="image-figure"')

        // CSS should be included in response
        expect(html).toContain('.image-figure')
        expect(html).toContain('figcaption')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-css-classes.md`, '')
      }
    })
  })
})
