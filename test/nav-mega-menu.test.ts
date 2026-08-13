import type { BunPressConfig, Frontmatter, NavItem } from '../packages/bunpress/src/types'
import { describe, expect, it } from 'bun:test'
import { defaultConfig } from '../packages/bunpress/src/config'
import { wrapInLayout } from '../packages/bunpress/src/serve'

/**
 * The nav renders through wrapInLayout rather than through an exported
 * generateNav, so these assert on the markup the browser actually receives.
 */
function configWith(nav: NavItem[]): BunPressConfig {
  return {
    ...defaultConfig,
    title: 'My Site',
    themeConfig: { ...defaultConfig.themeConfig, nav },
  } as BunPressConfig
}

/**
 * The theme stylesheet is inlined into every page, so a bare search of the
 * document finds class names in CSS rules as well as in markup. Every
 * assertion here runs against the header markup only.
 */
function navOf(html: string): string {
  const start = html.indexOf('<header class="BPNav">')
  if (start === -1)
    return ''
  const end = html.indexOf('</header>', start)
  return html.slice(start, end === -1 ? undefined : end)
}

async function render(
  nav: NavItem[],
  layout: 'doc' | 'home' | 'page' = 'home',
  currentPath = '/page',
  frontmatter: Frontmatter = {},
): Promise<string> {
  return navOf(await wrapInLayout('<h1>Page</h1>', configWith(nav), currentPath, layout, frontmatter))
}

const FLAT: NavItem[] = [
  {
    text: 'Links',
    items: [
      { text: 'GitHub', link: 'https://github.com/example' },
      { text: 'Discord', link: 'https://discord.gg/example' },
    ],
  },
]

const MEGA: NavItem[] = [
  {
    text: 'Features',
    columns: 2,
    footer: { text: 'See everything', link: '/all', note: 'Every row, with status.' },
    items: [
      {
        text: 'Language',
        items: [
          { text: 'Pattern Matching', link: '/features/match', description: 'Exhaustive match.', icon: '<svg></svg>' },
          { text: 'Generics', link: '/features/generics', description: 'Monomorphized.' },
        ],
      },
      {
        text: 'Toolchain',
        items: [
          { text: 'Compiler', link: '/features/compiler', description: 'One binary.' },
        ],
      },
    ],
  },
]

describe('nav dropdowns', () => {
  it('keeps a flat list of links as the compact flyout', async () => {
    const html = await render(FLAT)

    expect(html).toContain('BPNavBarMenu-group-items')
    expect(html).not.toContain('BPMega-columns')
    expect(html).not.toContain('is-mega')
  })

  it('upgrades to a mega panel when children carry descriptions', async () => {
    const html = await render([
      {
        text: 'Features',
        items: [{ text: 'Generics', link: '/g', description: 'Monomorphized.' }],
      },
    ])

    expect(html).toContain('BPMega-columns')
    expect(html).toContain('Monomorphized.')
  })

  it('upgrades to a mega panel when children are nested into groups', async () => {
    const html = await render([
      {
        text: 'Features',
        items: [{ text: 'Language', items: [{ text: 'Generics', link: '/g' }] }],
      },
    ])

    expect(html).toContain('BPMega-columns')
    expect(html).toContain('BPMega-group-title')
  })

  it('honours an explicit mega:false against content that would opt in', async () => {
    const html = await render([
      {
        text: 'Features',
        mega: false,
        items: [{ text: 'Generics', link: '/g', description: 'Monomorphized.' }],
      },
    ])

    expect(html).not.toContain('BPMega-columns')
  })

  it('renders group titles, icons, descriptions and the footer strip', async () => {
    const html = await render(MEGA)

    expect(html).toContain('>Language</p>')
    expect(html).toContain('>Toolchain</p>')
    expect(html).toContain('BPMega-item-icon')
    expect(html).toContain('>Exhaustive match.</span>')
    expect(html).toContain('BPMega-footer')
    expect(html).toContain('>See everything</a>')
    expect(html).toContain('Every row, with status.')
  })

  it('uses the configured column count', async () => {
    const html = await render(MEGA)

    expect(html).toContain('--bp-mega-columns:2')
  })

  it('caps the column count at four so a long menu wraps instead of shrinking', async () => {
    const groups = Array.from({ length: 6 }, (_, i) => ({
      text: `Group ${i}`,
      items: [{ text: `Item ${i}`, link: `/i${i}` }],
    }))
    const html = await render([{ text: 'Features', items: groups }])

    expect(html).toContain('--bp-mega-columns:4')
  })

  it('keeps loose links alongside grouped ones instead of dropping them', async () => {
    const html = await render([
      {
        text: 'Features',
        items: [
          { text: 'Overview', link: '/overview' },
          { text: 'Language', items: [{ text: 'Generics', link: '/g' }] },
        ],
      },
    ])

    expect(html).toContain('>Overview</span>')
    expect(html).toContain('>Generics</span>')
  })

  it('marks a top-level entry active when a grandchild matches the path', async () => {
    const html = await render(MEGA, 'home', '/features/generics')

    expect(html).toContain('BPNavBarMenu-group is-mega is-active')
  })
})

describe('stacked nav for narrow viewports', () => {
  it('ships the toggle and panel on layouts without a sidebar', async () => {
    const html = await render(MEGA, 'home')

    expect(html).toContain('class="BPNavToggle"')
    expect(html).toContain('id="bp-nav-screen"')
    expect(html).toContain('BPNavScreen-summary')
  })

  it('omits both on the doc layout, which already has a sidebar hamburger', async () => {
    const html = await render(MEGA, 'doc')

    expect(html).toContain('BPNavBarHamburger')
    expect(html).not.toContain('class="BPNavToggle"')
    expect(html).not.toContain('id="bp-nav-screen"')
  })

  it('flattens mega groups into titled sections', async () => {
    const html = await render(MEGA, 'home')

    expect(html).toContain('BPNavScreen-subtitle')
    expect(html).toContain('>Pattern Matching</a>')
  })

  it('starts the panel hidden so it cannot cover the page before a tap', async () => {
    const html = await render(MEGA, 'home')

    expect(html).toContain('id="bp-nav-screen" hidden')
  })

  it('opens the section containing the current page', async () => {
    const html = await render([
      { text: 'Guide', items: [{ text: 'Install', link: '/guide/install' }] },
    ], 'home', '/guide/install')

    expect(html).toContain('<details class="BPNavScreen-section" open>')
  })

  it('drops with the rest of the bar when navbar is false', async () => {
    const html = await render(MEGA, 'home', '/page', { navbar: false })

    expect(html).not.toContain('id="bp-nav-screen"')
  })
})
