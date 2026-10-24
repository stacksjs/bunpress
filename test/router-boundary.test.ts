import { describe, expect, it } from 'bun:test'
import { wrapInLayout } from '../packages/bunpress/src/serve'

describe('documentation router boundary', () => {
  const origin = 'https://example.test'
  async function router(basePath: string): Promise<(path: string) => boolean> {
    const html = await wrapInLayout('<p>Guide</p>', { verbose: false, basePath, title: 'Docs' }, '/guide')
    const body = html.match(/function isInternalNavigable\(u\) \{([\s\S]*?)\n  \}/)?.[1]
    if (!body) throw new Error('Generated router is missing its navigation policy')
    // Exercise the predicate shipped to browsers, including its escaped regexp.
    const navigable = new Function('basePath', 'location', 'u', body)
    return path => navigable(basePath, { origin }, new URL(path, origin))
  }

  it('keeps pages and hashes in the mount, while leaving other apps to the browser', async () => {
    const navigable = await router('/docs')
    for (const path of ['/docs', '/docs/', '/docs/guide', '/docs/guide#details']) expect(navigable(path)).toBe(true)
    for (const path of ['/', '/pricing', '/docs-other', '/docs/guide.pdf', 'https://other.test/docs']) expect(navigable(path)).toBe(false)
  })

  it('retains same-origin navigation for a site deployed at its domain root', async () => {
    const navigable = await router('')
    expect(navigable('/')).toBe(true)
    expect(navigable('/guide')).toBe(true)
    expect(navigable('/manual.pdf')).toBe(false)
  })
})
