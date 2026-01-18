# Theme Customization

This guide covers how to customize the visual appearance of your BunPress documentation site.

## Theme Configuration

BunPress provides extensive theming options through the `themeConfig` object:

```typescript
// bunpress.config.ts
export default {
  markdown: {
    themeConfig: {
      colors: { /* ... */ },
      fonts: { /* ... */ },
      darkMode: 'auto',
      cssVars: { /* ... */ },
      css: `/* custom styles */`,
    }
  }
}
```

## Color Palette

Customize the color scheme for your documentation:

```typescript
themeConfig: {
  colors: {
    // Brand colors
    primary: '#3b82f6',      // Main brand color (links, buttons)
    secondary: '#64748b',    // Secondary elements
    accent: '#f59e0b',       // Accent highlights

    // Background colors
    background: '#ffffff',   // Page background
    surface: '#f8fafc',      // Cards, sidebar, code blocks

    // Text colors
    text: '#1e293b',         // Main text
    muted: '#64748b',        // Secondary text, descriptions
  }
}
```

### Color Tokens Reference

| Token | Usage |
|-------|-------|
| `primary` | Links, buttons, active states, focus rings |
| `secondary` | Borders, dividers, icons |
| `accent` | Badges, highlights, notifications |
| `background` | Main page background |
| `surface` | Sidebar, cards, code blocks |
| `text` | Headings, body text |
| `muted` | Descriptions, hints, placeholders |

### Color Examples

**Blue Theme (Default)**
```typescript
colors: {
  primary: '#3b82f6',
  secondary: '#64748b',
  accent: '#06b6d4',
}
```

**Purple Theme**
```typescript
colors: {
  primary: '#8b5cf6',
  secondary: '#6b7280',
  accent: '#ec4899',
}
```

**Green Theme**
```typescript
colors: {
  primary: '#10b981',
  secondary: '#6b7280',
  accent: '#f59e0b',
}
```

## Typography

Configure fonts for different text elements:

```typescript
themeConfig: {
  fonts: {
    // Headings (H1-H6)
    heading: 'Inter, system-ui, sans-serif',

    // Body text, paragraphs
    body: 'Inter, system-ui, sans-serif',

    // Code blocks, inline code
    mono: 'JetBrains Mono, Fira Code, monospace',
  }
}
```

### Using Custom Fonts

**Google Fonts**

Add fonts via the `scripts` option:

```typescript
markdown: {
  scripts: [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap',
  ],

  themeConfig: {
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
      mono: 'JetBrains Mono, monospace',
    }
  }
}
```

**Self-Hosted Fonts**

Place fonts in `docs/public/fonts/` and reference them:

```typescript
markdown: {
  css: `
    @font-face {
      font-family: 'CustomFont';
      src: url('/fonts/custom-font.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
      font-display: swap;
    }
  `,

  themeConfig: {
    fonts: {
      heading: 'CustomFont, sans-serif',
    }
  }
}
```

## Dark Mode

BunPress supports automatic dark mode:

```typescript
themeConfig: {
  // Options: true | false | 'auto'
  darkMode: 'auto',  // Follows system preference
}
```

### Dark Mode Options

| Value | Behavior |
|-------|----------|
| `true` | Always dark mode |
| `false` | Always light mode |
| `'auto'` | Follows system preference |

### Custom Dark Mode Colors

Override specific dark mode colors using CSS:

```typescript
markdown: {
  css: `
    @media (prefers-color-scheme: dark) {
      :root {
        --bp-background: #0f172a;
        --bp-surface: #1e293b;
        --bp-text: #f1f5f9;
        --bp-primary: #60a5fa;
      }
    }
  `
}
```

## CSS Variables

Define custom CSS variables for consistent styling:

```typescript
themeConfig: {
  cssVars: {
    // Spacing
    'spacing-xs': '0.25rem',
    'spacing-sm': '0.5rem',
    'spacing-md': '1rem',
    'spacing-lg': '2rem',

    // Borders
    'border-radius': '8px',
    'border-color': '#e2e8f0',

    // Shadows
    'shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
    'shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',

    // Layout
    'sidebar-width': '280px',
    'content-max-width': '900px',
  }
}
```

Access these in custom CSS:

```css
.custom-element {
  padding: var(--bp-spacing-md);
  border-radius: var(--bp-border-radius);
  box-shadow: var(--bp-shadow-sm);
}
```

## Custom CSS

Add custom styles to override defaults:

```typescript
markdown: {
  themeConfig: {
    css: `
      /* Custom heading styles */
      h1 {
        font-size: 2.5rem;
        letter-spacing: -0.025em;
      }

      /* Custom code block styling */
      pre[class*="language-"] {
        border-radius: 12px;
        padding: 1.5rem;
      }

      /* Custom sidebar */
      .sidebar {
        background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
      }

      /* Custom link hover */
      a:hover {
        text-decoration: underline;
        text-underline-offset: 4px;
      }
    `
  }
}
```

## Layout Customization

### Sidebar Width

```typescript
cssVars: {
  'sidebar-width': '320px',
}
```

### Content Width

```typescript
cssVars: {
  'content-max-width': '1000px',
}
```

### Header Height

```typescript
cssVars: {
  'header-height': '64px',
}
```

## Component Styling

### Custom Containers

Style the container blocks:

```typescript
css: `
  .custom-container.tip {
    background: #ecfdf5;
    border-left-color: #10b981;
  }

  .custom-container.warning {
    background: #fffbeb;
    border-left-color: #f59e0b;
  }

  .custom-container.danger {
    background: #fef2f2;
    border-left-color: #ef4444;
  }
`
```

### Code Blocks

```typescript
css: `
  /* Code block header */
  .code-block-header {
    background: #1e293b;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    color: #94a3b8;
  }

  /* Line numbers */
  .line-numbers {
    color: #475569;
    border-right: 1px solid #334155;
    padding-right: 1rem;
  }

  /* Copy button */
  .copy-button {
    background: #3b82f6;
    border-radius: 4px;
  }
`
```

### Tables

```typescript
css: `
  table {
    border-collapse: collapse;
    width: 100%;
  }

  th {
    background: #f1f5f9;
    font-weight: 600;
    text-align: left;
  }

  tr:nth-child(even) {
    background: #f8fafc;
  }

  tr:hover {
    background: #f1f5f9;
  }
`
```

## Syntax Highlighting Themes

BunPress supports multiple syntax highlighting themes:

```typescript
markdown: {
  syntaxHighlightTheme: 'github-dark',  // or 'github-light'
}
```

### Available Themes

| Theme | Best For |
|-------|----------|
| `github-light` | Light mode documentation |
| `github-dark` | Dark mode documentation |

### Custom Syntax Theme

Apply custom syntax colors:

```typescript
css: `
  /* Comments */
  .token.comment { color: #6b7280; }

  /* Keywords */
  .token.keyword { color: #c084fc; }

  /* Strings */
  .token.string { color: #34d399; }

  /* Functions */
  .token.function { color: #60a5fa; }

  /* Numbers */
  .token.number { color: #fbbf24; }
`
```

## Complete Theme Example

Here's a complete dark theme configuration:

```typescript
// bunpress.config.ts
export default {
  markdown: {
    syntaxHighlightTheme: 'github-dark',

    themeConfig: {
      colors: {
        primary: '#60a5fa',
        secondary: '#6b7280',
        accent: '#a78bfa',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f1f5f9',
        muted: '#94a3b8',
      },

      fonts: {
        heading: 'Inter, system-ui, sans-serif',
        body: 'Inter, system-ui, sans-serif',
        mono: 'JetBrains Mono, monospace',
      },

      darkMode: true,

      cssVars: {
        'border-radius': '8px',
        'shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        'sidebar-width': '280px',
        'content-max-width': '900px',
      },

      css: `
        /* Smooth transitions */
        * {
          transition: background-color 0.2s, border-color 0.2s;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-track {
          background: #1e293b;
        }

        /* Code block enhancements */
        pre[class*="language-"] {
          border: 1px solid #334155;
        }

        /* Link styling */
        a {
          transition: color 0.15s ease;
        }

        a:hover {
          color: #93c5fd;
        }
      `,
    }
  }
}
```

## Related

- [Configuration Guide](/guide/configuration)
- [Markdown Extensions](/markdown-extensions)
- [Plugin Development](/guide/plugins)
