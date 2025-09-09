# Theme Customization Example

This example demonstrates how to customize the appearance of your BunPress documentation with themes, colors, and fonts.

## Basic Theme Configuration

Configure themes in your `bunpress.config.ts`:

```typescript
export default {
  markdown: {
    themeConfig: {
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#f59e0b'
      },
      fonts: {
        heading: 'Inter, sans-serif',
        body: 'Roboto, sans-serif',
        mono: 'JetBrains Mono, monospace'
      }
    }
  }
}
```

## Color Customization

Customize the color palette:

```typescript
export default {
  markdown: {
    themeConfig: {
      colors: {
        primary: '#8b5cf6', // Purple primary
        secondary: '#06b6d4', // Cyan secondary
        accent: '#f59e0b', // Amber accent
        background: '#0f172a', // Dark background
        surface: '#1e293b', // Dark surface
        text: '#f1f5f9', // Light text
        muted: '#64748b' // Muted text
      }
    }
  }
}
```

## Font Customization

Set custom fonts for different text elements:

```typescript
export default {
  markdown: {
    themeConfig: {
      fonts: {
        heading: '"Playfair Display", serif',
        body: '"Source Sans Pro", sans-serif',
        mono: '"Fira Code", monospace'
      }
    }
  }
}
```

## Dark Mode

Enable automatic dark mode:

```typescript
export default {
  markdown: {
    themeConfig: {
      darkMode: true, // Enable dark mode
      colors: {
        // Colors will automatically adapt for dark mode
        primary: '#60a5fa',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f1f5f9'
      }
    }
  }
}
```

## Custom CSS Variables

Add your own CSS variables:

```typescript
export default {
  markdown: {
    themeConfig: {
      cssVars: {
        'border-radius': '8px',
        'shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'transition': 'all 0.2s ease'
      }
    }
  }
}
```

## Custom CSS

Add completely custom CSS:

```typescript
export default {
  markdown: {
    themeConfig: {
      css: `
        .custom-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .highlight-box {
          border-left: 4px solid var(--color-primary);
          background: rgba(59, 130, 246, 0.1);
          padding: 1rem;
          margin: 1rem 0;
        }
      `
    }
  }
}
```

## Per-Page Theme Overrides

Override theme settings for specific pages:

```yaml
---
themeConfig:
  colors:
    primary: '#ef4444' # Red theme for this page
  css: |
    .special-page {
      border: 2px solid var(--color-primary);
    }
---

# Special Page

This page has a custom red theme.
```

## Theme Examples

### Corporate Theme

```typescript
{
  colors: {
    primary: '#1f2937',
    secondary: '#374151',
    accent: '#3b82f6'
  },
  fonts: {
    heading: '"Poppins", sans-serif',
    body: '"Open Sans", sans-serif'
  }
}
```

### Creative Theme

```typescript
{
  colors: {
    primary: '#8b5cf6',
    secondary: '#ec4899',
    accent: '#f59e0b',
    background: '#fef7ed'
  },
  fonts: {
    heading: '"Dancing Script", cursive',
    body: '"Quicksand", sans-serif'
  }
}
```

### Tech Theme

```typescript
{
  colors: {
    primary: '#00d4aa',
    secondary: '#2563eb',
    accent: '#f59e0b',
    background: '#0f172a'
  },
  fonts: {
    heading: '"JetBrains Mono", monospace',
    body: '"Inter", sans-serif',
    mono: '"JetBrains Mono", monospace'
  },
  darkMode: true
}
```

## Features

- ✅ **Color Customization**: Primary, secondary, accent, and semantic colors
- ✅ **Typography**: Separate fonts for headings, body, and code
- ✅ **Dark Mode**: Automatic dark mode support
- ✅ **CSS Variables**: Custom CSS variables for advanced theming
- ✅ **Custom CSS**: Direct CSS injection for complete control
- ✅ **Per-Page Overrides**: Different themes for different pages
- ✅ **Responsive**: Themes work across all device sizes

## Best Practices

1. **Consistent Color Palette**: Use a cohesive color scheme
2. **Readable Fonts**: Choose fonts that are easy to read
3. **Accessibility**: Ensure good contrast ratios
4. **Brand Alignment**: Match your project's branding
5. **Progressive Enhancement**: Provide fallbacks for older browsers

## Try It Out

Configure a custom theme for your documentation and see how it transforms the appearance while maintaining full functionality!
