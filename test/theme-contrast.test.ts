import { describe, expect, it } from 'bun:test'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { darkModeFallbackCSS } from '../packages/bunpress/src/dark-mode-fallback'
import { getSyntaxHighlightingStyles } from '../packages/bunpress/src/highlighter'
import { getBunThemeCSS, getVitePressThemeCSS } from '../packages/bunpress/src/themes'

/**
 * The floor under both themes, measured rather than eyeballed.
 *
 * None of what this file catches is visible in a stylesheet. A palette can be
 * correct token by token and still fail on the page: `--bp-c-text-3` cleared
 * nothing it was drawn on, the dark filled button put white on a pale tint
 * because the ramp reverses between the two palettes, and the dark rules
 * applied only once a script had added a class. Every number below was a real
 * reading taken out of a headless browser on the BunPress docs, and every one
 * of them is here so that the next change to a colour has to answer for it.
 *
 * WCAG 2.2 AA: 4.5:1 for body text, 3:1 for text at 24px or at 18.66px bold,
 * and 3:1 for the boundary of a control (1.4.11). Decorative hairlines are
 * exempt, which is the whole reason `--bp-c-border` and `--bp-c-divider` are
 * two tokens - see Colors: Borders in either theme.
 */

const AA_TEXT = 4.5
const AA_NON_TEXT = 3

function channel(value: number): number {
  const v = value / 255
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

function luminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const x = luminance(a)
  const y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

function parseHex(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** One declaration, before anything has been resolved. */
type Declarations = Record<string, { hex?: string, alias?: string }>

/**
 * The custom properties one selector declares, unresolved.
 *
 * Unresolved on purpose: the dark palette overrides `--bp-c-indigo-1` and
 * leaves `--bp-c-brand-1: var(--bp-c-indigo-1)` alone, because a `var()` is
 * resolved where it is read, not where it is written. Resolving each block on
 * its own would read the dark brand as the light indigo - which is the
 * browser's behaviour inverted, and would have this file measuring colours
 * that never appear on a page.
 *
 * Only hex values are collected. Every token measured here is written as hex,
 * and the ratio of a composite or an `rgba()` wash means nothing on its own.
 */
function declarationsFor(css: string, selector: string): Declarations {
  const out: Declarations = {}

  const pattern = new RegExp(`(?:^|\\n)\\s*${selector.replace(/[.[\]*]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 'g')
  for (const block of css.matchAll(pattern)) {
    for (const line of block[1].split('\n')) {
      const hex = line.match(/^\s*(--[a-z0-9-]+)\s*:\s*(#[0-9a-f]{6})\s*;/i)
      if (hex) {
        out[hex[1]] = { hex: hex[2].toLowerCase() }
        continue
      }
      const ref = line.match(/^\s*(--[a-z0-9-]+)\s*:\s*var\(\s*(--[a-z0-9-]+)\s*\)\s*;/i)
      if (ref) out[ref[1]] = { alias: ref[2] }
    }
  }

  return out
}

/**
 * Flatten a cascade of declaration blocks into the hex values a browser would
 * compute: later blocks win, and every alias is followed afterwards, through
 * however many hops it takes.
 */
function resolve(...blocks: Declarations[]): Record<string, string> {
  const merged: Declarations = Object.assign({}, ...blocks)
  const palette: Record<string, string> = {}

  for (const [name, decl] of Object.entries(merged)) {
    if (decl.hex) {
      palette[name] = decl.hex
      continue
    }
    const seen = new Set<string>([name])
    let target = decl.alias
    while (target && !seen.has(target)) {
      seen.add(target)
      const next = merged[target]
      if (!next) break
      if (next.hex) {
        palette[name] = next.hex
        break
      }
      target = next.alias
    }
  }

  return palette
}

interface Pair {
  /** What is drawn. */
  fg: string
  /** What it is drawn on. */
  bg: string
  /** The floor it has to clear, and why this pair exists at all. */
  need: number
  why: string
}

/**
 * Every pair the themes actually draw. Each one is a rule somewhere in the
 * theme putting the first token on the second, so a ratio here is a reading,
 * not a hypothetical.
 */
const PAIRS: Pair[] = [
  // Body copy, on each of the three grounds a page uses.
  { fg: '--bp-c-text-1', bg: '--bp-c-bg', need: AA_TEXT, why: 'body copy' },
  { fg: '--bp-c-text-1', bg: '--bp-c-bg-alt', need: AA_TEXT, why: 'body copy on the nav and code blocks' },
  { fg: '--bp-c-text-1', bg: '--bp-c-bg-elv', need: AA_TEXT, why: 'body copy in a panel' },
  { fg: '--bp-c-text-2', bg: '--bp-c-bg', need: AA_TEXT, why: 'muted copy' },
  { fg: '--bp-c-text-2', bg: '--bp-c-bg-alt', need: AA_TEXT, why: 'muted copy on the nav' },
  { fg: '--bp-c-text-2', bg: '--bp-c-bg-elv', need: AA_TEXT, why: 'muted copy in a panel' },
  { fg: '--bp-c-text-2', bg: '--bp-c-bg-soft', need: AA_TEXT, why: 'the search footer and the sms meta line' },

  // text-3 is VitePress's placeholder step, and WCAG has no exemption for a
  // placeholder. It is the search trigger's own label, the code block's
  // language tag, the line numbers, and the email preview's headers.
  { fg: '--bp-c-text-3', bg: '--bp-c-bg', need: AA_TEXT, why: 'the search trigger kbd and the email headers' },
  { fg: '--bp-c-text-3', bg: '--bp-c-bg-alt', need: AA_TEXT, why: 'the search trigger label' },
  { fg: '--bp-c-text-3', bg: '--bp-c-bg-elv', need: AA_TEXT, why: 'the sms character count and the message kind' },
  { fg: '--bp-c-text-3', bg: '--bp-c-bg-soft', need: AA_TEXT, why: 'the search footer hint' },

  // Links and inline code, which is what the text end of the brand ramp is
  // for. The bun theme used its identity orange here at 2.05:1.
  { fg: '--bp-c-brand-1', bg: '--bp-c-bg', need: AA_TEXT, why: 'links and inline code' },
  { fg: '--bp-c-brand-1', bg: '--bp-c-bg-alt', need: AA_TEXT, why: 'links in the nav and the sidebar' },
  { fg: '--bp-c-brand-1', bg: '--bp-c-bg-elv', need: AA_TEXT, why: 'links in a panel' },
  { fg: '--bp-c-brand-2', bg: '--bp-c-bg', need: AA_TEXT, why: 'a link being hovered' },

  // The filled call to action. The ramp reverses between the palettes, so this
  // is the pair that was 2.02:1 in the dark one.
  { fg: '--bp-button-brand-text', bg: '--bp-button-brand-bg', need: AA_TEXT, why: 'the label on the filled button' },
  { fg: '--bp-button-brand-hover-text', bg: '--bp-button-brand-hover-bg', need: AA_TEXT, why: 'the filled button under the cursor' },
  { fg: '--bp-button-brand-active-text', bg: '--bp-button-brand-active-bg', need: AA_TEXT, why: 'the filled button being pressed' },

  // Alert and admonition titles, drawn on the alert's own wash. The bun
  // theme's note title was its identity blue at 2.31:1.
  { fg: '--bp-c-note-1', bg: '--bp-c-bg', need: AA_TEXT, why: 'a note title' },
  { fg: '--bp-c-tip-1', bg: '--bp-c-bg', need: AA_TEXT, why: 'a tip title' },
  { fg: '--bp-c-success-1', bg: '--bp-c-bg', need: AA_TEXT, why: 'a success title' },
  { fg: '--bp-c-warning-1', bg: '--bp-c-bg', need: AA_TEXT, why: 'a warning title' },
  { fg: '--bp-c-danger-1', bg: '--bp-c-bg', need: AA_TEXT, why: 'a danger title' },
  { fg: '--bp-c-important-1', bg: '--bp-c-bg', need: AA_TEXT, why: 'an important title' },
  { fg: '--bp-c-sponsor', bg: '--bp-c-bg', need: AA_TEXT, why: 'the sponsor button label and border' },

  // Control boundaries: 1.4.11. The hairline is deliberately not in this list.
  { fg: '--bp-c-border', bg: '--bp-c-bg', need: AA_NON_TEXT, why: 'the edge of a control on the page' },
  { fg: '--bp-c-border', bg: '--bp-c-bg-alt', need: AA_NON_TEXT, why: 'the edge of the search field on the nav' },
  { fg: '--bp-c-border', bg: '--bp-c-bg-elv', need: AA_NON_TEXT, why: 'the edge of a control in a panel' },
  { fg: '--bp-c-border', bg: '--bp-c-bg-soft', need: AA_NON_TEXT, why: 'the edge of the copy button on a code block' },
]

const THEMES = [
  { name: 'vitepress', css: getVitePressThemeCSS() },
  { name: 'bun', css: getBunThemeCSS() },
] as const

describe('theme contrast', () => {
  for (const theme of THEMES) {
    for (const [mode, selector] of [['light', ':root'], ['dark', '.dark']] as const) {
      describe(`${theme.name}, ${mode}`, () => {
        // The dark palette overrides the light one rather than replacing it,
        // which is also how the browser sees it.
        const light = declarationsFor(theme.css, ':root')
        const palette = mode === 'light'
          ? resolve(light)
          : resolve(light, declarationsFor(theme.css, '.dark'))

        for (const pair of PAIRS) {
          it(`${pair.fg} on ${pair.bg} clears ${pair.need}:1 (${pair.why})`, () => {
            const fg = palette[pair.fg]
            const bg = palette[pair.bg]

            // A pair the theme does not declare at all is not a pass. Either
            // the token was renamed, in which case this entry follows it, or
            // the theme is missing a token the components read.
            expect(fg, `${theme.name}/${mode} declares no ${pair.fg}`).toBeTruthy()
            expect(bg, `${theme.name}/${mode} declares no ${pair.bg}`).toBeTruthy()

            const ratio = contrast(parseHex(fg), parseHex(bg))
            expect(
              Number(ratio.toFixed(2)),
              `${pair.fg} (${fg}) on ${pair.bg} (${bg}) is ${ratio.toFixed(2)}:1`,
            ).toBeGreaterThanOrEqual(pair.need)
          })
        }

        it('keeps the three text steps distinguishable from one another', () => {
          // Three tokens that measure the same are worse than one: the ramp
          // stops carrying hierarchy and a reader cannot tell a caption from
          // body copy. A ratio of ratios, so it holds in either palette.
          const bg = parseHex(palette['--bp-c-bg'])
          const steps = ['--bp-c-text-1', '--bp-c-text-2', '--bp-c-text-3']
            .map(name => contrast(parseHex(palette[name]), bg))

          for (let i = 1; i < steps.length; i++)
            expect(steps[i - 1] / steps[i]).toBeGreaterThan(1.15)
        })

        it(`declares a ${selector} palette at all`, () => {
          expect(Object.keys(declarationsFor(theme.css, selector)).length).toBeGreaterThan(10)
        })
      })
    }
  }
})

describe('the syntax theme on the grounds BunPress draws it on', () => {
  /**
   * The highlighter resolves one theme at build time and writes it as an
   * inline style on every token, so these colours cannot come from a palette.
   * GitHub Light is specified against a white editor background and a code
   * block here is drawn on `--bp-c-bg-alt` with a wash on top of that, which
   * is why three of its tokens are corrected in `highlighter.ts`. The
   * backdrops below are every ground a token lands on, read off the page.
   */
  const lightBackdrops = {
    'the code block': '#f6f6f7',
    'a highlighted line': '#e7e9ec',
    'a <mark>': '#f4edd5',
    'an added diff line': '#e5f5ee',
    'a removed diff line': '#f9e4e6',
  }

  const lightTokens = {
    comment: '#5c636b',
    keyword: '#c5141f',
    function: '#7a3fd0',
    'line number': '#5b6270',
    class: '#953800',
    tag: '#116329',
    number: '#0550ae',
    string: '#0a3069',
    foreground: '#24292f',
  }

  for (const [token, colour] of Object.entries(lightTokens)) {
    for (const [where, backdrop] of Object.entries(lightBackdrops)) {
      it(`light ${token} reads on ${where}`, () => {
        const ratio = contrast(parseHex(colour), parseHex(backdrop))
        expect(Number(ratio.toFixed(2)), `${colour} on ${backdrop}`).toBeGreaterThanOrEqual(AA_TEXT)
      })
    }
  }

  it('the corrections the light theme needs are the ones highlighter.ts makes', () => {
    const css = getSyntaxHighlightingStyles()

    // Spelled out rather than matched loosely: if one of these is edited to a
    // colour the loop above would reject, the loop only catches it while this
    // test still says which rule carries the value.
    expect(css).toContain(`color: ${lightTokens.comment} !important`)
    expect(css).toContain(`color: ${lightTokens.function} !important`)
    expect(css).toContain(`color: ${lightTokens.keyword} !important`)
    expect(css).toContain(`color: ${lightTokens['line number']}`)
  })

  it('switches the dark syntax colours on the class, never on the OS preference', () => {
    const css = getSyntaxHighlightingStyles()

    // One rule used to key off prefers-color-scheme while every other rule in
    // the sheet keyed off html.dark, so an explicit light choice on a dark
    // machine - and the reverse - put one of the two palettes on the wrong
    // ground. The media query the sheet may still carry is the generated
    // no-script mirror, which is keyed on the attribute as well.
    for (const query of css.matchAll(/@media\s*\(prefers-color-scheme[^)]*\)\s*\{/g))
      expect(css.slice(query.index!, query.index! + 400)).toContain('data-theme-mode')
  })
})

describe('the no-script dark palette', () => {
  /**
   * BunPress switches theme with a class, and only a script adds it. The
   * mirror under `prefers-color-scheme: dark` is what a reader with scripting
   * off gets, and it is generated from the dark rules so it cannot fall behind
   * them - which these tests are here to keep true.
   */
  const sheets = [
    ['the vitepress theme', getVitePressThemeCSS()],
    ['the bun theme', getBunThemeCSS()],
    ['the syntax theme', getSyntaxHighlightingStyles()],
  ] as const

  for (const [name, css] of sheets) {
    it(`mirrors every top-level dark rule in ${name}`, () => {
      const mirror = darkModeFallbackCSS(css)

      // One mirrored rule per dark rule the sheet declares at its top level.
      const declared = [...css.matchAll(/(?:^|\n)\s*((?:html)?\.dark(?![\w-])[^{]*)\{/g)].length
      const mirrored = [...mirror.matchAll(/html\[data-theme-mode='auto'\]:not\(\[data-bp-theme\]\)/g)].length

      expect(declared).toBeGreaterThan(0)
      expect(mirrored).toBeGreaterThanOrEqual(declared)
    })

    it(`emits balanced CSS for ${name}`, () => {
      const mirror = darkModeFallbackCSS(css)
      expect((mirror.match(/\{/g) ?? []).length).toBe((mirror.match(/\}/g) ?? []).length)
    })
  }

  it('leaves a sheet with no dark rules alone', () => {
    expect(darkModeFallbackCSS('.a { color: red }')).toBe('')
  })

  it('does not mistake a class that merely starts with dark', () => {
    expect(darkModeFallbackCSS('.dark-toggle { color: red }')).toBe('')
    expect(darkModeFallbackCSS('.darkroom .x { color: red }')).toBe('')
  })

  it('drops the theme-independent half of a shared selector', () => {
    // `.a, .dark .b { }` mirrored whole would restyle `.a` for everyone.
    const mirror = darkModeFallbackCSS('.a,\n.dark .b { color: red }')
    expect(mirror).toContain('.b')
    expect(mirror).not.toMatch(/\)\s*\.a|,\s*\.a\s*\{/)
  })

  it('is not confused by a brace inside a comment or a string', () => {
    const mirror = darkModeFallbackCSS(`/* } */\n.dark { color: red }\n.x { content: '}' }\n.dark .y { color: blue }`)
    expect(mirror).toContain('color: red')
    expect(mirror).toContain('color: blue')
    expect((mirror.match(/\{/g) ?? []).length).toBe((mirror.match(/\}/g) ?? []).length)
  })
})

describe('the stylesheets ask only for colours that exist', () => {
  /**
   * An undeclared `var(--x)` with no fallback is not an error anywhere: the
   * declaration is invalid at computed-value time and the property falls back
   * to its initial value, so `background: var(--nothing)` renders transparent
   * and `border-color: var(--nothing)` renders as the text colour. Nothing is
   * logged, the page is valid, and the control is invisible. This is the check
   * that would have caught it.
   */
  const root = join(import.meta.dir, '..', 'packages')

  function walk(dir: string, out: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
      if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue
      const path = join(dir, entry)
      if (statSync(path).isDirectory()) walk(path, out)
      else if (/\.(?:ts|css|stx|html)$/.test(entry)) out.push(path)
    }
    return out
  }

  const files = walk(root)

  it('finds the stylesheets to check', () => {
    expect(files.length).toBeGreaterThan(20)
  })

  it('declares every custom property it reads without a fallback', () => {
    const declared = new Set<string>()
    for (const file of files) {
      for (const line of readFileSync(file, 'utf8').split('\n')) {
        for (const [, name] of line.matchAll(/(?:^|[;{\s'"`])(--[a-z0-9][a-z0-9-]*)\s*:/gi))
          declared.add(name)
      }
    }

    const missing: string[] = []
    for (const file of files) {
      readFileSync(file, 'utf8').split('\n').forEach((line, index) => {
        for (const [, name, next] of line.matchAll(/var\(\s*(--[a-z0-9-]+)\s*([,)])/gi)) {
          if (next === ')' && !declared.has(name))
            missing.push(`${file.slice(root.length + 1)}:${index + 1} reads ${name}`)
        }
      })
    }

    expect(missing).toEqual([])
  })
})
