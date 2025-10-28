import { describe, expect, it } from 'bun:test'
import { startServer } from '../../../src/serve'

const TEST_MARKDOWN_DIR = './test/markdown/content'

describe('Emoji Shortcodes', () => {
  describe('Basic Emojis', () => {
    it('should convert :tada: to 🎉', async () => {
      const { server, stop } = await startServer({ port: 14001, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-emoji-tada.md`,
          `Welcome to the project! :tada:`,
        )

        const response = await fetch('http://localhost:14001/test-emoji-tada')
        const html = await response.text()

        expect(html).toContain('🎉')
        expect(html).not.toContain(':tada:')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-emoji-tada.md`, '')
      }
    })

    it('should convert :rocket: to 🚀', async () => {
      const { server, stop } = await startServer({ port: 14002, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-emoji-rocket.md`,
          `Let's launch :rocket:`,
        )

        const response = await fetch('http://localhost:14002/test-emoji-rocket')
        const html = await response.text()

        expect(html).toContain('🚀')
        expect(html).not.toContain(':rocket:')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-emoji-rocket.md`, '')
      }
    })

    it('should convert :fire: to 🔥', async () => {
      const { server, stop } = await startServer({ port: 14003, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-emoji-fire.md`,
          `This is :fire:`,
        )

        const response = await fetch('http://localhost:14003/test-emoji-fire')
        const html = await response.text()

        expect(html).toContain('🔥')
        expect(html).not.toContain(':fire:')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-emoji-fire.md`, '')
      }
    })
  })

  describe('Multiple Emojis', () => {
    it('should convert multiple emojis in same line', async () => {
      const { server, stop } = await startServer({ port: 14004, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-emoji-multiple.md`,
          `Great work! :tada: :rocket: :fire:`,
        )

        const response = await fetch('http://localhost:14004/test-emoji-multiple')
        const html = await response.text()

        expect(html).toContain('🎉')
        expect(html).toContain('🚀')
        expect(html).toContain('🔥')
        expect(html).not.toContain(':tada:')
        expect(html).not.toContain(':rocket:')
        expect(html).not.toContain(':fire:')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-emoji-multiple.md`, '')
      }
    })

    it('should convert emojis in different paragraphs', async () => {
      const { server, stop } = await startServer({ port: 14005, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-emoji-paragraphs.md`,
          `First paragraph :smile:

Second paragraph :heart:

Third paragraph :star:`,
        )

        const response = await fetch('http://localhost:14005/test-emoji-paragraphs')
        const html = await response.text()

        expect(html).toContain('😄')
        expect(html).toContain('❤️')
        expect(html).toContain('⭐')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-emoji-paragraphs.md`, '')
      }
    })
  })

  describe('Emoji Categories', () => {
    it('should support smiley emojis', async () => {
      const { server, stop } = await startServer({ port: 14006, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-emoji-smileys.md`,
          `:smile: :joy: :heart_eyes: :thinking:`,
        )

        const response = await fetch('http://localhost:14006/test-emoji-smileys')
        const html = await response.text()

        expect(html).toContain('😄')
        expect(html).toContain('😂')
        expect(html).toContain('😍')
        expect(html).toContain('🤔')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-emoji-smileys.md`, '')
      }
    })

    it('should support hand gesture emojis', async () => {
      const { server, stop } = await startServer({ port: 14007, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-emoji-hands.md`,
          `:+1: :thumbsup: :clap: :wave:`,
        )

        const response = await fetch('http://localhost:14007/test-emoji-hands')
        const html = await response.text()

        expect(html).toContain('👍')
        expect(html).toContain('👏')
        expect(html).toContain('👋')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-emoji-hands.md`, '')
      }
    })

    it('should support symbol emojis', async () => {
      const { server, stop } = await startServer({ port: 14008, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-emoji-symbols.md`,
          `:white_check_mark: :x: :warning: :bulb:`,
        )

        const response = await fetch('http://localhost:14008/test-emoji-symbols')
        const html = await response.text()

        expect(html).toContain('✅')
        expect(html).toContain('❌')
        expect(html).toContain('⚠️')
        expect(html).toContain('💡')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-emoji-symbols.md`, '')
      }
    })

    it('should support object emojis', async () => {
      const { server, stop } = await startServer({ port: 14009, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-emoji-objects.md`,
          `:book: :computer: :wrench: :rocket:`,
        )

        const response = await fetch('http://localhost:14009/test-emoji-objects')
        const html = await response.text()

        expect(html).toContain('📖')
        expect(html).toContain('💻')
        expect(html).toContain('🔧')
        expect(html).toContain('🚀')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-emoji-objects.md`, '')
      }
    })
  })

  describe('Emoji in Headings', () => {
    it('should convert emojis in h2 headings', async () => {
      const { server, stop } = await startServer({ port: 14010, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-emoji-heading.md`,
          `## Getting Started :rocket:`,
        )

        const response = await fetch('http://localhost:14010/test-emoji-heading')
        const html = await response.text()

        expect(html).toContain('Getting Started 🚀')
        expect(html).not.toContain(':rocket:')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-emoji-heading.md`, '')
      }
    })

    it('should convert emojis in multiple heading levels', async () => {
      const { server, stop } = await startServer({ port: 14011, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-emoji-headings.md`,
          `## Features :sparkles:

### Performance :zap:`,
        )

        const response = await fetch('http://localhost:14011/test-emoji-headings')
        const html = await response.text()

        expect(html).toContain('Features ✨')
        expect(html).toContain('Performance ⚡')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-emoji-headings.md`, '')
      }
    })
  })

  describe('Emoji in Lists', () => {
    it('should convert emojis in unordered lists', async () => {
      const { server, stop } = await startServer({ port: 14012, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-emoji-list.md`,
          `- Fast :zap:
- Secure :lock:
- Modern :sparkles:`,
        )

        const response = await fetch('http://localhost:14012/test-emoji-list')
        const html = await response.text()

        expect(html).toContain('Fast ⚡')
        expect(html).toContain('Secure 🔒')
        expect(html).toContain('Modern ✨')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-emoji-list.md`, '')
      }
    })
  })

  describe('Emoji in Containers', () => {
    it('should convert emojis in custom containers', async () => {
      const { server, stop } = await startServer({ port: 14013, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-emoji-container.md`,
          `::: tip Success :tada:
You did it! :rocket:
:::`,
        )

        const response = await fetch('http://localhost:14013/test-emoji-container')
        const html = await response.text()

        expect(html).toContain('Success 🎉')
        expect(html).toContain('You did it! 🚀')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-emoji-container.md`, '')
      }
    })

    it('should convert emojis in GitHub alerts', async () => {
      const { server, stop } = await startServer({ port: 14014, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-emoji-alert.md`,
          `> [!TIP]
> Great work! :tada:`,
        )

        const response = await fetch('http://localhost:14014/test-emoji-alert')
        const html = await response.text()

        expect(html).toContain('Great work! 🎉')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-emoji-alert.md`, '')
      }
    })
  })

  describe('Unknown Emojis', () => {
    it('should leave unknown emoji shortcodes unchanged', async () => {
      const { server, stop } = await startServer({ port: 14015, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-emoji-unknown.md`,
          `Known emoji :tada: and unknown :notanemoji:`,
        )

        const response = await fetch('http://localhost:14015/test-emoji-unknown')
        const html = await response.text()

        // Known emoji should be converted
        expect(html).toContain('🎉')

        // Unknown emoji should remain as-is
        expect(html).toContain(':notanemoji:')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-emoji-unknown.md`, '')
      }
    })
  })

  describe('Edge Cases', () => {
    it('should not convert emoji-like text without colons', async () => {
      const { server, stop } = await startServer({ port: 14016, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-emoji-no-colons.md`,
          `This is a tada without colons`,
        )

        const response = await fetch('http://localhost:14016/test-emoji-no-colons')
        const html = await response.text()

        // Should NOT contain the emoji
        expect(html).not.toContain('🎉')

        // Should contain original text
        expect(html).toContain('tada')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-emoji-no-colons.md`, '')
      }
    })

    it('should convert emojis at start and end of lines', async () => {
      const { server, stop } = await startServer({ port: 14017, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-emoji-positions.md`,
          `:rocket: This starts with emoji

This ends with emoji :tada:`,
        )

        const response = await fetch('http://localhost:14017/test-emoji-positions')
        const html = await response.text()

        expect(html).toContain('🚀 This starts')
        expect(html).toContain('with emoji 🎉')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-emoji-positions.md`, '')
      }
    })

    it('should handle consecutive emojis', async () => {
      const { server, stop } = await startServer({ port: 14018, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-emoji-consecutive.md`,
          `:tada::rocket::fire:`,
        )

        const response = await fetch('http://localhost:14018/test-emoji-consecutive')
        const html = await response.text()

        expect(html).toContain('🎉🚀🔥')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-emoji-consecutive.md`, '')
      }
    })
  })

  describe('Common Documentation Emojis', () => {
    it('should support common documentation emojis', async () => {
      const { server, stop } = await startServer({ port: 14019, root: TEST_MARKDOWN_DIR })

      try {
        await Bun.write(
          `${TEST_MARKDOWN_DIR}/test-emoji-docs.md`,
          `Documentation features:

- :book: Read the docs
- :memo: Write notes
- :bulb: Learn tips
- :warning: See warnings
- :white_check_mark: Complete tasks`,
        )

        const response = await fetch('http://localhost:14019/test-emoji-docs')
        const html = await response.text()

        expect(html).toContain('📖 Read')
        expect(html).toContain('📝 Write')
        expect(html).toContain('💡 Learn')
        expect(html).toContain('⚠️ See')
        expect(html).toContain('✅ Complete')
      }
      finally {
        stop()
        await Bun.write(`${TEST_MARKDOWN_DIR}/test-emoji-docs.md`, '')
      }
    })
  })
})
