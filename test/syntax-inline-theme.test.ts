import type { BunPressConfig } from '../packages/bunpress/src/types'
import { describe, expect, it } from 'bun:test'
import { defaultConfig } from '../packages/bunpress/src/config'
import { getSyntaxHighlightingStyles, LIGHT_TOKEN_PALETTE } from '../packages/bunpress/src/highlighter'
import { wrapInLayout } from '../packages/bunpress/src/serve'

/**
 * `markdown.syntaxHighlightTheme` decides the colours written inline on every
 * token. A site that set it to `github-dark` got dark-palette tokens on the
 * light code block in light mode, because the sheet only ever corrected
 * inline colours for dark mode: string literals at 1.42:1, on every code
 * block of a real documentation site. These pin that the configured theme can
 * no longer decide whether code is readable.
 */
function luminance(hex: string): number {
  const value = Number.parseInt(hex.slice(1), 16)
  const linear = (channel: number): number => {
    const v = channel / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * linear((value >> 16) & 255) + 0.7152 * linear((value >> 8) & 255) + 0.0722 * linear(value & 255)
}

function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

/** Every ground a token is drawn on in light mode, read off the page. */
const lightBackdrops = {
  'the code block': '#f6f6f7',
  'a highlighted line': '#e7e9ec',
  'a <mark>': '#f4edd5',
  'an added diff line': '#e5f5ee',
  'a removed diff line': '#f9e4e6',
}

describe('the light palette for a dark inline theme', () => {
  for (const [scope, colour] of Object.entries(LIGHT_TOKEN_PALETTE)) {
    for (const [where, backdrop] of Object.entries(lightBackdrops)) {
      it(`${scope} reads on ${where}`, () => {
        expect(Number(contrast(colour, backdrop).toFixed(2)), `${colour} on ${backdrop}`).toBeGreaterThanOrEqual(4.5)
      })
    }
  }

  it('is not emitted for the light theme, whose inline colours are already right', () => {
    const css = getSyntaxHighlightingStyles('github-light')

    expect(getSyntaxHighlightingStyles()).toBe(css)
    expect(css).not.toContain(`.token[class*='string'] {\n  color: ${LIGHT_TOKEN_PALETTE.string} !important`)
    // The bare default would flatten every scope the light theme colours and
    // this sheet does not name.
    expect(css).not.toMatch(/\n\.token \{\s*color: #24292f !important/)
  })

  it('is emitted for a dark inline theme, in full', () => {
    const css = getSyntaxHighlightingStyles('github-dark')

    expect(css).toMatch(/\n\.token \{\s*color: #24292f !important/)
    for (const scope of ['variable', 'entity-name-type', 'entity-name-function', 'entity-name-tag', 'constant', 'entity-other-attribute', 'keyword', 'storage', 'string', 'comment', 'invalid'])
      expect(css).toContain(`.token[class*='${scope}']`)
  })

  it('never outranks the dark palette', () => {
    const css = getSyntaxHighlightingStyles('github-dark')
    const added = css.slice(css.indexOf('/* Light palette over a dark inline theme'))

    // Every dark rule carries `html.dark`; none of these may, or the two
    // palettes would tie and source order would pick the theme.
    expect(added).not.toContain('html.dark')
    expect(added.match(/\.token\[class\*=/g)!.length).toBeGreaterThan(8)
  })

  it('reaches the page when the site asks for the dark theme', async () => {
    const dark = { ...defaultConfig, title: 'Docs', markdown: { ...defaultConfig.markdown, syntaxHighlightTheme: 'github-dark' } } as BunPressConfig
    const light = { ...defaultConfig, title: 'Docs' } as BunPressConfig

    const withDark = await wrapInLayout('<h1>T</h1>', dark, '/a', 'doc', {})
    const withLight = await wrapInLayout('<h1>T</h1>', light, '/a', 'doc', {})

    const stringRule = `.token[class*='string']{color:${LIGHT_TOKEN_PALETTE.string} !important}`
    expect(withDark).toContain(stringRule)
    expect(withLight).not.toContain(stringRule)
  })
})
