import type { BunPressConfig } from './types'
import { Glob, YAML } from 'bun'
import { join } from 'node:path'

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
}

/** How much prose to keep per section. Enough to rank and to preview. */
const MAX_SECTION_TEXT = 800

/**
 * Track fenced-code state across a document, one line at a time.
 *
 * A regex pass over the whole file cannot do this: docs commonly wrap example
 * markdown in a four-backtick fence containing three-backtick fences, and
 * naive pairing desyncs on the first one and leaks every code block after it
 * into the index. CommonMark's rule is that the closing fence uses the same
 * character and is at least as long as the opener, which is what this tracks.
 */
function createFenceTracker(): (line: string) => boolean {
  let openMarker: string | null = null

  return (line: string): boolean => {
    const fence = line.match(/^\s{0,3}(`{3,}|~{3,})(.*)$/)
    if (!fence)
      return openMarker !== null

    const marker = fence[1]
    if (openMarker === null) {
      // An opening fence may carry an info string; a closing one may not.
      openMarker = marker
      return true
    }

    const sameChar = marker[0] === openMarker[0]
    const longEnough = marker.length >= openMarker.length
    if (sameChar && longEnough && fence[2].trim() === '')
      openMarker = null

    return true
  }
}

/** Remove fenced code blocks, fences included. */
function stripFencedCode(markdown: string): string {
  const isFenced = createFenceTracker()
  return markdown
    .split('\n')
    .filter(line => !isFenced(line))
    .join('\n')
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

/**
 * Slugify a heading the same way the renderer does, so anchors resolve.
 * Kept in step with addHeadingIds in serve.ts.
 */
function slugify(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_~]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\//g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
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
function recordsForDocument(relativePath: string, source: string): SearchRecord[] {
  const { body, data } = stripFrontmatter(source)

  // A `home` layout is a landing page — its hero and feature grid are chrome,
  // not documentation, and indexing them buries real results.
  if (data.layout === 'home')
    return []

  const url = toUrl(relativePath)
  const lines = body.split('\n')

  const pageTitleMatch = body.match(/^#\s+(.+)$/m)
  const pageTitle = (data.title as string) || (pageTitleMatch ? pageTitleMatch[1].trim() : url)

  const records: SearchRecord[] = []
  let current: { title: string, anchor: string, level: number, buffer: string[] } = {
    title: pageTitle,
    anchor: '',
    level: 1,
    buffer: [],
  }

  const flush = (): void => {
    const text = toPlainText(current.buffer.join('\n')).slice(0, MAX_SECTION_TEXT)
    // Keep a heading even with no prose under it — it is still a valid
    // destination, and dropping it makes the outline and search disagree.
    if (!text && !current.title)
      return

    records.push({
      url: current.anchor ? `${url}#${current.anchor}` : url,
      page: pageTitle,
      title: toPlainText(current.title) || pageTitle,
      text,
      level: current.level,
    })
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
    // The h1 is the page title, already the lead section's heading.
    if (level === 1) {
      current.buffer.push('')
      continue
    }

    flush()
    const rawTitle = heading[2].replace(/\s*\{#([\w-]+)\}\s*$/, '')
    const customAnchor = heading[2].match(/\{#([\w-]+)\}\s*$/)
    current = {
      title: rawTitle,
      anchor: customAnchor ? customAnchor[1] : slugify(rawTitle),
      level,
      buffer: [],
    }
  }
  flush()

  return records.filter(record => record.text || record.level > 1)
}

/**
 * Walk the docs directory and build the client search index.
 */
export async function buildSearchIndex(docsDir: string, _config?: BunPressConfig): Promise<SearchRecord[]> {
  const glob = new Glob('**/*.md')
  const records: SearchRecord[] = []

  for await (const relativePath of glob.scan(docsDir)) {
    // `public/` is served verbatim; README is a repo file, not a page.
    if (relativePath.startsWith('public/'))
      continue

    try {
      const source = await Bun.file(join(docsDir, relativePath)).text()
      records.push(...recordsForDocument(relativePath.replace(/\\/g, '/'), source))
    }
    catch {
      // A file that cannot be read simply does not get indexed.
    }
  }

  return records
}

/** Path the client fetches the index from. */
export const SEARCH_INDEX_PATH = '/search-index.json'
