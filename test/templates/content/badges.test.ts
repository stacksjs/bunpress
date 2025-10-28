import { describe, expect, it } from 'bun:test'
import { startServer } from '../../../src/serve'

const TEST_MARKDOWN_DIR = './test/markdown/content'

describe('Inline Badges', () => {
  describe('Basic Badge Types', () => {
    it('should render info badge', async () => {
      const { server, stop } = await startServer({ port: 15001, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-badge-info.md`,
          `Current version <Badge type="info" text="v2.0" /> available`,
        )

        const response = await fetch('http://localhost:15001/test-badge-info')
        const html = await response.text()

        // Should render badge
        expect(html).toContain('v2.0')
        expect(html).toContain('class="badge badge-info"')

        // Should have info styling (blue)
        expect(html).toContain('#e0f2fe') // bg
        expect(html).toContain('#0c4a6e') // text
        expect(html).toContain('#0ea5e9') // border

        // Should NOT show raw badge syntax
        expect(html).not.toContain('<Badge')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-badge-info.md`, '')
      }
    })

    it('should render tip badge', async () => {
      const { server, stop } = await startServer({ port: 15002, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-badge-tip.md`,
          `Feature is <Badge type="tip" text="stable" /> now`,
        )

        const response = await fetch('http://localhost:15002/test-badge-tip')
        const html = await response.text()

        expect(html).toContain('stable')
        expect(html).toContain('class="badge badge-tip"')

        // Should have tip styling (green)
        expect(html).toContain('#dcfce7') // bg
        expect(html).toContain('#14532d') // text
        expect(html).toContain('#22c55e') // border
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-badge-tip.md`, '')
      }
    })

    it('should render warning badge', async () => {
      const { server, stop } = await startServer({ port: 15003, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-badge-warning.md`,
          `This feature is <Badge type="warning" text="beta" /> status`,
        )

        const response = await fetch('http://localhost:15003/test-badge-warning')
        const html = await response.text()

        expect(html).toContain('beta')
        expect(html).toContain('class="badge badge-warning"')

        // Should have warning styling (orange)
        expect(html).toContain('#fef3c7') // bg
        expect(html).toContain('#78350f') // text
        expect(html).toContain('#f59e0b') // border
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-badge-warning.md`, '')
      }
    })

    it('should render danger badge', async () => {
      const { server, stop } = await startServer({ port: 15004, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-badge-danger.md`,
          `Feature is <Badge type="danger" text="deprecated" /> and will be removed`,
        )

        const response = await fetch('http://localhost:15004/test-badge-danger')
        const html = await response.text()

        expect(html).toContain('deprecated')
        expect(html).toContain('class="badge badge-danger"')

        // Should have danger styling (red)
        expect(html).toContain('#fee2e2') // bg
        expect(html).toContain('#7f1d1d') // text
        expect(html).toContain('#ef4444') // border
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-badge-danger.md`, '')
      }
    })
  })

  describe('Badge Defaults', () => {
    it('should default to info type when no type specified', async () => {
      const { server, stop } = await startServer({ port: 15005, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-badge-default-type.md`,
          `Version <Badge text="1.0" /> released`,
        )

        const response = await fetch('http://localhost:15005/test-badge-default-type')
        const html = await response.text()

        expect(html).toContain('1.0')
        expect(html).toContain('class="badge badge-info"')
        expect(html).toContain('#e0f2fe') // info bg color
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-badge-default-type.md`, '')
      }
    })

    it('should handle empty text attribute', async () => {
      const { server, stop } = await startServer({ port: 15006, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-badge-empty-text.md`,
          `Check this <Badge type="tip" text="" /> marker`,
        )

        const response = await fetch('http://localhost:15006/test-badge-empty-text')
        const html = await response.text()

        // Should render empty badge
        expect(html).toContain('class="badge badge-tip"')
        expect(html).toContain('</span>')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-badge-empty-text.md`, '')
      }
    })
  })

  describe('Multiple Badges', () => {
    it('should render multiple badges in same line', async () => {
      const { server, stop } = await startServer({ port: 15007, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-badge-multiple.md`,
          `Status: <Badge type="tip" text="stable" /> <Badge type="info" text="v2.0" /> <Badge type="warning" text="legacy API" />`,
        )

        const response = await fetch('http://localhost:15007/test-badge-multiple')
        const html = await response.text()

        expect(html).toContain('stable')
        expect(html).toContain('v2.0')
        expect(html).toContain('legacy API')

        expect(html).toContain('badge-tip')
        expect(html).toContain('badge-info')
        expect(html).toContain('badge-warning')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-badge-multiple.md`, '')
      }
    })

    it('should render badges in different paragraphs', async () => {
      const { server, stop } = await startServer({ port: 15008, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-badge-paragraphs.md`,
          `First feature <Badge type="tip" text="new" />

Second feature <Badge type="warning" text="beta" />

Third feature <Badge type="danger" text="removed" />`,
        )

        const response = await fetch('http://localhost:15008/test-badge-paragraphs')
        const html = await response.text()

        expect(html).toContain('new')
        expect(html).toContain('beta')
        expect(html).toContain('removed')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-badge-paragraphs.md`, '')
      }
    })
  })

  describe('Badge Text Content', () => {
    it('should support version numbers', async () => {
      const { server, stop } = await startServer({ port: 15009, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-badge-version.md`,
          `Current version <Badge type="info" text="v2.5.1" />`,
        )

        const response = await fetch('http://localhost:15009/test-badge-version')
        const html = await response.text()

        expect(html).toContain('v2.5.1')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-badge-version.md`, '')
      }
    })

    it('should support status text', async () => {
      const { server, stop } = await startServer({ port: 15010, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-badge-status.md`,
          `Feature status: <Badge type="tip" text="stable" />`,
        )

        const response = await fetch('http://localhost:15010/test-badge-status')
        const html = await response.text()

        expect(html).toContain('stable')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-badge-status.md`, '')
      }
    })

    it('should support multi-word text', async () => {
      const { server, stop } = await startServer({ port: 15011, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-badge-multiword.md`,
          `Status: <Badge type="warning" text="work in progress" />`,
        )

        const response = await fetch('http://localhost:15011/test-badge-multiword')
        const html = await response.text()

        expect(html).toContain('work in progress')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-badge-multiword.md`, '')
      }
    })

    it('should support special characters in text', async () => {
      const { server, stop } = await startServer({ port: 15012, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-badge-special.md`,
          `Version: <Badge type="info" text="v2.0+" />`,
        )

        const response = await fetch('http://localhost:15012/test-badge-special')
        const html = await response.text()

        expect(html).toContain('v2.0+')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-badge-special.md`, '')
      }
    })
  })

  describe('Badges in Headings', () => {
    it('should render badges in h2 headings', async () => {
      const { server, stop } = await startServer({ port: 15013, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-badge-heading.md`,
          `## API Reference <Badge type="info" text="v2.0" />`,
        )

        const response = await fetch('http://localhost:15013/test-badge-heading')
        const html = await response.text()

        expect(html).toContain('API Reference')
        expect(html).toContain('v2.0')
        expect(html).toContain('badge-info')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-badge-heading.md`, '')
      }
    })

    it('should render badges in multiple heading levels', async () => {
      const { server, stop } = await startServer({ port: 15014, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-badge-headings.md`,
          `## Features <Badge type="tip" text="new" />

### Performance <Badge type="info" text="optimized" />`,
        )

        const response = await fetch('http://localhost:15014/test-badge-headings')
        const html = await response.text()

        expect(html).toContain('Features')
        expect(html).toContain('new')
        expect(html).toContain('Performance')
        expect(html).toContain('optimized')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-badge-headings.md`, '')
      }
    })
  })

  describe('Badges in Lists', () => {
    it('should render badges in unordered lists', async () => {
      const { server, stop } = await startServer({ port: 15015, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-badge-list.md`,
          `- Fast <Badge type="tip" text="stable" />
- Secure <Badge type="info" text="verified" />
- Modern <Badge type="warning" text="beta" />`,
        )

        const response = await fetch('http://localhost:15015/test-badge-list')
        const html = await response.text()

        expect(html).toContain('Fast')
        expect(html).toContain('stable')
        expect(html).toContain('Secure')
        expect(html).toContain('verified')
        expect(html).toContain('Modern')
        expect(html).toContain('beta')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-badge-list.md`, '')
      }
    })
  })

  describe('Badges in Containers', () => {
    it('should render badges in custom containers', async () => {
      const { server, stop } = await startServer({ port: 15016, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-badge-container.md`,
          `::: tip New Feature <Badge type="tip" text="v2.0" />
This feature is now available <Badge type="info" text="stable" />
:::`,
        )

        const response = await fetch('http://localhost:15016/test-badge-container')
        const html = await response.text()

        expect(html).toContain('New Feature')
        expect(html).toContain('v2.0')
        expect(html).toContain('stable')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-badge-container.md`, '')
      }
    })

    it('should render badges in GitHub alerts', async () => {
      const { server, stop } = await startServer({ port: 15017, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-badge-alert.md`,
          `> [!NOTE]
> Version <Badge type="info" text="2.0" /> is now available`,
        )

        const response = await fetch('http://localhost:15017/test-badge-alert')
        const html = await response.text()

        expect(html).toContain('2.0')
        expect(html).toContain('badge-info')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-badge-alert.md`, '')
      }
    })
  })

  describe('Case Sensitivity', () => {
    it('should handle uppercase Badge tag', async () => {
      const { server, stop } = await startServer({ port: 15018, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-badge-uppercase.md`,
          `Status <BADGE type="info" text="active" /> here`,
        )

        const response = await fetch('http://localhost:15018/test-badge-uppercase')
        const html = await response.text()

        expect(html).toContain('active')
        expect(html).toContain('badge-info')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-badge-uppercase.md`, '')
      }
    })

    it('should handle mixed case type values', async () => {
      const { server, stop } = await startServer({ port: 15019, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-badge-mixedcase.md`,
          `Status: <Badge type="TIP" text="ready" />`,
        )

        const response = await fetch('http://localhost:15019/test-badge-mixedcase')
        const html = await response.text()

        expect(html).toContain('ready')
        expect(html).toContain('badge-tip')
        expect(html).toContain('#dcfce7') // tip bg color
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-badge-mixedcase.md`, '')
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle badges without spaces around attributes', async () => {
      const { server, stop } = await startServer({ port: 15020, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-badge-nospace.md`,
          `Status<Badge type="info" text="v1"/>here`,
        )

        const response = await fetch('http://localhost:15020/test-badge-nospace')
        const html = await response.text()

        expect(html).toContain('v1')
        expect(html).toContain('badge-info')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-badge-nospace.md`, '')
      }
    })

    it('should work with emojis in badge text', async () => {
      const { server, stop } = await startServer({ port: 15021, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-badge-emoji.md`,
          `Status: <Badge type="tip" text="new :tada:" />`,
        )

        const response = await fetch('http://localhost:15021/test-badge-emoji')
        const html = await response.text()

        // Badge should be processed first, then emoji in the result
        expect(html).toContain('new 🎉')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-badge-emoji.md`, '')
      }
    })

    it('should handle attribute order variations', async () => {
      const { server, stop } = await startServer({ port: 15022, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-badge-attr-order.md`,
          `First <Badge text="v1" type="info" /> and second <Badge type="tip" text="v2" />`,
        )

        const response = await fetch('http://localhost:15022/test-badge-attr-order')
        const html = await response.text()

        expect(html).toContain('v1')
        expect(html).toContain('v2')
        expect(html).toContain('badge-info')
        expect(html).toContain('badge-tip')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-badge-attr-order.md`, '')
      }
    })
  })

  describe('Common Use Cases', () => {
    it('should support version documentation badges', async () => {
      const { server, stop } = await startServer({ port: 15023, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-badge-docs.md`,
          `## API Methods

- \`fetchData()\` <Badge type="tip" text="stable" />
- \`parseJSON()\` <Badge type="info" text="v1.0" />
- \`validate()\` <Badge type="warning" text="beta" />
- \`oldMethod()\` <Badge type="danger" text="deprecated" />`,
        )

        const response = await fetch('http://localhost:15023/test-badge-docs')
        const html = await response.text()

        expect(html).toContain('fetchData()')
        expect(html).toContain('stable')
        expect(html).toContain('parseJSON()')
        expect(html).toContain('v1.0')
        expect(html).toContain('validate()')
        expect(html).toContain('beta')
        expect(html).toContain('oldMethod()')
        expect(html).toContain('deprecated')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-badge-docs.md`, '')
      }
    })
  })
})
