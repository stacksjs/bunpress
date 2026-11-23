import { describe, expect, it } from 'bun:test'
import { minifyCss } from '../packages/bunpress/src/minify-css'

/**
 * The theme is inlined into every page. This pins that minifying it only
 * removes what a browser never reads, and keeps every space CSS gives a
 * meaning to.
 */
describe('minifyCss', () => {
  it('drops comments, indentation and the last terminator of a block', () => {
    expect(minifyCss('/* note */\n.a {\n  color: red;\n  margin: 0 auto;\n}\n')).toBe('.a{color:red;margin:0 auto}')
  })

  it('keeps the space that separates a descendant from a pseudo-class', () => {
    expect(minifyCss('.a :hover { top: 0 }')).toBe('.a :hover{top:0}')
    expect(minifyCss('.a:hover { top: 0 }')).toBe('.a:hover{top:0}')
  })

  it('keeps the spaces inside calc() and between values', () => {
    expect(minifyCss('.a { width: calc(100% - 48px); font: 600 12px / 1.5 serif; }')).toBe('.a{width:calc(100% - 48px);font:600 12px / 1.5 serif}')
    expect(minifyCss('.a { transition: color 0.2s ease, transform 0.2s ease; color: red !important; }')).toBe('.a{transition:color 0.2s ease,transform 0.2s ease;color:red !important}')
  })

  it('keeps combinators and media query operators readable to the parser', () => {
    expect(minifyCss('.a > .b + .c ~ .d { top: 0 }')).toBe('.a > .b + .c ~ .d{top:0}')
    expect(minifyCss('@media (min-width: 960px) and (max-width: 1200px) {\n  .a { top: 0 }\n}')).toBe('@media (min-width:960px) and (max-width:1200px){.a{top:0}}')
  })

  it('copies strings through untouched, comment markers and all', () => {
    expect(minifyCss('.a::before { content: "/* not a comment */  ;}  "; }')).toBe('.a::before{content:"/* not a comment */  ;}  "}')
    expect(minifyCss('.a { grid-template-areas: "head head" "side main"; }')).toBe('.a{grid-template-areas:"head head" "side main"}')
    expect(minifyCss('[data-x="a  b"] { quotes: \'\\\'\' "\\""; }')).toBe('[data-x="a  b"]{quotes:\'\\\'\' "\\""}')
  })

  it('copies urls through untouched, quoted or not', () => {
    const data = 'url(data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\'><!-- /* --></svg>)'
    expect(minifyCss(`.a { background: ${data} no-repeat; }`)).toBe(`.a{background:${data} no-repeat}`)
    expect(minifyCss('.a { mask: url("a b.svg") center / contain; }')).toBe('.a{mask:url("a b.svg") center / contain}')
  })

  it('leaves a unicode-range alone', () => {
    expect(minifyCss('@font-face { unicode-range: U+0000-00FF, U+0131; }')).toBe('@font-face{unicode-range:U+0000-00FF,U+0131}')
  })

  it('treats a comment as a separator, not as nothing', () => {
    expect(minifyCss('.a{margin:0/**/auto}')).toBe('.a{margin:0 auto}')
  })

  it('survives an unterminated comment or string without throwing', () => {
    expect(minifyCss('.a { top: 0 } /* never closed')).toBe('.a{top:0}')
    expect(() => minifyCss('.a { content: "never closed }')).not.toThrow()
  })

  it('is stable: minifying its own output changes nothing', () => {
    const once = minifyCss('.a > .b { width: calc(1px + 2px); content: " x "; } /* c */ @media (min-width: 1px) { .c { top: 0; } }')
    expect(minifyCss(once)).toBe(once)
  })
})
