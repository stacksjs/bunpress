# Plugin Development

This guide covers how to create plugins to extend BunPress functionality.

## Plugin Overview

BunPress plugins can:

- Extend or modify configuration
- Validate configuration options
- React to configuration changes
- Hook into build lifecycle events

## Plugin Interface

A BunPress plugin implements the `ConfigPlugin` interface:

```typescript
import type { ConfigPlugin, BunPressConfig } from '@stacksjs/bunpress'

const myPlugin: ConfigPlugin = {
  name: 'my-plugin',

  extendConfig(config) {
    // Modify and return config
    return config
  },

  validateConfig(config) {
    // Return validation result
    return { valid: true, errors: [], warnings: [] }
  },

  onConfigLoad(config) {
    // Called when config is loaded
  },

  onConfigChange(newConfig, oldConfig) {
    // Called when config changes
  },
}

export default myPlugin
```

## Creating a Plugin

### Basic Plugin

A simple plugin that adds default metadata:

```typescript
// plugins/meta-plugin.ts
import type { ConfigPlugin } from '@stacksjs/bunpress'

export const metaPlugin: ConfigPlugin = {
  name: 'meta-defaults',

  extendConfig(config) {
    return {
      ...config,
      markdown: {
        ...config.markdown,
        meta: {
          generator: 'BunPress',
          viewport: 'width=device-width, initial-scale=1.0',
          ...config.markdown?.meta,
        },
      },
    }
  },
}
```

### Validation Plugin

A plugin that validates configuration:

```typescript
// plugins/validation-plugin.ts
import type { ConfigPlugin, ConfigValidationResult } from '@stacksjs/bunpress'

export const validationPlugin: ConfigPlugin = {
  name: 'strict-validation',

  validateConfig(config): ConfigValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check for required fields
    if (!config.sitemap?.baseUrl) {
      errors.push('sitemap.baseUrl is required for SEO')
    }

    if (!config.markdown?.title) {
      warnings.push('No default title set, using fallback')
    }

    // Check nav structure
    if (config.nav) {
      for (const item of config.nav) {
        if (!item.text) {
          errors.push('Navigation items must have text')
        }
        if (!item.link && !item.items) {
          errors.push(`Nav item "${item.text}" needs link or items`)
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  },
}
```

### Lifecycle Plugin

A plugin that hooks into lifecycle events:

```typescript
// plugins/analytics-plugin.ts
import type { ConfigPlugin } from '@stacksjs/bunpress'

export const analyticsPlugin: ConfigPlugin = {
  name: 'analytics-logger',

  onConfigLoad(config) {
    console.log(`[Analytics] Site loaded: ${config.markdown?.title}`)
    console.log(`[Analytics] Docs directory: ${config.docsDir}`)
  },

  onConfigChange(newConfig, oldConfig) {
    if (newConfig.docsDir !== oldConfig.docsDir) {
      console.log(`[Analytics] Docs directory changed`)
    }
  },
}
```

## Registering Plugins

Add plugins to your configuration:

```typescript
// bunpress.config.ts
import { metaPlugin } from './plugins/meta-plugin'
import { validationPlugin } from './plugins/validation-plugin'
import { analyticsPlugin } from './plugins/analytics-plugin'

export default {
  plugins: [
    metaPlugin,
    validationPlugin,
    analyticsPlugin,
  ],

  // ... rest of config
}
```

## Plugin Hooks

### extendConfig

Called before configuration is finalized. Use this to add defaults or transform config:

```typescript
extendConfig(config) {
  // Add custom sidebar items
  const sidebar = config.markdown?.sidebar || {}

  return {
    ...config,
    markdown: {
      ...config.markdown,
      sidebar: {
        ...sidebar,
        '/api/': [
          { text: 'Auto-generated API', link: '/api/' },
          ...generateApiSidebar(),
        ],
      },
    },
  }
}
```

### validateConfig

Called after config is loaded. Return validation results:

```typescript
validateConfig(config): ConfigValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Perform validation checks
  if (config.fathom?.enabled && !config.fathom?.siteId) {
    errors.push('Fathom siteId required when enabled')
  }

  return { valid: errors.length === 0, errors, warnings }
}
```

### onConfigLoad

Called once when configuration is initially loaded:

```typescript
async onConfigLoad(config) {
  // Initialize resources
  await initializeDatabase()

  // Log startup info
  console.log(`Starting with ${config.nav?.length || 0} nav items`)
}
```

### onConfigChange

Called when configuration changes during development:

```typescript
onConfigChange(newConfig, oldConfig) {
  // Detect specific changes
  if (newConfig.markdown?.toc?.enabled !== oldConfig.markdown?.toc?.enabled) {
    console.log('TOC setting changed, rebuilding...')
  }
}
```

## Example Plugins

### Auto-Sidebar Plugin

Automatically generates sidebar from file structure:

```typescript
// plugins/auto-sidebar.ts
import { readdirSync, statSync } from 'fs'
import { join, basename, extname } from 'path'
import type { ConfigPlugin, SidebarItem } from '@stacksjs/bunpress'

function generateSidebar(dir: string, basePath: string = ''): SidebarItem[] {
  const items: SidebarItem[] = []
  const entries = readdirSync(dir)

  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      items.push({
        text: formatTitle(entry),
        items: generateSidebar(fullPath, `${basePath}/${entry}`),
      })
    } else if (extname(entry) === '.md') {
      const name = basename(entry, '.md')
      if (name !== 'index') {
        items.push({
          text: formatTitle(name),
          link: `${basePath}/${name}`,
        })
      }
    }
  }

  return items
}

function formatTitle(name: string): string {
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

export const autoSidebarPlugin: ConfigPlugin = {
  name: 'auto-sidebar',

  extendConfig(config) {
    const docsDir = config.docsDir || './docs'
    const guidePath = join(docsDir, 'guide')

    return {
      ...config,
      markdown: {
        ...config.markdown,
        sidebar: {
          ...config.markdown?.sidebar,
          '/guide/': generateSidebar(guidePath, '/guide'),
        },
      },
    }
  },
}
```

### Git Info Plugin

Adds git commit info to builds:

```typescript
// plugins/git-info.ts
import { execSync } from 'child_process'
import type { ConfigPlugin } from '@stacksjs/bunpress'

function getGitInfo() {
  try {
    return {
      commit: execSync('git rev-parse --short HEAD').toString().trim(),
      branch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim(),
      date: execSync('git log -1 --format=%cd --date=short').toString().trim(),
    }
  } catch {
    return null
  }
}

export const gitInfoPlugin: ConfigPlugin = {
  name: 'git-info',

  extendConfig(config) {
    const gitInfo = getGitInfo()

    if (!gitInfo) {
      return config
    }

    return {
      ...config,
      markdown: {
        ...config.markdown,
        meta: {
          ...config.markdown?.meta,
          'git-commit': gitInfo.commit,
          'git-branch': gitInfo.branch,
          'build-date': gitInfo.date,
        },
      },
    }
  },
}
```

### Social Cards Plugin

Generates Open Graph metadata:

```typescript
// plugins/social-cards.ts
import type { ConfigPlugin } from '@stacksjs/bunpress'

export const socialCardsPlugin: ConfigPlugin = {
  name: 'social-cards',

  extendConfig(config) {
    const baseUrl = config.sitemap?.baseUrl || ''
    const title = config.markdown?.title || 'Documentation'

    return {
      ...config,
      markdown: {
        ...config.markdown,
        meta: {
          ...config.markdown?.meta,
          'og:type': 'website',
          'og:title': title,
          'og:site_name': title,
          'og:image': `${baseUrl}/og-image.png`,
          'twitter:card': 'summary_large_image',
          'twitter:title': title,
          'twitter:image': `${baseUrl}/og-image.png`,
        },
      },
    }
  },
}
```

## Best Practices

### Plugin Naming

Use descriptive, unique names:

```typescript
const myPlugin: ConfigPlugin = {
  name: 'my-company/feature-name',  // Namespaced
  // ...
}
```

### Error Handling

Handle errors gracefully:

```typescript
extendConfig(config) {
  try {
    // Potentially failing operation
    const data = loadExternalData()
    return { ...config, customData: data }
  } catch (error) {
    console.warn('[my-plugin] Failed to load data, using defaults')
    return config
  }
}
```

### Async Operations

Use async hooks for I/O operations:

```typescript
async onConfigLoad(config) {
  // Async operations are supported
  const remoteConfig = await fetchRemoteConfig()
  console.log('Remote config loaded:', remoteConfig)
}
```

### Type Safety

Use TypeScript for type-safe plugins:

```typescript
import type {
  ConfigPlugin,
  BunPressConfig,
  ConfigValidationResult,
} from '@stacksjs/bunpress'

const myPlugin: ConfigPlugin = {
  name: 'type-safe-plugin',

  extendConfig(config: BunPressConfig): BunPressConfig {
    return {
      ...config,
      // TypeScript validates this
    }
  },

  validateConfig(config: BunPressConfig): ConfigValidationResult {
    return {
      valid: true,
      errors: [],
      warnings: [],
    }
  },
}
```

## Related

- [Configuration Guide](/guide/configuration)
- [CLI Reference](/cli)
- [Theme Customization](/guide/theming)
