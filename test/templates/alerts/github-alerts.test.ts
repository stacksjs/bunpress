import { describe, expect, it } from 'bun:test'
import { startServer } from '../../../src/serve'

const TEST_MARKDOWN_DIR = './test/markdown/alerts'

describe('GitHub-Flavored Alerts', () => {
  describe('Note Alert', () => {
    it('should render [!NOTE] alert', async () => {
      const { server, stop } = await startServer({ port: 5001, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-alert-note.md`,
          '> [!NOTE]\n> This is a note alert.',
        )

        const response = await fetch('http://localhost:5001/test-alert-note')
        const html = await response.text()

        expect(html).toContain('<div class="github-alert github-alert-note">')
        expect(html).toContain('Note')
        expect(html).toContain('This is a note alert.')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-alert-note.md`, '')
      }
    })

    it('should render multi-line [!NOTE] alert', async () => {
      const { server, stop } = await startServer({ port: 5002, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-alert-note-multiline.md`,
          '> [!NOTE]\n> Line 1\n> Line 2\n> Line 3',
        )

        const response = await fetch('http://localhost:5002/test-alert-note-multiline')
        const html = await response.text()

        expect(html).toContain('Line 1')
        expect(html).toContain('Line 2')
        expect(html).toContain('Line 3')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-alert-note-multiline.md`, '')
      }
    })
  })

  describe('Tip Alert', () => {
    it('should render [!TIP] alert', async () => {
      const { server, stop } = await startServer({ port: 5003, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-alert-tip.md`,
          '> [!TIP]\n> This is a helpful tip.',
        )

        const response = await fetch('http://localhost:5003/test-alert-tip')
        const html = await response.text()

        expect(html).toContain('<div class="github-alert github-alert-tip">')
        expect(html).toContain('Tip')
        expect(html).toContain('This is a helpful tip.')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-alert-tip.md`, '')
      }
    })
  })

  describe('Important Alert', () => {
    it('should render [!IMPORTANT] alert', async () => {
      const { server, stop } = await startServer({ port: 5004, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-alert-important.md`,
          '> [!IMPORTANT]\n> This is important information.',
        )

        const response = await fetch('http://localhost:5004/test-alert-important')
        const html = await response.text()

        expect(html).toContain('<div class="github-alert github-alert-important">')
        expect(html).toContain('Important')
        expect(html).toContain('This is important information.')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-alert-important.md`, '')
      }
    })
  })

  describe('Warning Alert', () => {
    it('should render [!WARNING] alert', async () => {
      const { server, stop } = await startServer({ port: 5005, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-alert-warning.md`,
          '> [!WARNING]\n> This is a warning message.',
        )

        const response = await fetch('http://localhost:5005/test-alert-warning')
        const html = await response.text()

        expect(html).toContain('<div class="github-alert github-alert-warning">')
        expect(html).toContain('Warning')
        expect(html).toContain('This is a warning message.')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-alert-warning.md`, '')
      }
    })
  })

  describe('Caution Alert', () => {
    it('should render [!CAUTION] alert', async () => {
      const { server, stop } = await startServer({ port: 5006, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-alert-caution.md`,
          '> [!CAUTION]\n> This is a caution message.',
        )

        const response = await fetch('http://localhost:5006/test-alert-caution')
        const html = await response.text()

        expect(html).toContain('<div class="github-alert github-alert-caution">')
        expect(html).toContain('Caution')
        expect(html).toContain('This is a caution message.')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-alert-caution.md`, '')
      }
    })
  })

  describe('Alert with Inline Formatting', () => {
    it('should process inline formatting inside alerts', async () => {
      const { server, stop } = await startServer({ port: 5007, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-alert-formatting.md`,
          '> [!NOTE]\n> This has **bold**, *italic*, and `code`.',
        )

        const response = await fetch('http://localhost:5007/test-alert-formatting')
        const html = await response.text()

        expect(html).toContain('<strong>bold</strong>')
        expect(html).toContain('<em>italic</em>')
        expect(html).toContain('<code>code</code>')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-alert-formatting.md`, '')
      }
    })
  })

  describe('Multiple Alerts', () => {
    it('should render multiple alerts in same document', async () => {
      const { server, stop } = await startServer({ port: 5008, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-alert-multiple.md`,
          '> [!NOTE]\n> Note message.\n\n> [!WARNING]\n> Warning message.',
        )

        const response = await fetch('http://localhost:5008/test-alert-multiple')
        const html = await response.text()

        expect(html).toContain('<div class="github-alert github-alert-note">')
        expect(html).toContain('Note message.')
        expect(html).toContain('<div class="github-alert github-alert-warning">')
        expect(html).toContain('Warning message.')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-alert-multiple.md`, '')
      }
    })
  })

  describe('Alert Mixed with Regular Content', () => {
    it('should render alerts alongside regular markdown', async () => {
      const { server, stop } = await startServer({ port: 5009, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-alert-mixed.md`,
          '# Heading\n\nRegular paragraph.\n\n> [!TIP]\n> Tip in alert.\n\nAnother paragraph.',
        )

        const response = await fetch('http://localhost:5009/test-alert-mixed')
        const html = await response.text()

        expect(html).toContain('<h1')
        expect(html).toContain('Regular paragraph.')
        expect(html).toContain('<div class="github-alert github-alert-tip">')
        expect(html).toContain('Tip in alert.')
        expect(html).toContain('Another paragraph.')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-alert-mixed.md`, '')
      }
    })
  })

  describe('Alert with SVG Icons', () => {
    it('should include SVG icons in alerts', async () => {
      const { server, stop } = await startServer({ port: 5010, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-alert-icons.md`,
          '> [!NOTE]\n> Alert with icon.',
        )

        const response = await fetch('http://localhost:5010/test-alert-icons')
        const html = await response.text()

        expect(html).toContain('<svg class="github-alert-icon"')
        expect(html).toContain('viewBox="0 0 16 16"')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-alert-icons.md`, '')
      }
    })
  })
})
