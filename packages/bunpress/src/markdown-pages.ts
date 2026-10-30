import type { ResolvedI18n } from './i18n'
import { Glob } from 'bun'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { localeContentCandidates, localizeUrl } from './i18n'
import { decodeHtmlEntities, escapeHtmlAttribute } from './html-entities'

export interface MarkdownPage {
  readonly sourceFile: string
  readonly relativePath: string
  readonly locale: string
}

export interface MarkdownPageCatalog {
  readonly pages: readonly MarkdownPage[]
  findPage: (locale: string, path: string) => MarkdownPage | undefined
  resolveLink: (page: MarkdownPage, destination: string, collect?: MarkdownLinkCollector) => string
}

/** A link that named no document, reported rather than thrown. */
export interface MarkdownLinkFailure {
  /** The authoring document, relative to the documentation root. */
  readonly sourceFile: string
  /** The destination exactly as it was written. */
  readonly destination: string
  readonly reason: 'no-documentation-source' | 'no-rendered-page'
}

export type MarkdownLinkCollector = (failure: MarkdownLinkFailure) => void

export interface MarkdownPageContext {
  readonly page: MarkdownPage
  readonly catalog: MarkdownPageCatalog
  /**
   * Where to put a refused link instead of throwing on the first one.
   *
   * Absent by default, which keeps the single-page callers failing fast: the
   * dev server renders one page on request and has no later point to report
   * at, so a throw is the whole answer there. A build renders every page and
   * can say how many are broken, which is the difference this exists for.
   */
  readonly collectLinkFailures?: MarkdownLinkCollector
}

/** Per-render boundaries for authored content expanded from another file. */
export type MarkdownLinkOrigins = Map<string, MarkdownPage | null>

export async function findMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  for await (const file of new Glob('**/*.md').scan({ cwd: dir, onlyFiles: true }))
    files.push(join(dir, file))
  return files
}

function encodePath(path: string): string {
  return path.split('/').map(segment => encodeURIComponent(segment)).join('/')
}

function routeFor(path: string): string {
  const route = path === 'index' ? '' : path.replace(/\/index$/, '/')
  return `/${encodePath(route)}`
}

/**
 * The document a link was authored in, for a message somebody has to act on.
 *
 * Both link failures below name the destination, which is not enough to find
 * the link: the destination is what is missing, and the file holding it is
 * what has to be edited. Relative to the documentation root, because an
 * absolute temporary path is noise in a build log.
 *
 * Under an include, `resolveLink` is handed the innermost origin rather than
 * the host page, so this names the file the link was actually written in.
 */
function authoredIn(page: MarkdownPage, root: string): string {
  const within = relative(root, page.sourceFile)
  return within && !within.startsWith('..') && !isAbsolute(within) ? within.split(sep).join('/') : page.sourceFile
}

function routeKey(path: string): string {
  const encoded = path.split('/').map(segment => encodeURIComponent(decodeURIComponent(segment))).join('/')
  return encoded.replace(/\/+$/, '') || '/'
}

/** One finite source/route snapshot, owned by one build or one dev request. */
export function createMarkdownPageCatalog(markdownFiles: readonly string[], docsDir: string, i18n: ResolvedI18n): MarkdownPageCatalog {
  const root = resolve(docsDir)
  const language = { ...i18n, locales: [...i18n.locales] }
  const files = new Set(markdownFiles.map(file => resolve(file)))
  const sources = new Map<string, { path: string, locale: string, explicitLocale: boolean }>()
  const canonical = new Set<string>()
  for (const file of files) {
    let path = relative(root, file).split(sep).join('/').replace(/\.md$/, '')
    if (path === '..' || path.startsWith('../') || isAbsolute(path))
      throw new Error('Markdown source is outside the documentation root')
    let locale = language.defaultLocale
    let explicitLocale = false
    if (language.enabled) {
      const segments = path.split('/')
      if (segments.length > 1 && language.locales.includes(segments[0]) && segments[0] !== language.defaultLocale) {
        locale = segments.shift()!
        explicitLocale = true
        path = segments.join('/')
      }
      else {
        const suffix = path.match(/^(.*)\.([A-Za-z-]+)$/)
        if (suffix && language.locales.includes(suffix[2])) {
          path = suffix[1]
          locale = suffix[2]
          explicitLocale = true
        }
      }
    }
    sources.set(file, { path, locale, explicitLocale })
    canonical.add(path)
  }

  const pages: MarkdownPage[] = []
  const byPage = new Map<string, MarkdownPage>()
  const byRoute = new Map<string, MarkdownPage>()
  const aliases = new Map<string, MarkdownPage>()
  for (const locale of language.locales) {
    for (const path of canonical) {
      const sourceFile = language.enabled
        ? localeContentCandidates(language, root, locale, `/${path}`).map(file => resolve(file)).find(file => files.has(file))
        : resolve(root, `${path}.md`)
      if (!sourceFile || !files.has(sourceFile))
        continue
      const page = Object.freeze({ sourceFile, relativePath: path, locale })
      const key = `${locale}\0${routeKey(routeFor(path))}`
      if (byRoute.has(key))
        throw new Error(`Documentation pages share an output route: ${routeFor(path)}`)
      byRoute.set(key, page)
      byPage.set(`${locale}\0${path}`, page)
      aliases.set(`${locale}\0${routeKey(`/${encodePath(path)}`)}`, page)
      pages.push(page)
    }
  }

  /**
   * Report the link, or throw on it when nobody is collecting.
   *
   * Returning the destination untouched is safe precisely because a collecting
   * caller does not publish: the build throws once it has rendered everything,
   * so this HTML is discarded. Leaving it alone rather than substituting a
   * placeholder also keeps the failing page readable while it is inspected.
   */
  function refuse(page: MarkdownPage, rawPath: string, destination: string, reason: MarkdownLinkFailure['reason'], collect?: MarkdownLinkCollector): string {
    const sourceFile = authoredIn(page, root)
    const message = reason === 'no-documentation-source'
      ? `${sourceFile}: Markdown link has no documentation source: ${rawPath}`
      : `${sourceFile}: Markdown link has no rendered page: ${rawPath}`
    if (!collect)
      throw new Error(message)
    collect({ sourceFile, destination: rawPath, reason })
    return destination
  }

  return Object.freeze({
    pages: Object.freeze(pages),
    findPage(locale: string, path: string): MarkdownPage | undefined {
      const key = `${locale}\0${routeKey(path)}`
      return byRoute.get(key) ?? aliases.get(key)
    },
    resolveLink(page: MarkdownPage, destination: string, collect?: MarkdownLinkCollector): string {
      if (!destination || /^(?:[a-z][a-z\d+.-]*:|\/|#|\?)/i.test(destination))
        return destination
      const boundary = destination.search(/[?#]/)
      const rawPath = boundary === -1 ? destination : destination.slice(0, boundary)
      const suffix = boundary === -1 ? '' : destination.slice(boundary)
      // Recognize the ASCII extension without requiring untouched asset URIs
      // to contain UTF-8. Decode the whole pathname only for Markdown sources.
      const candidate = rawPath.replace(/%([\da-f]{2})/gi, (_, byte) => String.fromCharCode(Number.parseInt(byte, 16)))
      if (!/\.md$/i.test(candidate))
        return destination
      const path = decodeURIComponent(rawPath)
      const target = resolve(dirname(page.sourceFile), path)
      const within = relative(root, target)
      if (within === '..' || within.startsWith(`..${sep}`) || isAbsolute(within))
        return destination
      const source = sources.get(target)
      if (!source)
        return refuse(page, rawPath, destination, 'no-documentation-source', collect)
      const locale = source.explicitLocale ? source.locale : page.locale
      const selected = byPage.get(`${locale}\0${source.path}`)
      if (!selected)
        return refuse(page, rawPath, destination, 'no-rendered-page', collect)
      return `${localizeUrl(language, locale, routeFor(selected.relativePath))}${suffix}`
    },
  })
}

/**
 * One message for every refused link, in the order they were rendered.
 *
 * Grouped by document and destination with a count, because the same dead
 * destination written three times in one file is three identical lines
 * otherwise. There is no line number: by the time links are resolved the
 * markdown has already become HTML, so the authored position is gone, and a
 * fabricated one would be worse than none.
 */
export function describeLinkFailures(failures: readonly MarkdownLinkFailure[]): string {
  const groups = new Map<string, { failure: MarkdownLinkFailure, count: number }>()
  for (const failure of failures) {
    const key = `${failure.sourceFile}\0${failure.destination}\0${failure.reason}`
    const seen = groups.get(key)
    if (seen)
      seen.count += 1
    else
      groups.set(key, { failure, count: 1 })
  }

  const lines = [...groups.values()].map(({ failure, count }) => {
    const reason = failure.reason === 'no-documentation-source' ? 'no documentation source' : 'no rendered page'
    const times = count > 1 ? ` (${count} times)` : ''
    return `  ${failure.sourceFile}  ${failure.destination}  (${reason})${times}`
  })

  const total = failures.length
  const heading = total === 1 ? '1 Markdown link could not be resolved:' : `${total} Markdown links could not be resolved:`

  return [heading, ...lines].join('\n')
}

/** Parse actual anchor attributes; code text, images and external destinations stay intact. */
export async function rewriteMarkdownSourceLinks(html: string, context: MarkdownPageContext, origins: MarkdownLinkOrigins = new Map()): Promise<string> {
  const stack = [context.page]
  const pending = new Set(origins.keys())
  const rewritten = await new HTMLRewriter().onDocument({
    comments(comment) {
      const origin = origins.get(comment.text)
      if (origin === undefined)
        return
      if (!pending.delete(comment.text))
        throw new Error('Markdown include source boundary was duplicated')
      if (origin === null) {
        if (stack.length === 1)
          throw new Error('Markdown include source boundaries are unbalanced')
        stack.pop()
      }
      else {
        stack.push(origin)
      }
      comment.remove()
    },
  }).on('a[href]', {
    element(element) {
      const href = decodeHtmlEntities(element.getAttribute('href')!)
      const destination = context.catalog.resolveLink(stack[stack.length - 1], href, context.collectLinkFailures)
      if (destination !== href)
        element.setAttribute('href', escapeHtmlAttribute(destination))
    },
  }).transform(new Response(html)).text()
  if (pending.size || stack.length !== 1)
    throw new Error('Markdown include source boundaries did not survive rendering')
  return rewritten
}
