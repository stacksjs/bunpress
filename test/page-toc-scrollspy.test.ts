import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dir, '..')
const pageToc = readFileSync(join(root, 'packages/bunpress/src/templates/page-toc.stx'), 'utf8')
const pageOutline = readFileSync(join(root, 'packages/bunpress/src/templates/page-outline.stx'), 'utf8')

describe('page outline scrollspy', () => {
  test('tracks both responsive outline variants', () => {
    expect(pageToc).toContain("document.querySelectorAll('.page-toc a, .bp-local-outline-items a')")
    expect(pageOutline).toContain('.bp-local-outline-items a.active')
  })

  test('keeps the active link inside the visible outline viewport', () => {
    expect(pageToc).toContain('function keepActiveLinkVisible(activeLink)')
    expect(pageToc).toContain("activeLink.closest('.BPDocAside') || activeLink.closest('.bp-local-outline-items')")
    expect(pageToc).toContain('outlineViewport.scrollTop += linkRect.top - viewportRect.top - inset')
    expect(pageToc).toContain('outlineViewport.scrollTop += linkRect.bottom - viewportRect.bottom + inset')
    expect(pageToc).toContain('keepActiveLinkVisible(link)')
  })
})
