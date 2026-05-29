import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { clearDataCache, loadDataFiles } from '../../../packages/bunpress/src/data-loader'
import { markdownToHtml } from '../../../packages/bunpress/src/serve'
import { clearComponentCache, resolveStxComponents } from '../../../packages/bunpress/src/stx-components'

const ROOT = './test/markdown/stx-ext'

beforeAll(async () => {
  await mkdir(join(ROOT, '.components'), { recursive: true })
  await mkdir(join(ROOT, '.data'), { recursive: true })

  // A self-closing component with string + bound props.
  await writeFile(
    join(ROOT, '.components/Badge.stx'),
    `<span class="badge badge-{{ kind }}">{{ label }}</span>`,
  )
  // A component using a bound prop sourced from global data.
  await writeFile(
    join(ROOT, '.components/ProgressBar.stx'),
    `<div class="bar"><span class="bar-fill" style="width: {{ value }}%"></span><b>{{ value }}%</b></div>`,
  )
  // A component with slot content.
  await writeFile(
    join(ROOT, '.components/Callout.stx'),
    `<div class="callout callout-{{ type }}">{!! slot !!}</div>`,
  )

  await writeFile(
    join(ROOT, '.data/stats.json'),
    JSON.stringify({ pct: 79.1, passing: 19582, total: 24750 }),
  )

  clearComponentCache()
  clearDataCache()
})

afterAll(async () => {
  await rm(ROOT, { recursive: true, force: true })
})

describe('Global data files (.data/*.json)', () => {
  it('loads JSON files keyed by basename', async () => {
    clearDataCache()
    const data = await loadDataFiles(ROOT) as any
    expect(data.stats.pct).toBe(79.1)
    expect(data.stats.passing).toBe(19582)
  })

  it('exposes data in markdown stx expressions', async () => {
    const { html } = await markdownToHtml(`# Score\n\nWe pass {{ data.stats.passing }} tests.`, ROOT)
    expect(html).toContain('We pass 19582 tests.')
  })
})

describe('stx component resolution', () => {
  it('resolves a self-closing component with string props', async () => {
    const out = await resolveStxComponents(
      `<Badge kind="ok" label="Passing" />`,
      join(ROOT, '.components'),
      {},
    )
    expect(out).toContain('class="badge badge-ok"')
    expect(out).toContain('Passing')
  })

  it('evaluates bound props against the page context', async () => {
    const out = await resolveStxComponents(
      `<ProgressBar :value="data.stats.pct" />`,
      join(ROOT, '.components'),
      { data: { stats: { pct: 79.1 } } },
    )
    expect(out).toContain('width: 79.1%')
    expect(out).toContain('79.1%')
  })

  it('passes inner content as a slot', async () => {
    const out = await resolveStxComponents(
      `<Callout type="tip">Be careful</Callout>`,
      join(ROOT, '.components'),
      {},
    )
    expect(out).toContain('class="callout callout-tip"')
    expect(out).toContain('Be careful')
  })

  it('leaves unknown PascalCase tags untouched', async () => {
    const out = await resolveStxComponents(
      `<NotAComponent foo="bar" />`,
      join(ROOT, '.components'),
      {},
    )
    expect(out).toContain('<NotAComponent foo="bar" />')
  })

  it('never touches components inside code fences', async () => {
    const src = '```html\n<Badge kind="ok" label="x" />\n```'
    const out = await resolveStxComponents(src, join(ROOT, '.components'), {})
    expect(out).toContain('<Badge kind="ok" label="x" />')
    expect(out).not.toContain('class="badge')
  })

  it('resolves components and data through the full markdown pipeline', async () => {
    const md = `# Report\n\n<ProgressBar :value="data.stats.pct" />\n\nDone.`
    const { html } = await markdownToHtml(md, ROOT)
    expect(html).toContain('width: 79.1%')
    expect(html).toContain('Done.')
  })
})

describe('Home layout body rendering', () => {
  it('renders hero plus the markdown body below it', async () => {
    const md = `---\nlayout: home\nhero:\n  name: zig-js\n  text: A JS engine\n---\n\n## Status\n\nWe pass {{ data.stats.passing }} tests.\n`
    const { html, frontmatter } = await markdownToHtml(md, ROOT)
    expect(frontmatter.layout).toBe('home')
    // Hero still rendered
    expect(html).toContain('VPHero')
    // Body content rendered below (previously dropped entirely)
    expect(html).toContain('VPHome-content')
    expect(html).toContain('We pass 19582 tests.')
    expect(html).toContain('Status')
  })
})
