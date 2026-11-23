import type { BunPressConfig } from '../packages/bunpress/src/types'
import { describe, expect, it } from 'bun:test'
import { defaultConfig } from '../packages/bunpress/src/config'
import { hoistComponentStyles, HOISTED_STYLE_ATTRIBUTE } from '../packages/bunpress/src/hoist-styles'
import { wrapInLayout } from '../packages/bunpress/src/serve'

/**
 * A template's `<style>` ships beside its markup, in the body. A browser that
 * paints before the whole document has arrived draws that markup unstyled and
 * moves it when the block arrives, and a template rendered ten times ships
 * its block ten times. These pin the pass that puts each block in the head,
 * once, and the things it must not touch.
 */
const page = (body: string, head = '<style>:root{--a:1}</style>'): string =>
  `<!doctype html><html><head><title>t</title>${head}</head><body>${body}</body></html>`

const bodyOf = (html: string): string => html.slice(html.indexOf('</head>'))
const headOf = (html: string): string => html.slice(0, html.indexOf('</head>'))

describe('hoistComponentStyles', () => {
  it('moves a body stylesheet into the head, after the styles already there', () => {
    const html = hoistComponentStyles(page('<nav class="s">x</nav><style>.s{position:fixed}</style><p>y</p>'))

    expect(bodyOf(html)).not.toContain('<style')
    expect(bodyOf(html)).toContain('<nav class="s">x</nav><p>y</p>')
    // After the theme's own sheet: the cascade these blocks relied on.
    expect(headOf(html).indexOf(':root{--a:1}')).toBeLessThan(headOf(html).indexOf('.s{position:fixed}'))
    expect(headOf(html)).toContain(`<style ${HOISTED_STYLE_ATTRIBUTE}>.s{position:fixed}</style>`)
  })

  it('keeps one copy of a block a template rendered many times, in first-seen order', () => {
    const section = '<div class="sec"></div><style>.sec{margin:0}</style>'
    const html = hoistComponentStyles(page(`${section}${section}<style>.other{top:0}</style>${section}`))

    expect(html.match(/\.sec\{margin:0\}/g)).toHaveLength(1)
    expect(html.match(/<div class="sec"><\/div>/g)).toHaveLength(3)
    expect(html.indexOf('.sec{margin:0}')).toBeLessThan(html.indexOf('.other{top:0}'))
  })

  it('carries a block\'s own attributes with it', () => {
    const html = hoistComponentStyles(page('<style media="print" nonce="abc">.p{display:none}</style>'))

    expect(headOf(html)).toContain(`<style ${HOISTED_STYLE_ATTRIBUTE} media="print" nonce="abc">.p{display:none}</style>`)
  })

  it('treats the same rules under different attributes as different blocks', () => {
    const html = hoistComponentStyles(page('<style>.a{top:0}</style><style media="print">.a{top:0}</style>'))

    expect(headOf(html).match(/\.a\{top:0\}/g)).toHaveLength(2)
  })

  it('leaves alone a style that is not the page\'s own', () => {
    const untouched = [
      '<svg viewBox="0 0 1 1"><style>.dot{fill:red}</style><circle class="dot"/></svg>',
      '<template><style>.t{color:red}</style><p class="t">x</p></template>',
      '<script>var markup = "<style>.s{color:red}</style>";</script>',
      '<!-- <style>.c{color:red}</style> -->',
      '<pre><style>.k{color:red}</style></pre>',
      '<textarea><style>.x{color:red}</style></textarea>',
      '<noscript><style>.n{color:red}</style></noscript>',
    ]

    for (const region of untouched) {
      const html = hoistComponentStyles(page(`${region}<style>.real{top:0}</style>`))

      expect(bodyOf(html)).toContain(region)
      expect(headOf(html)).toContain('.real{top:0}')
    }
  })

  it('returns a document with nothing to move exactly as it was', () => {
    const plain = page('<p>no styles here</p>')
    expect(hoistComponentStyles(plain)).toBe(plain)

    const fragment = '<p>no head at all</p><style>.f{top:0}</style>'
    expect(hoistComponentStyles(fragment)).toBe(fragment)
  })

  it('does not touch the styles the head already holds', () => {
    const html = hoistComponentStyles(page('<style>.b{top:0}</style>', '<style>.h{top:0}</style><style>.h{top:0}</style>'))

    expect(headOf(html).match(/\.h\{top:0\}/g)).toHaveLength(2)
  })
})

describe('a rendered documentation page', () => {
  const config = {
    ...defaultConfig,
    title: 'Docs',
    themeConfig: {
      ...defaultConfig.themeConfig,
      sidebar: [
        { text: 'One', items: [{ text: 'A', link: '/a' }] },
        { text: 'Two', items: [{ text: 'B', link: '/b' }] },
        { text: 'Three', items: [{ text: 'C', link: '/c' }] },
      ],
    },
  } as BunPressConfig

  it('ships no stylesheet in its body', async () => {
    const html = await wrapInLayout('<h1>Title</h1><h2>Part</h2><p>Text</p>', config, '/a', 'doc', {})

    expect(html).toContain('class="BPSidebar"')
    expect(bodyOf(html)).not.toMatch(/<style\b/i)
  })

  it('styles and scripts its sidebar sections once, however many there are', async () => {
    const html = await wrapInLayout('<h1>Title</h1>', config, '/a', 'doc', {})

    expect(html.match(/class="BPSidebarItem sidebar-section/g)).toHaveLength(3)
    expect(html.match(/\.sidebar-section\{margin-bottom:4px/g)).toHaveLength(1)
    expect(html.match(/function toggleSection\(/g)).toHaveLength(1)
    expect(html.match(/function toggleSidebarGroup\(/g)).toHaveLength(1)
  })

  it('positions the sidebar from the head, before its markup is parsed', async () => {
    const html = await wrapInLayout('<h1>Title</h1>', config, '/a', 'doc', {})
    const rule = html.search(/\.BPSidebar\{position:fixed/)

    expect(rule).toBeGreaterThan(-1)
    expect(rule).toBeLessThan(html.indexOf('</head>'))
    expect(rule).toBeLessThan(html.indexOf('<nav class="BPSidebar"'))
  })

  it('teaches the router to bring hoisted styles along on navigation', async () => {
    const html = await wrapInLayout('<h1>Title</h1>', config, '/a', 'doc', {})

    expect(html).toContain(`doc.querySelectorAll('style[${HOISTED_STYLE_ATTRIBUTE}]')`)
  })
})
