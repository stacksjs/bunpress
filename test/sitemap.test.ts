import { afterEach, describe, expect, test } from 'bun:test'
import { mkdir, mkdtemp, rm, utimes } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { buildSitemap, generateSitemap } from '../packages/bunpress/src/sitemap'
import type { BunPressConfig, SitemapConfig } from '../packages/bunpress/src/types'

const temporaryDirectories: string[] = []

async function temporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'bunpress-sitemap-'))
  temporaryDirectories.push(directory)
  return directory
}

function config(sitemap: SitemapConfig): BunPressConfig {
  return { verbose: false, markdown: {}, sitemap }
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map(directory => rm(directory, { recursive: true, force: true })))
})

describe('deterministic sitemaps', () => {
  test('does not derive output from checkout mtimes', async () => {
    const docs = await temporaryDirectory()
    const page = join(docs, 'guide.md')
    await Bun.write(page, '# Guide\n')

    await utimes(page, new Date('2020-01-01'), new Date('2020-01-01'))
    const first = await buildSitemap(docs, config({ baseUrl: 'https://example.com' }))
    await utimes(page, new Date('2030-01-01'), new Date('2030-01-01'))
    const second = await buildSitemap(docs, config({ baseUrl: 'https://example.com' }))

    expect(second).toBe(first)
    expect(second).not.toContain('<lastmod>')
  })

  test('sorts entries and preserves explicit transformed dates', async () => {
    const docs = await temporaryDirectory()
    await mkdir(join(docs, 'z'), { recursive: true })
    await Bun.write(join(docs, 'z', 'page.md'), '# Z\n')
    await Bun.write(join(docs, 'a.md'), '# A\n')

    const xml = await buildSitemap(docs, config({
        baseUrl: 'https://example.com',
        transform: entry => ({ ...entry, lastmod: '2026-08-02T12:00:00Z' }),
    }))

    expect(xml.indexOf('<loc>https://example.com/a</loc>')).toBeLessThan(xml.indexOf('<loc>https://example.com/z/page</loc>'))
    expect(xml).toContain('<lastmod>2026-08-02</lastmod>')
  })

  test('does not put the build clock into sitemap indexes', async () => {
    const docs = await temporaryDirectory()
    const output = await temporaryDirectory()
    await Bun.write(join(docs, 'a.md'), '# A\n')
    await Bun.write(join(docs, 'b.md'), '# B\n')

    await generateSitemap(docs, output, config({
        baseUrl: 'https://example.com',
        filename: 'sitemap.xml',
        maxUrlsPerFile: 1,
        useSitemapIndex: true,
    }))

    const index = await Bun.file(join(output, 'sitemap.xml')).text()
    expect(index).not.toContain('<lastmod>')
    expect(index).toContain('<loc>https://example.com/sitemap-1.xml</loc>')
    expect(index).toContain('<loc>https://example.com/sitemap-2.xml</loc>')
  })
})
