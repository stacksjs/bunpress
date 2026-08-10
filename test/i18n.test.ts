import type { BunPressConfig } from '../packages/bunpress/src/types'
import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  configForLocale,
  generateHreflangTags,
  generateLocaleDetectionScript,
  loadI18nTranslations,
  localeContentCandidates,
  localeLabel,
  localizeUrl,
  resolveI18nConfig,
  splitLocaleFromPath,
} from '../packages/bunpress/src/i18n'

const FIXTURE_DIR = join(import.meta.dir, 'fixtures-i18n')

function config(i18n: BunPressConfig['i18n'], rest: Partial<BunPressConfig> = {}): BunPressConfig {
  return { verbose: false, i18n, ...rest } as BunPressConfig
}

const MULTI = config({ locales: ['en', 'es', 'fr'], defaultLocale: 'en' })

describe('i18n resolution', () => {
  it('stays disabled without an i18n block', () => {
    const resolved = resolveI18nConfig(config(undefined))

    expect(resolved.enabled).toBe(false)
    expect(resolved.defaultLocale).toBe('en')
    expect(resolved.locales).toEqual(['en'])
  })

  it('stays disabled for a single locale', () => {
    // One language needs no prefixes or switcher; the machinery would only
    // add URLs that redirect to themselves.
    expect(resolveI18nConfig(config({ locales: ['en'] })).enabled).toBe(false)
  })

  it('enables itself for two or more locales', () => {
    const resolved = resolveI18nConfig(MULTI)

    expect(resolved.enabled).toBe(true)
    expect(resolved.locales).toEqual(['en', 'es', 'fr'])
  })

  it('takes the first locale as the default when none is named', () => {
    expect(resolveI18nConfig(config({ locales: ['de', 'en'] })).defaultLocale).toBe('de')
  })

  it('can be switched off explicitly', () => {
    expect(resolveI18nConfig(config({ locales: ['en', 'es'], enabled: false })).enabled).toBe(false)
  })
})

describe('locale routing', () => {
  const i18n = resolveI18nConfig(MULTI)

  it('serves the default locale at the root', () => {
    expect(splitLocaleFromPath(i18n, '/guide')).toEqual({ locale: 'en', path: '/guide' })
    expect(splitLocaleFromPath(i18n, '/')).toEqual({ locale: 'en', path: '/' })
  })

  it('reads a locale prefix', () => {
    expect(splitLocaleFromPath(i18n, '/es/guide')).toEqual({ locale: 'es', path: '/guide' })
    expect(splitLocaleFromPath(i18n, '/es')).toEqual({ locale: 'es', path: '/' })
  })

  it('leaves an unknown prefix alone', () => {
    // A page genuinely called /de must stay reachable when de is not a locale.
    expect(splitLocaleFromPath(i18n, '/de/guide')).toEqual({ locale: 'en', path: '/de/guide' })
  })

  it('never prefixes the default locale when building urls', () => {
    expect(localizeUrl(i18n, 'en', '/guide')).toBe('/guide')
    expect(localizeUrl(i18n, 'es', '/guide')).toBe('/es/guide')
    expect(localizeUrl(i18n, 'es', '/')).toBe('/es')
  })

  it('returns paths unchanged when i18n is off', () => {
    const off = resolveI18nConfig(config(undefined))

    expect(localizeUrl(off, 'en', '/guide')).toBe('/guide')
    expect(splitLocaleFromPath(off, '/es/guide')).toEqual({ locale: 'en', path: '/es/guide' })
  })
})

describe('content resolution', () => {
  const i18n = resolveI18nConfig(MULTI)

  it('prefers the locale directory, then the suffix, then the default copy', () => {
    expect(localeContentCandidates(i18n, './docs', 'es', '/guide')).toEqual([
      './docs/es/guide.md',
      './docs/es/guide/index.md',
      './docs/guide.es.md',
      './docs/guide.md',
      './docs/guide/index.md',
      './docs/guide.en.md',
    ])
  })

  it('maps the root path to index', () => {
    expect(localeContentCandidates(i18n, './docs', 'es', '/')[0]).toBe('./docs/es/index.md')
  })

  it('does not look for locale files under the default locale', () => {
    const candidates = localeContentCandidates(i18n, './docs', 'en', '/guide')

    expect(candidates).not.toContain('./docs/en/guide.md')
    expect(candidates[0]).toBe('./docs/guide.md')
  })
})

describe('per-locale config', () => {
  const base = config(
    { locales: ['en', 'es'], defaultLocale: 'en', localeConfig: { es: { title: 'Documentación' } } },
    { title: 'Docs', description: 'English', themeConfig: { logo: '/logo.svg', footer: { message: 'MIT' } } },
  )
  const i18n = resolveI18nConfig(base)

  it('leaves the default locale untouched', () => {
    expect(configForLocale(base, i18n, 'en').title).toBe('Docs')
  })

  it('applies overrides for a locale', () => {
    const es = configForLocale(base, i18n, 'es')

    expect(es.title).toBe('Documentación')
    // Untouched keys survive.
    expect(es.description).toBe('English')
  })

  it('merges themeConfig one level deep instead of replacing it', () => {
    const withTheme = config(
      { locales: ['en', 'es'], defaultLocale: 'en', localeConfig: { es: { themeConfig: { logo: '/es.svg' } } } },
      { themeConfig: { logo: '/logo.svg', footer: { message: 'MIT' } } },
    )
    const es = configForLocale(withTheme, resolveI18nConfig(withTheme), 'es')

    expect(es.themeConfig?.logo).toBe('/es.svg')
    expect(es.themeConfig?.footer?.message).toBe('MIT')
  })
})

describe('hreflang', () => {
  it('emits one alternate per locale plus x-default', () => {
    const cfg = config({ locales: ['en', 'es'], defaultLocale: 'en' }, {
      sitemap: { enabled: true, baseUrl: 'https://docs.example.com' },
    } as Partial<BunPressConfig>)
    const tags = generateHreflangTags(resolveI18nConfig(cfg), cfg, '/guide')

    expect(tags).toContain('hreflang="en" href="https://docs.example.com/guide"')
    expect(tags).toContain('hreflang="es" href="https://docs.example.com/es/guide"')
    expect(tags).toContain('hreflang="x-default"')
  })

  it('emits nothing without an absolute base url', () => {
    // Relative alternates mean nothing to a crawler.
    expect(generateHreflangTags(resolveI18nConfig(MULTI), MULTI, '/guide')).toBe('')
  })

  it('emits nothing for a single-language site', () => {
    const single = config({ locales: ['en'] }, { sitemap: { enabled: true, baseUrl: 'https://x.dev' } } as Partial<BunPressConfig>)

    expect(generateHreflangTags(resolveI18nConfig(single), single, '/guide')).toBe('')
  })
})

describe('locale detection script', () => {
  it('is emitted only when asked for', () => {
    expect(generateLocaleDetectionScript(resolveI18nConfig(MULTI))).toBe('')

    const opted = config({ locales: ['en', 'es'], defaultLocale: 'en', detectLocale: true })
    expect(generateLocaleDetectionScript(resolveI18nConfig(opted))).toContain('bunpress-locale')
  })

  it('emits client-side template literals rather than interpolating them at build time', () => {
    const opted = config({ locales: ['en', 'es'], defaultLocale: 'en', detectLocale: true })
    const script = generateLocaleDetectionScript(resolveI18nConfig(opted))

    expect(script).toContain('${base}')
    expect(script).toContain('${location.pathname}')
  })
})

describe('labels', () => {
  it('falls back to the locale code', () => {
    const named = config({ locales: ['en', 'es'], localeNames: { es: 'Español' } })
    const i18n = resolveI18nConfig(named)

    expect(localeLabel(i18n, 'es')).toBe('Español')
    expect(localeLabel(i18n, 'en')).toBe('en')
  })
})

describe('translations', () => {
  beforeAll(async () => {
    await rm(FIXTURE_DIR, { recursive: true, force: true })
    await mkdir(join(FIXTURE_DIR, 'es'), { recursive: true })
    await mkdir(join(FIXTURE_DIR, 'de'), { recursive: true })

    // Namespaced by filename, which is how ts-i18n loads a locale directory.
    await writeFile(join(FIXTURE_DIR, 'es', 'ui.yml'), 'search:\n  placeholder: Buscar\ntoc:\n  title: En esta página\n')
    // Root-level keys, the other documented layout.
    await writeFile(join(FIXTURE_DIR, 'de.yml'), 'search:\n  placeholder: Suchen\n')
  })

  afterAll(async () => {
    await rm(FIXTURE_DIR, { recursive: true, force: true })
  })

  it('resolves keys under a filename namespace', async () => {
    const cfg = config({ locales: ['en', 'es', 'de'], defaultLocale: 'en', localePath: FIXTURE_DIR })
    const i18n = await loadI18nTranslations(resolveI18nConfig(cfg), cfg)

    expect(i18n.translate('search.placeholder', 'es')).toBe('Buscar')
    expect(i18n.translate('toc.title', 'es')).toBe('En esta página')
  })

  it('resolves keys written at the root of a locale file', async () => {
    const cfg = config({ locales: ['en', 'es', 'de'], defaultLocale: 'en', localePath: FIXTURE_DIR })
    const i18n = await loadI18nTranslations(resolveI18nConfig(cfg), cfg)

    expect(i18n.translate('search.placeholder', 'de')).toBe('Suchen')
  })

  it('falls back to the English default for an untranslated key', async () => {
    const cfg = config({ locales: ['en', 'es', 'de'], defaultLocale: 'en', localePath: FIXTURE_DIR })
    const i18n = await loadI18nTranslations(resolveI18nConfig(cfg), cfg)

    // German has no toc.title, and the raw key must never reach the UI.
    expect(i18n.translate('toc.title', 'de')).toBe('On this page')
  })

  it('survives a missing translations directory', async () => {
    const cfg = config({ locales: ['en', 'es'], defaultLocale: 'en', localePath: join(FIXTURE_DIR, 'does-not-exist') })
    const i18n = await loadI18nTranslations(resolveI18nConfig(cfg), cfg)

    expect(i18n.translate('search.placeholder', 'es')).toBe('Search documentation')
  })
})
