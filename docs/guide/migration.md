# Migrating from VitePress

This guide helps you migrate an existing VitePress documentation site to BunPress.

## Why Migrate?

BunPress offers several advantages:

- **11x faster builds** - 0.18s vs 1.93s for 4,000 files
- **Native Bun runtime** - No Node.js dependency
- **VitePress-compatible** - Similar configuration and markdown syntax
- **Lighter footprint** - Smaller bundle sizes

## Quick Migration

### 1. Install BunPress

```bash
# Remove VitePress
npm uninstall vitepress
# or
bun remove vitepress

# Install BunPress
bun add -D @stacksjs/bunpress
```

### 2. Update Configuration

Rename your config file:

```bash
mv docs/.vitepress/config.ts bunpress.config.ts
```

Update the configuration format:

**VitePress (before):**
```typescript
// docs/.vitepress/config.ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'My Docs',
  description: 'Documentation for my project',

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
    ],
    sidebar: {
      '/guide/': [
        { text: 'Introduction', link: '/guide/' },
      ],
    },
  },
})
```

**BunPress (after):**
```typescript
// bunpress.config.ts
import type { BunPressOptions } from '@stacksjs/bunpress'

export default {
  docsDir: './docs',
  outDir: './dist',

  nav: [
    { text: 'Home', link: '/' },
    { text: 'Guide', link: '/guide/' },
  ],

  markdown: {
    title: 'My Docs',
    meta: {
      description: 'Documentation for my project',
    },

    sidebar: {
      '/guide/': [
        { text: 'Introduction', link: '/guide/' },
      ],
    },
  },
} satisfies BunPressOptions
```

### 3. Update package.json Scripts

**Before:**
```json
{
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  }
}
```

**After:**
```json
{
  "scripts": {
    "docs:dev": "bunpress dev",
    "docs:build": "bunpress build",
    "docs:preview": "bunpress preview"
  }
}
```

### 4. Move Content (Optional)

If your docs are in a subdirectory:

```bash
# Keep existing structure (BunPress supports ./docs by default)
# Or move to project root if preferred
```

## Configuration Mapping

### Theme Config

| VitePress | BunPress |
|-----------|----------|
| `themeConfig.nav` | `nav` |
| `themeConfig.sidebar` | `markdown.sidebar` |
| `themeConfig.search` | `markdown.search` |
| `themeConfig.outline` | `markdown.toc` |
| `themeConfig.socialLinks` | Add to `nav` with icons |

### Site Config

| VitePress | BunPress |
|-----------|----------|
| `title` | `markdown.title` |
| `description` | `markdown.meta.description` |
| `base` | Configure in deployment |
| `lang` | `markdown.meta.lang` |
| `head` | `markdown.meta` + `markdown.scripts` |

### Markdown Config

| VitePress | BunPress |
|-----------|----------|
| `markdown.theme` | `markdown.syntaxHighlightTheme` |
| `markdown.lineNumbers` | `markdown.features.codeBlocks.lineNumbers` |
| `markdown.container` | `markdown.features.containers` |
| `markdown.toc` | `markdown.toc` |

## Feature Compatibility

### Fully Compatible

These features work identically:

- Markdown syntax (CommonMark + GFM)
- Custom containers (`::: tip`, `::: warning`, etc.)
- GitHub alerts (`> [!NOTE]`, `> [!TIP]`, etc.)
- Code groups
- Line highlighting in code blocks
- Code diffs (`// [!code ++]`, `// [!code --]`)
- Frontmatter (YAML)
- Table of Contents
- Emoji shortcodes

### Slightly Different

**Home Page Layout:**

VitePress:
```yaml
---
layout: home
hero:
  name: My Project
  text: Fast & Simple
  tagline: Get started quickly
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
---
```

BunPress: Same syntax (compatible)

**Code Import:**

VitePress: `<<< @/snippets/code.ts`
BunPress: `<<< ./snippets/code.ts`

### Different Implementation

**Vue Components:**

VitePress uses Vue components. BunPress uses HTML/Markdown:

```markdown
<!-- VitePress -->
<script setup>
import CustomComponent from './components/Custom.vue'
</script>

<CustomComponent />
```

```markdown
<!-- BunPress -->
Use HTML directly or markdown includes:
<!--@include: ./partials/custom.md-->
```

## Content Migration

### Move Documentation Files

```bash
# If using .vitepress/docs structure
mv docs/.vitepress/theme ./archive/  # Archive Vue theme
mv docs/.vitepress/cache ./archive/  # Remove cache

# Keep markdown files in docs/
# They're compatible without changes
```

### Update Internal Links

Most links work unchanged. Check for:

```markdown
<!-- VitePress-specific paths -->
[Link](/guide/index.md)  <!-- Works in both -->
[Link](/guide/)          <!-- Works in both -->
```

### Update Image Paths

```markdown
<!-- Both support -->
![Image](/images/logo.png)      <!-- From docs/public/images/ -->
![Image](./images/local.png)    <!-- Relative path -->
```

## Theme Migration

### Custom CSS

**VitePress:**
```css
/* docs/.vitepress/theme/custom.css */
:root {
  --vp-c-brand: #646cff;
  --vp-c-brand-light: #747bff;
}
```

**BunPress:**
```typescript
// bunpress.config.ts
export default {
  markdown: {
    themeConfig: {
      colors: {
        primary: '#646cff',
      },
      css: `
        :root {
          --bp-primary-light: #747bff;
        }
      `,
    },
  },
}
```

### Custom Components

For Vue components, convert to:

1. **Markdown includes** for content
2. **HTML with CSS** for styling
3. **Client-side JavaScript** for interactivity

## SEO Migration

### Meta Tags

**VitePress:**
```typescript
export default {
  head: [
    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],
}
```

**BunPress:**
```typescript
export default {
  markdown: {
    meta: {
      'theme-color': '#646cff',
    },
    // Favicon: place in docs/public/
  },
}
```

### Sitemap

**VitePress:**
```typescript
import { defineConfig } from 'vitepress'

export default defineConfig({
  sitemap: {
    hostname: 'https://example.com',
  },
})
```

**BunPress:**
```typescript
export default {
  sitemap: {
    enabled: true,
    baseUrl: 'https://example.com',
  },
}
```

## Analytics Migration

### Google Analytics to Fathom

VitePress typically uses gtag. BunPress recommends privacy-focused Fathom:

```typescript
export default {
  fathom: {
    enabled: true,
    siteId: 'YOUR_SITE_ID',
    honorDNT: true,  // Privacy-friendly
  },
}
```

## Deployment

BunPress generates static files compatible with the same hosts:

- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages

### Build Command

```bash
# VitePress
vitepress build docs

# BunPress
bunpress build
```

### Output Directory

```bash
# VitePress default
docs/.vitepress/dist/

# BunPress default
dist/
```

Update deployment config if needed:

```yaml
# netlify.toml
[build]
  command = "bunpress build"
  publish = "dist"
```

## Troubleshooting

### Common Issues

**1. Missing styles**

Ensure CSS is configured:

```typescript
markdown: {
  themeConfig: {
    colors: { primary: '#3b82f6' },
  },
}
```

**2. Broken navigation**

Check path format:

```typescript
// Include leading slash
{ text: 'Guide', link: '/guide/' }
```

**3. Missing sidebar**

Ensure correct path matching:

```typescript
sidebar: {
  '/guide/': [  // Match URL path exactly
    // ...
  ],
}
```

**4. Code highlighting issues**

Set the theme explicitly:

```typescript
markdown: {
  syntaxHighlightTheme: 'github-dark',
}
```

### Getting Help

- Check [BunPress documentation](/)
- Compare with [VitePress docs](https://vitepress.dev)
- File issues on [GitHub](https://github.com/stacksjs/bunpress/issues)

## Migration Checklist

- [ ] Install BunPress, remove VitePress
- [ ] Convert config file format
- [ ] Update package.json scripts
- [ ] Test all pages render correctly
- [ ] Verify navigation works
- [ ] Check code highlighting
- [ ] Test search functionality
- [ ] Verify SEO (sitemap, robots.txt)
- [ ] Update CI/CD configuration
- [ ] Test production build
- [ ] Deploy and verify

## Related

- [Getting Started](/guide/getting-started)
- [Configuration Guide](/guide/configuration)
- [CLI Reference](/cli)
