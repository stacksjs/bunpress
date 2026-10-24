import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildSearchIndex } from '../packages/bunpress/src/search-index'
import type { BunPressConfig } from '../packages/bunpress/src/types'

let root: string
beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), 'bunpress-search-base-'))
  await mkdir(join(root, 'docs'))
  await writeFile(join(root, 'index.md'), '# Home\n\nStart here.\n')
  await writeFile(join(root, 'guide.md'), '# Guide\n\nLead.\n\n## Details\n\nDetails.\n')
  await writeFile(join(root, 'docs/repeat.md'), '# Repeat\n\nA real nested docs directory.\n')
})
afterAll(async () => { if (root) await rm(root, { recursive: true, force: true }) })

describe('search result deployment paths', () => {
  const urls = async (config: Partial<BunPressConfig>) => (await buildSearchIndex(root, { verbose: false, ...config } as BunPressConfig)).map(record => record.url)
  it('keeps page, home and anchored results under an explicit base path', async () => {
    expect(await urls({ basePath: '/docs' })).toEqual(['/docs/docs/repeat', '/docs/guide', '/docs/guide#details', '/docs/'])
  })
  it('normalizes a nested deployment path using the renderer contract', async () => {
    expect(await urls({ basePath: ' manual/reference/// ' })).toEqual(['/manual/reference/docs/repeat', '/manual/reference/guide', '/manual/reference/guide#details', '/manual/reference/'])
  })
  it('uses the configured site URL path when no explicit base path exists', async () => {
    expect(await urls({ sitemap: { baseUrl: 'https://example.test/help/docs/' } })).toEqual(['/help/docs/docs/repeat', '/help/docs/guide', '/help/docs/guide#details', '/help/docs/'])
  })
  it('prefixes locale fallback only after translation selection', async () => {
    const index = await buildSearchIndex(root, { verbose: false, basePath: '/docs', i18n: { locales: ['en', 'es'], defaultLocale: 'en' } } as BunPressConfig)
    expect(index.filter(record => record.locale === 'en').map(record => record.url)).toEqual(['/docs/docs/repeat', '/docs/guide', '/docs/guide#details', '/docs/'])
    expect(index.filter(record => record.locale === 'es').map(record => record.url)).toEqual(['/docs/es/docs/repeat', '/docs/es/guide', '/docs/es/guide#details', '/docs/es'])
  })
  it('preserves root deployments and an explicit root override', async () => {
    const expected = ['/docs/repeat', '/guide', '/guide#details', '/']
    expect(await urls({})).toEqual(expected)
    expect(await urls({ basePath: '/', sitemap: { baseUrl: 'https://example.test/help' } })).toEqual(expected)
  })
})
