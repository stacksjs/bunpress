import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { BunPressConfig, SearchConfig } from '../packages/bunpress/src/types'
import { buildSearchIndex, buildSearchRuntimeConfig } from '../packages/bunpress/src/search-index'
import { markdownToHtml } from '../packages/bunpress/src/serve'

/** Minimal config carrying just a search block. */
function withSearch(search: SearchConfig): BunPressConfig {
  return { verbose: false, search } as BunPressConfig
}

const FIXTURE_DIR = join(import.meta.dir, 'fixtures-search-index')

async function write(relativePath: string, contents: string): Promise<void> {
  const full = join(FIXTURE_DIR, relativePath)
  await mkdir(join(full, '..'), { recursive: true })
  await writeFile(full, contents)
}

describe('search index', () => {
  beforeAll(async () => {
    await rm(FIXTURE_DIR, { recursive: true, force: true })
    await mkdir(FIXTURE_DIR, { recursive: true })

    await write('guide.md', `# Guide Page

Lead paragraph about the guide.

## First Section

Prose under the first section.

## Second Section

Prose under the second section.
`)

    await write('code.md', `# Code Page

Intro prose.

## Fenced

\`\`\`ts
const secretToken = 'should-not-be-indexed'
\`\`\`

Prose after the fence.
`)

    // A four-backtick fence wrapping three-backtick fences: naive pairing
    // desyncs here and leaks every later code block into the index.
    await write('nested-fences.md', `# Nested Fences

Before the outer fence.

\`\`\`\`markdown
\`\`\`bash
npm install leaked-package
\`\`\`
\`\`\`\`

After the outer fence.
`)

    await write('shell.md', `# Shell Page

Intro.

\`\`\`bash
# This Is Not A Heading
echo hi
\`\`\`

Tail prose.
`)

    await write('landing.md', `---
layout: home
---

# Landing

Hero copy that should not be indexed.
`)

    await write('nested/deep.md', '# Deep Page\n\nDeep prose.\n')
    await write('section/index.md', '# Section Home\n\nSection prose.\n')
    await write('anchored.md', '# Anchored\n\n## Custom Heading {#my-anchor}\n\nAnchored prose.\n')
    await write('heading-ids.md', `# Version 0.1 domains

## Version 0.1 domains

## Engine: \`src/builtins.zig\`

## AgentGroup (replaces \`g_agent\`)

## [Linked heading](https://example.com)

## Repeated

## Repeated

## Named {#repeated}

## Same text {#first-id}

## Same text {#second-id}

## 1. Numbered heading
`)
    await write('public/ignored.md', '# Ignored\n\nShould not be indexed.\n')
  })

  afterAll(async () => {
    await rm(FIXTURE_DIR, { recursive: true, force: true })
  })

  it('creates one record per section, anchored to its heading', async () => {
    const index = await buildSearchIndex(FIXTURE_DIR)
    const guide = index.filter(record => record.page === 'Guide Page')

    expect(guide.map(record => record.url)).toEqual([
      '/guide',
      '/guide#first-section',
      '/guide#second-section',
    ])
    expect(guide[0].title).toBe('Guide Page')
    expect(guide[1].text).toContain('first section')
  })

  it('excludes fenced code from the indexed text', async () => {
    const index = await buildSearchIndex(FIXTURE_DIR)
    const fenced = index.find(record => record.url === '/code#fenced')

    expect(fenced).toBeDefined()
    expect(fenced!.text).toContain('Prose after the fence')
    expect(fenced!.text).not.toContain('secretToken')
  })

  it('tracks fence length so nested fences do not leak code', async () => {
    const index = await buildSearchIndex(FIXTURE_DIR)
    const record = index.find(record => record.page === 'Nested Fences')

    expect(record).toBeDefined()
    expect(record!.text).toContain('Before the outer fence')
    expect(record!.text).toContain('After the outer fence')
    expect(record!.text).not.toContain('leaked-package')
  })

  it('does not treat a comment inside a fence as a heading', async () => {
    const index = await buildSearchIndex(FIXTURE_DIR)
    const shell = index.filter(record => record.page === 'Shell Page')

    expect(shell).toHaveLength(1)
    expect(shell[0].url).toBe('/shell')
    expect(shell[0].text).toContain('Tail prose')
  })

  it('skips home-layout landing pages', async () => {
    const index = await buildSearchIndex(FIXTURE_DIR)

    expect(index.some(record => record.page === 'Landing')).toBe(false)
  })

  it('skips the public directory', async () => {
    const index = await buildSearchIndex(FIXTURE_DIR)

    expect(index.some(record => record.url.startsWith('/public'))).toBe(false)
  })

  it('maps index.md to its directory url', async () => {
    const index = await buildSearchIndex(FIXTURE_DIR)

    expect(index.some(record => record.url === '/section')).toBe(true)
    expect(index.some(record => record.url === '/nested/deep')).toBe(true)
  })

  it('honours custom heading anchors', async () => {
    const index = await buildSearchIndex(FIXTURE_DIR)
    const record = index.find(r => r.title === 'Custom Heading')

    expect(record).toBeDefined()
    expect(record!.url).toBe('/anchored#my-anchor')
  })

  it('uses the renderer heading ids for punctuation, markup, and collisions', async () => {
    const index = await buildSearchIndex(FIXTURE_DIR)
    const urls = index
      .filter(record => record.page === 'Version 0.1 domains')
      .map(record => record.url)

    expect(urls).toEqual([
      '/heading-ids#version-0-1-domains-1',
      '/heading-ids#engine-src-builtins-zig',
      '/heading-ids#agentgroup-replaces-g-agent',
      '/heading-ids#linked-heading',
      '/heading-ids#repeated',
      '/heading-ids#repeated-1',
      '/heading-ids#repeated-2',
      '/heading-ids#first-id',
      '/heading-ids#second-id',
      '/heading-ids#1-numbered-heading',
    ])

    const source = await Bun.file(join(FIXTURE_DIR, 'heading-ids.md')).text()
    const { html } = await markdownToHtml(source, FIXTURE_DIR)
    const renderedIds = [...html.matchAll(/<h[1-6] id="([^"]+)"/g)].map(match => match[1])

    expect(urls.map(url => url.split('#')[1])).toEqual(renderedIds.slice(1))
  })
})

describe('search options', () => {
  const OPTIONS_DIR = join(import.meta.dir, 'fixtures-search-options')

  beforeAll(async () => {
    await rm(OPTIONS_DIR, { recursive: true, force: true })
    await mkdir(OPTIONS_DIR, { recursive: true })
    await mkdir(join(OPTIONS_DIR, 'draft'), { recursive: true })

    await writeFile(join(OPTIONS_DIR, 'kept.md'), '# Kept\n\nProse that is long enough to be truncated by a small limit.\n')
    await writeFile(join(OPTIONS_DIR, 'draft', 'wip.md'), '# Draft\n\nDraft prose.\n')
    await writeFile(
      join(OPTIONS_DIR, 'keyworded.md'),
      '---\nsearch:\n  keywords:\n    - alternative name\n  title: Override Title\n---\n\n# Real Title\n\nBody.\n',
    )
    await writeFile(join(OPTIONS_DIR, 'hidden.md'), '---\nsearch: false\n---\n\n# Hidden\n\nSecret.\n')
  })

  afterAll(async () => {
    await rm(OPTIONS_DIR, { recursive: true, force: true })
  })

  it('honours exclude patterns', async () => {
    const index = await buildSearchIndex(OPTIONS_DIR, withSearch({ options: { exclude: ['draft/**'] } }))

    expect(index.some(record => record.page === 'Kept')).toBe(true)
    expect(index.some(record => record.page === 'Draft')).toBe(false)
  })

  it('honours include patterns', async () => {
    const index = await buildSearchIndex(OPTIONS_DIR, withSearch({ options: { include: ['draft/**/*.md'] } }))

    expect(index.every(record => record.page === 'Draft')).toBe(true)
  })

  it('truncates section text to maxContentLength', async () => {
    const index = await buildSearchIndex(OPTIONS_DIR, withSearch({ options: { maxContentLength: 10 } }))
    const kept = index.find(record => record.page === 'Kept')

    expect(kept!.text.length).toBeLessThanOrEqual(10)
  })

  it('keeps frontmatter keywords and honours a title override', async () => {
    const index = await buildSearchIndex(OPTIONS_DIR)
    const record = index.find(r => r.url === '/keyworded')

    expect(record!.title).toBe('Override Title')
    expect(record!.keywords).toEqual(['alternative name'])
  })

  it('drops pages marked search: false', async () => {
    const index = await buildSearchIndex(OPTIONS_DIR)

    expect(index.some(record => record.url === '/hidden')).toBe(false)
  })

  it('limits stored fields when storeFields is set', async () => {
    const index = await buildSearchIndex(OPTIONS_DIR, withSearch({ options: { storeFields: ['title'], searchFields: ['title'] } }))

    expect(index.length).toBeGreaterThan(0)
    for (const record of index) {
      expect(record.url).toBeDefined()
      expect(record.title).toBeDefined()
      // `text` is neither stored nor searched, so it must not bloat the index.
      expect(record.text).toBeUndefined()
    }
  })
})

describe('search runtime config', () => {
  it('applies documented defaults', () => {
    const runtime = buildSearchRuntimeConfig(undefined, '/search-index.json')

    expect(runtime.maxResults).toBe(10)
    expect(runtime.minQueryLength).toBe(1)
    expect(runtime.boost).toEqual({ title: 10, headings: 5, content: 1 })
    expect(runtime.lazy).toBe(true)
    expect(runtime.result.highlightMatches).toBe(true)
    expect(runtime.shortcuts.keys.map(k => k.key)).toContain('k')
    expect(runtime.shortcuts.keys.map(k => k.key)).toContain('/')
  })

  it('parses a single-key shortcut', () => {
    const runtime = buildSearchRuntimeConfig(withSearch({ shortcut: '/' }), '/i.json')

    expect(runtime.shortcuts.keys).toEqual([{ key: '/', meta: false, ctrl: false, alt: false, shift: false }])
  })

  it('parses a chord shortcut', () => {
    const runtime = buildSearchRuntimeConfig(withSearch({ shortcut: ['ctrl', 'k'] }), '/i.json')

    expect(runtime.shortcuts.keys).toEqual([{ key: 'k', meta: false, ctrl: true, alt: false, shift: false }])
  })

  it('lets the top-level maxResults stand in for the nested one', () => {
    const runtime = buildSearchRuntimeConfig(withSearch({ maxResults: 3 }), '/i.json')

    expect(runtime.maxResults).toBe(3)
    expect(buildSearchRuntimeConfig(withSearch({ maxResults: 3, options: { maxResults: 7 } }), '/i.json').maxResults).toBe(7)
  })

  it('serializes config functions for the browser', () => {
    const runtime = buildSearchRuntimeConfig(withSearch({
      options: { tokenize: (text: string) => text.split(' ') },
      onSearch: () => {},
    }), '/i.json')

    expect(runtime.tokenizeSource).toContain('split')
    expect(runtime.onSearchSource).not.toBeNull()
  })

  it('carries result and matching options through', () => {
    const runtime = buildSearchRuntimeConfig(withSearch({
      options: { fuzzy: true, fuzziness: 2, stemmer: 'english', minQueryLength: 2, boost: { title: 3 } },
      resultOptions: { showDescription: false, descriptionLength: 40, showPath: false },
    }), '/i.json')

    expect(runtime.fuzzy).toBe(true)
    expect(runtime.fuzziness).toBe(2)
    expect(runtime.stemmer).toBe('english')
    expect(runtime.minQueryLength).toBe(2)
    expect(runtime.boost.title).toBe(3)
    expect(runtime.boost.headings).toBe(5)
    expect(runtime.result.showDescription).toBe(false)
    expect(runtime.result.descriptionLength).toBe(40)
    expect(runtime.result.showPath).toBe(false)
  })
})
