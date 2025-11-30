export interface BunPressConfig {
  verbose: boolean

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
   * Theme to use for the documentation site
   * @default 'vitepress'
   */
  theme?: 'vitepress'

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
   * Fathom Analytics configuration
   */
  fathom?: FathomConfig

  /**
   * Self-hosted analytics configuration (using Stacks Analytics / dynamodb-tooling)
   */
  selfHostedAnalytics?: SelfHostedAnalyticsConfig
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
   * Default title for HTML documents (uses h1 from content if not provided)
   */
  title?: string

  /**
   * Metadata for HTML documents
   */
  meta?: Record<string, string>

  /**
   * Custom marked options
   * @see https://marked.js.org/using_advanced
   */
  markedOptions?: any

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
}

/**
 * Navigation bar item
 */
export interface NavItem {
  text: string
  link?: string
  icon?: string
  items?: NavItem[]
  activeMatch?: string
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
 * Hero section configuration
 */
export interface Hero {
  name?: string
  text: string
  tagline?: string
  image?: string
  actions?: HeroAction[]
}

/**
 * Feature item configuration
 */
export interface Feature {
  title: string
  icon?: string
  details: string
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
   * @default false
   */
  enabled?: boolean

  /**
   * Search placeholder text
   * @default "Search..."
   */
  placeholder?: string

  /**
   * Maximum number of search results to show
   * @default 10
   */
  maxResults?: number

  /**
   * Enable keyboard shortcuts
   * @default true
   */
  keyboardShortcuts?: boolean

  /**
   * Custom search function
   */
  searchFn?: (query: string, content: string[]) => SearchResult[]
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
}

/**
 * Configuration plugin interface
 */
export interface ConfigPlugin {
  name: string
  extendConfig?: (config: BunPressConfig) => BunPressConfig
  validateConfig?: (config: BunPressConfig) => ConfigValidationResult
  onConfigLoad?: (config: BunPressConfig) => void | Promise<void>
  onConfigChange?: (newConfig: BunPressConfig, oldConfig: BunPressConfig) => void | Promise<void>
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
 * Self-hosted analytics configuration (using Stacks Analytics / dynamodb-tooling)
 * A privacy-focused, cookie-free analytics solution you can run on your own infrastructure.
 */
export interface SelfHostedAnalyticsConfig {
  /**
   * Enable self-hosted analytics
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
   * Example: 'https://api.example.com/analytics'
   * Required if enabled is true
   */
  apiEndpoint?: string

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
