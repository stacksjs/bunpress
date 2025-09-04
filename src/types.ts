import type { marked } from 'marked'

export interface BunPressConfig {
  verbose: boolean

  /**
   * Configuration for the markdown-to-html plugin
   */
  markdown: MarkdownPluginConfig
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
  markedOptions?: Parameters<typeof marked.parse>[1]

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
