---
title: SEO Configuration
description: Optimize your documentation for search engines
---

# SEO Configuration

BunPress includes comprehensive SEO features to help your documentation rank well in search engines and provide a great sharing experience on social media.

## Sitemap Generation

### Basic Setup

Enable automatic sitemap generation:

```typescript
const config: BunPressOptions = {
  sitemap: {
    enabled: true,
    baseUrl: 'https://docs.myproject.com',
  },
}
```

This generates a `sitemap.xml` file in your output directory.

### Configuration Options

```typescript
sitemap: {
  enabled: true,
  baseUrl: 'https://docs.myproject.com',
  filename: 'sitemap.xml',
  defaultPriority: 0.5,
  defaultChangefreq: 'monthly',

  // Custom priority per path pattern
  priorityMap: {
    '/': 1.0,           // Home page highest priority
    '/guide/*': 0.8,    // Guide pages
    '/api/*': 0.7,      // API reference
    '/changelog': 0.4,  // Changelog lower priority
  },

  // Custom change frequency per path
  changefreqMap: {
    '/changelog': 'weekly',
    '/blog/*': 'daily',
    '/api/*': 'monthly',
  },

  // Exclude paths from sitemap
  exclude: [
    '/draft/*',
    '/internal/*',
    '/404',
  ],

  // Large site options
  maxUrlsPerFile: 50000,
  useSitemapIndex: false,

  // Custom transformation
  transform: (entry) => {
    // Modify or filter entries
    if (entry.url.includes('/old/')) {
      return null // Exclude
    }
    return entry
  },

  verbose: false,
}
```

### Change Frequencies

Available values for `changefreq`:

| Value | Description |
|-------|-------------|
| `'always'` | Changes every access |
| `'hourly'` | Changes every hour |
| `'daily'` | Changes daily |
| `'weekly'` | Changes weekly |
| `'monthly'` | Changes monthly |
| `'yearly'` | Changes yearly |
| `'never'` | Archived content |

## Robots.txt

### Basic Setup

Generate a `robots.txt` file:

```typescript
const config: BunPressOptions = {
  robots: {
    enabled: true,
  },
}
```

### Custom Rules

Configure crawler access rules:

```typescript
robots: {
  enabled: true,
  filename: 'robots.txt',

  rules: [
    {
      userAgent: '*',
      allow: ['/'],
      disallow: ['/admin/', '/draft/', '/api/internal/'],
    },
    {
      userAgent: 'Googlebot',
      allow: ['/'],
      crawlDelay: 1,
    },
    {
      userAgent: 'Bingbot',
      allow: ['/'],
      disallow: ['/experimental/'],
      crawlDelay: 2,
    },
  ],

  sitemaps: ['https://docs.myproject.com/sitemap.xml'],
  host: 'https://docs.myproject.com',

  customContent: `
# Additional rules
User-agent: BadBot
Disallow: /
`,
}
```

### Generated Output

Example `robots.txt`:

```text
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /draft/

User-agent: Googlebot
Allow: /
Crawl-delay: 1

Sitemap: https://docs.myproject.com/sitemap.xml
Host: https://docs.myproject.com
```

## Meta Tags

### Page Metadata

Configure site-wide meta tags:

```typescript
markdown: {
  title: 'My Documentation',
  meta: {
    description: 'Comprehensive documentation for My Project',
    author: 'Your Name',
    keywords: 'documentation, api, reference',
  },
}
```

### Per-Page Metadata

Override metadata per page using frontmatter:

```markdown
---
title: API Reference
description: Complete API documentation for My Project
meta:
  og:image: /images/api-preview.png
  twitter:card: summary_large_image
---

# API Reference
```

### Open Graph Tags

BunPress automatically generates Open Graph tags for social sharing:

```html
<meta property="og:title" content="Page Title" />
<meta property="og:description" content="Page description" />
<meta property="og:type" content="article" />
<meta property="og:url" content="https://docs.myproject.com/page" />
<meta property="og:image" content="https://docs.myproject.com/og-image.png" />
```

### Twitter Cards

Twitter card meta tags are also generated:

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Page Title" />
<meta name="twitter:description" content="Page description" />
<meta name="twitter:image" content="https://docs.myproject.com/twitter-image.png" />
```

## Analytics

### Fathom Analytics

Privacy-focused analytics with GDPR/CCPA compliance:

```typescript
fathom: {
  enabled: true,
  siteId: 'YOUR_SITE_ID',
  scriptUrl: 'https://cdn.usefathom.com/script.js',
  defer: true,
  honorDNT: true,  // Respect Do Not Track
  auto: true,
  spa: false,
}
```

### Self-Hosted Analytics

Use your own analytics infrastructure:

```typescript
selfHostedAnalytics: {
  enabled: true,
  siteId: 'my-docs',
  apiEndpoint: 'https://analytics.mysite.com/collect',
  honorDNT: true,
  trackHashChanges: false,
  trackOutboundLinks: true,
}
```

## SEO Validation

### CLI Command

Check SEO issues across all pages:

```bash
bunpress seo:check
```

This validates:
- Title length (50-60 characters recommended)
- Description length (150-160 characters recommended)
- Heading structure (proper h1, h2, h3 hierarchy)
- Image alt text
- Internal link validity
- Meta tag presence

### Auto-Fix Mode

Automatically fix common issues:

```bash
bunpress seo:check --fix
```

This will:
- Add missing meta descriptions (from content)
- Fix heading hierarchy issues
- Add missing alt text placeholders
- Normalize title lengths

## Structured Data

BunPress generates JSON-LD structured data for better search results:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Page Title",
  "description": "Page description",
  "author": {
    "@type": "Organization",
    "name": "My Project"
  },
  "datePublished": "2024-01-01",
  "dateModified": "2024-06-15"
}
</script>
```

## Best Practices

### Title Optimization

```markdown
---
title: Getting Started with BunPress | My Project Docs
---
```

Keep titles:
- 50-60 characters
- Include primary keywords
- Unique per page

### Description Optimization

```markdown
---
description: Learn how to install and configure BunPress, the lightning-fast documentation generator, in under 5 minutes.
---
```

Keep descriptions:
- 150-160 characters
- Include call-to-action
- Unique per page

### Heading Structure

```markdown
# Main Page Title (only one h1)

## Section Heading

### Subsection

## Another Section

### Another Subsection
```

### Image Optimization

```markdown
![BunPress dashboard showing build performance metrics](/images/dashboard.png "BunPress Dashboard")
```

- Always include descriptive alt text
- Use meaningful file names
- Compress images for fast loading

### Internal Linking

```markdown
Learn more about [configuration options](/guide/configuration) and
[markdown features](/guide/markdown-features).
```

- Use descriptive anchor text
- Link to related content
- Avoid "click here" links
