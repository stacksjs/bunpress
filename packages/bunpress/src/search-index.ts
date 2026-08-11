import type { BunPressConfig, LocalSearchOptions, SearchConfig } from './types'
import { Glob, YAML } from 'bun'
import { join } from 'node:path'
import { localizeUrl, resolveI18nConfig } from './i18n'
import { createFenceTracker, stripFencedCode } from './markdown-fences'
import { generateSlug, markdownHeadingText, reserveUniqueSlug } from './toc'

/**
 * One searchable record.
 *
 * The unit is a *section*, not a page: a reader searching "line numbers" wants
 * to land on the heading that covers it, not at the top of a 3,000-word
 * reference page and hunt. Every h2-h6 opens a new record, and the prose that
 * follows it — up to the next heading — is that record's body.
 */
export interface SearchRecord {
  /** Anchor-qualified URL, e.g. `/config#markdown-plugin-options`. */
  url: string
  /** Title of the page the section belongs to. */
  page: string
  /** The section's own heading, or the page title for the lead section. */
  title: string
  /** Plain text of the section, truncated. */
  text: string
  /** Heading depth (1 for the page's lead section). */
  level: number
  /** Frontmatter keywords, so a page can match terms it never spells out. */
  keywords?: string[]
  /** Locale this record belongs to. Absent on single-language sites. */
  locale?: string
}

/** Path the client fetches the index from. */
export const SEARCH_INDEX_PATH = '/search-index.json'

/** Defaults for every documented local-search option. */
export const DEFAULT_LOCAL_SEARCH_OPTIONS: Required<
  Pick<LocalSearchOptions, 'include' | 'exclude' | 'searchFields' | 'maxResults' | 'minQueryLength' | 'fuzzy' | 'fuzziness' | 'stemmer' | 'maxContentLength'>
> & { boost: Required<NonNullable<LocalSearchOptions['boost']>> } = {
  include: ['**/*.md'],
  // `public/` is served verbatim, so its markdown is not a page.
  exclude: ['public/**', '**/node_modules/**'],
  searchFields: ['title', 'content', 'headings', 'keywords'],
  maxResults: 10,
  minQueryLength: 1,
  fuzzy: false,
  fuzziness: 1,
  stemmer: 'none',
  maxContentLength: 800,
  boost: { title: 10, headings: 5, content: 1 },
}

/**
 * Merge user options over the defaults.
 * Exported so the client-side runtime is configured from exactly the same
 * resolution the indexer used — two copies of this logic would drift.
 */
export function resolveSearchOptions(search: SearchConfig | undefined): typeof DEFAULT_LOCAL_SEARCH_OPTIONS {
  const options = search?.options ?? {}

  return {
    ...DEFAULT_LOCAL_SEARCH_OPTIONS,
    ...options,
    include: options.include ?? DEFAULT_LOCAL_SEARCH_OPTIONS.include,
    exclude: options.exclude ?? DEFAULT_LOCAL_SEARCH_OPTIONS.exclude,
    searchFields: options.searchFields ?? DEFAULT_LOCAL_SEARCH_OPTIONS.searchFields,
    // The top-level `maxResults` is the documented shorthand for the nested one.
    maxResults: options.maxResults ?? search?.maxResults ?? DEFAULT_LOCAL_SEARCH_OPTIONS.maxResults,
    boost: { ...DEFAULT_LOCAL_SEARCH_OPTIONS.boost, ...(options.boost ?? {}) },
  }
}

/**
 * Everything the browser runtime needs, derived from the same resolution the
 * indexer used so ranking in the page matches how the index was built.
 *
 * `tokenize` and `onSearch` are user functions from a build-time config, so
 * they cross to the browser as source text. That means they must not close
 * over build-time values — the documented examples reference page globals,
 * which is exactly what survives the trip.
 */
export interface SearchRuntimeConfig {
  indexUrl: string
  placeholder: string
  lazy: boolean
  maxResults: number
  minQueryLength: number
  searchFields: string[]
  boost: { title: number, headings: number, content: number }
  fuzzy: boolean
  fuzziness: number
  stemmer: 'english' | 'none'
  shortcuts: { keyboard: boolean, keys: Array<{ key: string, meta: boolean, ctrl: boolean, alt: boolean, shift: boolean }> }
  result: { showDescription: boolean, descriptionLength: number, highlightMatches: boolean, showPath: boolean }
  tokenizeSource: string | null
  onSearchSource: string | null
  /** Active locale; results from other locales are filtered out. */
  locale: string | null
}

/** Default openers: the ⌘K/Ctrl+K convention plus `/`. */
const DEFAULT_SHORTCUTS = [
  { key: 'k', meta: true, ctrl: false, alt: false, shift: false },
  { key: 'k', meta: false, ctrl: true, alt: false, shift: false },
  { key: '/', meta: false, ctrl: false, alt: false, shift: false },
]

/**
 * Parse the documented `shortcut` forms: a bare key (`'/'`) or a chord given
 * as parts (`['ctrl', 'k']`).
 */
function parseShortcut(shortcut: SearchConfig['shortcut']): typeof DEFAULT_SHORTCUTS {
  if (!shortcut)
    return DEFAULT_SHORTCUTS

  const parts = (Array.isArray(shortcut) ? shortcut : [shortcut]).map(part => String(part).toLowerCase())
  const modifiers = { meta: false, ctrl: false, alt: false, shift: false }
  let key = ''

  for (const part of parts) {
    if (part === 'meta' || part === 'cmd' || part === 'command')
      modifiers.meta = true
    else if (part === 'ctrl' || part === 'control')
      modifiers.ctrl = true
    else if (part === 'alt' || part === 'option')
      modifiers.alt = true
    else if (part === 'shift')
      modifiers.shift = true
    else
      key = part
  }

  if (!key)
    return DEFAULT_SHORTCUTS

  return [{ key, ...modifiers }]
}

/**
 * Serialize a config function for the browser.
 * Returns null for anything that is not a function, so the runtime keeps its
 * own default rather than evaluating garbage.
 */
function serializeFunction(fn: unknown): string | null {
  if (typeof fn !== 'function')
    return null

  const source = Function.prototype.toString.call(fn)
  // A native or bound function has no usable body to ship.
  return source.includes('[native code]') ? null : source
}

export function buildSearchRuntimeConfig(config: BunPressConfig | undefined, indexUrl: string): SearchRuntimeConfig {
  const search = config?.search ?? config?.markdown?.search
  const options = resolveSearchOptions(search)
  const result = search?.resultOptions ?? {}

  return {
    indexUrl,
    placeholder: search?.placeholder ?? 'Search documentation',
    lazy: search?.lazy !== false,
    maxResults: options.maxResults,
    minQueryLength: options.minQueryLength,
    searchFields: options.searchFields,
    boost: {
      title: options.boost.title ?? 10,
      headings: options.boost.headings ?? 5,
      content: options.boost.content ?? 1,
    },
    fuzzy: options.fuzzy,
    fuzziness: options.fuzziness,
    stemmer: options.stemmer,
    shortcuts: {
      keyboard: search?.keyboardShortcuts !== false,
      keys: parseShortcut(search?.shortcut),
    },
    result: {
      showDescription: result.showDescription !== false,
      descriptionLength: result.descriptionLength ?? 180,
      highlightMatches: result.highlightMatches !== false,
      showPath: result.showPath !== false,
    },
    tokenizeSource: serializeFunction(search?.options?.tokenize),
    onSearchSource: serializeFunction(search?.onSearch),
    locale: null,
  }
}

/**
 * Strip markdown down to searchable prose.
 *
 * Fenced code is dropped wholesale: a search for "const" should not match
 * every example on the site. Inline markup is unwrapped rather than removed so
 * the words inside it stay searchable.
 */
function toPlainText(markdown: string): string {
  return stripFencedCode(markdown)
    // Container fences and GitHub alert markers are syntax, not prose — left
    // in, `[!NOTE]` shows up in result previews.
    .replace(/^:::.*$/gm, ' ')
    .replace(/^\s{0,3}>\s*\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$/gim, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, '$1')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Table pipes, the header divider row and horizontal rules are layout,
    // not words — left in, they surface as stray `---` inside result previews.
    .replace(/^\s*\|?[\s:|-]+\|[\s:|-]*$/gm, ' ')
    .replace(/^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/gm, ' ')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripFrontmatter(source: string): { body: string, data: Record<string, any> } {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match)
    return { body: source, data: {} }

  let data: Record<string, any> = {}
  try {
    data = (YAML.parse(match[1]) as Record<string, any>) ?? {}
  }
  catch {
    data = {}
  }

  return { body: source.slice(match[0].length), data }
}

/**
 * Map a markdown file path to the URL the router will serve it at.
 * `index.md` is the directory itself; everything else drops the extension.
 */
function toUrl(relativePath: string): string {
  const withoutExt = relativePath.replace(/\.md$/, '')
  if (withoutExt === 'index')
    return '/'
  if (withoutExt.endsWith('/index'))
    return `/${withoutExt.slice(0, -'/index'.length)}`

  return `/${withoutExt}`
}

/**
 * Split one markdown document into section records.
 */
function recordsForDocument(
  relativePath: string,
  source: string,
  options: typeof DEFAULT_LOCAL_SEARCH_OPTIONS,
): SearchRecord[] {
  const { body, data } = stripFrontmatter(source)

  // `search: false` in frontmatter keeps a page out of the index entirely.
  if (data.search === false)
    return []

  // A `home` layout is a landing page — its hero and feature grid are chrome,
  // not documentation, and indexing them buries real results.
  if (data.layout === 'home')
    return []

  const frontmatterSearch = (typeof data.search === 'object' && data.search !== null) ? data.search : {}
  const keywords: string[] = Array.isArray(frontmatterSearch.keywords)
    ? frontmatterSearch.keywords.map(String)
    : []

  const url = toUrl(relativePath)
  const lines = body.split('\n')

  const pageTitleMatch = body.match(/^#\s+(.+)$/m)
  const pageTitle = (frontmatterSearch.title as string)
    || (data.title as string)
    || (pageTitleMatch ? pageTitleMatch[1].trim() : url)

  const records: SearchRecord[] = []
  const usedAnchors = new Set<string>()
  let current: { title: string, anchor: string, level: number, buffer: string[] } = {
    title: pageTitle,
    anchor: '',
    level: 1,
    buffer: [],
  }

  const flush = (): void => {
    const text = toPlainText(current.buffer.join('\n')).slice(0, options.maxContentLength)
    // Keep a heading even with no prose under it — it is still a valid
    // destination, and dropping it makes the outline and search disagree.
    if (!text && !current.title)
      return

    const record: SearchRecord = {
      url: current.anchor ? `${url}#${current.anchor}` : url,
      page: pageTitle,
      title: toPlainText(current.title) || pageTitle,
      text,
      level: current.level,
    }
    // Keywords belong to the page, so every one of its sections carries them.
    if (keywords.length)
      record.keywords = keywords

    records.push(record)
  }

  // A `# comment` inside a shell block is not a heading, so section splitting
  // has to respect fences too.
  const isFenced = createFenceTracker()
  for (const line of lines) {
    const heading = isFenced(line) ? null : line.match(/^(#{1,6})\s+(.+?)\s*$/)
    if (!heading) {
      current.buffer.push(line)
      continue
    }

    const level = heading[1].length
    const rawTitle = heading[2].replace(/\s*\{#([\w-]+)\}\s*$/, '')
    const customAnchor = heading[2].match(/\{#([\w-]+)\}\s*$/)
    const anchor = reserveUniqueSlug(
      customAnchor ? customAnchor[1] : generateSlug(markdownHeadingText(rawTitle)),
      usedAnchors,
    )

    // The h1 is the page title, already the lead section's heading.
    if (level === 1) {
      current.buffer.push('')
      continue
    }

    flush()
    current = {
      title: rawTitle,
      anchor,
      level,
      buffer: [],
    }
  }
  flush()

  return records.filter(record => record.text || record.level > 1)
}

/**
 * Drop record fields the site did not ask to store.
 *
 * `url` always survives — a hit with no destination is not a hit — and so does
 * whatever `searchFields` needs, since removing a field the ranker reads would
 * silently make those matches impossible.
 */
function applyStoreFields(records: SearchRecord[], options: typeof DEFAULT_LOCAL_SEARCH_OPTIONS & LocalSearchOptions): SearchRecord[] {
  const { storeFields } = options
  if (!storeFields || !storeFields.length)
    return records

  const keep = new Set<string>(['url', ...storeFields])
  if (options.searchFields.includes('title'))
    keep.add('title')
  if (options.searchFields.includes('content'))
    keep.add('text')
  if (options.searchFields.includes('headings'))
    keep.add('page')
  if (options.searchFields.includes('keywords'))
    keep.add('keywords')

  return records.map((record) => {
    const trimmed: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(record)) {
      if (keep.has(key) && value !== undefined)
        trimmed[key] = value
    }
    return trimmed as unknown as SearchRecord
  })
}

/** The page a record belongs to, ignoring its section anchor. */
function pageKey(url: string): string {
  return url.split('#')[0]
}

/**
 * Work out which locale a source file belongs to, and the page path it
 * provides, for both documented layouts (`es/guide.md` and `guide.es.md`).
 */
function splitLocaleFromSourcePath(relativePath: string, i18n: ReturnType<typeof resolveI18nConfig>): { locale: string, page: string } {
  if (!i18n.enabled)
    return { locale: i18n.defaultLocale, page: relativePath }

  const segments = relativePath.split('/')
  if (segments.length > 1 && i18n.locales.includes(segments[0]) && segments[0] !== i18n.defaultLocale)
    return { locale: segments[0], page: segments.slice(1).join('/') }

  const suffix = relativePath.match(/^(.*)\.([A-Za-z-]+)(\.md)$/)
  if (suffix && i18n.locales.includes(suffix[2]))
    return { locale: suffix[2], page: `${suffix[1]}${suffix[3]}` }

  return { locale: i18n.defaultLocale, page: relativePath }
}

/**
 * Walk the docs directory and build the client search index.
 */
export async function buildSearchIndex(docsDir: string, config?: BunPressConfig): Promise<SearchRecord[]> {
  const search = config?.search ?? config?.markdown?.search
  const options = resolveSearchOptions(search)

  const i18n = resolveI18nConfig(config)
  const excludeMatchers = options.exclude.map(pattern => new Glob(pattern))
  const records: SearchRecord[] = []
  const seen = new Set<string>()
  const byLocale = new Map<string, Set<string>>()
  for (const locale of i18n.locales) byLocale.set(locale, new Set())

  for (const includePattern of options.include) {
    const glob = new Glob(includePattern)

    for await (const rawPath of glob.scan(docsDir)) {
      const relativePath = rawPath.replace(/\\/g, '/')

      // Overlapping include patterns must not index a file twice.
      if (seen.has(relativePath))
        continue
      if (excludeMatchers.some(matcher => matcher.match(relativePath)))
        continue

      seen.add(relativePath)

      try {
        const source = await Bun.file(join(docsDir, relativePath)).text()
        const { locale, page } = splitLocaleFromSourcePath(relativePath, i18n)
        for (const record of recordsForDocument(page, source, options)) {
          if (i18n.enabled) {
            record.locale = locale
            // Records must point at the URL the locale is actually served at,
            // not at the default-locale path the file happens to sit under.
            record.url = localizeUrl(i18n, locale, record.url)
          }
          records.push(record)
          // Tracked per page, not per anchor: a translated page must suppress
          // the whole default-locale copy, not just the sections whose slugs
          // happen to collide.
          byLocale.get(locale)?.add(pageKey(record.url))
        }
      }
      catch {
        // A file that cannot be read simply does not get indexed.
      }
    }
  }

  // A locale that has not translated a page still serves the default locale's
  // copy, so the index has to carry it too — otherwise searching in Spanish
  // silently hides most of the site.
  if (i18n.enabled) {
    const fallbackRecords = records.filter(record => record.locale === i18n.defaultLocale)
    for (const locale of i18n.locales) {
      if (locale === i18n.defaultLocale)
        continue
      const translated = byLocale.get(locale) ?? new Set<string>()
      for (const record of fallbackRecords) {
        const url = localizeUrl(i18n, locale, record.url)
        if (translated.has(pageKey(url)))
          continue
        records.push({ ...record, url, locale })
      }
    }
  }

  return applyStoreFields(records, options)
}
