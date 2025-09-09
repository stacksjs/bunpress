---
title: Theme Configuration Example
description: Comprehensive theming system and customization options for BunPress documentation
author: BunPress Team
layout: doc
toc: sidebar
sidebar:
  - text: Overview
    link: /theme-config-example#overview
  - text: Color Palette
    link: /theme-config-example#color-palette
  - text: Typography
    link: /theme-config-example#typography
  - text: Layout Options
    link: /theme-config-example#layout-options
  - text: Component Styling
    link: /theme-config-example#component-styling
  - text: Dark Mode
    link: /theme-config-example#dark-mode
  - text: Custom CSS
    link: /theme-config-example#custom-css
---

# Theme Configuration Example

This example demonstrates BunPress's comprehensive theming system, allowing you to create beautiful, consistent documentation with custom branding and styling.

## Overview

BunPress provides a powerful theming system that includes:

- **Color customization** - Complete color palette control
- **Typography settings** - Font families, sizes, and weights
- **Layout options** - Responsive design configurations
- **Component styling** - Custom component appearances
- **Dark mode support** - Automatic and manual dark mode
- **CSS variables** - Dynamic theming with CSS custom properties

## Color Palette

### Primary Colors

```typescript
// In bunpress.config.ts
export default {
  theme: {
    colors: {
      // Primary brand colors
      primary: {
        50: '#eff6ff', // Lightest
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6', // Base primary
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a', // Darkest
      },

      // Semantic colors
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    }
  }
}
```

### Neutral Colors

```typescript
export default {
  theme: {
    colors: {
      // Neutral grays
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
      },

      // Background colors
      background: {
        primary: '#ffffff',
        secondary: '#f9fafb',
        tertiary: '#f3f4f6',
      },

      // Surface colors
      surface: {
        primary: '#ffffff',
        secondary: '#f9fafb',
        tertiary: '#f3f4f6',
      }
    }
  }
}
```

### Custom Color Schemes

```typescript
// Custom theme with brand colors
export default {
  theme: {
    colors: {
      // Brand specific colors
      brand: {
        primary: '#7c3aed', // Purple
        secondary: '#06b6d4', // Cyan
        accent: '#f59e0b', // Amber
      },

      // Status colors
      status: {
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626',
        info: '#2563eb',
      },

      // Interactive states
      interactive: {
        hover: '#f3f4f6',
        active: '#e5e7eb',
        focus: '#dbeafe',
        disabled: '#9ca3af',
      }
    }
  }
}
```

## Typography

### Font Families

```typescript
export default {
  theme: {
    typography: {
      // Font stacks
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace'
        ],
        serif: [
          'Georgia',
          'Cambria',
          'Times New Roman',
          'Times',
          'serif'
        ]
      },

      // Font sizes
      fontSize: {
        'xs': '0.75rem', // 12px
        'sm': '0.875rem', // 14px
        'base': '1rem', // 16px
        'lg': '1.125rem', // 18px
        'xl': '1.25rem', // 20px
        '2xl': '1.5rem', // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem', // 36px
        '5xl': '3rem', // 48px
      },

      // Font weights
      fontWeight: {
        thin: '100',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },

      // Line heights
      lineHeight: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      }
    }
  }
}
```

### Heading Hierarchy

```typescript
export default {
  theme: {
    typography: {
      headings: {
        h1: {
          fontSize: '2.25rem', // 36px
          fontWeight: '700',
          lineHeight: '2.5rem',
          marginBottom: '1rem',
          color: 'var(--color-text-primary)',
        },
        h2: {
          fontSize: '1.875rem', // 30px
          fontWeight: '600',
          lineHeight: '2.25rem',
          marginBottom: '0.875rem',
          color: 'var(--color-text-primary)',
        },
        h3: {
          fontSize: '1.5rem', // 24px
          fontWeight: '600',
          lineHeight: '2rem',
          marginBottom: '0.75rem',
          color: 'var(--color-text-primary)',
        },
        h4: {
          fontSize: '1.25rem', // 20px
          fontWeight: '600',
          lineHeight: '1.75rem',
          marginBottom: '0.5rem',
          color: 'var(--color-text-secondary)',
        },
        h5: {
          fontSize: '1.125rem', // 18px
          fontWeight: '600',
          lineHeight: '1.625rem',
          marginBottom: '0.5rem',
          color: 'var(--color-text-secondary)',
        },
        h6: {
          fontSize: '1rem', // 16px
          fontWeight: '600',
          lineHeight: '1.5rem',
          marginBottom: '0.5rem',
          color: 'var(--color-text-secondary)',
        }
      }
    }
  }
}
```

## Layout Options

### Container Sizes

```typescript
export default {
  theme: {
    layout: {
      // Container max widths
      container: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },

      // Sidebar configuration
      sidebar: {
        width: '280px',
        collapsedWidth: '64px',
        background: 'var(--color-surface-primary)',
        borderColor: 'var(--color-border)',
      },

      // Navigation bar
      navbar: {
        height: '64px',
        background: 'var(--color-surface-primary)',
        borderColor: 'var(--color-border)',
      },

      // Content spacing
      spacing: {
        content: '2rem',
        section: '1.5rem',
        paragraph: '1rem',
      }
    }
  }
}
```

### Breakpoints

```typescript
export default {
  theme: {
    breakpoints: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },

    // Responsive utilities
    responsive: {
      hide: {
        sm: '@media (max-width: 639px)',
        md: '@media (max-width: 767px)',
        lg: '@media (max-width: 1023px)',
        xl: '@media (max-width: 1279px)',
      },
      show: {
        sm: '@media (min-width: 640px)',
        md: '@media (min-width: 768px)',
        lg: '@media (min-width: 1024px)',
        xl: '@media (min-width: 1280px)',
      }
    }
  }
}
```

## Component Styling

### Button Styles

```typescript
export default {
  theme: {
    components: {
      button: {
        base: `
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          user-select: none;
        `,

        variants: {
          primary: {
            'backgroundColor': 'var(--color-primary-500)',
            'color': 'white',
            'borderColor': 'var(--color-primary-500)',

            '&:hover': {
              backgroundColor: 'var(--color-primary-600)',
              borderColor: 'var(--color-primary-600)',
            },

            '&:focus': {
              outline: '2px solid var(--color-primary-200)',
              outlineOffset: '2px',
            }
          },

          secondary: {
            'backgroundColor': 'var(--color-surface-primary)',
            'color': 'var(--color-text-primary)',
            'borderColor': 'var(--color-border)',

            '&:hover': {
              backgroundColor: 'var(--color-surface-secondary)',
            }
          },

          ghost: {
            'backgroundColor': 'transparent',
            'color': 'var(--color-text-primary)',
            'borderColor': 'transparent',

            '&:hover': {
              backgroundColor: 'var(--color-surface-secondary)',
            }
          }
        },

        sizes: {
          sm: {
            padding: '0.375rem 0.75rem',
            fontSize: '0.75rem',
          },
          md: {
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
          },
          lg: {
            padding: '0.625rem 1.25rem',
            fontSize: '1rem',
          }
        }
      }
    }
  }
}
```

### Code Block Styling

```typescript
export default {
  theme: {
    components: {
      code: {
        base: `
          font-family: var(--font-mono);
          font-size: 0.875rem;
          line-height: 1.5;
          tab-size: 2;
          white-space: pre-wrap;
          word-break: break-word;
        `,

        block: {
          'backgroundColor': 'var(--color-surface-secondary)',
          'border': '1px solid var(--color-border)',
          'borderRadius': '0.375rem',
          'padding': '1rem',
          'margin': '1rem 0',
          'overflow': 'auto',

          '& pre': {
            margin: 0,
            padding: 0,
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: 0,
          }
        },

        inline: {
          backgroundColor: 'var(--color-surface-tertiary)',
          color: 'var(--color-text-secondary)',
          padding: '0.125rem 0.25rem',
          borderRadius: '0.25rem',
          fontSize: '0.8125rem',
        }
      }
    }
  }
}
```

### Card Components

```typescript
export default {
  theme: {
    components: {
      card: {
        base: `
          background-color: var(--color-surface-primary);
          border: 1px solid var(--color-border);
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: box-shadow 0.2s ease-in-out;
        `,

        variants: {
          elevated: {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },

          outlined: {
            boxShadow: 'none',
            borderWidth: '2px',
          },

          filled: {
            backgroundColor: 'var(--color-surface-secondary)',
            border: 'none',
          }
        },

        padding: {
          sm: '0.75rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
        }
      }
    }
  }
}
```

## Dark Mode

### Automatic Dark Mode

```typescript
export default {
  theme: {
    darkMode: {
      // Auto-detect system preference
      strategy: 'auto', // 'auto', 'manual', 'system'

      // CSS class for dark mode
      className: 'dark',

      // Storage key for user preference
      storageKey: 'bunpress-theme',

      // Default theme
      defaultTheme: 'system',
    }
  }
}
```

### Dark Mode Colors

```typescript
export default {
  theme: {
    colors: {
      light: {
        background: {
          primary: '#ffffff',
          secondary: '#f9fafb',
          tertiary: '#f3f4f6',
        },
        text: {
          primary: '#111827',
          secondary: '#4b5563',
          tertiary: '#6b7280',
        },
        border: '#e5e7eb',
      },

      dark: {
        background: {
          primary: '#111827',
          secondary: '#1f2937',
          tertiary: '#374151',
        },
        text: {
          primary: '#f9fafb',
          secondary: '#d1d5db',
          tertiary: '#9ca3af',
        },
        border: '#374151',
      }
    }
  }
}
```

### Dark Mode Toggle

```typescript
// Theme toggle functionality
class ThemeToggle {
  private theme: 'light' | 'dark' | 'system' = 'system'
  private storageKey = 'bunpress-theme'

  constructor() {
    this.init()
  }

  private init() {
    // Load saved theme
    const saved = localStorage.getItem(this.storageKey)
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      this.theme = saved as typeof this.theme
    }

    this.applyTheme()
    this.setupToggle()
  }

  private setupToggle() {
    const toggle = document.querySelector('.theme-toggle')
    if (!toggle)
      return

    toggle.addEventListener('click', () => {
      this.cycleTheme()
    })
  }

  private cycleTheme() {
    // Cycle through: system -> light -> dark -> system
    switch (this.theme) {
      case 'system':
        this.theme = 'light'
        break
      case 'light':
        this.theme = 'dark'
        break
      case 'dark':
        this.theme = 'system'
        break
    }

    this.saveTheme()
    this.applyTheme()
  }

  private applyTheme() {
    const root = document.documentElement

    if (this.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    }
    else {
      root.setAttribute('data-theme', this.theme)
    }

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      const themeColor = this.theme === 'dark' ? '#111827' : '#ffffff'
      metaThemeColor.setAttribute('content', themeColor)
    }
  }

  private saveTheme() {
    localStorage.setItem(this.storageKey, this.theme)
  }

  // Public API
  setTheme(theme: 'light' | 'dark' | 'system') {
    this.theme = theme
    this.saveTheme()
    this.applyTheme()
  }

  getTheme() {
    return this.theme
  }
}
```

## Custom CSS

### CSS Variables

```css
/* CSS custom properties for theming */
:root {
  /* Colors */
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;

  /* Border radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* Dark theme overrides */
[data-theme="dark"] {
  --color-background-primary: #111827;
  --color-text-primary: #f9fafb;
  --color-surface-primary: #1f2937;
}
```

### Custom Stylesheets

```typescript
// Custom CSS injection
export default {
  theme: {
    customCss: [
      // Local stylesheets
      '/styles/custom.css',
      '/styles/components.css',

      // External stylesheets
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',

      // Inline styles
      `
        .custom-header {
          background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
          color: white;
          padding: 2rem;
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-4);
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-4);
          margin: var(--space-4) 0;
        }
      `
    ]
  }
}
```

### CSS-in-JS Support

```typescript
// CSS-in-JS theming utilities
export const themeUtils = {
  // Color utilities
  color: (color: string, shade?: number) => {
    if (shade) {
      return `var(--color-${color}-${shade})`
    }
    return `var(--color-${color})`
  },

  // Spacing utilities
  space: (size: number) => `var(--space-${size})`,

  // Font utilities
  font: (family: 'sans' | 'mono' | 'serif') => `var(--font-${family})`,

  // Shadow utilities
  shadow: (size: 'sm' | 'md' | 'lg') => `var(--shadow-${size})`,

  // Border radius utilities
  radius: (size: 'sm' | 'md' | 'lg') => `var(--radius-${size})`,
}

// Usage in components
const buttonStyles = css`
  background-color: ${themeUtils.color('primary', 500)};
  color: white;
  padding: ${themeUtils.space(2)} ${themeUtils.space(4)};
  border-radius: ${themeUtils.radius('md')};
  font-family: ${themeUtils.font('sans')};
  box-shadow: ${themeUtils.shadow('sm')};

  &:hover {
    background-color: ${themeUtils.color('primary', 600)};
  }
`
```

### Theme Overrides

```typescript
// Component-specific theme overrides
export default {
  theme: {
    overrides: {
      // Override specific components
      'button.primary': {
        'backgroundColor': 'var(--color-brand-primary)',
        '&:hover': {
          backgroundColor: 'var(--color-brand-primary-dark)',
        }
      },

      // Override markdown styles
      'markdown.h1': {
        color: 'var(--color-brand-primary)',
        fontSize: '2.5rem',
      },

      // Override code block styles
      'code.block': {
        backgroundColor: 'var(--color-surface-tertiary)',
        borderColor: 'var(--color-brand-secondary)',
      }
    }
  }
}
```

This comprehensive theming system provides complete control over the appearance and behavior of your BunPress documentation, ensuring consistency and brand alignment across all pages.
