# SEO Features

BunPress includes comprehensive SEO features to ensure your documentation ranks well in search engines and provides rich previews when shared on social media.

## Overview

All SEO features are automatically enabled and work out of the box with sensible defaults. Advanced customization is available through the configuration file.

### Automatic SEO Features

- ✅ **XML Sitemap** - Auto-generated sitemap.xml
- ✅ **Robots.txt** - Configurable robots.txt file
- ✅ **Meta Tags** - Title, description, and viewport tags
- ✅ **Open Graph** - Facebook, LinkedIn, and social media previews
- ✅ **Twitter Cards** - Enhanced Twitter previews
- ✅ **Canonical URLs** - Prevent duplicate content issues
- ✅ **Structured Data** - JSON-LD for search engines
- ✅ **RSS Feeds** - Blog-style documentation feeds
- ✅ **SEO Validation** - Built-in CLI tool for checking SEO health

---

## XML Sitemap

BunPress automatically generates a comprehensive XML sitemap for all your documentation pages.

### Basic Configuration

```typescript
// bunpress.config.ts
export default {
  sitemap: {
    enabled: true,  // Enable sitemap generation
    baseUrl: 'https://docs.example.com',  // Required: your site's URL
    filename: 'sitemap.xml',  // Output filename
  }
}
```

### Advanced Configuration

```typescript
export default {
  sitemap: {
    enabled: true,
    baseUrl: 'https://docs.example.com',

    // Default values for all pages
    defaultPriority: 0.5,  // 0.0 to 1.0
    defaultChangefreq: 'monthly',  // always, hourly, daily, weekly, monthly, yearly, never

    // Custom priority for specific paths
    priorityMap: {
      '/': 1.0,  // Homepage highest priority
      '/guide/*': 0.8,  // All guide pages
      '/api/*': 0.7,  // API documentation
      '/examples/*': 0.6,  // Examples
    },

    // Custom changefreq for specific paths
    changefreqMap: {
      '/changelog': 'daily',  // Frequently updated
      '/blog/*': 'weekly',  // Blog posts
      '/guide/*': 'monthly',  // Stable documentation
    },

    // Exclude specific paths
    exclude: [
      '/drafts/*',  // Draft pages
      '/internal/*',  // Internal docs
      '/test',  // Test pages
    ],

    // For large sites (50,000+ URLs)
    maxUrlsPerFile: 50000,
    useSitemapIndex: true,  // Generate sitemap index

    // Transform URLs before adding to sitemap
    transform: (entry) => {
      // Modify or filter sitemap entries
      if (entry.url.includes('deprecated')) {
        return null;  // Exclude from sitemap
      }
      return entry;
    },

    verbose: true  // Show generation details
  }
}
```

### Pattern Matching

The `priorityMap`, `changefreqMap`, and `exclude` options support glob patterns:

- `*` - Matches any characters except `/`
- `**` - Matches any characters including `/`
- `?` - Matches single character

**Examples:**
```typescript
priorityMap: {
  '/guide': 0.9,           // Exact match
  '/guide/*': 0.8,         // Direct children
  '/guide/**': 0.7,        // All descendants
  '/api/v?/*': 0.6,        // /api/v1/*, /api/v2/*
}
```

### Generated Sitemap

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://docs.example.com/</loc>
    <lastmod>2024-10-29</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://docs.example.com/guide</loc>
    <lastmod>2024-10-28</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- More URLs... -->
</urlset>
```

### Sitemap Index

For large documentation sites with over 50,000 pages:

```typescript
export default {
  sitemap: {
    enabled: true,
    baseUrl: 'https://docs.example.com',
    maxUrlsPerFile: 50000,
    useSitemapIndex: true
  }
}
```

Generates:
- `sitemap.xml` - Sitemap index file
- `sitemap-1.xml` - First 50,000 URLs
- `sitemap-2.xml` - Next 50,000 URLs
- etc.

---

## Robots.txt

Configure how search engines crawl your documentation.

### Basic Configuration

```typescript
export default {
  robots: {
    enabled: true,
    filename: 'robots.txt'
  }
}
```

### Advanced Configuration

```typescript
export default {
  robots: {
    enabled: true,
    filename: 'robots.txt',

    // Define rules for different user agents
    rules: [
      {
        userAgent: '*',  // All bots
        allow: ['/'],
        disallow: [
          '/drafts/',
          '/internal/',
          '/private/'
        ],
        crawlDelay: 10  // Seconds between requests
      },
      {
        userAgent: 'Googlebot',  // Google specifically
        allow: ['/'],
        disallow: ['/drafts/']
        // No crawl delay for Google
      },
      {
        userAgent: 'Bingbot',
        allow: ['/'],
        crawlDelay: 5
      }
    ],

    // Link to sitemap
    sitemaps: [
      'https://docs.example.com/sitemap.xml'
    ],

    // Host directive
    host: 'https://docs.example.com',

    // Custom content to append
    customContent: `
# Custom rules
User-agent: BadBot
Disallow: /
    `
  }
}
```

### Generated Robots.txt

```txt
User-agent: *
Allow: /
Disallow: /drafts/
Disallow: /internal/
Crawl-delay: 10

User-agent: Googlebot
Allow: /
Disallow: /drafts/

User-agent: Bingbot
Allow: /
Crawl-delay: 5

Sitemap: https://docs.example.com/sitemap.xml
Host: https://docs.example.com
```

---

## Meta Tags

BunPress automatically generates proper meta tags for every page.

### Basic Meta Tags

Configured in `bunpress.config.ts`:

```typescript
export default {
  markdown: {
    title: 'BunPress Documentation',
    meta: {
      description: 'Fast, modern documentation engine powered by Bun',
      generator: 'BunPress',
      viewport: 'width=device-width, initial-scale=1.0',
      // Add custom meta tags
      'theme-color': '#5672cd',
      'twitter:site': '@stacksjs'
    }
  }
}
```

### Page-Level Meta Tags

Override in frontmatter:

```markdown
---
title: Getting Started with BunPress
description: Learn how to create beautiful documentation in minutes
---

# Getting Started
```

### Generated Meta Tags

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Getting Started with BunPress</title>
  <meta name="description" content="Learn how to create beautiful documentation in minutes">
  <meta name="generator" content="BunPress">

  <!-- Canonical URL -->
  <link rel="canonical" href="https://docs.example.com/getting-started">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://docs.example.com/getting-started">
  <meta property="og:title" content="Getting Started with BunPress">
  <meta property="og:description" content="Learn how to create beautiful documentation in minutes">
  <meta property="og:site_name" content="BunPress Documentation">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Getting Started with BunPress">
  <meta name="twitter:description" content="Learn how to create beautiful documentation in minutes">
</head>
```

---

## Open Graph Tags

Provide rich previews when sharing on social media.

### Configuration

```typescript
export default {
  markdown: {
    meta: {
      // Open Graph
      'og:site_name': 'BunPress Documentation',
      'og:image': 'https://docs.example.com/images/social-card.png',
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:alt': 'BunPress - Fast Documentation Engine'
    }
  }
}
```

### Social Card Image

Create a 1200x630px image for social previews:

```
docs/public/images/social-card.png  (1200x630)
```

### Page-Specific Images

```markdown
---
title: API Reference
description: Complete API documentation
image: /images/api-social-card.png
---
```

### Preview Examples

**Facebook/LinkedIn:**
```
[Large Image: 1200x630]
BunPress Documentation
Getting Started with BunPress
Learn how to create beautiful documentation in minutes
docs.example.com
```

**Discord/Slack:**
```
[Thumbnail: 200x200]
Getting Started with BunPress
Learn how to create beautiful documentation in minutes
docs.example.com
```

---

## Twitter Cards

Enhanced Twitter previews with card types.

### Configuration

```typescript
export default {
  markdown: {
    meta: {
      'twitter:card': 'summary_large_image',  // or 'summary'
      'twitter:site': '@stacksjs',
      'twitter:creator': '@username',
      'twitter:image': 'https://docs.example.com/images/twitter-card.png'
    }
  }
}
```

### Card Types

**Summary Large Image** (recommended):
- 1200x628px image
- Large preview
- Best for visual content

```typescript
'twitter:card': 'summary_large_image'
```

**Summary** (compact):
- 120x120px image
- Small thumbnail
- Compact preview

```typescript
'twitter:card': 'summary'
```

---

## Canonical URLs

Prevent duplicate content penalties by specifying the canonical version of each page.

### Automatic Canonical URLs

BunPress automatically generates canonical URLs based on your `sitemap.baseUrl`:

```typescript
export default {
  sitemap: {
    baseUrl: 'https://docs.example.com'
  }
}
```

Generated:
```html
<link rel="canonical" href="https://docs.example.com/guide/getting-started">
```

### Custom Canonical URLs

Override in frontmatter:

```markdown
---
title: Deployment Guide
canonical: https://main-docs.example.com/deployment
---
```

---

## Structured Data (JSON-LD)

Help search engines understand your content structure with JSON-LD markup.

### Automatic Schemas

BunPress generates appropriate schemas automatically:

#### TechArticle Schema

For documentation pages:

```json
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Getting Started with BunPress",
  "description": "Learn how to create beautiful documentation",
  "datePublished": "2024-01-15",
  "dateModified": "2024-10-29",
  "author": {
    "@type": "Organization",
    "name": "Stacks.js"
  },
  "publisher": {
    "@type": "Organization",
    "name": "BunPress Documentation"
  }
}
```

#### Breadcrumb Schema

For navigation hierarchy:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://docs.example.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Guide",
      "item": "https://docs.example.com/guide"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Getting Started",
      "item": "https://docs.example.com/guide/getting-started"
    }
  ]
}
```

#### WebSite Schema

For homepage:

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "BunPress Documentation",
  "url": "https://docs.example.com",
  "description": "Fast, modern documentation engine powered by Bun"
}
```

---

## RSS Feeds

Generate RSS feeds for blog-style documentation updates.

### Configuration

```typescript
export default {
  rss: {
    enabled: true,
    title: 'BunPress Updates',
    description: 'Latest documentation updates and releases',
    author: 'BunPress Team',
    email: 'team@bunpress.dev',
    language: 'en-us',
    filename: 'feed.xml',
    maxItems: 20,
    fullContent: false  // Include full content or excerpts
  }
}
```

### Page Requirements

Add date to frontmatter for RSS inclusion:

```markdown
---
title: Announcing BunPress v2.0
description: Major release with new features
date: 2024-10-29
author: Chris Breuer
---

# Announcing BunPress v2.0

Content here...
```

### Generated Feed

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>BunPress Updates</title>
    <description>Latest documentation updates</description>
    <link>https://docs.example.com</link>
    <language>en-us</language>
    <lastBuildDate>Tue, 29 Oct 2024 10:00:00 GMT</lastBuildDate>

    <item>
      <title>Announcing BunPress v2.0</title>
      <link>https://docs.example.com/blog/v2-announcement</link>
      <guid>https://docs.example.com/blog/v2-announcement</guid>
      <description>Major release with new features</description>
      <pubDate>Tue, 29 Oct 2024 09:00:00 GMT</pubDate>
      <author>Chris Breuer</author>
    </item>
  </channel>
</rss>
```

---

## SEO Validation

BunPress includes a built-in SEO checker to identify issues.

### Run SEO Check

```bash
bunpress seo:check
```

### What It Checks

1. **Page Titles**
   - All pages have titles
   - Optimal length (10-60 characters)
   - No duplicate titles

2. **Meta Descriptions**
   - All pages have descriptions
   - Optimal length (50-160 characters)
   - Unique descriptions

3. **Internal Links**
   - No broken links
   - All references resolve

4. **Images**
   - All images have alt text
   - Alt text is descriptive

### Example Output

```bash
$ bunpress seo:check

SEO Validation Results

Checked: 23 pages

Errors (3):
  ✗ guide/advanced.md: Missing meta description
  ✗ api/endpoints.md: Title too long (67 chars, max 60)
  ✗ tutorial.md: Broken link: /missing-page

Warnings (2):
  ⚠ config.md: Description too short (35 chars, min 50)
  ⚠ examples.md: Image missing alt text (line 45)

Summary:
  Titles:        23/23 ✓
  Descriptions:  21/23 ✗ (91%)
  Links:         22/23 ⚠ (96%)
  Images:        45/46 ⚠ (98%)

Run with --fix to automatically resolve some issues.
```

### Auto-Fix Issues

```bash
bunpress seo:check --fix
```

**What gets fixed:**
- Missing meta descriptions (generated from content)
- Missing page titles (extracted from first heading)

**What requires manual fix:**
- Broken links (need review)
- Images without alt text (need descriptive text)
- Titles/descriptions that are too long/short

---

## Best Practices

### 1. Always Set Base URL

```typescript
export default {
  sitemap: {
    baseUrl: 'https://docs.example.com'  // Required for SEO
  }
}
```

### 2. Write Descriptive Titles

**Good:**
```markdown
---
title: API Authentication with OAuth 2.0
description: Learn how to authenticate API requests using OAuth 2.0 tokens
---
```

**Bad:**
```markdown
---
title: Auth
description: Authentication
---
```

### 3. Optimize Images

- Use alt text for all images
- Compress images (use WebP or AVIF)
- Include social card images (1200x630)

```markdown
![User authentication flow diagram showing OAuth 2.0 authorization](/images/auth-flow.png)
```

### 4. Structure Your Content

Use proper heading hierarchy:

```markdown
# Main Title (H1) - One per page

## Major Section (H2)

### Subsection (H3)

#### Detail (H4)
```

### 5. Internal Linking

Link between related pages:

```markdown
See also: [Configuration Guide](/config) and [CLI Reference](/cli)
```

### 6. Keep URLs Clean

**Good:**
- `/guide/getting-started`
- `/api/authentication`
- `/examples/deployment`

**Bad:**
- `/page1`
- `/doc-2024-10-29`
- `/untitled`

### 7. Regular SEO Audits

Run weekly:
```bash
bunpress seo:check && bunpress stats
```

### 8. Update Frequently

Set appropriate changefreq in sitemap:

```typescript
changefreqMap: {
  '/changelog': 'daily',      // Frequently updated
  '/blog/*': 'weekly',        // Regular updates
  '/guide/*': 'monthly',      // Stable content
  '/archive/*': 'yearly'      // Historical content
}
```

---

## SEO Checklist

Before deploying:

- [ ] Set `sitemap.baseUrl` in config
- [ ] All pages have unique titles (10-60 chars)
- [ ] All pages have descriptions (50-160 chars)
- [ ] Social card image created (1200x630)
- [ ] All images have descriptive alt text
- [ ] No broken internal links
- [ ] Canonical URLs configured
- [ ] robots.txt configured
- [ ] Run `bunpress seo:check` passes
- [ ] Sitemap submitted to search engines

### Submit Sitemap

After deployment:

1. **Google Search Console**
   - Add property: https://docs.example.com
   - Submit sitemap: https://docs.example.com/sitemap.xml

2. **Bing Webmaster Tools**
   - Add site: https://docs.example.com
   - Submit sitemap: https://docs.example.com/sitemap.xml

---

## Advanced Topics

### Custom SEO Transformations

Modify sitemap entries before generation:

```typescript
export default {
  sitemap: {
    transform: (entry) => {
      // Add custom metadata
      if (entry.url.includes('/api/')) {
        entry.priority = 0.9;
        entry.changefreq = 'weekly';
      }

      // Exclude beta pages
      if (entry.url.includes('/beta/')) {
        return null;
      }

      return entry;
    }
  }
}
```

### Dynamic Meta Tags

Generate meta tags based on content:

```typescript
// Custom plugin
export default {
  plugins: [
    {
      name: 'dynamic-meta',
      extendConfig: (config) => {
        // Add custom meta tag logic
        return config;
      }
    }
  ]
}
```

### Multi-Language SEO

Configure for multiple languages:

```typescript
export default {
  sitemap: {
    baseUrl: 'https://docs.example.com',
    // Include language in URLs
  },
  markdown: {
    meta: {
      'og:locale': 'en_US',
      'og:locale:alternate': ['es_ES', 'fr_FR']
    }
  }
}
```

---

## Monitoring & Analytics

### Google Search Console

Monitor:
- Indexing status
- Search performance
- Mobile usability
- Core Web Vitals

### Analytics Integration

See [Configuration Guide](/config#fathom-analytics) for privacy-focused analytics with Fathom.

---

## Related Documentation

- [Configuration Guide](/config) - Complete configuration options
- [CLI Reference](/cli) - `seo:check` command details
- [Deployment Guide](/deployment) - Deploy with SEO optimization
- [Best Practices](/best-practices#seo-optimization) - SEO best practices

---

## Need Help?

- 📚 [Documentation](/)
- 💬 [Discord Community](https://discord.gg/stacksjs)
- 🐛 [Report Issues](https://github.com/stacksjs/bunpress/issues)
