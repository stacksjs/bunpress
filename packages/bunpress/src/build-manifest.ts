import { Glob } from 'bun'
import { dirname, relative, resolve, sep } from 'node:path'
import { mkdir } from 'node:fs/promises'

export interface BuildManifestEntry {
  path: string
  bytes: number
  sha256: string
}

export interface BuildManifest {
  schema_version: 1
  generator: 'bunpress'
  generator_version: string
  outputs: BuildManifestEntry[]
  tree_sha256: string
}

function portablePath(path: string): string {
  return sep === '/' ? path : path.split(sep).join('/')
}

function sha256(bytes: Uint8Array | string): string {
  const hasher = new Bun.CryptoHasher('sha256')
  hasher.update(bytes)
  return hasher.digest('hex')
}

/**
 * Describe the complete rendered tree without incorporating mtimes, traversal
 * order, absolute paths, or the manifest itself. Consumers can check this file
 * into evidence and compare builds made on different hosts.
 */
export async function createBuildManifest(
  outdir: string,
  generatorVersion: string,
  manifestPath?: string,
): Promise<BuildManifest> {
  const root = resolve(outdir)
  const excluded = manifestPath ? portablePath(relative(root, resolve(manifestPath))) : undefined
  const files: string[] = []
  const glob = new Glob('**/*')

  for await (const path of glob.scan({ cwd: root, onlyFiles: true })) {
    const portable = portablePath(path)
    if (portable === excluded)
      continue
    files.push(portable)
  }
  files.sort((a, b) => a.localeCompare(b))

  const outputs: BuildManifestEntry[] = []
  const tree = new Bun.CryptoHasher('sha256')
  for (const path of files) {
    const bytes = new Uint8Array(await Bun.file(resolve(root, path)).arrayBuffer())
    const digest = sha256(bytes)
    outputs.push({ path, bytes: bytes.byteLength, sha256: digest })
    tree.update(`${path}\0${bytes.byteLength}\0${digest}\n`)
  }

  return {
    schema_version: 1,
    generator: 'bunpress',
    generator_version: generatorVersion,
    outputs,
    tree_sha256: tree.digest('hex'),
  }
}

export async function writeBuildManifest(
  outdir: string,
  manifestPath: string,
  generatorVersion: string,
): Promise<BuildManifest> {
  const manifest = await createBuildManifest(outdir, generatorVersion, manifestPath)
  await mkdir(dirname(resolve(manifestPath)), { recursive: true })
  await Bun.write(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  return manifest
}

function outputMap(manifest: BuildManifest): Map<string, BuildManifestEntry> {
  return new Map(manifest.outputs.map(output => [output.path, output]))
}

/** Verify the rendered tree and report exact added, removed, or changed files. */
export async function verifyBuildManifest(
  outdir: string,
  manifestPath: string,
  generatorVersion: string,
): Promise<BuildManifest> {
  const expected = await Bun.file(manifestPath).json() as BuildManifest
  if (expected.schema_version !== 1 || expected.generator !== 'bunpress' || !Array.isArray(expected.outputs))
    throw new Error(`Unsupported or malformed BunPress build manifest: ${manifestPath}`)

  const actual = await createBuildManifest(outdir, generatorVersion, manifestPath)
  if (JSON.stringify(actual) === JSON.stringify(expected))
    return actual

  const expectedOutputs = outputMap(expected)
  const actualOutputs = outputMap(actual)
  const added = actual.outputs.filter(output => !expectedOutputs.has(output.path)).map(output => output.path)
  const removed = expected.outputs.filter(output => !actualOutputs.has(output.path)).map(output => output.path)
  const changed = actual.outputs
    .filter(output => {
      const prior = expectedOutputs.get(output.path)
      return prior && (prior.bytes !== output.bytes || prior.sha256 !== output.sha256)
    })
    .map(output => output.path)

  const parts = [
    expected.generator_version !== actual.generator_version
      ? `generator ${expected.generator_version} -> ${actual.generator_version}`
      : '',
    added.length ? `added: ${added.join(', ')}` : '',
    removed.length ? `removed: ${removed.join(', ')}` : '',
    changed.length ? `changed: ${changed.join(', ')}` : '',
  ].filter(Boolean)
  throw new Error(`BunPress output does not match ${manifestPath}: ${parts.join('; ') || 'tree hash changed'}`)
}
