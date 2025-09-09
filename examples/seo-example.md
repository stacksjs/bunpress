---
title: SEO Optimization Examples
description: Complete guide to SEO optimization with BunPress
priority: 0.9
changefreq: monthly
---

# SEO Optimization Examples

This document demonstrates various SEO optimization techniques available in BunPress.

## Frontmatter SEO Configuration

### Basic SEO Meta Tags

```yaml
---
title: Page Title
description: Brief description for search engines (150-160 characters)
keywords: keyword1, keyword2, keyword3
author: Author Name
date: 2024-01-01
lastmod: 2024-01-15
---

# Page Content

Your page content here...
```

### Sitemap Configuration

```yaml
---
title: Important Page
description: This page is very important
priority: 0.9 # High priority (0.0-1.0)
changefreq: weekly # Update frequency
lastmod: 2024-01-01 # Last modification date
sitemap: true # Include in sitemap (default: true)
---

# Important Content

This content will have high priority in search engines.
```

### Robots Configuration

```yaml
---
title: Private Page
description: This page should not be crawled
sitemap: false # Exclude from sitemap
robots:
  - userAgent: '*'
    disallow: [/private/]
---

# Private Content

This content is not intended for search engines.
```

## Page Structure for SEO

### Proper Heading Hierarchy

```markdown
# Main Page Title (H1)

## Section Title (H2)

### Subsection Title (H3)

Content for this subsection...

## Another Section (H2)

### Another Subsection (H3)

More content here...
```

### Semantic HTML Structure

```markdown
# Product Documentation

## Overview

Brief overview of the product.

## Features

- Feature 1: Description
- Feature 2: Description
- Feature 3: Description

## Installation

Step-by-step installation guide.

## Usage

How to use the product effectively.

## API Reference

Detailed API documentation.
```

## Content Optimization

### Keyword Optimization

Use relevant keywords naturally in:

- Page titles
- Headings (H1-H6)
- First paragraph
- Image alt texts
- Meta descriptions

### Internal Linking

Link to related pages within your documentation:

```markdown
For more information about [installation](/docs/installation),
see our [getting started guide](/docs/getting-started).

Learn about [advanced features](/docs/advanced) for power users.
```

### Image Optimization

Always include descriptive alt text:

```markdown
![Installation wizard showing setup steps](/images/installation-wizard.png)

![API response format example](/images/api-response.png)
```

## Technical SEO

### URL Structure

Clean, descriptive URLs are automatically generated:

```
/docs/getting-started.html
/docs/advanced/features.html
/blog/2024/01/new-features.html
```

### Meta Tags

Comprehensive meta tags are generated automatically:

```html
<meta name="description" content="Brief page description">
<meta name="keywords" content="keyword1, keyword2">
<meta name="author" content="Author Name">
<meta name="robots" content="index, follow">
```

### Structured Data

Add JSON-LD structured data for rich snippets:

```yaml
---
title: Product Page
description: Product description
structuredData:
  '@context': 'https://schema.org'
  '@type': SoftwareApplication
  name: Product Name
  description: Product description
  applicationCategory: DeveloperApplication
---

# Product Name

Product description and features.
```

## Performance Optimization

### Image Optimization

Use optimized images with proper formats:

```markdown
<!-- Use WebP for modern browsers -->
![Logo](/images/logo.webp)

<!-- Provide fallbacks for older browsers -->
<picture>
  <source srcset="/images/logo.webp" type="image/webp">
  <img src="/images/logo.png" alt="Logo">
</picture>
```

### Code Splitting

Large documentation sites benefit from automatic code splitting and lazy loading.

## Mobile Optimization

### Responsive Design

BunPress generates mobile-friendly HTML with proper viewport meta tags:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Touch-Friendly Navigation

Mobile-optimized navigation with proper touch targets and gestures.

## Monitoring and Analytics

### Search Console Integration

Submit your sitemap to Google Search Console:

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property
3. Submit your sitemap: `https://yourdomain.com/sitemap.xml`

### Analytics Tracking

Add analytics tracking to your configuration:

```typescript
export default {
  scripts: [
    '/js/analytics.js',
    'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID'
  ]
}
```

## Best Practices Summary

### On-Page SEO

- ✅ Unique, descriptive page titles
- ✅ Compelling meta descriptions
- ✅ Proper heading hierarchy (H1-H6)
- ✅ Internal linking strategy
- ✅ Image optimization with alt text
- ✅ Mobile-friendly design

### Technical SEO

- ✅ Clean URL structure
- ✅ Fast loading times
- ✅ XML sitemap submission
- ✅ Robots.txt configuration
- ✅ HTTPS implementation
- ✅ Structured data markup

### Content SEO

- ✅ High-quality, valuable content
- ✅ Natural keyword usage
- ✅ Regular content updates
- ✅ User intent optimization
- ✅ Internal linking structure

## Configuration Examples

### Global SEO Configuration

```typescript
// bunpress.config.ts
export default {
  title: 'My Documentation',
  description: 'Complete documentation for My Project',
  sitemap: {
    enabled: true,
    baseUrl: 'https://docs.myproject.com',
    priorityMap: {
      '/': 1.0,
      '/docs/**': 0.8,
      '/blog/**': 0.6
    }
  },
  robots: {
    enabled: true,
    host: 'docs.myproject.com'
  }
}
```

### Page-Specific SEO

```yaml
---
title: Advanced Configuration Guide
description: Learn advanced configuration options for maximum performance
keywords: configuration, advanced, performance, optimization
priority: 0.8
changefreq: monthly
author: Documentation Team
date: 2024-01-01
lastmod: 2024-01-15
---

# Advanced Configuration

Learn how to configure the system for optimal performance...
```
