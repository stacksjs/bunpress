import type { BunPressConfig } from '../packages/bunpress/src/types'
import { describe, expect, test } from 'bun:test'
import { startServer } from '../packages/bunpress/src/serve'

const TEST_PORT = 19140

async function render(config: BunPressConfig, port: number): Promise<string> {
  const { stop } = await startServer({ port, root: './test/markdown', config })
  try {
    return await (await fetch(`http://localhost:${port}/`)).text()
  }
  finally {
    stop()
  }
}

describe('analytics.scriptSrc (external first-party tracker)', () => {
  test('emits the external tag and none of the inline client', async () => {
    const html = await render({
      verbose: false,
      markdown: { title: 'Test Docs' },
      analytics: {
        enabled: true,
        siteId: 'zig-utils',
        scriptSrc: 'https://analyticshq.org/script.js',
      },
    }, TEST_PORT)

    expect(html).toContain('<script defer src="https://analyticshq.org/script.js" data-site="zig-utils"></script>')
    // The inline client must NOT also run — two trackers would double-count
    // every pageview, and its sessionStorage/localStorage session ids would
    // undo the cookieless property the external tracker is chosen for.
    expect(html).not.toContain('ts-analytics: privacy-first analytics')
    expect(html).not.toContain('_tsa_sid')
    expect(html).not.toContain('sessionStorage')
  })

  test('inline client still renders when scriptSrc is absent', async () => {
    const html = await render({
      verbose: false,
      markdown: { title: 'Test Docs' },
      analytics: { enabled: true, siteId: 'inline-site' },
    }, TEST_PORT + 1)

    expect(html).toContain('ts-analytics: privacy-first analytics')
    expect(html).toContain('data-site="inline-site"')
  })

  test('scriptSrc still respects the enabled flag', async () => {
    const html = await render({
      verbose: false,
      markdown: { title: 'Test Docs' },
      analytics: {
        enabled: false,
        siteId: 'zig-utils',
        scriptSrc: 'https://analyticshq.org/script.js',
      },
    }, TEST_PORT + 2)

    expect(html).not.toContain('analyticshq.org/script.js')
  })

  test('escapes attribute-breaking characters in scriptSrc and siteId', async () => {
    const html = await render({
      verbose: false,
      markdown: { title: 'Test Docs' },
      analytics: {
        enabled: true,
        siteId: 'a"><script>x</script>',
        scriptSrc: 'https://e.test/s.js?a="><b>',
      },
    }, TEST_PORT + 3)

    expect(html).not.toContain('<script>x</script>')
    expect(html).toContain('&quot;')
  })
})
