import { describe, expect, it } from 'bun:test'
import { renderBreadcrumb, renderDocPager, resolveDocTrail } from '../packages/bunpress/src/doc-trail'
import { wrapInLayout } from '../packages/bunpress/src/serve'
import { getBunThemeCSS } from '../packages/bunpress/src/themes'

const sidebar = [
  { text: 'Get Started', items: [
    { text: 'Welcome', link: '/welcome' },
    { text: 'Server', link: '/server' },
  ] },
  { text: 'Core Runtime', items: [
    { text: 'Watch Mode', link: '/watch' },
    { text: 'GitHub', link: 'https://github.com/example/example' },
  ] },
]

const site = (theme: 'bun' | 'vitepress') => ({ verbose: false, title: 'Docs', theme, sidebar })

describe('the doc trail', () => {
  it('names the section above a page and the pages either side of it, in sidebar order', () => {
    const trail = resolveDocTrail(sidebar, '/server')
    expect(trail.ancestors).toEqual(['Get Started'])
    expect(trail.current).toBe('Server')
    expect(trail.prev).toEqual({ text: 'Welcome', link: '/welcome' })
    // Crosses the section boundary, as reading order does.
    expect(trail.next).toEqual({ text: 'Watch Mode', link: '/watch' })
  })

  it('leaves external links out of the reading order', () => {
    expect(resolveDocTrail(sidebar, '/watch').next).toBeUndefined()
  })

  it('has nothing to say about a page the sidebar does not list', () => {
    const trail = resolveDocTrail(sidebar, '/elsewhere')
    expect(renderBreadcrumb(trail)).toBe('')
    expect(renderDocPager(trail, link => link)).toBe('')
  })

  it('marks the current crumb for assistive technology', () => {
    const html = renderBreadcrumb(resolveDocTrail(sidebar, '/server'))
    expect(html).toContain('<li class="bp-breadcrumb-item">Get Started</li>')
    expect(html).toContain('<li class="bp-breadcrumb-item" aria-current="page">Server</li>')
  })
})

describe('the bun theme layout', () => {
  it('draws a breadcrumb in the page header and previous/next cards under the page', async () => {
    const html = await wrapInLayout('<h1>Server</h1><p>Lead.</p><h2 id="a">A</h2>', site('bun'), '/server')
    expect(html).toContain('class="bp-page-header has-breadcrumb"><nav class="bp-breadcrumb"')
    expect(html).toContain('class="bp-pager-link bp-pager-prev" href="/welcome"')
    expect(html).toContain('class="bp-pager-link bp-pager-next" href="/watch"')
  })

  it('keeps the lead paragraph under the title, ahead of the inline outline', async () => {
    const html = await wrapInLayout('<h1>Server</h1><p>Lead.</p><h2 id="a">A</h2><h2 id="b">B</h2>', site('bun'), '/server')
    const header = html.indexOf('bp-page-header has-breadcrumb')
    const lead = html.indexOf('<p>Lead.</p>', header)
    const outline = html.indexOf('class="bp-local-outline"', header)
    expect(lead).toBeGreaterThan(header)
    expect(outline).toBeGreaterThan(lead)
  })

  it('opens a page titled only in frontmatter with that title and its description', async () => {
    const html = await wrapInLayout('<h2 id="a">A</h2>', site('bun'), '/server', 'doc', { title: 'Server', description: 'Start an HTTP server' })
    expect(html).toContain('<h1>Server</h1>')
    expect(html).toContain('<p>Start an HTTP server</p>')
  })

  it('loads Archivo and Martian Mono unless the site chose its own fonts', async () => {
    const html = await wrapInLayout('<h1>Server</h1>', site('bun'), '/server')
    expect(html).toContain('family=Archivo:wdth,wght@62..100,700..900')
    expect(html).toContain('family=Martian+Mono:wdth,wght@87.5..100,400..600')
    const own = await wrapInLayout('<h1>Server</h1>', { ...site('bun'), fonts: { google: ['Inter:wght@400'] } }, '/server')
    expect(own).not.toContain('family=Archivo')
  })

  it('leaves the default theme as it was', async () => {
    const html = await wrapInLayout('<h1>Server</h1><h2 id="a">A</h2>', { ...site('vitepress'), fonts: undefined }, '/server')
    expect(html).not.toContain('class="bp-breadcrumb"')
    expect(html).not.toContain('class="bp-pager"')
    expect(html).not.toContain('family=Archivo')
  })
})

describe('the bun theme stylesheet', () => {
  const css = getBunThemeCSS()

  it('is the default theme with the Bun layer after it', () => {
    expect(css.indexOf('VitePress')).toBeLessThan(css.indexOf('Bun theme palette'))
  })

  it('draws in Bun\'s faces, accent and square corners', () => {
    expect(css).toContain('--bp-font-family-mono: "Martian Mono"')
    expect(css).toContain('--bun-font-display: "Archivo"')
    expect(css).toContain('--bun-accent: #ff1f8f')
    expect(css).toContain('--bun-radius: 3px')
  })

  it('recolours highlighted code in both palettes', () => {
    expect(css).toContain('html :is(.bp-doc, .BPHeroCode) .token[class*=\'keyword\']')
    expect(css).toContain('html.dark :is(.bp-doc, .BPHeroCode) .token[class*=\'keyword\']')
  })
})
