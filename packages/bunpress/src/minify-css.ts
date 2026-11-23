/**
 * Remove from a stylesheet what only its authors read.
 *
 * The theme is written to be read: every rule is indented and most of them
 * are explained in a comment. All of that was inlined into the head of every
 * page as written, which is a third of what a browser has to download before
 * it can paint a documentation page (146 KB of CSS on a real site, a third
 * of it comments and indentation).
 *
 * This is not an optimiser. It never reorders, merges or rewrites a rule, so
 * what the browser parses is the sheet as written; it only drops comments and
 * the whitespace CSS gives no meaning to. Strings and `url(...)` are copied
 * through untouched, because a `/*` inside a quoted `content` or a data URL
 * is not a comment and a space inside either is not padding.
 *
 * The spaces that do mean something are kept: between two words or values,
 * before a `:` (`a :hover` and `a:hover` select different things), and around
 * the operators inside `calc()`, which are never next to the punctuation
 * tightened here.
 */

const cache = new Map<string, string>()
const CACHE_LIMIT = 32

/** `true` for the characters a space is never needed beside. */
function tightens(char: string): boolean {
  return char === '{' || char === '}' || char === ';' || char === ','
}

export function minifyCss(css: string): string {
  const cached = cache.get(css)
  if (cached !== undefined)
    return cached

  let out = ''
  let pendingSpace = false
  const length = css.length

  const push = (text: string): void => {
    if (pendingSpace) {
      const previous = out[out.length - 1]
      const next = text[0]!
      // A space survives only between two things that would otherwise fuse,
      // and never after the colon of a declaration.
      if (previous !== undefined && !tightens(previous) && !tightens(next) && previous !== ':')
        out += ' '
      pendingSpace = false
    }
    // The last declaration of a block needs no terminator. Checked here, as
    // the brace is written, so a `;}` inside a string is never touched.
    if (text === '}' && out.endsWith(';'))
      out = out.slice(0, -1)
    out += text
  }

  for (let i = 0; i < length; i++) {
    const char = css[i]!

    // A comment: gone, and it separates what was on either side of it.
    if (char === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2)
      i = end === -1 ? length : end + 1
      pendingSpace = true
      continue
    }

    // A string: copied whole, escapes included.
    if (char === '"' || char === '\'') {
      let j = i + 1
      while (j < length && css[j] !== char) {
        if (css[j] === '\\')
          j++
        j++
      }
      push(css.slice(i, j + 1))
      i = j
      continue
    }

    // An unquoted url(): copied whole. A quoted one is a string and is
    // handled by the branch above when the scan reaches its quote.
    if ((char === 'u' || char === 'U') && css.slice(i, i + 4).toLowerCase() === 'url(' && css[i + 4] !== '"' && css[i + 4] !== '\'') {
      const end = css.indexOf(')', i + 4)
      const stop = end === -1 ? length - 1 : end
      push(css.slice(i, stop + 1))
      i = stop
      continue
    }

    if (char === ' ' || char === '\n' || char === '\t' || char === '\r' || char === '\f') {
      pendingSpace = true
      continue
    }

    push(char)
  }

  const result = out.trim()

  if (cache.size >= CACHE_LIMIT)
    cache.delete(cache.keys().next().value!)
  cache.set(css, result)

  return result
}
