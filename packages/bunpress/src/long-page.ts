/**
 * Long pages render only what is near the reader.
 *
 * A generated reference can be one very long page. One real case: every
 * command of a CLI, 350 option tables and 20,000 elements in a single
 * document. A browser lays all of that out before it paints anything, which
 * measured 117ms on a fast laptop and four times that on the phone a
 * performance audit simulates: a single task long enough to count as the
 * page being unresponsive, for content nobody has scrolled to.
 *
 * `content-visibility: auto` lets the browser skip the layout and paint of a
 * block until it is close to the viewport. On that page it brings the first
 * layout down to under 10ms. The page stays whole to everything else:
 * find-in-page, the outline, anchors and assistive technology all still reach
 * the skipped blocks, and `auto` in `contain-intrinsic-size` makes the browser
 * remember each block's real height once it has drawn it.
 *
 * Four choices keep it from changing what a reader sees:
 *
 *  - Only pages over {@link LONG_PAGE_BYTES} of article markup opt in. An
 *    ordinary page lays out in a few milliseconds and gains nothing.
 *  - The first {@link EAGER_BLOCKS} blocks of the article are never skipped.
 *    A block that is on screen when the page loads is first laid out at its
 *    placeholder height and then at its real one, which moves everything
 *    under it: applied to every block, the page that prompted this scored a
 *    0.18 layout shift for a table the reader was already looking at. Past
 *    the first screenful a block is drawn before it scrolls into view.
 *  - Headings are never skipped. They are what an anchor, the outline and the
 *    scroll position all measure against, so they stay exact.
 *  - It is limited to browsers with scroll anchoring. A skipped block is a
 *    placeholder until drawn, and anchoring is what holds the reader's place
 *    when a block above them takes its real height; without it, scrolling up
 *    would jump.
 */

/** Article markup beyond this many characters makes a page "long". */
export const LONG_PAGE_BYTES = 150_000

/**
 * How many of the article's leading blocks always render. Forty one-line
 * blocks are taller than any screen a documentation page is read on.
 */
export const EAGER_BLOCKS = 40

/** Set on the `<article>` of a long page; the rule below is scoped to it. */
export const LONG_PAGE_CLASS = 'bp-doc--long'

export function isLongPage(articleHtml: string): boolean {
  return articleHtml.length > LONG_PAGE_BYTES
}

/**
 * In every doc page's stylesheet, not only a long page's: the client router
 * swaps the article without swapping the theme, so a reader who navigates
 * from a short page to a long one needs the rule to be there already. It
 * matches nothing until an article carries the class.
 */
export const longPageCss: string = `
@supports (overflow-anchor: auto) {
  .${LONG_PAGE_CLASS} > :nth-child(n + ${EAGER_BLOCKS + 1}):is(p, ul, ol, pre, table, .table-responsive, div[class*="language-"]) {
    content-visibility: auto;
    contain-intrinsic-size: auto 96px;
  }

  .${LONG_PAGE_CLASS} > :nth-child(n + ${EAGER_BLOCKS + 1}):is(table, .table-responsive) {
    contain-intrinsic-size: auto 240px;
  }
}
`
