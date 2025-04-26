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
