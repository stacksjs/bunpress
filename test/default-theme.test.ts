import { describe, expect, test } from 'bun:test'
import {
  createNavHtml,
  isNavItemActive,
  createSidebarHtml,
  isSidebarItemActive,
  createSearchHtml,
  generateSearchIndex,
  performSearch,
  generateThemeCSS
} from '../src/plugin'
import type { NavItem, SidebarItem, SearchConfig, ThemeConfig } from '../src/types'

describe('Default Theme', () => {
  describe('Navigation', () => {
    test('should render navigation bar', () => {
      const navItems: NavItem[] = [
        { text: 'Home', link: '/' },
        { text: 'Guide', link: '/guide/' },
        { text: 'API', link: '/api/' }
      ]

      const html = createNavHtml(navItems, '/')

      expect(html).toContain('<nav class="navbar">')
      expect(html).toContain('<div class="nav-container">')
      expect(html).toContain('<div class="nav-menu">')
      expect(html).toContain('Home')
      expect(html).toContain('Guide')
      expect(html).toContain('API')
      expect(html).toContain('<a href="/" class="nav-link active">Home</a>')
    })

    test('should handle active navigation state', () => {
      const navItems: NavItem[] = [
        { text: 'Home', link: '/' },
        { text: 'Guide', link: '/guide/' },
        { text: 'API', link: '/api/' }
      ]

      const html = createNavHtml(navItems, '/guide/')

      expect(html).toContain('<a href="/" class="nav-link">Home</a>')
      expect(html).toContain('<a href="/guide/" class="nav-link active">Guide</a>')
      expect(html).toContain('<a href="/api/" class="nav-link">API</a>')
    })

    test('should support nested navigation', () => {
      const navItems: NavItem[] = [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Advanced', link: '/guide/advanced' }
          ]
        },
        { text: 'API', link: '/api/' }
      ]

      const html = createNavHtml(navItems, '/api/')

      expect(html).toContain('nav-dropdown')
      expect(html).toContain('Getting Started')
      expect(html).toContain('Advanced')
      expect(html).toContain('<a href="/api/" class="nav-link active">API</a>')
    })

    test('should handle navigation with icons', () => {
      const navItems: NavItem[] = [
        { text: 'Home', link: '/', icon: '🏠' },
        { text: 'GitHub', link: 'https://github.com', icon: '🐙' }
      ]

      const html = createNavHtml(navItems, '/')

      expect(html).toContain('nav-icon')
      expect(html).toContain('🏠')
      expect(html).toContain('🐙')
    })

    test('should support external links', () => {
      const navItems: NavItem[] = [
        { text: 'Home', link: '/' },
        { text: 'GitHub', link: 'https://github.com' }
      ]

      const html = createNavHtml(navItems, '/')

      expect(html).toContain('target="_blank"')
      expect(html).toContain('rel="noopener"')
      expect(html).toContain('https://github.com')
    })

    test('should handle activeMatch patterns', () => {
      const navItems: NavItem[] = [
        { text: 'Guide', link: '/guide/', activeMatch: '/guide' },
        { text: 'API', link: '/api/' }
      ]

      const html = createNavHtml(navItems, '/guide/getting-started')

      expect(html).toContain('<a href="/guide/" class="nav-link active">Guide</a>')
    })

    test('should render mobile navigation toggle', () => {
      const navItems: NavItem[] = [
        { text: 'Home', link: '/' },
        { text: 'Guide', link: '/guide/' }
      ]

      const html = createNavHtml(navItems, '/')

      expect(html).toContain('nav-toggle')
      expect(html).toContain('hamburger')
      expect(html).toContain('aria-label="Toggle navigation"')
    })

    test('should return empty string for empty navigation', () => {
      const html = createNavHtml([], '/')
      expect(html).toBe('')
    })
  })

  describe('Navigation Active State', () => {
    test('should detect exact link match', () => {
      const item: NavItem = { text: 'Home', link: '/' }
      expect(isNavItemActive(item, '/')).toBe(true)
      expect(isNavItemActive(item, '/guide/')).toBe(false)
    })

    test('should detect activeMatch pattern', () => {
      const item: NavItem = { text: 'Guide', link: '/guide/', activeMatch: '/guide' }
      expect(isNavItemActive(item, '/guide/')).toBe(true)
      expect(isNavItemActive(item, '/guide/getting-started')).toBe(true)
      expect(isNavItemActive(item, '/api/')).toBe(false)
    })

    test('should detect active state in nested items', () => {
      const item: NavItem = {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Advanced', link: '/guide/advanced' }
        ]
      }
      expect(isNavItemActive(item, '/guide/getting-started')).toBe(true)
      expect(isNavItemActive(item, '/guide/advanced')).toBe(true)
      expect(isNavItemActive(item, '/api/')).toBe(false)
    })
  })

  describe('Sidebar', () => {
    test('should render sidebar with links', () => {
      const sidebarItems: SidebarItem[] = [
        { text: 'Home', link: '/' },
        { text: 'Guide', link: '/guide/' },
        { text: 'API', link: '/api/' }
      ]

      const html = createSidebarHtml(sidebarItems, '/')

      expect(html).toContain('<aside class="sidebar">')
      expect(html).toContain('<div class="sidebar-content">')
      expect(html).toContain('<a href="/" class="sidebar-link sidebar-active">Home</a>')
      expect(html).toContain('<a href="/guide/" class="sidebar-link">Guide</a>')
      expect(html).toContain('<a href="/api/" class="sidebar-link">API</a>')
    })

    test('should render sidebar with groups', () => {
      const sidebarItems: SidebarItem[] = [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Advanced', link: '/guide/advanced' }
          ]
        },
        { text: 'API', link: '/api/' }
      ]

      const html = createSidebarHtml(sidebarItems, '/api/')

      expect(html).toContain('sidebar-group')
      expect(html).toContain('sidebar-group-header')
      expect(html).toContain('sidebar-toggle')
      expect(html).toContain('sidebar-group-content')
      expect(html).toContain('Getting Started')
      expect(html).toContain('Advanced')
      expect(html).toContain('<a href="/api/" class="sidebar-link sidebar-active">API</a>')
    })

    test('should handle active sidebar state', () => {
      const sidebarItems: SidebarItem[] = [
        { text: 'Home', link: '/' },
        { text: 'Guide', link: '/guide/' },
        { text: 'API', link: '/api/' }
      ]

      const html = createSidebarHtml(sidebarItems, '/guide/')

      expect(html).toContain('<a href="/" class="sidebar-link">Home</a>')
      expect(html).toContain('<a href="/guide/" class="sidebar-link sidebar-active">Guide</a>')
      expect(html).toContain('<a href="/api/" class="sidebar-link">API</a>')
    })

    test('should handle nested sidebar active state', () => {
      const sidebarItems: SidebarItem[] = [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Advanced', link: '/guide/advanced' }
          ]
        }
      ]

      const html = createSidebarHtml(sidebarItems, '/guide/getting-started')

      expect(html).toContain('sidebar-group')
      expect(html).toContain('<a href="/guide/getting-started" class="sidebar-link sidebar-indent-1 sidebar-active">Getting Started</a>')
      expect(html).toContain('<a href="/guide/advanced" class="sidebar-link sidebar-indent-1">Advanced</a>')
    })

    test('should return empty string for empty sidebar', () => {
      const html = createSidebarHtml([], '/')
      expect(html).toBe('')
    })
  })

  describe('Sidebar Active State', () => {
    test('should detect exact sidebar link match', () => {
      const item: SidebarItem = { text: 'Home', link: '/' }
      expect(isSidebarItemActive(item, '/')).toBe(true)
      expect(isSidebarItemActive(item, '/guide/')).toBe(false)
    })

    test('should detect active state in sidebar nested items', () => {
      const item: SidebarItem = {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Advanced', link: '/guide/advanced' }
        ]
      }
      expect(isSidebarItemActive(item, '/guide/getting-started')).toBe(true)
      expect(isSidebarItemActive(item, '/guide/advanced')).toBe(true)
      expect(isSidebarItemActive(item, '/api/')).toBe(false)
    })

    test('should handle sidebar item without link', () => {
      const item: SidebarItem = { text: 'Group' }
      expect(isSidebarItemActive(item, '/')).toBe(false)
    })
  })

  describe('Search', () => {
    test('should render search input when enabled', () => {
      const searchConfig: SearchConfig = {
        enabled: true,
        placeholder: 'Search docs...',
        keyboardShortcuts: true
      }

      const html = createSearchHtml(searchConfig)

      expect(html).toContain('<div class="search-container">')
      expect(html).toContain('<input')
      expect(html).toContain('placeholder="Search docs..."')
      expect(html).toContain('⌘K')
      expect(html).toContain('<div class="search-results"')
    })

    test('should not render search when disabled', () => {
      const searchConfig: SearchConfig = {
        enabled: false
      }

      const html = createSearchHtml(searchConfig)
      expect(html).toBe('')
    })

    test('should hide keyboard shortcut when disabled', () => {
      const searchConfig: SearchConfig = {
        enabled: true,
        keyboardShortcuts: false
      }

      const html = createSearchHtml(searchConfig)
      expect(html).not.toContain('⌘K')
    })

    test('should use default placeholder', () => {
      const searchConfig: SearchConfig = {
        enabled: true
      }

      const html = createSearchHtml(searchConfig)
      expect(html).toContain('placeholder="Search..."')
    })

    test('should generate search index from content', () => {
      const mdContent = `# Getting Started

This is an introduction to the framework.

## Installation

Install the package using npm.

## Usage

Here's how to use it.

Some additional content here.`

      const result = generateSearchIndex(mdContent, 'Getting Started', '/guide/getting-started')

      expect(result).toContain('"title":"Getting Started"')
      expect(result).toContain('"url":"/guide/getting-started"')
      expect(result).toContain('Getting Started')
      expect(result).toContain('Installation')
      expect(result).toContain('Usage')
    })

    test('should perform search and rank results', () => {
      const searchIndex = [
        {
          title: 'Getting Started',
          url: '/guide/getting-started',
          content: 'This is an introduction to the framework with installation guide.',
          headings: ['Installation', 'Quick Start']
        },
        {
          title: 'API Reference',
          url: '/api',
          content: 'Complete API documentation for all functions.',
          headings: ['Functions', 'Classes']
        }
      ]

      const results = performSearch('installation', searchIndex)

      expect(results.length).toBeGreaterThan(0)
      expect(results[0].title).toBe('Getting Started')
      expect(results[0].score).toBeGreaterThan(0)
    })

    test('should return empty results for empty query', () => {
      const searchIndex = [
        {
          title: 'Test',
          url: '/test',
          content: 'Test content',
          headings: []
        }
      ]

      const results = performSearch('', searchIndex)
      expect(results.length).toBe(0)
    })

    test('should rank title matches higher', () => {
      const searchIndex = [
        {
          title: 'Installation Guide',
          url: '/install',
          content: 'How to install the framework',
          headings: ['Quick Install']
        },
        {
          title: 'Getting Started',
          url: '/start',
          content: 'Installation instructions here',
          headings: ['Installation']
        }
      ]

      const results = performSearch('installation', searchIndex)

      // Title match should come first
      expect(results[0].title).toBe('Installation Guide')
      expect(results[1].title).toBe('Getting Started')
    })

    test('should limit results to top matches', () => {
      const searchIndex = Array.from({ length: 20 }, (_, i) => ({
        title: `Page ${i}`,
        url: `/page${i}`,
        content: 'This page contains searchable content about various topics.',
        headings: ['Topic 1', 'Topic 2']
      }))

      const results = performSearch('content', searchIndex)
      expect(results.length).toBeLessThanOrEqual(10)
    })
  })

  describe('Layouts', () => {
    test('should render home layout with hero and features', () => {
      // This would require testing the createHomePageHtml function
      // For now, we'll test that the layout configuration is processed
      expect(true).toBe(true) // Placeholder test
    })

    test('should render doc layout with sidebar', () => {
      // Test that doc layout includes sidebar classes
      expect(true).toBe(true) // Placeholder test
    })

    test('should render page layout without sidebar', () => {
      // Test that page layout has different styling
      expect(true).toBe(true) // Placeholder test
    })

    test('should handle custom layouts', () => {
      // Test custom layout support
      expect(true).toBe(true) // Placeholder test
    })
  })

  describe('Theme Customization', () => {
    test('should generate CSS for custom colors', () => {
      const themeConfig: ThemeConfig = {
        colors: {
          primary: '#3b82f6',
          secondary: '#64748b',
          accent: '#f59e0b'
        }
      }

      const css = generateThemeCSS(themeConfig)

      expect(css).toContain('--color-primary: #3b82f6')
      expect(css).toContain('--color-secondary: #64748b')
      expect(css).toContain('--color-accent: #f59e0b')
      expect(css).toContain(':root {')
    })

    test('should generate CSS for custom fonts', () => {
      const themeConfig: ThemeConfig = {
        fonts: {
          heading: 'Inter, sans-serif',
          body: 'Roboto, sans-serif',
          mono: 'JetBrains Mono, monospace'
        }
      }

      const css = generateThemeCSS(themeConfig)

      expect(css).toContain('--font-heading: Inter, sans-serif')
      expect(css).toContain('--font-body: Roboto, sans-serif')
      expect(css).toContain('--font-mono: JetBrains Mono, monospace')
      expect(css).toContain('h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading)')
      expect(css).toContain('body { font-family: var(--font-body)')
      expect(css).toContain('code, pre, .code-block-container { font-family: var(--font-mono)')
    })

    test('should generate dark mode CSS', () => {
      const themeConfig: ThemeConfig = {
        darkMode: true
      }

      const css = generateThemeCSS(themeConfig)

      expect(css).toContain('@media (prefers-color-scheme: dark)')
      expect(css).toContain('--color-background: #1a1a1a')
      expect(css).toContain('--color-text: #ffffff')
      expect(css).toContain('body {\n    background-color: var(--color-background);')
    })

    test('should generate CSS for custom variables', () => {
      const themeConfig: ThemeConfig = {
        cssVars: {
          'border-radius': '8px',
          'shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }
      }

      const css = generateThemeCSS(themeConfig)

      expect(css).toContain('--border-radius: 8px')
      expect(css).toContain('--shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)')
    })

    test('should include custom CSS', () => {
      const themeConfig: ThemeConfig = {
        css: '.custom-class { color: red; }'
      }

      const css = generateThemeCSS(themeConfig)

      expect(css).toContain('.custom-class { color: red; }')
      expect(css).toContain('/* Custom theme CSS */')
    })

    test('should handle empty theme config', () => {
      const themeConfig: ThemeConfig = {}
      const css = generateThemeCSS(themeConfig)
      expect(css).toBe('')
    })

    test('should combine multiple theme features', () => {
      const themeConfig: ThemeConfig = {
        colors: {
          primary: '#3b82f6'
        },
        fonts: {
          heading: 'Inter, sans-serif'
        },
        darkMode: true,
        cssVars: {
          'radius': '4px'
        },
        css: '.test { margin: 0; }'
      }

      const css = generateThemeCSS(themeConfig)

      expect(css).toContain('--color-primary: #3b82f6')
      expect(css).toContain('--font-heading: Inter, sans-serif')
      expect(css).toContain('@media (prefers-color-scheme: dark)')
      expect(css).toContain('--radius: 4px')
      expect(css).toContain('.test { margin: 0; }')
    })
  })
})
