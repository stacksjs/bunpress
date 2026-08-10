import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { colorize, logError, logInfo, logSuccess, logWarning } from '../utils'
import { config } from '../../src/config'

interface DoctorOptions {
  dir?: string
  verbose?: boolean
}

interface CheckResult {
  name: string
  status: 'pass' | 'fail' | 'warn'
  /** Shown next to the check name. */
  message: string
  /** What to do about it. Printed whenever the check is not passing. */
  fix?: string
  /** Extra context, shown only under --verbose. */
  detail?: string
}

/**
 * Config file names bunfig will actually load, in the order it tries them.
 *
 * Doctor used to look for `bunpress.config.ts` and `bunpress.config.js` only,
 * and reported "no config file" for the other dozen names that work perfectly
 * well — including `docs.config.ts`, since the config is registered with
 * `alias: 'docs'`.
 */
function configCandidates(): string[] {
  const names = ['bunpress', 'docs']
  const patterns = names.flatMap(name => [`${name}.config`, `.${name}.config`, name, `.${name}`])
  const extensions = ['.ts', '.js', '.mjs', '.cjs', '.json']
  return patterns.flatMap(pattern => extensions.map(ext => `${pattern}${ext}`))
}

/**
 * Run diagnostic checks on the project
 */
export async function doctorCommand(options: DoctorOptions = {}): Promise<boolean> {
  const verbose = options.verbose || false
  const results: CheckResult[] = []

  console.log(colorize('\nRunning diagnostics...\n', 'bold'))

  // Check 1: Bun runtime version
  results.push({
    name: 'Bun Runtime',
    status: 'pass',
    message: `v${Bun.version}`,
  })

  // Check 2: Configuration file
  const configFile = configCandidates().find(candidate => existsSync(join(process.cwd(), candidate)))

  if (configFile) {
    results.push({
      name: 'Configuration',
      status: 'pass',
      message: configFile,
    })
  }
  else {
    // Running on defaults is a supported setup, not a problem to fix — say so
    // rather than implying something is missing.
    results.push({
      name: 'Configuration',
      status: 'pass',
      message: 'using defaults (no config file)',
      detail: `Looked for: ${configCandidates().join(', ')}`,
    })
  }

  // Check 3: Docs directory
  //
  // Resolved from config rather than assumed to be ./docs. Hardcoding it made
  // doctor fail — and exit 1 — on any project that set `docsDir`.
  const docsDirSetting = options.dir || config.docsDir || './docs'
  const docsDir = join(process.cwd(), docsDirSetting)

  if (existsSync(docsDir)) {
    const { Glob } = await import('bun')
    const glob = new Glob('**/*.md')
    let mdCount = 0

    for await (const _file of glob.scan(docsDir)) {
      mdCount++
    }

    results.push({
      name: 'Documentation',
      status: mdCount > 0 ? 'pass' : 'warn',
      message: `${mdCount} markdown files in ${docsDirSetting}`,
      fix: mdCount > 0 ? undefined : `Add a .md file under ${docsDirSetting}, or run "bunpress new index"`,
    })
  }
  else {
    results.push({
      name: 'Documentation',
      status: 'fail',
      message: `${docsDirSetting} not found`,
      fix: 'Run "bunpress init" to create the docs directory',
      detail: `Resolved from ${options.dir ? '--dir' : config.docsDir ? 'config docsDir' : 'the default'}`,
    })
  }

  // Check 4: Package.json
  const packageJsonPath = join(process.cwd(), 'package.json')
  if (existsSync(packageJsonPath)) {
    const packageJson = await Bun.file(packageJsonPath).json()
    const hasDevScript = packageJson.scripts?.dev
    const hasBuildScript = packageJson.scripts?.build

    results.push({
      name: 'Package Scripts',
      status: hasDevScript && hasBuildScript ? 'pass' : 'warn',
      message: `dev: ${hasDevScript ? '✓' : '✗'}, build: ${hasBuildScript ? '✓' : '✗'}`,
      fix: hasDevScript && hasBuildScript
        ? undefined
        : 'Add "dev": "bunpress dev" and "build": "bunpress build" to package.json scripts',
    })

    // Is BunPress available to this project?
    //
    // The dependency lists are the normal answer, but this repo is BunPress
    // itself — it depends on no such package and never will, and reporting
    // that as a problem to every contributor is noise.
    const declared = packageJson.dependencies?.['@stacksjs/bunpress']
      || packageJson.devDependencies?.['@stacksjs/bunpress']
    const isSourceRepo = packageJson.name === '@stacksjs/bunpress'
      || existsSync(join(process.cwd(), 'packages', 'bunpress', 'package.json'))

    if (isSourceRepo) {
      results.push({
        name: 'BunPress Package',
        status: 'pass',
        message: 'this is the BunPress source repository',
      })
    }
    else {
      results.push({
        name: 'BunPress Package',
        status: declared ? 'pass' : 'warn',
        message: declared || 'not declared in package.json',
        fix: declared ? undefined : 'Run "bun add -d @stacksjs/bunpress"',
      })
    }
  }
  else {
    results.push({
      name: 'Package.json',
      status: 'warn',
      message: 'Not found',
      fix: 'Run "bun init" to create one',
    })
  }

  // Check 5: Node modules
  const nodeModulesPath = join(process.cwd(), 'node_modules')
  if (existsSync(nodeModulesPath)) {
    results.push({
      name: 'Dependencies',
      status: 'pass',
      message: 'node_modules found',
    })
  }
  else {
    results.push({
      name: 'Dependencies',
      status: 'warn',
      message: 'node_modules not found',
      fix: 'Run "bun install"',
    })
  }

  // Check 6: Git repository
  const gitPath = join(process.cwd(), '.git')
  if (existsSync(gitPath)) {
    results.push({
      name: 'Git Repository',
      status: 'pass',
      message: 'Initialized',
    })
  }
  else {
    // Only git gives "last updated" a real answer; without it pages fall back
    // to file mtimes, which are whatever the last checkout wrote.
    results.push({
      name: 'Git Repository',
      status: 'warn',
      message: 'Not initialized',
      fix: 'Run "git init" — without it, "last updated" falls back to file timestamps',
    })
  }

  // Check 7: TypeScript configuration
  const tsconfigPath = join(process.cwd(), 'tsconfig.json')
  if (existsSync(tsconfigPath)) {
    results.push({
      name: 'TypeScript',
      status: 'pass',
      message: 'tsconfig.json found',
    })
  }
  else {
    results.push({
      name: 'TypeScript',
      status: 'warn',
      message: 'tsconfig.json not found',
      fix: 'Only needed for a TypeScript config file — safe to ignore otherwise',
    })
  }

  // Display results
  for (const result of results) {
    const icon = result.status === 'pass' ? '✓' : result.status === 'fail' ? '✗' : '⚠'
    const color = result.status === 'pass' ? 'green' : result.status === 'fail' ? 'red' : 'yellow'

    console.log(`  ${colorize(icon, color)} ${result.name}: ${colorize(result.message, 'dim')}`)

    if (verbose && result.detail)
      console.log(`      ${colorize(result.detail, 'dim')}`)
  }

  console.log()

  // Summary
  const passCount = results.filter(r => r.status === 'pass').length
  const failCount = results.filter(r => r.status === 'fail').length
  const warnCount = results.filter(r => r.status === 'warn').length

  // Remediation is carried by each check, so it prints whenever that check is
  // unhappy. It used to be a hardcoded list inside the failure branch, which
  // meant advice for warning-level checks — "run bun install", the common case
  // — was only ever shown when some unrelated check had already failed.
  const actions = results.filter(result => result.status !== 'pass' && result.fix)
  if (actions.length > 0) {
    logInfo('Recommended actions:')
    for (const result of actions)
      console.log(`  • ${result.fix}`)
    console.log()
  }

  if (failCount > 0) {
    logError(`${failCount} checks failed, ${warnCount} warnings`)
    return false
  }

  if (warnCount > 0) {
    logWarning(`${passCount} checks passed, ${warnCount} warnings`)
    return true
  }

  logSuccess(`All ${passCount} checks passed!`)
  return true
}
