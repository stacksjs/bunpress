import { describe, expect, it } from 'bun:test'
import { wrapInLayout } from '../../packages/bunpress/src/serve'

const base = { markdown: {} } as any

describe('web fonts (config.fonts)', () => {
  it('injects Google Fonts <link> tags with preconnect into the head', async () => {
    const html = await wrapInLayout('<h1>Hi</h1>', {
      ...base,
      fonts: { google: ['Inter:wght@400;600;700', 'JetBrains Mono:wght@400;700'] },
    }, '/', 'doc')

    expect(html).toContain('rel="preconnect" href="https://fonts.googleapis.com"')
    expect(html).toContain('href="https://fonts.gstatic.com" crossorigin')
    expect(html).toContain('https://fonts.googleapis.com/css2?')
    expect(html).toContain('family=Inter:wght@400;600;700')
    expect(html).toContain('family=JetBrains+Mono:wght@400;700')
    expect(html).toContain('&display=swap')
  })

  it('honours display and preconnect:false', async () => {
    const html = await wrapInLayout('<h1>Hi</h1>', {
      ...base,
      fonts: { google: ['Inter'], display: 'optional', preconnect: false },
    }, '/', 'doc')
    expect(html).toContain('&display=optional')
    expect(html).not.toContain('rel="preconnect"')
  })

  it('emits raw @font-face blocks for self-hosted fonts', async () => {
    const face = `@font-face{font-family:'Berkeley Mono';src:url('/f/bm.woff2') format('woff2')}`
    const html = await wrapInLayout('<h1>Hi</h1>', { ...base, fonts: { faces: [face] } }, '/', 'doc')
    expect(html).toContain("font-family:'Berkeley Mono'")
  })

  it('adds nothing when fonts is unset', async () => {
    const html = await wrapInLayout('<h1>Hi</h1>', { ...base }, '/', 'doc')
    expect(html).not.toContain('fonts.googleapis.com')
  })
})
