import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { colorize, logError, logInfo, logSuccess, logWarning } from '../utils'

interface DoctorOptions {
  verbose?: boolean
}

interface CheckResult {
  name: string
  status: 'pass' | 'fail' | 'warn'
  message: string
}

/**
 * Run diagnostic checks on the project
 */
export async function doctorCommand(options: DoctorOptions = {}): Promise<boolean> {
  const verbose = options.verbose || false
  const results: CheckResult[] = []

  console.log(colorize('\nRunning diagnostics...\n', 'bold'))

  // Check 1: Bun runtime version
  try {
    const bunVersion = Bun.version
    results.push({
      name: 'Bun Runtime',
      status: 'pass',
      message: `v${bunVersion}`,
    })
  }
  catch (err) {
    results.push({
      name: 'Bun Runtime',
      status: 'fail',
      message: 'Not found',
    })
  }

  // Check 2: Configuration file
  const configFiles = ['bunpress.config.ts', 'bunpress.config.js']
  let configFound = false

  for (const configFile of configFiles) {
    if (existsSync(join(process.cwd(), configFile))) {
      configFound = true
      results.push({
        name: 'Configuration',
        status: 'pass',
        message: configFile,
      })
      break
    }
  }

  if (!configFound) {
    results.push({
      name: 'Configuration',
      status: 'warn',
      message: 'No config file found (using defaults)',
    })
  }

  // Check 3: Docs directory
  const docsDir = join(process.cwd(), 'docs')
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
      message: `${mdCount} markdown files`,
    })
  }
  else {
    results.push({
      name: 'Documentation',
      status: 'fail',
      message: 'docs/ directory not found',
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
    })

    // Check if BunPress is installed
    const hasBunPress = packageJson.dependencies?.['@stacksjs/bunpress']
      || packageJson.devDependencies?.['@stacksjs/bunpress']

    results.push({
      name: 'BunPress Package',
      status: hasBunPress ? 'pass' : 'warn',
      message: hasBunPress || 'Not installed',
    })
  }
  else {
    results.push({
      name: 'Package.json',
      status: 'warn',
      message: 'Not found',
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
      message: 'node_modules not found (run: bun install)',
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
    results.push({
      name: 'Git Repository',
      status: 'warn',
      message: 'Not initialized',
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
    })
  }

  // Display results
  for (const result of results) {
    const icon = result.status === 'pass' ? '✓' : result.status === 'fail' ? '✗' : '⚠'
    const color = result.status === 'pass' ? 'green' : result.status === 'fail' ? 'red' : 'yellow'

    console.log(`  ${colorize(icon, color)} ${result.name}: ${colorize(result.message, 'dim')}`)
  }

  console.log()

  // Summary
  const passCount = results.filter(r => r.status === 'pass').length
  const failCount = results.filter(r => r.status === 'fail').length
  const warnCount = results.filter(r => r.status === 'warn').length

  if (failCount > 0) {
    logError(`${failCount} checks failed, ${warnCount} warnings`)
    console.log()
    logInfo('Recommended actions:')

    if (results.find(r => r.name === 'Documentation' && r.status === 'fail')) {
      console.log('  • Run "bunpress init" to create docs directory')
    }

    if (results.find(r => r.name === 'Dependencies' && r.status === 'warn')) {
      console.log('  • Run "bun install" to install dependencies')
    }

    if (results.find(r => r.name === 'BunPress Package' && r.status === 'warn')) {
      console.log('  • Run "bun add @stacksjs/bunpress" to install BunPress')
    }

    return false
  }
  else if (warnCount > 0) {
    logWarning(`${passCount} checks passed, ${warnCount} warnings`)
    return true
  }
  else {
    logSuccess(`All ${passCount} checks passed!`)
    return true
  }
}
