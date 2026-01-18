# Theming

BunPress provides extensive theming capabilities to customize the look and feel of your documentation site.

## Color Configuration

### Primary Colors

```typescript
// bunpress.config.ts
export default {
  themeConfig: {
    colors: {
      primary: '#3b82f6',
      accent: '#8b5cf6',
    },
  },
}
```

### Full Color Palette

```typescript
export default {
  themeConfig: {
    colors: {
      // Brand colors
      primary: '#3b82f6',
      accent: '#8b5cf6',

      // Background colors
      background: '#ffffff',
      backgroundSoft: '#f8fafc',
      backgroundMuted: '#f1f5f9',

      // Text colors
      text: '#1e293b',
      textMuted: '#64748b',
      textLight: '#94a3b8',

      // Border colors
      border: '#e2e8f0',
      divider: '#f1f5f9',

      // Status colors
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },
}
```

## Dark Mode

### Enable Dark Mode

```typescript
export default {
  themeConfig: {
    darkMode: {
      enabled: true,
      default: 'auto', // 'light' | 'dark' | 'auto'
    },
  },
}
```

### Dark Mode Colors

```typescript
export default {
  themeConfig: {
    darkMode: {
      enabled: true,
      colors: {
        background: '#0f172a',
        backgroundSoft: '#1e293b',
        text: '#f1f5f9',
        textMuted: '#94a3b8',
      },
    },
  },
}
```

## Typography

### Font Configuration

```typescript
export default {
  themeConfig: {
    fonts: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      mono: '"Fira Code", "JetBrains Mono", Consolas, monospace',
      heading: 'Inter, sans-serif',
    },
  },
}
```

### Font Sizes

```typescript
export default {
  themeConfig: {
    typography: {
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
      },
    },
  },
}
```

## Layout

### Container Width

```typescript
export default {
  themeConfig: {
    layout: {
      maxWidth: '1280px',
      contentWidth: '720px',
      sidebarWidth: '280px',
    },
  },
}
```

### Spacing

```typescript
export default {
  themeConfig: {
    spacing: {
      page: '2rem',
      section: '3rem',
      element: '1rem',
    },
  },
}
```

## Custom CSS

### Global Styles

```typescript
export default {
  themeConfig: {
    customCss: './styles/custom.css',
  },
}
```

```css
/* styles/custom.css */
:root {
  --vp-c-brand: #3b82f6;
  --vp-c-brand-light: #60a5fa;
  --vp-c-brand-dark: #2563eb;
}

.doc-content {
  max-width: 800px;
}

.code-block {
  border-radius: 8px;
}
```

### CSS Variables

BunPress uses CSS variables for theming:

```css
:root {
  /* Colors */
  --vp-c-bg: #ffffff;
  --vp-c-bg-soft: #f8fafc;
  --vp-c-text: #1e293b;
  --vp-c-text-muted: #64748b;
  --vp-c-border: #e2e8f0;
  --vp-c-divider: #f1f5f9;

  /* Brand */
  --vp-c-brand: #3b82f6;
  --vp-c-brand-light: #60a5fa;
  --vp-c-brand-dark: #2563eb;

  /* Typography */
  --vp-font-family-base: Inter, sans-serif;
  --vp-font-family-mono: 'Fira Code', monospace;

  /* Layout */
  --vp-layout-max-width: 1280px;
  --vp-sidebar-width: 280px;
  --vp-content-width: 720px;
}

.dark {
  --vp-c-bg: #0f172a;
  --vp-c-bg-soft: #1e293b;
  --vp-c-text: #f1f5f9;
  --vp-c-text-muted: #94a3b8;
}
```

## Component Styling

### Navigation

```css
.nav-bar {
  --nav-height: 64px;
  --nav-bg: var(--vp-c-bg);
  --nav-border: var(--vp-c-border);
}

.nav-link {
  color: var(--vp-c-text-muted);
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--vp-c-brand);
}
```

### Sidebar

```css
.sidebar {
  --sidebar-bg: var(--vp-c-bg-soft);
  --sidebar-link-color: var(--vp-c-text);
  --sidebar-link-active-color: var(--vp-c-brand);
}

.sidebar-link.active {
  background: var(--vp-c-brand);
  color: white;
  border-radius: 4px;
}
```

### Code Blocks

```css
.code-block {
  --code-bg: #1e1e1e;
  --code-text: #d4d4d4;
  --code-border: transparent;
  --code-line-highlight: rgba(255, 255, 255, 0.1);
}
```

## Theme Presets

### Minimal Theme

```typescript
export default {
  themeConfig: {
    preset: 'minimal',
  },
}
```

### Colorful Theme

```typescript
export default {
  themeConfig: {
    preset: 'colorful',
    colors: {
      primary: '#8b5cf6',
      accent: '#ec4899',
    },
  },
}
```

## Component Customization

### Custom Header

```typescript
export default {
  themeConfig: {
    header: {
      logo: '/logo.svg',
      logoAlt: 'My Logo',
      showTitle: true,
    },
  },
}
```

### Custom Footer

```typescript
export default {
  themeConfig: {
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright 2024',
    },
  },
}
```

### Social Links

```typescript
export default {
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/...' },
      { icon: 'twitter', link: 'https://twitter.com/...' },
      { icon: 'discord', link: 'https://discord.gg/...' },
    ],
  },
}
```

## Responsive Design

```css
/* Mobile styles */
@media (max-width: 768px) {
  :root {
    --vp-sidebar-width: 100%;
    --vp-content-width: 100%;
  }

  .sidebar {
    position: fixed;
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
```

## Best Practices

1. **Use CSS variables**: Easier maintenance and dark mode support
2. **Test dark mode**: Verify colors work in both modes
3. **Mobile first**: Design for mobile, enhance for desktop
4. **Consistent spacing**: Use theme spacing values
5. **Accessible colors**: Ensure sufficient contrast

## Related

- [Configuration](/advanced/configuration) - Full configuration
- [Performance](/advanced/performance) - Asset optimization
- [Custom Containers](/features/containers) - Container styling
