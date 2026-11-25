import type { BunPressConfig, SidebarItem } from './types'

/**
 * Where a page sits in the sidebar: the trail of section and group titles
 * above it, and the pages before and after it in reading order.
 *
 * Both come from the sidebar the reader is looking at, so they can never
 * disagree with it: the breadcrumb names the section a page is filed under,
 * and the pager walks the sidebar's links top to bottom.
 */

export interface TrailLink {
  text: string
  link: string
}

export interface DocTrail {
  /** Section and group titles above the page, outermost first. */
  ancestors: string[]
  /** The page's own sidebar label, when the page is in the sidebar. */
  current?: string
  prev?: TrailLink
  next?: TrailLink
}

/**
 * The sidebar sections drawn for a path. A path-keyed sidebar picks the
 * longest key the path starts with, so `/guide/` wins over `/`.
 */
export function sidebarSectionsFor(config: BunPressConfig, currentPath: string): SidebarItem[] {
  const sidebarConfig = config.themeConfig?.sidebar || config.sidebar || config.markdown?.sidebar
  if (!sidebarConfig)
    return []
  if (Array.isArray(sidebarConfig))
    return sidebarConfig as SidebarItem[]
  if (typeof sidebarConfig === 'object') {
    const keys = Object.keys(sidebarConfig).sort((a, b) => b.length - a.length)
    const key = keys.find(k => currentPath.startsWith(k)) || '/'
    return ((sidebarConfig as Record<string, SidebarItem[]>)[key]) || []
  }
  return []
}

/** An internal link is a page in the docs; an external one is not part of the reading order. */
function isPageLink(link: string | undefined): link is string {
  return !!link && !/^[a-z][a-z0-9+.-]*:/i.test(link) && !link.startsWith('//')
}

/**
 * The trail for `currentPath`. Pages that are not in the sidebar get an
 * empty trail: there is no section to name and no order to walk.
 */
export function resolveDocTrail(sections: SidebarItem[], currentPath: string): DocTrail {
  const order: Array<TrailLink & { ancestors: string[] }> = []

  const walk = (items: SidebarItem[], ancestors: string[]): void => {
    for (const item of items) {
      if (isPageLink(item.link))
        order.push({ text: item.text, link: item.link, ancestors })
      if (item.items?.length)
        walk(item.items, item.text ? [...ancestors, item.text] : ancestors)
    }
  }
  walk(sections, [])

  const index = order.findIndex(entry => entry.link === currentPath)
  if (index === -1)
    return { ancestors: [] }

  const here = order[index]!
  const prev = order[index - 1]
  const next = order[index + 1]
  return {
    ancestors: here.ancestors,
    current: here.text,
    prev: prev ? { text: prev.text, link: prev.link } : undefined,
    next: next ? { text: next.text, link: next.link } : undefined,
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Sidebar labels are author-written HTML (they may hold `<code>`), so text is kept as written. */
function label(text: string): string {
  return text
}

/**
 * "Section › Page". The last entry is where the reader is, so it is marked
 * as the current page for assistive technology as well as drawn in the
 * accent colour.
 */
export function renderBreadcrumb(trail: DocTrail, ariaLabel = 'Breadcrumb'): string {
  if (!trail.current || trail.ancestors.length === 0)
    return ''
  const crumbs = trail.ancestors.map(text => `<li class="bp-breadcrumb-item">${label(text)}</li>`)
  crumbs.push(`<li class="bp-breadcrumb-item" aria-current="page">${label(trail.current)}</li>`)
  return `<nav class="bp-breadcrumb" aria-label="${escapeHtml(ariaLabel)}"><ol>${crumbs.join('')}</ol></nav>`
}

const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>'

/** The previous and next pages, as two cards. Nothing when the page has neither. */
export function renderDocPager(
  trail: DocTrail,
  href: (link: string) => string,
  labels: { prev: string, next: string, nav: string } = { prev: 'Previous', next: 'Next', nav: 'Pagination' },
): string {
  if (!trail.prev && !trail.next)
    return ''
  const card = (entry: TrailLink, kind: 'prev' | 'next') =>
    `<a class="bp-pager-link bp-pager-${kind}" href="${escapeHtml(href(entry.link))}">`
    + `<span class="bp-pager-label">${escapeHtml(kind === 'prev' ? labels.prev : labels.next)}</span>`
    + `<span class="bp-pager-title">${kind === 'prev' ? ARROW : ''}<span>${label(entry.text)}</span>${kind === 'next' ? ARROW : ''}</span>`
    + `</a>`
  return `<nav class="bp-pager" aria-label="${escapeHtml(labels.nav)}">`
    + (trail.prev ? card(trail.prev, 'prev') : '<span class="bp-pager-spacer"></span>')
    + (trail.next ? card(trail.next, 'next') : '')
    + `</nav>`
}
