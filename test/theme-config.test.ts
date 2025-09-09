import { describe, expect, test } from 'bun:test'
import { assertHtmlContains, buildTestSite, readBuiltFile } from './utils/test-helpers'

describe('Theme Configuration', () => {
  describe('Theme Config Structure', () => {
    test('should merge user config with defaults', async () => {
      const content = `---
themeConfig:
  nav:
    - text: Home
      link: /
  sidebar:
    - text: Guide
      link: /guide
---

# Merged Config

Content with merged configuration.
      `

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
        config: {
          markdown: {
            title: 'Test Site',
          },
        },
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'Test Site')).toBe(true)
      expect(assertHtmlContains(html, 'Home')).toBe(true)
      expect(assertHtmlContains(html, 'Guide')).toBe(true)
    })

    test('should validate theme configuration', async () => {
      const content = `---
themeConfig:
  nav: "invalid"  # Should be array
  sidebar: "invalid"  # Should be array
---

# Invalid Config

Content with invalid configuration.
      `

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(false)
      expect(result.logs.some(log => log.toLowerCase().includes('validation'))).toBe(true)
    })

    test('should support custom theme extensions', async () => {
      const content = `---
themeConfig:
  extends: './custom-theme'
  customOption: 'value'
---

# Extended Theme

Content with extended theme.
      `

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'theme-extended')).toBe(true)
      expect(assertHtmlContains(html, 'custom-theme')).toBe(true)
      expect(assertHtmlContains(html, 'customOption')).toBe(true)
    })

    test('should handle nested configuration objects', async () => {
      const content = `---
themeConfig:
  colors:
    primary: '#007acc'
    secondary: '#ff4081'
  fonts:
    heading: 'Inter'
    body: 'Roboto'
  spacing:
    small: '0.5rem'
    medium: '1rem'
    large: '2rem'
---

# Nested Config

Content with nested configuration.
      `

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, '#007acc')).toBe(true)
      expect(assertHtmlContains(html, '#ff4081')).toBe(true)
      expect(assertHtmlContains(html, 'Inter')).toBe(true)
      expect(assertHtmlContains(html, 'Roboto')).toBe(true)
    })

    test('should support environment-specific configs', async () => {
      const content = `---
themeConfig:
  dev:
    debug: true
    hotReload: true
  prod:
    debug: false
    minify: true
---

# Environment Config

Content with environment-specific configuration.
      `

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'environment-config')).toBe(true)
      expect(assertHtmlContains(html, 'debug')).toBe(true)
    })
  })

  describe('Configuration Inheritance', () => {
    test.skip('should inherit from parent directories', async () => {
      const content = `---
title: Child Page
---

# Child Page

Content that inherits parent config.
      `

      const result = await buildTestSite({
        files: [
          {
            path: '_config.md',
            content: `---
themeConfig:
  nav:
    - text: Home
      link: /
---

# Parent Config

Parent configuration.
            `,
          },
          { path: 'child.md', content },
        ],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'Child Page')).toBe(true)
      expect(assertHtmlContains(html, 'Home')).toBe(true)
      expect(assertHtmlContains(html, 'inherited-config')).toBe(true)
    })

    test.skip('should override parent configuration', async () => {
      const content = `---
themeConfig:
  nav:
    - text: Custom Nav
      link: /custom
---

# Override Config

Content that overrides parent config.
      `

      const result = await buildTestSite({
        files: [
          {
            path: '_config.md',
            content: `---
themeConfig:
  nav:
    - text: Parent Nav
      link: /parent
---

# Parent Config

Parent configuration.
            `,
          },
          { path: 'child.md', content },
        ],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'Custom Nav')).toBe(true)
      expect(assertHtmlContains(html, 'Parent Nav')).toBe(false)
      expect(assertHtmlContains(html, 'override-config')).toBe(true)
    })

    test.skip('should merge arrays from parent configs', async () => {
      const content = `---
themeConfig:
  nav:
    - text: Child Nav
      link: /child
---

# Merged Arrays

Content with merged array configuration.
      `

      const result = await buildTestSite({
        files: [
          {
            path: '_config.md',
            content: `---
themeConfig:
  nav:
    - text: Parent Nav
      link: /parent
---

# Parent Config

Parent configuration.
            `,
          },
          { path: 'child.md', content },
        ],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'Parent Nav')).toBe(true)
      expect(assertHtmlContains(html, 'Child Nav')).toBe(true)
      expect(assertHtmlContains(html, 'merged-arrays')).toBe(true)
    })
  })

  describe('Configuration Loading', () => {
    test.skip('should load config from bunpress.config.ts', async () => {
      const content = `
# Config File Test

Content with config file.
      `

      const result = await buildTestSite({
        files: [
          { path: 'bunpress.config.ts', content: `
export default {
  title: 'From Config File',
  themeConfig: {
    nav: [{ text: 'Config Nav', link: '/config' }]
  }
}
          ` },
          { path: 'test.md', content },
        ],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'From Config File')).toBe(true)
      expect(assertHtmlContains(html, 'Config Nav')).toBe(true)
    })

    test.skip('should load config from .vitepress/config.ts', async () => {
      const content = `
# VitePress Config Test

Content with VitePress-style config.
      `

      const result = await buildTestSite({
        files: [
          {
            path: '.vitepress/config.ts',
            content: `
export default {
  title: 'VitePress Style',
  themeConfig: {
    nav: [{ text: 'VP Nav', link: '/vp' }]
  }
}
          `,
          },
          { path: 'test.md', content },
        ],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'VitePress Style')).toBe(true)
      expect(assertHtmlContains(html, 'VP Nav')).toBe(true)
    })

    test.skip('should support multiple config formats', async () => {
      const content = `
# Multi Format Config

Content with multiple config formats.
      `

      const result = await buildTestSite({
        files: [
          { path: 'bunpress.config.js', content: `
module.exports = {
  title: 'JS Config',
  themeConfig: { nav: [{ text: 'JS Nav', link: '/js' }] }
}
          ` },
          { path: 'test.md', content },
        ],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'JS Config')).toBe(true)
      expect(assertHtmlContains(html, 'JS Nav')).toBe(true)
    })

    test.skip('should handle config loading errors gracefully', async () => {
      const content = `
# Config Error Test

Content with config error handling.
      `

      const result = await buildTestSite({
        files: [
          { path: 'bunpress.config.ts', content: `
export default {
  invalidConfig: undefined.property // This will cause an error
}
          ` },
          { path: 'test.md', content },
        ],
      })

      expect(result.success).toBe(false)
      expect(result.logs.some(log => log.includes('config error'))).toBe(true)
    })
  })

  describe('Runtime Configuration', () => {
    test('should support runtime config updates', async () => {
      const content = `---
themeConfig:
  nav:
    - text: Dynamic Nav
      link: /dynamic
---

# Runtime Config

Content with runtime configuration.
      `

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'runtime-config')).toBe(true)
      expect(assertHtmlContains(html, 'dynamic-update')).toBe(true)
      expect(assertHtmlContains(html, 'Dynamic Nav')).toBe(true)
    })

    test.skip('should handle config hot reloading', async () => {
      const content = `
# Hot Reload Config

Content with hot reload support.
      `

      const result = await buildTestSite({
        files: [
          { path: 'bunpress.config.ts', content: `
export default {
  title: 'Hot Reload Test',
  themeConfig: { nav: [{ text: 'Hot Nav', link: '/hot' }] }
}
          ` },
          { path: 'test.md', content },
        ],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'hot-reload')).toBe(true)
      expect(assertHtmlContains(html, 'config-watch')).toBe(true)
      expect(assertHtmlContains(html, 'Hot Reload Test')).toBe(true)
    })

    test.skip('should validate runtime config changes', async () => {
      const content = `---
themeConfig:
  invalidProperty: 'should be caught'
---

# Runtime Validation

Content with runtime validation.
      `

      const result = await buildTestSite({
        files: [{ path: 'test.md', content }],
      })

      expect(result.success).toBe(false)
      expect(result.logs.some(log => log.includes('validation error'))).toBe(true)
    })
  })

  describe('Configuration Plugins', () => {
    test.skip('should support configuration plugins', async () => {
      const content = `
# Plugin Config

Content with configuration plugins.
      `

      const result = await buildTestSite({
        files: [
          { path: 'bunpress.config.ts', content: `
export default {
  plugins: [
    {
      name: 'test-plugin',
      extendConfig: (config) => ({
        ...config,
        title: 'Plugin Modified Title'
      })
    }
  ],
  themeConfig: {
    nav: [{ text: 'Plugin Nav', link: '/plugin' }]
  }
}
          ` },
          { path: 'test.md', content },
        ],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'Plugin Modified Title')).toBe(true)
      expect(assertHtmlContains(html, 'Plugin Nav')).toBe(true)
      expect(assertHtmlContains(html, 'config-plugin')).toBe(true)
    })

    test.skip('should handle plugin execution order', async () => {
      const content = `
# Plugin Order

Content with plugin execution order.
      `

      const result = await buildTestSite({
        files: [
          { path: 'bunpress.config.ts', content: `
export default {
  plugins: [
    {
      name: 'first-plugin',
      extendConfig: (config) => ({
        ...config,
        title: config.title + ' First'
      })
    },
    {
      name: 'second-plugin',
      extendConfig: (config) => ({
        ...config,
        title: config.title + ' Second'
      })
    }
  ],
  title: 'Base'
}
          ` },
          { path: 'test.md', content },
        ],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'Base First Second')).toBe(true)
      expect(assertHtmlContains(html, 'plugin-order')).toBe(true)
    })

    test.skip('should handle plugin errors gracefully', async () => {
      const content = `
# Plugin Error

Content with plugin error handling.
      `

      const result = await buildTestSite({
        files: [
          { path: 'bunpress.config.ts', content: `
export default {
  plugins: [
    {
      name: 'error-plugin',
      extendConfig: () => {
        throw new Error('Plugin error')
      }
    }
  ]
}
          ` },
          { path: 'test.md', content },
        ],
      })

      expect(result.success).toBe(false)
      expect(result.logs.some(log => log.includes('Plugin error'))).toBe(true)
    })
  })

  describe('Configuration Types', () => {
    test.skip('should support TypeScript configuration', async () => {
      const content = `
# TypeScript Config

Content with TypeScript configuration.
      `

      const result = await buildTestSite({
        files: [
          { path: 'bunpress.config.ts', content: `
import type { BunPressConfig } from './src/types'

const config: BunPressConfig = {
  title: 'TypeScript Config',
  themeConfig: {
    nav: [{ text: 'TS Nav', link: '/ts' }]
  }
}

export default config
          ` },
          { path: 'test.md', content },
        ],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'TypeScript Config')).toBe(true)
      expect(assertHtmlContains(html, 'TS Nav')).toBe(true)
    })

    test.skip('should support JSON configuration', async () => {
      const content = `
# JSON Config

Content with JSON configuration.
      `

      const result = await buildTestSite({
        files: [
          { path: 'bunpress.config.json', content: `
{
  "title": "JSON Config",
  "themeConfig": {
    "nav": [
      {
        "text": "JSON Nav",
        "link": "/json"
      }
    ]
  }
}
          ` },
          { path: 'test.md', content },
        ],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'JSON Config')).toBe(true)
      expect(assertHtmlContains(html, 'JSON Nav')).toBe(true)
    })

    test.skip('should support YAML configuration', async () => {
      const content = `
# YAML Config

Content with YAML configuration.
      `

      const result = await buildTestSite({
        files: [
          { path: 'bunpress.config.yml', content: `
title: YAML Config
themeConfig:
  nav:
    - text: YAML Nav
      link: /yaml
          ` },
          { path: 'test.md', content },
        ],
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0])
      expect(assertHtmlContains(html, 'YAML Config')).toBe(true)
      expect(assertHtmlContains(html, 'YAML Nav')).toBe(true)
    })
  })
})
