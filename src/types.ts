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
