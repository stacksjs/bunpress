---
title: SEO Optimization Example
description: Comprehensive SEO optimization techniques for BunPress documentation
author: BunPress Team
layout: doc
toc: sidebar
sidebar:
  - text: Overview
    link: /seo-example#overview
  - text: Meta Tags
    link: /seo-example#meta-tags
  - text: Structured Data
    link: /seo-example#structured-data
  - text: URL Structure
    link: /seo-example#url-structure
  - text: Performance
    link: /seo-example#performance
  - text: Sitemap & Robots
    link: /seo-example#sitemap-robots
---

# SEO Optimization Example

This comprehensive example demonstrates best practices for optimizing your BunPress documentation for search engines and improving discoverability.

## Overview

SEO optimization involves multiple aspects:

- **Technical SEO**: Site structure, performance, mobile-friendliness
- **Content SEO**: Quality content, keywords, internal linking
- **Meta SEO**: Titles, descriptions, structured data
- **Performance SEO**: Speed, Core Web Vitals

## Meta Tags

### Basic Meta Tags

Essential meta tags for every page:

```html
<!-- Title (50-60 characters) -->
<title>Getting Started with BunPress - Complete Guide</title>

<!-- Description (150-160 characters) -->
<meta name="description" content="Learn how to get started with BunPress, the fast documentation engine built with Bun. Includes installation, configuration, and best practices.">

<!-- Keywords (optional but helpful) -->
<meta name="keywords" content="bunpress, documentation, bun, vitepress, fast, seo">

<!-- Author -->
<meta name="author" content="BunPress Team">

<!-- Robots -->
<meta name="robots" content="index, follow">
```

### Open Graph Tags

Social media sharing optimization:

```html
<!-- Open Graph / Facebook -->
<meta property="og:type" content="article">
<meta property="og:url" content="https://bunpress.dev/guide/getting-started">
<meta property="og:title" content="Getting Started with BunPress">
<meta property="og:description" content="Learn how to get started with BunPress, the fast documentation engine built with Bun.">
<meta property="og:image" content="https://bunpress.dev/images/getting-started-og.png">
<meta property="og:site_name" content="BunPress">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://bunpress.dev/guide/getting-started">
<meta property="twitter:title" content="Getting Started with BunPress">
<meta property="twitter:description" content="Learn how to get started with BunPress, the fast documentation engine built with Bun.">
<meta property="twitter:image" content="https://bunpress.dev/images/getting-started-twitter.png">
```

## Structured Data

### JSON-LD Implementation

Add structured data for better search engine understanding:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Getting Started with BunPress",
  "description": "Complete guide to getting started with BunPress documentation engine",
  "author": {
    "@type": "Organization",
    "name": "BunPress Team",
    "url": "https://bunpress.dev"
  },
  "publisher": {
    "@type": "Organization",
    "name": "BunPress",
    "logo": {
      "@type": "ImageObject",
      "url": "https://bunpress.dev/images/logo.png"
    }
  },
  "datePublished": "2024-01-15",
  "dateModified": "2024-01-15",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://bunpress.dev/guide/getting-started"
  },
  "image": "https://bunpress.dev/images/getting-started-hero.png"
}
</script>
```

### Breadcrumb Structured Data

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://bunpress.dev"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Guide",
      "item": "https://bunpress.dev/guide"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Getting Started",
      "item": "https://bunpress.dev/guide/getting-started"
    }
  ]
}
</script>
```

## URL Structure

### SEO-Friendly URLs

Best practices for URL structure:

```
✅ Good URLs:
https://bunpress.dev/guide/getting-started
https://bunpress.dev/api/configuration
https://bunpress.dev/examples/basic-usage

❌ Avoid:
https://bunpress.dev/index.php?page=guide&id=123
https://bunpress.dev/guide/getting-started.html
https://bunpress.dev/Getting-Started-With-BunPress
```

### URL Parameters

Handle URL parameters for better SEO:

```typescript
// In your bunpress.config.ts
export default {
  seo: {
    // Remove trailing slashes
    trailingSlash: false,

    // Clean URLs
    cleanUrls: true,

    // Handle query parameters
    transformUrl: (url: string) => {
      // Remove unnecessary parameters
      return url.replace(/[?&]utm_[^&]*/g, '')
    }
  }
}
```

## Performance

### Core Web Vitals

Optimize for Google's Core Web Vitals:

```typescript
// Performance configuration
export default {
  performance: {
    // Enable compression
    compress: true,

    // Code splitting
    splitChunks: true,

    // Image optimization
    optimizeImages: true,

    // Lazy loading
    lazyLoad: true
  }
}
```

### Caching Strategies

Implement effective caching:

```typescript
export default {
  headers: {
    // Cache static assets
    '/assets/**': {
      'Cache-Control': 'public, max-age=31536000, immutable'
    },

    // Cache HTML with revalidation
    '/**/*.html': {
      'Cache-Control': 'public, max-age=3600, must-revalidate'
    }
  }
}
```

## Sitemap & Robots

### XML Sitemap

Generate comprehensive sitemaps:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://bunpress.dev/</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://bunpress.dev/guide/getting-started</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://bunpress.dev/api/configuration</loc>
    <lastmod>2024-01-14</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### Robots.txt

Configure search engine crawling:

```txt
User-agent: *
Allow: /

# Block development files
Disallow: /node_modules/
Disallow: /src/
Disallow: /*.ts$
Disallow: /*.js$

# Allow important paths
Allow: /api/
Allow: /guide/
Allow: /examples/

# Sitemap
Sitemap: https://bunpress.dev/sitemap.xml
```

## Content Optimization

### Heading Structure

Proper heading hierarchy for SEO:

```markdown
# H1 - Main Page Title (only one per page)

## H2 - Major Section

### H3 - Subsection

#### H4 - Minor subsection

##### H5 - Rarely used

###### H6 - Very rarely used
```

### Internal Linking

Strategic internal linking strategy:

```markdown
<!-- Context-aware linking -->
For more information about [configuration](/guide/configuration), see the [API reference](/api/configuration).

<!-- Related content links -->
**See also:**
- [Getting Started Guide](/guide/getting-started)
- [Advanced Configuration](/guide/advanced-config)
- [Troubleshooting](/guide/troubleshooting)
```

### Image Optimization

SEO-friendly images:

```html
<!-- Optimized image with alt text -->
<img src="/images/bunpress-logo.webp"
     alt="BunPress logo - Fast documentation engine built with Bun"
     width="200"
     height="60"
     loading="lazy">

<!-- Image with structured data -->
<div itemscope itemtype="https://schema.org/ImageObject">
  <img src="/images/tutorial-screenshot.webp"
       alt="BunPress installation tutorial screenshot"
       width="800"
       height="600">
  <meta itemprop="name" content="BunPress Installation Tutorial">
  <meta itemprop="description" content="Step-by-step screenshot showing how to install BunPress">
</div>
```

## Analytics & Monitoring

### Search Console Integration

```typescript
export default {
  seo: {
    googleSiteVerification: 'your-verification-code',
    bingSiteVerification: 'your-bing-code'
  }
}
```

### Performance Monitoring

Track SEO performance:

```typescript
export default {
  analytics: {
    googleAnalytics: 'GA_MEASUREMENT_ID',
    plausibleAnalytics: true,
    performanceMonitoring: true
  }
}
```

## Mobile Optimization

### Responsive Design

Ensure mobile-friendly design:

```css
/* Mobile-first responsive design */
@media (max-width: 768px) {
  .content {
    padding: 1rem;
    font-size: 16px;
  }

  .sidebar {
    display: none;
  }
}
```

### Touch-Friendly Elements

```css
/* Touch-friendly buttons and links */
.button, .nav-link {
  min-height: 44px;
  min-width: 44px;
  padding: 0.75rem 1rem;
}
```

## Technical Implementation

### Server-Side Rendering

Enable SSR for better SEO:

```typescript
export default {
  ssr: {
    enabled: true,
    prerender: [
      '/', // Homepage
      '/guide/**', // All guide pages
      '/api/**' // All API pages
    ]
  }
}
```

### Dynamic Meta Tags

Generate meta tags dynamically:

```typescript
// Dynamic meta tag generation
function generateMetaTags(page: Page) {
  return {
    title: `${page.title} | BunPress`,
    description: page.description || 'Documentation built with BunPress',
    ogImage: generateOgImage(page.title),
    canonical: `https://bunpress.dev${page.path}`
  }
}
```

This comprehensive SEO strategy ensures your BunPress documentation ranks well in search engines and provides an excellent user experience.
