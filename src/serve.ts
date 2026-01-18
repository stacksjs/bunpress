/* eslint-disable no-console */
import type { BunPressConfig } from './types'
import { Glob, YAML } from 'bun'
import { stat } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { config } from './config'
import { getSyntaxHighlightingStyles, highlightCode } from './highlighter'
import { clearTemplateCache, render } from './template-loader'
import { getThemeCSS } from './themes'
import { buildTocHierarchy, defaultTocConfig, extractHeadings, filterHeadings, generateInlineTocHtml } from './toc'

/**
 * Generate sidebar HTML from BunPress config
 */
async function generateSidebar(config: BunPressConfig, currentPath: string): Promise<string> {
  if (!config.markdown?.sidebar) {
    return ''
  }

  // Get sidebar for current path or default '/' sidebar
  const pathKey = Object.keys(config.markdown.sidebar).find(key =>
    currentPath.startsWith(key),
  ) || '/'

  const sidebarSections = config.markdown.sidebar[pathKey] || []

  const sectionsHtml = await Promise.all(sidebarSections.map(async (section) => {
    const itemsHtml = section.items
      ? section.items.map((item) => {
          // Prepend /docs to internal links for static build
          // Skip if already has /docs or is external (http/https)
          let link = item.link
          if (link && !link.startsWith('http') && !link.startsWith('/docs/')) {
            // For root path, keep as /docs/
            if (link === '/') {
              link = '/docs/'
            }
            // For other paths, prepend /docs
            else if (link.startsWith('/')) {
              link = `/docs${link}`
            }
          }

          const isActive = link === currentPath || item.link === currentPath
          const activeStyle = isActive ? 'color: var(--bp-c-brand-1); font-weight: 500;' : ''
          return `<li><a href="${link}" style="display: block; padding: 6px 24px; color: var(--bp-c-text-2); text-decoration: none; font-size: 14px; transition: color 0.25s; ${activeStyle}" onmouseover="this.style.color='var(--bp-c-brand-1)'" onmouseout="this.style.color='${isActive ? 'var(--bp-c-brand-1)' : 'var(--bp-c-text-2)'}'">${item.text}</a></li>`
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
  // eslint-disable-next-line no-cond-assign
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
 * Generate navigation HTML from BunPress config
 */
function generateNav(config: BunPressConfig): string {
  if (!config.nav || config.nav.length === 0) {
    return ''
  }

  // Helper function to fix nav links
  const fixNavLink = (link: string | undefined): string => {
    if (!link || link.startsWith('http') || link.startsWith('/docs/'))
      return link || ''

    if (link === '/')
      return '/docs/'
    else if (link.startsWith('/'))
      return `/docs${link}`

    return link
  }

  const links = config.nav.map((item) => {
    // Handle items with sub-items (dropdown)
    if (item.items && item.items.length > 0) {
      return `<div class="relative group">
        <button class="text-[14px] font-medium text-[#213547] hover:text-[#5672cd] transition-colors cursor-pointer flex items-center gap-1">
          ${item.text}
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        <div class="hidden group-hover:block absolute top-full right-0 bg-white border border-[#e2e2e3] rounded-lg shadow-lg min-w-[160px] py-2 mt-2">
          ${item.items.map(subItem =>
            `<a href="${fixNavLink(subItem.link)}" class="block px-4 py-2 text-[13px] text-[#213547] hover:bg-[#f6f6f7] hover:text-[#5672cd] transition-colors">${subItem.text}</a>`,
          ).join('')}
        </div>
      </div>`
    }
    else {
      return `<a href="${fixNavLink(item.link)}" class="text-[14px] font-medium text-[#213547] hover:text-[#5672cd] transition-colors">${item.text}</a>`
    }
  }).join('')

  return links
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

  const siteName = config.markdown?.title || title
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
      'name': config.markdown?.title || title,
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
export async function wrapInLayout(content: string, config: BunPressConfig, currentPath: string, isHome: boolean = false): Promise<string> {
  const title = config.markdown?.title || 'BunPress Documentation'
  const description = config.markdown?.meta?.description || 'Documentation built with BunPress'

  // Get theme CSS (defaults to 'vitepress' theme)
  const themeName = config.theme || 'vitepress'
  const themeCSS = getThemeCSS(themeName)
  const syntaxHighlightingStyles = getSyntaxHighlightingStyles()
  const customCSS = `${themeCSS}\n${syntaxHighlightingStyles}\n${config.markdown?.css || ''}`

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
  const selfHostedScript = generateSelfHostedAnalyticsScript(config)

  // Combine custom scripts with analytics and structured data
  const customScripts = config.markdown?.scripts?.map(script => `<script>${script}</script>`).join('\n') || ''
  const scripts = [structuredData, fathomScript, selfHostedScript, customScripts].filter(Boolean).join('\n')

  // Home layout - no sidebar, no navigation, clean hero layout
  if (isHome) {
    return await render('layout-home', {
      title,
      description,
      meta: allMeta,
      customCSS,
      content,
      scripts,
    })
  }

  // Documentation layout - with sidebar
  // Add IDs to headings and generate page TOC
  const contentWithIds = addHeadingIds(content)
  const pageTOC = await generatePageTOC(contentWithIds)

  return await render('layout-doc', {
    title,
    description,
    meta: allMeta,
    customCSS,
    nav: generateNav(config),
    sidebar: await generateSidebar(config, currentPath),
    content: contentWithIds,
    pageTOC,
    scripts,
  })
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
 * Generate Self-Hosted Analytics tracking script
 * Privacy-focused, cookie-free analytics you can run on your own infrastructure
 */
function generateSelfHostedAnalyticsScript(config: BunPressConfig): string {
  const analytics = config.selfHostedAnalytics
  if (!analytics?.enabled || !analytics?.siteId || !analytics?.apiEndpoint) {
    return ''
  }

  const siteId = escapeAttr(analytics.siteId)
  const apiEndpoint = escapeAttr(analytics.apiEndpoint)
  const honorDnt = analytics.honorDNT ? `if(n.doNotTrack==="1")return;` : ''
  const hashTracking = analytics.trackHashChanges ? `w.addEventListener('hashchange',pv);` : ''
  const outboundTracking = analytics.trackOutboundLinks
    ? `d.addEventListener('click',function(e){var a=e.target.closest('a');if(a&&a.hostname!==location.hostname){t('outbound',{url:a.href});}});`
    : ''

  return `<!-- Self-Hosted Analytics -->
<script data-site="${siteId}" data-api="${apiEndpoint}" defer>
(function(){
'use strict';
var d=document,w=window,n=navigator,s=d.currentScript;
var site=s.dataset.site,api=s.dataset.api;
${honorDnt}
var q=[],sid=Math.random().toString(36).slice(2);
function t(e,p){
var x=new XMLHttpRequest();
x.open('POST',api+'/collect',true);
x.setRequestHeader('Content-Type','application/json');
x.send(JSON.stringify({s:site,sid:sid,e:e,p:p||{},u:location.href,r:d.referrer,t:d.title,sw:screen.width,sh:screen.height}));
}
function pv(){t('pageview');}
${hashTracking}
${outboundTracking}
if(d.readyState==='complete')pv();
else w.addEventListener('load',pv);
w.bunpressAnalytics={track:function(n,v){t('event',{name:n,value:v});}};
})();
</script>`
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
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n?/
  const match = markdown.match(frontmatterRegex)

  if (!match) {
    return { frontmatter: {}, content: markdown }
  }

  const frontmatterText = match[1]
  const content = markdown.slice(match[0].length)

  try {
    // Use Bun's native YAML parser
    const frontmatter = YAML.parse(frontmatterText)
    return { frontmatter, content }
  }
  catch (error) {
    console.error('Failed to parse frontmatter YAML:', error)
    return { frontmatter: {}, content: markdown }
  }
}

/**
 * Generate hero section HTML from frontmatter
 */
async function generateHero(hero: any): Promise<string> {
  if (!hero)
    return ''

  const name = hero.name ? `<h1 class="text-[32px] leading-[40px] md:text-[48px] md:leading-[56px] font-bold tracking-tight text-[#5672cd] mb-3">${hero.name}</h1>` : ''
  const text = hero.text ? `<p class="text-[32px] leading-[40px] md:text-[56px] md:leading-[64px] font-bold tracking-tight text-[#213547]">${hero.text}</p>` : ''
  const tagline = hero.tagline ? `<p class="mt-4 text-[16px] md:text-[18px] leading-[28px] text-[#476582] font-medium">${hero.tagline}</p>` : ''

  let actions = ''
  if (hero.actions) {
    const actionButtons = hero.actions.map((action: any) => {
      const isPrimary = action.theme === 'brand'
      return `<a href="${action.link}" class="inline-block ${isPrimary
        ? 'bg-[#5672cd] text-white px-4 py-2 rounded-[20px] font-medium text-[14px] transition-colors hover:bg-[#4558b8]'
        : 'bg-[#f6f6f7] text-[#213547] px-4 py-2 rounded-[20px] font-medium text-[14px] border border-[#e2e2e3] transition-colors hover:bg-[#e7e7e8] hover:border-[#d0d0d1]'}">${action.text}</a>`
    }).join('')
    actions = `<div class="mt-8 flex flex-wrap items-center gap-3">${actionButtons}</div>`
  }

  return await render('hero', {
    name,
    text,
    tagline,
    actions,
  })
}

/**
 * Generate features grid HTML from frontmatter
 */
async function generateFeatures(features: any[]): Promise<string> {
  if (!features || features.length === 0)
    return ''

  const items = features.map(feature => `
    <div class="relative bg-[#f6f6f7] p-6 rounded-xl border border-[#e2e2e3] hover:border-[#5672cd] transition-colors">
      ${feature.icon ? `<div class="text-[40px] mb-3">${feature.icon}</div>` : ''}
      <h3 class="text-[18px] font-semibold text-[#213547] mb-2 leading-[24px]">${feature.title || ''}</h3>
      <p class="text-[14px] text-[#476582] leading-[22px]">${feature.details || ''}</p>
    </div>
  `).join('')

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
    .replace(/!\[([^\]]*)\]\(\s*([^\s")]+)(?:\s+"([^"]+)")?\)/g, (match, alt, src, caption) => {
      if (caption) {
        // Image with caption - wrap in figure/figcaption
        return `<figure class="image-figure"><img src="${src}" alt="${alt}"><figcaption>${caption}</figcaption></figure>`
      }
      else {
        // Regular image without caption
        return `<img src="${src}" alt="${alt}">`
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
    'purple_heart': '�purple',
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
    // Extract type and text attributes
    const typeMatch = attributes.match(/type="(info|tip|warning|danger)"/i)
    const textMatch = attributes.match(/text="([^"]+)"/)

    const type = typeMatch ? typeMatch[1].toLowerCase() : 'info'
    const text = textMatch ? textMatch[1] : ''

    // Badge color schemes matching VitePress
    const colors: Record<string, { bg: string, text: string, border: string }> = {
      info: { bg: '#e0f2fe', text: '#0c4a6e', border: '#0ea5e9' },
      tip: { bg: '#dcfce7', text: '#14532d', border: '#22c55e' },
      warning: { bg: '#fef3c7', text: '#78350f', border: '#f59e0b' },
      danger: { bg: '#fee2e2', text: '#7f1d1d', border: '#ef4444' },
    }

    const color = colors[type] || colors.info

    return `<span class="badge badge-${type}" style="display: inline-block; padding: 2px 8px; font-size: 0.85em; font-weight: 600; border-radius: 4px; background: ${color.bg}; color: ${color.text}; border: 1px solid ${color.border}; margin: 0 4px; vertical-align: middle;">${text}</span>`
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
  return html.replace(/<a\s+href="([^"]+)"\s+target="_blank"[^>]*>([^<]+)<\/a>/g, (match, _url, _text) => {
    // Don't add icon if it already has one
    if (match.includes('external-link-icon'))
      return match

    const externalIcon = '<svg class="external-link-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; margin-left: 4px; vertical-align: middle;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>'
    return match.replace('</a>', `${externalIcon}</a>`)
  })
}

/**
 * Process images in HTML to add lazy loading
 */
function processImagesHtml(html: string): string {
  // Match img tags without loading attribute
  // Fixed: use [^>]+ to avoid backtracking with \s+
  return html.replace(/<img([^>]+)>/g, (match, attrs) => {
    // Skip if already has loading attribute
    if (attrs.includes('loading='))
      return match

    // Add loading="lazy" and decoding="async"
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
        return `<button class="code-group-tab ${isActive ? 'active' : ''}" onclick="switchCodeTab('${groupId}', ${index})">${label}</button>`
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

        return `<div class="code-group-panel ${isActive ? 'active' : ''}" data-panel="${index}">
  <pre data-lang="${lang}"><code class="language-${lang}">${highlightedCode}</code></pre>
</div>`
      }),
    )

    const codeGroupHtml = `<div class="code-group" id="${groupId}">
  <div class="code-group-tabs">
    ${tabsHtml}
  </div>
  <div class="code-group-panels">
    ${panelsHtml.join('\n')}
  </div>
</div>`

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
async function processCodeBlock(lines: string[], startIndex: number): Promise<{ html: string, endIndex: number }> {
  const firstLine = lines[startIndex]
  const infoString = firstLine.substring(3).trim() // Remove ```

  // Parse info string
  const { lang, highlights, showLineNumbers } = parseCodeFenceInfo(infoString)

  // Collect code content
  const codeLines: string[] = []
  let endIndex = startIndex + 1

  while (endIndex < lines.length && !lines[endIndex].startsWith('```')) {
    codeLines.push(lines[endIndex])
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
          return updatedLine.replace('<span class=', `<span class="line-number">${lineNumber}</span><span class=`)
        }

        return updatedLine
      }

      // If no <span class="line">, wrap the line with our classes
      const lineClass = ` class="${classes.join(' ')}"`

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
 * Simple markdown to HTML converter (placeholder until full markdown plugin is enabled)
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

  // Process markdown includes first (before everything else)
  let processedContent = await processMarkdownIncludes(content, rootDir)

  // Extract TOC data early (before any processing that modifies headings)
  const { content: contentWithTocPlaceholder, tocHtml } = extractTocData(processedContent, frontmatter.toc)

  // Process in order: code imports, code groups, GitHub alerts, containers, emoji, badges
  // NOTE: Links and images are processed AFTER HTML conversion to avoid conflicts
  processedContent = await processCodeImports(contentWithTocPlaceholder, rootDir)
  processedContent = await processCodeGroups(processedContent)
  processedContent = await processGitHubAlerts(processedContent)
  processedContent = await processContainers(processedContent)
  processedContent = processEmoji(processedContent)
  processedContent = processBadges(processedContent)

  // Very basic markdown conversion - will be replaced with full plugin
  // Split into lines for better processing
  const lines = processedContent.split('\n')
  const html: string[] = []
  let inCodeBlock = false
  let inList = false
  let inContainer = false

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    // Skip container markers (already processed)
    if (line.trim().startsWith(':::')) {
      continue
    }

    // Skip lines inside containers, alerts, and code groups (already processed)
    if (line.includes('<div class="custom-block') || line.includes('<details class="custom-block') || line.includes('<div class="github-alert') || line.includes('<div class="code-group')) {
      inContainer = true
    }
    if (inContainer) {
      html.push(line)
      if (line.includes('</div>') || line.includes('</details>')) {
        inContainer = false
      }
      continue
    }

    // Code blocks
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        // Process the entire code block
        const { html: codeHtml, endIndex } = await processCodeBlock(lines, i)
        html.push(codeHtml)
        i = endIndex // Skip to end of code block
        inCodeBlock = false
      }
      continue
    }

    // Headings (check from longest to shortest to avoid conflicts)
    if (line.startsWith('###### ')) {
      if (inList) {
        html.push('</ul>')
        inList = false
      }
      html.push(`<h6>${processInlineFormatting(line.substring(7))}</h6>`)
      continue
    }
    if (line.startsWith('##### ')) {
      if (inList) {
        html.push('</ul>')
        inList = false
      }
      html.push(`<h5>${processInlineFormatting(line.substring(6))}</h5>`)
      continue
    }
    if (line.startsWith('#### ')) {
      if (inList) {
        html.push('</ul>')
        inList = false
      }
      html.push(`<h4>${processInlineFormatting(line.substring(5))}</h4>`)
      continue
    }
    if (line.startsWith('### ')) {
      if (inList) {
        html.push('</ul>')
        inList = false
      }
      html.push(`<h3>${processInlineFormatting(line.substring(4))}</h3>`)
      continue
    }
    if (line.startsWith('## ')) {
      if (inList) {
        html.push('</ul>')
        inList = false
      }
      html.push(`<h2>${processInlineFormatting(line.substring(3))}</h2>`)
      continue
    }
    if (line.startsWith('# ')) {
      if (inList) {
        html.push('</ul>')
        inList = false
      }
      html.push(`<h1>${processInlineFormatting(line.substring(2))}</h1>`)
      continue
    }

    // Lists
    if (line.match(/^\s*[-*]\s+/)) {
      if (!inList) {
        html.push('<ul>')
        inList = true
      }
      html.push(`<li>${processInlineFormatting(line.replace(/^\s*[-*]\s+/, ''))}</li>`)
      continue
    }

    // Close list if we're in one and hit a non-list line
    if (inList && line.trim() !== '') {
      html.push('</ul>')
      inList = false
    }

    // Tables - detect start of table
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableRows: string[] = []
      let tableIndex = i

      // Collect all table rows
      while (tableIndex < lines.length && lines[tableIndex].trim().startsWith('|')) {
        tableRows.push(lines[tableIndex].trim())
        tableIndex++
      }

      if (tableRows.length >= 2) {
        // Process table
        const processCell = (cell: string) => {
          // Apply inline formatting
          return processInlineFormatting(cell.trim())
        }

        // Parse alignment from separator row (index 1)
        const separatorCells = tableRows[1].split('|').filter(cell => cell.trim())
        const alignments = separatorCells.map((cell) => {
          const trimmed = cell.trim()
          if (trimmed.startsWith(':') && trimmed.endsWith(':')) {
            return 'center'
          }
          else if (trimmed.endsWith(':')) {
            return 'right'
          }
          else {
            return 'left'
          }
        })

        // Add responsive wrapper
        html.push('<div class="table-responsive">')
        html.push('<table class="enhanced-table">')

        // Header row
        const headerCells = tableRows[0].split('|').filter(cell => cell.trim())
        html.push('  <thead>')
        html.push('    <tr>')
        headerCells.forEach((cell, index) => {
          const align = alignments[index] || 'left'
          html.push(`      <th style="text-align: ${align}">${processCell(cell)}</th>`)
        })
        html.push('    </tr>')
        html.push('  </thead>')

        // Body rows (skip separator row at index 1)
        if (tableRows.length > 2) {
          html.push('  <tbody>')
          for (let j = 2; j < tableRows.length; j++) {
            const cells = tableRows[j].split('|').filter(cell => cell.trim())
            html.push('    <tr>')
            cells.forEach((cell, index) => {
              const align = alignments[index] || 'left'
              html.push(`      <td style="text-align: ${align}">${processCell(cell)}</td>`)
            })
            html.push('    </tr>')
          }
          html.push('  </tbody>')
        }

        html.push('</table>')
        html.push('</div>')

        // Skip the lines we just processed
        i = tableIndex - 1
        continue
      }
    }

    // Empty lines
    if (line.trim() === '') {
      continue
    }

    // HTML comments (including TOC placeholder) - pass through as-is
    if (line.trim().startsWith('<!--') && line.trim().endsWith('-->')) {
      html.push(line)
      continue
    }

    // Regular paragraphs
    // Apply inline formatting: bold, italic, code, links, etc.
    line = processInlineFormatting(line)

    html.push(`<p>${line}</p>`)
  }

  // Close list if still open
  if (inList) {
    html.push('</ul>')
  }

  let finalHtml = html.join('\n')

  // Inject TOC HTML if it was extracted
  if (tocHtml) {
    finalHtml = injectTocHtml(finalHtml, tocHtml)
  }

  // Process external links and images in the final HTML
  finalHtml = processExternalLinksHtml(finalHtml)
  finalHtml = addExternalLinkIcons(finalHtml)
  finalHtml = processImagesHtml(finalHtml)

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
          const isHome = frontmatter.layout === 'home'
          const wrappedHtml = await wrapInLayout(html, bunPressConfig, path, isHome)
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

  console.log(`\n📚 BunPress documentation server running at ${url}`)
  console.log('Press Ctrl+C to stop\n')

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
