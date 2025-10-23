import { describe, expect, it } from 'bun:test'
import { startServer } from '../../../src/serve'

const TEST_MARKDOWN_DIR = './test/markdown/containers'

describe('Custom Containers', () => {
  describe('Info Container', () => {
    it('should render ::: info container with default title', async () => {
      const { server, stop } = await startServer({ port: 4001, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-container-info.md`,
          '::: info\nThis is an info message.\n:::',
        )

        const response = await fetch('http://localhost:4001/test-container-info')
        const html = await response.text()

        expect(html).toContain('<div class="custom-block info">')
        expect(html).toContain('<p class="custom-block-title">INFO</p>')
        expect(html).toContain('This is an info message.')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-container-info.md`, '')
      }
    })

    it('should render ::: info container with custom title', async () => {
      const { server, stop } = await startServer({ port: 4002, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-container-info-custom.md`,
          '::: info Custom Title\nThis is an info message.\n:::',
        )

        const response = await fetch('http://localhost:4002/test-container-info-custom')
        const html = await response.text()

        expect(html).toContain('<div class="custom-block info">')
        expect(html).toContain('<p class="custom-block-title">Custom Title</p>')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-container-info-custom.md`, '')
      }
    })
  })

  describe('Tip Container', () => {
    it('should render ::: tip container', async () => {
      const { server, stop } = await startServer({ port: 4003, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-container-tip.md`,
          '::: tip\nThis is a helpful tip.\n:::',
        )

        const response = await fetch('http://localhost:4003/test-container-tip')
        const html = await response.text()

        expect(html).toContain('<div class="custom-block tip">')
        expect(html).toContain('<p class="custom-block-title">TIP</p>')
        expect(html).toContain('This is a helpful tip.')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-container-tip.md`, '')
      }
    })
  })

  describe('Warning Container', () => {
    it('should render ::: warning container', async () => {
      const { server, stop } = await startServer({ port: 4004, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-container-warning.md`,
          '::: warning\nThis is a warning message.\n:::',
        )

        const response = await fetch('http://localhost:4004/test-container-warning')
        const html = await response.text()

        expect(html).toContain('<div class="custom-block warning">')
        expect(html).toContain('<p class="custom-block-title">WARNING</p>')
        expect(html).toContain('This is a warning message.')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-container-warning.md`, '')
      }
    })
  })

  describe('Danger Container', () => {
    it('should render ::: danger container', async () => {
      const { server, stop } = await startServer({ port: 4005, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-container-danger.md`,
          '::: danger\nThis is a danger message.\n:::',
        )

        const response = await fetch('http://localhost:4005/test-container-danger')
        const html = await response.text()

        expect(html).toContain('<div class="custom-block danger">')
        expect(html).toContain('<p class="custom-block-title">DANGER</p>')
        expect(html).toContain('This is a danger message.')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-container-danger.md`, '')
      }
    })
  })

  describe('Details Container', () => {
    it('should render ::: details container as collapsible', async () => {
      const { server, stop } = await startServer({ port: 4006, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-container-details.md`,
          '::: details\nThis is details content.\n:::',
        )

        const response = await fetch('http://localhost:4006/test-container-details')
        const html = await response.text()

        expect(html).toContain('<details class="custom-block details">')
        expect(html).toContain('<summary>Details</summary>')
        expect(html).toContain('This is details content.')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-container-details.md`, '')
      }
    })

    it('should render ::: details with custom summary', async () => {
      const { server, stop } = await startServer({ port: 4007, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-container-details-custom.md`,
          '::: details Click to expand\nThis is details content.\n:::',
        )

        const response = await fetch('http://localhost:4007/test-container-details-custom')
        const html = await response.text()

        expect(html).toContain('<summary>Click to expand</summary>')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-container-details-custom.md`, '')
      }
    })
  })

  describe('Raw Container', () => {
    it('should render ::: raw container without processing', async () => {
      const { server, stop } = await startServer({ port: 4008, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-container-raw.md`,
          '::: raw\nThis is **raw** content.\n:::',
        )

        const response = await fetch('http://localhost:4008/test-container-raw')
        const html = await response.text()

        expect(html).toContain('<div class="vp-raw">')
        // Raw containers should still process inline formatting
        expect(html).toContain('This is <strong>raw</strong> content.')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-container-raw.md`, '')
      }
    })
  })

  describe('Container with Inline Formatting', () => {
    it('should process inline formatting inside containers', async () => {
      const { server, stop } = await startServer({ port: 4009, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-container-formatting.md`,
          '::: info\nThis has **bold**, *italic*, and `code`.\n:::',
        )

        const response = await fetch('http://localhost:4009/test-container-formatting')
        const html = await response.text()

        expect(html).toContain('<strong>bold</strong>')
        expect(html).toContain('<em>italic</em>')
        expect(html).toContain('<code>code</code>')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-container-formatting.md`, '')
      }
    })
  })

  describe('Multiple Containers', () => {
    it('should render multiple containers in same document', async () => {
      const { server, stop } = await startServer({ port: 4010, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-container-multiple.md`,
          '::: info\nInfo message.\n:::\n\n::: warning\nWarning message.\n:::',
        )

        const response = await fetch('http://localhost:4010/test-container-multiple')
        const html = await response.text()

        expect(html).toContain('<div class="custom-block info">')
        expect(html).toContain('Info message.')
        expect(html).toContain('<div class="custom-block warning">')
        expect(html).toContain('Warning message.')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-container-multiple.md`, '')
      }
    })
  })

  describe('Container with Multiple Lines', () => {
    it('should render multi-line container content', async () => {
      const { server, stop } = await startServer({ port: 4011, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-container-multiline.md`,
          '::: tip\nLine 1\nLine 2\nLine 3\n:::',
        )

        const response = await fetch('http://localhost:4011/test-container-multiline')
        const html = await response.text()

        expect(html).toContain('Line 1')
        expect(html).toContain('Line 2')
        expect(html).toContain('Line 3')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-container-multiline.md`, '')
      }
    })
  })

  describe('Container Mixed with Regular Content', () => {
    it('should render containers alongside regular markdown', async () => {
      const { server, stop } = await startServer({ port: 4012, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-container-mixed.md`,
          '# Heading\n\nRegular paragraph.\n\n::: info\nInfo in container.\n:::\n\nAnother paragraph.',
        )

        const response = await fetch('http://localhost:4012/test-container-mixed')
        const html = await response.text()

        expect(html).toContain('<h1')
        expect(html).toContain('Regular paragraph.')
        expect(html).toContain('<div class="custom-block info">')
        expect(html).toContain('Info in container.')
        expect(html).toContain('Another paragraph.')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-container-mixed.md`, '')
      }
    })
  })
})
