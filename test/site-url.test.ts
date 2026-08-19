import type { BunPressConfig } from '../packages/bunpress/src/types'
import { describe, expect, test } from 'bun:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { siteUrl } from '../packages/bunpress/src/site-url'

/**
 * Seven features need the site's absolute base URL — the sitemap, the RSS feed,
 * robots.txt, the canonical link, the Open Graph tags, the JSON-LD block and the
 * hreflang tags — and each one used to read `config.sitemap.baseUrl` itself.
 * That made a sitemap-shaped key the only way to configure six things that are
 * not the sitemap, so authors reached for the obvious top-level `url` and
 * silently got none of them.
 */
describe('siteUrl', () => {
  test('reads the top-level url', () => {
    expect(siteUrl({ verbose: false, markdown: {}, url: 'https://example.com' })).toBe('https://example.com')
  })

  test('still reads sitemap.baseUrl, so configs that set it do not move', () => {
    expect(siteUrl({ verbose: false, markdown: {}, sitemap: { baseUrl: 'https://example.com' } })).toBe('https://example.com')
  })

  test('sitemap.baseUrl wins over url, for a sitemap hosted elsewhere', () => {
    const config: BunPressConfig = {
      verbose: false,
      markdown: {},
      url: 'https://site.example.com',
      sitemap: { baseUrl: 'https://cdn.example.com' },
    }
    expect(siteUrl(config)).toBe('https://cdn.example.com')
  })

  test('is empty when the site has no URL at all', () => {
    expect(siteUrl({ verbose: false, markdown: {} })).toBe('')
  })

  test('strips a trailing slash, so callers can concatenate a path directly', () => {
    expect(siteUrl({ verbose: false, markdown: {}, url: 'https://example.com/' })).toBe('https://example.com')
    expect(siteUrl({ verbose: false, markdown: {}, url: 'https://example.com/docs/' })).toBe('https://example.com/docs')
  })
})

/**
 * The resolver being right is not the same as every consumer using it. These
 * assert the output a `url`-only site actually gets, because that is the thing
 * that was missing: seventeen of our own docs sites set `url`, none of them set
 * `sitemap.baseUrl`, and every one of them shipped with no sitemap and no
 * link-preview card.
 */
describe('a site that sets only url', () => {
  const config: BunPressConfig = {
    verbose: false,
    markdown: {},
    title: 'Docs',
    description: 'A site that sets only url.',
    url: 'https://example.com',
  }

  test('generates a sitemap', async () => {
    const { buildSitemap } = await import('../packages/bunpress/src/sitemap')
    const xml = await buildSitemap(join(import.meta.dir, 'fixtures'), config)
    expect(xml).toContain('https://example.com')
  })

  test('points robots.txt at that sitemap', async () => {
    const { generateRobotsTxt } = await import('../packages/bunpress/src/robots')
    const out = await mkdtemp(join(tmpdir(), 'bunpress-site-url-'))
    await generateRobotsTxt(out, config)
    expect(await Bun.file(join(out, 'robots.txt')).text())
      .toContain('Sitemap: https://example.com/sitemap.xml')
    await rm(out, { recursive: true, force: true })
  })
})

/**
 * `nav` has always been readable from the top level and `sidebar` has not, so a
 * config that set both side by side kept its nav and silently lost its sidebar.
 * Thirty-one of our own docs configs are written that way.
 */
describe('a top-level sidebar', () => {
  test('beats the placeholder markdown.sidebar that defaultConfig ships', async () => {
    const { defaultConfig } = await import('../packages/bunpress/src/config')
    // The guard this ordering exists for: if the default ever stops shipping a
    // sidebar, the ordering below stops mattering and this test should be reread.
    expect(defaultConfig.markdown?.sidebar).toBeDefined()
  })

  test('renders its own items rather than the default ones', async () => {
    const { wrapInLayout } = await import('../packages/bunpress/src/serve')
    const html = await wrapInLayout('<h1>Home</h1>', {
      verbose: false,
      markdown: {},
      title: 'Docs',
      sidebar: [{ text: 'The Guide', link: '/guide' }],
    }, '/index')

    expect(html).toContain('The Guide')
  })
})

/**
 * `collectEndpoint` is the path the tracker posts to. It used to be hardcoded as
 * `/collect` in the generated client, which is the one part of a first-party
 * request a content blocker can match - so a self-hosted setup could be
 * configured correctly and still be filtered.
 */
describe('analytics collectEndpoint', () => {
  const base = { verbose: false, markdown: {}, title: 'Docs' }
  const analytics = { enabled: true, siteId: 'abc', apiEndpoint: 'https://a.example.com' }

  test('defaults to /collect', async () => {
    const { wrapInLayout } = await import('../packages/bunpress/src/serve')
    const html = await wrapInLayout('<p>x</p>', { ...base, analytics }, '/index')
    expect(html).toContain('/collect')
    expect(html).not.toContain('data-collect')
  })

  test('posts to the configured path instead', async () => {
    const { wrapInLayout } = await import('../packages/bunpress/src/serve')
    const html = await wrapInLayout('<p>x</p>', {
      ...base,
      analytics: { ...analytics, collectEndpoint: '/t' },
    }, '/index')
    expect(html).toContain('data-collect="/t"')
    expect(html).toContain('send(api+collect,data)')
  })

  test('tolerates a path written without its leading slash', async () => {
    const { wrapInLayout } = await import('../packages/bunpress/src/serve')
    const html = await wrapInLayout('<p>x</p>', {
      ...base,
      analytics: { ...analytics, collectEndpoint: 't' },
    }, '/index')
    expect(html).toContain('data-collect="/t"')
  })
})

/**
 * `<html lang>` is what a screen reader uses to pick a voice and what a search
 * engine uses to decide who to show a page to. It was fed only by `i18n`, so a
 * single-locale site had no way to say it was not in English.
 */
describe('site language', () => {
  const base = { verbose: false, markdown: {}, title: 'Docs' }

  test('defaults to en', async () => {
    const { wrapInLayout } = await import('../packages/bunpress/src/serve')
    expect(await wrapInLayout('<p>x</p>', base, '/index')).toContain('<html lang="en"')
  })

  test('uses the configured lang', async () => {
    const { wrapInLayout } = await import('../packages/bunpress/src/serve')
    const html = await wrapInLayout('<p>x</p>', { ...base, lang: 'de' }, '/index')
    expect(html).toContain('<html lang="de"')
  })

  test('i18n still wins, since a multi-locale site renders per locale', async () => {
    const { wrapInLayout } = await import('../packages/bunpress/src/serve')
    const html = await wrapInLayout('<p>x</p>', {
      ...base,
      lang: 'de',
      i18n: { locales: ['fr', 'es'], defaultLocale: 'fr' },
    }, '/index')
    expect(html).toContain('<html lang="fr"')
  })
})
