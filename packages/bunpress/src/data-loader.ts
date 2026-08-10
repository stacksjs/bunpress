import { Glob } from 'bun'
import { join, resolve } from 'node:path'
import process from 'node:process'

/**
 * Global data files (Eleventy/Hugo style).
 *
 * Any JSON file placed in `<docsDir>/.data/` is loaded and exposed to every
 * page's stx context under the `data` object, keyed by file basename:
 *
 *   docs/.data/test262.json  ->  {{ data.test262.percentage }}
 *
 * Files in nested directories are keyed by their dotted relative path
 * (e.g. `.data/stats/build.json` -> `data.stats.build`).
 */
const dataCache = new Map<string, Record<string, unknown>>()

function setNested(target: Record<string, any>, dottedKey: string, value: unknown): void {
  const parts = dottedKey.split('.')
  let node = target
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (typeof node[part] !== 'object' || node[part] === null)
      node[part] = {}
    node = node[part]
  }
  node[parts[parts.length - 1]] = value
}

/**
 * Load all JSON data files into a single object.
 *
 * `overrideDir` comes from `config.dataDir` and is resolved against the
 * working directory; without it the convention is `<rootDir>/.data`.
 * Results are cached per resolved directory.
 */
export async function loadDataFiles(rootDir: string, overrideDir?: string): Promise<Record<string, unknown>> {
  const dataDir = overrideDir ? resolve(process.cwd(), overrideDir) : join(rootDir, '.data')

  if (dataCache.has(dataDir))
    return dataCache.get(dataDir)!

  const data: Record<string, unknown> = {}

  try {
    const glob = new Glob('**/*.json')
    // Scan with relative paths so the key derives cleanly from the path under
    // the data dir (e.g. `stats.json` -> `stats`, `a/b.json` -> `a.b`).
    for await (const rel of glob.scan({ cwd: dataDir, absolute: false })) {
      try {
        const text = await Bun.file(join(dataDir, rel)).text()
        const key = rel.replace(/\.json$/, '').replace(/[/\\]/g, '.')
        setNested(data, key, JSON.parse(text))
      }
      catch {
        // Skip files that fail to read or parse — bad data shouldn't break the build.
      }
    }
  }
  catch {
    // No .data directory — return empty data object.
  }

  dataCache.set(dataDir, data)
  return data
}

/** Clear the data cache (used for dev-server hot reloading). */
export function clearDataCache(): void {
  dataCache.clear()
}
