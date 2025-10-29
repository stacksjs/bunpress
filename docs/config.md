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

## Sitemap Configuration

Configure sitemap and SEO optimization:

```typescript
export default {
  sitemap: {
    enabled: true,
    baseUrl: 'https://example.com',
    filename: 'sitemap.xml',
    defaultPriority: 0.5,
    defaultChangefreq: 'monthly',
    exclude: ['/private/**', '/admin/**'],
    priorityMap: {
      '/': 1.0,
      '/docs/**': 0.8,
      '/examples/**': 0.6
    },
    changefreqMap: {
      '/blog/**': 'weekly',
      '/docs/**': 'monthly'
    },
    maxUrlsPerFile: 50000,
    useSitemapIndex: false
  }
}
```

## Robots.txt Configuration

Configure robots.txt for search engine crawling:

```typescript
export default {
  robots: {
    enabled: true,
    filename: 'robots.txt',
    rules: [
      {
        userAgent: 'Googlebot',
        allow: ['/'],
        disallow: ['/private/', '/admin/']
      },
      {
        userAgent: 'Bingbot',
        allow: ['/'],
        disallow: ['/admin/'],
        crawlDelay: 1
      }
    ],
    sitemaps: ['https://example.com/sitemap.xml'],
    host: 'example.com'
  }
}
```

## Fathom Analytics Configuration

BunPress supports [Fathom Analytics](https://usefathom.com) - a privacy-focused analytics platform. The analytics script will be automatically injected into all pages when enabled.

### Basic Setup

```typescript
export default {
  fathom: {
    enabled: true,
    siteId: 'ABCDEFGH'  // Your Fathom site ID
  }
}
```

### Full Configuration

```typescript
export default {
  fathom: {
    // Enable/disable Fathom Analytics
    enabled: true,

    // Your Fathom site ID (required when enabled)
    // Find this in your Fathom dashboard
    siteId: 'ABCDEFGH',

    // Custom Fathom script URL (optional)
    // Default: 'https://cdn.usefathom.com/script.js'
    scriptUrl: 'https://cdn.usefathom.com/script.js',

    // Load script with defer attribute (recommended)
    // Default: true
    defer: true,

    // Honor Do Not Track browser setting
    // Default: false
    honorDNT: false,

    // Canonical URL for the site (optional)
    // Overrides automatic canonical URL detection
    canonical: 'https://example.com',

    // Enable auto tracking (tracks pageviews automatically)
    // Default: true
    auto: true,

    // Enable SPA (Single Page Application) mode
    // Default: false
    spa: false
  }
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `false` | Enable Fathom Analytics tracking |
| `siteId` | `string` | - | Your Fathom site ID (required when enabled) |
| `scriptUrl` | `string` | `'https://cdn.usefathom.com/script.js'` | Custom Fathom script URL |
| `defer` | `boolean` | `true` | Load script with defer attribute for better performance |
| `honorDNT` | `boolean` | `false` | Honor Do Not Track browser setting |
| `canonical` | `string` | - | Override automatic canonical URL detection |
| `auto` | `boolean` | `true` | Enable automatic pageview tracking |
| `spa` | `boolean` | `false` | Enable SPA mode for single-page applications |

### Finding Your Fathom Site ID

1. Log in to your [Fathom Analytics dashboard](https://app.usefathom.com)
2. Select your site from the dashboard
3. Go to **Settings** > **Sites**
4. Copy the **Site ID** (e.g., `NXCLHKXQ`)
5. Add it to your `bunpress.config.ts`

### Privacy Features

Fathom Analytics is privacy-focused by design:

- **No cookies** - GDPR, CCPA, and PECR compliant
- **No personal data** - Only anonymized metrics
- **No tracking across sites** - Site-isolated analytics
- **No fingerprinting** - Respects user privacy

### Advanced Usage

#### Single Page Application (SPA) Mode

If your documentation uses client-side routing (SPA), enable SPA mode:

```typescript
export default {
  fathom: {
    enabled: true,
    siteId: 'ABCDEFGH',
    spa: true  // Automatically tracks route changes
  }
}
```

#### Do Not Track (DNT)

Respect users who have enabled Do Not Track in their browser:

```typescript
export default {
  fathom: {
    enabled: true,
    siteId: 'ABCDEFGH',
    honorDNT: true  // Skip tracking for DNT users
  }
}
```

#### Custom Canonical URL

Override the default canonical URL detection:

```typescript
export default {
  fathom: {
    enabled: true,
    siteId: 'ABCDEFGH',
    canonical: 'https://docs.example.com'  // Custom canonical base
  }
}
```

### Disabling Analytics

To temporarily disable analytics without removing the configuration:

```typescript
export default {
  fathom: {
    enabled: false,  // Analytics disabled
    siteId: 'ABCDEFGH'
  }
}
```

Or simply omit the `fathom` configuration entirely - no tracking script will be added.

## Markdown Features Configuration

BunPress supports extensive markdown feature configuration through the markdown options.

### Features Toggle

All VitePress-compatible markdown features can be enabled/disabled via the `features` configuration:

```typescript
export default {
  markdown: {
    features: {
      // Inline formatting (bold, italic, strikethrough, sub/sup, mark)
      inlineFormatting: true,

      // Custom containers (::: info, ::: tip, etc.)
      containers: true,  // Or configure specific types

      // GitHub alerts (> [!NOTE], > [!TIP], etc.)
      githubAlerts: true,  // Or configure specific types

      // Code block enhancements
      codeBlocks: {
        lineHighlighting: true,
        lineNumbers: true,
        focus: true,
        diffs: true,
        errorWarningMarkers: true
      },

      // Code groups with tabs
      codeGroups: true,

      // Code imports from files
      codeImports: true,

      // Inline TOC [[toc]] macro
      inlineToc: true,

      // Custom header anchors (## Heading {#custom-id})
      customAnchors: true,

      // Emoji shortcodes (:tada:, :rocket:, etc.)
      emoji: true,

      // Inline badges (<Badge type="info" text="v2.0" />)
      badges: true,

      // Markdown file inclusion (<!--@include: ./file.md-->)
      includes: true,

      // External link enhancements
      externalLinks: {
        autoTarget: true,  // Add target="_blank"
        autoRel: true,     // Add rel="noreferrer noopener"
        showIcon: true     // Show external link icon
      },

      // Image lazy loading
      imageLazyLoading: true,

      // Enhanced tables
      tables: {
        alignment: true,       // Column alignment support
        enhancedStyling: true, // Striped rows, hover effects
        responsive: true       // Horizontal scroll wrapper
      }
    }
  }
}
```

#### Fine-Grained Container Control

```typescript
export default {
  markdown: {
    features: {
      containers: {
        info: true,
        tip: true,
        warning: true,
        danger: true,
        details: true,
        raw: false  // Disable raw containers
      }
    }
  }
}
```

#### Fine-Grained Alert Control

```typescript
export default {
  markdown: {
    features: {
      githubAlerts: {
        note: true,
        tip: true,
        important: true,
        warning: true,
        caution: false  // Disable caution alerts
      }
    }
  }
}
```

#### Disabling Specific Features

```typescript
export default {
  markdown: {
    features: {
      // Disable features you don't need
      emoji: false,           // Disable emoji processing
      badges: false,          // Disable badge syntax
      imageLazyLoading: false // Disable lazy loading
    }
  }
}
```

### Table of Contents

Configure TOC generation:

```typescript
export default {
  markdown: {
    toc: {
      enabled: true,
      minDepth: 2,  // Start from H2
      maxDepth: 4,   // End at H4
      position: 'sidebar', // 'sidebar', 'inline', or 'floating'
      title: 'On This Page',
      exclude: ['Appendix', 'References'],
      pattern: '^(Appendix|References)',  // Regex pattern for exclusion
      collapsible: true,
      collapsed: false
    }
  }
}
```

#### TOC Configuration Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable TOC generation |
| `minDepth` | `number` | `2` | Minimum heading level (1-6) |
| `maxDepth` | `number` | `4` | Maximum heading level (1-6) |
| `position` | `string` | `'sidebar'` | TOC position: 'sidebar', 'inline', or 'floating' |
| `title` | `string` | `'On This Page'` | TOC section title |
| `exclude` | `string[]` | `[]` | Array of heading texts to exclude |
| `pattern` | `string` | `undefined` | Regex pattern for heading exclusion |
| `collapsible` | `boolean` | `true` | Allow collapsing sections |
| `collapsed` | `boolean` | `false` | Start with sections collapsed |

### Code Highlighting

Configure syntax highlighting:

```typescript
export default {
  markdown: {
    highlighting: {
      enabled: true,
      theme: 'github-dark',
      lineNumbers: true,
      copyButton: true,
      languages: [
        'typescript', 'javascript', 'python', 'rust', 'go'
      ]
    }
  }
}
```

### GitHub Alerts

GitHub-style alert boxes are enabled by default. All alert types are supported:

- `[!NOTE]` - Essential information
- `[!TIP]` - Helpful advice
- `[!IMPORTANT]` - Critical information
- `[!WARNING]` - Urgent attention required
- `[!CAUTION]` - Potential risks

No configuration required - use them directly in your markdown:

```markdown
> [!TIP]
> This is automatically styled!
```

### Custom Containers

Custom container syntax is enabled by default:

```markdown
::: tip
This is a tip
:::

::: warning
This is a warning
:::

::: danger
This is dangerous
:::

::: info
This is informational
:::

::: details Click to expand
Hidden content
:::
```

### Code Groups

Code groups are automatically processed when using the syntax:

````markdown
::: code-group

```js [JavaScript]
// code here
```

```ts [TypeScript]
// code here
```

:::
````

### Inline Badges

Badges work out of the box:

```markdown
<Badge type="tip" text="new" />
<Badge type="warning" text="deprecated" />
<Badge type="danger" text="breaking" />
<Badge type="info" text="beta" />
```

### Emoji Support

Emoji shortcodes are automatically converted:

```markdown
:heart: :fire: :rocket:
```

Configure custom emoji mappings:

```typescript
export default {
  markdown: {
    emoji: {
      enabled: true,
      customMappings: {
        'custom': '🎯',
        'logo': '🚀'
      }
    }
  }
}
```

### Code Imports

Import code from files with the `<<<` syntax:

```markdown
<<< ./examples/code.ts
<<< ./src/api.ts{10-20}
<<< ./src/config.ts{#region-name}
```

Configure base directories:

```typescript
export default {
  markdown: {
    codeImports: {
      basePath: './examples',
      extensions: ['.ts', '.js', '.py', '.go']
    }
  }
}
```

### Markdown File Inclusion

Include markdown files with HTML comment syntax:

```markdown
<!--@include: ./shared/intro.md-->
<!--@include: ./guide.md{1-50}-->
<!--@include: ./docs.md{#section}-->
```

Configure base paths:

```typescript
export default {
  markdown: {
    includes: {
      basePath: './docs',
      maxDepth: 10,  // Maximum nesting level
      circularCheck: true
    }
  }
}
```

## Frontmatter Configuration

Configure page-specific settings via frontmatter:

```yaml
---
title: Page Title
description: Page description for SEO
layout: doc  # 'home', 'doc', or 'page'

# TOC Configuration
toc:
  enabled: true
  minDepth: 2
  maxDepth: 4

# Hero Section (for home layout)
hero:
  name: Project Name
  text: Tagline
  tagline: Subheading
  image: /logo.png
  actions:
    - theme: brand
      text: Get Started
      link: /guide/start
    - theme: alt
      text: View on GitHub
      link: https://github.com/user/repo

# Features (for home layout)
features:
  - title: Feature 1
    details: Description of feature 1
  - title: Feature 2
    details: Description of feature 2

# Navigation overrides
sidebar: false  # Disable sidebar for this page
navbar: true    # Show/hide navbar
editLink: true  # Show edit link
lastUpdated: true  # Show last updated date

# SEO
head:
  - - meta
    - name: keywords
      content: keyword1, keyword2
  - - meta
    - property: og:title
      content: Custom OG Title
---
```

## Default CSS

BunPress includes a default stylesheet that provides a clean, responsive layout for your documentation.
