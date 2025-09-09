---
title: Theme Example
description: Complete theme implementations showcasing different visual styles and branding for BunPress
author: BunPress Team
layout: doc
toc: sidebar
sidebar:
  - text: Overview
    link: /theme-example#overview
  - text: Light Theme
    link: /theme-example#light-theme
  - text: Dark Theme
    link: /theme-example#dark-theme
  - text: Corporate Theme
    link: /theme-example#corporate-theme
  - text: Developer Theme
    link: /theme-example#developer-theme
  - text: Minimal Theme
    link: /theme-example#minimal-theme
  - text: Custom Branding
    link: /theme-example#custom-branding
---

# Theme Example

This example demonstrates complete theme implementations for BunPress, showcasing different visual styles, color schemes, and branding approaches.

## Overview

BunPress themes consist of:

- **Color palettes** - Primary, secondary, and accent colors
- **Typography** - Font choices and text styling
- **Component styles** - Buttons, cards, navigation
- **Layout options** - Spacing, sizing, responsive behavior
- **Dark mode support** - Light/dark theme variants

## Light Theme

### Clean & Modern

```typescript
// Light theme configuration
export const lightTheme = {
  name: 'Light',
  colors: {
    // Background colors
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      accent: '#e0f2fe',
    },

    // Surface colors
    surface: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      elevated: '#ffffff',
    },

    // Text colors
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#64748b',
      inverse: '#ffffff',
    },

    // Border colors
    border: {
      primary: '#e2e8f0',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
    },

    // Brand colors
    brand: {
      primary: '#3b82f6',
      secondary: '#06b6d4',
      accent: '#8b5cf6',
    },

    // Semantic colors
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },

    // Interactive states
    interactive: {
      hover: '#f1f5f9',
      active: '#e2e8f0',
      focus: '#dbeafe',
      disabled: '#94a3b8',
    }
  },

  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
    },

    fontSize: {
      'xs': '0.75rem',
      'sm': '0.875rem',
      'base': '1rem',
      'lg': '1.125rem',
      'xl': '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },

    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },

    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.625',
    }
  },

  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
  },

  borderRadius: {
    'none': '0',
    'sm': '0.125rem',
    'md': '0.375rem',
    'lg': '0.5rem',
    'xl': '0.75rem',
    '2xl': '1rem',
    'full': '9999px',
  },

  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  }
}
```

### Soft & Warm

```typescript
// Warm light theme
export const warmLightTheme = {
  name: 'Warm Light',
  colors: {
    background: {
      primary: '#fefcfb',
      secondary: '#fef7ed',
      tertiary: '#fff7ed',
      accent: '#fef3c7',
    },

    surface: {
      primary: '#ffffff',
      secondary: '#fef7ed',
      tertiary: '#fff7ed',
      elevated: '#ffffff',
    },

    text: {
      primary: '#9a3412',
      secondary: '#c2410c',
      tertiary: '#ea580c',
      inverse: '#ffffff',
    },

    brand: {
      primary: '#ea580c',
      secondary: '#dc2626',
      accent: '#d97706',
    },

    semantic: {
      success: '#15803d',
      warning: '#d97706',
      error: '#dc2626',
      info: '#ea580c',
    }
  }
}
```

## Dark Theme

### Modern Dark

```typescript
// Modern dark theme
export const darkTheme = {
  name: 'Dark',
  colors: {
    // Background colors
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
      accent: '#1e1b4b',
    },

    // Surface colors
    surface: {
      primary: '#1e293b',
      secondary: '#334155',
      tertiary: '#475569',
      elevated: '#0f172a',
    },

    // Text colors
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
      inverse: '#0f172a',
    },

    // Border colors
    border: {
      primary: '#334155',
      secondary: '#475569',
      tertiary: '#64748b',
    },

    // Brand colors
    brand: {
      primary: '#60a5fa',
      secondary: '#34d399',
      accent: '#a78bfa',
    },

    // Semantic colors
    semantic: {
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
    },

    // Interactive states
    interactive: {
      hover: '#334155',
      active: '#475569',
      focus: '#1e1b4b',
      disabled: '#64748b',
    }
  },

  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
    },

    fontSize: {
      'xs': '0.75rem',
      'sm': '0.875rem',
      'base': '1rem',
      'lg': '1.125rem',
      'xl': '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },

    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },

    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.625',
    }
  },

  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
  }
}
```

### High Contrast Dark

```typescript
// High contrast dark theme
export const highContrastDarkTheme = {
  name: 'High Contrast Dark',
  colors: {
    background: {
      primary: '#000000',
      secondary: '#1a1a1a',
      tertiary: '#2a2a2a',
      accent: '#003366',
    },

    surface: {
      primary: '#1a1a1a',
      secondary: '#2a2a2a',
      tertiary: '#3a3a3a',
      elevated: '#000000',
    },

    text: {
      primary: '#ffffff',
      secondary: '#cccccc',
      tertiary: '#aaaaaa',
      inverse: '#000000',
    },

    border: {
      primary: '#555555',
      secondary: '#666666',
      tertiary: '#777777',
    },

    brand: {
      primary: '#00aaff',
      secondary: '#00ff88',
      accent: '#ffaa00',
    },

    semantic: {
      success: '#00ff88',
      warning: '#ffaa00',
      error: '#ff4444',
      info: '#00aaff',
    }
  }
}
```

## Corporate Theme

### Professional Blue

```typescript
// Corporate blue theme
export const corporateBlueTheme = {
  name: 'Corporate Blue',
  colors: {
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      accent: '#eff6ff',
    },

    surface: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      elevated: '#ffffff',
    },

    text: {
      primary: '#1e293b',
      secondary: '#475569',
      tertiary: '#64748b',
      inverse: '#ffffff',
    },

    border: {
      primary: '#cbd5e1',
      secondary: '#94a3b8',
      tertiary: '#64748b',
    },

    brand: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#60a5fa',
    },

    semantic: {
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#2563eb',
    }
  },

  typography: {
    fontFamily: {
      sans: ['system-ui', '-apple-system', 'sans-serif'],
      mono: ['SF Mono', 'Monaco', 'Consolas', 'monospace'],
    }
  }
}
```

### Enterprise Gray

```typescript
// Enterprise gray theme
export const enterpriseGrayTheme = {
  name: 'Enterprise Gray',
  colors: {
    background: {
      primary: '#ffffff',
      secondary: '#fafafa',
      tertiary: '#f5f5f5',
      accent: '#f0f0f0',
    },

    surface: {
      primary: '#ffffff',
      secondary: '#fafafa',
      tertiary: '#f5f5f5',
      elevated: '#ffffff',
    },

    text: {
      primary: '#1a1a1a',
      secondary: '#4a4a4a',
      tertiary: '#6a6a6a',
      inverse: '#ffffff',
    },

    border: {
      primary: '#e0e0e0',
      secondary: '#cccccc',
      tertiary: '#aaaaaa',
    },

    brand: {
      primary: '#4a4a4a',
      secondary: '#6a6a6a',
      accent: '#8a8a8a',
    },

    semantic: {
      success: '#2e7d32',
      warning: '#f57c00',
      error: '#d32f2f',
      info: '#1976d2',
    }
  }
}
```

## Developer Theme

### Code-Focused

```typescript
// Developer theme optimized for code
export const developerTheme = {
  name: 'Developer',
  colors: {
    background: {
      primary: '#0f0f23',
      secondary: '#1a1a2e',
      tertiary: '#16213e',
      accent: '#0f3460',
    },

    surface: {
      primary: '#1a1a2e',
      secondary: '#16213e',
      tertiary: '#0f3460',
      elevated: '#0f0f23',
    },

    text: {
      primary: '#e94560',
      secondary: '#f39c12',
      tertiary: '#f1c40f',
      inverse: '#0f0f23',
    },

    border: {
      primary: '#16213e',
      secondary: '#0f3460',
      tertiary: '#533483',
    },

    brand: {
      primary: '#e94560',
      secondary: '#f39c12',
      accent: '#f1c40f',
    },

    semantic: {
      success: '#2ecc71',
      warning: '#f39c12',
      error: '#e74c3c',
      info: '#3498db',
    }
  },

  typography: {
    fontFamily: {
      sans: ['Fira Sans', 'system-ui', 'sans-serif'],
      mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
    },

    fontSize: {
      'xs': '0.75rem',
      'sm': '0.875rem',
      'base': '1rem',
      'lg': '1.125rem',
      'xl': '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    }
  },

  code: {
    background: '#1a1a2e',
    text: '#f1c40f',
    comment: '#7f8c8d',
    keyword: '#e94560',
    string: '#2ecc71',
    number: '#f39c12',
    function: '#3498db',
    variable: '#9b59b6',
  }
}
```

### Terminal-Inspired

```typescript
// Terminal-inspired theme
export const terminalTheme = {
  name: 'Terminal',
  colors: {
    background: {
      primary: '#000000',
      secondary: '#0d0d0d',
      tertiary: '#1a1a1a',
      accent: '#003300',
    },

    surface: {
      primary: '#0d0d0d',
      secondary: '#1a1a1a',
      tertiary: '#262626',
      elevated: '#000000',
    },

    text: {
      primary: '#00ff00',
      secondary: '#00cc00',
      tertiary: '#009900',
      inverse: '#000000',
    },

    border: {
      primary: '#333333',
      secondary: '#555555',
      tertiary: '#777777',
    },

    brand: {
      primary: '#00ff00',
      secondary: '#00cc00',
      accent: '#009900',
    }
  },

  typography: {
    fontFamily: {
      sans: ['Courier New', 'monospace'],
      mono: ['Courier New', 'Terminal', 'monospace'],
    }
  }
}
```

## Minimal Theme

### Clean Minimal

```typescript
// Clean minimal theme
export const minimalTheme = {
  name: 'Minimal',
  colors: {
    background: {
      primary: '#ffffff',
      secondary: '#ffffff',
      tertiary: '#ffffff',
      accent: '#f8f9fa',
    },

    surface: {
      primary: '#ffffff',
      secondary: '#ffffff',
      tertiary: '#ffffff',
      elevated: '#ffffff',
    },

    text: {
      primary: '#000000',
      secondary: '#666666',
      tertiary: '#999999',
      inverse: '#ffffff',
    },

    border: {
      primary: '#eeeeee',
      secondary: '#dddddd',
      tertiary: '#cccccc',
    },

    brand: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#999999',
    }
  },

  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
  },

  borderRadius: {
    none: '0',
    sm: '2px',
    md: '4px',
    lg: '6px',
  }
}
```

### Paper Theme

```typescript
// Paper-like theme
export const paperTheme = {
  name: 'Paper',
  colors: {
    background: {
      primary: '#fafaf9',
      secondary: '#f5f5f4',
      tertiary: '#f0f0ef',
      accent: '#fefefe',
    },

    surface: {
      primary: '#ffffff',
      secondary: '#fefefe',
      tertiary: '#fafaf9',
      elevated: '#ffffff',
    },

    text: {
      primary: '#1c1917',
      secondary: '#57534e',
      tertiary: '#78716c',
      inverse: '#fafaf9',
    },

    border: {
      primary: '#e7e5e4',
      secondary: '#d6d3d1',
      tertiary: '#a8a29e',
    },

    brand: {
      primary: '#57534e',
      secondary: '#78716c',
      accent: '#a8a29e',
    }
  },

  typography: {
    fontFamily: {
      sans: ['Crimson Text', 'Georgia', 'serif'],
      mono: ['Courier Prime', 'Courier New', 'monospace'],
    }
  }
}
```

## Custom Branding

### Brand Implementation

```typescript
// Custom brand theme implementation
export function createBrandTheme(brandConfig: BrandConfig) {
  return {
    name: brandConfig.name,
    colors: {
      background: {
        primary: brandConfig.background || '#ffffff',
        secondary: brandConfig.surface || '#f8fafc',
        tertiary: brandConfig.surfaceSecondary || '#f1f5f9',
        accent: brandConfig.accent || '#eff6ff',
      },

      surface: {
        primary: brandConfig.surface || '#ffffff',
        secondary: brandConfig.surfaceSecondary || '#f8fafc',
        tertiary: brandConfig.surfaceTertiary || '#f1f5f9',
        elevated: brandConfig.surface || '#ffffff',
      },

      text: {
        primary: brandConfig.textPrimary || '#0f172a',
        secondary: brandConfig.textSecondary || '#475569',
        tertiary: brandConfig.textTertiary || '#64748b',
        inverse: brandConfig.background || '#ffffff',
      },

      brand: {
        primary: brandConfig.primaryColor,
        secondary: brandConfig.secondaryColor,
        accent: brandConfig.accentColor,
      }
    },

    typography: {
      fontFamily: {
        sans: brandConfig.fontFamily || ['Inter', 'system-ui', 'sans-serif'],
        mono: brandConfig.monoFontFamily || ['JetBrains Mono', 'monospace'],
      }
    },

    logo: brandConfig.logo,
    favicon: brandConfig.favicon,
  }
}

// Usage example
const myBrandTheme = createBrandTheme({
  name: 'MyBrand',
  primaryColor: '#7c3aed',
  secondaryColor: '#06b6d4',
  accentColor: '#f59e0b',
  background: '#ffffff',
  surface: '#f8fafc',
  textPrimary: '#1e293b',
  textSecondary: '#475569',
  fontFamily: ['Poppins', 'system-ui', 'sans-serif'],
  logo: '/images/mybrand-logo.svg',
  favicon: '/images/mybrand-favicon.ico',
})
```

### Theme Application

```typescript
// Theme application utility
export class ThemeManager {
  private currentTheme: Theme
  private themes: Map<string, Theme> = new Map()

  constructor() {
    this.registerTheme('light', lightTheme)
    this.registerTheme('dark', darkTheme)
    this.registerTheme('corporate', corporateBlueTheme)
    this.registerTheme('developer', developerTheme)
    this.registerTheme('minimal', minimalTheme)
  }

  registerTheme(name: string, theme: Theme) {
    this.themes.set(name, theme)
  }

  setTheme(name: string) {
    const theme = this.themes.get(name)
    if (!theme) {
      throw new Error(`Theme "${name}" not found`)
    }

    this.currentTheme = theme
    this.applyTheme(theme)
  }

  private applyTheme(theme: Theme) {
    const root = document.documentElement

    // Apply CSS custom properties
    Object.entries(theme.colors).forEach(([category, colors]) => {
      Object.entries(colors).forEach(([variant, value]) => {
        root.style.setProperty(`--color-${category}-${variant}`, value)
      })
    })

    // Apply typography
    if (theme.typography) {
      root.style.setProperty('--font-sans', theme.typography.fontFamily.sans.join(', '))
      root.style.setProperty('--font-mono', theme.typography.fontFamily.mono.join(', '))
    }

    // Store theme preference
    localStorage.setItem('bunpress-theme', theme.name)

    // Update document attributes
    document.documentElement.setAttribute('data-theme', theme.name.toLowerCase())
  }

  getCurrentTheme() {
    return this.currentTheme
  }

  getAvailableThemes() {
    return Array.from(this.themes.keys())
  }
}

// Global theme manager instance
export const themeManager = new ThemeManager()
```

### Theme Persistence

```typescript
// Theme persistence and initialization
export function initializeTheme() {
  // Load saved theme or use system preference
  const savedTheme = localStorage.getItem('bunpress-theme')
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  let themeName = savedTheme || (systemPrefersDark ? 'dark' : 'light')

  // Validate theme exists
  if (!themeManager.getAvailableThemes().includes(themeName)) {
    themeName = 'light'
  }

  themeManager.setTheme(themeName)

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!savedTheme) {
      // Only auto-switch if no manual preference is saved
      themeManager.setTheme(e.matches ? 'dark' : 'light')
    }
  })
}

// Initialize theme on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTheme)
}
else {
  initializeTheme()
}
```

### Theme Switcher Component

```typescript
// Theme switcher component
export const ThemeSwitcher = () => {
  const [currentTheme, setCurrentTheme] = React.useState(themeManager.getCurrentTheme()?.name || 'light')

  const handleThemeChange = (themeName: string) => {
    themeManager.setTheme(themeName)
    setCurrentTheme(themeName)
  }

  return (
    <div className="theme-switcher">
      <label htmlFor="theme-select">Theme:</label>
      <select
        id="theme-select"
        value={currentTheme}
        onChange={(e) => handleThemeChange(e.target.value)}
      >
        {themeManager.getAvailableThemes().map(themeName => (
          <option key={themeName} value={themeName}>
            {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
          </option>
        ))}
      </select>
    </div>
  )
}

// Vue version
export default {
  name: 'ThemeSwitcher',
  data() {
    return {
      currentTheme: themeManager.getCurrentTheme()?.name || 'light'
    }
  },
  computed: {
    availableThemes() {
      return themeManager.getAvailableThemes()
    }
  },
  methods: {
    handleThemeChange(themeName: string) {
      themeManager.setTheme(themeName)
      this.currentTheme = themeName
    }
  },
  template: `
    <div class="theme-switcher">
      <label for="theme-select">Theme:</label>
      <select
        id="theme-select"
        :value="currentTheme"
        @change="handleThemeChange($event.target.value)"
      >
        <option
          v-for="themeName in availableThemes"
          :key="themeName"
          :value="themeName"
        >
          {{ themeName.charAt(0).toUpperCase() + themeName.slice(1) }}
        </option>
      </select>
    </div>
  `
}
```

This comprehensive theme system provides complete control over the visual appearance of BunPress documentation, supporting various use cases from corporate branding to developer preferences.
