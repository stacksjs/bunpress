import { describe, expect, it } from 'bun:test'
import { startServer } from '../../../src/serve'

const TEST_MARKDOWN_DIR = './test/markdown/inline'

describe('Inline Formatting', () => {
  describe('Italic (em)', () => {
    it('should convert *text* to <em>text</em>', async () => {
      const { server, stop } = await startServer({ port: 3001, root: TEST_MARKDOWN_DIR })

      try {
        // Create a test markdown file
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-italic-asterisk.md`, 'This is *italic* text.')

        const response = await fetch('http://localhost:3001/test-italic-asterisk')
        const html = await response.text()

        expect(html).toContain('<em>italic</em>')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-italic-asterisk.md`, '') // Cleanup
      }
    })

    it('should convert _text_ to <em>text</em>', async () => {
      const { server, stop } = await startServer({ port: 3002, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-italic-underscore.md`, 'This is _italic_ text.')

        const response = await fetch('http://localhost:3002/test-italic-underscore')
        const html = await response.text()

        expect(html).toContain('<em>italic</em>')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-italic-underscore.md`, '')
      }
    })

    it('should handle multiple italic sections', async () => {
      const { server, stop } = await startServer({ port: 3003, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write('./docs/test-italic-multiple.md', 'This is *italic* and this is _also italic_.')

        const response = await fetch('http://localhost:3003/test-italic-multiple')
        const html = await response.text()

        expect(html).toContain('<em>italic</em>')
        expect(html).toContain('<em>also italic</em>')
      }
      finally {
        stop()
        await Bun.write('./docs/test-italic-multiple.md', '')
      }
    })
  })

  describe('Bold (strong)', () => {
    it('should convert **text** to <strong>text</strong>', async () => {
      const { server, stop } = await startServer({ port: 3004 })

      try {
        await Bun.write('./docs/test-bold-asterisk.md', 'This is **bold** text.')

        const response = await fetch('http://localhost:3004/test-bold-asterisk')
        const html = await response.text()

        expect(html).toContain('<strong>bold</strong>')
      }
      finally {
        stop()
        await Bun.write('./docs/test-bold-asterisk.md', '')
      }
    })

    it('should convert __text__ to <strong>text</strong>', async () => {
      const { server, stop } = await startServer({ port: 3005 })

      try {
        await Bun.write('./docs/test-bold-underscore.md', 'This is __bold__ text.')

        const response = await fetch('http://localhost:3005/test-bold-underscore')
        const html = await response.text()

        expect(html).toContain('<strong>bold</strong>')
      }
      finally {
        stop()
        await Bun.write('./docs/test-bold-underscore.md', '')
      }
    })

    it('should handle bold and italic together', async () => {
      const { server, stop } = await startServer({ port: 3006 })

      try {
        await Bun.write('./docs/test-bold-italic.md', 'This is **bold** and *italic*.')

        const response = await fetch('http://localhost:3006/test-bold-italic')
        const html = await response.text()

        expect(html).toContain('<strong>bold</strong>')
        expect(html).toContain('<em>italic</em>')
      }
      finally {
        stop()
        await Bun.write('./docs/test-bold-italic.md', '')
      }
    })
  })

  describe('Strikethrough (del)', () => {
    it('should convert ~~text~~ to <del>text</del>', async () => {
      const { server, stop } = await startServer({ port: 3007 })

      try {
        await Bun.write('./docs/test-strikethrough.md', 'This is ~~strikethrough~~ text.')

        const response = await fetch('http://localhost:3007/test-strikethrough')
        const html = await response.text()

        expect(html).toContain('<del>strikethrough</del>')
      }
      finally {
        stop()
        await Bun.write('./docs/test-strikethrough.md', '')
      }
    })
  })

  describe('Code (code)', () => {
    it('should convert `text` to <code>text</code>', async () => {
      const { server, stop } = await startServer({ port: 3008 })

      try {
        await Bun.write('./docs/test-code.md', 'This is `inline code` text.')

        const response = await fetch('http://localhost:3008/test-code')
        const html = await response.text()

        expect(html).toContain('<code>inline code</code>')
      }
      finally {
        stop()
        await Bun.write('./docs/test-code.md', '')
      }
    })
  })

  describe('Subscript (sub)', () => {
    it('should convert ~text~ to <sub>text</sub>', async () => {
      const { server, stop } = await startServer({ port: 3009 })

      try {
        await Bun.write('./docs/test-subscript.md', 'H~2~O is water.')

        const response = await fetch('http://localhost:3009/test-subscript')
        const html = await response.text()

        expect(html).toContain('<sub>2</sub>')
      }
      finally {
        stop()
        await Bun.write('./docs/test-subscript.md', '')
      }
    })
  })

  describe('Superscript (sup)', () => {
    it('should convert ^text^ to <sup>text</sup>', async () => {
      const { server, stop } = await startServer({ port: 3010 })

      try {
        await Bun.write('./docs/test-superscript.md', 'E = mc^2^ is famous.')

        const response = await fetch('http://localhost:3010/test-superscript')
        const html = await response.text()

        expect(html).toContain('<sup>2</sup>')
      }
      finally {
        stop()
        await Bun.write('./docs/test-superscript.md', '')
      }
    })
  })

  describe('Mark/Highlight (mark)', () => {
    it('should convert ==text== to <mark>text</mark>', async () => {
      const { server, stop } = await startServer({ port: 3011 })

      try {
        await Bun.write('./docs/test-mark.md', 'This is ==highlighted== text.')

        const response = await fetch('http://localhost:3011/test-mark')
        const html = await response.text()

        expect(html).toContain('<mark>highlighted</mark>')
      }
      finally {
        stop()
        await Bun.write('./docs/test-mark.md', '')
      }
    })
  })

  describe('Combined Formatting', () => {
    it('should handle multiple formats in one line', async () => {
      const { server, stop } = await startServer({ port: 3012 })

      try {
        await Bun.write(
          './docs/test-combined.md',
          'This has **bold**, *italic*, `code`, ~~strikethrough~~, ==highlight==, H~2~O, and E=mc^2^.',
        )

        const response = await fetch('http://localhost:3012/test-combined')
        const html = await response.text()

        expect(html).toContain('<strong>bold</strong>')
        expect(html).toContain('<em>italic</em>')
        expect(html).toContain('<code>code</code>')
        expect(html).toContain('<del>strikethrough</del>')
        expect(html).toContain('<mark>highlight</mark>')
        expect(html).toContain('<sub>2</sub>')
        expect(html).toContain('<sup>2</sup>')
      }
      finally {
        stop()
        await Bun.write('./docs/test-combined.md', '')
      }
    })

    it('should work in headings', async () => {
      const { server, stop } = await startServer({ port: 3013 })

      try {
        await Bun.write('./docs/test-heading-formatting.md', '## This is **bold** and *italic*')

        const response = await fetch('http://localhost:3013/test-heading-formatting')
        const html = await response.text()

        expect(html).toMatch(/<h2[^>]*>.*<strong>bold<\/strong>.*<em>italic<\/em>.*<\/h2>/)
      }
      finally {
        stop()
        await Bun.write('./docs/test-heading-formatting.md', '')
      }
    })

    it('should work in lists', async () => {
      const { server, stop } = await startServer({ port: 3014 })

      try {
        await Bun.write('./docs/test-list-formatting.md', '- This is **bold** item\n- This is *italic* item')

        const response = await fetch('http://localhost:3014/test-list-formatting')
        const html = await response.text()

        expect(html).toMatch(/<li>.*<strong>bold<\/strong>.*<\/li>/)
        expect(html).toMatch(/<li>.*<em>italic<\/em>.*<\/li>/)
      }
      finally {
        stop()
        await Bun.write('./docs/test-list-formatting.md', '')
      }
    })

    it('should work in tables', async () => {
      const { server, stop } = await startServer({ port: 3015 })

      try {
        await Bun.write(
          './docs/test-table-formatting.md',
          '| Header |\n| --- |\n| **bold** |\n| *italic* |',
        )

        const response = await fetch('http://localhost:3015/test-table-formatting')
        const html = await response.text()

        expect(html).toContain('<strong>bold</strong>')
        expect(html).toContain('<em>italic</em>')
      }
      finally {
        stop()
        await Bun.write('./docs/test-table-formatting.md', '')
      }
    })
  })

  describe('Edge Cases', () => {
    it('should not confuse ** with *', async () => {
      const { server, stop } = await startServer({ port: 3016 })

      try {
        await Bun.write('./docs/test-edge-bold-italic.md', 'This is **bold not *italic**.')

        const response = await fetch('http://localhost:3016/test-edge-bold-italic')
        const html = await response.text()

        // Should have bold, and the inner * should be literal or converted correctly
        expect(html).toContain('<strong>bold not *italic</strong>')
      }
      finally {
        stop()
        await Bun.write('./docs/test-edge-bold-italic.md', '')
      }
    })

    it('should not confuse ~~ with ~', async () => {
      const { server, stop } = await startServer({ port: 3017 })

      try {
        await Bun.write('./docs/test-edge-strike-sub.md', 'H~2~O and ~~deleted~~.')

        const response = await fetch('http://localhost:3017/test-edge-strike-sub')
        const html = await response.text()

        expect(html).toContain('<sub>2</sub>')
        expect(html).toContain('<del>deleted</del>')
      }
      finally {
        stop()
        await Bun.write('./docs/test-edge-strike-sub.md', '')
      }
    })
  })
})
