import { describe, expect, test } from 'bun:test'
import { createTestMarkdown, buildTestSite, readBuiltFile, assertHtmlContains, createTestTranslations } from './utils/test-helpers'

describe('Internationalization', () => {
  describe('Locale Detection', () => {
    test('should detect locale from path structure', async () => {
      const content = `---
title: Guide
---

# Guide Page

Guide content in English.
      `

      const result = await buildTestSite({
        files: [
          { path: 'en/guide.md', content },
          { path: 'es/guia.md', content: content.replace('English', 'Spanish') }
        ]
      })

      expect(result.success).toBe(true)

      const enHtml = await readBuiltFile(result.outputs[0], 'en/guide.html')
      expect(assertHtmlContains(enHtml, 'Guide Page')).toBe(true)
      expect(assertHtmlContains(enHtml, 'English')).toBe(true)

      const esHtml = await readBuiltFile(result.outputs[1], 'es/guia.html')
      expect(assertHtmlContains(esHtml, 'Guide Page')).toBe(true)
      expect(assertHtmlContains(esHtml, 'Spanish')).toBe(true)
    })

    test('should fallback to default locale', async () => {
      const content = `---
title: Missing Translation
---

# Missing Translation

Content without translation.
      `

      const result = await buildTestSite({
        files: [
          { path: 'guide.md', content },
          { path: 'locales/en.yml', content: `
guide:
  title: Default Guide
          ` }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'guide.html')
      expect(assertHtmlContains(html, 'Default Guide')).toBe(true)
      expect(assertHtmlContains(html, 'fallback-locale')).toBe(true)
    })

    test('should handle nested locale paths', async () => {
      const content = `---
title: Deep Nested
---

# Deep Nested Page

Content in deeply nested locale path.
      `

      const result = await buildTestSite({
        files: [
          { path: 'docs/en/api/reference.md', content },
          { path: 'docs/es/api/referencia.md', content: content.replace('Deep Nested Page', 'Página Profundamente Anidada') }
        ]
      })

      expect(result.success).toBe(true)

      const enHtml = await readBuiltFile(result.outputs[0], 'docs/en/api/reference.html')
      expect(assertHtmlContains(enHtml, 'Deep Nested Page')).toBe(true)

      const esHtml = await readBuiltFile(result.outputs[1], 'docs/es/api/referencia.html')
      expect(assertHtmlContains(esHtml, 'Página Profundamente Anidada')).toBe(true)
    })

    test('should support locale prefixes', async () => {
      const content = `---
title: Prefixed Page
---

# Prefixed Page

Content with locale prefix.
      `

      const result = await buildTestSite({
        files: [
          { path: 'en-prefixed-page.md', content },
          { path: 'es-prefixed-page.md', content: content.replace('Prefixed Page', 'Página Prefijada') }
        ]
      })

      expect(result.success).toBe(true)

      const enHtml = await readBuiltFile(result.outputs[0], 'en-prefixed-page.html')
      expect(assertHtmlContains(enHtml, 'Prefixed Page')).toBe(true)

      const esHtml = await readBuiltFile(result.outputs[1], 'es-prefixed-page.html')
      expect(assertHtmlContains(esHtml, 'Página Prefijada')).toBe(true)
    })
  })

  describe('Translation Files (YAML)', () => {
    test('should load YAML translation files', async () => {
      const translations = createTestTranslations()
      const content = `---
title: Home
---

# Home Page

Welcome message.
      `

      const result = await buildTestSite({
        files: [...translations, { path: 'index.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'index.html')
      expect(assertHtmlContains(html, 'Home')).toBe(true)
      expect(assertHtmlContains(html, 'Welcome to our site')).toBe(true)
      expect(assertHtmlContains(html, 'Welcome message')).toBe(true)
    })

    test('should handle nested YAML translations', async () => {
      const translations = [
        {
          path: 'locales/en.yml',
          content: `
user:
  profile:
    settings:
      account: Account Settings
      privacy: Privacy Settings
      notifications: Notification Settings
          `
        },
        {
          path: 'locales/es.yml',
          content: `
user:
  profile:
    settings:
      account: Configuración de Cuenta
      privacy: Configuración de Privacidad
      notifications: Configuración de Notificaciones
          `
        }
      ]

      const content = `
# User Settings

Access your account settings here.
      `

      const result = await buildTestSite({
        files: [...translations, { path: 'settings.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'settings.html')
      expect(assertHtmlContains(html, 'Account Settings')).toBe(true)
      expect(assertHtmlContains(html, 'Privacy Settings')).toBe(true)
      expect(assertHtmlContains(html, 'nested-translations')).toBe(true)
    })

    test('should support YAML arrays', async () => {
      const translations = [
        {
          path: 'locales/en.yml',
          content: `
features:
  - Fast performance
  - Easy setup
  - Great documentation
colors:
  primary: Blue
  secondary: Green
          `
        }
      ]

      const content = `
# Features

Our product features.
      `

      const result = await buildTestSite({
        files: [...translations, { path: 'features.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'features.html')
      expect(assertHtmlContains(html, 'Fast performance')).toBe(true)
      expect(assertHtmlContains(html, 'Easy setup')).toBe(true)
      expect(assertHtmlContains(html, 'yaml-arrays')).toBe(true)
    })
  })

  describe('Translation Files (TypeScript)', () => {
    test('should load TypeScript translation files', async () => {
      const translations = [
        {
          path: 'locales/en/app.ts',
          content: `
import type { Dictionary } from '@stacksjs/ts-i18n'

export default {
  header: {
    title: 'My App',
    subtitle: 'Welcome to the application'
  },
  navigation: {
    home: 'Home',
    about: 'About',
    contact: 'Contact'
  }
} satisfies Dictionary
          `
        }
      ]

      const content = `
# App Header

Navigation and header content.
      `

      const result = await buildTestSite({
        files: [...translations, { path: 'header.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'header.html')
      expect(assertHtmlContains(html, 'My App')).toBe(true)
      expect(assertHtmlContains(html, 'Welcome to the application')).toBe(true)
      expect(assertHtmlContains(html, 'Home')).toBe(true)
      expect(assertHtmlContains(html, 'typescript-translations')).toBe(true)
    })

    test('should handle dynamic translations with parameters', async () => {
      const translations = [
        {
          path: 'locales/en/app.ts',
          content: `
import type { Dictionary } from '@stacksjs/ts-i18n'

export default {
  messages: {
    welcome: ({ name }: { name: string }) => \`Welcome, \${name}!\`,
    itemsCount: ({ count }: { count: number }) => \`You have \${count} items in your cart\`,
    greeting: ({ time, name }: { time: string, name: string }) => \`Good \${time}, \${name}!\`
  }
} satisfies Dictionary
          `
        }
      ]

      const content = `
# Dynamic Messages

Welcome messages with parameters.
      `

      const result = await buildTestSite({
        files: [...translations, { path: 'messages.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'messages.html')
      expect(assertHtmlContains(html, 'Welcome, John!')).toBe(true)
      expect(assertHtmlContains(html, 'You have 5 items in your cart')).toBe(true)
      expect(assertHtmlContains(html, 'Good morning, Alice!')).toBe(true)
      expect(assertHtmlContains(html, 'dynamic-translations')).toBe(true)
    })

    test('should support complex TypeScript translation structures', async () => {
      const translations = [
        {
          path: 'locales/en/complex.ts',
          content: `
import type { Dictionary } from '@stacksjs/ts-i18n'

export default {
  dashboard: {
    stats: {
      users: ({ count }: { count: number }) => \`\${count} active users\`,
      revenue: ({ amount, currency }: { amount: number, currency: string }) => \`Revenue: \${currency}\${amount}\`
    },
    charts: {
      monthly: 'Monthly View',
      weekly: 'Weekly View',
      daily: 'Daily View'
    }
  },
  errors: {
    network: 'Network error occurred',
    validation: ({ field }: { field: string }) => \`\${field} is required\`,
    generic: 'An error occurred'
  }
} satisfies Dictionary
          `
        }
      ]

      const content = `
# Complex Translations

Dashboard and error messages.
      `

      const result = await buildTestSite({
        files: [...translations, { path: 'complex.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'complex.html')
      expect(assertHtmlContains(html, '150 active users')).toBe(true)
      expect(assertHtmlContains(html, 'Revenue: $5000')).toBe(true)
      expect(assertHtmlContains(html, 'Email is required')).toBe(true)
      expect(assertHtmlContains(html, 'complex-typescript')).toBe(true)
    })
  })

  describe('Route Localization', () => {
    test('should handle localized routes', async () => {
      const content = `---
title: Getting Started
---

# Getting Started

Installation guide.
      `

      const result = await buildTestSite({
        files: [
          { path: 'en/getting-started.md', content },
          { path: 'es/empezando.md', content: content.replace('Getting Started', 'Empezando') }
        ]
      })

      expect(result.success).toBe(true)

      const enHtml = await readBuiltFile(result.outputs[0], 'en/getting-started.html')
      expect(assertHtmlContains(enHtml, 'Getting Started')).toBe(true)

      const esHtml = await readBuiltFile(result.outputs[1], 'es/empezando.html')
      expect(assertHtmlContains(esHtml, 'Empezando')).toBe(true)
    })

    test('should generate locale-specific sitemaps', async () => {
      const content = `---
title: Page
---

# Page Content

Content for sitemap.
      `

      const result = await buildTestSite({
        files: [
          { path: 'en/page1.md', content },
          { path: 'en/page2.md', content },
          { path: 'es/pagina1.md', content },
          { path: 'es/pagina2.md', content }
        ]
      })

      expect(result.success).toBe(true)

      // Check if sitemaps are generated
      const enSitemapExists = result.outputs.some(out => out.includes('en-sitemap.xml'))
      const esSitemapExists = result.outputs.some(out => out.includes('es-sitemap.xml'))

      expect(enSitemapExists).toBe(true)
      expect(esSitemapExists).toBe(true)
    })

    test('should handle locale-specific frontmatter', async () => {
      const content = `---
title: Custom Title
description: Custom description for this locale
---

# Localized Frontmatter

Content with localized frontmatter.
      `

      const result = await buildTestSite({
        files: [
          { path: 'en/custom.md', content },
          {
            path: 'es/custom.md',
            content: content
              .replace('Custom Title', 'Título Personalizado')
              .replace('Custom description', 'Descripción personalizada')
          }
        ]
      })

      expect(result.success).toBe(true)

      const enHtml = await readBuiltFile(result.outputs[0], 'en/custom.html')
      expect(assertHtmlContains(enHtml, 'Custom Title')).toBe(true)
      expect(assertHtmlContains(enHtml, 'Custom description')).toBe(true)

      const esHtml = await readBuiltFile(result.outputs[1], 'es/custom.html')
      expect(assertHtmlContains(esHtml, 'Título Personalizado')).toBe(true)
      expect(assertHtmlContains(esHtml, 'Descripción personalizada')).toBe(true)
    })
  })

  describe('Language Switcher', () => {
    test('should render language switcher component', async () => {
      const content = `
# Language Switcher Test

Content with language switching.
      `

      const result = await buildTestSite({
        files: [
          { path: 'en/page.md', content },
          { path: 'es/pagina.md', content: content.replace('Language Switcher Test', 'Prueba de Cambio de Idioma') }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'en/page.html')
      expect(assertHtmlContains(html, 'language-switcher')).toBe(true)
      expect(assertHtmlContains(html, 'lang-select')).toBe(true)
      expect(assertHtmlContains(html, 'English')).toBe(true)
      expect(assertHtmlContains(html, 'Español')).toBe(true)
    })

    test('should handle language switcher navigation', async () => {
      const content = `
# Navigation Test

Content for navigation testing.
      `

      const result = await buildTestSite({
        files: [
          { path: 'en/nav.md', content },
          { path: 'fr/nav.md', content: content.replace('Navigation Test', 'Test de Navigation') }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'en/nav.html')
      expect(assertHtmlContains(html, 'locale-links')).toBe(true)
      expect(assertHtmlContains(html, 'href="/fr/nav"')).toBe(true)
      expect(assertHtmlContains(html, 'switch-locale')).toBe(true)
    })

    test('should preserve page context when switching languages', async () => {
      const content = `
# Context Preservation

Content that should maintain context.
      `

      const result = await buildTestSite({
        files: [
          { path: 'en/section/page.md', content },
          { path: 'es/seccion/pagina.md', content: content.replace('Context Preservation', 'Preservación de Contexto') }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'en/section/page.html')
      expect(assertHtmlContains(html, 'preserve-context')).toBe(true)
      expect(assertHtmlContains(html, 'href="/es/seccion/pagina"')).toBe(true)
    })
  })

  describe('Translation Integration', () => {
    test('should integrate with ts-i18n createTranslator', async () => {
      const translations = [
        {
          path: 'locales/en.yml',
          content: `
buttons:
  save: Save
  cancel: Cancel
  submit: Submit
          `
        },
        {
          path: 'locales/en/app.ts',
          content: `
import type { Dictionary } from '@stacksjs/ts-i18n'

export default {
  forms: {
    required: ({ field }: { field: string }) => \`\${field} is required\`,
    email: 'Please enter a valid email',
    minLength: ({ field, min }: { field: string, min: number }) => \`\${field} must be at least \${min} characters\`
  }
} satisfies Dictionary
          `
        }
      ]

      const content = `
# Form Validation

Form with validation messages.
      `

      const result = await buildTestSite({
        files: [...translations, { path: 'form.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'form.html')
      expect(assertHtmlContains(html, 'Save')).toBe(true)
      expect(assertHtmlContains(html, 'Name is required')).toBe(true)
      expect(assertHtmlContains(html, 'Email must be at least 5 characters')).toBe(true)
      expect(assertHtmlContains(html, 'ts-i18n-integration')).toBe(true)
    })

    test('should handle ts-i18n fallback mechanism', async () => {
      const translations = [
        {
          path: 'locales/en.yml',
          content: `
common:
  loading: Loading...
  error: An error occurred
          `
        },
        {
          path: 'locales/es.yml',
          content: `
common:
  loading: Cargando...
  # Missing error translation - should fallback
          `
        }
      ]

      const content = `
# Fallback Test

Content with fallback translations.
      `

      const result = await buildTestSite({
        files: [...translations, { path: 'fallback.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'fallback.html')
      expect(assertHtmlContains(html, 'Cargando...')).toBe(true)
      expect(assertHtmlContains(html, 'An error occurred')).toBe(true) // Fallback to English
      expect(assertHtmlContains(html, 'fallback-mechanism')).toBe(true)
    })

    test('should support ts-i18n type generation', async () => {
      const translations = [
        {
          path: 'locales/en/app.ts',
          content: `
import type { Dictionary } from '@stacksjs/ts-i18n'

export default {
  user: {
    name: 'Name',
    email: 'Email',
    profile: 'Profile'
  },
  actions: {
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save'
  }
} satisfies Dictionary
          `
        }
      ]

      const content = `
# Type Generation Test

Content with type-safe translations.
      `

      const result = await buildTestSite({
        files: [...translations, { path: 'types.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'types.html')
      expect(assertHtmlContains(html, 'Name')).toBe(true)
      expect(assertHtmlContains(html, 'Edit')).toBe(true)
      expect(assertHtmlContains(html, 'type-generation')).toBe(true)
      expect(assertHtmlContains(html, 'type-safe-translations')).toBe(true)
    })
  })

  describe('Build Integration', () => {
    test('should generate per-locale JSON outputs', async () => {
      const translations = createTestTranslations()

      const result = await buildTestSite({
        files: translations
      })

      expect(result.success).toBe(true)

      // Check if JSON outputs are generated
      const enJsonExists = result.outputs.some(out => out.includes('en.json'))
      const esJsonExists = result.outputs.some(out => out.includes('es.json'))

      expect(enJsonExists).toBe(true)
      expect(esJsonExists).toBe(true)
    })

    test('should build locale-specific pages', async () => {
      const content = `
# Locale-Specific Build

Content built for specific locale.
      `

      const result = await buildTestSite({
        files: [
          { path: 'en/specific.md', content },
          { path: 'fr/specifique.md', content: content.replace('Locale-Specific Build', 'Construction Spécifique à la Locale') }
        ]
      })

      expect(result.success).toBe(true)

      const enHtml = await readBuiltFile(result.outputs[0], 'en/specific.html')
      expect(assertHtmlContains(enHtml, 'Locale-Specific Build')).toBe(true)

      const frHtml = await readBuiltFile(result.outputs[1], 'fr/specifique.html')
      expect(assertHtmlContains(frHtml, 'Construction Spécifique à la Locale')).toBe(true)
    })

    test('should handle missing translations gracefully', async () => {
      const translations = [
        {
          path: 'locales/en.yml',
          content: `
existing:
  key: Existing translation
          `
        }
      ]

      const content = `
# Missing Translation Test

Content with missing translation handling.
      `

      const result = await buildTestSite({
        files: [...translations, { path: 'missing.md', content }]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'missing.html')
      expect(assertHtmlContains(html, 'missing-translation')).toBe(true)
      expect(assertHtmlContains(html, 'fallback-key')).toBe(true)
    })
  })
})
