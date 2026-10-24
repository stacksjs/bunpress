import { describe, expect, it } from 'bun:test'
import { wrapInLayout } from '../packages/bunpress/src/serve'

describe('top-level sidebar destinations', () => {
  it('renders flat pages as mounted links with the current page selected', async () => {
    const html = await wrapInLayout('<p>Guide</p>', {
      verbose: false,
      title: 'Docs',
      basePath: '/docs',
      sidebar: [{ text: 'Overview', link: '/' }, { text: 'Guide', link: '/guide' }],
    }, '/guide')
    expect(html).toContain('<a class="BPSidebarItem-link" href="/docs/">Overview</a>')
    expect(html).toContain('<a class="BPSidebarItem-link is-active" href="/docs/guide">Guide</a>')
    expect(html).not.toContain('class="sidebar-section-toggle"')
    expect(html).toContain('.BPSidebarItem-link.is-active')
  })

  it('keeps a linked group navigable while exposing its children', async () => {
    const html = await wrapInLayout('<p>Guide</p>', {
      verbose: false,
      title: 'Docs',
      sidebar: [{ text: 'Guide', link: '/guide', collapsed: true, items: [{ text: 'Start', link: '/guide/start' }] }],
    }, '/guide/start')
    expect(html).toContain('<a class="BPSidebarGroup-link" href="/guide">Guide</a>')
    expect(html).toContain('class="BPSidebarGroup has-active"')
    expect(html).toContain('class="BPSidebarItem-link is-active" href="/guide/start"')
    expect(html).toContain('aria-expanded="true"')
  })
})
