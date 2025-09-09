---
title: Frontmatter Example
description: Demonstrating various frontmatter configurations
author: BunPress Team
date: 2024-01-15
tags: [frontmatter, example, documentation]
category: examples
featured: true
layout: doc
toc: sidebar
tocTitle: Contents
search:
  enabled: true
  placeholder: Search this example...
themeConfig:
  colors:
    primary: '#10b981'
    secondary: '#6b7280'
    accent: '#f59e0b'
    background: '#ffffff'
    surface: '#f9fafb'
    text: '#111827'
    muted: '#6b7280'
  fonts:
    heading: 'Inter, system-ui, sans-serif'
    body: 'Inter, system-ui, sans-serif'
    mono: 'JetBrains Mono, ui-monospace, monospace'
  darkMode: true
  cssVars:
    'border-radius': '8px'
    'shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    'shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  css: |
    .custom-button {
      background: var(--color-primary);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: var(--border-radius);
      transition: all 0.2s;
    }

    .custom-button:hover {
      box-shadow: var(--shadow);
    }
nav:
  - text: Home
    link: /
  - text: Examples
    link: /examples
sidebar:
  - text: Getting Started
    link: /getting-started
  - text: Frontmatter
    link: /frontmatter
    items:
      - text: Basic Fields
        link: /frontmatter#basic-fields
      - text: Advanced Configuration
        link: /frontmatter#advanced-configuration
---

# Frontmatter Example

This example demonstrates how to use frontmatter to configure your BunPress documentation pages.

## Basic Fields

Frontmatter allows you to define metadata for your pages:

- **Title**: Sets the page title and HTML `<title>` tag
- **Description**: Used for meta description and SEO
- **Author**: Attribution for the page content
- **Date**: Publication or last modified date
- **Tags**: Array of keywords for categorization

## Advanced Configuration

### Layout Configuration

```yaml
layout: doc # or 'home' for landing pages
```

### Table of Contents

```yaml
toc: sidebar # Position: 'sidebar', 'floating', or false
tocTitle: Contents # Custom title for TOC
```

### Search Configuration

```yaml
search:
  enabled: true
  placeholder: Search this example...
```

### Theme Configuration

```yaml
themeConfig:
  colors:
    primary: '#10b981'
    secondary: '#6b7280'
  nav:
    - text: Home
      link: /
    - text: Examples
      link: /examples
```

### Sidebar Configuration

```yaml
sidebar:
  - text: Getting Started
    link: /getting-started
  - text: Frontmatter
    link: /frontmatter
    items:
      - text: Basic Fields
        link: /frontmatter#basic-fields
      - text: Advanced Configuration
        link: /frontmatter#advanced-configuration
```

## Custom Fields

You can also define custom fields that will be available in your templates:

```yaml
featured: true
category: examples
priority: high
```

These custom fields can be accessed in your templates using `{{$frontmatter.featured}}` or similar syntax.

## Best Practices

1. **Keep it organized**: Use consistent field names across your documentation
2. **Use meaningful values**: Choose descriptive titles and descriptions
3. **Leverage categories**: Use tags and categories for better organization
4. **Configure appropriately**: Only enable features you need (TOC, search, etc.)

This frontmatter configuration will generate a well-structured documentation page with navigation, sidebar, search, and proper metadata.
