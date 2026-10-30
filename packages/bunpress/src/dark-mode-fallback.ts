/**
 * A dark palette for readers with no JavaScript.
 *
 * BunPress switches theme by putting `dark` on `<html>`, which means every
 * dark rule in every stylesheet - the palette, the syntax colours, the message
 * previews, a site's own overrides - is gated on a class that only a script
 * can add. With scripting off, nothing adds it: a reader whose machine asks
 * for dark gets the light palette, and the site has no way to know. Nothing
 * reports it either, because the CSS is valid and the HTML is valid; the
 * document simply never acquires the class the CSS is waiting for.
 *
 * So the dark rules are mirrored under `prefers-color-scheme: dark`, and the
 * mirror is generated from the rules themselves rather than written out beside
 * them. Written out, it would be a second copy of the palette to keep in step,
 * and the next dark rule anyone adds would be missing from it - which is the
 * failure this file exists to fix, reintroduced one rule at a time.
 *
 * The mirror's selector is the handshake with `THEME_BOOTSTRAP` in `serve.ts`:
 *
 *   html[data-theme-mode='auto']:not([data-bp-theme])
 *
 * `data-theme-mode` is SSR'd, and is `auto` only when the site leaves the
 * choice to the reader - a site forcing light or dark is never second-guessed
 * by the machine. `data-bp-theme` is set by script the moment it resolves a
 * stored choice, which stands the mirror down before the first paint, so the
 * class and the media query are never both in force.
 */

/** The selector the mirrored rules are keyed on. */
export const DARK_FALLBACK_SCOPE = `html[data-theme-mode='auto']:not([data-bp-theme])`

/**
 * True for a selector list that targets the dark theme, e.g. `.dark`,
 * `html.dark`, `html.dark .token[class*='comment']`, `.dark .BPSidebar`.
 *
 * Matched on the class token rather than the substring, so a component that
 * happens to be called `.dark-toggle` is left alone.
 */
function targetsDark(selector: string): boolean {
  return /(?:^|[\s>+~,(])(?:html)?\.dark(?![\w-])/.test(selector)
}

/**
 * Rewrite one selector list so it keys on the fallback scope instead of the
 * class. Selectors in the list that do not mention `.dark` are dropped: they
 * are the theme-independent half of a shared rule and already apply.
 */
function rescope(selector: string): string {
  return splitTopLevel(selector, ',')
    .map(part => part.trim())
    .filter(part => part && targetsDark(part))
    .map(part => part
      .replace(/^html\.dark(?![\w-])/, DARK_FALLBACK_SCOPE)
      .replace(/^\.dark(?![\w-])/, DARK_FALLBACK_SCOPE)
      .replace(/(?<=[\s>+~(])(?:html)?\.dark(?![\w-])/g, DARK_FALLBACK_SCOPE))
    .join(',\n')
}

/**
 * Split on a separator that is not inside brackets, parentheses or a string.
 * `:is(.dark, .foo)` and `[class*=',']` both contain commas that are not
 * selector boundaries.
 */
function splitTopLevel(input: string, separator: string): string[] {
  const parts: string[] = []
  let depth = 0
  let quote: string | null = null
  let start = 0

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]
    if (quote) {
      if (ch === '\\') i++
      else if (ch === quote) quote = null
      continue
    }
    if (ch === '"' || ch === '\'') { quote = ch; continue }
    if (ch === '(' || ch === '[') { depth++; continue }
    if (ch === ')' || ch === ']') { depth--; continue }
    if (ch === separator && depth === 0) {
      parts.push(input.slice(start, i))
      start = i + 1
    }
  }
  parts.push(input.slice(start))
  return parts
}

/** One top-level block of a stylesheet: its prelude and its `{ ... }` body. */
interface Block {
  prelude: string
  body: string
}

/**
 * Walk a stylesheet's top level, returning each rule's prelude and body.
 *
 * A hand-rolled walk rather than a parser because this runs on every page
 * render and only has to find brace boundaries. Comments are skipped so a
 * brace inside one cannot unbalance the walk, and an unterminated block at the
 * end of the input is discarded rather than guessed at.
 */
function topLevelBlocks(css: string): Block[] {
  const blocks: Block[] = []
  let i = 0
  let preludeStart = 0

  while (i < css.length) {
    const ch = css[i]

    if (ch === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2)
      i = end === -1 ? css.length : end + 2
      continue
    }
    if (ch === '"' || ch === '\'') {
      const quote = ch
      i++
      while (i < css.length && css[i] !== quote) {
        if (css[i] === '\\') i++
        i++
      }
      i++
      continue
    }
    if (ch === '{') {
      let depth = 1
      let j = i + 1
      while (j < css.length && depth > 0) {
        const c = css[j]
        if (c === '/' && css[j + 1] === '*') {
          const end = css.indexOf('*/', j + 2)
          j = end === -1 ? css.length : end + 2
          continue
        }
        if (c === '"' || c === '\'') {
          const quote = c
          j++
          while (j < css.length && css[j] !== quote) {
            if (css[j] === '\\') j++
            j++
          }
          j++
          continue
        }
        if (c === '{') depth++
        else if (c === '}') depth--
        j++
      }
      if (depth === 0) {
        blocks.push({ prelude: css.slice(preludeStart, i), body: css.slice(i + 1, j - 1) })
      }
      i = j
      preludeStart = i
      continue
    }
    if (ch === ';' && css.slice(preludeStart, i).trimStart().startsWith('@')) {
      // A statement at-rule: @charset, @import, @layer a, b;
      i++
      preludeStart = i
      continue
    }
    i++
  }

  return blocks
}

/**
 * Build the `prefers-color-scheme: dark` mirror of every dark rule in a
 * stylesheet, or an empty string when it has none.
 *
 * At-rules are not descended into. A dark rule already inside a media query
 * cannot be mirrored into another one - media queries do not nest in plain CSS
 * - and the only dark rules the themes put inside one are width-conditional
 * component tweaks, which the mirrored palette underneath them already covers.
 */
export function darkModeFallbackCSS(css: string): string {
  const mirrored: string[] = []

  for (const { prelude, body } of topLevelBlocks(css)) {
    const selector = prelude.replace(/\/\*[\s\S]*?\*\//g, '').trim()
    if (!selector || selector.startsWith('@') || !targetsDark(selector)) continue

    const scoped = rescope(selector)
    if (!scoped) continue

    mirrored.push(`${scoped} {${body}}`)
  }

  if (!mirrored.length) return ''

  return [
    '',
    '/* Dark palette for a reader with no JavaScript to add the class it is',
    ' * gated on. Generated from the dark rules above - see dark-mode-fallback.ts. */',
    '@media (prefers-color-scheme: dark) {',
    mirrored.join('\n\n'),
    '}',
    '',
  ].join('\n')
}
