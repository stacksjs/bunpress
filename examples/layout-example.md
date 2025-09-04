# Layout Examples

This example demonstrates the different layout variants available in BunPress.

## Home Layout

The home layout is perfect for landing pages and showcases your project with hero sections and feature highlights.

```yaml
---
layout: home
hero:
  name: "MyProject"
  text: "Amazing documentation engine"
  tagline: "Built with Bun for incredible performance"
  actions:
    - theme: brand
      text: Get Started
      link: /guide
    - theme: alt
      text: View on GitHub
      link: https://github.com

features:
  - title: "Lightning Fast"
    icon: "⚡"
    details: "Powered by Bun runtime for blazing performance"
  - title: "Rich Markdown"
    icon: "📝"
    details: "Enhanced markdown with syntax highlighting and extensions"
  - title: "Developer Friendly"
    icon: "🛠"
    details: "TypeScript support and extensive customization"
---

# Welcome to MyProject

Additional content goes here and will be styled with the home layout.
```

## Doc Layout (Default)

The doc layout is the default layout with a sidebar for navigation and a main content area.

```yaml
---
layout: doc
---

# Documentation Page

This page uses the default documentation layout with sidebar navigation.

## Features

- Sidebar navigation
- Table of contents
- Search functionality
- Responsive design
```

## Page Layout

The page layout is for standalone pages without sidebar navigation, perfect for about pages, contact forms, etc.

```yaml
---
layout: page
---

# About Us

This is a standalone page without sidebar navigation.

## Our Mission

We build amazing tools for developers.

## Contact

Get in touch with us at contact@example.com
```

## Layout Features

### Home Layout Features

- **Hero Section**: Large title, tagline, and action buttons
- **Features Grid**: Highlight key features with icons and descriptions
- **Full Width**: Takes advantage of the full viewport width
- **Responsive**: Adapts beautifully to all screen sizes

### Doc Layout Features

- **Sidebar Navigation**: Collapsible navigation with active states
- **Table of Contents**: Auto-generated TOC with smooth scrolling
- **Search**: Integrated search functionality
- **Mobile Responsive**: Sidebar becomes overlay on mobile

### Page Layout Features

- **Clean Design**: Minimal layout without distractions
- **Full Width Content**: Maximum space for your content
- **Flexible**: Perfect for custom pages and landing pages

## Layout Configuration

### Global Layout Settings

Configure default layouts in your `bunpress.config.ts`:

```typescript
export default {
  markdown: {
    // Default layout for all pages
    // Can be overridden per page with frontmatter
    layout: 'doc'
  }
}
```

### Per-Page Layout Override

Override the default layout for specific pages:

```yaml
---
layout: home  # Override to use home layout
---

# Custom Home Page
```

## Responsive Behavior

All layouts are fully responsive:

- **Desktop**: Full sidebar and navigation
- **Tablet**: Collapsible sidebar with overlay
- **Mobile**: Hamburger menu and stacked layout

## Custom Styling

Each layout can be customized with CSS:

```css
/* Home layout custom styles */
body[data-layout="home"] .hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Doc layout custom styles */
body[data-layout="doc"] .sidebar {
  background: #f8fafc;
}

/* Page layout custom styles */
body[data-layout="page"] .markdown-body {
  font-size: 1.1rem;
  line-height: 1.7;
}
```

## Try It Out

Create pages with different layouts and see how BunPress automatically applies the appropriate styling and structure for each layout type!
