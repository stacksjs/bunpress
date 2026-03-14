import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { colorize, logError, logInfo, logSuccess } from '../utils'

interface ConfigOptions {
  verbose?: boolean
}

/**
 * Show current configuration
 */
export async function configShowCommand(options: ConfigOptions = {}): Promise<boolean> {
  try {
    // Try to load config
    const configFiles = ['bunpress.config.ts', 'bunpress.config.js']
    let configPath: string | null = null

    for (const file of configFiles) {
      const path = join(process.cwd(), file)
      if (existsSync(path)) {
        configPath = path
        break
      }
    }

    if (!configPath) {
      logError('No configuration file found')
      logInfo('Run "bunpress config init" to create one')
      return false
    }

    logSuccess(`Configuration file: ${configPath}`)
    console.log()

    // Read and display file contents
    const content = await Bun.file(configPath).text()
    console.log(colorize('Configuration:', 'bold'))
    console.log(content)

    return true
  }
  catch (err) {
    logError(`Failed to show configuration: ${err}`)
    return false
  }
}

/**
 * Validate configuration file
 */
export async function configValidateCommand(options: ConfigOptions = {}): Promise<boolean> {
  const verbose = options.verbose || false

  try {
    // Find config file
    const configFiles = ['bunpress.config.ts', 'bunpress.config.js']
    let configPath: string | null = null

    for (const file of configFiles) {
      const path = join(process.cwd(), file)
      if (existsSync(path)) {
        configPath = path
        break
      }
    }

    if (!configPath) {
      logError('No configuration file found')
      return false
    }

    if (verbose) {
      logInfo(`Validating ${configPath}...`)
    }

    // Try to import the config
    const configModule = await import(configPath)
    const config = configModule.default

    if (!config) {
      logError('Configuration file does not export a default object')
      return false
    }

    // Basic validation
    const issues: string[] = []

    // Check markdown config
    if (config.markdown) {
      if (config.markdown.toc && typeof config.markdown.toc !== 'object' && typeof config.markdown.toc !== 'boolean') {
        issues.push('markdown.toc should be an object or boolean')
      }

      if (config.markdown.features) {
        if (typeof config.markdown.features !== 'object') {
          issues.push('markdown.features should be an object')
        }
      }
    }

    // Check nav config
    if (config.nav) {
      if (!Array.isArray(config.nav)) {
        issues.push('nav should be an array')
      }
      else {
        for (const [index, item] of config.nav.entries()) {
          if (!item.text || !item.link) {
            issues.push(`nav[${index}] is missing required fields (text, link)`)
          }
        }
      }
    }

    // Check sitemap config
    if (config.sitemap) {
      if (!config.sitemap.hostname) {
        issues.push('sitemap.hostname is required for SEO')
      }
    }

    if (issues.length > 0) {
      logError('Configuration validation failed:')
      for (const issue of issues) {
        console.log(`  • ${issue}`)
      }
      return false
    }

    logSuccess('Configuration is valid ✓')
    return true
  }
  catch (err) {
    logError(`Failed to validate configuration: ${err}`)
    return false
  }
}

/**
 * Initialize configuration file
 */
export async function configInitCommand(options: ConfigOptions = {}): Promise<boolean> {
  const configPath = join(process.cwd(), 'bunpress.config.ts')

  // Check if config already exists
  if (existsSync(configPath)) {
    logError('Configuration file already exists')
    return false
  }

  const defaultConfig = `import type { BunPressConfig } from '@stacksjs/bunpress'

export default {
  verbose: false,

  markdown: {
    toc: {
      enabled: true,
      position: 'sidebar',
      minDepth: 2,
      maxDepth: 3,
    },
    features: {
      inlineFormatting: true,
      containers: true,
      githubAlerts: true,
      codeBlocks: {
        lineNumbers: true,
        lineHighlighting: true,
        focus: true,
        diff: true,
        errorWarning: true,
      },
      codeGroups: true,
      codeImports: true,
      inlineToc: true,
      customAnchors: true,
      emoji: true,
      badges: true,
      includes: true,
      externalLinks: {
        enabled: true,
        openInNewTab: true,
        addIcon: true,
      },
      imageLazyLoading: true,
      tables: {
        responsive: true,
        striped: true,
        hover: true,
      },
    },
  },

  nav: [
    { text: 'Home', link: '/' },
    { text: 'Guide', link: '/guide/' },
  ],

  sitemap: {
    hostname: 'https://example.com',
  },
} satisfies BunPressConfig
`

  try {
    await Bun.write(configPath, defaultConfig)
    logSuccess(`Created ${configPath}`)
    return true
  }
  catch (err) {
    logError(`Failed to create configuration: ${err}`)
    return false
  }
}
