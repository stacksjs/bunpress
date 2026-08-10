import { describe, expect, it } from 'bun:test'
import { readdirSync, readFileSync } from 'node:fs'
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

/**
 * Three files independently name the Bun the project runs on, and the lockfile
 * version they produce has to match. `deps.yaml` is what pantry gives a
 * contributor locally, the workflows are what CI installs, and
 * `packageManager` is what the test above checks the lockfile against. If they
 * drift, someone builds against a different Bun than CI does and only finds
 * out when a release fails.
 */
describe('bun version pins', () => {
  /** Every declared pin, as `{ source, version }`. */
  function collectPins(): Array<{ source: string, version: string }> {
    const pins: Array<{ source: string, version: string }> = []

    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
    const packageManager = String(pkg.packageManager ?? '').match(/^bun@(\d+\.\d+\.\d+)$/)
    if (packageManager)
      pins.push({ source: 'package.json packageManager', version: packageManager[1] })

    // A bare version, not a range: a caret here would silently pick up the
    // next minor, which is how the v2-lockfile break happened in the first
    // place. An unpinned value simply does not match and shows up as missing.
    const deps = readFileSync(join(ROOT, 'deps.yaml'), 'utf8').match(/^\s*bun\.sh:\s*(\d+\.\d+\.\d+)\s*$/m)
    if (deps)
      pins.push({ source: 'deps.yaml', version: deps[1] })

    const workflowDir = join(ROOT, '.github', 'workflows')
    for (const file of readdirSync(workflowDir).filter(name => name.endsWith('.yml'))) {
      const source = readFileSync(join(workflowDir, file), 'utf8')
      for (const match of source.matchAll(/bun\.sh@(\d+\.\d+\.\d+)/g))
        pins.push({ source: `.github/workflows/${file}`, version: match[1] })
    }

    return pins
  }

  it('names the same Bun everywhere', () => {
    const pins = collectPins()

    // Each of the three sources must actually be found — a silently missing
    // pin would let this pass while the drift it guards against is live.
    for (const source of ['package.json packageManager', 'deps.yaml']) {
      expect(pins.some(pin => pin.source === source), `no pinned Bun version found in ${source}`).toBe(true)
    }
    expect(pins.some(pin => pin.source.startsWith('.github/')), 'no pinned Bun version found in any workflow').toBe(true)

    const versions = [...new Set(pins.map(pin => pin.version))]
    expect(
      versions,
      `Bun is pinned to more than one version:\n${pins.map(pin => `  ${pin.version}  ${pin.source}`).join('\n')}\n`
      + 'Move them together, and regenerate bun.lock with the new version.',
    ).toHaveLength(1)
  })
})
