# Sidebar Example

This example demonstrates how to configure and use sidebar navigation in BunPress.

## Basic Sidebar

Configure sidebar in your `bunpress.config.ts`:

```typescript
export default {
  markdown: {
    sidebar: {
      '/': [
        { text: 'Home', link: '/' },
        { text: 'Guide', link: '/guide' },
        { text: 'API', link: '/api' }
      ]
    }
  }
}
```

## Sidebar with Groups

Create collapsible sidebar groups:

```typescript
export default {
  markdown: {
    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/intro' },
            { text: 'Installation', link: '/install' },
            { text: 'Quick Start', link: '/quick-start' }
          ]
        },
        {
          text: 'Guide',
          items: [
            { text: 'Configuration', link: '/config' },
            { text: 'Advanced', link: '/advanced' }
          ]
        },
        { text: 'API Reference', link: '/api' }
      ]
    }
  }
}
```

## Deeply Nested Sidebar

Support for multiple levels of nesting:

```typescript
export default {
  markdown: {
    sidebar: {
      '/': [
        {
          text: 'Level 1',
          items: [
            {
              text: 'Level 2',
              items: [
                { text: 'Level 3', link: '/level3' },
                { text: 'Another Level 3', link: '/another-level3' }
              ]
            },
            { text: 'Direct Level 2', link: '/direct-level2' }
          ]
        }
      ]
    }
  }
}
```

## Active State Detection

The sidebar automatically highlights the current page:

- Links matching the current path get the `sidebar-active` class
- Parent groups of active items are automatically expanded
- Active items are visually distinguished with color and background

## Responsive Design

The sidebar is fully responsive:

- **Desktop**: Fixed sidebar on the left side
- **Tablet**: Collapsible sidebar with overlay
- **Mobile**: Hidden by default, accessible via navigation toggle

## Frontmatter Configuration

You can also configure sidebar per page:

```yaml
---
sidebar:
  - text: Page Specific
    link: /page-specific
  - text: Another Item
    link: /another
---
```

## Features

- ✅ Collapsible groups with smooth animations
- ✅ Active state highlighting
- ✅ Auto-expansion of active groups
- ✅ Multiple nesting levels
- ✅ Mobile responsive
- ✅ Keyboard accessibility
- ✅ Customizable via configuration

## Try It Out

Configure your sidebar and see how it automatically organizes your content with collapsible sections and smooth interactions!
