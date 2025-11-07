import { existsSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import { confirm, formatBytes, getFileSize, logError, logInfo, logSuccess, Spinner } from '../utils'
import { config } from '../../src/config'
import type { BunPressConfig } from '../../src/types'

interface CleanOptions {
  outdir?: string
  force?: boolean
  verbose?: boolean
}

/**
 * Get directory size recursively
 */
async function getDirectorySize(dirPath: string): Promise<number> {
  try {
    const { Glob } = await import('bun')
    const glob = new Glob('**/*')
    let totalSize = 0

    for await (const file of glob.scan(dirPath)) {
      const filePath = `${dirPath}/${file}`
      const size = await getFileSize(filePath)
      totalSize += size
    }

    return totalSize
  }
  catch {
    return 0
  }
}

/**
 * Clean build artifacts and output directories
 */
export async function cleanCommand(options: CleanOptions = {}): Promise<boolean> {
  const bunPressConfig = await config as BunPressConfig
  const baseOutdir = options.outdir || bunPressConfig.outDir || './dist'
  // Clean the .bunpress folder inside the output directory
  const outdir = join(baseOutdir, '.bunpress')
  const force = options.force || false
  const verbose = options.verbose || false

  try {
    // Check if directory exists
    const dirExists = existsSync(outdir)

    if (!dirExists) {
      logInfo(`Directory "${outdir}" does not exist, nothing to clean`)
      return true
    }

    // Get directory size
    const size = await getDirectorySize(outdir)

    if (verbose) {
      logInfo(`Found "${outdir}" (${formatBytes(size)})`)
    }

    // Confirm deletion unless force flag is set
    if (!force) {
      const shouldDelete = await confirm(
        `Delete "${outdir}" directory? (${formatBytes(size)})`,
        false,
      )

      if (!shouldDelete) {
        logInfo('Clean cancelled')
        return false
      }
    }

    // Only show spinner if not in test environment
    const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true' || process.env.BUN_ENV === 'test'
    let spinner: Spinner | null = null

    if (!isTest && !verbose) {
      spinner = new Spinner('Cleaning build artifacts...')
      spinner.start()
    }

    // Remove directory
    await rm(outdir, { recursive: true, force: true })

    if (spinner) {
      spinner.succeed(`Cleaned ${formatBytes(size)} from "${outdir}"`)
    }
    else if (verbose || isTest) {
      logSuccess(`Cleaned ${formatBytes(size)} from "${outdir}"`)
    }

    return true
  }
  catch (err) {
    logError(`Failed to clean directory: ${err}`)
    return false
  }
}
