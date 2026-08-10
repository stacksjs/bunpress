import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { buildSearchIndex } from '../packages/bunpress/src/search-index'

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
})
