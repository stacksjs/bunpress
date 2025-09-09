---
title: Sidebar Configuration Example
description: Comprehensive sidebar configuration and navigation examples for BunPress
author: BunPress Team
layout: doc
toc: sidebar
sidebar:
  - text: Overview
    link: /sidebar-example#overview
  - text: Basic Sidebar
    link: /sidebar-example#basic-sidebar
  - text: Nested Groups
    link: /sidebar-example#nested-groups
  - text: Collapsible Sections
    link: /sidebar-example#collapsible-sections
  - text: Custom Links
    link: /sidebar-example#custom-links
  - text: Active States
    link: /sidebar-example#active-states
  - text: Mobile Navigation
    link: /sidebar-example#mobile-navigation
---

# Sidebar Configuration Example

This example demonstrates various sidebar configurations and navigation patterns available in BunPress.

## Overview

The sidebar is a crucial navigation component that helps users:

- **Navigate content hierarchy** - Clear structure and organization
- **Find related content** - Quick access to related topics
- **Track progress** - Visual indication of current location
- **Mobile-friendly navigation** - Responsive design for all devices

## Basic Sidebar

### Simple Flat Structure

```yaml
---
sidebar:
  - text: Getting Started
    link: /guide/getting-started
  - text: Installation
    link: /guide/installation
  - text: Configuration
    link: /guide/configuration
  - text: API Reference
    link: /api/
  - text: Examples
    link: /examples/
---
```

### With Frontmatter Configuration

```yaml
---
title: My Documentation
sidebar:
  - text: Home
    link: /
  - text: Guide
    link: /guide/
  - text: API
    link: /api/
  - text: Examples
    link: /examples/
---
```

## Nested Groups

### Grouped Navigation

```yaml
---
sidebar:
  - text: Getting Started
    items:
      - text: Introduction
        link: /guide/introduction
      - text: Quick Start
        link: /guide/quick-start
      - text: Installation
        link: /guide/installation

  - text: Core Concepts
    items:
      - text: Configuration
        link: /guide/configuration
      - text: Plugins
        link: /guide/plugins
      - text: Themes
        link: /guide/themes

  - text: Advanced
    items:
      - text: Performance
        link: /guide/performance
      - text: Deployment
        link: /guide/deployment
      - text: Troubleshooting
        link: /guide/troubleshooting
---
```

### Multi-level Nesting

```yaml
---
sidebar:
  - text: Guide
    items:
      - text: Basics
        items:
          - text: Installation
            link: /guide/installation
          - text: Configuration
            link: /guide/configuration
      - text: Advanced
        items:
          - text: Plugins
            link: /guide/plugins
          - text: Custom Themes
            link: /guide/themes
  - text: API
    items:
      - text: Core API
        link: /api/core
      - text: Plugins API
        link: /api/plugins
---
```

## Collapsible Sections

### Auto-collapsible Groups

```yaml
---
sidebar:
  - text: Getting Started
    collapsed: false  # Always expanded
    items:
      - text: Introduction
        link: /guide/introduction
      - text: Quick Start
        link: /guide/quick-start

  - text: Advanced Topics
    collapsed: true   # Collapsed by default
    items:
      - text: Performance Tuning
        link: /guide/performance
      - text: Custom Plugins
        link: /guide/plugins
---
```

### Dynamic Collapsing

```typescript
// In your bunpress.config.ts
export default {
  sidebar: {
    autoCollapse: true,        // Auto-collapse other groups when one is opened
    rememberState: true,      // Remember collapse state in localStorage
    animate: true             // Smooth collapse/expand animations
  }
}
```

## Custom Links

### External Links

```yaml
---
sidebar:
  - text: Documentation
    link: /guide/
  - text: GitHub Repository
    link: https://github.com/bunpress/bunpress
    target: _blank
  - text: Discord Community
    link: https://discord.gg/bunpress
    target: _blank
---
```

### Link with Icons

```yaml
---
sidebar:
  - text: Home
    link: /
    icon: home
  - text: Guide
    link: /guide/
    icon: book
  - text: API
    link: /api/
    icon: code
  - text: GitHub
    link: https://github.com/bunpress/bunpress
    icon: github
    target: _blank
---
```

### Conditional Links

```typescript
// Dynamic sidebar generation
function generateSidebar(currentUser) {
  const sidebar = [
    { text: 'Home', link: '/' },
    { text: 'Guide', link: '/guide/' }
  ]

  if (currentUser.isAdmin) {
    sidebar.push({
      text: 'Admin Panel',
      link: '/admin/',
      icon: 'settings'
    })
  }

  if (currentUser.hasProAccess) {
    sidebar.push({
      text: 'Pro Features',
      link: '/pro/',
      icon: 'star'
    })
  }

  return sidebar
}
```

## Active States

### Automatic Active Detection

The sidebar automatically detects the current page and highlights:

```yaml
sidebar:
  - text: Getting Started
    link: /guide/getting-started    # Active when on this page
  - text: Installation
    link: /guide/installation       # Active when on this page
  - text: Configuration
    link: /guide/configuration      # Active when on this page
```

### Active State Styling

```css
/* Custom active state styles */
.sidebar-link.active {
  background-color: #3b82f6;
  color: white;
  font-weight: 600;
  border-radius: 6px;
}

.sidebar-link.active::before {
  content: '▶';
  margin-right: 8px;
  color: white;
}
```

### Custom Active Logic

```typescript
// Custom active state detection
function isLinkActive(link: string, currentPath: string): boolean {
  // Exact match
  if (link === currentPath) return true

  // Parent directory match
  if (currentPath.startsWith(link) && link !== '/') return true

  // Custom logic for index pages
  if (currentPath === '/' && link === '/guide/') return true

  return false
}
```

## Mobile Navigation

### Responsive Sidebar

The sidebar automatically adapts to mobile devices:

```css
/* Mobile sidebar styles */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -280px;
    top: 60px;
    width: 280px;
    height: calc(100vh - 60px);
    background: white;
    border-right: 1px solid #e5e7eb;
    transition: left 0.3s ease;
    z-index: 1000;
  }

  .sidebar.open {
    left: 0;
  }

  .sidebar-overlay {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s;
  }

  .sidebar-overlay.visible {
    opacity: 1;
    visibility: visible;
  }
}
```

### Mobile Toggle Button

```html
<!-- Mobile menu toggle -->
<button class="sidebar-toggle" aria-label="Toggle sidebar">
  <svg class="hamburger-icon" viewBox="0 0 24 24">
    <path d="M3 12h18M3 6h18M3 18h18"/>
  </svg>
</button>
```

### Touch Gestures

```typescript
// Swipe gestures for mobile
let startX = 0
let currentX = 0
let isDragging = false

document.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX
  isDragging = true
})

document.addEventListener('touchmove', (e) => {
  if (!isDragging) return

  currentX = e.touches[0].clientX
  const diff = currentX - startX

  // Swipe from left edge to open sidebar
  if (startX < 20 && diff > 50) {
    openSidebar()
  }

  // Swipe right to close sidebar
  if (diff < -50) {
    closeSidebar()
  }
})

document.addEventListener('touchend', () => {
  isDragging = false
})
```

## Advanced Configuration

### Dynamic Sidebar Generation

```typescript
// Generate sidebar from file system
import { readdirSync, statSync } from 'fs'
import { join } from 'path'

function generateSidebarFromFiles(dir: string): SidebarItem[] {
  const items: SidebarItem[] = []

  const files = readdirSync(dir).sort()

  for (const file of files) {
    const filePath = join(dir, file)
    const stat = statSync(filePath)

    if (stat.isDirectory()) {
      // Create group for directory
      items.push({
        text: file.charAt(0).toUpperCase() + file.slice(1),
        items: generateSidebarFromFiles(filePath)
      })
    } else if (file.endsWith('.md')) {
      // Create link for markdown file
      const name = file.replace('.md', '')
      items.push({
        text: name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' '),
        link: `/${name}`
      })
    }
  }

  return items
}

// Usage
export default {
  sidebar: generateSidebarFromFiles('./docs')
}
```

### Sidebar with Search

```typescript
// Sidebar with integrated search
export default {
  sidebar: {
    search: {
      enabled: true,
      placeholder: 'Search documentation...',
      debounce: 300
    },
    items: [
      // Your sidebar items
    ]
  }
}
```

### Custom Sidebar Component

```typescript
// Custom sidebar component
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'CustomSidebar',
  setup() {
    const collapsed = ref(false)
    const searchQuery = ref('')

    const toggleCollapse = () => {
      collapsed.value = !collapsed.value
    }

    const filteredItems = computed(() => {
      if (!searchQuery.value) return sidebarItems

      return sidebarItems.filter(item =>
        item.text.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    })

    return {
      collapsed,
      searchQuery,
      filteredItems,
      toggleCollapse
    }
  }
})
```

## Best Practices

### Sidebar Organization

1. **Logical Grouping** - Group related content together
2. **Consistent Naming** - Use consistent naming conventions
3. **Progressive Disclosure** - Show important items first
4. **Clear Hierarchy** - Use clear visual hierarchy
5. **Mobile First** - Design for mobile, enhance for desktop

### Performance Considerations

```typescript
// Lazy load sidebar content
export default {
  sidebar: {
    lazyLoad: true,           // Load sidebar content on demand
    cache: true,              // Cache sidebar state
    prefetch: true           // Prefetch linked pages
  }
}
```

### Accessibility

```typescript
// Accessible sidebar
export default {
  sidebar: {
    ariaLabel: 'Main navigation',
    keyboardNavigation: true,
    skipLink: {
      enabled: true,
      text: 'Skip to main content'
    }
  }
}
```

This comprehensive sidebar configuration provides flexible navigation patterns for any documentation site.
