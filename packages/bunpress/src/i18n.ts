import type { BunPressConfig, I18nSiteConfig } from './types'
import { siteUrl } from './site-url'

/**
 * Multi-language support, backed by `ts-i18n`.
 *
 * Two things are localized and they are deliberately separate:
 *
 * - **Content** — one markdown file per locale, resolved by path. A locale
 *   that has not translated a page falls back to the default locale's copy,
 *   so adding a language never produces 404s.
 * - **Chrome** — nav labels, the outline heading, the search placeholder.
 *   These come from `ts-i18n` translation files, with English defaults so a
 *   site that ships no translation files still reads correctly.
 */

/** UI strings the theme looks up, and what they fall back to. */
const UI_DEFAULTS: Record<string, string> = {
  'search.placeholder': 'Search documentation',
  'toc.title': 'On this page',
  'nav.menu': 'Menu',
  'search.noResults': 'No results for',
  'theme.toggle': 'Toggle dark mode',
}

export interface ResolvedI18n {
  /** False when the site is single-language; every other field is still safe to read. */
  enabled: boolean
  locales: string[]
  defaultLocale: string
  fallbackLocale: string | string[]
  localePath: string
  detectLocale: boolean
  localeNames: Record<string, string>
  localeConfig: Record<string, Partial<BunPressConfig>>
  /** Populated by `loadI18nTranslations`; empty until then. */
  translate: (key: string, locale: string, params?: Record<string, string | number>) => string
}

/** A site with no i18n block behaves exactly as it always has. */
export function resolveI18nConfig(config: BunPressConfig | undefined): ResolvedI18n {
  const i18n: I18nSiteConfig | undefined = config?.i18n
  const locales = (i18n?.locales ?? []).filter(Boolean)
  const defaultLocale = i18n?.defaultLocale || locales[0] || 'en'

  // A single locale needs no prefixes, no switcher and no fallbacks — the
  // machinery would only add URLs that redirect to themselves.
  const enabled = (i18n?.enabled ?? locales.length > 1) && locales.length > 0

  return {
    enabled,
    locales: enabled ? locales : [defaultLocale],
    defaultLocale,
    fallbackLocale: i18n?.fallbackLocale ?? defaultLocale,
    localePath: i18n?.localePath ?? './locales',
    detectLocale: i18n?.detectLocale === true,
    localeNames: i18n?.localeNames ?? {},
    localeConfig: i18n?.localeConfig ?? {},
    translate: (key: string) => UI_DEFAULTS[key] ?? key,
  }
}

/**
 * Load translation files and attach a translator.
 *
 * `ts-i18n` is imported lazily: a site that lists no locales should not pay
 * for it, and a missing install degrades to the English defaults rather than
 * failing the build.
 */
export async function loadI18nTranslations(resolved: ResolvedI18n, config: BunPressConfig | undefined): Promise<ResolvedI18n> {
  if (!resolved.enabled)
    return resolved

  try {
    const { createTranslator, loadTranslations } = await import('@stacksjs/ts-i18n')

    const trees = await loadTranslations({
      translationsDir: resolved.localePath,
      defaultLocale: resolved.defaultLocale,
      fallbackLocale: resolved.fallbackLocale,
      sources: config?.i18n?.sources ?? ['ts', 'yaml', 'json'],
      // The directory is optional: chrome falls back to English, so a site
      // can translate its content without authoring any UI strings.
      optional: true,
      verbose: false,
    })

    const translator = createTranslator(trees, {
      defaultLocale: resolved.defaultLocale,
      fallbackLocale: resolved.fallbackLocale,
    })

    // ts-i18n namespaces a tree by filename, so `locales/es/ui.yml` yields
    // `ui.search.placeholder` while `locales/es.yml` yields
    // `search.placeholder`. Both layouts are valid and the docs show both, so
    // a chrome key is probed bare first and then under each namespace the
    // translations actually define — no namespace configuration required.
    const namespaces = new Set<string>()
    for (const tree of Object.values(trees as Record<string, Record<string, unknown>>)) {
      for (const name of Object.keys(tree ?? {})) namespaces.add(name)
    }
    // `theme` first as the conventional home for UI strings; the rest sorted
    // so resolution is deterministic across runs.
    const ordered = [...namespaces].sort((a, b) => (a === 'theme' ? -1 : b === 'theme' ? 1 : a.localeCompare(b)))

    return {
      ...resolved,
      translate: (key, locale, params) => {
        for (const candidate of [key, ...ordered.map(ns => `${ns}.${key}`)]) {
          try {
            const value = (translator as any)(candidate, locale, params)
            // ts-i18n echoes the key back when nothing matched, which would
            // put a raw dotted key in the UI.
            if (typeof value === 'string' && value && value !== candidate)
              return value
          }
          catch {
            // try the next candidate
          }
        }
        return UI_DEFAULTS[key] ?? key
      },
    }
  }
  catch (error) {
    console.warn('[bunpress] i18n translations could not be loaded; falling back to defaults —', error instanceof Error ? error.message : error)
    return resolved
  }
}

/**
 * Split a request path into its locale and the path within that locale.
 *
 * The default locale lives at the root, so `/guide` is the default locale and
 * `/es/guide` is Spanish. A prefix that is not a configured locale is left
 * alone — otherwise a page genuinely called `/fr` would be unreachable.
 */
export function splitLocaleFromPath(i18n: ResolvedI18n, pathname: string): { locale: string, path: string } {
  if (!i18n.enabled)
    return { locale: i18n.defaultLocale, path: pathname }

  const match = pathname.match(/^\/([^/]+)(\/.*)?$/)
  if (match && i18n.locales.includes(match[1]) && match[1] !== i18n.defaultLocale)
    return { locale: match[1], path: match[2] || '/' }

  return { locale: i18n.defaultLocale, path: pathname }
}

/** Build the public URL for a path in a given locale. */
export function localizeUrl(i18n: ResolvedI18n, locale: string, path: string): string {
  if (!i18n.enabled || locale === i18n.defaultLocale)
    return path || '/'

  const clean = path === '/' ? '' : path
  return `/${locale}${clean}` || `/${locale}`
}

/**
 * Candidate markdown files for a path, most specific first.
 *
 * Both documented layouts are supported — a directory per locale
 * (`docs/es/guide.md`) and a suffix per file (`docs/guide.es.md`) — because
 * both appear in the guide and neither is wrong. Default-locale files come
 * last so an untranslated page still renders instead of 404ing.
 */
export function localeContentCandidates(i18n: ResolvedI18n, root: string, locale: string, path: string): string[] {
  const base = path === '/' ? '/index' : path
  const candidates: string[] = []

  if (i18n.enabled && locale !== i18n.defaultLocale) {
    candidates.push(`${root}/${locale}${base}.md`)
    candidates.push(`${root}/${locale}${base}/index.md`)
    candidates.push(`${root}${base}.${locale}.md`)
  }

  candidates.push(`${root}${base}.md`)
  candidates.push(`${root}${base}/index.md`)

  // An explicit default-locale copy, for sites that suffix every language.
  if (i18n.enabled)
    candidates.push(`${root}${base}.${i18n.defaultLocale}.md`)

  return candidates
}

/**
 * Merge a locale's overrides over the site config.
 *
 * Shallow by design for most keys, but `themeConfig` and `markdown` are merged
 * one level deeper: a locale usually overrides a single nested value (a footer
 * message, a title) and a shallow merge would silently drop the rest.
 */
export function configForLocale(config: BunPressConfig, i18n: ResolvedI18n, locale: string): BunPressConfig {
  const overrides = i18n.localeConfig[locale]
  if (!overrides)
    return config

  return {
    ...config,
    ...overrides,
    themeConfig: overrides.themeConfig
      ? { ...config.themeConfig, ...overrides.themeConfig }
      : config.themeConfig,
    markdown: overrides.markdown
      ? { ...config.markdown, ...overrides.markdown }
      : config.markdown,
  }
}

/** Display name for a locale, falling back to the code itself. */
export function localeLabel(i18n: ResolvedI18n, locale: string): string {
  return i18n.localeNames[locale] ?? locale
}

/**
 * `hreflang` alternates for the current page.
 *
 * Search engines use these to serve the right language and to avoid treating
 * translations as duplicate content, so they only mean anything with an
 * absolute base URL to point at.
 */
export function generateHreflangTags(i18n: ResolvedI18n, config: BunPressConfig, path: string): string {
  if (!i18n.enabled)
    return ''

  const baseUrl = siteUrl(config)
  if (!baseUrl)
    return ''

  const tags = i18n.locales.map((locale) => {
    const href = `${baseUrl}${localizeUrl(i18n, locale, path === '/index' ? '/' : path)}`
    return `<link rel="alternate" hreflang="${locale}" href="${href}">`
  })

  tags.push(`<link rel="alternate" hreflang="x-default" href="${baseUrl}${path === '/index' ? '/' : path}">`)
  return tags.join('\n  ')
}

/**
 * Client script that sends a first-time visitor to their browser's language.
 *
 * Deliberately conservative: it runs only at the default locale's root, only
 * once per browser, and records any manual switch so it never fights a
 * reader who chose a language on purpose.
 */
export function generateLocaleDetectionScript(i18n: ResolvedI18n): string {
  if (!i18n.enabled || !i18n.detectLocale)
    return ''

  return `
(function () {
  var LOCALES = ${JSON.stringify(i18n.locales)};
  var DEFAULT = ${JSON.stringify(i18n.defaultLocale)};
  var KEY = 'bunpress-locale';

  try {
    var current = location.pathname.split('/')[1];
    if (LOCALES.indexOf(current) !== -1) {
      // Reading a non-default locale is itself a choice; remember it.
      localStorage.setItem(KEY, current);
      return;
    }
    if (localStorage.getItem(KEY)) return;

    var preferred = (navigator.languages || [navigator.language || ''])
      .map(function (tag) { return String(tag).toLowerCase(); });

    for (var i = 0; i < preferred.length; i++) {
      var tag = preferred[i];
      var exact = LOCALES.indexOf(tag) !== -1 ? tag : null;
      // 'en-GB' should match an 'en' locale.
      var base = exact || (LOCALES.indexOf(tag.split('-')[0]) !== -1 ? tag.split('-')[0] : null);
      if (base && base !== DEFAULT) {
        localStorage.setItem(KEY, base);
        location.replace(\`/\${base}\${location.pathname}\${location.search}\${location.hash}\`);
        return;
      }
      if (base === DEFAULT) return;
    }
  } catch (_) {
    // Storage or history unavailable: leave the reader where they are.
  }
})();
`.trim()
}
