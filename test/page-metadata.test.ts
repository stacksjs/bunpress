import type { BunPressConfig, Frontmatter } from '../packages/bunpress/src/types'
import { describe, expect, it } from 'bun:test'
import { join } from 'node:path'
import { applyConfigPlugins, defaultConfig } from '../packages/bunpress/src/config'
import { wrapInLayout } from '../packages/bunpress/src/serve'

const BASE: BunPressConfig = {
  ...defaultConfig,
  title: 'My Site',
  sitemap: { ...defaultConfig.sitemap, enabled: true, baseUrl: 'https://docs.example.com' },
} as BunPressConfig

function render(content: string, frontmatter: Frontmatter = {}, config: BunPressConfig = BASE): Promise<string> {
  return wrapInLayout(content, config, '/page', 'doc', frontmatter)
}

describe('per-page metadata', () => {
  it('titles a page from its h1 when no frontmatter title is set', async () => {
    const html = await render('<h1>Getting Started</h1><p>Body.</p>')

    expect(html).toContain('<title>Getting Started | My Site</title>')
  })

  it('prefers a frontmatter title over the h1', async () => {
    const html = await render('<h1>Ignored</h1>', { title: 'Explicit' })

    expect(html).toContain('<title>Explicit | My Site</title>')
    expect(html).not.toContain('Ignored | My Site')
  })

  it('does not repeat the site title on a page that shares it', async () => {
    const html = await render('<h1>My Site</h1>')

    expect(html).toContain('<title>My Site</title>')
  })

  it('falls back to the site title when a page has no heading', async () => {
    const html = await render('<p>Just prose.</p>')

    expect(html).toContain('<title>My Site</title>')
  })

  it('uses a page description for the meta tag and the social cards', async () => {
    const html = await render('<h1>Page</h1>', { description: 'Page-specific text.' })

    expect(html).toContain('<meta name="description" content="Page-specific text.">')
    expect(html).toContain('<meta property="og:description" content="Page-specific text.">')
    expect(html).toContain('<meta name="twitter:description" content="Page-specific text.">')
  })

  it('carries the page title into Open Graph and Twitter, without the site suffix', async () => {
    const html = await render('<h1>Deep Dive</h1>')

    expect(html).toContain('<meta property="og:title" content="Deep Dive">')
    expect(html).toContain('<meta name="twitter:title" content="Deep Dive">')
  })

  it('uses a page image for both social cards', async () => {
    const html = await render('<h1>Page</h1>', { image: '/preview.png' })

    expect(html).toContain('<meta property="og:image" content="/preview.png">')
    expect(html).toContain('<meta name="twitter:image" content="/preview.png">')
  })

  it('declares the card shape a scraper needs before it fetches the image', async () => {
    const html = await render('<h1>Page</h1>', {}, {
      ...BASE,
      markdown: {
        ...BASE.markdown,
        meta: {
          'og:image': 'https://docs.example.com/social/og.png',
          'og:image:type': 'image/png',
          'og:image:width': '1200',
          'og:image:height': '630',
          'og:image:alt': 'A card',
          'twitter:card': 'summary_large_image',
        },
      },
    } as BunPressConfig)

    expect(html).toContain('<meta property="og:image:type" content="image/png">')
    expect(html).toContain('<meta property="og:image:width" content="1200">')
    expect(html).toContain('<meta property="og:image:height" content="630">')
    expect(html).toContain('<meta property="og:image:alt" content="A card">')
    // Falls back to the Open Graph alt rather than going without one.
    expect(html).toContain('<meta name="twitter:image:alt" content="A card">')
  })

  it('omits the card shape when the site has not declared an image', async () => {
    const html = await render('<h1>Page</h1>', {}, {
      ...BASE,
      markdown: { ...BASE.markdown, meta: { 'og:image:width': '1200' } },
    } as BunPressConfig)

    expect(html).not.toContain('og:image:width')
  })

  it('renders the site-wide head list on every page', async () => {
    // The only way to declare a favicon: nothing else here emits
    // `<link rel="icon">`, so a site without this ships the browser's
    // blank-page glyph in every tab.
    const html = await render('<h1>Page</h1>', {}, {
      ...BASE,
      head: [
        ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
        ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
      ],
    } as BunPressConfig)

    expect(html).toContain('<link rel="icon" href="/favicon.svg" type="image/svg+xml">')
    expect(html).toContain('<link rel="apple-touch-icon" href="/apple-touch-icon.png">')
  })

  it('refuses a script in the site-wide head list', async () => {
    // Same rule the per-page form carries: a script is not metadata.
    const html = await render('<h1>Page</h1>', {}, {
      ...BASE,
      head: [['script', { src: '/evil.js' }], ['meta', { name: 'ok', content: 'yes' }]],
    } as BunPressConfig)

    expect(html).not.toContain('/evil.js')
    expect(html).toContain('<meta name="ok" content="yes">')
  })

  it('honours an explicit canonical url', async () => {
    const html = await render('<h1>Page</h1>', { canonical: 'https://elsewhere.example/page' })

    expect(html).toContain('<link rel="canonical" href="https://elsewhere.example/page">')
    expect(html).not.toContain('<link rel="canonical" href="https://docs.example.com/page">')
  })

  it('emits keywords, author and robots', async () => {
    const html = await render('<h1>Page</h1>', {
      keywords: ['alpha', 'beta'],
      author: 'Ada Lovelace',
      robots: 'noindex, nofollow',
    })

    expect(html).toContain('<meta name="keywords" content="alpha, beta">')
    expect(html).toContain('<meta name="author" content="Ada Lovelace">')
    expect(html).toContain('<meta name="robots" content="noindex, nofollow">')
  })

  it('accepts keywords as a comma-separated string', async () => {
    const html = await render('<h1>Page</h1>', { keywords: 'alpha, beta' })

    expect(html).toContain('<meta name="keywords" content="alpha, beta">')
  })

  it('renders a frontmatter meta map, using property for og: keys', async () => {
    const html = await render('<h1>Page</h1>', {
      meta: { 'og:image': '/og.png', 'twitter:creator': '@ada' },
    })

    expect(html).toContain('<meta property="og:image" content="/og.png">')
    expect(html).toContain('<meta name="twitter:creator" content="@ada">')
  })

  it('renders frontmatter head entries', async () => {
    const html = await render('<h1>Page</h1>', {
      head: [['link', { rel: 'preconnect', href: 'https://fonts.example.com' }]],
    })

    expect(html).toContain('<link rel="preconnect" href="https://fonts.example.com">')
  })

  it('refuses to inject scripts through frontmatter head', async () => {
    const html = await render('<h1>Page</h1>', {
      head: [['script', { src: 'https://evil.example.com/x.js' }]],
    })

    expect(html).not.toContain('evil.example.com')
  })

  it('escapes attacker-controlled metadata', async () => {
    const html = await render('<h1>Page</h1>', { author: '"><script>alert(1)</script>' })

    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('&quot;&gt;&lt;script&gt;')
  })
})

describe('themeConfig styling', () => {
  it('maps colors and fonts onto theme variables', async () => {
    const html = await render('<h1>Page</h1>', {}, {
      ...BASE,
      themeConfig: {
        colors: { primary: '#e11d48', text: '#111827' },
        fonts: { body: 'Inter, sans-serif', mono: 'Fira Code, monospace', heading: 'Georgia, serif' },
      },
    } as BunPressConfig)

    expect(html).toContain('--bp-c-brand-1: #e11d48;')
    expect(html).toContain('--bp-c-text-1: #111827;')
    expect(html).toContain('--bp-font-family-base: Inter, sans-serif;')
    expect(html).toContain('--bp-font-family-mono: Fira Code, monospace;')
    // The heading font has no variable hook, so it is applied to the elements.
    expect(html).toContain('font-family: Georgia, serif;')
  })

  it('accepts cssVars with or without the leading dashes, and raw css', async () => {
    const html = await render('<h1>Page</h1>', {}, {
      ...BASE,
      themeConfig: {
        cssVars: { 'bp-sidebar-width': '300px', '--custom': '4px' },
        css: '.bp-doc h2 { letter-spacing: 0.05em; }',
      },
    } as BunPressConfig)

    expect(html).toContain('--bp-sidebar-width: 300px;')
    expect(html).toContain('--custom: 4px;')
    expect(html).toContain('letter-spacing: 0.05em;')
  })

  it('renders the logo and footer only when configured', async () => {
    const bare = await render('<h1>Page</h1>')
    // The class always exists in the stylesheet; only the markup is conditional.
    expect(bare).not.toContain('<img class="BPNavBarTitle-logo"')
    expect(bare).not.toContain('<footer class="BPFooter">')

    const themed = await render('<h1>Page</h1>', {}, {
      ...BASE,
      themeConfig: {
        logo: '/logo.svg',
        footer: { message: 'MIT Licensed.', copyright: 'Copyright © 2026' },
      },
    } as BunPressConfig)

    expect(themed).toContain('<img class="BPNavBarTitle-logo" src="/logo.svg"')
    expect(themed).toContain('MIT Licensed.')
    expect(themed).toContain('Copyright © 2026')
  })
})

/** Minimal config carrying just the plugins under test. */
function withPlugins(partial: Partial<BunPressConfig>): BunPressConfig {
  return { verbose: false, ...partial } as BunPressConfig
}

describe('config plugins', () => {
  it('applies extendConfig in declaration order', () => {
    const resolved = applyConfigPlugins(withPlugins({
      description: 'original',
      plugins: [
        { name: 'first', extendConfig: config => ({ ...config, description: 'first' }) },
        { name: 'second', extendConfig: config => ({ ...config, description: `${config.description}+second` }) },
      ],
    }))

    expect(resolved.description).toBe('first+second')
  })

  it('survives a plugin that throws', () => {
    const resolved = applyConfigPlugins(withPlugins({
      description: 'kept',
      plugins: [
        { name: 'broken', extendConfig: () => { throw new Error('boom') } },
        { name: 'working', extendConfig: config => ({ ...config, title: 'set' }) },
      ],
    }))

    expect(resolved.description).toBe('kept')
    expect(resolved.title).toBe('set')
  })

  it('ignores a plugin that returns nothing', () => {
    const resolved = applyConfigPlugins(withPlugins({
      description: 'kept',
      plugins: [{ name: 'noop', extendConfig: () => undefined as any }],
    }))

    expect(resolved.description).toBe('kept')
  })

  it('runs onConfigLoad once the config is final', () => {
    const seen: string[] = []
    applyConfigPlugins(withPlugins({
      plugins: [
        { name: 'a', extendConfig: config => ({ ...config, title: 'final' }) },
        { name: 'b', onConfigLoad: config => { seen.push(config.title ?? '') } },
      ],
    }))

    expect(seen).toEqual(['final'])
  })
})

describe('doc footer', () => {
  const withTheme = (themeConfig: BunPressConfig['themeConfig']): BunPressConfig =>
    ({ ...BASE, themeConfig } as BunPressConfig)

  const SOURCE = join(import.meta.dir, '..', 'docs', 'license.md')
  const DOCS = join(import.meta.dir, '..', 'docs')

  it('renders nothing when neither half is configured', async () => {
    const html = await wrapInLayout('<h1>Page</h1>', BASE, '/page', 'doc', {}, { sourceFile: SOURCE, docsDir: DOCS })

    expect(html).not.toContain('BPDocFooter-edit')
    expect(html).not.toContain('BPDocFooter-updated')
  })

  it('builds an edit url from the pattern', async () => {
    const config = withTheme({ editLink: { pattern: 'https://github.com/org/repo/edit/main/docs/:path' } })
    const html = await wrapInLayout('<h1>Page</h1>', config, '/page', 'doc', {}, { sourceFile: SOURCE, docsDir: DOCS })

    expect(html).toContain('href="https://github.com/org/repo/edit/main/docs/license.md"')
    expect(html).toContain('Edit this page')
  })

  it('treats a pattern without :path as a prefix', async () => {
    const config = withTheme({ editLink: { pattern: 'https://github.com/org/repo/edit/main/docs' } })
    const html = await wrapInLayout('<h1>Page</h1>', config, '/page', 'doc', {}, { sourceFile: SOURCE, docsDir: DOCS })

    expect(html).toContain('href="https://github.com/org/repo/edit/main/docs/license.md"')
  })

  it('uses a custom edit link label', async () => {
    const config = withTheme({ editLink: { pattern: 'https://x.dev/:path', text: 'Suggest a change' } })
    const html = await wrapInLayout('<h1>Page</h1>', config, '/page', 'doc', {}, { sourceFile: SOURCE, docsDir: DOCS })

    expect(html).toContain('Suggest a change')
  })

  it('is suppressed by editLink: false in frontmatter', async () => {
    const config = withTheme({ editLink: { pattern: 'https://x.dev/:path' } })
    const html = await wrapInLayout('<h1>Page</h1>', config, '/page', 'doc', { editLink: false }, { sourceFile: SOURCE, docsDir: DOCS })

    expect(html).not.toContain('BPDocFooter-edit')
  })

  it('renders a last-updated date from the source file', async () => {
    const config = withTheme({ lastUpdated: true })
    const html = await wrapInLayout('<h1>Page</h1>', config, '/page', 'doc', {}, { sourceFile: SOURCE, docsDir: DOCS })

    expect(html).toContain('BPDocFooter-updated')
    expect(html).toContain('Last updated')
    expect(html).toMatch(/<time datetime="\d{4}-\d{2}-\d{2}/)
  })

  it('lets a page opt in on its own', async () => {
    const html = await wrapInLayout('<h1>Page</h1>', BASE, '/page', 'doc', { lastUpdated: true }, { sourceFile: SOURCE, docsDir: DOCS })

    expect(html).toContain('BPDocFooter-updated')
  })

  it('lets a page supply the date itself', async () => {
    const config = withTheme({ lastUpdated: true })
    const html = await wrapInLayout('<h1>Page</h1>', config, '/page', 'doc', { lastUpdated: '2024-03-01T00:00:00Z' }, { sourceFile: SOURCE, docsDir: DOCS })

    expect(html).toContain('datetime="2024-03-01T00:00:00Z"')
  })

  it('is suppressed by lastUpdated: false in frontmatter', async () => {
    const config = withTheme({ lastUpdated: true })
    const html = await wrapInLayout('<h1>Page</h1>', config, '/page', 'doc', { lastUpdated: false }, { sourceFile: SOURCE, docsDir: DOCS })

    expect(html).not.toContain('BPDocFooter-updated')
  })

  it('honours a custom label and format', async () => {
    const config = withTheme({ lastUpdated: { text: 'Actualizado', formatOptions: { year: 'numeric' } } })
    const html = await wrapInLayout('<h1>Page</h1>', config, '/page', 'doc', { lastUpdated: '2024-03-01T00:00:00Z' }, { sourceFile: SOURCE, docsDir: DOCS })

    expect(html).toContain('Actualizado')
    expect(html).toContain('>2024</time>')
  })

  it('omits the edit link when there is no source file', async () => {
    // A generated page (the 404, say) has nothing to link to.
    const config = withTheme({ editLink: { pattern: 'https://x.dev/:path' } })
    const html = await wrapInLayout('<h1>Page</h1>', config, '/page', 'doc', {})

    expect(html).not.toContain('BPDocFooter-edit')
  })
})

describe('frontmatter layout toggles', () => {
  it('drops the sidebar when sidebar is false', async () => {
    const withBar = await wrapInLayout('<h1>Page</h1>', BASE, '/page', 'doc', {})
    const without = await wrapInLayout('<h1>Page</h1>', BASE, '/page', 'doc', { sidebar: false })

    expect(withBar).toContain('class="BPSidebar"')
    expect(without).not.toContain('class="BPSidebar"')
  })

  it('drops the nav bar when navbar is false', async () => {
    const withNav = await wrapInLayout('<h1>Page</h1>', BASE, '/page', 'doc', {})
    const without = await wrapInLayout('<h1>Page</h1>', BASE, '/page', 'doc', { navbar: false })

    expect(withNav).toContain('class="BPNav"')
    expect(without).not.toContain('class="BPNav"')
  })
})

describe('directory index URLs', () => {
  it('addresses a nested section index by its directory, not /index', async () => {
    const html = await wrapInLayout('<h1>Docs</h1>', BASE, '/docs/index', 'doc')

    expect(html).toContain('<link rel="canonical" href="https://docs.example.com/docs">')
    expect(html).toContain('<meta property="og:url" content="https://docs.example.com/docs">')
    expect(html).not.toContain('/docs/index"')
  })

  it('still collapses the root index to /', async () => {
    const html = await wrapInLayout('<h1>Home</h1>', BASE, '/index', 'home')

    expect(html).toContain('<link rel="canonical" href="https://docs.example.com/">')
  })

  it('leaves a page that merely ends in "index" alone', async () => {
    const html = await wrapInLayout('<h1>Reindex</h1>', BASE, '/guide/reindex', 'doc')

    expect(html).toContain('<link rel="canonical" href="https://docs.example.com/guide/reindex">')
  })
})
