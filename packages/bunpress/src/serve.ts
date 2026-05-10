import type { BunPressConfig, NavItem, SidebarItem } from './types'
import { Glob, YAML } from 'bun'
import { stat } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { config } from './config'
import { getSyntaxHighlightingStyles, highlightCode } from './highlighter'
import { clearTemplateCache, render } from './template-loader'
import { getThemeCSS } from './themes'
import { buildTocHierarchy, defaultTocConfig, extractHeadings, filterHeadings, generateInlineTocHtml, generateSlug } from './toc'

/**
 * Generate sidebar HTML from BunPress config
 * Supports both VitePress-style (themeConfig.sidebar) and legacy (markdown.sidebar) formats
 */
async function generateSidebar(config: BunPressConfig, currentPath: string): Promise<string> {
  // Support both VitePress-style themeConfig.sidebar and legacy markdown.sidebar
  const sidebarConfig = config.themeConfig?.sidebar || config.markdown?.sidebar

  if (!sidebarConfig) {
    return ''
  }

  let sidebarSections: any[] = []

  // Handle different sidebar formats
  if (Array.isArray(sidebarConfig)) {
    // VitePress-style: array of sections directly
    sidebarSections = sidebarConfig
  }
  else if (typeof sidebarConfig === 'object') {
    // Path-based sidebar: { '/': [...], '/guide/': [...] }
    // Sort keys longest-first so /guide/ matches before /
    const sortedKeys = Object.keys(sidebarConfig).sort((a, b) => b.length - a.length)
    const pathKey = sortedKeys.find(key => currentPath.startsWith(key)) || '/'
    sidebarSections = sidebarConfig[pathKey] || []
  }

  const sectionsHtml = await Promise.all(sidebarSections.map(async (section) => {
    const itemsHtml = section.items
      ? section.items.map((item: SidebarItem) => {
          const link = item.link || '/'
          const href = prefixRootPath(config, link)
          const isActive = link === currentPath || item.link === currentPath
          const cls = isActive ? 'VPSidebarItem-link is-active' : 'VPSidebarItem-link'
          return `<li><a class="${cls}" href="${href}">${item.text}</a></li>`
        }).join('')
      : ''

    return await render('sidebar-section', {
      title: section.text,
      items: itemsHtml,
    })
  }))

  return await render('sidebar', {
    sections: sectionsHtml.join(''),
  })
}

/**
 * Extract headings from HTML content and generate page TOC
 */
async function generatePageTOC(html: string): Promise<string> {
  // Extract h2, h3, h4, h5, h6 headings from HTML (h1 is typically the page title)
  const headingRegex = /<h([2-6])([^>]*)>(.*?)<\/h\1>/g
  const headings: Array<{ level: number, text: string, id: string }> = []

  let match
  while ((match = headingRegex.exec(html)) !== null) {
    const level = Number.parseInt(match[1])
    const attributes = match[2]
    let text = match[3]

    // Remove HTML tags from text
    text = text.replace(/<[^>]*>/g, '')

    // Extract or generate ID
    const idMatch = attributes.match(/id="([^"]*)"/)
    const id = idMatch ? idMatch[1] : text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')

    headings.push({ level, text, id })
  }

  if (headings.length === 0) {
    return ''
  }

  // Generate TOC items HTML
  const items = headings.map((heading) => {
    const levelClass = heading.level > 2 ? `level-${heading.level}` : ''
    return `<a href="#${heading.id}" class="${levelClass}">${heading.text}</a>`
  }).join('\n      ')

  return await render('page-toc', { items })
}

/**
 * Add IDs to headings in HTML content
 * Supports custom IDs with {#custom-id} syntax
 */
function addHeadingIds(html: string): string {
  return html.replace(/<h([1-6])([^>]*)>(.*?)<\/h\1>/g, (match, level, attributes, text) => {
    // Check if ID already exists
    if (attributes.includes('id=')) {
      return match
    }

    // Check for custom ID syntax {#custom-id}
    const customIdMatch = text.match(/\s*\{#([\w-]+)\}\s*$/)
    let id: string
    let displayText = text

    if (customIdMatch) {
      // Use custom ID and remove the {#custom-id} from display text
      id = customIdMatch[1]
      displayText = text.replace(/\s*\{#[\w-]+\}\s*$/, '')
    }
    else {
      // Generate ID from text
      const plainText = text.replace(/<[^>]*>/g, '')
      id = plainText.toLowerCase()
        .replace(/\//g, '-') // Replace slashes with hyphens first
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')
        .replace(/-+/g, '-') // Remove consecutive hyphens
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    }

    return `<h${level}${attributes} id="${id}">${displayText}</h${level}>`
  })
}

/**
 * Inject the SPA router script before </body> in rendered HTML.
 * Done post-render to avoid stx's template pipeline consuming the script.
 */
function injectSPARouter(html: string): string {
  const script = generateSPARouterScript()
  const idx = html.lastIndexOf('</body>')
  if (idx === -1) return html + script
  return html.slice(0, idx) + script + html.slice(idx)
}

// stx 0.2.40+ sanitizes <script> tags from {!! ... !!} output, so layout
// templates can't carry them through. Inject script blocks straight into the
// HTML after rendering to bypass the sanitizer.
function injectScripts(html: string, scripts: string): string {
  if (!scripts) return html
  const idx = html.lastIndexOf('</body>')
  if (idx === -1) return html + scripts
  return html.slice(0, idx) + scripts + html.slice(idx)
}

/**
 * Generate a lightweight SPA router for VitePress-style client-side navigation.
 * Intercepts internal link clicks, fetches pages, swaps content, and handles
 * browser back/forward. No framework dependencies.
 */
function generateSPARouterScript(): string {
  return `<script data-bp-router="1">
(function(){
  if (history.scrollRestoration) history.scrollRestoration = 'manual';

  var cache = Object.create(null);
  var parser = new DOMParser();
  var scrollPositions = Object.create(null);
  var historyIndex = (history.state && typeof history.state.idx === 'number') ? history.state.idx : 0;
  var lastPathname = location.pathname;
  var lastSearch = location.search;

  // Wrap pushState/replaceState so any caller (incl. inline scripts) gets a tracked idx
  var origPush = history.pushState.bind(history);
  var origReplace = history.replaceState.bind(history);
  history.pushState = function(state, title, url) {
    state = state || {};
    if (typeof state.idx !== 'number') {
      historyIndex++;
      state.idx = historyIndex;
    } else {
      historyIndex = state.idx;
    }
    return origPush(state, title, url);
  };
  history.replaceState = function(state, title, url) {
    state = state || {};
    if (typeof state.idx !== 'number') state.idx = historyIndex;
    else historyIndex = state.idx;
    return origReplace(state, title, url);
  };
  if (!history.state || typeof history.state.idx !== 'number') {
    origReplace({ idx: historyIndex }, '', location.href);
  }

  function getScroller() {
    var el = document.querySelector('.VPContent');
    if (el) {
      var cs = getComputedStyle(el);
      if (cs.position === 'fixed' && (cs.overflowY === 'auto' || cs.overflowY === 'scroll')) {
        return el;
      }
    }
    return window;
  }

  function readScroll() {
    var s = getScroller();
    return s === window ? window.scrollY : s.scrollTop;
  }

  function applyScroll(y) {
    var s = getScroller();
    if (s === window) window.scrollTo(0, y);
    else s.scrollTop = y;
  }

  function saveScroll() {
    scrollPositions[historyIndex] = readScroll();
  }

  function isInternalNavigable(u) {
    return u.origin === location.origin && !u.pathname.match(/\\.[a-z]+$/i);
  }

  function updateActiveLinks() {
    var path = location.pathname;
    document.querySelectorAll('a.is-active').forEach(function(a) {
      a.classList.remove('is-active');
    });
    document.querySelectorAll('a[href]').forEach(function(a) {
      var href = a.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      var u;
      try { u = new URL(href, location.origin); } catch(_) { return; }
      if (u.origin !== location.origin) return;
      var p = u.pathname;
      // eslint-disable-next-line general/prefer-template -- inner JS string; template literals would clash with the outer TS template
      if (p === path || (p !== '/' && (path === p || path.startsWith(p + '/')))) {
        a.classList.add('is-active');
      }
    });
  }

  function executeScripts(root) {
    if (!root) return;
    root.querySelectorAll('script').forEach(function(s) {
      if (s.dataset && s.dataset.bpRouter) return;
      var ns = document.createElement('script');
      for (var i = 0; i < s.attributes.length; i++) {
        var attr = s.attributes[i];
        ns.setAttribute(attr.name, attr.value);
      }
      if (!s.src) ns.textContent = s.textContent;
      s.parentNode.replaceChild(ns, s);
    });
  }

  function scrollToHash(hash) {
    if (!hash) return false;
    var id;
    try { id = decodeURIComponent(hash.slice(1)); } catch(_) { id = hash.slice(1); }
    if (!id) return false;
    var el = document.getElementById(id);
    if (!el) {
      try { el = document.querySelector('[name="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]'); } catch(_) {}
    }
    if (el) {
      el.scrollIntoView({ behavior: 'auto', block: 'start' });
      return true;
    }
    return false;
  }

  function detectLayout(root) {
    if (root.querySelector('.VPHome')) return 'home';
    if (root.querySelector('.VPContent--doc') || root.querySelector('.VPSidebar')) return 'doc';
    if (root.querySelector('.VPContent--page') || root.querySelector('.VPPage')) return 'page';
    return 'page';
  }

  async function navigate(href, opts) {
    opts = opts || {};
    var target = new URL(href, location.origin);
    var key = target.pathname + target.search;

    if (opts.push) {
      saveScroll();
      history.pushState({}, '', target.pathname + target.search + target.hash);
    }

    var html = cache[key];
    if (!html) {
      try {
        var res = await fetch(key, { headers: { 'X-BP-SPA': '1' } });
        if (!res.ok) {
          // 404 / 5xx — fall through to a real navigation so the browser shows the actual error page
          location.href = target.href;
          return;
        }
        html = await res.text();
        cache[key] = html;
      } catch(_) {
        location.href = target.href;
        return;
      }
    }

    var doc = parser.parseFromString(html, 'text/html');

    var newTitle = doc.querySelector('title');
    if (newTitle) document.title = newTitle.textContent;

    // Sync description, og:*, twitter:* meta tags
    doc.querySelectorAll('meta[name="description"], meta[property^="og:"], meta[name^="twitter:"]').forEach(function(nm) {
      var sel;
      if (nm.getAttribute('property')) sel = 'meta[property="' + nm.getAttribute('property') + '"]';
      else sel = 'meta[name="' + nm.getAttribute('name') + '"]';
      var existing = document.querySelector(sel);
      if (existing) existing.setAttribute('content', nm.getAttribute('content') || '');
      else document.head.appendChild(nm.cloneNode(true));
    });
    var newCanonical = doc.querySelector('link[rel="canonical"]');
    var curCanonical = document.querySelector('link[rel="canonical"]');
    if (newCanonical && curCanonical) curCanonical.setAttribute('href', newCanonical.getAttribute('href') || '');
    else if (newCanonical && !curCanonical) document.head.appendChild(newCanonical.cloneNode(true));

    var curLayout = detectLayout(document);
    var newLayout = detectLayout(doc);

    if (curLayout !== newLayout) {
      document.body.innerHTML = doc.body.innerHTML;
      executeScripts(document.body);
    } else if (curLayout === 'home') {
      var newHome = doc.querySelector('.VPHome');
      var curHome = document.querySelector('.VPHome');
      if (newHome && curHome) {
        curHome.innerHTML = newHome.innerHTML;
        executeScripts(curHome);
      }
    } else if (curLayout === 'doc') {
      var newMain = doc.querySelector('.VPDoc');
      var curMain = document.querySelector('.VPDoc');
      if (newMain && curMain) {
        curMain.innerHTML = newMain.innerHTML;
        executeScripts(curMain);
      }
      var newSidebar = doc.querySelector('.VPSidebar');
      var curSidebar = document.querySelector('.VPSidebar');
      if (newSidebar && curSidebar) {
        curSidebar.innerHTML = newSidebar.innerHTML;
        executeScripts(curSidebar);
      }
      var newAside = doc.querySelector('.VPDocAside');
      var curAside = document.querySelector('.VPDocAside');
      if (newAside && curAside) {
        curAside.innerHTML = newAside.innerHTML;
        executeScripts(curAside);
      }
    } else {
      // page layout
      var newPage = doc.querySelector('.VPPage') || doc.querySelector('.VPContent');
      var curPage = document.querySelector('.VPPage') || document.querySelector('.VPContent');
      if (newPage && curPage) {
        curPage.innerHTML = newPage.innerHTML;
        executeScripts(curPage);
      }
    }

    var newStyles = doc.querySelectorAll('style[data-crosswind]');
    if (newStyles.length) {
      document.querySelectorAll('style[data-crosswind]').forEach(function(s) { s.remove(); });
      newStyles.forEach(function(s) { document.head.appendChild(s.cloneNode(true)); });
    }

    lastPathname = target.pathname;
    lastSearch = target.search;
    updateActiveLinks();

    if (typeof opts.restoreScroll === 'number') {
      applyScroll(opts.restoreScroll);
    } else if (target.hash) {
      if (!scrollToHash(target.hash)) {
        requestAnimationFrame(function(){ scrollToHash(target.hash); });
      }
    } else {
      applyScroll(0);
    }
  }

  document.addEventListener('click', function(e) {
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    var a = e.target.closest('a[href]');
    if (!a) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download')) return;
    var rel = a.getAttribute('rel') || '';
    if (/\\bexternal\\b/.test(rel)) return;
    var href = a.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    var u;
    try { u = new URL(href, location.origin); } catch(_) { return; }
    if (!isInternalNavigable(u)) return;

    e.preventDefault();

    if (u.pathname === location.pathname && u.search === location.search) {
      // Same page; update hash + scroll without re-render
      saveScroll();
      if (u.hash) {
        history.pushState({}, '', u.pathname + u.search + u.hash);
        scrollToHash(u.hash);
      } else {
        history.pushState({}, '', u.pathname + u.search);
        applyScroll(0);
      }
      lastPathname = u.pathname;
      lastSearch = u.search;
      return;
    }
    navigate(u.href, { push: true });
  });

  window.addEventListener('popstate', function(e) {
    var newIdx = (e.state && typeof e.state.idx === 'number') ? e.state.idx : historyIndex;
    var savedScroll = scrollPositions[newIdx];
    saveScroll(); // capture scroll for the page being left, under the *current* historyIndex
    historyIndex = newIdx;

    if (location.pathname === lastPathname && location.search === lastSearch) {
      // Hash-only or no-op change — skip re-render
      if (typeof savedScroll === 'number') applyScroll(savedScroll);
      else if (location.hash) { if (!scrollToHash(location.hash)) applyScroll(0); }
      else applyScroll(0);
      return;
    }
    navigate(location.href, { push: false, restoreScroll: typeof savedScroll === 'number' ? savedScroll : 0 });
  });

  document.addEventListener('mouseover', function(e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    var u;
    try { u = new URL(href, location.origin); } catch(_) { return; }
    if (!isInternalNavigable(u)) return;
    var key = u.pathname + u.search;
    if (cache[key]) return;
    fetch(key).then(function(r){ return r.ok ? r.text() : null; }).then(function(h){ if (h) cache[key] = h; }).catch(function(){});
  });

  window.addEventListener('beforeunload', saveScroll);

  updateActiveLinks();
})();
<` + `/script>`
}

/**
 * Generate navigation HTML from BunPress config
 * Supports both VitePress-style (themeConfig.nav) and legacy (nav) formats
 */
function generateNav(config: BunPressConfig): string {
  // Support both VitePress-style themeConfig.nav and legacy nav
  const navConfig = config.themeConfig?.nav || config.nav

  if (!navConfig || navConfig.length === 0) {
    return ''
  }

  const fixNavLink = (link: string | undefined): string => {
    return prefixRootPath(config, link || '/')
  }

  const links = navConfig.map((item) => {
    if (item.items && item.items.length > 0) {
      return `<div class="VPNavBarMenu-group">
        <button class="VPNavBarMenu-group-button" type="button">
          <span>${item.text}</span>
          <svg class="chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        <div class="VPNavBarMenu-group-items">
          ${item.items.map(subItem =>
            `<a href="${fixNavLink(subItem.link)}">${subItem.text}</a>`,
          ).join('')}
        </div>
      </div>`
    }
    return `<a class="VPNavBarMenu-link" href="${fixNavLink(item.link)}">${item.text}</a>`
  }).join('')

  return links
}

function getConfiguredBasePath(config: BunPressConfig): string {
  const baseUrl = config.sitemap?.baseUrl
  if (!baseUrl) {
    return ''
  }

  try {
    const pathname = new URL(baseUrl).pathname.replace(/\/+$/, '')
    return pathname === '/' ? '' : pathname
  }
  catch {
    return ''
  }
}

function prefixRootPath(config: BunPressConfig, value: string): string {
  const basePath = getConfiguredBasePath(config)
  if (!basePath || !value.startsWith('/') || value.startsWith('//')) {
    return value
  }

  if (value === basePath || value.startsWith(`${basePath}/`)) {
    return value
  }

  return value === '/' ? `${basePath}/` : `${basePath}${value}`
}

function prefixRootRelativeAttributes(html: string, config: BunPressConfig): string {
  return html.replace(/\b(href|src|action)="(\/[^"]*)"/g, (match, attribute, value) => {
    const prefixed = prefixRootPath(config, value)
    return prefixed === value ? match : `${attribute}="${prefixed}"`
  })
}

/**
 * Generate canonical URL for the current page
 */
function generateCanonicalUrl(config: BunPressConfig, currentPath: string): string {
  const baseUrl = config.sitemap?.baseUrl
  if (!baseUrl) {
    return ''
  }

  const cleanBaseUrl = baseUrl.replace(/\/$/, '')
  const cleanPath = currentPath === '/index' ? '/' : currentPath
  return `<link rel="canonical" href="${cleanBaseUrl}${cleanPath}">`
}

/**
 * Generate Open Graph meta tags
 */
function generateOpenGraphTags(
  title: string,
  description: string,
  config: BunPressConfig,
  currentPath: string,
): string {
  const baseUrl = config.sitemap?.baseUrl
  if (!baseUrl) {
    return ''
  }

  const cleanBaseUrl = baseUrl.replace(/\/$/, '')
  const cleanPath = currentPath === '/index' ? '/' : currentPath
  const url = `${cleanBaseUrl}${cleanPath}`

  const siteName = config.title || config.markdown?.title || title
  const ogImage = config.markdown?.meta?.['og:image'] || config.markdown?.meta?.ogImage

  const tags = [
    `<meta property="og:type" content="website">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:site_name" content="${siteName}">`,
  ]

  if (ogImage) {
    tags.push(`<meta property="og:image" content="${ogImage}">`)
  }

  return tags.join('\n  ')
}

/**
 * Generate Twitter Card meta tags
 */
function generateTwitterCardTags(
  title: string,
  description: string,
  config: BunPressConfig,
): string {
  const twitterCard = config.markdown?.meta?.['twitter:card'] || config.markdown?.meta?.twitterCard || 'summary'
  const twitterSite = config.markdown?.meta?.['twitter:site'] || config.markdown?.meta?.twitterSite
  const twitterImage = config.markdown?.meta?.['twitter:image'] || config.markdown?.meta?.twitterImage

  const tags = [
    `<meta name="twitter:card" content="${twitterCard}">`,
    `<meta name="twitter:title" content="${title}">`,
    `<meta name="twitter:description" content="${description}">`,
  ]

  if (twitterSite) {
    tags.push(`<meta name="twitter:site" content="${twitterSite}">`)
  }

  if (twitterImage) {
    tags.push(`<meta name="twitter:image" content="${twitterImage}">`)
  }

  return tags.join('\n  ')
}

/**
 * Generate JSON-LD structured data
 */
function generateStructuredData(
  title: string,
  description: string,
  config: BunPressConfig,
  currentPath: string,
): string {
  const baseUrl = config.sitemap?.baseUrl
  if (!baseUrl) {
    return ''
  }

  const cleanBaseUrl = baseUrl.replace(/\/$/, '')
  const cleanPath = currentPath === '/index' ? '/' : currentPath
  const url = `${cleanBaseUrl}${cleanPath}`

  // WebSite schema for home page
  if (cleanPath === '/') {
    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': config.title || config.markdown?.title || title,
      'description': description,
      'url': cleanBaseUrl,
    }

    return `<script type="application/ld+json">\n${JSON.stringify(websiteSchema, null, 2)}\n</script>`
  }

  // Article schema for content pages
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    'headline': title,
    'description': description,
    'url': url,
  }

  // Add breadcrumb schema
  const pathParts = cleanPath.split('/').filter(Boolean)
  const breadcrumbItems = pathParts.map((part, index) => {
    const position = index + 1
    const itemUrl = `${cleanBaseUrl}/${pathParts.slice(0, position).join('/')}`
    return {
      '@type': 'ListItem',
      'position': position,
      'name': part.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      'item': itemUrl,
    }
  })

  if (breadcrumbItems.length > 0) {
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': breadcrumbItems,
    }

    return `<script type="application/ld+json">\n${JSON.stringify(articleSchema, null, 2)}\n</script>\n<script type="application/ld+json">\n${JSON.stringify(breadcrumbSchema, null, 2)}\n</script>`
  }

  return `<script type="application/ld+json">\n${JSON.stringify(articleSchema, null, 2)}\n</script>`
}

/**
 * Wrap content in BunPress documentation layout
 */
export async function wrapInLayout(content: string, config: BunPressConfig, currentPath: string, layout: string = 'doc'): Promise<string> {
  // Support both top-level config (VitePress-style) and markdown.title format
  const title = config.title || config.themeConfig?.siteTitle || config.markdown?.title || 'BunPress Documentation'
  const description = config.description || config.markdown?.meta?.description || 'Documentation built with BunPress'

  // Get theme CSS (defaults to 'vitepress' theme)
  const themeName = config.theme || 'vitepress'
  const themeCSS = getThemeCSS(themeName)
  const syntaxHighlightingStyles = getSyntaxHighlightingStyles()

  // Generate SEO meta tags
  const canonicalUrl = generateCanonicalUrl(config, currentPath)
  const openGraphTags = generateOpenGraphTags(title, description, config, currentPath)
  const twitterCardTags = generateTwitterCardTags(title, description, config)
  const structuredData = generateStructuredData(title, description, config, currentPath)

  // Combine all meta tags
  const basicMeta = Object.entries(config.markdown?.meta || {})
    .filter(([key]) => !key.startsWith('og:') && !key.startsWith('twitter:') && key !== 'description' && key !== 'ogImage' && key !== 'twitterCard' && key !== 'twitterSite' && key !== 'twitterImage')
    .map(([key, value]) => `<meta name="${key}" content="${value}">`)
    .join('\n  ')

  const allMeta = [basicMeta, canonicalUrl, openGraphTags, twitterCardTags].filter(Boolean).join('\n  ')

  // Generate analytics scripts
  const fathomScript = generateFathomScript(config)
  const analyticsScript = generateAnalyticsScript(config)

  // Combine custom scripts with analytics and structured data
  const customScripts = config.markdown?.scripts?.map(script => `<script>${script}</script>`).join('\n') || ''
  const scripts = [structuredData, fathomScript, analyticsScript, customScripts].filter(Boolean).join('\n')

  // Pre-generate nav so we can scan all HTML for crosswind utility classes
  const nav = generateNav(config)

  // Home layout - no sidebar, no navigation, clean hero layout
  if (layout === 'home') {
    const crosswindCSS = await generateCrosswindCSSFromHtml(content)
    const customCSS = `${themeCSS}\n${syntaxHighlightingStyles}\n${crosswindCSS}\n${config.markdown?.css || ''}`

    const html = await render('layout-home', {
      title,
      description,
      meta: allMeta,
      customCSS,
      content,
    })
    return prefixRootRelativeAttributes(injectSPARouter(injectScripts(html, scripts)), config)
  }

  // Page layout - nav bar, full-width content, no sidebar, no TOC
  if (layout === 'page') {
    const crosswindCSS = await generateCrosswindCSSFromHtml(`${content}\n${nav}`)
    const customCSS = `${themeCSS}\n${syntaxHighlightingStyles}\n${crosswindCSS}\n${config.markdown?.css || ''}`

    const html = await render('layout-page', {
      title,
      description,
      meta: allMeta,
      customCSS,
      nav,
      content,
    })
    return prefixRootRelativeAttributes(injectSPARouter(injectScripts(html, scripts)), config)
  }

  // Documentation layout (default) - with sidebar and TOC
  const contentWithIds = addHeadingIds(content)
  const pageTOC = await generatePageTOC(contentWithIds)
  const sidebar = await generateSidebar(config, currentPath)

  const crosswindCSS = await generateCrosswindCSSFromHtml(`${contentWithIds}\n${nav}\n${sidebar}`)
  const customCSS = `${themeCSS}\n${syntaxHighlightingStyles}\n${crosswindCSS}\n${config.markdown?.css || ''}`

  const html = await render('layout-doc', {
    title,
    description,
    meta: allMeta,
    customCSS,
    nav,
    sidebar,
    content: contentWithIds,
    pageTOC,
  })

  return prefixRootRelativeAttributes(injectSPARouter(injectScripts(html, scripts)), config)
}

let _crosswindModule: any = null
let _crosswindLoaded = false

async function loadCrosswind(): Promise<any> {
  if (_crosswindLoaded) return _crosswindModule
  _crosswindLoaded = true
  try {
    _crosswindModule = await import('@cwcss/crosswind')
  }
  catch {
    _crosswindModule = null
  }
  return _crosswindModule
}

async function generateCrosswindCSSFromHtml(html: string): Promise<string> {
  const cw = await loadCrosswind()
  if (!cw) return ''
  const scanner = new cw.Scanner([])
  const classes = scanner.scanContent(html)
  if (classes.size === 0) return ''
  const generator = new cw.CSSGenerator(cw.defaultConfig)
  for (const cls of classes) {
    generator.generate(cls)
  }
  return generator.toCSS(false, false)
}

/**
 * Generate Fathom Analytics tracking script
 */
function generateFathomScript(config: BunPressConfig): string {
  // Check if Fathom is enabled and has a site ID
  if (!config.fathom?.enabled || !config.fathom?.siteId) {
    return ''
  }

  const scriptUrl = config.fathom.scriptUrl || 'https://cdn.usefathom.com/script.js'
  const defer = config.fathom.defer !== false // Default to true
  const honorDNT = config.fathom.honorDNT || false
  const auto = config.fathom.auto !== false // Default to true
  const canonical = config.fathom.canonical
  const spa = config.fathom.spa || false

  // Build data attributes
  const dataAttrs = [
    `data-site="${config.fathom.siteId}"`,
    honorDNT ? 'data-honor-dnt="true"' : '',
    !auto ? 'data-auto="false"' : '',
    canonical ? `data-canonical="${canonical}"` : '',
    spa ? 'data-spa="auto"' : '',
  ].filter(Boolean).join(' ')

  // Build script tag
  return `<script src="${scriptUrl}" ${dataAttrs}${defer ? ' defer' : ''}></script>`
}

/**
 * Generate Analytics tracking script
 * Privacy-focused, cookie-free analytics you can run on your own infrastructure
 *
 * Features:
 * - Uses sendBeacon for reliable tracking (with XHR fallback)
 * - Persists session ID in sessionStorage across page loads
 * - Proper error handling with optional debug mode
 * - Tracks page views, custom events, and outbound links
 */
function generateAnalyticsScript(config: BunPressConfig): string {
  // Support both new `analytics` and deprecated `selfHostedAnalytics`
  const analytics = config.analytics || config.selfHostedAnalytics
  if (!analytics?.enabled || !analytics?.siteId) {
    return ''
  }

  const siteId = escapeAttr(analytics.siteId)
  // apiEndpoint is now optional - script will fallback to window.ANALYTICS_API_ENDPOINT or '/api/analytics'
  const apiEndpoint = analytics.apiEndpoint ? escapeAttr(analytics.apiEndpoint) : ''
  const honorDnt = analytics.honorDNT ? `var dnt=n.doNotTrack||w.doNotTrack||n.msDoNotTrack;if(dnt==="1"||dnt==="yes"||dnt===true){l('DNT enabled, skipping');return;}` : ''
  const hashTracking = analytics.trackHashChanges ? `w.addEventListener('hashchange',function(){pv();});` : ''
  /* eslint-disable pickier/no-unused-vars -- `e`, `a`, `err` are JS inside a template literal, not real bindings */
  const outboundTracking = analytics.trackOutboundLinks
    ? `d.addEventListener('click',function(e){try{var a=e.target.closest('a');if(a&&a.hostname&&a.hostname!==location.hostname){t('outbound',{url:a.href,text:(a.textContent||'').slice(0,100)});}}
catch (err){l('Outbound error',err);}});`
    : ''
  /* eslint-enable pickier/no-unused-vars */

  const dataApiAttr = apiEndpoint ? ` data-api="${apiEndpoint}"` : ''

  /* eslint-disable pickier/no-unused-vars, prefer-const, general/prefer-template */
  return `<!-- ts-analytics: privacy-first analytics -->
<script data-site="${siteId}"${dataApiAttr} defer>
(function(){
'use strict';
var d=document,w=window,n=navigator,ss=w.sessionStorage,s=d.currentScript;
var site=s.dataset.site,api=s.dataset.api||w.ANALYTICS_API_ENDPOINT||'/api/analytics';
var debug=w.ANALYTICS_DEBUG||false;
function l(){if(debug&&w.console)console.log.apply(console,['[Analytics]'].concat([].slice.call(arguments)));}
try{
${honorDnt}
var SK='_tsa_sid',VK='_tsa_vid';
var sid=ss.getItem(SK);
if(!sid){sid=Math.random().toString(36).slice(2)+Date.now().toString(36);ss.setItem(SK,sid);l('New session',sid);}
var vid=null;try{vid=localStorage.getItem(VK);if(!vid){vid=Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2);localStorage.setItem(VK,vid);}}
catch (e){}
function send(url,data){
var payload=JSON.stringify(data);
l('Sending to',url,data.e);
var sent=false;
if(n.sendBeacon){
try{sent=n.sendBeacon(url,payload);if(sent){l('Sent via beacon',data.e);return true;}}
catch (e){l('Beacon failed',e);}
}
if(!sent){
try{
var x=new XMLHttpRequest();
x.open('POST',url,true);
x.setRequestHeader('Content-Type','application/json');
x.onload=function(){l('XHR complete',x.status);};
x.onerror=function(){l('XHR error');};
x.send(payload);
l('Sent via XHR',data.e);
return true;
}
catch(e){l('XHR failed',e);}
}
return sent;
}
function t(e,p){
try{
var data={s:site,sid:sid,e:e,p:p||{},u:location.href,r:d.referrer||'',t:d.title||'',sw:screen.width,sh:screen.height,ts:Date.now()};
if(vid)data.vid=vid;
send(api+'/collect',data);
}
catch(err){l('Track error',err);}
}
var pvSent={};function pv(){var p=location.pathname;if(pvSent[p]&&Date.now()-pvSent[p]<1000)return;pvSent[p]=Date.now();l('Pageview',p);t('pageview',{path:p});}
${hashTracking}
${outboundTracking}
var hp=history.pushState;if(hp){history.pushState=function(){hp.apply(history,arguments);pv();};}
var hr=history.replaceState;if(hr){history.replaceState=function(){hr.apply(history,arguments);};}
w.addEventListener('popstate',pv);
l('readyState:',d.readyState);
if(d.readyState==='complete'||d.readyState==='interactive'){setTimeout(pv,0);}
else {w.addEventListener('load',pv);d.addEventListener('DOMContentLoaded',pv);}
w.addEventListener('visibilitychange',function(){if(d.visibilityState==='hidden'){t('session_end',{duration:Date.now()-(ss.getItem('_tsa_start')||Date.now())});}});
ss.setItem('_tsa_start',Date.now());
w.bunpressAnalytics={track:function(name,props){t('event',{name:name,properties:props});},debug:function(v){debug=v!==false;w.ANALYTICS_DEBUG=debug;}};
l('Initialized',site);
}
catch(err){if(w.console)console.error('[Analytics] Init error:',err);}
})();
</script>`
  /* eslint-enable pickier/no-unused-vars, prefer-const, general/prefer-template */
}

/**
 * Escape attribute value for safe HTML insertion
 */
function escapeAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Parse YAML frontmatter from markdown using Bun's native YAML parser
 */
function parseFrontmatter(markdown: string): { frontmatter: any, content: string } {
  // Normalize CRLF to LF for cross-platform compatibility
  const normalized = markdown.replace(/\r\n/g, '\n')
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n?/
  const match = normalized.match(frontmatterRegex)

  if (!match) {
    return { frontmatter: {}, content: normalized }
  }

  const frontmatterText = match[1]
  const content = normalized.slice(match[0].length)

  try {
    // Use Bun's native YAML parser
    const frontmatter = YAML.parse(frontmatterText)
    return { frontmatter, content }
  }
  catch {
    // Retry: wrap unquoted values containing double quotes in single quotes
    // Handles common pattern like:  details: "Some quote," attribution.
    // which YAML misinterprets as a double-quoted string
    try {
      const fixed = frontmatterText.replace(
        /^(\s*\w+:\s*)"(.+)",\s*(.+)$/gm,
        `$1'"$2," $3'`,
      )
      const frontmatter = YAML.parse(fixed)
      return { frontmatter, content }
    }
    catch (retryError) {
      console.error('Failed to parse frontmatter YAML:', retryError)
      return { frontmatter: {}, content: markdown }
    }
  }
}

/**
 * Generate hero section HTML from frontmatter
 */
// eslint-disable-next-line pickier/no-unused-vars
async function generateHero(hero: any): Promise<string> {
  if (!hero)
    return ''

  const name = hero.name
    ? `<p class="VPHero-name">${hero.name}</p>`
    : ''
  const text = hero.text
    ? `<h1 class="VPHero-text">${hero.text}</h1>`
    : ''
  const tagline = hero.tagline
    ? `<p class="VPHero-tagline">${hero.tagline}</p>`
    : ''

  let actions = ''
  if (hero.actions) {
    const actionButtons = hero.actions.map((action: any) => {
      const cls = action.theme === 'brand' ? 'VPButton VPButton-brand' : 'VPButton VPButton-alt'
      return `<a class="${cls}" href="${action.link}">${action.text}</a>`
    }).join('\n      ')
    actions = `<div class="VPHero-actions">${actionButtons}</div>`
  }

  const image = hero.image
    ? `<div class="hero-image"><img src="${hero.image}" alt="${hero.name || ''}" /></div>`
    : ''

  return await render('hero', {
    name,
    text,
    tagline,
    actions,
    image,
  })
}

/**
 * Generate features grid HTML from frontmatter
 */
// Map icon names to simple SVG icons (subset for common doc icons)
const featureIconMap: Record<string, string> = {
  Fast: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
  Shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  Blade: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  Tools: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  Components: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  Stream: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12h6l3-9 3 18 3-9h5"/></svg>',
  Desktop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>',
  Parser: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>',
  Icons: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
}

function getFeatureIcon(icon: string): string {
  // If it's an emoji or HTML, pass through
  if (icon.startsWith('<') || /\p{Emoji}/u.test(icon)) return icon
  // Check icon map
  return featureIconMap[icon] || `<span class="VPFeature-icon-text">${icon.charAt(0)}</span>`
}

async function generateFeatures(features: any[]): Promise<string> {
  if (!features || features.length === 0)
    return ''

  const items = features.map(feature => {
    const icon = feature.icon ? getFeatureIcon(feature.icon) : ''
    const iconHtml = icon ? `<div class="VPFeature-icon">${icon}</div>` : ''
    const link = feature.link
    const tag = link ? 'a' : 'div'
    const linkAttr = link ? ` href="${link}"` : ''
    return `
    <${tag} class="VPFeature"${linkAttr}>
      ${iconHtml}
      <h3 class="VPFeature-title">${feature.title || ''}</h3>
      <p class="VPFeature-details">${feature.details || ''}</p>
    </${tag}>`
  }).join('')

  return await render('features', {
    items,
  })
}

/**
 * Process inline markdown formatting
 * Supports: bold, italic, strikethrough, code, links, subscript, superscript, mark
 */
function processInlineFormatting(text: string): string {
  return text
    // Bold - both ** and __
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Strikethrough ~~
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Mark/highlight ==
    .replace(/==(.+?)==/g, '<mark>$1</mark>')
    // Superscript ^
    .replace(/\^(.+?)\^/g, '<sup>$1</sup>')
    // Code ` (before italic to avoid conflicts)
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Italic - both * and _ (single, not double)
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    .replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>')
    // Subscript ~ (single, not double like strikethrough)
    .replace(/(?<!~)~(?!~)(.+?)(?<!~)~(?!~)/g, '<sub>$1</sub>')
    // Images with optional caption (must be before links to avoid conflicts)
    // Matches: ![alt](src "caption") or ![alt](src) or ![alt]( src "caption")
    .replace(/!\[([^\]]*)\]\(\s*([^\s")]+)(?:\s+"([^"]+)")?\)/g, (_match, alt, src, caption) => {
      if (caption) {
        // Image with caption - wrap in figure/figcaption
        return `<figure class="image-figure"><img src="${src}" alt="${alt}" loading="lazy" decoding="async"><figcaption>${caption}</figcaption></figure>`
      }
      else {
        // Regular image without caption
        return `<img src="${src}" alt="${alt}" loading="lazy" decoding="async">`
      }
    })
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
}

/**
 * Process emoji shortcodes like :tada:, :rocket:, etc.
 * Converts emoji shortcodes to their Unicode equivalents
 */
function processEmoji(content: string): string {
  const emojiMap: Record<string, string> = {
    // Smileys & Emotion
    'smile': '😄',
    'laughing': '😆',
    'blush': '😊',
    'heart_eyes': '😍',
    'kissing_heart': '😘',
    'relaxed': '☺️',
    'wink': '😉',
    'grin': '😁',
    'joy': '😂',
    'sweat_smile': '😅',
    'rofl': '🤣',
    'thinking': '🤔',
    'zipper_mouth': '🤐',
    'neutral_face': '😐',
    'expressionless': '😑',
    'confused': '😕',
    'worried': '😟',
    'slightly_frowning_face': '🙁',
    'frowning_face': '☹️',
    'persevere': '😣',
    'disappointed': '😞',
    'sweat': '😓',
    'tired_face': '😫',
    'cry': '😢',
    'sob': '😭',
    'triumph': '😤',
    'angry': '😠',
    'rage': '😡',
    'no_mouth': '😶',
    'sleeping': '😴',
    '+1': '👍',
    'thumbsup': '👍',
    '-1': '👎',
    'thumbsdown': '👎',
    'clap': '👏',
    'raised_hands': '🙌',
    'pray': '🙏',
    'wave': '👋',
    'ok_hand': '👌',
    'point_up': '☝️',
    'point_down': '👇',
    'point_left': '👈',
    'point_right': '👉',
    'muscle': '💪',

    // Symbols & Signs
    'heart': '❤️',
    'blue_heart': '💙',
    'green_heart': '💚',
    'yellow_heart': '💛',
    'purple_heart': '💜',
    'broken_heart': '💔',
    'sparkling_heart': '💖',
    'star': '⭐',
    'star2': '🌟',
    'sparkles': '✨',
    'boom': '💥',
    'fire': '🔥',
    'tada': '🎉',
    'confetti_ball': '🎊',
    'rocket': '🚀',
    'zap': '⚡',
    'bulb': '💡',
    'bell': '🔔',
    'mega': '📣',
    'loudspeaker': '📢',
    'warning': '⚠️',
    'white_check_mark': '✅',
    'check': '✅',
    'x': '❌',
    'heavy_check_mark': '✔️',
    'heavy_multiplication_x': '✖️',
    'question': '❓',
    'grey_question': '❔',
    'exclamation': '❗',
    'grey_exclamation': '❕',
    'heavy_plus_sign': '➕',
    'heavy_minus_sign': '➖',

    // Objects & Tools
    'pencil2': '✏️',
    'memo': '📝',
    'book': '📖',
    'books': '📚',
    'bookmark': '🔖',
    'mag': '🔍',
    'mag_right': '🔎',
    'lock': '🔒',
    'unlock': '🔓',
    'key': '🔑',
    'link': '🔗',
    'computer': '💻',
    'email': '📧',
    'inbox_tray': '📥',
    'outbox_tray': '📤',
    'package': '📦',
    'file_folder': '📁',
    'open_file_folder': '📂',
    'page_facing_up': '📄',
    'calendar': '📅',
    'chart_with_upwards_trend': '📈',
    'chart_with_downwards_trend': '📉',
    'bar_chart': '📊',
    'clipboard': '📋',
    'pushpin': '📌',
    'round_pushpin': '📍',
    'paperclip': '📎',
    'straight_ruler': '📏',
    'wrench': '🔧',
    'hammer': '🔨',
    'gear': '⚙️',
    'nut_and_bolt': '🔩',

    // Nature & Animals
    'seedling': '🌱',
    'evergreen_tree': '🌲',
    'deciduous_tree': '🌳',
    'palm_tree': '🌴',
    'cactus': '🌵',
    'herb': '🌿',
    'shamrock': '☘️',
    'four_leaf_clover': '🍀',
    'bug': '🐛',
    'bee': '🐝',
    'bird': '🐦',
    'dog': '🐶',
    'cat': '🐱',
    'penguin': '🐧',
    'turtle': '🐢',
    'fish': '🐟',

    // Food & Drink
    'coffee': '☕',
    'tea': '🍵',
    'beer': '🍺',
    'beers': '🍻',
    'wine_glass': '🍷',
    'pizza': '🍕',
    'hamburger': '🍔',
    'fries': '🍟',
    'cake': '🍰',
    'birthday': '🎂',
    'cookie': '🍪',
    'doughnut': '🍩',
    'apple': '🍎',
    'green_apple': '🍏',
    'banana': '🍌',
    'strawberry': '🍓',

    // Places & Transportation
    'house': '🏠',
    'office': '🏢',
    'hospital': '🏥',
    'school': '🏫',
    'car': '🚗',
    'taxi': '🚕',
    'bus': '🚌',
    'train': '🚂',
    'airplane': '✈️',
    'ship': '🚢',
    'bike': '🚲',

    // Activities & Events
    'soccer': '⚽',
    'basketball': '🏀',
    'football': '🏈',
    'baseball': '⚾',
    'tennis': '🎾',
    'trophy': '🏆',
    'medal': '🏅',
    'dart': '🎯',
    'game_die': '🎲',
    'musical_note': '🎵',
    'notes': '🎶',
    'art': '🎨',
    'camera': '📷',
    'movie_camera': '🎥',

    // Flags (common ones)
    'checkered_flag': '🏁',
    'triangular_flag_on_post': '🚩',
    'flag_us': '🇺🇸',
    'flag_gb': '🇬🇧',
    'flag_fr': '🇫🇷',
    'flag_de': '🇩🇪',
    'flag_jp': '🇯🇵',
    'flag_cn': '🇨🇳',
  }

  // Replace emoji shortcodes with Unicode emoji
  return content.replace(/:(\w+):/g, (match, shortcode) => {
    return emojiMap[shortcode] || match
  })
}

/**
 * Process inline badges like <Badge type="info" text="v2.0" />
 * Supports types: info, tip, warning, danger
 */
function processBadges(content: string): string {
  // Match <Badge> components with type and text attributes in any order
  // Fixed: use [^/>]+ to avoid backtracking with \s+
  const badgeRegex = /<Badge([^/>]+)\/>/gi

  return content.replace(badgeRegex, (_match, attributes) => {
    const typeMatch = attributes.match(/type="(info|tip|warning|danger)"/i)
    const textMatch = attributes.match(/text="([^"]+)"/)
    const type = typeMatch ? typeMatch[1].toLowerCase() : 'info'
    const text = textMatch ? textMatch[1] : ''
    return `<span class="badge badge-${type}">${text}</span>`
  })
}

/**
 * Process external links in HTML to add target="_blank" and rel="noreferrer"
 */
function processExternalLinksHtml(html: string): string {
  // Match HTML anchor tags
  return html.replace(/<a\s+href="([^"]+)"([^>]*)>/g, (match, url, rest) => {
    // Skip if already has target attribute
    if (rest.includes('target='))
      return match

    // Check if it's an external link (starts with http:// or https://)
    const isExternal = url.startsWith('http://') || url.startsWith('https://')

    if (isExternal) {
      // Add external link attributes (icon removed as unused)
      return `<a href="${url}" target="_blank" rel="noreferrer noopener"${rest}>`
    }

    // Internal link - keep as is
    return match
  })
}

/**
 * Add external link icons to links with target="_blank"
 */
function addExternalLinkIcons(html: string): string {
  // Find </a> tags that belong to external links (those with target="_blank")
  // Use [\s\S]+? to also match links containing HTML (e.g. <code>, <strong>)
  return html.replace(/<a\s+href="([^"]+)"\s+target="_blank"[^>]*>[\s\S]+?<\/a>/g, (match, _url) => {
    // Don't add icon if it already has one
    if (match.includes('external-link-icon'))
      return match

    const externalIcon = '<svg class="external-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>'
    return match.replace('</a>', `${externalIcon}</a>`)
  })
}

/**
 * Post-process images in HTML to add lazy loading
 */
function processImagesHtml(html: string): string {
  // Add lazy loading to img tags without loading attribute
  return html.replace(/<img([^>]+)>/g, (match, attrs) => {
    if (attrs.includes('loading='))
      return match

    return `<img ${attrs} loading="lazy" decoding="async">`
  })
}

/**
 * Extract TOC data from markdown content
 * Returns the TOC HTML and content with placeholder
 */
function extractTocData(content: string, tocConfig?: any): { content: string, tocHtml: string | null } {
  // Check if content contains [[toc]] macro
  if (!content.includes('[[toc]]')) {
    return { content, tocHtml: null }
  }

  // Extract headings from the content
  const headings = extractHeadings(content)

  // Apply config filters
  const config = { ...defaultTocConfig, ...tocConfig }
  const filteredHeadings = filterHeadings(headings, config)

  // Build hierarchy
  const hierarchicalHeadings = buildTocHierarchy(filteredHeadings)

  // Generate inline TOC HTML
  const tocData = {
    items: hierarchicalHeadings,
    title: config.title || 'Table of Contents',
    config,
  }

  const tocHtml = generateInlineTocHtml(tocData)

  // Replace [[toc]] with a placeholder that won't be affected by markdown processing
  const placeholder = '<!--INLINE_TOC_PLACEHOLDER-->'
  const contentWithPlaceholder = content.replace(/\[\[toc\]\]/g, placeholder)

  return { content: contentWithPlaceholder, tocHtml }
}

/**
 * Replace TOC placeholder with actual TOC HTML
 */
function injectTocHtml(html: string, tocHtml: string): string {
  return html.replace(/<!--INLINE_TOC_PLACEHOLDER-->/g, tocHtml)
}

/**
 * Process GitHub-flavored alerts like > [!NOTE], > [!TIP], etc.
 */
async function processGitHubAlerts(content: string): Promise<string> {
  const alertRegex = /^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n((?:>\s*.*\n?)*)/gm

  const matches = Array.from(content.matchAll(alertRegex))

  let result = content
  for (const match of matches.reverse()) {
    const [fullMatch, type, alertContent] = match

    // Remove the > prefix from each line of content
    const processedContent = alertContent
      .split('\n')
      .map(line => line.replace(/^>\s*/, ''))
      .filter(line => line.trim())
      .map(line => `<p>${processInlineFormatting(line)}</p>`)
      .join('\n')

    const alertType = type.toLowerCase()
    const alertHtml = await render(`blocks/alerts/${alertType}`, {
      content: processedContent,
    })

    result = result.slice(0, match.index) + alertHtml + result.slice(match.index! + fullMatch.length)
  }

  return result
}

/**
 * Process code imports from files
 * Syntax: <<< @/filepath or <<< @/filepath{1-10} or <<< @/filepath#region
 * Optional label: <<< @/filepath [label]
 */
async function processCodeImports(content: string, rootDir: string): Promise<string> {
  // Fixed: remove unnecessary escape character for [, keep escape for { as it's meaningful
  const importRegex = /^<<<\s+@\/([^\s[{#]+)(?:\{(\d+)-(\d+)\}|#(\w+))?\s*(?:\[[^\]]+\]\s*)?$/gm
  const matches = Array.from(content.matchAll(importRegex))

  let result = content
  for (const match of matches.reverse()) {
    const [fullMatch, filepath, startLine, endLine, regionName] = match

    try {
      // Resolve file path relative to root directory
      const { join } = await import('node:path')
      const fullPath = join(rootDir, filepath)

      // Read the file
      const file = Bun.file(fullPath)
      if (!(await file.exists())) {
        console.warn(`Code import: File not found: ${fullPath}`)
        continue
      }

      const fileContent = await file.text()
      let lines = fileContent.split('\n')

      // Extract language from file extension
      const ext = filepath.split('.').pop() || ''
      const langMap: Record<string, string> = {
        js: 'javascript',
        ts: 'typescript',
        jsx: 'jsx',
        tsx: 'tsx',
        py: 'python',
        rb: 'ruby',
        go: 'go',
        rs: 'rust',
        java: 'java',
        cpp: 'cpp',
        c: 'c',
        cs: 'csharp',
        php: 'php',
        sh: 'bash',
        bash: 'bash',
        yaml: 'yaml',
        yml: 'yaml',
        json: 'json',
        md: 'markdown',
        html: 'html',
        css: 'css',
        scss: 'scss',
        vue: 'vue',
      }
      const lang = langMap[ext] || ext

      // Process line range
      if (startLine && endLine) {
        const start = Number.parseInt(startLine) - 1 // Convert to 0-indexed
        const end = Number.parseInt(endLine)
        lines = lines.slice(start, end)
      }
      // Process region
      else if (regionName) {
        const regionStart = lines.findIndex(line =>
          line.includes(`#region ${regionName}`)
          || line.includes(`// region ${regionName}`)
          || line.includes(`# region ${regionName}`),
        )
        const regionEnd = lines.findIndex((line, idx) =>
          idx > regionStart && (line.includes('#endregion') || line.includes('// endregion') || line.includes('# endregion')),
        )

        if (regionStart !== -1 && regionEnd !== -1) {
          lines = lines.slice(regionStart + 1, regionEnd)
        }
        else {
          console.warn(`Code import: Region '${regionName}' not found in ${filepath}`)
        }
      }

      // Generate code block
      const code = lines.join('\n')
      const codeBlock = `\`\`\`${lang}\n${code}\n\`\`\``

      result = result.slice(0, match.index) + codeBlock + result.slice(match.index! + fullMatch.length)
    }
    catch (error) {
      console.error(`Error importing code from ${filepath}:`, error)
    }
  }

  return result
}

/**
 * Process markdown file inclusion
 * Syntax: <!--@include: ./filepath.md--> or <!--@include: ./filepath.md{10-20}--> or <!--@include: ./filepath.md{#region}-->
 */
async function processMarkdownIncludes(content: string, rootDir: string, processedFiles = new Set<string>()): Promise<string> {
  const includeRegex = /<!--@include:\s*([^\s{]+)(?:\{(\d+)-(\d+)\}|\{#([\w-]+)\})?\s*-->/g
  const matches = Array.from(content.matchAll(includeRegex))

  let result = content
  for (const match of matches.reverse()) {
    const [fullMatch, filepath, startLine, endLine, regionName] = match

    try {
      // Resolve file path relative to root directory
      const { join, resolve } = await import('node:path')
      const fullPath = resolve(join(rootDir, filepath))

      // Prevent circular includes
      if (processedFiles.has(fullPath)) {
        console.warn(`Markdown include: Circular reference detected for ${filepath}`)
        continue
      }

      // Read the file
      const file = Bun.file(fullPath)
      if (!(await file.exists())) {
        console.warn(`Markdown include: File not found: ${fullPath}`)
        continue
      }

      const fileContent = await file.text()
      let lines = fileContent.split('\n')

      // Process line range
      if (startLine && endLine) {
        const start = Number.parseInt(startLine) - 1 // Convert to 0-indexed
        const end = Number.parseInt(endLine)
        lines = lines.slice(start, end)
      }
      // Process region
      else if (regionName) {
        const regionStart = lines.findIndex(line =>
          line.includes(`<!-- #region ${regionName} -->`)
          || line.includes(`<!-- region ${regionName} -->`),
        )
        const regionEnd = lines.findIndex((line, idx) =>
          idx > regionStart && (line.includes('<!-- #endregion -->') || line.includes('<!-- endregion -->')),
        )

        if (regionStart !== -1 && regionEnd !== -1) {
          lines = lines.slice(regionStart + 1, regionEnd)
        }
        else {
          console.warn(`Markdown include: Region '${regionName}' not found in ${filepath}`)
          continue // Skip this include if region not found
        }
      }

      let includedContent = lines.join('\n')

      // Mark this file as processed to prevent circular includes
      const newProcessedFiles = new Set(processedFiles)
      newProcessedFiles.add(fullPath)

      // Recursively process includes in the included file
      includedContent = await processMarkdownIncludes(includedContent, rootDir, newProcessedFiles)

      result = result.slice(0, match.index) + includedContent + result.slice(match.index! + fullMatch.length)
    }
    catch (error) {
      console.error(`Error including markdown from ${filepath}:`, error)
    }
  }

  return result
}

/**
 * Process code groups (tabbed code blocks)
 */
// eslint-disable-next-line pickier/no-unused-vars
async function processCodeGroups(content: string): Promise<string> {
  // Fixed: use (?:(?!^:::)[\s\S])* instead of [\s\S]*? to avoid backtracking with \s*
  const codeGroupRegex = /^:::\s+code-group[ \t]*\n((?:(?!^:::)[\s\S])*)^:::$/gm
  const matches = Array.from(content.matchAll(codeGroupRegex))

  let result = content
  for (const match of matches.reverse()) {
    const [fullMatch, innerContent] = match

    // Extract individual code blocks with labels
    // Fixed: use (?:(?!^```)[\s\S])* to avoid backtracking with \s*
    const codeBlockRegex = /^```(\w+)[ \t]+\[([^\]]+)\][ \t]*\n((?:(?!^```)[\s\S])*)^```$/gm
    const codeBlocks = Array.from(innerContent.matchAll(codeBlockRegex))

    if (codeBlocks.length === 0)
      continue

    // Generate unique ID for this code group
    const groupId = `code-group-${Math.random().toString(36).substr(2, 9)}`

    // Generate tab buttons HTML
    const tabsHtml = codeBlocks
      .map((block, index) => {
        const label = block[2]
        const isActive = index === 0
        return `<button class="code-group-tab${isActive ? ' active' : ''}" onclick="switchCodeTab('${groupId}', ${index})">${label}</button>`
      })
      .join('')

    // Generate code panels HTML
    const panelsHtml = await Promise.all(
      codeBlocks.map(async (block, index) => {
        const lang = block[1]
        const code = block[3]
        const isActive = index === 0

        // Apply syntax highlighting to the code
        const theme = config.markdown?.syntaxHighlightTheme || 'github-light'
        const highlightedCode = await highlightCode(code, lang, theme)

        const preHtml = `<pre data-lang="${lang}"><code class="language-${lang}">${highlightedCode}</code></pre>`
        return `<div class="code-group-panel${isActive ? ' active' : ''}" data-panel="${index}">\n  ${preHtml}\n</div>`
      }),
    )

    const codeGroupHtml = [
      `<div class="code-group" id="${groupId}">`,
      `  <div class="code-group-tabs">`,
      `    ${tabsHtml}`,
      `  </div>`,
      `  <div class="code-group-panels">`,
      `    ${panelsHtml.join('\n')}`,
      `  </div>`,
      `</div>`,
    ].join('\n')

    result = result.slice(0, match.index) + codeGroupHtml + result.slice(match.index! + fullMatch.length)
  }

  return result
}

/**
 * Process custom containers like ::: info, ::: tip, etc.
 */
async function processContainers(content: string): Promise<string> {
  // Fixed: use (?:(?!^:::)[\s\S])* to avoid backtracking, use [^\n\t ]+ then [^\n]* to avoid backtracking
  const containerRegex = /^:::\s+(info|tip|warning|danger|details|raw)(?: +([^\n\t ][^\n]*))?\n((?:(?!^:::)[\s\S])*)^:::$/gm

  const matches = Array.from(content.matchAll(containerRegex))

  let result = content
  for (const match of matches.reverse()) { // Process in reverse to maintain correct indices
    const [fullMatch, type, customTitle, innerContent] = match
    const defaultTitles: Record<string, string> = {
      info: 'INFO',
      tip: 'TIP',
      warning: 'WARNING',
      danger: 'DANGER',
      details: 'Details',
      raw: '',
    }

    const title = (customTitle && customTitle.trim()) || defaultTitles[type]

    // Process inner content (convert markdown to HTML)
    const processedContent = innerContent
      .trim()
      .split('\n')
      .filter(line => line.trim())
      .map(line => `<p>${processInlineFormatting(line)}</p>`)
      .join('\n')

    const containerHtml = await render(`blocks/containers/${type}`, {
      title,
      content: processedContent,
    })

    result = result.slice(0, match.index) + containerHtml + result.slice(match.index! + fullMatch.length)
  }

  return result
}

/**
 * Parse code fence info string to extract language, line highlights, and flags
 * Examples:
 * - js{4} -> { lang: 'js', highlights: [4], showLineNumbers: false }
 * - ts{1,4,6-8}:line-numbers -> { lang: 'ts', highlights: [1,4,6,7,8], showLineNumbers: true }
 */
function parseCodeFenceInfo(infoString: string): {
  lang: string
  highlights: number[]
  showLineNumbers: boolean
} {
  // Extract language (everything before { or :)
  const langMatch = infoString.match(/^(\w+)/)
  const lang = langMatch ? langMatch[1] : ''

  // Extract line highlights
  const highlightMatch = infoString.match(/\{([^}]+)\}/)
  const highlights: number[] = []

  if (highlightMatch) {
    const ranges = highlightMatch[1].split(',')
    for (const range of ranges) {
      const trimmed = range.trim()
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(Number)
        for (let i = start; i <= end; i++) {
          highlights.push(i)
        }
      }
      else {
        highlights.push(Number(trimmed))
      }
    }
  }

  // Check for :line-numbers flag
  const showLineNumbers = infoString.includes(':line-numbers')

  return { lang, highlights, showLineNumbers }
}

/**
 * Process code blocks with advanced features (line highlighting, line numbers, focus, etc.)
 */
// eslint-disable-next-line pickier/no-unused-vars
async function processCodeBlock(lines: string[], startIndex: number): Promise<{ html: string, endIndex: number }> {
  const firstLine = lines[startIndex]

  // Count the number of backticks in the opening fence (supports 3, 4, 5+ backticks)
  const backtickMatch = firstLine.match(/^(`{3,})/)
  const fenceLength = backtickMatch ? backtickMatch[1].length : 3
  const _closingFence = '`'.repeat(fenceLength)

  const infoString = firstLine.substring(fenceLength).trim() // Remove opening backticks

  // Parse info string
  const { lang, highlights, showLineNumbers } = parseCodeFenceInfo(infoString)

  // Collect code content
  const codeLines: string[] = []
  let endIndex = startIndex + 1

  // Only end at a fence with the same or more backticks
  while (endIndex < lines.length) {
    const line = lines[endIndex]
    // Check if this line is a closing fence (same length or more backticks, nothing else)
    if (line.match(new RegExp(`^\`{${fenceLength},}\\s*$`))) {
      break
    }
    codeLines.push(line)
    endIndex++
  }

  // Detect focus, diff, error, warning, and other markers
  const focusLines = new Set<number>()
  const diffAddLines = new Set<number>()
  const diffRemoveLines = new Set<number>()
  const errorLines = new Set<number>()
  const warningLines = new Set<number>()

  const processedLines = codeLines.map((line, index) => {
    let processedLine = line

    // Check for focus marker
    if (processedLine.includes('// [!code focus]')) {
      focusLines.add(index)
      processedLine = processedLine.replace(/\/\/ \[!code focus\]/, '').trimEnd()
    }

    // Check for diff add marker
    if (processedLine.includes('// [!code ++]')) {
      diffAddLines.add(index)
      processedLine = processedLine.replace(/\/\/ \[!code \+\+\]/, '').trimEnd()
    }

    // Check for diff remove marker
    if (processedLine.includes('// [!code --]')) {
      diffRemoveLines.add(index)
      processedLine = processedLine.replace(/\/\/ \[!code --\]/, '').trimEnd()
    }

    // Check for error marker
    if (processedLine.includes('// [!code error]')) {
      errorLines.add(index)
      processedLine = processedLine.replace(/\/\/ \[!code error\]/, '').trimEnd()
    }

    // Check for warning marker
    if (processedLine.includes('// [!code warning]')) {
      warningLines.add(index)
      processedLine = processedLine.replace(/\/\/ \[!code warning\]/, '').trimEnd()
    }

    return processedLine
  })

  const hasFocusedLines = focusLines.size > 0

  // Apply syntax highlighting to the entire code block
  const code = processedLines.join('\n')
  const theme = config.markdown?.syntaxHighlightTheme || 'github-light'
  const highlightedCode = await highlightCode(code, lang, theme)

  // Split highlighted code back into lines
  const highlightedLines = highlightedCode.split('\n')

  // Generate HTML with all features (highlighting, focus, diff, error, warning, line numbers)
  const codeHtml = highlightedLines
    // eslint-disable-next-line pickier/no-unused-vars
    .map((line, index) => {
      const lineNumber = index + 1
      const isHighlighted = highlights.includes(lineNumber)
      const isFocused = focusLines.has(index)
      const isDiffAdd = diffAddLines.has(index)
      const isDiffRemove = diffRemoveLines.has(index)
      const isError = errorLines.has(index)
      const isWarning = warningLines.has(index)

      const classes: string[] = ['line'] // Always include 'line' class
      if (isHighlighted)
        classes.push('highlighted')
      if (isFocused)
        classes.push('focused')
      if (hasFocusedLines && !isFocused)
        classes.push('dimmed')
      if (isDiffAdd)
        classes.push('diff-add')
      if (isDiffRemove)
        classes.push('diff-remove')
      if (isError)
        classes.push('has-error')
      if (isWarning)
        classes.push('has-warning')

      // Check if line already has <span class="line"> from highlighter
      // If so, merge our classes with the existing line span
      if (line.startsWith('<span class="line">')) {
        // Merge our classes with existing 'line' class
        const allClasses = classes.join(' ')
        // Replace the opening tag to include all classes
        const updatedLine = line.replace('<span class="line">', `<span class="${allClasses}">`)

        // Add line number if enabled
        if (showLineNumbers) {
          // Insert line number after opening span
          return `<span class="${classes.join(' ')}"><span class="line-number">${lineNumber}</span>${updatedLine.replace(/^<span class="[^"]*">/, '').replace(/<\/span>$/, '')}</span>`
        }

        return updatedLine
      }

      const lineClass = classes.length > 0 ? ` class="${classes.join(' ')}"` : ''

      // Add line number if enabled
      if (showLineNumbers) {
        return `<span${lineClass}><span class="line-number">${lineNumber}</span>${line}</span>`
      }

      return `<span${lineClass}>${line}</span>`
    })
    .join('\n')

  const preClasses: string[] = []
  if (showLineNumbers)
    preClasses.push('line-numbers-mode')
  if (hasFocusedLines)
    preClasses.push('has-focused-lines')

  const preClass = preClasses.length > 0 ? ` class="${preClasses.join(' ')}"` : ''
  const dataLang = lang ? ` data-lang="${lang}"` : ''
  const html = `<pre${preClass}${dataLang}><code class="language-${lang}">${codeHtml}</code></pre>`

  return { html, endIndex }
}

/**
 * Pre-process headings to extract custom anchor syntax ({#custom-id})
 * Returns the processed content with {#id} removed and a map of heading text to custom ID
 */
function preprocessCustomAnchors(content: string): { content: string, customAnchors: Map<string, string> } {
  const customAnchors = new Map<string, string>()

  const processed = content.replace(/^(#{1,6})\s+(.*?)\s*\{#([\w-]+)\}\s*$/gm, (_match, hashes, text, id) => {
    // Clean markdown formatting from key so it matches the plain text extracted from HTML
    const cleanKey = text.trim()
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/_(.+?)_/g, '$1')
      .replace(/~~(.+?)~~/g, '$1')
      .trim()
    customAnchors.set(cleanKey, id)
    return `${hashes} ${text.trim()}`
  })

  return { content: processed, customAnchors }
}

/**
 * Extract fenced code blocks, process them with syntax highlighting,
 * and replace with HTML comment placeholders for Bun.markdown
 */
async function extractAndProcessCodeBlocks(content: string, codeBlockMap: Map<string, string>): Promise<string> {
  const lines = content.split('\n')
  const result: string[] = []
  let i = 0
  let placeholderIndex = 0

  while (i < lines.length) {
    const line = lines[i]

    // Check for code block start (3+ backticks at start of line)
    if (line.match(/^`{3,}/)) {
      const { html, endIndex } = await processCodeBlock(lines, i)
      const placeholder = `<!--BUNPRESS_CODE_${placeholderIndex++}-->`
      codeBlockMap.set(placeholder, html)
      // Surround with blank lines so Bun.markdown treats it as block-level HTML
      result.push('')
      result.push(placeholder)
      result.push('')
      i = endIndex + 1
    }
    else {
      result.push(line)
      i++
    }
  }

  return result.join('\n')
}

/**
 * Post-process custom inline formatting that Bun.markdown doesn't handle
 */
function postProcessCustomInline(html: string): string {
  // Mark/highlight ==text==
  html = html.replace(/==(.+?)==/g, '<mark>$1</mark>')
  // Superscript ^text^
  html = html.replace(/\^(.+?)\^/g, '<sup>$1</sup>')
  // Subscript ~text~ (single tilde, not double like strikethrough)
  html = html.replace(/(?<!~)~(?!~)(.+?)(?<!~)~(?!~)/g, '<sub>$1</sub>')

  return html
}

/**
 * Post-process tables to add BunPress-specific enhanced classes and responsive wrapper
 */
function postProcessTables(html: string): string {
  // Wrap <table> in responsive div and add enhanced class
  html = html.replace(/<table>/g, '<div class="table-responsive">\n<table class="enhanced-table">')
  html = html.replace(/<\/table>/g, '</table>\n</div>')

  // Convert align attributes to inline styles (Bun.markdown uses align="..." on th/td)
  html = html.replace(/<(th|td) align="(left|center|right)">/g, (_match: string, tag: string, align: string) => {
    return `<${tag} style="text-align: ${align}">`
  })

  // Add default left alignment to cells without alignment
  html = html.replace(/<(th|td)>/g, (_match: string, tag: string) => {
    return `<${tag} style="text-align: left">`
  })

  return html
}

/**
 * Post-process headings to add ID attributes
 * Uses custom anchors where available, auto-generates slugs otherwise
 */
function postProcessHeadings(html: string, customAnchors: Map<string, string>): string {
  const usedSlugs = new Set<string>()

  return html.replace(/<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/g, (match, level, attrs, content) => {
    // Skip if already has an id
    if (attrs.includes(' id=')) return match

    // Get plain text content (strip HTML tags) for ID generation
    const plainText = content.replace(/<[^>]+>/g, '').trim()

    // Check for custom anchor
    let id = customAnchors.get(plainText)

    if (!id) {
      // Auto-generate slug from text
      id = generateSlug(plainText)
    }

    // Handle duplicate slugs
    if (usedSlugs.has(id)) {
      let counter = 1
      while (usedSlugs.has(`${id}-${counter}`)) {
        counter++
      }
      id = `${id}-${counter}`
    }
    usedSlugs.add(id)

    return `<h${level} id="${id}"${attrs}>${content}</h${level}>`
  })
}

/**
 * Convert markdown to HTML using Bun's built-in markdown parser
 * See: https://bun.com/docs/runtime/markdown
 */
export async function markdownToHtml(markdown: string, rootDir: string = './docs'): Promise<{ html: string, frontmatter: any }> {
  // Parse frontmatter
  const { frontmatter, content } = parseFrontmatter(markdown)

  // If it's a home layout, generate hero and features
  if (frontmatter.layout === 'home') {
    const heroHtml = await generateHero(frontmatter.hero)
    const featuresHtml = await generateFeatures(frontmatter.features)
    return {
      html: heroHtml + featuresHtml,
      frontmatter,
    }
  }

  // Resolve feature toggles from config (all default to true)
  const features = (config as BunPressConfig).markdown?.features
  const featureEnabled = (key: keyof import('./types').MarkdownFeaturesConfig): boolean => {
    if (!features) return true
    const val = features[key]
    // boolean or object config — treat object as enabled
    return val === undefined || val === true || (typeof val === 'object' && val !== null)
  }

  // Process markdown includes first (before everything else)
  let processedContent = featureEnabled('includes')
    ? await processMarkdownIncludes(content, rootDir)
    : content

  // Process stx template syntax in markdown (@if, @foreach, {{ }}, <script server>, etc.)
  // This allows dynamic content generation in .md files using stx directives.
  // Strip fenced code blocks before checking — code examples containing {{ }}
  // or @if are documentation, not live stx expressions.
  const contentWithoutCodeBlocks = processedContent.replace(/```[\s\S]*?```/g, '')
  const hasStxSyntax = contentWithoutCodeBlocks.includes('@if')
    || contentWithoutCodeBlocks.includes('@foreach')
    || contentWithoutCodeBlocks.includes('@for (')
    || contentWithoutCodeBlocks.includes('<script server')
    || contentWithoutCodeBlocks.includes('@include')
    || /\{\{(?!\{)\s*\w/.test(contentWithoutCodeBlocks)
  if (hasStxSyntax) {
    try {
      const stx = await import('@stacksjs/stx')
      processedContent = await stx.renderString(processedContent, { ...frontmatter }, { templateOnly: true })
    }
    catch {
      // stx not available or render failed — continue with raw content
    }
  }

  // Extract TOC data early (before any processing that modifies headings)
  const { content: contentWithTocPlaceholder, tocHtml } = featureEnabled('inlineToc')
    ? extractTocData(processedContent, frontmatter.toc)
    : { content: processedContent, tocHtml: '' }

  // Process in order: code imports, code groups, GitHub alerts, containers, emoji, badges
  // NOTE: Links and images are processed AFTER HTML conversion to avoid conflicts
  processedContent = featureEnabled('codeImports')
    ? await processCodeImports(contentWithTocPlaceholder, rootDir)
    : contentWithTocPlaceholder
  processedContent = featureEnabled('codeGroups')
    ? await processCodeGroups(processedContent)
    : processedContent
  processedContent = featureEnabled('githubAlerts')
    ? await processGitHubAlerts(processedContent)
    : processedContent
  processedContent = featureEnabled('containers')
    ? await processContainers(processedContent)
    : processedContent
  processedContent = featureEnabled('emoji')
    ? processEmoji(processedContent)
    : processedContent
  processedContent = featureEnabled('badges')
    ? processBadges(processedContent)
    : processedContent

  // Pre-process custom header anchors ({#custom-id})
  const { content: contentWithoutAnchors, customAnchors } = featureEnabled('customAnchors')
    ? preprocessCustomAnchors(processedContent)
    : { content: processedContent, customAnchors: new Map<string, string>() }
  processedContent = contentWithoutAnchors

  // Extract and process code blocks with syntax highlighting
  // Replace with placeholders so Bun.markdown doesn't interfere
  const codeBlockMap = new Map<string, string>()
  processedContent = featureEnabled('codeBlocks')
    ? await extractAndProcessCodeBlocks(processedContent, codeBlockMap)
    : processedContent

  // Use Bun's built-in markdown parser for core markdown-to-HTML conversion
  // See: https://bun.com/docs/runtime/markdown
  let finalHtml = Bun.markdown.html(processedContent, {
    tables: true,
    strikethrough: true,
    tasklists: true,
    autolinks: true,
  })

  // Restore code block placeholders with actual highlighted HTML
  for (const [placeholder, codeHtml] of codeBlockMap) {
    // Handle case where placeholder might get wrapped in <p> tags
    finalHtml = finalHtml.replace(`<p>${placeholder}</p>`, codeHtml)
    finalHtml = finalHtml.replace(placeholder, codeHtml)
  }

  // Post-process custom inline formatting (==mark==, ^sup^, ~sub~)
  if (featureEnabled('inlineFormatting')) {
    finalHtml = postProcessCustomInline(finalHtml)
  }

  // Post-process tables to add enhanced classes and responsive wrapper
  if (featureEnabled('tables')) {
    finalHtml = postProcessTables(finalHtml)
  }

  // Post-process headings to add IDs (custom anchors or auto-generated)
  finalHtml = postProcessHeadings(finalHtml, customAnchors)

  // Inject TOC HTML if it was extracted
  if (tocHtml) {
    finalHtml = injectTocHtml(finalHtml, tocHtml)
  }

  // Process external links and images in the final HTML
  if (featureEnabled('externalLinks')) {
    finalHtml = processExternalLinksHtml(finalHtml)
    finalHtml = addExternalLinkIcons(finalHtml)
  }
  if (featureEnabled('imageLazyLoading')) {
    finalHtml = processImagesHtml(finalHtml)
  }

  return {
    html: finalHtml,
    frontmatter,
  }
}

/**
 * Start the BunPress documentation server
 */
export async function startServer(options: {
  port?: number
  root?: string
  watch?: boolean
  quiet?: boolean
  config?: BunPressConfig
} = {}): Promise<{ server: any, url: string, stop: () => void }> {
  const bunPressConfig = options.config || config as BunPressConfig
  const port = options.port || 3000
  const root = options.root || './docs'

  const server = Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url)
      let path = url.pathname

      // Serve root as index
      if (path === '/') {
        path = '/index'
      }

      // Try to serve static files first (images, css, js, etc.)
      const staticExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.css', '.js', '.ico', '.woff', '.woff2', '.ttf']
      if (staticExtensions.some(ext => path.endsWith(ext))) {
        try {
          // Try root/public first
          const publicPath = `${root}/public${path}`
          const publicFile = Bun.file(publicPath)
          if (await publicFile.exists()) {
            return new Response(publicFile)
          }

          // Try root directly
          const rootPath = `${root}${path}`
          const rootFile = Bun.file(rootPath)
          if (await rootFile.exists()) {
            return new Response(rootFile)
          }
        }
        catch {
          // Continue to 404
        }
      }

      // Try to serve markdown file
      const mdPath = `${root}${path}.md`
      try {
        const mdFile = Bun.file(mdPath)
        if (await mdFile.exists()) {
          const markdown = await mdFile.text()
          const { html, frontmatter } = await markdownToHtml(markdown, root)
          const layout = frontmatter.layout || 'doc'
          const wrappedHtml = await wrapInLayout(html, bunPressConfig, path, layout)
          return new Response(wrappedHtml, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          })
        }
      }
      catch {
        // Continue to 404
      }

      // 404 response
      return new Response(
        await wrapInLayout(
          '<h1>404 - Page Not Found</h1><p>The page you are looking for does not exist.</p>',
          bunPressConfig,
          path,
        ),
        {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        },
      )
    },
  })

  const url = `http://localhost:${server.port}`
  const stop = () => server.stop()

  if (!options.quiet) {
    console.log(`\n📚 BunPress documentation server running at ${url}`)
    console.log('Press Ctrl+C to stop\n')
  }

  return { server, url, stop }
}

/**
 * CLI-friendly server start function with graceful shutdown
 */
export async function serveCLI(options: {
  port?: number
  root?: string
  watch?: boolean
  config?: BunPressConfig
} = {}): Promise<void> {
  const { stop } = await startServer(options)
  const watch = options.watch !== undefined ? options.watch : true
  const root = options.root || './docs'

  // Watch for changes
  if (watch) {
    console.log(`Watching for changes in ${root} directory...\n`)

    try {
      // Track file modification times
      const fileStats = new Map<string, number>()

      // Initialize file stats
      const glob = new Glob('**/*.{md,stx,ts,js,css,html}')
      for await (const file of glob.scan(root)) {
        try {
          const filePath = join(root, file)
          const stats = await stat(filePath)
          fileStats.set(file, stats.mtimeMs)
        }
        catch {
          // Ignore files that can't be stat'd
        }
      }

      let timeout: Timer | null = null
      const rebuildDebounced = () => {
        if (timeout)
          clearTimeout(timeout)
        timeout = setTimeout(async () => {
          console.log('File changed detected, reloading...')
          // Clear template cache to pick up template changes
          clearTemplateCache()
          // The server will automatically serve the updated files on next request
          console.log('Ready for requests')
        }, 100) // Debounce 100ms
      }

      // Use file polling for simplicity
      setInterval(async () => {
        try {
          let hasChanges = false
          const currentFiles = new Set<string>()

          const glob = new Glob('**/*.{md,stx,ts,js,css,html}')
          for await (const file of glob.scan(root)) {
            currentFiles.add(file)
            try {
              const filePath = join(root, file)
              const stats = await stat(filePath)
              const lastMtime = fileStats.get(file)

              // Check if file is new or modified
              if (lastMtime === undefined || stats.mtimeMs > lastMtime) {
                hasChanges = true
                fileStats.set(file, stats.mtimeMs)
              }
            }
            catch {
              // Ignore files that can't be stat'd
            }
          }

          // Check for deleted files
          for (const trackedFile of fileStats.keys()) {
            if (!currentFiles.has(trackedFile)) {
              hasChanges = true
              fileStats.delete(trackedFile)
            }
          }

          if (hasChanges) {
            rebuildDebounced()
          }
        }
        catch {
          // Ignore errors during polling
        }
      }, 1000) // Check every second
    }
    catch (err) {
      console.error('Error setting up file watcher:', err)
    }
  }

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down server...')
    stop()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    console.log('\nShutting down server...')
    stop()
    process.exit(0)
  })

  // Keep process alive
  await new Promise(() => {})
}

// Start server if run directly
if (import.meta.main) {
  serveCLI().catch(console.error)
}
