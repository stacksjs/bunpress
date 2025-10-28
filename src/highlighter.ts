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
  js: 'javascript',
  ts: 'typescript',
  jsx: 'javascript', // ts-syntax-highlighter treats JSX as javascript
  tsx: 'typescript', // ts-syntax-highlighter treats TSX as typescript
  htm: 'html',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
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
  // ts-syntax-highlighter supports these languages
  const supported = ['javascript', 'typescript', 'html', 'css', 'json', 'stx', 'bash']
  return supported.includes(normalized)
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
 * Intelligently restores whitespace from original code to highlighted HTML
 * Preserves exact spacing, tabs, and newlines from the original source
 */
function restoreWhitespaceFromOriginal(originalCode: string, highlightedHtml: string): string {
  // The ts-syntax-highlighter output is a series of token spans
  // We need to walk through the original code and match it with the tokens

  // First, extract all text content from tokens (in order)
  const tokenRegex = /<span[^>]*class="token[^"]*"[^>]*>([^<]*)<\/span>/g
  const tokens: string[] = []
  let match: RegExpExecArray | null

  // eslint-disable-next-line no-cond-assign
  while ((match = tokenRegex.exec(highlightedHtml)) !== null) {
    // Decode HTML entities
    const content = match[1]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, '\'')

    if (content) {
      tokens.push(content)
    }
  }

  if (tokens.length === 0) {
    // No tokens found, return as-is
    return highlightedHtml
  }

  // Now rebuild the HTML by walking through the original code and inserting whitespace
  let result = ''
  let originalPos = 0

  // Extract token spans (with their full HTML) for reconstruction
  const tokenSpans: string[] = []
  const tokenSpanRegex = /<span[^>]*class="token[^"]*"[^>]*>[^<]*<\/span>/g
  // eslint-disable-next-line no-cond-assign
  while ((match = tokenSpanRegex.exec(highlightedHtml)) !== null) {
    tokenSpans.push(match[0])
  }

  for (let i = 0; i < tokens.length; i++) {
    const tokenText = tokens[i]
    const tokenSpan = tokenSpans[i]

    // Find where this token appears in the original code
    const tokenStart = originalCode.indexOf(tokenText, originalPos)

    if (tokenStart === -1) {
      // Token not found - this shouldn't happen but handle it gracefully
      result += tokenSpan
      continue
    }

    // Add any whitespace/characters before this token
    if (tokenStart > originalPos) {
      const whitespace = originalCode.substring(originalPos, tokenStart)
      result += whitespace
    }

    // Add the token HTML
    result += tokenSpan

    // Move past this token in the original
    originalPos = tokenStart + tokenText.length
  }

  // Add any trailing content
  if (originalPos < originalCode.length) {
    result += originalCode.substring(originalPos)
  }

  return result
}

/**
 * Highlights code using ts-syntax-highlighter (async)
 * IMPORTANT: Preserves original code structure and whitespace
 */
export async function highlightCode(code: string, language: string, theme: string = 'github-light'): Promise<string> {
  const normalized = normalizeLanguage(language)

  // If language is not supported, return escaped code with proper line structure
  if (!isLanguageSupported(normalized)) {
    const escapedLines = code.split('\n').map(line =>
      `<span class="line">${escapeHtml(line)}</span>`,
    )
    return escapedLines.join('\n')
  }

  try {
    // Use the direct highlight function with theme option
    const result = await highlightTS(code, normalized, { theme })

    // Extract just the HTML content
    let html = result.html

    // Remove wrappers
    html = html.replace(/<div[^>]*class="syntax-wrapper"[^>]*>/g, '')
    html = html.replace(/<\/div>\s*$/g, '')
    html = html.replace(/<pre[^>]*>/g, '')
    html = html.replace(/<\/pre>/g, '')
    html = html.replace(/<code[^>]*>/g, '')
    html = html.replace(/<\/code>/g, '')

    // Restore original whitespace from source code
    html = restoreWhitespaceFromOriginal(code, html)

    return html.trim()
  }
  catch (error) {
    console.warn(`Failed to highlight code for language "${language}":`, error)
    const escapedLines = code.split('\n').map(line =>
      `<span class="line">${escapeHtml(line)}</span>`,
    )
    return escapedLines.join('\n')
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
  white-space: pre-wrap; /* Preserve whitespace and allow wrapping */
  word-wrap: break-word;
}

code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  color: inherit;
  white-space: inherit; /* Inherit pre-wrap from pre */
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
