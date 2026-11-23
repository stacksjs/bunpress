/**
 * Move every component `<style>` into the `<head>`, once.
 *
 * A template keeps its styles beside its markup, which is the right place to
 * write them and the wrong place to ship them. Rendered, each block lands in
 * the body after the element it styles, so a browser that starts painting
 * before the whole document has arrived paints that element unstyled and
 * then moves it when the block turns up. On a long page that is not a
 * hypothetical: the sidebar's `position: fixed` came 65 KB after the sidebar
 * and the outline's layout 900 KB after the article began, and a reference
 * page scored a 0.31 layout shift for a sidebar that had only "moved" from
 * where an unstyled `<nav>` happens to sit.
 *
 * It also repeats. A template rendered ten times ships its styles ten times:
 * one sidebar carried the same 4.5 KB block for each of its sections, on
 * every page of the site.
 *
 * So the finished document is rewritten once: each `<style>` found in the
 * body is removed and placed before `</head>`, in document order, and an
 * identical block is kept only the first time. Order is preserved because
 * the cascade depends on it - these blocks used to follow the theme's own
 * sheet, and they still do. Each is minified on the way, like the theme.
 *
 * What is left alone is anything that is not this page's own styling: the
 * contents of scripts (which build markup as strings), comments, and the
 * elements whose `<style>` child means something else or nothing at all -
 * an inline `<svg>` carries its own, and a `<template>`, `<noscript>`,
 * `<textarea>`, `<pre>` or `<iframe>` holds text the page has not adopted.
 */

import { minifyCss } from './minify-css'

/** Marks a block this pass moved, so the client router can carry it across a navigation. */
export const HOISTED_STYLE_ATTRIBUTE = 'data-bp-hoisted'

/**
 * One alternation, so a `<style>` is only ever matched outside the regions
 * listed before it: the first alternative to match at a position wins, and a
 * region is consumed whole.
 */
const BODY_REGIONS = /<script\b[^>]*>[\s\S]*?<\/script\s*>|<!--[\s\S]*?-->|<(svg|template|noscript|textarea|pre|iframe)\b[^>]*>[\s\S]*?<\/\1\s*>|<style\b([^>]*)>([\s\S]*?)<\/style\s*>/gi

export function hoistComponentStyles(html: string): string {
  const headClose = html.search(/<\/head\s*>/i)
  if (headClose === -1)
    return html

  const seen = new Set<string>()
  const hoisted: string[] = []

  const body = html.slice(headClose).replace(BODY_REGIONS, (region, _container: string | undefined, attributes: string | undefined, css: string | undefined) => {
    // Only the last alternative captures a stylesheet; everything else is a
    // region to step over untouched.
    if (css === undefined || !/^<style\b/i.test(region))
      return region

    const attrs = (attributes ?? '').trim()
    const key = `${attrs}\u0000${css.trim()}`

    if (!seen.has(key)) {
      seen.add(key)
      if (css.trim())
        hoisted.push(`<style ${HOISTED_STYLE_ATTRIBUTE}${attrs ? ` ${attrs}` : ''}>${minifyCss(css)}</style>`)
    }

    return ''
  })

  if (hoisted.length === 0)
    return html

  return `${html.slice(0, headClose)}${hoisted.join('\n')}\n${body}`
}
