import type {
  BunPressOptions,
  BunPressConfig,
  MarkdownPluginConfig,
  NavItem,
  SidebarItem,
  SearchConfig,
  ThemeConfig,
  ConfigPlugin,
  ConfigValidationResult
} from './types'
import { join, dirname, basename } from 'node:path'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'

// Configuration file formats supported
const CONFIG_FILES = [
  'bunpress.config.ts',
  'bunpress.config.js',
  'bunpress.config.json',
  'bunpress.config.yml',
  'bunpress.config.yaml',
  '.vitepress/config.ts',
  '.vitepress/config.js',
  '.vitepress/config.json',
  '.vitepress/config.yml',
  '.vitepress/config.yaml'
]

// Default configuration
export const defaultConfig: BunPressConfig = {
  // Navigation configuration
  nav: [
    {
      text: 'Home',
      link: '/',
      icon: '🏠'
    },
    {
      text: 'Guide',
      activeMatch: '/guide',
      items: [
        {
          text: 'Getting Started',
          link: '/guide/getting-started'
        },
        {
          text: 'Installation',
          link: '/guide/installation'
        },
        {
          text: 'Configuration',
          link: '/guide/configuration'
        }
      ]
    },
    {
      text: 'API',
      link: '/api',
      activeMatch: '/api'
    },
    {
      text: 'Examples',
      link: '/examples',
      activeMatch: '/examples'
    }
  ],

  // Plugin configuration
  plugins: [],

  // Default markdown plugin configuration
  markdown: {
    title: 'BunPress Documentation',
    meta: {
      description: 'Documentation built with BunPress',
      generator: 'BunPress',
      viewport: 'width=device-width, initial-scale=1.0',
    },
    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/' },
            { text: 'Installation', link: '/install' },
            { text: 'Usage', link: '/usage' },
            { text: 'Configuration', link: '/config' }
          ]
        },
        {
          text: 'Features',
          items: [
            { text: 'Markdown Extensions', link: '/markdown-extensions' },
            { text: 'Table of Contents', link: '/table-of-contents' }
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Custom Templates', link: '/advanced#custom-templates' },
            { text: 'Plugin System', link: '/advanced#plugin-system' },
            { text: 'Build Optimization', link: '/advanced#build-optimization' },
            { text: 'Custom CSS & JS', link: '/advanced#custom-css-and-javascript' },
            { text: 'Environment Variables', link: '/advanced#environment-variables' },
            { text: 'Custom Marked Extensions', link: '/advanced#custom-marked-extensions' },
            { text: 'Build Hooks', link: '/advanced#build-hooks' },
            { text: 'Custom File Processing', link: '/advanced#custom-file-processing' },
            { text: 'Performance Monitoring', link: '/advanced#performance-monitoring' },
            { text: 'Internationalization', link: '/advanced#internationalization-i18n' },
            { text: 'Custom Error Handling', link: '/advanced#custom-error-handling' },
            { text: 'Security Considerations', link: '/advanced#security-considerations' },
            { text: 'Deployment Options', link: '/advanced#deployment-options' },
            { text: 'API Reference', link: '/advanced#api-reference' }
          ]
        },
        {
          text: 'Best Practices & Examples',
          items: [
            { text: 'Project Structure', link: '/best-practices#project-structure' },
            { text: 'Writing Content', link: '/best-practices#writing-content' },
            { text: 'Documentation Patterns', link: '/best-practices#documentation-patterns' },
            { text: 'Advanced Examples', link: '/best-practices#advanced-examples' },
            { text: 'SEO Optimization', link: '/best-practices#seo-optimization' },
            { text: 'Performance Best Practices', link: '/best-practices#performance-best-practices' },
            { text: 'Accessibility', link: '/best-practices#accessibility' },
            { text: 'Internationalization', link: '/best-practices#internationalization' },
            { text: 'Testing Documentation', link: '/best-practices#testing-documentation' },
            { text: 'Deployment Best Practices', link: '/best-practices#deployment-best-practices' },
            { text: 'Maintenance', link: '/best-practices#maintenance' },
            { text: 'Community Engagement', link: '/best-practices#community-engagement' }
          ]
        },
        {
          text: 'More',
          items: [
            { text: 'Showcase', link: '/showcase' },
            { text: 'Partners', link: '/partners' },
            { text: 'License', link: '/license' },
            { text: 'Postcardware', link: '/postcardware' }
          ]
        }
      ]
    },
    css: `
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 100%;
        margin: 0;
        padding: 0;
      }

      .markdown-body {
        padding: 1rem;
        max-width: 800px;
        margin: 0 auto;
      }

      /* Layout specific styles */
      body[data-layout="doc"] .markdown-body {
        padding: 2rem;
        margin-top: 60px;
        margin-left: 280px;
        max-width: calc(100vw - 280px);
      }

      body[data-layout="home"] .markdown-body {
        padding: 0;
        max-width: 100%;
        margin-top: 60px;
        margin-left: 0;
      }

      body[data-layout="home"] .home-content {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
      }

      body[data-layout="page"] .markdown-body {
        padding: 2rem;
        margin-top: 60px;
        margin-left: 280px;
        max-width: calc(100vw - 280px);
      }

      /* Adjust for mobile navigation height and hide sidebar on mobile */
      @media (max-width: 1024px) {
        body[data-layout="doc"] .markdown-body,
        body[data-layout="page"] .markdown-body {
          margin-left: 0;
          max-width: 100%;
          margin-top: 60px;
        }
      }

      @media (max-width: 768px) {
        body[data-layout="doc"] .markdown-body,
        body[data-layout="page"] .markdown-body {
          margin-top: 50px;
          padding-top: 1rem;
        }

        body[data-layout="home"] .markdown-body {
          margin-top: 50px;
        }
      }

      pre {
        background: #f5f5f5;
        border-radius: 3px;
        padding: 12px;
        overflow: auto;
      }

      code {
        font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
        font-size: 0.9em;
      }

      a {
        color: #1F1FE9;
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }

      img {
        max-width: 100%;
      }

      h1, h2, h3, h4, h5, h6 {
        margin-top: 1.5em;
        margin-bottom: 0.75em;
      }

      h1 {
        border-bottom: 1px solid #eaecef;
        padding-bottom: 0.3em;
      }
    `,
    scripts: [],
    preserveDirectoryStructure: true,
  },

  verbose: true,
}

// Plugin system interfaces
export interface ConfigPlugin {
  name: string
  extendConfig?: (config: BunPressConfig) => BunPressConfig
  validateConfig?: (config: BunPressConfig) => ConfigValidationResult
  onConfigLoad?: (config: BunPressConfig) => void | Promise<void>
  onConfigChange?: (newConfig: BunPressConfig, oldConfig: BunPressConfig) => void | Promise<void>
}

export interface ConfigValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// Configuration manager class
export class ConfigManager {
  private config: BunPressConfig
  private plugins: ConfigPlugin[] = []
  private watchers: ((config: BunPressConfig) => void)[] = []

  constructor(initialConfig: BunPressConfig = defaultConfig) {
    this.config = { ...initialConfig }
  }

  // Add a plugin
  addPlugin(plugin: ConfigPlugin): void {
    this.plugins.push(plugin)
  }

  // Merge configuration with defaults
  mergeConfig(userConfig: Partial<BunPressConfig>): void {
    this.config = this.deepMerge(this.config, userConfig)
  }

  // Apply plugins to configuration
  async applyPlugins(): Promise<void> {
    let config = { ...this.config }

    // Apply extendConfig plugins
    for (const plugin of this.plugins) {
      if (plugin.extendConfig) {
        try {
          config = plugin.extendConfig(config)
        } catch (error) {
          console.error(`Plugin ${plugin.name} failed to extend config:`, error)
        }
      }
    }

    this.config = config

    // Call onConfigLoad hooks
    for (const plugin of this.plugins) {
      if (plugin.onConfigLoad) {
        try {
          await plugin.onConfigLoad(this.config)
        } catch (error) {
          console.error(`Plugin ${plugin.name} onConfigLoad failed:`, error)
        }
      }
    }
  }

  // Validate configuration
  validateConfig(): ConfigValidationResult {
    const result: ConfigValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    }

    // Apply plugin validators
    for (const plugin of this.plugins) {
      if (plugin.validateConfig) {
        try {
          const pluginResult = plugin.validateConfig(this.config)
          result.valid = result.valid && pluginResult.valid
          result.errors.push(...pluginResult.errors)
          result.warnings.push(...pluginResult.warnings)
        } catch (error) {
          result.valid = false
          result.errors.push(`Plugin ${plugin.name} validation failed: ${error}`)
        }
      }
    }

    // Built-in validation
    if (this.config.nav && !Array.isArray(this.config.nav)) {
      result.valid = false
      result.errors.push('nav must be an array')
    }

    if (this.config.markdown?.nav && !Array.isArray(this.config.markdown.nav)) {
      result.valid = false
      result.errors.push('markdown.nav must be an array')
    }

    if (this.config.markdown?.sidebar && typeof this.config.markdown.sidebar !== 'object') {
      result.valid = false
      result.errors.push('sidebar must be an object')
    }

    if (this.config.markdown?.themeConfig?.colors && typeof this.config.markdown.themeConfig.colors !== 'object') {
      result.valid = false
      result.errors.push('themeConfig.colors must be an object')
    }

    return result
  }

  // Watch for configuration changes
  watch(callback: (config: BunPressConfig) => void): void {
    this.watchers.push(callback)
  }

  // Update configuration at runtime
  async updateConfig(updates: Partial<BunPressConfig>): Promise<void> {
    const oldConfig = { ...this.config }
    this.mergeConfig(updates)
    await this.applyPlugins()

    // Notify watchers
    for (const watcher of this.watchers) {
      try {
        watcher(this.config)
      } catch (error) {
        console.error('Configuration watcher failed:', error)
      }
    }

    // Notify plugins of config change
    for (const plugin of this.plugins) {
      if (plugin.onConfigChange) {
        try {
          await plugin.onConfigChange(this.config, oldConfig)
        } catch (error) {
          console.error(`Plugin ${plugin.name} onConfigChange failed:`, error)
        }
      }
    }
  }

  // Get current configuration
  getConfig(): BunPressConfig {
    return { ...this.config }
  }

  // Deep merge utility
  private deepMerge(target: any, source: any): any {
    const output = { ...target }

    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            output[key] = source[key]
          } else {
            output[key] = this.deepMerge(target[key], source[key])
          }
        } else {
          output[key] = source[key]
        }
      })
    }

    return output
  }

  private isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item)
  }
}

// Load configuration from file
export async function loadConfigFile(configPath?: string): Promise<BunPressConfig> {
  let configFile = configPath

  if (!configFile) {
    // Find config file
    for (const file of CONFIG_FILES) {
      if (existsSync(file)) {
        configFile = file
        break
      }
    }
  }

  if (!configFile || !existsSync(configFile)) {
    return { ...defaultConfig }
  }

  try {
    const ext = configFile.split('.').pop()?.toLowerCase()

    if (ext === 'json') {
      const content = await readFile(configFile, 'utf-8')
      return JSON.parse(content)
    }

    if (ext === 'yml' || ext === 'yaml') {
      // For YAML support, we'd need to add a YAML parser
      // For now, return default config
      console.warn('YAML config files not yet supported')
      return { ...defaultConfig }
    }

    if (ext === 'ts' || ext === 'js') {
      // For TypeScript/JavaScript files, use absolute path
      const absolutePath = join(process.cwd(), configFile)
      const module = await import(absolutePath)
      return module.default || module
    }
  } catch (error) {
    console.error(`Failed to load config from ${configFile}:`, error)
  }

  return { ...defaultConfig }
}

// Initialize configuration system
export async function initializeConfig(userConfig?: Partial<BunPressConfig>): Promise<ConfigManager> {
  const configManager = new ConfigManager(defaultConfig)

  // Load config from file
  const fileConfig = await loadConfigFile()
  configManager.mergeConfig(fileConfig)

  // Apply user config
  if (userConfig) {
    configManager.mergeConfig(userConfig)
  }

  // Apply plugins
  await configManager.applyPlugins()

  return configManager
}

// Global config instance
let globalConfigManager: ConfigManager | null = null

// Get or create global configuration
export async function getConfigManager(userConfig?: Partial<BunPressConfig>): Promise<ConfigManager> {
  if (!globalConfigManager) {
    globalConfigManager = await initializeConfig(userConfig)
  }
  return globalConfigManager
}

// Get current configuration
export async function getConfig(): Promise<BunPressConfig> {
  const manager = await getConfigManager()
  return manager.getConfig()
}

// Update configuration at runtime
export async function updateConfig(updates: Partial<BunPressConfig>): Promise<void> {
  const manager = await getConfigManager()
  await manager.updateConfig(updates)
}

// Add plugin to configuration system
export async function addConfigPlugin(plugin: ConfigPlugin): Promise<void> {
  const manager = await getConfigManager()
  manager.addPlugin(plugin)
}

// Validate current configuration
export async function validateConfig(): Promise<ConfigValidationResult> {
  const manager = await getConfigManager()
  return manager.validateConfig()
}

// Watch for configuration changes
export async function watchConfig(callback: (config: BunPressConfig) => void): Promise<void> {
  const manager = await getConfigManager()
  manager.watch(callback)
}

// Export for backward compatibility
// eslint-disable-next-line antfu/no-top-level-await
export const config: BunPressConfig = await getConfig()
