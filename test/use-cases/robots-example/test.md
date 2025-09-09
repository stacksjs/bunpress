---
title: Robots.txt Configuration Examples
description: Complete guide to robots.txt configuration in BunPress
priority: 0.8
changefreq: monthly
---

# Robots.txt Configuration Examples

Learn how to configure search engine crawling behavior with BunPress robots.txt generation.

## Basic Robots.txt

### Default Configuration

```typescript
export default {
  robots: {
    enabled: true,
    filename: 'robots.txt'
  }
}
```

Generates:

```
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
```

## Advanced Configuration

### Custom User-Agent Rules

```typescript
export default {
  robots: {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/private/', '/admin/', '/api/']
      },
      {
        userAgent: 'Googlebot',
        allow: ['/'],
        disallow: ['/admin/', '/private/'],
        crawlDelay: 1
      },
      {
        userAgent: 'Bingbot',
        allow: ['/'],
        disallow: ['/admin/'],
        crawlDelay: 2
      }
    ],
    sitemaps: ['https://example.com/sitemap.xml'],
    host: 'example.com'
  }
}
```

Generates:

```
User-agent: *
Allow: /
Disallow: /private/
Disallow: /admin/
Disallow: /api/

User-agent: Googlebot
Allow: /
Disallow: /admin/
Disallow: /private/
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Disallow: /admin/
Crawl-delay: 2

Host: example.com
Sitemap: https://example.com/sitemap.xml
```

## Common Use Cases

### E-commerce Site

```typescript
export default {
  robots: {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [
          '/checkout/',
          '/cart/',
          '/account/',
          '/admin/',
          '/api/',
          '/search?'
        ]
      },
      {
        userAgent: 'Googlebot',
        allow: ['/'],
        disallow: ['/admin/', '/api/'],
        crawlDelay: 1
      }
    ],
    sitemaps: ['https://shop.example.com/sitemap.xml'],
    host: 'shop.example.com'
  }
}
```

### Documentation Site

```typescript
export default {
  robots: {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/admin/', '/private/', '/api/', '/_next/']
      },
      {
        userAgent: 'Googlebot',
        allow: ['/'],
        disallow: ['/admin/', '/private/'],
        crawlDelay: 1
      }
    ],
    sitemaps: ['https://docs.example.com/sitemap.xml'],
    host: 'docs.example.com'
  }
}
```

## Testing Robots.txt

### Validate Your Robots.txt

1. **Online Validators:**
   - [Google Robots Testing Tool](https://www.google.com/webmasters/tools/robots-testing-tool)
   - [Robots.txt Validator](https://technicalseo.com/tools/robots-txt/)

2. **Manual Testing:**

   ```bash
   # Check if robots.txt is accessible
   curl -s https://yourdomain.com/robots.txt

   # Test specific user-agent
   curl -A "Googlebot" https://yourdomain.com/page.html
   ```

### Common Issues

#### 1. Blocking Important Pages

```txt
# ❌ Bad: Blocking the entire site
User-agent: *
Disallow: /

# ✅ Good: Allow crawling but block admin
User-agent: *
Allow: /
Disallow: /admin/
```

#### 2. Missing Sitemap

```txt
# ❌ Missing sitemap reference
User-agent: *
Allow: /

# ✅ Include sitemap
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
```

#### 3. Inconsistent Host

```txt
# ❌ Different hosts in sitemap vs robots.txt
Host: example.com
Sitemap: https://www.example.com/sitemap.xml

# ✅ Consistent host
Host: example.com
Sitemap: https://example.com/sitemap.xml
```

## Best Practices

### SEO-Friendly Configuration

1. **Allow Important Content:**

   ```typescript
   robots: {
     rules: [{
       userAgent: '*',
       allow: ['/blog/', '/docs/', '/products/'],
       disallow: ['/admin/', '/api/', '/private/']
     }]
   }
   ```

2. **Set Appropriate Crawl Delays:**

   ```typescript
   robots: {
     rules: [{
       userAgent: 'Googlebot',
       crawlDelay: 1  // Fast for major search engines
     }, {
       userAgent: '*',
       crawlDelay: 5  // Slower for others
     }]
   }
   ```

3. **Include All Sitemaps:**

   ```typescript
   robots: {
     sitemaps: [
       'https://example.com/sitemap.xml',
       'https://example.com/sitemap-blog.xml',
       'https://example.com/sitemap-images.xml'
     ]
   }
   ```

This configuration provides comprehensive crawling control for documentation sites, ensuring search engines can efficiently discover and index important content while protecting sensitive areas.
