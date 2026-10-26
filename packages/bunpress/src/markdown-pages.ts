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
  resolveLink: (page: MarkdownPage, destination: string) => string
}

export interface MarkdownPageContext {
  readonly page: MarkdownPage
  readonly catalog: MarkdownPageCatalog
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

  return Object.freeze({
    pages: Object.freeze(pages),
    findPage(locale: string, path: string): MarkdownPage | undefined {
      const key = `${locale}\0${routeKey(path)}`
      return byRoute.get(key) ?? aliases.get(key)
    },
    resolveLink(page: MarkdownPage, destination: string): string {
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
        throw new Error(`${authoredIn(page, root)}: Markdown link has no documentation source: ${rawPath}`)
      const locale = source.explicitLocale ? source.locale : page.locale
      const selected = byPage.get(`${locale}\0${source.path}`)
      if (!selected)
        throw new Error(`${authoredIn(page, root)}: Markdown link has no rendered page: ${rawPath}`)
      return `${localizeUrl(language, locale, routeFor(selected.relativePath))}${suffix}`
    },
  })
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
      const destination = context.catalog.resolveLink(stack[stack.length - 1], href)
      if (destination !== href)
        element.setAttribute('href', escapeHtmlAttribute(destination))
    },
  }).transform(new Response(html)).text()
  if (pending.size || stack.length !== 1)
    throw new Error('Markdown include source boundaries did not survive rendering')
  return rewritten
}
