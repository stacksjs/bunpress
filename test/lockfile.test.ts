import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * CI installs the exact Bun named in `packageManager`, and that Bun has to be
 * able to read `bun.lock`.
 *
 * Bun 1.3.x writes `lockfileVersion: 1` and cannot parse version 2, which
 * newer releases write. A contributor on a newer Bun who runs `bun install`
 * rewrites the lockfile silently; nothing looks wrong locally, and then every
 * CI job fails at `bun install --frozen-lockfile` — including the release,
 * which stops publishing without any obvious cause. This catches it on the
 * machine that caused it.
 */

const ROOT = join(import.meta.dir, '..')

/**
 * `bun.lock` is JSONC — it has trailing commas, which `JSON.parse` rejects.
 * Only the commas need removing for the two fields this file inspects.
 */
function readLockfile(): { lockfileVersion: number, workspaces?: Record<string, unknown> } {
  const source = readFileSync(join(ROOT, 'bun.lock'), 'utf8')
  return JSON.parse(source.replace(/,(\s*[}\]])/g, '$1'))
}

/** Lockfile versions each Bun major line can parse. */
const MAX_LOCKFILE_VERSION: Record<string, number> = {
  '1.3': 1,
}

describe('bun.lock', () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
  const lock = readLockfile()

  it('is readable by the Bun version CI pins', () => {
    const pinned = String(pkg.packageManager ?? '').replace(/^bun@/, '')
    expect(pinned).toMatch(/^\d+\.\d+\.\d+$/)

    const line = pinned.split('.').slice(0, 2).join('.')
    const supported = MAX_LOCKFILE_VERSION[line]

    // An unknown Bun line means this table needs updating, not that the
    // lockfile is wrong — say so rather than failing cryptically.
    if (supported === undefined) {
      throw new Error(
        `No lockfile-version entry for Bun ${line}. Add it to MAX_LOCKFILE_VERSION `
        + `in this test once you know what \`bun@${pinned}\` can read.`,
      )
    }

    expect(
      lock.lockfileVersion,
      `bun.lock is version ${lock.lockfileVersion}, but packageManager pins bun@${pinned}, `
      + `which reads at most version ${supported}. Regenerate it with that Bun — see `
      + 'CLAUDE.md, "Lockfile and Bun version".',
    ).toBeLessThanOrEqual(supported)
  })

  it('only declares real monorepo workspaces', () => {
    // Sibling repositories are npm dependencies; a `../` path here means the
    // owned-checkout mechanism has crept back in and installs will break for
    // anyone without those directories.
    for (const name of Object.keys(lock.workspaces ?? {}))
      expect(name.startsWith('..')).toBe(false)
  })
})
