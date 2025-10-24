import type { Highlighter as TSHighlighter } from 'ts-syntax-highlighter'
import { createHighlighter as createTSHighlighter, highlight as highlightTS } from 'ts-syntax-highlighter'

// Singleton highlighter instance
let globalHighlighter: TSHighlighter | null = null

/**
 * Reset the global highlighter instance (useful when changing themes)
 */
export function resetHighlighter(): void {
  globalHighlighter = null
}

/**
 * Gets or creates the global highlighter instance
 */
async function getHighlighter(): Promise<TSHighlighter> {
  if (globalHighlighter) {
    return globalHighlighter
  }

  globalHighlighter = await createTSHighlighter({
    theme: 'github-light',
    cache: true,
  })

  return globalHighlighter
}

/**
 * Language aliases mapping
 */
const LANGUAGE_ALIASES: Record<string, string> = {
  'js': 'javascript',
  'ts': 'typescript',
  'jsx': 'javascript', // ts-syntax-highlighter treats JSX as javascript
  'tsx': 'typescript', // ts-syntax-highlighter treats TSX as typescript
  'htm': 'html',
}

/**
 * Normalizes a language identifier
 */
export function normalizeLanguage(lang: string): string {
  const normalized = lang.toLowerCase().trim()
  return LANGUAGE_ALIASES[normalized] || normalized
}

/**
 * Checks if a language is supported by ts-syntax-highlighter
 */
export function isLanguageSupported(lang: string): boolean {
  const normalized = normalizeLanguage(lang)
  // ts-syntax-highlighter supports: javascript, typescript, html, css, json, stx
  const supported = ['javascript', 'typescript', 'html', 'css', 'json', 'stx']
  return supported.includes(normalized)
}

/**
 * Extracts CSS from highlighted result
 */
function extractCSS(html: string): string {
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/)
  return styleMatch ? styleMatch[1] : ''
}

/**
 * Extracts HTML content without style tags
 */
function extractHTML(html: string): string {
  return html.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '').trim()
}

/**
 * Escapes HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Highlights code using ts-syntax-highlighter (async)
 */
export async function highlightCode(code: string, language: string): Promise<string> {
  const normalized = normalizeLanguage(language)

  // If language is not supported, return escaped code
  if (!isLanguageSupported(normalized)) {
    return escapeHtml(code)
  }

  try {
    // Use the direct highlight function with theme option (not the cached highlighter)
    const result = await highlightTS(code, normalized, { theme: 'github-light' })

    // Extract just the HTML content (without wrapper divs and pre/code tags)
    const fullHtml = result.html

    // Remove the outer wrapper and extract code content
    // Structure: <div class="syntax-wrapper"><pre class="syntax"><code>...</code></pre></div>
    let html = fullHtml

    // Remove outer div wrapper
    html = html.replace(/<div[^>]*class="syntax-wrapper"[^>]*>/g, '')
    html = html.replace(/<\/div>\s*$/g, '')

    // Remove pre and code tags
    html = html.replace(/<pre[^>]*>/g, '')
    html = html.replace(/<\/pre>/g, '')
    html = html.replace(/<code[^>]*>/g, '')
    html = html.replace(/<\/code>/g, '')

    // Remove empty style attributes (style="") so CSS classes can take effect
    // Empty inline styles override CSS classes due to specificity
    html = html.replace(/\s+style=""/g, '')

    return html.trim()
  }
  catch (error) {
    console.warn(`Failed to highlight code for language "${language}":`, error)
    return escapeHtml(code)
  }
}

/**
 * Synchronous version of highlightCode
 * Note: ts-syntax-highlighter doesn't have a sync API, so this uses a different approach
 * For better performance, use the async version
 */
export function highlightCodeSync(code: string, language: string): string {
  const normalized = normalizeLanguage(language)

  // If language is not supported, return escaped code
  if (!isLanguageSupported(normalized)) {
    return escapeHtml(code)
  }

  // For sync operation, we'll just escape HTML
  // The proper highlighting will happen in the async path
  return escapeHtml(code)
}

/**
 * Gets the CSS styles for syntax highlighting
 * Note: ts-syntax-highlighter includes its own theme CSS
 */
export function getSyntaxHighlightingStyles(): string {
  return `
/* Basic syntax highlighting styles for ts-syntax-highlighter */
/* The actual theme colors are injected by ts-syntax-highlighter */

/* Ensure code blocks have proper styling */
pre {
  overflow-x: auto;
  padding: 1rem;
  border-radius: 0.5rem;
  background: #f6f8fa;
  color: #24292f;
}

code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  color: inherit;
}

/* Token spans inherit color from parent or use their inline styles */
/* Don't set a default color on .token to avoid overriding inline styles */
.token {
  /* color is set via inline styles from highlighter */
}

/* Fallback for tokens without inline styles - inherit from pre */
.token:not([style*="color"]) {
  color: inherit;
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  pre {
    background: #0d1117;
    color: #e6edf3;
  }

  .token:not([style*="color"]) {
    color: inherit;
  }
}

/* Line highlighting */
.line {
  display: block;
}

.line.highlighted {
  background-color: rgba(255, 255, 0, 0.1);
  border-left: 3px solid #fbbf24;
  padding-left: 0.5rem;
  margin-left: -0.5rem;
}

/* Focus mode */
.line.focused {
  filter: none;
}

.line.dimmed {
  opacity: 0.5;
  filter: grayscale(50%);
}

/* Diff highlighting */
.line.diff-add {
  background-color: rgba(16, 185, 129, 0.1);
  border-left: 3px solid #10b981;
}

.line.diff-remove {
  background-color: rgba(239, 68, 68, 0.1);
  border-left: 3px solid #ef4444;
  text-decoration: line-through;
}

/* Error and warning indicators */
.line.has-error {
  background-color: rgba(239, 68, 68, 0.05);
  border-left: 3px solid #ef4444;
}

.line.has-warning {
  background-color: rgba(245, 158, 11, 0.05);
  border-left: 3px solid #f59e0b;
}

/* Line numbers */
.line-number {
  display: inline-block;
  width: 2.5rem;
  text-align: right;
  padding-right: 1rem;
  color: #6b7280;
  user-select: none;
}

.line-numbers-mode {
  padding-left: 0;
}

@media (prefers-color-scheme: dark) {
  .line-number {
    color: #9ca3af;
  }
}
`
}

/**
 * Pre-warms the highlighter by creating the instance early
 * Call this during application initialization for better performance
 */
export async function prewarmHighlighter(): Promise<void> {
  await getHighlighter()
}

/**
 * Gets the highlighter instance for advanced usage
 */
export async function getHighlighterInstance(): Promise<TSHighlighter> {
  return getHighlighter()
}
