import { stat } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import process from 'node:process'

/**
 * "Edit this page" and "Last updated" — the two bits of provenance a docs
 * page carries about its own source file.
 */

/**
 * Last-commit dates for every tracked file under a directory.
 *
 * Built with a single `git log` rather than one call per page: on a large site
 * spawning git per file dominates the build, and the whole history walk costs
 * about as much as a handful of individual lookups.
 *
 * Cached per directory. `null` means git was unavailable or the directory is
 * not a repository, and callers fall back to filesystem timestamps.
 */
const gitDateCache = new Map<string, Map<string, string> | null>()

async function loadGitDates(docsDir: string): Promise<Map<string, string> | null> {
  const key = resolve(docsDir)
  if (gitDateCache.has(key))
    return gitDateCache.get(key)!

  try {
    const proc = Bun.spawn(
      // --relative prints paths relative to the docs directory rather than
      // the repository root, which is the key the lookup below uses.
      ['git', 'log', '--pretty=format:%cI', '--name-only', '--relative', '--no-merges', '--', '.'],
      { cwd: key, stdout: 'pipe', stderr: 'ignore' },
    )
    const [exitCode, stdout] = await Promise.all([proc.exited, new Response(proc.stdout).text()])
    if (exitCode !== 0) {
      gitDateCache.set(key, null)
      return null
    }

    const dates = new Map<string, string>()
    let currentDate = ''
    for (const line of stdout.split('\n')) {
      if (!line.trim())
        continue
      // A date line opens each commit; the paths that follow belong to it.
      if (/^\d{4}-\d{2}-\d{2}T/.test(line)) {
        currentDate = line.trim()
        continue
      }
      // Log order is newest first, so the first date seen for a path wins.
      if (currentDate && !dates.has(line))
        dates.set(line, currentDate)
    }

    gitDateCache.set(key, dates)
    return dates
  }
  catch {
    gitDateCache.set(key, null)
    return null
  }
}

/** Forget cached git dates. Used by the dev server's file watcher. */
export function clearGitDateCache(): void {
  gitDateCache.clear()
}

/**
 * When a source file was last changed, as an ISO string.
 *
 * Prefers the last commit that touched it — that is the date a reader means by
 * "last updated" — and falls back to the filesystem, which is all that exists
 * for an untracked or freshly written file.
 */
export async function resolveLastUpdated(docsDir: string, sourceFile: string): Promise<string | null> {
  const dates = await loadGitDates(docsDir)
  if (dates) {
    const relativePath = relative(resolve(docsDir), resolve(sourceFile)).replace(/\\/g, '/')
    const committed = dates.get(relativePath)
    if (committed)
      return committed
  }

  try {
    const info = await stat(sourceFile)
    return info.mtime.toISOString()
  }
  catch {
    return null
  }
}

/**
 * Build the edit URL for a page.
 *
 * `:path` is the page's path relative to the docs directory, which is what
 * every forge's edit URL expects after the branch segment.
 */
export function buildEditUrl(pattern: string, docsDir: string, sourceFile: string): string {
  const relativePath = relative(resolve(process.cwd(), docsDir), resolve(sourceFile)).replace(/\\/g, '/')
  return pattern.includes(':path')
    ? pattern.replace(':path', relativePath)
    // A pattern without the placeholder is treated as a prefix, which is the
    // forgiving reading of a URL someone pasted without the token.
    : `${pattern.replace(/\/$/, '')}/${relativePath}`
}

/** Render an ISO date for display, honouring the configured format. */
export function formatLastUpdated(iso: string, locale: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime()))
    return ''

  try {
    return new Intl.DateTimeFormat(locale, options ?? { dateStyle: 'medium' }).format(date)
  }
  catch {
    // An unknown locale tag must not take the page down.
    return date.toISOString().slice(0, 10)
  }
}
