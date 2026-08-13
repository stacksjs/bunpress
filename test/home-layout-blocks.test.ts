import { describe, expect, it } from 'bun:test'
import { normalizeLanguage, setLanguageAliases } from '../packages/bunpress/src/highlighter'
import { markdownToHtml } from '../packages/bunpress/src/serve'

/**
 * The home layout renders hero and features from frontmatter, so these drive
 * markdownToHtml with a frontmatter block rather than through a fixture site.
 */
function page(frontmatter: string, body = ''): string {
  return `---\n${frontmatter}\n---\n${body}`
}

describe('hero announcement', () => {
  it('renders the pill with its tag, text and link', async () => {
    const { html } = await markdownToHtml(page([
      'layout: home',
      'hero:',
      '  text: A language',
      '  announcement:',
      '    tag: v2',
      '    text: Read the release notes',
      '    link: /blog/v2',
    ].join('\n')))

    expect(html).toContain('class="BPHero-announcement"')
    expect(html).toContain('href="/blog/v2"')
    expect(html).toContain('>v2</span>')
    expect(html).toContain('>Read the release notes</span>')
  })

  it('is absent when the frontmatter does not ask for one', async () => {
    const { html } = await markdownToHtml(page('layout: home\nhero:\n  text: A language'))

    expect(html).not.toContain('BPHero-announcement')
  })
})

describe('hero code panel', () => {
  it('renders a single sample with its filename and no tabs', async () => {
    const { html } = await markdownToHtml(page([
      'layout: home',
      'hero:',
      '  text: A language',
      '  code:',
      '    lang: ts',
      '    file: server.ts',
      '    content: |',
      '      const port = 3000',
    ].join('\n')))

    expect(html).toContain('class="BPHeroCode"')
    expect(html).toContain('>server.ts</span>')
    expect(html).not.toContain('BPHeroCode-tab')
    expect(html).toContain('class="language-ts"')
  })

  it('renders several samples as tabs with only the first shown', async () => {
    const { html } = await markdownToHtml(page([
      'layout: home',
      'hero:',
      '  text: A language',
      '  code:',
      '    - file: a.ts',
      '      content: |',
      '        const a = 1',
      '    - file: b.ts',
      '      content: |',
      '        const b = 2',
    ].join('\n')))

    expect(html).toContain('role="tablist"')
    expect(html).toContain('>a.ts</button>')
    expect(html).toContain('>b.ts</button>')
    expect(html).toContain('data-index="0"')
    expect(html).toContain('data-index="1" hidden')
  })

  it('takes precedence over a configured image', async () => {
    const { html } = await markdownToHtml(page([
      'layout: home',
      'hero:',
      '  text: A language',
      '  image: /logo.png',
      '  code:',
      '    - content: |',
      '        const a = 1',
    ].join('\n')))

    expect(html).toContain('class="BPHeroCode"')
    expect(html).not.toContain('/logo.png')
  })

  it('falls back to the image when every sample is blank', async () => {
    const { html } = await markdownToHtml(page([
      'layout: home',
      'hero:',
      '  text: A language',
      '  image: /logo.png',
      '  code:',
      '    - content: "   "',
    ].join('\n')))

    expect(html).not.toContain('class="BPHeroCode"')
    expect(html).toContain('/logo.png')
  })
})

describe('feature cards', () => {
  it('adds a link affordance only to cards that navigate', async () => {
    const { html } = await markdownToHtml(page([
      'layout: home',
      'features:',
      '  - title: Linked',
      '    details: Goes somewhere.',
      '    link: /somewhere',
      '  - title: Static',
      '    details: Stays put.',
    ].join('\n')))

    expect(html).toContain('class="BPFeature is-linked"')
    expect(html).toContain('>Learn more<')
    expect(html).toContain('class="BPFeature"')
  })

  it('uses a custom link label when one is given', async () => {
    const { html } = await markdownToHtml(page([
      'layout: home',
      'features:',
      '  - title: Linked',
      '    details: Goes somewhere.',
      '    link: /somewhere',
      '    linkText: Read the guide',
    ].join('\n')))

    expect(html).toContain('>Read the guide<')
  })

  it('turns a grid into a bento with a span, clamped to three columns', async () => {
    const { html } = await markdownToHtml(page([
      'layout: home',
      'features:',
      '  - title: Wide',
      '    details: Two columns.',
      '    span: 2',
      '  - title: Too wide',
      '    details: Asked for nine.',
      '    span: 9',
    ].join('\n')))

    expect(html).toContain('--bp-feature-span:2')
    expect(html).toContain('--bp-feature-span:3')
  })
})

describe('fence language aliases', () => {
  it('resolves an aliased language to the target grammar', () => {
    setLanguageAliases({ home: 'rust' })

    expect(normalizeLanguage('home')).toBe('rust')
    expect(normalizeLanguage('HOME')).toBe('rust')

    setLanguageAliases(undefined)
  })

  it('leaves unaliased languages alone', () => {
    setLanguageAliases({ home: 'rust' })

    expect(normalizeLanguage('ts')).toBe('typescript')
    expect(normalizeLanguage('nonsense')).toBe('nonsense')

    setLanguageAliases(undefined)
  })

  it('clears previous aliases rather than merging them', () => {
    setLanguageAliases({ home: 'rust' })
    setLanguageAliases({ hm: 'rust' })

    expect(normalizeLanguage('home')).toBe('home')
    expect(normalizeLanguage('hm')).toBe('rust')

    setLanguageAliases(undefined)
  })
})
