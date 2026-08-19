export interface BunPressConfig {
  verbose: boolean

  /**
   * Site title
   */
  title?: string

  /**
   * Site description
   */
  description?: string

  /**
   * Tags added to the `<head>` of every page, VitePress-shaped.
   *
   * The escape hatch for anything the typed keys do not cover, and the only
   * way to declare a favicon: nothing here emitted `<link rel="icon">`, so
   * every documentation site built with this shipped the browser's blank-page
   * glyph in its tabs.
   *
   *     head: [
   *       ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
   *       ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
   *     ]
   *
   * A page's own frontmatter `head` is rendered after these, so a page can
   * override what the site declares. Only `meta`, `link` and `base` are
   * allowed, the same restriction the per-page form carries: a `<script>` in
   * the head is not metadata.
   */
  head?: Array<[string, Record<string, string | number | boolean>?]>

  /**
   * Force the docs color theme. `'dark'`/`'light'` (or `true`/`false`) render
   * that theme with no JS and no flash-of-wrong-theme, and for crawlers;
   * `'auto'` (default) follows the OS preference and the theme toggle. A forced
   * value is SSR'd onto `<html>` and honored by the client theme script.
   */
  darkMode?: boolean | 'auto' | 'dark' | 'light'

  /**
   * Theme configuration (VitePress-style)
   */
  themeConfig?: ThemeConfig & {
    sidebar?: SidebarItem[] | Record<string, SidebarItem[]>
    nav?: NavItem[]
    siteTitle?: string
  }

  /**
   * Site search. Enabled by default — set `enabled: false` to drop both the
   * nav affordance and the generated index.
   *
   * Also accepted under `markdown.search` for backwards compatibility; the
   * top-level form wins when both are set.
   */
  search?: SearchConfig

  /**
   * Multi-language documentation. Omit it, or give a single locale, and the
   * site renders exactly as it does today.
   */
  i18n?: I18nSiteConfig

  /**
   * Source directory containing markdown files
   * @default './docs'
   */
  docsDir?: string

  /**
   * Output directory for build artifacts
   * @default './dist'
   */
  outDir?: string

  /**
   * URL path prefix when docs are mounted under the app host (e.g. `/docs`).
   * Also inferred from `sitemap.baseUrl` when it includes a pathname.
   */
  basePath?: string

  /**
   * Directory holding reusable `.stx` components referenced as PascalCase tags
   * in markdown (e.g. `<Callout />`). Resolved relative to the current working
   * directory.
   * @default '<docsDir>/.components'
   */
  componentsDir?: string

  /**
   * Directory holding global JSON data files exposed to every page's stx
   * context under the `data` object (e.g. `.data/stats.json` -> `data.stats`).
   * @default '<docsDir>/.data'
   */
  dataDir?: string

  /**
   * Web fonts to load. Google Fonts families are loaded via `<link>` tags in
   * the document head (with preconnect); raw `@font-face` blocks are injected
   * for self-hosted fonts. Reference the families in `markdown.css`
   * (e.g. `font-family: 'Inter', sans-serif`) or via crosswind `font-*` utilities.
   *
   * @example
   * fonts: { google: ['Inter:wght@400;600;700', 'JetBrains Mono:wght@400;700'] }
   */
  fonts?: {
    /** Google Fonts families in css2 syntax; spaces become `+` automatically. */
    google?: string[]
    /** `font-display` for the Google stylesheet (default `swap`). */
    display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional'
    /** Emit `<link rel="preconnect">` for the Google Fonts hosts (default true). */
    preconnect?: boolean
    /** Raw `@font-face { … }` blocks for self-hosted fonts. */
    faces?: string[]
  }

  /**
   * Theme to use for the documentation site
   * @default 'vitepress'
   */
  theme?: 'vitepress' | 'bun'

  /**
   * Configuration for the markdown-to-html plugin
   */
  markdown: MarkdownPluginConfig

  /**
   * Navigation configuration
   */
  nav?: NavItem[]

  /**
   * Plugin configuration
   */
  plugins?: ConfigPlugin[]

  /**
   * Sitemap and SEO configuration
   */
  sitemap?: SitemapConfig

  /**
   * Robots.txt configuration
   */
  robots?: RobotsConfig

  /**
   * RSS feed configuration
   */
  rss?: import('./rss').RssFeedConfig

  /**
   * Fathom Analytics configuration
   */
  fathom?: FathomConfig

  /**
   * Analytics configuration (using ts-analytics / dynamodb-tooling)
   * A privacy-focused, cookie-free analytics solution you can run on your own infrastructure.
   */
  analytics?: AnalyticsConfig

  /**
   * @deprecated Use analytics instead
   */
  selfHostedAnalytics?: SelfHostedAnalyticsConfig

  /**
   * Cloud deployment configuration (AWS via ts-cloud)
   */
  cloud?: CloudConfig
}

/**
 * Cloud deployment configuration
 */
export interface CloudConfig {
  /**
   * AWS region for deployment
   * @default 'us-east-1'
   */
  region?: string

  /**
   * Custom domain for the documentation site
   * Example: 'docs.example.com'
   */
  domain?: string

  /**
   * Subdomain to use (will be prefixed to the base domain)
   * Example: 'docs' for 'docs.example.com'
   */
  subdomain?: string

  /**
   * Base domain (used with subdomain option)
   * Example: 'example.com'
   */
  baseDomain?: string

  /**
   * S3 bucket name (auto-generated if not provided)
   */
  bucket?: string

  /**
   * CloudFront distribution ID (for existing distributions)
   */
  distributionId?: string

  /**
   * Route53 hosted zone ID (for existing hosted zones)
   * Not required when using an external DNS provider
   */
  hostedZoneId?: string

  /**
   * ACM certificate ARN (for existing certificates)
   * Must be in us-east-1 for CloudFront
   */
  certificateArn?: string

  /**
   * Cache control header for static assets
   * @default 'public, max-age=31536000, immutable'
   */
  cacheControl?: string

  /**
   * Enable CloudFront cache invalidation after deploy
   * @default true
   */
  invalidateCache?: boolean

  /**
   * Wait for CloudFront invalidation to complete
   * @default true
   */
  waitForInvalidation?: boolean

  /**
   * CloudFormation stack name
   */
  stackName?: string

  /**
   * Environment name (production, staging, etc.)
   * @default 'production'
   */
  environment?: string

  /**
   * DNS provider configuration for external DNS (not Route53)
   * Supports: 'porkbun', 'godaddy'
   * When specified, DNS records are managed by the external provider instead of Route53
   */
  dnsProvider?: DnsProviderOptions
}

/**
 * DNS provider configuration options
 */
export interface DnsProviderOptions {
  /**
   * DNS provider type
   */
  provider: 'porkbun' | 'godaddy' | 'route53'

  /**
   * API key for Porkbun or GoDaddy
   * Can also be set via PORKBUN_API_KEY or GODADDY_API_KEY environment variables
   */
  apiKey?: string

  /**
   * Secret key for Porkbun or API secret for GoDaddy
   * Can also be set via PORKBUN_SECRET_KEY or GODADDY_API_SECRET environment variables
   */
  secretKey?: string

  /**
   * GoDaddy environment (production or ote/test)
   * @default 'production'
   */
  environment?: 'production' | 'ote'
}

export type BunPressOptions = Partial<BunPressConfig>

/**
 * Configuration options for the markdown plugin
 */
export interface MarkdownPluginConfig {
  /**
   * Custom wrapper template for the HTML output
   * Use {{content}} placeholder for the markdown content
   * Example: "<div class="markdown-content">{{content}}</div>"
   */
  template?: string

  /**
   * Custom CSS to be included in the head of the HTML document
   */
  css?: string

  /**
   * Custom scripts to be included at the end of the body
   */
  scripts?: string[]

  /**
   * Map fence languages the highlighter has no grammar for onto ones it does.
   *
   * A project documenting its own language writes ```mylang fences, and every
   * one of them renders as flat escaped text because no grammar matches.
   * Aliasing to the closest grammar gets real tokens, while the fence keeps
   * its own name in `data-lang` and in the copy button.
   *
   * @example
   * languageAliases: { home: 'rust', hm: 'rust' }
   */
  languageAliases?: Record<string, string>

  /**
   * Default title for HTML documents (uses h1 from content if not provided)
   */
  title?: string

  /**
   * Metadata for HTML documents
   */
  meta?: Record<string, string>

  /**
   * Options forwarded to the markdown parser (`Bun.markdown`).
   *
   * Merged over BunPress's defaults, which enable the full GFM set. Use it to
   * turn an extension off, or to enable one the defaults do not cover.
   *
   * @see https://bun.com/docs/runtime/markdown
   * @example parserOptions: { tasklists: false }
   */
  parserOptions?: {
    /** GFM tables. @default true */
    tables?: boolean
    /** GFM `~~strikethrough~~`. @default true */
    strikethrough?: boolean
    /** GFM `- [ ]` task lists. @default true */
    tasklists?: boolean
    /** Turn bare URLs into links. @default true */
    autolinks?: boolean
    /** Treat a single newline as a line break. */
    hardBreaks?: boolean
    /** Allow raw HTML through. */
    unsafeHTML?: boolean
  }

  /**
   * Enable or disable preserving directory structure in output
   * @default true
   */
  preserveDirectoryStructure?: boolean

  /**
   * Table of Contents configuration
   */
  toc?: TocConfig

  /**
   * Sidebar navigation configuration
   */
  sidebar?: Record<string, SidebarItem[]>

  /**
   * Navigation bar configuration
   */
  nav?: NavItem[]

  /**
   * Search configuration
   */
  search?: SearchConfig

  /**
   * Theme configuration
   */
  themeConfig?: ThemeConfig

  /**
   * Syntax highlighting theme
   * Supported values: 'github-light', 'github-dark'
   * @default 'github-light'
   */
  syntaxHighlightTheme?: 'github-light' | 'github-dark'

  /**
   * Sitemap and SEO configuration
   */
  sitemap?: SitemapConfig

  /**
   * Robots.txt configuration
   */
  robots?: RobotsConfig

  /**
   * Markdown features configuration
   */
  features?: MarkdownFeaturesConfig
}

/**
 * Sidebar navigation item
 */
export interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
  /** Whether a group starts with its nested items hidden. */
  collapsed?: boolean
}

/**
 * Navigation bar item.
 *
 * An item with `items` renders a dropdown. The dropdown upgrades itself to a
 * multi-column mega menu as soon as the content asks for one: when any child
 * carries a `description`, when children are nested one level deeper into
 * groups, or when `mega` is set explicitly. A flat list of bare links keeps
 * rendering as the compact flyout it always did.
 */
export interface NavItem {
  text: string
  link?: string
  /** Inline SVG, an `<img>` tag, or an emoji. Rendered in mega-menu items. */
  icon?: string
  /** One-line explainer. Rendered under the item title in a mega menu. */
  description?: string
  items?: NavItem[]
  activeMatch?: string
  /**
   * Force the mega-menu panel (or force it off with `false`) instead of
   * letting the shape of `items` decide.
   */
  mega?: boolean
  /**
   * Column count for the mega panel at desktop width. Defaults to the number
   * of groups, clamped to 4. Ignored by the compact flyout.
   */
  columns?: number
  /** Optional link rendered as a footer strip across the bottom of the panel. */
  footer?: NavItemFooter
}

/**
 * Footer strip at the bottom of a mega-menu panel. Use it for the "see
 * everything" link that would otherwise be one more item in a column.
 */
export interface NavItemFooter {
  text: string
  link: string
  /** Short muted line before the link, e.g. "New in 0.4". */
  note?: string
}

/**
 * Plugin options for the Markdown plugin
 */
export type MarkdownPluginOptions = Partial<MarkdownPluginConfig>

/**
 * Action link in hero section
 */
export interface HeroAction {
  theme?: 'brand' | 'alt'
  text: string
  link: string
}

/**
 * A code sample rendered as the hero's visual, highlighted by the same
 * highlighter that renders markdown fences.
 */
export interface HeroCode {
  /** Fence language id, e.g. `ts`, `rust`, `bash`. Defaults to `ts`. */
  lang?: string
  /** Filename shown above the sample, or the tab label when there are several. */
  file?: string
  content: string
}

/**
 * Small link above the hero headline: a release note, a launch post, a
 * "what changed" pointer.
 */
export interface HeroAnnouncement {
  text: string
  link: string
  /** Short leading chip, e.g. a version number. */
  tag?: string
}

/**
 * Hero section configuration
 */
export interface Hero {
  name?: string
  text: string
  tagline?: string
  /** Image visual. Ignored when `code` is set. */
  image?: string
  /** Code visual. One sample, or several for a tabbed panel. */
  code?: HeroCode | HeroCode[]
  announcement?: HeroAnnouncement
  actions?: HeroAction[]
}

/**
 * Feature item configuration
 */
export interface Feature {
  title: string
  icon?: string
  details: string
  /** Turns the card into a link. */
  link?: string
  /** Label for the link affordance on a linked card. Defaults to "Learn more". */
  linkText?: string
  /** Columns this cell claims at desktop width (1-3), turning a grid into a bento. */
  span?: number
}

/**
 * Frontmatter structure extracted from markdown files
 */
export interface Frontmatter {
  /**
   * Page title
   */
  title?: string

  /**
   * Page layout
   * doc - Default documentation layout with sidebar
   * home - Home page layout
   * page - Plain page without sidebar
   */
  layout?: 'home' | 'doc' | 'page'

  /**
   * Hero section configuration (for home layout)
   */
  hero?: Hero

  /**
   * Features section configuration (for home layout)
   */
  features?: Feature[]

  /**
   * Other frontmatter properties
   */
  [key: string]: any
}

/**
 * Table of Contents configuration
 */
export interface TocConfig {
  /**
   * Enable TOC generation
   * @default true
   */
  enabled?: boolean

  /**
   * TOC position(s)
   * @default ['sidebar']
   */
  position?: TocPosition | TocPosition[]

  /**
   * Custom TOC title
   * @default 'Table of Contents'
   */
  title?: string

  /**
   * Maximum heading depth to include in TOC
   * @default 6
   */
  maxDepth?: number

  /**
   * Minimum heading level to include in TOC
   * @default 2
   */
  minDepth?: number

  /**
   * CSS class for TOC container
   * @default 'table-of-contents'
   */
  className?: string

  /**
   * Enable smooth scrolling for anchor links
   * @default true
   */
  smoothScroll?: boolean

  /**
   * Enable active item highlighting on scroll
   * @default true
   */
  activeHighlight?: boolean

  /**
   * Enable collapsible TOC sections
   * @default true
   */
  collapsible?: boolean

  /**
   * Headings to exclude from TOC (regex patterns or exact matches)
   */
  exclude?: string[]
}

/**
 * TOC position options
 */
export type TocPosition = 'sidebar' | 'inline' | 'floating'

/**
 * Markdown features configuration
 * Controls which VitePress-compatible features are enabled
 */
export interface MarkdownFeaturesConfig {
  /**
   * Enable inline formatting (bold, italic, strikethrough, sub/sup, mark)
   * @default true
   */
  inlineFormatting?: boolean

  /**
   * Enable custom containers (::: info, ::: tip, etc.)
   * @default true
   */
  containers?: boolean | ContainersConfig

  /**
   * Enable GitHub-flavored alerts (> [!NOTE], > [!TIP], etc.)
   * @default true
   */
  githubAlerts?: boolean | GitHubAlertsConfig

  /**
   * Enable code block enhancements (line highlighting, diffs, focus, etc.)
   * @default true
   */
  codeBlocks?: boolean | CodeBlocksConfig

  /**
   * Enable code groups with tabs
   * @default true
   */
  codeGroups?: boolean

  /**
   * Enable code imports from files (<<< @/filepath)
   * @default true
   */
  codeImports?: boolean

  /**
   * Enable inline TOC [[toc]] macro
   * @default true
   */
  inlineToc?: boolean

  /**
   * Enable custom header anchors (## Heading {#custom-id})
   * @default true
   */
  customAnchors?: boolean

  /**
   * Enable emoji shortcodes (:tada:, :rocket:, etc.)
   * @default true
   */
  emoji?: boolean

  /**
   * Enable inline badges (<Badge type="info" text="v2.0" />)
   * @default true
   */
  badges?: boolean

  /**
   * Enable markdown file inclusion (<!--@include: ./file.md-->)
   * @default true
   */
  includes?: boolean

  /**
   * Enable external link enhancements (target="_blank", icons)
   * @default true
   */
  externalLinks?: boolean | ExternalLinksConfig

  /**
   * Enable image lazy loading
   * @default true
   */
  imageLazyLoading?: boolean

  /**
   * Enable enhanced tables (alignment, styling, responsive)
   * @default true
   */
  tables?: boolean | TablesConfig
}

/**
 * Custom containers configuration
 */
export interface ContainersConfig {
  /**
   * Enable info containers
   * @default true
   */
  info?: boolean

  /**
   * Enable tip containers
   * @default true
   */
  tip?: boolean

  /**
   * Enable warning containers
   * @default true
   */
  warning?: boolean

  /**
   * Enable danger containers
   * @default true
   */
  danger?: boolean

  /**
   * Enable details containers
   * @default true
   */
  details?: boolean

  /**
   * Enable raw containers
   * @default true
   */
  raw?: boolean
}

/**
 * GitHub alerts configuration
 */
export interface GitHubAlertsConfig {
  /**
   * Enable note alerts
   * @default true
   */
  note?: boolean

  /**
   * Enable tip alerts
   * @default true
   */
  tip?: boolean

  /**
   * Enable important alerts
   * @default true
   */
  important?: boolean

  /**
   * Enable warning alerts
   * @default true
   */
  warning?: boolean

  /**
   * Enable caution alerts
   * @default true
   */
  caution?: boolean
}

/**
 * Code blocks configuration
 */
export interface CodeBlocksConfig {
  /**
   * Enable line highlighting
   * @default true
   */
  lineHighlighting?: boolean

  /**
   * Enable line numbers
   * @default true
   */
  lineNumbers?: boolean

  /**
   * Enable code focus
   * @default true
   */
  focus?: boolean

  /**
   * Enable code diffs
   * @default true
   */
  diffs?: boolean

  /**
   * Enable error/warning markers
   * @default true
   */
  errorWarningMarkers?: boolean
}

/**
 * External links configuration
 */
export interface ExternalLinksConfig {
  /**
   * Auto-add target="_blank" to external links
   * @default true
   */
  autoTarget?: boolean

  /**
   * Auto-add rel="noreferrer noopener" to external links
   * @default true
   */
  autoRel?: boolean

  /**
   * Show external link icons
   * @default true
   */
  showIcon?: boolean
}

/**
 * Tables configuration
 */
export interface TablesConfig {
  /**
   * Enable column alignment (left, center, right)
   * @default true
   */
  alignment?: boolean

  /**
   * Enable enhanced styling (striped rows, hover effects)
   * @default true
   */
  enhancedStyling?: boolean

  /**
   * Enable responsive wrapper for horizontal scrolling
   * @default true
   */
  responsive?: boolean
}

/**
 * Search configuration
 */
export interface SearchConfig {
  /**
   * Enable search functionality
   * @default true
   */
  enabled?: boolean

  /**
   * Search backend.
   * - `local` builds a client-side index from your markdown (default)
   * - `algolia` hands the UI over to Algolia DocSearch
   * @default 'local'
   */
  provider?: 'local' | 'algolia'

  /** Algolia DocSearch credentials. Required when `provider: 'algolia'`. */
  algolia?: AlgoliaSearchConfig

  /**
   * Search placeholder text
   * @default "Search documentation"
   */
  placeholder?: string

  /**
   * Maximum number of search results to show.
   * Also settable as `options.maxResults`; the nested form wins.
   * @default 10
   */
  maxResults?: number

  /**
   * Enable keyboard shortcuts
   * @default true
   */
  keyboardShortcuts?: boolean

  /**
   * Key(s) that open search, in addition to the always-available Escape to
   * close. A single printable character (`'/'`) or a chord as parts
   * (`['ctrl', 'k']`, `['meta', 'k']`).
   * @default ['meta', 'k'] plus '/'
   */
  shortcut?: string | string[]

  /**
   * Defer loading the index until the dialog is first opened. Turning this
   * off fetches it right after page load, trading bandwidth for a faster
   * first search.
   * @default true
   */
  lazy?: boolean

  /** Local index construction and ranking. */
  options?: LocalSearchOptions

  /** How each result is presented. */
  resultOptions?: SearchResultOptions

  /**
   * Called in the browser after every search. Serialized to the page, so it
   * must not close over build-time values — reference globals only.
   */
  onSearch?: (query: string, results: SearchResult[]) => void
}

/** Algolia DocSearch credentials and query parameters. */
export interface AlgoliaSearchConfig {
  appId: string
  apiKey: string
  indexName: string
  /** Forwarded to DocSearch as `searchParameters`. */
  searchParameters?: Record<string, unknown>
  /** Placeholder shown in the DocSearch modal. */
  placeholder?: string
}

/** Field weights used when ranking a local search hit. */
export interface SearchBoostConfig {
  title?: number
  headings?: number
  content?: number
}

/** Which parts of a record are searched and stored. */
export type SearchField = 'title' | 'content' | 'headings' | 'keywords'

export interface LocalSearchOptions {
  /** Glob patterns of markdown to index. @default ['**\/*.md'] */
  include?: string[]
  /** Glob patterns to skip, applied after `include`. */
  exclude?: string[]
  /** Fields a query is matched against. @default all of them */
  searchFields?: SearchField[]
  /** Maximum hits rendered. @default 10 */
  maxResults?: number
  /** Queries shorter than this return nothing. @default 1 */
  minQueryLength?: number
  /** Relative weight per field when scoring. */
  boost?: SearchBoostConfig
  /**
   * Splits both documents and queries into terms. Serialized to the page,
   * so it must not close over build-time values.
   */
  tokenize?: (text: string) => string[]
  /** Allow approximate matches. @default false */
  fuzzy?: boolean
  /** Maximum edit distance when `fuzzy` is on. @default 1 */
  fuzziness?: number
  /** Reduce terms to a common stem before matching. */
  stemmer?: 'english' | 'none'
  /** Record fields written to the index. Smaller index, less preview. */
  storeFields?: Array<'title' | 'page' | 'text' | 'url' | 'level' | 'keywords'>
  /** Characters of prose kept per section. @default 800 */
  maxContentLength?: number
}

export interface SearchResultOptions {
  /** Show the text preview under each hit. @default true */
  showDescription?: boolean
  /** Characters of preview text. @default 180 */
  descriptionLength?: number
  /** Wrap query terms in `<mark>`. @default true */
  highlightMatches?: boolean
  /** Show the containing page above each hit. @default true */
  showPath?: boolean
}

/**
 * Per-page search control, set in frontmatter as `search:`.
 * `search: false` keeps the page out of the index entirely.
 */
export interface FrontmatterSearchConfig {
  /** Extra terms that should match this page. */
  keywords?: string[]
  /** Title used in results, instead of the page's h1. */
  title?: string
}

/**
 * Multi-language configuration.
 *
 * Translations are loaded by `ts-i18n`, so `localePath` follows its layout:
 * `<localePath>/<locale>.{yml,ts}` or `<localePath>/<locale>/*.{yml,json,ts}`.
 */
export interface I18nSiteConfig {
  /**
   * Turn multi-language handling off without deleting the block.
   * @default true when two or more locales are listed
   */
  enabled?: boolean

  /**
   * Every locale the site publishes. The first entry is used as
   * `defaultLocale` when that is not set explicitly.
   */
  locales: string[]

  /**
   * The locale served at the site root, with no URL prefix. Every other
   * locale is served under `/<locale>/`.
   */
  defaultLocale?: string

  /** Locale(s) consulted when a key is missing. @default defaultLocale */
  fallbackLocale?: string | string[]

  /** Directory holding the translation files. @default './locales' */
  localePath?: string

  /**
   * Which translation file types to load.
   * @default ['ts', 'yaml', 'json']
   */
  sources?: Array<'ts' | 'yaml' | 'json'>

  /**
   * Send first-time visitors to the locale their browser asks for. Only ever
   * redirects from the default locale's root, and remembers a manual choice.
   * @default false
   */
  detectLocale?: boolean

  /**
   * Per-locale configuration overrides — typically `title`, `description`,
   * `nav` and `sidebar`. Merged over the site config for that locale.
   */
  localeConfig?: Record<string, Partial<BunPressConfig>>

  /**
   * Human-readable names for the locale switcher.
   * @default the locale code itself
   */
  localeNames?: Record<string, string>
}

/**
 * Search result item
 */
export interface SearchResult {
  /**
   * Title of the result
   */
  title: string

  /**
   * URL of the result
   */
  url: string

  /**
   * Content snippet
   */
  content: string

  /**
   * Search score/rank
   */
  score: number
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  /** Path to the site logo. */
  logo?: string

  /** Content rendered in the documentation footer. */
  footer?: {
    message?: string
    copyright?: string
  }

  /** Links to the project's social profiles. */
  socialLinks?: Array<{
    icon: string
    link: string
  }>

  /**
   * Color palette
   */
  colors?: {
    primary?: string
    secondary?: string
    accent?: string
    background?: string
    surface?: string
    text?: string
    muted?: string
  }

  /**
   * Typography settings
   */
  fonts?: {
    heading?: string
    body?: string
    mono?: string
  }

  /**
   * Dark mode configuration
   */
  darkMode?: boolean | 'auto'

  /**
   * Custom CSS variables
   */
  cssVars?: Record<string, string>

  /**
   * Custom CSS
   */
  css?: string

  /**
   * "Edit this page" link shown under each doc page.
   *
   * `:path` in the pattern is replaced with the page's path relative to the
   * docs directory. Without a pattern there is nothing to link to, so the
   * link is not rendered.
   *
   * @example
   * editLink: { pattern: 'https://github.com/org/repo/edit/main/docs/:path' }
   */
  editLink?: {
    pattern: string
    /** @default 'Edit this page' */
    text?: string
  }

  /**
   * Show when the page was last modified, taken from the file's most recent
   * git commit and falling back to its filesystem timestamp.
   */
  lastUpdated?: boolean | {
    /** @default 'Last updated' */
    text?: string
    /** Passed to `Intl.DateTimeFormat`. */
    formatOptions?: Intl.DateTimeFormatOptions
  }
}

/**
 * Configuration plugin interface
 */
export interface ConfigPlugin {
  name: string
  extendConfig?: (config: BunPressConfig) => BunPressConfig
  validateConfig?: (config: BunPressConfig) => ConfigValidationResult
  onConfigLoad?: (config: BunPressConfig) => void | Promise<void>
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Heading item in TOC
 */
export interface TocHeading {
  /**
   * Heading level (1-6)
   */
  level: number

  /**
   * Heading text
   */
  text: string

  /**
   * Generated anchor ID
   */
  id: string

  /**
   * Child headings
   */
  children: TocHeading[]

  /**
   * Whether this heading should be excluded from TOC
   */
  exclude?: boolean

  /**
   * Whether this heading contains inline code
   */
  hasCode?: boolean
}

/**
 * Table of Contents data structure
 */
export interface TocData {
  /**
   * TOC title
   */
  title: string

  /**
   * Array of top-level headings
   */
  items: TocHeading[]

  /**
   * TOC configuration
   */
  config: TocConfig
}

/**
 * TOC position data
 */
export interface TocPositionData {
  /**
   * Position type
   */
  position: TocPosition

  /**
   * TOC data for this position
   */
  data: TocData

  /**
   * HTML content for this position
   */
  html: string
}

/**
 * Sitemap configuration
 */
export interface SitemapConfig {
  /**
   * Enable sitemap generation
   * @default true
   */
  enabled?: boolean

  /**
   * Base URL for the sitemap (required)
   */
  baseUrl?: string

  /**
   * Output filename for the main sitemap
   * @default 'sitemap.xml'
   */
  filename?: string

  /**
   * Default priority for pages without explicit priority
   * @default 0.5
   */
  defaultPriority?: number

  /**
   * Default changefreq for pages without explicit changefreq
   * @default 'monthly'
   */
  defaultChangefreq?: SitemapChangefreq

  /**
   * Custom priority mapping by path patterns
   */
  priorityMap?: Record<string, number>

  /**
   * Custom changefreq mapping by path patterns
   */
  changefreqMap?: Record<string, SitemapChangefreq>

  /**
   * Paths to exclude from sitemap (regex patterns)
   */
  exclude?: string[]

  /**
   * Maximum number of URLs per sitemap file (for large sites)
   * @default 50000
   */
  maxUrlsPerFile?: number

  /**
   * Enable sitemap index generation for multiple sitemaps
   * @default false
   */
  useSitemapIndex?: boolean

  /**
   * Custom transformation function for sitemap entries
   */
  transform?: (entry: SitemapEntry) => SitemapEntry | null

  /**
   * Enable verbose logging for sitemap generation
   * @default false
   */
  verbose?: boolean
}

/**
 * Sitemap entry
 */
export interface SitemapEntry {
  /**
   * Page URL (relative to baseUrl)
   */
  url: string

  /**
   * Last modification date
   */
  lastmod?: string | Date

  /**
   * Change frequency
   */
  changefreq?: SitemapChangefreq

  /**
   * Priority (0.0 to 1.0)
   */
  priority?: number

  /**
   * Custom metadata
   */
  [key: string]: any
}

/**
 * Sitemap change frequency values
 */
export type SitemapChangefreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

/**
 * Robots.txt configuration
 */
export interface RobotsConfig {
  /**
   * Enable robots.txt generation
   * @default true
   */
  enabled?: boolean

  /**
   * Output filename
   * @default 'robots.txt'
   */
  filename?: string

  /**
   * User-agent rules
   */
  rules?: RobotsRule[]

  /**
   * Sitemap URLs to include
   */
  sitemaps?: string[]

  /**
   * Host directive
   */
  host?: string

  /**
   * Custom content to append
   */
  customContent?: string
}

/**
 * Robots.txt rule
 */
export interface RobotsRule {
  /**
   * User-agent (e.g., '*', 'Googlebot', 'Bingbot')
   */
  userAgent: string

  /**
   * Allow directives
   */
  allow?: string[]

  /**
   * Disallow directives
   */
  disallow?: string[]

  /**
   * Crawl-delay directive
   */
  crawlDelay?: number
}

/**
 * Fathom Analytics configuration
 */
export interface FathomConfig {
  /**
   * Enable Fathom Analytics
   * @default false
   */
  enabled?: boolean

  /**
   * Fathom site ID (e.g., 'NXCLHKXQ')
   * Required if enabled is true
   */
  siteId?: string

  /**
   * Custom Fathom script URL
   * @default 'https://cdn.usefathom.com/script.js'
   */
  scriptUrl?: string

  /**
   * Include Fathom script with defer attribute
   * @default true
   */
  defer?: boolean

  /**
   * Honor Do Not Track (DNT) browser setting
   * @default false
   */
  honorDNT?: boolean

  /**
   * Canonical URL for the site (optional)
   * Overrides automatic canonical URL detection
   */
  canonical?: string

  /**
   * Enable auto tracking (tracks pageviews automatically)
   * @default true
   */
  auto?: boolean

  /**
   * Enable SPA (Single Page Application) mode
   * @default false
   */
  spa?: boolean
}

/**
 * Analytics configuration (using ts-analytics / dynamodb-tooling)
 * A privacy-focused, cookie-free analytics solution you can run on your own infrastructure.
 */
export interface AnalyticsConfig {
  /**
   * Enable analytics
   * @default false
   */
  enabled?: boolean

  /**
   * Site ID for tracking (unique identifier for your site)
   * Required if enabled is true
   */
  siteId?: string

  /**
   * API endpoint URL for collecting analytics data
   * Optional - if not provided, will use window.ANALYTICS_API_ENDPOINT or default to '/api/analytics'
   * Example: 'https://api.example.com/analytics'
   */
  apiEndpoint?: string

  /**
   * Load an external, first-party tracker instead of inlining the built-in
   * client. When set, BunPress emits
   * `<script defer src="<scriptSrc>" data-site="<siteId>"></script>` and none
   * of the inline client is generated — the referenced script owns the whole
   * tracking behaviour.
   *
   * Use this when the analytics service ships its own tracker (e.g.
   * `https://analyticshq.org/script.js`). It keeps ONE canonical client rather
   * than a second, divergent implementation to keep in sync, and it avoids the
   * inline client's `sessionStorage`/`localStorage` session ids — which matter
   * for a service that derives sessions server-side and advertises itself as
   * cookieless and consent-free.
   *
   * `honorDNT`, `trackHashChanges` and `trackOutboundLinks` configure the
   * inline client only and are ignored here; the external tracker decides.
   *
   * Example: 'https://analyticshq.org/script.js'
   */
  scriptSrc?: string

  /**
   * Honor Do Not Track (DNT) browser setting
   * @default false
   */
  honorDNT?: boolean

  /**
   * Track hash changes as page views (for hash-based routing)
   * @default false
   */
  trackHashChanges?: boolean

  /**
   * Track outbound link clicks
   * @default false
   */
  trackOutboundLinks?: boolean
}

/**
 * @deprecated Use AnalyticsConfig instead
 */
export type SelfHostedAnalyticsConfig = AnalyticsConfig
