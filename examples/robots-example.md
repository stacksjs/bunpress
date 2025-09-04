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

### Blog/CMS Site

```typescript
export default {
  robots: {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/wp-admin/', '/wp-includes/', '/wp-content/uploads/']
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/wp-content/uploads/']
      }
    ],
    sitemaps: [
      'https://blog.example.com/sitemap.xml',
      'https://blog.example.com/sitemap-posts.xml'
    ],
    host: 'blog.example.com'
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

## Frontmatter Robots Configuration

### Page-Specific Rules

```yaml
---
title: Private API Documentation
description: Internal API documentation
robots:
  - userAgent: '*'
    disallow: ['/api/internal/']
  - userAgent: 'Googlebot'
    disallow: ['/api/internal/', '/api/debug/']
---

# Private API Documentation

This documentation is for internal use only.
```

### Allow Specific Crawlers

```yaml
---
title: Beta Feature Documentation
description: Documentation for beta features
robots:
  - userAgent: 'Googlebot'
    allow: ['/beta/']
  - userAgent: '*'
    disallow: ['/beta/']
---

# Beta Features

These features are in beta and may change.
```

## Crawl Delay Configuration

### Global Crawl Delay

```typescript
export default {
  robots: {
    rules: [
      {
        userAgent: '*',
        crawlDelay: 5  // Wait 5 seconds between requests
      },
      {
        userAgent: 'Googlebot',
        crawlDelay: 1  // Faster crawling for Google
      }
    ]
  }
}
```

### Path-Specific Delays

```typescript
export default {
  robots: {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/api/'],
        crawlDelay: 10
      },
      {
        userAgent: 'Googlebot',
        allow: ['/api/search/'],
        disallow: ['/api/admin/'],
        crawlDelay: 1
      }
    ]
  }
}
```

## Multi-Sitemap Support

### Multiple Sitemaps

```typescript
export default {
  robots: {
    sitemaps: [
      'https://example.com/sitemap.xml',
      'https://example.com/sitemap-blog.xml',
      'https://example.com/sitemap-products.xml'
    ]
  }
}
```

### Sitemap Index

```typescript
export default {
  sitemap: {
    useSitemapIndex: true,
    maxUrlsPerFile: 50000
  },
  robots: {
    sitemaps: ['https://example.com/sitemap-index.xml']
  }
}
```

## Host Directive

### Primary Domain

```typescript
export default {
  robots: {
    host: 'www.example.com'  // Prefer www version
  }
}
```

### Non-www Domain

```typescript
export default {
  robots: {
    host: 'example.com'  // Prefer non-www version
  }
}
```

## Custom Content

### Additional Directives

```typescript
export default {
  robots: {
    customContent: `
# Custom directives
Disallow: /temp/
Disallow: /backup/
Allow: /public/

# Crawl-delay for all bots
Crawl-delay: 5
    `
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

### Monitoring and Maintenance

1. **Regular Review:**
   - Review robots.txt after major site changes
   - Update sitemap URLs when structure changes
   - Monitor crawl errors in Search Console

2. **Performance Considerations:**
   - Use crawl delays to prevent server overload
   - Allow important pages to be crawled quickly
   - Block unnecessary or duplicate content

3. **International SEO:**

   ```typescript
   robots: {
     rules: [{
       userAgent: '*',
       allow: ['/'],
       disallow: ['/admin/', '/private/']
     }],
     host: 'example.com',
     customContent: `

# International versions

Allow: /es/
Allow: /fr/
Allow: /de/
     `
   }

   ```

## Complete Example

### Large E-commerce Site

```typescript
export default {
  sitemap: {
    enabled: true,
    baseUrl: 'https://shop.example.com',
    maxUrlsPerFile: 50000,
    useSitemapIndex: true,
    exclude: ['/checkout/**', '/cart/**', '/account/**']
  },
  robots: {
    rules: [
      {
        userAgent: '*',
        allow: ['/products/', '/categories/', '/blog/'],
        disallow: ['/checkout/', '/cart/', '/account/', '/admin/', '/api/']
      },
      {
        userAgent: 'Googlebot',
        allow: ['/sitemap.xml'],
        crawlDelay: 1
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/images/products/']
      }
    ],
    sitemaps: [
      'https://shop.example.com/sitemap-index.xml',
      'https://shop.example.com/sitemap-products.xml',
      'https://shop.example.com/sitemap-blog.xml'
    ],
    host: 'shop.example.com',
    customContent: `
# Additional rules for crawlers
Disallow: /search?
Disallow: /filter?
Allow: /public/
    `
  }
}
```

This configuration provides comprehensive crawling control for a large e-commerce site, ensuring search engines can efficiently discover and index important content while protecting sensitive areas.
