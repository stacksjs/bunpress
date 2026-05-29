import { Glob } from 'bun'
import { join } from 'node:path'

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
 * Load all JSON data files from `<rootDir>/.data` into a single object.
 * Results are cached per root directory.
 */
export async function loadDataFiles(rootDir: string): Promise<Record<string, unknown>> {
  if (dataCache.has(rootDir))
    return dataCache.get(rootDir)!

  const data: Record<string, unknown> = {}
  const dataDir = join(rootDir, '.data')

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

  dataCache.set(rootDir, data)
  return data
}

/** Clear the data cache (used for dev-server hot reloading). */
export function clearDataCache(): void {
  dataCache.clear()
}
