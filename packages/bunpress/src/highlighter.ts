import type { Highlighter as TSHighlighter } from 'ts-syntax-highlighter'
import { createHighlighter as createTSHighlighter, highlight as highlightTS, listLanguages } from 'ts-syntax-highlighter'

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
 * Every language id and alias the highlighter knows, built once from its own
 * registry.
 *
 * This used to be a hand-written list of seven languages plus a hand-written
 * alias table, while the highlighter shipped grammars for forty-eight. Every
 * other fence — markdown, yaml, sql, go, python, rust, diff, dockerfile — fell
 * through to the "unsupported" branch and rendered as plain escaped text.
 */
let languageIndex: Map<string, string> | null = null

function getLanguageIndex(): Map<string, string> {
  if (languageIndex)
    return languageIndex

  const index = new Map<string, string>()
  try {
    for (const language of listLanguages()) {
      index.set(language.id.toLowerCase(), language.id)
      for (const alias of language.aliases ?? [])
        index.set(alias.toLowerCase(), language.id)
    }
  }
  catch {
    // A highlighter without a registry leaves the map empty, which degrades to
    // unhighlighted code rather than breaking the build.
  }

  languageIndex = index
  return index
}

/**
 * Site-declared aliases from `markdown.languageAliases`, mapping a fence
 * language the highlighter has no grammar for onto one it does.
 *
 * A project documenting its own language writes ```mylang fences, and without
 * a grammar every one of them renders as flat escaped text. Pointing the
 * alias at the closest grammar gets real tokens; the fence keeps its own name
 * everywhere it is displayed.
 */
let languageAliases: Record<string, string> = {}

export function setLanguageAliases(aliases: Record<string, string> | undefined): void {
  languageAliases = {}
  for (const [from, to] of Object.entries(aliases ?? {}))
    languageAliases[from.toLowerCase().trim()] = to.toLowerCase().trim()
}

/**
 * Normalizes a language identifier to its canonical id.
 * Unknown identifiers are returned as-is so the caller can report them.
 */
export function normalizeLanguage(lang: string): string {
  const normalized = lang.toLowerCase().trim()
  const aliased = languageAliases[normalized] ?? normalized
  return getLanguageIndex().get(aliased) ?? aliased
}

/**
 * Checks if a language is supported by ts-syntax-highlighter
 */
export function isLanguageSupported(lang: string): boolean {
  const normalized = lang.toLowerCase().trim()
  return getLanguageIndex().has(languageAliases[normalized] ?? normalized)
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
 * Restores whitespace between tokens for a single line
 * Simpler version that only handles horizontal whitespace (no newlines)
 */
function restoreWhitespaceForLine(originalLine: string, highlightedHtml: string): string {
  // Extract all token text content from the HTML
  const tokenRegex = /<span[^>]*class="token[^"]*"[^>]*>([^<]*)<\/span>/g
  const tokens: Array<{ text: string; span: string }> = []
  let match: RegExpExecArray | null

  while ((match = tokenRegex.exec(highlightedHtml)) !== null) {
    // Decode HTML entities (handle both &#39; and &#039; variants)
    const content = match[1]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#0*39;/g, '\'')

    if (content) {
      tokens.push({ text: content, span: match[0] })
    }
  }

  if (tokens.length === 0) {
    return highlightedHtml
  }

  // Rebuild HTML with proper whitespace from original.
  //
  // Leading indentation is NOT prepended up front: the highlighter already
  // emits it, either inside the first token or as a token of its own. Adding
  // it here as well doubled every indent — two-space source rendered at four,
  // and each nesting level compounded. The scan below covers both shapes: a
  // token that carries its own indentation is found at offset 0 and consumes
  // it, and a token that does not leaves a whitespace gap that gets copied
  // across verbatim.
  let result = ''
  let originalPos = 0

  for (let i = 0; i < tokens.length; i++) {
    const { text: tokenText, span: tokenSpan } = tokens[i]

    // Find where this token appears in the original line
    const tokenStart = originalLine.indexOf(tokenText, originalPos)

    if (tokenStart === -1) {
      // Token not found - just add the span
      result += tokenSpan
      continue
    }

    // Add whitespace between previous token and this one
    if (tokenStart > originalPos) {
      const between = originalLine.substring(originalPos, tokenStart)
      // Only add if it's whitespace (spaces/tabs)
      if (/^\s+$/.test(between)) {
        result += between
      }
    }

    // Add the token HTML
    result += tokenSpan

    // Move past this token in the original
    originalPos = tokenStart + tokenText.length
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
    // Highlight each line separately to preserve line structure
    const lines = code.split('\n')
    const highlightedLines = await Promise.all(lines.map(async (line) => {
      if (!line.trim()) {
        // Empty line - preserve leading whitespace
        return `<span class="line">${line}</span>`
      }

      const result = await highlightTS(line, normalized, { theme })

      // Extract just the HTML content
      let html = result.html

      // Remove wrappers
      html = html.replace(/<div[^>]*class="syntax-wrapper"[^>]*>/g, '')
      html = html.replace(/<\/div>\s*$/g, '')
      html = html.replace(/<pre[^>]*>/g, '')
      html = html.replace(/<\/pre>/g, '')
      html = html.replace(/<code[^>]*>/g, '')
      html = html.replace(/<\/code>/g, '')

      // Restore whitespace between tokens from original line
      html = restoreWhitespaceForLine(line, html.trim())

      // Wrap in line span if not already wrapped
      if (!html.startsWith('<span class="line">')) {
        html = `<span class="line">${html}</span>`
      }

      return html
    }))

    return highlightedLines.join('\n')
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

/* Fallback presentation for code blocks that are NOT rendered by a BunPress
 * theme (a theme owns \`pre[data-lang]\` / \`[class*='language-']\` and styles
 * them itself). Scoping keeps this sheet from fighting the theme. */
pre:not([data-lang]):not([class*='language-']) {
  overflow-x: auto;
  padding: 1rem;
  border-radius: 0.5rem;
  background: #f6f8fa;
  color: #24292f;
}

/* Code is scrolled, never wrapped: wrapping mid-token destroys indentation
 * and makes line highlighting/diff markers line up with the wrong rows. */
pre code {
  font-family: var(--bp-font-family-mono, 'Consolas', 'Monaco', 'Courier New', monospace);
  line-height: 1.6;
  color: inherit;
  white-space: pre;
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

/* Dark theme support. Gated on html.dark so an explicit light choice (or a
 * site with darkMode: 'light') is never overridden by the OS preference. */
html.dark pre:not([data-lang]):not([class*='language-']) {
  background: #0d1117;
  color: #e6edf3;
}

.token:not([style*="color"]) {
  color: inherit;
}

/* Dark-mode token colours.
 * -------------------------------------------------------------------------
 * The highlighter resolves one theme at build time and writes the result as
 * an INLINE style on every token. That theme is a light one, so in dark mode
 * every code block was rendering light-theme colours on a dark ground:
 * string literals at #0a3069 (navy) on a near-black panel is about 1.4:1,
 * which is unreadable, and the default token colour #24292f is worse.
 *
 * Inline styles cannot be beaten by specificity, so this sheet corrects them
 * with !important. Tokens carry TextMate scope names as classes
 * (\`token string-quoted-double-rust\`, \`token keyword-control-ts\`), and the
 * language suffix varies per grammar, so the scopes are matched by substring
 * rather than enumerated. Palette is GitHub Dark, which is designed for this
 * ground and clears WCAG AA on all of it.
 *
 * Rules run general to specific: a scope like \`support-function-builtin\`
 * matches more than one selector, and the later, more specific one wins.
 * The default rule below deliberately stays at one class + one type so every
 * scope rule under it (which adds an attribute selector) outranks it. */
html.dark .token {
  color: #e6edf3 !important;
}

html.dark .token[class*='variable'] {
  color: #ffa657 !important;
}

html.dark .token[class*='entity-name-type'],
html.dark .token[class*='support-type'],
html.dark .token[class*='support-class'] {
  color: #7ee787 !important;
}

html.dark .token[class*='entity-name-function'],
html.dark .token[class*='support-function'],
html.dark .token[class*='entity-name-tag'] {
  color: #d2a8ff !important;
}

html.dark .token[class*='constant'],
html.dark .token[class*='entity-other-attribute'] {
  color: #79c0ff !important;
}

html.dark .token[class*='keyword'],
html.dark .token[class*='storage'] {
  color: #ff7b72 !important;
}

html.dark .token[class*='string'],
html.dark .token[class*='markup-inserted'] {
  color: #a5d6ff !important;
}

html.dark .token[class*='comment'] {
  color: #8b949e !important;
}

html.dark .token[class*='invalid'] {
  color: #ffa198 !important;
}

/* Line highlighting
 * -------------------------------------------------------------------------
 * Lines are emitted as \`<span class="line">…</span>\\n\` so that the code
 * element's textContent still round-trips to real source (the copy button
 * relies on it). The trailing newline is what breaks the line under
 * \`white-space: pre\` — so .line MUST stay inline, otherwise every row
 * renders followed by an empty one. Rows that need a full-width background
 * opt into inline-block instead. */
.line {
  display: inline;
}

.line.highlighted,
.line.diff-add,
.line.diff-remove,
.line.has-error,
.line.has-warning {
  display: inline-block;
  min-width: 100%;
}

.line.highlighted {
  background-color: rgba(255, 255, 0, 0.1);
  /* Inset shadow instead of a border so the gutter accent never shifts code. */
  box-shadow: inset 3px 0 #fbbf24;
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
  box-shadow: inset 3px 0 #10b981;
}

.line.diff-remove {
  background-color: rgba(239, 68, 68, 0.1);
  box-shadow: inset 3px 0 #ef4444;
  text-decoration: line-through;
}

/* Error and warning indicators */
.line.has-error {
  background-color: rgba(239, 68, 68, 0.05);
  box-shadow: inset 3px 0 #ef4444;
}

.line.has-warning {
  background-color: rgba(245, 158, 11, 0.05);
  box-shadow: inset 3px 0 #f59e0b;
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
