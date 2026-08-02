import { dirname, join, resolve } from 'node:path'
import { mkdir, realpath, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

interface OwnedDependency {
  name: string
  repository: string
  path: string
  revision: string
  packages: string[]
  clean_paths: string[]
  build: {
    cwd: string
    command: string[]
  }
}

interface OwnedDependencyManifest {
  schema: number
  dependencies: OwnedDependency[]
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const checkOnly = process.argv.includes('--check')
const checkoutMissing = process.argv.includes('--checkout')

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path)
    return true
  }
  catch {
    return false
  }
}

async function capture(command: string[], cwd: string): Promise<string> {
  const child = Bun.spawn(command, { cwd, stdout: 'pipe', stderr: 'pipe' })
  const [exitCode, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ])
  if (exitCode !== 0)
    throw new Error(`${command.join(' ')} failed in ${cwd}: ${stderr.trim() || stdout.trim()}`)
  return stdout.trim()
}

async function run(command: string[], cwd: string): Promise<void> {
  const child = Bun.spawn(command, { cwd, stdout: 'inherit', stderr: 'inherit' })
  const exitCode = await child.exited
  if (exitCode !== 0)
    throw new Error(`${command.join(' ')} failed in ${cwd} with exit code ${exitCode}`)
}

function githubRepository(remote: string): string {
  return remote
    .replace(/^git@github\.com:/, '')
    .replace(/^https:\/\/github\.com\//, '')
    .replace(/\.git$/, '')
}

const packageJson = await Bun.file(join(root, 'package.json')).json() as { packageManager?: string }
const expectedBun = packageJson.packageManager?.replace(/^bun@/, '')
if (!expectedBun || Bun.version !== expectedBun)
  throw new Error(`BunPress requires Bun ${expectedBun ?? '(missing packageManager pin)'}, got ${Bun.version}`)

const manifest = await Bun.file(join(root, 'owned-dependencies.json')).json() as OwnedDependencyManifest
if (manifest.schema !== 1)
  throw new Error(`Unsupported owned dependency schema: ${manifest.schema}`)

for (const dependency of manifest.dependencies) {
  const dependencyRoot = resolve(root, dependency.path)
  if (!await exists(join(dependencyRoot, '.git'))) {
    if (!checkoutMissing)
      throw new Error(`${dependency.name} is missing its owned checkout at ${dependencyRoot}`)
    if (await exists(dependencyRoot))
      throw new Error(`Refusing to initialize ${dependency.name} over existing non-git path ${dependencyRoot}`)

    await mkdir(dirname(dependencyRoot), { recursive: true })
    await run(['git', 'init', dependencyRoot], root)
    await run(['git', '-C', dependencyRoot, 'remote', 'add', 'origin', `https://github.com/${dependency.repository}.git`], root)
    await run(['git', '-C', dependencyRoot, 'fetch', '--depth=1', 'origin', dependency.revision], root)
    await run(['git', '-C', dependencyRoot, 'checkout', '--detach', 'FETCH_HEAD'], root)
  }

  const revision = await capture(['git', 'rev-parse', 'HEAD'], dependencyRoot)
  if (revision !== dependency.revision)
    throw new Error(`${dependency.name} must be at ${dependency.revision}, got ${revision}`)

  const remote = githubRepository(await capture(['git', 'remote', 'get-url', 'origin'], dependencyRoot))
  if (remote !== dependency.repository)
    throw new Error(`${dependency.name} must resolve from ${dependency.repository}, got ${remote}`)

  const dirty = await capture(
    ['git', 'status', '--porcelain', '--untracked-files=no', '--', ...dependency.clean_paths],
    dependencyRoot,
  )
  if (dirty)
    throw new Error(`${dependency.name} checkout has tracked changes:\n${dirty}`)

  for (const packagePath of dependency.packages) {
    if (!await Bun.file(join(dependencyRoot, packagePath, 'package.json')).exists())
      throw new Error(`${dependency.name} is missing workspace ${packagePath}`)
  }

  console.log(`verified ${dependency.name} at ${dependency.revision}`)
  if (!checkOnly) {
    await run([process.execPath, 'install', '--frozen-lockfile'], dependencyRoot)
    await run([process.execPath, ...dependency.build.command], join(dependencyRoot, dependency.build.cwd))
  }
}

if (!checkOnly) {
  // Force replacement of registry directories restored by old node_modules
  // caches. Bun otherwise considers those installs present even when the
  // frozen lock now requires a workspace symlink.
  await run([process.execPath, 'install', '--force', '--frozen-lockfile'], root)

  for (const dependency of manifest.dependencies) {
    const dependencyRoot = resolve(root, dependency.path)
    for (const packagePath of dependency.packages) {
      const packageRoot = join(dependencyRoot, packagePath)
      const packageJson = await Bun.file(join(packageRoot, 'package.json')).json() as { name?: string }
      if (!packageJson.name)
        throw new Error(`Owned workspace ${packageRoot} has no package name`)

      const installedRoot = await realpath(join(root, 'node_modules', packageJson.name))
      const expectedRoot = await realpath(packageRoot)
      if (installedRoot !== expectedRoot)
        throw new Error(`${packageJson.name} resolved to ${installedRoot}, expected owned workspace ${expectedRoot}`)
      console.log(`linked ${packageJson.name} from ${expectedRoot}`)
    }
  }
}
