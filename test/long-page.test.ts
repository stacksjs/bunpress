import type { BunPressConfig } from '../packages/bunpress/src/types'
import { describe, expect, it } from 'bun:test'
import { defaultConfig } from '../packages/bunpress/src/config'
import { EAGER_BLOCKS, isLongPage, LONG_PAGE_BYTES, LONG_PAGE_CLASS } from '../packages/bunpress/src/long-page'
import { wrapInLayout } from '../packages/bunpress/src/serve'

/**
 * A page long enough to make a browser's first layout a long task is
 * rendered a screen at a time. An ordinary page is left exactly as it was.
 */
const config = { ...defaultConfig, title: 'Docs' } as BunPressConfig

const article = (html: string): string => html.match(/<article class="([^"]*)"/)?.[1] ?? ''

describe('long pages', () => {
  it('draws the line by the size of the article', () => {
    expect(isLongPage('x'.repeat(LONG_PAGE_BYTES))).toBe(false)
    expect(isLongPage('x'.repeat(LONG_PAGE_BYTES + 1))).toBe(true)
  })

  it('marks the article of a long page, and only of a long page', async () => {
    const row = '<h3 id="c">cmd</h3><p>What it does.</p><table><tbody><tr><td>--flag</td><td>does a thing</td></tr></tbody></table>'
    const long = await wrapInLayout(`<h1>Reference</h1>${row.repeat(Math.ceil(LONG_PAGE_BYTES / row.length) + 1)}`, config, '/ref', 'doc', {})
    const short = await wrapInLayout('<h1>Guide</h1><p>Short.</p>', config, '/guide', 'doc', {})

    expect(article(long).split(' ')).toContain(LONG_PAGE_CLASS)
    expect(article(short)).toBe('bp-doc')
  })

  it('ships the rule on every doc page, so navigating into a long one finds it', async () => {
    const short = await wrapInLayout('<h1>Guide</h1><p>Short.</p>', config, '/guide', 'doc', {})
    const head = short.slice(0, short.indexOf('</head>'))

    expect(head).toContain(`.${LONG_PAGE_CLASS} > :nth-child(n + ${EAGER_BLOCKS + 1}):is(`)
    expect(head).toContain('content-visibility:auto')
  })

  it('leaves the first screenful alone, so nothing on screen at load is resized', () => {
    // A block in view when the page loads is laid out at its placeholder
    // height and then at its real one. Only blocks past the fold may be skipped.
    expect(EAGER_BLOCKS).toBeGreaterThanOrEqual(30)
  })

  it('never skips a heading, and only engages where scrolling up cannot jump', async () => {
    const short = await wrapInLayout('<h1>Guide</h1>', config, '/guide', 'doc', {})
    const rule = short.match(new RegExp(`@supports \\(overflow-anchor:auto\\)\\{\\.${LONG_PAGE_CLASS} > :nth-child\\(n \\+ \\d+\\):is\\(([^)]*)\\)`))

    expect(rule).not.toBeNull()
    expect(rule![1]).not.toMatch(/\bh[1-6]\b/)
  })
})
