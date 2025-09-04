# Configuration

BunPress can be configured through a `bunpress.config.ts` file in your project root.

## Basic Configuration

```typescript
// bunpress.config.ts
export default {
  // Enable verbose logging
  verbose: true,

  // Markdown plugin configuration
  markdown: {
    title: 'My Documentation',
    meta: {
      description: 'My project documentation',
      author: 'Your Name',
    },
    scripts: [
      '/js/highlight.js',
    ],
  },
}
```

## Available Options

### General Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `verbose` | `boolean` | `true` | Enable verbose logging |

### Markdown Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `string` | `'BunPress Documentation'` | Default title for HTML documents |
| `meta` | `Record<string, string>` | See below | Metadata for HTML documents |
| `css` | `string` | See below | Custom CSS to be included in the head of the document |
| `scripts` | `string[]` | `[]` | List of script URLs to be included at the end of the body |
| `template` | `string` | `undefined` | Custom HTML template with `{{content}}` placeholder |
| `markedOptions` | `object` | `{}` | Custom options for the Marked Markdown parser |
| `preserveDirectoryStructure` | `boolean` | `true` | Whether to preserve the directory structure in the output |
| `nav` | `NavItem[]` | `undefined` | Navigation bar configuration |
| `sidebar` | `Record<string, SidebarItem[]>` | `undefined` | Sidebar navigation configuration |
| `search` | `SearchConfig` | `undefined` | Search functionality configuration |
| `themeConfig` | `ThemeConfig` | `undefined` | Theme customization configuration |

## Navigation Configuration

Configure the navigation bar:

```typescript
export default {
  nav: [
    { text: 'Home', link: '/', icon: '🏠' },
    {
      text: 'Guide',
      activeMatch: '/guide',
      items: [
        { text: 'Getting Started', link: '/guide/getting-started' },
        { text: 'Advanced', link: '/guide/advanced' }
      ]
    },
    { text: 'API', link: '/api' },
    { text: 'GitHub', link: 'https://github.com', icon: '🐙' }
  ]
}
```

### NavItem Properties

| Property | Type | Description |
|----------|------|-------------|
| `text` | `string` | Display text for the navigation item |
| `link` | `string` | URL or path for the link |
| `icon` | `string` | Optional icon (emoji or icon name) |
| `items` | `NavItem[]` | Nested navigation items (creates dropdown) |
| `activeMatch` | `string` | Pattern to match for active state |

## Sidebar Configuration

Configure the sidebar navigation:

```typescript
export default {
  markdown: {
    sidebar: {
      '/': [
        { text: 'Home', link: '/' },
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Advanced', link: '/guide/advanced' }
          ]
        },
        { text: 'API', link: '/api' }
      ]
    }
  }
}
```

### SidebarItem Properties

| Property | Type | Description |
|----------|------|-------------|
| `text` | `string` | Display text for the sidebar item |
| `link` | `string` | URL or path for the link |
| `items` | `SidebarItem[]` | Nested sidebar items (creates collapsible group) |

## Search Configuration

Configure search functionality:

```typescript
export default {
  markdown: {
    search: {
      enabled: true,
      placeholder: 'Search documentation...',
      maxResults: 10,
      keyboardShortcuts: true
    }
  }
}
```

### SearchConfig Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | `boolean` | `false` | Enable search functionality |
| `placeholder` | `string` | `'Search...'` | Search input placeholder text |
| `maxResults` | `number` | `10` | Maximum number of search results |
| `keyboardShortcuts` | `boolean` | `true` | Enable keyboard shortcuts (Ctrl+K) |

## Theme Configuration

Customize the appearance of your documentation:

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
      },
      darkMode: true,
      cssVars: {
        'border-radius': '8px',
        'shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }
    }
  }
}
```

### ThemeConfig Properties

#### Colors

| Property | Type | Description |
|----------|------|-------------|
| `primary` | `string` | Primary brand color |
| `secondary` | `string` | Secondary color |
| `accent` | `string` | Accent/highlight color |
| `background` | `string` | Background color |
| `surface` | `string` | Surface/card color |
| `text` | `string` | Text color |
| `muted` | `string` | Muted text color |

#### Fonts

| Property | Type | Description |
|----------|------|-------------|
| `heading` | `string` | Font for headings (H1-H6) |
| `body` | `string` | Font for body text |
| `mono` | `string` | Monospace font for code |

#### Other Options

| Property | Type | Description |
|----------|------|-------------|
| `darkMode` | `boolean \| 'auto'` | Enable dark mode |
| `cssVars` | `Record<string, string>` | Custom CSS variables |
| `css` | `string` | Custom CSS to inject |

## Default Metadata

By default, BunPress includes the following metadata:

```typescript
{
  description: 'Documentation built with BunPress',
  generator: 'BunPress',
  viewport: 'width=device-width, initial-scale=1.0',
}
```

## Default CSS

BunPress includes a default stylesheet that provides a clean, responsive layout for your documentation.
