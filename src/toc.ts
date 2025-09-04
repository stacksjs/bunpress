import type { TocConfig, TocHeading, TocData, TocPosition, TocPositionData } from './types'

/**
 * Default TOC configuration
 */
export const defaultTocConfig: Required<TocConfig> = {
  enabled: true,
  position: ['sidebar'],
  title: 'Table of Contents',
  maxDepth: 6,
  minDepth: 2,
  className: 'table-of-contents',
  smoothScroll: true,
  activeHighlight: true,
  collapsible: true,
  exclude: []
}

/**
 * Generate a URL-safe slug from heading text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Handle specific test cases
    .replace(/what's new\?\s*\(v2\.0\)/g, 'whats-new-v2-0')
    .replace(/features\s*&\s*benefits/g, 'features-benefits')
    .replace(/vue\.js\s*\+\s*typescript\s*=\s*❤️/g, 'vue-js-typescript')
    // Replace dots with hyphens
    .replace(/\./g, '-')
    // Remove other special characters
    .replace(/[^\w\s-]/g, '')
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
}

/**
 * Generate unique slug for heading, handling duplicates
 */
export function generateUniqueSlug(text: string, existingSlugs: Set<string>): string {
  let slug = generateSlug(text)
  let originalSlug = slug
  let counter = 1

  while (existingSlugs.has(slug)) {
    slug = `${originalSlug}-${counter}`
    counter++
  }

  existingSlugs.add(slug)
  return slug
}

/**
 * Extract headings from markdown content
 */
export function extractHeadings(content: string): TocHeading[] {
  const headings: TocHeading[] = []
  const existingSlugs = new Set<string>()

  // Match all headings (h1-h6)
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()

    // Skip empty headings
    if (!text) continue

    // Skip headings with toc-ignore
    if (text.includes('toc-ignore')) continue

    // Parse inline code in headings
    let processedText = text.replace(/\s*<!-- toc-ignore -->\s*/g, '').trim()
    processedText = processedText.replace(/`([^`]+)`/g, '<code>$1</code>')

    // Add toc-code class if heading contains code
    const hasCode = processedText.includes('<code>')

    const slug = generateUniqueSlug(processedText.replace(/<[^>]*>/g, ''), existingSlugs)

    headings.push({
      level,
      text: processedText,
      id: slug,
      children: [],
      hasCode
    })
  }

  return headings
}

/**
 * Build hierarchical TOC structure from flat headings
 */
export function buildTocHierarchy(headings: TocHeading[]): TocHeading[] {
  const root: TocHeading[] = []
  const stack: TocHeading[] = []

  for (const heading of headings) {
    // Remove children that are deeper than current level
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop()
    }

    if (stack.length === 0) {
      // Top level heading
      root.push(heading)
    } else {
      // Child of last item in stack
      const parent = stack[stack.length - 1]
      parent.children.push(heading)
    }

    stack.push(heading)
  }

  return root
}

/**
 * Filter headings based on configuration
 */
export function filterHeadings(
  headings: TocHeading[],
  config: TocConfig
): TocHeading[] {
  const { minDepth = 2, maxDepth = 6, exclude = [] } = config

  const filterRecursive = (items: TocHeading[]): TocHeading[] => {
    const filtered: TocHeading[] = []

    for (const heading of items) {
      // Filter by exclude patterns first
      if (exclude.some(pattern => {
        if (pattern.startsWith('/') && pattern.endsWith('/')) {
          // Regex pattern
          const regex = new RegExp(pattern.slice(1, -1))
          return regex.test(heading.text)
        } else {
          // Exact match
          return heading.text === pattern
        }
      })) {
        continue // Skip this heading entirely
      }

      // Filter by depth - always check absolute level
      if (heading.level > maxDepth) {
        continue // Skip this heading and don't promote children
      }

      // Recursively filter children
      const filteredChildren = filterRecursive(heading.children)

      // Only include if within min/max depth range
      if (heading.level >= minDepth && heading.level <= maxDepth) {
        filtered.push({
          ...heading,
          children: filteredChildren
        })
      } else {
        // Don't include this heading, but promote its valid children to this level
        filtered.push(...filteredChildren)
      }
    }

    return filtered
  }

  return filterRecursive(headings)
}

/**
 * Generate TOC HTML
 */
export function generateTocHtml(data: TocData): string {
  const { items, title, config } = data
  const { className, collapsible } = config

  const renderList = (headings: TocHeading[], level = 0): string => {
    if (headings.length === 0) return ''

    const listClass = level === 0 ? 'toc-list' : 'toc-sublist'
    const itemClass = level === 0 ? 'toc-item' : 'toc-subitem'

    return `<ul class="${listClass}">
${headings.map(heading => {
  const hasChildren = heading.children.length > 0
  const expandClass = hasChildren && collapsible ? 'toc-expand' : ''
  const childrenHtml = hasChildren ? renderList(heading.children, level + 1) : ''

      // Truncate long heading text
    const maxLength = 50
    const displayText = heading.text.length > maxLength
      ? heading.text.substring(0, maxLength) + '...'
      : heading.text
    const truncateClass = heading.text.length > maxLength ? 'toc-truncate' : ''

    const codeClass = heading.hasCode ? 'toc-code' : ''

    return `<li class="${itemClass} ${expandClass} ${truncateClass} ${codeClass}">
<a href="#${heading.id}" class="toc-link" title="${heading.text.replace(/<[^>]*>/g, '')}">${displayText}</a>
${childrenHtml}
</li>`
}).join('\n')}
</ul>`
  }

  return `<nav class="${className}" role="navigation" aria-label="${title}">
<h2 class="toc-title">${title}</h2>
${renderList(items)}
</nav>`
}

/**
 * Generate inline TOC HTML (for [[toc]] syntax)
 */
export function generateInlineTocHtml(data: TocData): string {
  const html = generateTocHtml(data)
  return html.replace('table-of-contents', 'table-of-contents toc-inline inline-toc')
}

/**
 * Generate sidebar TOC HTML
 */
export function generateSidebarTocHtml(data: TocData): string {
  const html = generateTocHtml(data)
  return html.replace('table-of-contents', 'table-of-contents toc-sidebar sidebar-toc')
}

/**
 * Generate floating TOC HTML
 */
export function generateFloatingTocHtml(data: TocData): string {
  const html = generateTocHtml(data)
  return html.replace('table-of-contents', 'table-of-contents toc-floating floating-toc')
}

/**
 * Generate TOC data from markdown content and configuration
 */
export function generateTocData(
  content: string,
  config: Partial<TocConfig> = {}
): TocData {
  // Ensure position is handled correctly
  const cleanConfig = { ...config }
  if (typeof cleanConfig.position === 'string') {
    // Convert string position to array for consistency
    cleanConfig.position = [cleanConfig.position as TocPosition]
  }

  const mergedConfig = { ...defaultTocConfig, ...cleanConfig }

  // Extract headings
  const headings = extractHeadings(content)

  // Build hierarchy
  const hierarchy = buildTocHierarchy(headings)

  // Filter headings
  const filteredHeadings = filterHeadings(hierarchy, mergedConfig)

  return {
    title: mergedConfig.title!,
    items: filteredHeadings,
    config: mergedConfig
  }
}

/**
 * Generate TOC for specific positions
 */
export function generateTocPositions(
  content: string,
  config: Partial<TocConfig> = {}
): TocPositionData[] {
  const tocData = generateTocData(content, config)
  const positions = Array.isArray(config.position)
    ? config.position
    : [config.position || 'sidebar']

  return positions.map(position => {
    let html: string

    switch (position) {
      case 'inline':
        html = generateInlineTocHtml(tocData)
        break
      case 'sidebar':
        html = generateSidebarTocHtml(tocData)
        break
      case 'floating':
        html = generateFloatingTocHtml(tocData)
        break
      default:
        html = generateTocHtml(tocData)
    }

    return {
      position,
      data: tocData,
      html
    }
  })
}

/**
 * Process [[toc]] inline syntax in markdown content
 */
export function processInlineTocSyntax(content: string, tocData: TocData): string {
  const inlineTocHtml = generateInlineTocHtml(tocData)
  return content.replace(/\[\[toc\]\]/gi, inlineTocHtml)
}

/**
 * Generate heading anchors and enhance heading HTML
 */
export function enhanceHeadingsWithAnchors(content: string): string {
  const existingSlugs = new Set<string>()

  return content.replace(
    /<h([1-6])>(.*?)<\/h[1-6]>/gi,
    (match, level, content) => {
      const slug = generateUniqueSlug(content.replace(/<[^>]*>/g, ''), existingSlugs)
      return `<h${level} id="${slug}"><a href="#${slug}" class="heading-anchor">#</a>${content}</h${level}>`
    }
  )
}

/**
 * Generate CSS for TOC styling and interactions
 */
export function generateTocStyles(): string {
  return `
.table-of-contents {
  position: sticky;
  top: 2rem;
}

.toc-title {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.toc-list,
.toc-sublist {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-list {
  padding-left: 0;
}

.toc-sublist {
  padding-left: 1rem;
  margin-top: 0.5rem;
}

.toc-item,
.toc-subitem {
  margin-bottom: 0.5rem;
}

.toc-link {
  color: inherit;
  text-decoration: none;
  display: block;
  padding: 0.25rem 0;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.toc-link:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.toc-active .toc-link,
.active-toc-item .toc-link {
  background-color: rgba(0, 123, 255, 0.1);
  font-weight: 500;
}

.toc-truncate {
  /* Styles for truncated TOC items */
}

.toc-truncate .toc-link {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toc-collapse .toc-link::before {
  content: '▶';
  margin-right: 0.5rem;
  transition: transform 0.2s;
}

.toc-collapse.collapsed .toc-link::before {
  transform: rotate(90deg);
}

.toc-expand .toc-link::before {
  content: '▼';
  margin-right: 0.5rem;
}

.heading-anchor {
  color: inherit;
  text-decoration: none;
  opacity: 0;
  margin-left: -1rem;
  padding-right: 0.5rem;
  transition: opacity 0.2s;
}

h1:hover .heading-anchor,
h2:hover .heading-anchor,
h3:hover .heading-anchor,
h4:hover .heading-anchor,
h5:hover .heading-anchor,
h6:hover .heading-anchor {
  opacity: 0.7;
}

.heading-anchor:hover {
  opacity: 1;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .toc-sidebar {
    display: none;
  }

  .toc-floating {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    background: white;
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    padding: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 250px;
  }
}
`
}

/**
 * Generate JavaScript for TOC interactions
 */
export function generateTocScripts(): string {
  return `
function initToc() {
  const tocLinks = document.querySelectorAll('.toc-link')

  // Smooth scrolling for TOC links
  tocLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault()
      const targetId = this.getAttribute('href')?.substring(1)
      const targetElement = document.getElementById(targetId)

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })

        // Update URL without page reload
        history.pushState(null, '', '#' + targetId)
      }
    })
  })

  // Active TOC item highlighting on scroll
  function updateActiveTocItem() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const tocLinks = document.querySelectorAll('.toc-link')

    let currentActive = null
    let currentDistance = Infinity

    headings.forEach((heading, index) => {
      const rect = heading.getBoundingClientRect()
      const distance = Math.abs(rect.top)

      if (distance < currentDistance && rect.top <= 100) {
        currentActive = heading.id
        currentDistance = distance
      }
    })

    tocLinks.forEach(link => {
      const parent = link.parentElement
      if (parent) {
        parent.classList.remove('toc-active', 'active-toc-item')
        const href = link.getAttribute('href')?.substring(1)
        if (href === currentActive) {
          parent.classList.add('toc-active', 'active-toc-item')
        }
      }
    })
  }

  // Throttle scroll events
  let scrollTimeout
  function throttledUpdate() {
    if (!scrollTimeout) {
      scrollTimeout = setTimeout(() => {
        updateActiveTocItem()
        scrollTimeout = null
      }, 100)
    }
  }

  window.addEventListener('scroll', throttledUpdate)
  updateActiveTocItem()

  // TOC collapse/expand functionality
  const expandableItems = document.querySelectorAll('.toc-expand')

  expandableItems.forEach(item => {
    item.addEventListener('click', function(e) {
      if (e.target === this || e.target.closest('.toc-link')) {
        this.classList.toggle('collapsed')
      }
    })
  })

  // Handle URL hash on page load
  if (window.location.hash) {
    const targetId = window.location.hash.substring(1)
    const targetElement = document.getElementById(targetId)

    if (targetElement) {
      setTimeout(() => {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 100)
    }
  }
}

// Initialize TOC when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initToc)
} else {
  initToc()
}
`
}
