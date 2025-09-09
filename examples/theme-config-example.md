---
title: Theme Configuration Example
description: Demonstrating theme customization in BunPress
author: BunPress Team
layout: doc
toc: sidebar
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
---

# Theme Configuration Example

This example showcases how to customize the appearance of your BunPress documentation using theme configuration.

## Color Customization

BunPress supports comprehensive color theming:

```yaml
themeConfig:
  colors:
    primary: '#10b981' # Main brand color
    secondary: '#6b7280' # Secondary elements
    accent: '#f59e0b' # Highlights and accents
    background: '#ffffff' # Page background
    surface: '#f9fafb' # Cards, sidebars, etc.
    text: '#111827' # Primary text color
    muted: '#6b7280' # Secondary text color
```

## Typography

Customize fonts for different text elements:

```yaml
themeConfig:
  fonts:
    heading: 'Inter, system-ui, sans-serif' # Headings (H1-H6)
    body: 'Inter, system-ui, sans-serif' # Body text
    mono: 'JetBrains Mono, ui-monospace, monospace' # Code blocks
```

## Dark Mode Support

Enable dark mode for better readability in low-light conditions:

```yaml
themeConfig:
  darkMode: true # 'auto', 'true', or 'false'
```

## Custom CSS Variables

Define custom CSS variables for consistent styling:

```yaml
themeConfig:
  cssVars:
    border-radius: 8px
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    shadow-lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
```

## Custom CSS

Add custom CSS rules directly in your frontmatter:

```yaml
themeConfig:
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
```

## Example Implementation

Here's how the above configuration looks when applied:

<div class="custom-button">
  Custom Styled Button
</div>

## Navigation Theming

The theme configuration also affects navigation elements:

```yaml
themeConfig:
  nav:
    - text: Home
      link: /
      icon: 🏠
    - text: Docs
      link: /docs
      icon: 📚
```

## Responsive Design

All theme configurations are responsive and work across different screen sizes. The color scheme, typography, and spacing automatically adapt to mobile devices.

## Best Practices

1. **Choose accessible colors**: Ensure good contrast ratios for readability
2. **Use consistent spacing**: Leverage CSS variables for consistent spacing
3. **Test in both modes**: If using dark mode, test both light and dark themes
4. **Keep it simple**: Start with minimal customizations and add as needed

## Global Configuration

For site-wide theme configuration, you can also set these options in your `bunpress.config.ts`:

```typescript
export default {
  markdown: {
    themeConfig: {
      colors: {
        primary: '#10b981',
        // ... other colors
      },
      fonts: {
        heading: 'Inter, sans-serif',
        // ... other fonts
      }
    }
  }
}
```

Frontmatter configuration will override global settings, allowing for page-specific theming when needed.
