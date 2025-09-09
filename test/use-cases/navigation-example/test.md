# Navigation Example

This example demonstrates how to configure and use navigation in BunPress.

## Basic Navigation

Configure navigation in your `bunpress.config.ts`:

```typescript
export default {
  nav: [
    { text: 'Home', link: '/' },
    { text: 'Guide', link: '/guide' },
    { text: 'API', link: '/api' }
  ]
}
```

## Navigation with Icons

Add icons to your navigation items:

```typescript
export default {
  nav: [
    { text: 'Home', link: '/', icon: '🏠' },
    { text: 'GitHub', link: 'https://github.com', icon: '🐙' }
  ]
}
```

## Nested Navigation (Dropdowns)

Create nested navigation with dropdown menus:

```typescript
export default {
  nav: [
    {
      text: 'Guide',
      items: [
        { text: 'Getting Started', link: '/guide/getting-started' },
        { text: 'Advanced', link: '/guide/advanced' },
        { text: 'Examples', link: '/guide/examples' }
      ]
    },
    { text: 'API', link: '/api' }
  ]
}
```

## Active State Matching

Use `activeMatch` for pattern-based active states:

```typescript
export default {
  nav: [
    { text: 'Guide', link: '/guide/', activeMatch: '/guide' },
    { text: 'API', link: '/api/', activeMatch: '/api' }
  ]
}
```

## External Links

External links automatically get proper attributes:

```typescript
export default {
  nav: [
    { text: 'GitHub', link: 'https://github.com/example' },
    { text: 'Documentation', link: '/docs' }
  ]
}
```

## Responsive Navigation

The navigation is fully responsive with mobile support. On mobile devices, it collapses into a hamburger menu that can be toggled.

## Frontmatter Configuration

You can also configure navigation per page using frontmatter:

```yaml
---
nav:
  - text: Custom Page
    link: /custom
  - text: Another Link
    link: /another
---
```

## Features

- ✅ Active state detection
- ✅ Nested dropdown menus
- ✅ Icon support
- ✅ External link handling
- ✅ Mobile responsive
- ✅ Keyboard accessibility
- ✅ Active match patterns

## Try It Out

Configure your navigation and see how it automatically highlights the current page and provides smooth dropdown interactions!
