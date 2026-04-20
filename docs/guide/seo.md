---
title: SEO Configuration
description: Optimize your documentation for search engines
---

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

description: Learn how to install and configure BunPress, the lightning-fast documentation generator, in under 5 minutes
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
