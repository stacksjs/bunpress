import { describe, expect, it } from 'bun:test'
import { startServer } from '../../../src/serve'

const TEST_MARKDOWN_DIR = './test/markdown/links'

describe('External Links & Images', () => {
  describe('External Links', () => {
    it('should add target="_blank" and rel="noreferrer noopener" to external links', async () => {
      const { server, stop } = await startServer({ port: 18001, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-external-links.md`,
          `# External Links Test

Check out [GitHub](https://github.com) for open source projects.

Visit [Google](https://google.com) to search.`,
        )

        const response = await fetch('http://localhost:18001/test-external-links')
        const html = await response.text()

        // Should add target="_blank" and rel attributes
        expect(html).toContain('href="https://github.com"')
        expect(html).toContain('target="_blank"')
        expect(html).toContain('rel="noreferrer noopener"')

        // Should process multiple external links
        expect(html).toContain('href="https://google.com"')

        // Should include external link icon
        expect(html).toContain('external-link-icon')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-external-links.md`, '')
      }
    })

    it('should not modify internal links', async () => {
      const { server, stop } = await startServer({ port: 18002, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-internal-links.md`,
          `# Internal Links Test

See [Getting Started](/install) for details.

Check the [API Reference](/api) documentation.`,
        )

        const response = await fetch('http://localhost:18002/test-internal-links')
        const html = await response.text()

        // Extract content area (between <article> tags)
        const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/)
        const contentHtml = articleMatch ? articleMatch[1] : html

        // Internal links in content should NOT have target="_blank"
        const internalLinksWithTarget = contentHtml.match(/<a href="\/[^"]*"[^>]*target="_blank"/g)
        expect(internalLinksWithTarget).toBeNull()

        // Should contain the internal links
        expect(contentHtml).toContain('href="/install"')
        expect(contentHtml).toContain('href="/api"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-internal-links.md`, '')
      }
    })

    it('should handle mixed internal and external links', async () => {
      const { server, stop } = await startServer({ port: 18003, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-mixed-links.md`,
          `# Mixed Links

Internal: [Home](/), [About](/about)

External: [GitHub](https://github.com), [NPM](https://npmjs.com)`,
        )

        const response = await fetch('http://localhost:18003/test-mixed-links')
        const html = await response.text()

        // External links should have target="_blank"
        expect(html).toContain('https://github.com')
        expect(html).toContain('target="_blank"')

        // Internal links should not
        const internalLinkMatch = html.match(/<a href="\/(?:about)?"/)
        expect(internalLinkMatch).toBeTruthy()
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-mixed-links.md`, '')
      }
    })

    it('should work with external links in lists', async () => {
      const { server, stop } = await startServer({ port: 18004, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-links-in-lists.md`,
          `# Links in Lists

Resources:

- [Documentation](https://docs.example.com)
- [GitHub Repo](https://github.com/user/repo)
- [NPM Package](https://npmjs.com/package/name)`,
        )

        const response = await fetch('http://localhost:18004/test-links-in-lists')
        const html = await response.text()

        // All external links in list should have target="_blank"
        const targetBlankCount = (html.match(/target="_blank"/g) || []).length
        expect(targetBlankCount).toBeGreaterThanOrEqual(3)

        // Should have external link icons
        const iconCount = (html.match(/external-link-icon/g) || []).length
        expect(iconCount).toBeGreaterThanOrEqual(3)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-links-in-lists.md`, '')
      }
    })
  })

  describe('Image Lazy Loading', () => {
    it('should add loading="lazy" to images', async () => {
      const { server, stop } = await startServer({ port: 18005, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-lazy-images.md`,
          `# Image Lazy Loading

![Logo](/images/logo.png)

![Banner](/images/banner.jpg)`,
        )

        const response = await fetch('http://localhost:18005/test-lazy-images')
        const html = await response.text()

        // Should add loading="lazy" attribute
        expect(html).toContain('loading="lazy"')

        // Should add decoding="async" for performance
        expect(html).toContain('decoding="async"')

        // Should process multiple images
        const lazyCount = (html.match(/loading="lazy"/g) || []).length
        expect(lazyCount).toBeGreaterThanOrEqual(2)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-lazy-images.md`, '')
      }
    })

    it('should preserve alt text in images', async () => {
      const { server, stop } = await startServer({ port: 18006, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-image-alt.md`,
          `# Images with Alt Text

![Project Logo](/logo.png)

![Feature Screenshot](/screenshot.png)`,
        )

        const response = await fetch('http://localhost:18006/test-image-alt')
        const html = await response.text()

        // Should preserve alt text
        expect(html).toContain('alt="Project Logo"')
        expect(html).toContain('alt="Feature Screenshot"')

        // Should still have lazy loading
        expect(html).toContain('loading="lazy"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-image-alt.md`, '')
      }
    })

    it('should handle images with empty alt text', async () => {
      const { server, stop } = await startServer({ port: 18007, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-empty-alt.md`,
          `# Empty Alt Text

![](/decorative.png)`,
        )

        const response = await fetch('http://localhost:18007/test-empty-alt')
        const html = await response.text()

        // Should have empty alt attribute
        expect(html).toContain('alt=""')

        // Should still have lazy loading
        expect(html).toContain('loading="lazy"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-empty-alt.md`, '')
      }
    })

    it('should work with images in containers', async () => {
      const { server, stop } = await startServer({ port: 18008, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-images-in-containers.md`,
          `::: tip
Check out this feature:

![Feature Image](/feature.png)
:::`,
        )

        const response = await fetch('http://localhost:18008/test-images-in-containers')
        const html = await response.text()

        // Should process images inside containers
        expect(html).toContain('loading="lazy"')
        expect(html).toContain('alt="Feature Image"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-images-in-containers.md`, '')
      }
    })
  })

  describe('Integration', () => {
    it('should work with links and images together', async () => {
      const { server, stop } = await startServer({ port: 18009, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-links-and-images.md`,
          `# Links and Images

Check out the [documentation](https://docs.example.com).

![Logo](/logo.png)

Visit our [GitHub](https://github.com/example/repo) page.

![Banner](/banner.jpg)`,
        )

        const response = await fetch('http://localhost:18009/test-links-and-images')
        const html = await response.text()

        // External links should have target="_blank"
        expect(html).toContain('target="_blank"')
        expect(html).toContain('https://docs.example.com')
        expect(html).toContain('https://github.com/example/repo')

        // Images should have lazy loading
        expect(html).toContain('loading="lazy"')
        const lazyCount = (html.match(/loading="lazy"/g) || []).length
        expect(lazyCount).toBeGreaterThanOrEqual(2)
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-links-and-images.md`, '')
      }
    })

    it('should work with other markdown features', async () => {
      const { server, stop } = await startServer({ port: 18010, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-integration.md`,
          `# Full Integration

::: tip
Visit [GitHub](https://github.com) :rocket:
:::

![Feature](/feature.png)

<Badge type="tip" text="new" /> [External Link](https://example.com)`,
        )

        const response = await fetch('http://localhost:18010/test-integration')
        const html = await response.text()

        // Should process containers
        expect(html).toContain('custom-block')

        // Should process emoji
        expect(html).toContain('🚀')

        // Should process badges
        expect(html).toContain('badge-tip')

        // Should process external links
        expect(html).toContain('target="_blank"')

        // Should process images
        expect(html).toContain('loading="lazy"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-integration.md`, '')
      }
    })
  })
})
