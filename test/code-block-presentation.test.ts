import { describe, expect, it } from 'bun:test'
import { defaultConfig } from '../packages/bunpress/src/config'
import { getSyntaxHighlightingStyles } from '../packages/bunpress/src/highlighter'

/**
 * Two regressions that only show up in a themed site, so neither was caught by
 * rendering tests: both produced valid HTML that looked wrong on screen.
 */
describe('code block presentation', () => {
  /** Every stylesheet BunPress ships, concatenated the way a page receives them. */
  function styles(): string {
    const themeCss = typeof defaultConfig.markdown?.css === 'string'
      ? defaultConfig.markdown.css
      : ''
    return `${getSyntaxHighlightingStyles()}\n${themeCss}`
  }

  /** Pull one rule's body out of a sheet by an exact selector line. */
  function ruleBody(css: string, selector: string): string {
    const at = css.indexOf(selector)
    if (at === -1) return ''
    const open = css.indexOf('{', at)
    return css.slice(open + 1, css.indexOf('}', open))
  }

  it('lets the code element inherit its colour from the panel', () => {
    // A theme may paint code blocks dark in BOTH colour modes. Hard-coding the
    // light-mode foreground here put near-black text on those dark panels.
    // Highlighted code survived it — every token carries an inline colour — but
    // a fence with no language has no tokens, so the text vanished.
    const body = ruleBody(styles(), '.bp-doc pre code')
    expect(body).toContain('color: inherit')
    expect(body).not.toContain('color: #24292f')
  })

  it('keeps code left-aligned inside a centred container', () => {
    // ASCII art in `<div align="center">` inherited text-align and had every
    // line centred on its own, which is precisely the alignment it was made of.
    expect(ruleBody(styles(), '.bp-doc pre code')).toContain('text-align: left')
    expect(ruleBody(getSyntaxHighlightingStyles(), 'pre code')).toContain('text-align: left')
  })

  it('still gives the default light panel a readable foreground', () => {
    // `inherit` is only safe because the panel itself is coloured.
    expect(ruleBody(styles(), '.bp-doc pre')).toContain('color: #24292f')
  })
})
