---
title: Table of Contents Example
description: Comprehensive table of contents configuration and navigation examples for BunPress
author: BunPress Team
layout: doc
toc: sidebar
sidebar:
  - text: Overview
    link: /table-of-contents-example#overview
  - text: Basic TOC
    link: /table-of-contents-example#basic-toc
  - text: Advanced Configuration
    link: /table-of-contents-example#advanced-configuration
  - text: Custom Styling
    link: /table-of-contents-example#custom-styling
  - text: Floating TOC
    link: /table-of-contents-example#floating-toc
  - text: Mobile Navigation
    link: /table-of-contents-example#mobile-navigation
  - text: Accessibility
    link: /table-of-contents-example#accessibility
---

# Table of Contents Example

This example demonstrates comprehensive table of contents functionality in BunPress, providing users with clear navigation and document structure.

## Overview

Table of contents (TOC) is essential for:

- **Document navigation** - Quick access to sections
- **Content overview** - Understanding document structure
- **User experience** - Better content discovery
- **SEO benefits** - Structured content for search engines
- **Accessibility** - Screen reader navigation

## Basic TOC

### Automatic Generation

BunPress automatically generates TOC from heading structure:

```markdown
# Main Title (H1)
## Section One (H2)
### Subsection (H3)
## Section Two (H2)
### Another Subsection (H3)
#### Deep Subsection (H4)
```

### Frontmatter Configuration

Control TOC behavior through frontmatter:

```yaml
---
toc: true              # Enable TOC (default: true)
tocTitle: "Contents"   # Custom title (default: "Table of Contents")
tocDepth: 3           # Maximum depth (default: 3)
tocPosition: sidebar  # Position: sidebar, floating, or false
---
```

### Sidebar TOC

The most common TOC position:

```yaml
---
toc: sidebar
tocTitle: "On This Page"
---
```

## Advanced Configuration

### Custom Depth Control

```typescript
// In bunpress.config.ts
export default {
  markdown: {
    toc: {
      enabled: true,
      position: 'sidebar',    // 'sidebar', 'floating', or false
      title: 'Contents',      // Custom title
      depth: 4,              // Maximum heading depth (1-6)
      ignore: ['toc-ignore'], // CSS classes to ignore
      ordered: false,        // Use ordered lists (ol) instead of unordered (ul)
      collapsible: true,     // Allow collapsing sections
      smoothScroll: true     // Enable smooth scrolling to sections
    }
  }
}
```

### Selective Heading Inclusion

```markdown
# Included in TOC

## Also Included

### Still Included

## Not in TOC {#toc-ignore}

### This subsection is also ignored {#toc-ignore}

## Back to TOC

### This is included again
```

### Custom TOC Generation

```typescript
// Custom TOC generation logic
function generateCustomTOC(headings: Heading[]): TocItem[] {
  return headings
    .filter(heading => !heading.ignore)
    .map(heading => ({
      text: heading.text,
      link: `#${heading.id}`,
      level: heading.level,
      children: generateCustomTOC(heading.children || [])
    }))
}
```

## Custom Styling

### CSS Customization

```css
/* Custom TOC styles */
.table-of-contents {
  position: sticky;
  top: 2rem;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
}

.toc-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.toc-link {
  color: #6b7280;
  text-decoration: none;
  display: block;
  padding: 0.25rem 0;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  border-left: 2px solid transparent;
}

.toc-link:hover {
  color: #374151;
  background-color: rgba(0, 0, 0, 0.05);
  border-left-color: #3b82f6;
}

.toc-active .toc-link {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.1);
  border-left-color: #3b82f6;
  font-weight: 500;
}
```

### Theme Integration

```typescript
// Theme-aware TOC styling
const tocTheme = {
  light: {
    background: '#ffffff',
    text: '#374151',
    active: '#3b82f6',
    hover: 'rgba(0, 0, 0, 0.05)'
  },
  dark: {
    background: '#1f2937',
    text: '#d1d5db',
    active: '#60a5fa',
    hover: 'rgba(255, 255, 255, 0.05)'
  }
}

function applyTocTheme(theme: 'light' | 'dark') {
  const root = document.documentElement
  const colors = tocTheme[theme]

  root.style.setProperty('--toc-bg', colors.background)
  root.style.setProperty('--toc-text', colors.text)
  root.style.setProperty('--toc-active', colors.active)
  root.style.setProperty('--toc-hover', colors.hover)
}
```

### Responsive Design

```css
/* Responsive TOC styles */
@media (max-width: 1024px) {
  .table-of-contents {
    display: none; /* Hide on smaller screens */
  }
}

@media (max-width: 768px) {
  .toc-floating {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    max-width: 250px;
    max-height: 300px;
    overflow-y: auto;
    z-index: 1000;
  }

  .toc-floating .toc-title {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }

  .toc-floating .toc-link {
    padding: 0.375rem 0;
    font-size: 0.875rem;
  }
}
```

## Floating TOC

### Right Sidebar Position

```typescript
export default {
  markdown: {
    toc: {
      position: 'floating',
      side: 'right',           // 'left' or 'right'
      width: '250px',         // Custom width
      offset: '2rem',         // Distance from edge
      zIndex: 100            // CSS z-index
    }
  }
}
```

### Collapsible Floating TOC

```html
<div class="toc-floating toc-collapsible">
  <button class="toc-toggle" aria-expanded="true">
    <span class="toc-toggle-icon">▼</span>
    Contents
  </button>

  <nav class="toc-content" aria-hidden="false">
    <!-- TOC items -->
  </nav>
</div>
```

```css
.toc-floating.toc-collapsed .toc-content {
  display: none;
}

.toc-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  padding: 0;
}

.toc-toggle-icon {
  transition: transform 0.2s ease;
}

.toc-collapsed .toc-toggle-icon {
  transform: rotate(-90deg);
}
```

## Mobile Navigation

### Mobile TOC Toggle

```html
<!-- Mobile TOC trigger -->
<button class="toc-mobile-toggle" aria-label="Toggle table of contents">
  <svg class="toc-icon" viewBox="0 0 24 24">
    <path d="M3 9h18M3 15h18M9 3v18"/>
  </svg>
  <span class="toc-label">Contents</span>
</button>

<!-- Mobile TOC overlay -->
<div class="toc-mobile-overlay">
  <div class="toc-mobile-content">
    <button class="toc-mobile-close" aria-label="Close table of contents">
      ✕
    </button>

    <nav class="toc-mobile-nav">
      <!-- TOC items -->
    </nav>
  </div>
</div>
```

### Touch Gestures

```typescript
// Touch gesture support for mobile TOC
class TocTouchHandler {
  private startY = 0
  private currentY = 0
  private isDragging = false

  init() {
    const toc = document.querySelector('.toc-mobile-content')

    if (!toc) return

    toc.addEventListener('touchstart', this.handleTouchStart.bind(this))
    toc.addEventListener('touchmove', this.handleTouchMove.bind(this))
    toc.addEventListener('touchend', this.handleTouchEnd.bind(this))
  }

  private handleTouchStart(e: TouchEvent) {
    this.startY = e.touches[0].clientY
    this.isDragging = true
  }

  private handleTouchMove(e: TouchEvent) {
    if (!this.isDragging) return

    this.currentY = e.touches[0].clientY
    const diff = this.currentY - this.startY

    // Add resistance when dragging down
    if (diff > 0) {
      const resistance = Math.min(diff * 0.3, 100)
      e.currentTarget.style.transform = `translateY(${resistance}px)`
    }
  }

  private handleTouchEnd() {
    if (!this.isDragging) return

    const diff = this.currentY - this.startY

    if (diff > 50) {
      // Close TOC if dragged down more than 50px
      this.closeToc()
    } else {
      // Reset position
      e.currentTarget.style.transform = ''
    }

    this.isDragging = false
  }

  private closeToc() {
    // Implementation to close mobile TOC
  }
}
```

## Accessibility

### ARIA Labels and Roles

```html
<nav class="table-of-contents" role="navigation" aria-label="Table of contents">
  <h2 class="toc-title" id="toc-heading">Table of Contents</h2>

  <ul class="toc-list" role="list" aria-labelledby="toc-heading">
    <li class="toc-item" role="listitem">
      <a href="#section-1" class="toc-link" aria-current="page">
        Section 1
      </a>

      <ul class="toc-sublist" role="list">
        <li class="toc-item" role="listitem">
          <a href="#subsection-1-1" class="toc-link">
            Subsection 1.1
          </a>
        </li>
      </ul>
    </li>
  </ul>
</nav>
```

### Keyboard Navigation

```typescript
// Keyboard navigation for TOC
class TocKeyboardNavigation {
  private tocLinks: NodeListOf<HTMLAnchorElement>

  init() {
    this.tocLinks = document.querySelectorAll('.toc-link')

    document.addEventListener('keydown', this.handleKeydown.bind(this))

    // Focus management
    this.tocLinks.forEach((link, index) => {
      link.setAttribute('tabindex', '0')
      link.addEventListener('focus', () => this.handleFocus(index))
    })
  }

  private handleKeydown(e: KeyboardEvent) {
    const activeElement = document.activeElement as HTMLAnchorElement

    if (!activeElement?.classList.contains('toc-link')) return

    const currentIndex = Array.from(this.tocLinks).indexOf(activeElement)

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        this.focusNext(currentIndex)
        break
      case 'ArrowUp':
        e.preventDefault()
        this.focusPrevious(currentIndex)
        break
      case 'Home':
        e.preventDefault()
        this.focusFirst()
        break
      case 'End':
        e.preventDefault()
        this.focusLast()
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        activeElement.click()
        break
    }
  }

  private focusNext(currentIndex: number) {
    const nextIndex = Math.min(currentIndex + 1, this.tocLinks.length - 1)
    this.tocLinks[nextIndex].focus()
  }

  private focusPrevious(currentIndex: number) {
    const prevIndex = Math.max(currentIndex - 1, 0)
    this.tocLinks[prevIndex].focus()
  }

  private focusFirst() {
    this.tocLinks[0].focus()
  }

  private focusLast() {
    this.tocLinks[this.tocLinks.length - 1].focus()
  }

  private handleFocus(index: number) {
    // Scroll TOC item into view if needed
    this.tocLinks[index].scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    })
  }
}
```

### Screen Reader Support

```typescript
// Screen reader enhancements
function enhanceTocForScreenReaders() {
  const toc = document.querySelector('.table-of-contents')

  if (!toc) return

  // Announce TOC expansion/collapse
  const toggleButtons = toc.querySelectorAll('.toc-toggle')
  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true'
      const sectionName = button.textContent?.trim() || 'section'

      announceToScreenReader(
        isExpanded ? `${sectionName} expanded` : `${sectionName} collapsed`
      )
    })
  })

  // Announce active section changes
  function announceActiveSection(sectionName: string) {
    announceToScreenReader(`Now viewing ${sectionName}`)
  }

  function announceToScreenReader(message: string) {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.style.position = 'absolute'
    announcement.style.left = '-10000px'
    announcement.style.width = '1px'
    announcement.style.height = '1px'
    announcement.style.overflow = 'hidden'

    announcement.textContent = message
    document.body.appendChild(announcement)

    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }
}
```

## Performance Optimization

### Lazy Loading

```typescript
// Lazy load TOC for better performance
class LazyTocLoader {
  private observer: IntersectionObserver
  private tocElement: HTMLElement | null = null

  constructor() {
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      { rootMargin: '50px' }
    )
  }

  init() {
    // Find TOC placeholder
    const placeholder = document.querySelector('.toc-placeholder')

    if (placeholder) {
      this.observer.observe(placeholder)
    }
  }

  private async handleIntersection(entries: IntersectionObserverEntry[]) {
    const entry = entries[0]

    if (entry.isIntersecting) {
      await this.loadToc()
      this.observer.disconnect()
    }
  }

  private async loadToc() {
    try {
      const response = await fetch('/api/toc')
      const tocHtml = await response.text()

      const placeholder = document.querySelector('.toc-placeholder')
      if (placeholder) {
        placeholder.outerHTML = tocHtml
        this.initTocFunctionality()
      }
    } catch (error) {
      console.error('Failed to load TOC:', error)
    }
  }

  private initTocFunctionality() {
    // Initialize TOC features after loading
    // Smooth scrolling, active state tracking, etc.
  }
}
```

### Virtual Scrolling

```typescript
// Virtual scrolling for large TOC
class VirtualTocScroller {
  private itemHeight = 32
  private visibleItems = 10
  private scrollTop = 0

  constructor(private container: HTMLElement, private items: TocItem[]) {
    this.init()
  }

  private init() {
    this.container.style.height = `${this.visibleItems * this.itemHeight}px`
    this.container.style.overflow = 'auto'

    this.renderVisibleItems()
    this.container.addEventListener('scroll', this.handleScroll.bind(this))
  }

  private handleScroll() {
    const newScrollTop = this.container.scrollTop
    const diff = newScrollTop - this.scrollTop

    if (Math.abs(diff) > this.itemHeight) {
      this.scrollTop = newScrollTop
      this.renderVisibleItems()
    }
  }

  private renderVisibleItems() {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight)
    const endIndex = Math.min(
      startIndex + this.visibleItems,
      this.items.length
    )

    const visibleItems = this.items.slice(startIndex, endIndex)
    const offset = startIndex * this.itemHeight

    this.container.innerHTML = `
      <div style="transform: translateY(${offset}px)">
        ${visibleItems.map(item => this.renderItem(item)).join('')}
      </div>
    `
  }

  private renderItem(item: TocItem): string {
    return `<div class="toc-item" style="height: ${this.itemHeight}px">${item.text}</div>`
  }
}
```

## Integration Examples

### With Popular Frameworks

```typescript
// React integration
import React, { useEffect, useState } from 'react'

interface TocItem {
  text: string
  link: string
  level: number
  children?: TocItem[]
}

interface TocProps {
  headings: TocItem[]
  activeItem?: string
  onItemClick?: (link: string) => void
}

export const TableOfContents: React.FC<TocProps> = ({
  headings,
  activeItem,
  onItemClick
}) => {
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set())

  const toggleCollapse = (itemId: string) => {
    const newCollapsed = new Set(collapsedItems)
    if (newCollapsed.has(itemId)) {
      newCollapsed.delete(itemId)
    } else {
      newCollapsed.add(itemId)
    }
    setCollapsedItems(newCollapsed)
  }

  const renderTocItem = (item: TocItem, depth = 0): React.ReactNode => {
    const isCollapsed = collapsedItems.has(item.link)
    const hasChildren = item.children && item.children.length > 0
    const isActive = activeItem === item.link

    return (
      <li key={item.link} className={`toc-item toc-item-level-${item.level}`}>
        <a
          href={item.link}
          className={`toc-link ${isActive ? 'toc-active' : ''}`}
          onClick={(e) => {
            e.preventDefault()
            onItemClick?.(item.link)
          }}
          style={{ paddingLeft: `${depth * 1}rem` }}
        >
          {hasChildren && (
            <button
              className="toc-toggle"
              onClick={() => toggleCollapse(item.link)}
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? '▶' : '▼'}
            </button>
          )}
          {item.text}
        </a>

        {hasChildren && !isCollapsed && (
          <ul className="toc-sublist">
            {item.children.map(child => renderTocItem(child, depth + 1))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <nav className="table-of-contents" role="navigation" aria-label="Table of contents">
      <h2 className="toc-title">Table of Contents</h2>
      <ul className="toc-list">
        {headings.map(item => renderTocItem(item))}
      </ul>
    </nav>
  )
}
```

### Vue.js Integration

```vue
<template>
  <nav class="table-of-contents" role="navigation" aria-label="Table of contents">
    <h2 class="toc-title">{{ title }}</h2>
    <ul class="toc-list">
      <toc-item
        v-for="item in headings"
        :key="item.link"
        :item="item"
        :active-item="activeItem"
        :collapsed-items="collapsedItems"
        @toggle-collapse="handleToggleCollapse"
        @item-click="handleItemClick"
      />
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface TocItem {
  text: string
  link: string
  level: number
  children?: TocItem[]
}

interface Props {
  headings: TocItem[]
  activeItem?: string
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Table of Contents'
})

const emit = defineEmits<{
  itemClick: [link: string]
}>()

const collapsedItems = ref<Set<string>>(new Set())

const handleToggleCollapse = (itemId: string) => {
  if (collapsedItems.value.has(itemId)) {
    collapsedItems.value.delete(itemId)
  } else {
    collapsedItems.value.add(itemId)
  }
}

const handleItemClick = (link: string) => {
  emit('itemClick', link)
}
</script>

<script lang="ts">
import TocItem from './TocItem.vue'
</script>
```

This comprehensive TOC system provides excellent navigation and user experience for documentation sites.
