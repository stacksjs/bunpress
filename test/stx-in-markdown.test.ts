import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { markdownToHtml } from '../packages/bunpress/src/serve'

/**
 * BunPress lets authors write stx inside markdown, and renders markdown with
 * `Bun.markdown` rather than a separate parser package. This suite pins that
 * combination down: every stx construct has to work in a `.md` file, and
 * markdown's own features have to keep working alongside it.
 */

const ROOT = join(import.meta.dir, 'fixtures-stx-md')

/** Rendered once — the pipeline is the unit under test, not each assertion. */
let html = ''
/** Same page with code regions removed, for "nothing leaked" assertions. */
let prose = ''

beforeAll(async () => {
  await rm(ROOT, { recursive: true, force: true })
  await mkdir(join(ROOT, '.components'), { recursive: true })
  await mkdir(join(ROOT, '.data'), { recursive: true })

  await writeFile(join(ROOT, '.data', 'stats.json'), JSON.stringify({ stars: 1234, downloads: '2M' }))
  await writeFile(
    join(ROOT, '.components', 'Callout.stx'),
    '<div class="callout callout-{{ type }}"><strong>{{ title }}</strong><p>{{ body }}</p></div>\n',
  )
  await writeFile(join(ROOT, '.components', 'StatCard.stx'), '<span class="stat">{{ label }}: {{ value }}</span>\n')

  const source = `---
title: STX In Markdown
product: BunPress
showPricing: true
tiers:
  - name: Free
    price: 0
  - name: Pro
    price: 20
---

# {{ product }} Features

## Conditionals

@if (showPricing)
Pricing is enabled.
@else
Pricing is hidden.
@endif

## Loops

@foreach (tiers as tier)
- **{{ tier.name }}** costs \${{ tier.price }}
@endforeach

## Global data

We have {{ data.stats.stars }} stars and {{ data.stats.downloads }} downloads.

## Components

<Callout type="tip" title="Heads up" body="Resolved from .components" />

<StatCard label="Stars" value="1234" />

## Server script

<script server>
const computed = [1, 2, 3].reduce((a, b) => a + b, 0)
</script>

Computed total: {{ computed }}

## Markdown alongside

| Feature | Works |
|---------|-------|
| Tables | yes |

\`\`\`ts
// Not a template: {{ notATemplate }} and @if must stay literal
const x: number = 1
\`\`\`

Inline code \`{{ alsoLiteral }}\` stays literal.

> [!NOTE]
> Alerts still render.

::: tip
Containers too:

- one
- two
:::
`

  await writeFile(join(ROOT, 'index.md'), source)
  const rendered = await markdownToHtml(source, ROOT)
  html = rendered.html
  prose = html.replace(/<pre[\s\S]*?<\/pre>/g, '').replace(/<code[\s\S]*?<\/code>/g, '')
})

afterAll(async () => {
  await rm(ROOT, { recursive: true, force: true })
})

describe('stx directives in markdown', () => {
  it('interpolates frontmatter', () => {
    expect(html).toContain('BunPress Features')
  })

  it('takes the true branch of @if and drops @else', () => {
    expect(html).toContain('Pricing is enabled')
    expect(html).not.toContain('Pricing is hidden')
  })

  it('expands @foreach over frontmatter arrays', () => {
    expect(html).toContain('Free')
    expect(html).toContain('$0')
    expect(html).toContain('Pro')
    expect(html).toContain('$20')
  })

  it('exposes .data json files', () => {
    expect(html).toContain('1234 stars')
    expect(html).toContain('2M downloads')
  })

  it('evaluates <script server> and exposes its bindings', () => {
    expect(html).toContain('Computed total: 6')
  })

  it('leaves no unrendered directives behind', () => {
    expect(prose).not.toMatch(/@(?:if|else|endif|foreach|endforeach)\b/)
    expect(prose).not.toMatch(/\{\{\s*[\w.]+\s*\}\}/)
  })
})

describe('stx components in markdown', () => {
  it('resolves a PascalCase component with props', () => {
    expect(html).toContain('callout-tip')
    expect(html).toContain('Heads up')
    expect(html).toContain('Resolved from .components')
  })

  it('resolves more than one component on a page', () => {
    expect(html).toContain('class="stat"')
    expect(html).toContain('Stars: 1234')
  })
})

describe('markdown keeps working alongside stx', () => {
  it('renders tables through the enhanced wrapper', () => {
    expect(html).toContain('table-responsive')
    expect(html).toContain('enhanced-table')
  })

  it('renders GitHub alerts', () => {
    expect(html).toContain('github-alert')
  })

  it('renders containers with real markdown inside', () => {
    expect(html).toContain('custom-block')
    expect(html).toMatch(/<li>\s*(?:<p>)?one/)
    expect(html).toMatch(/<li>\s*(?:<p>)?two/)
  })

  it('closes a container after the list it contains, not inside it', () => {
    // The body is fenced with blank lines so markdown parses it, which puts
    // the closing tags in list context. Indented, they were absorbed into the
    // last <li>, yielding </p></div></li></ul></div>.
    const container = html.slice(html.indexOf('custom-block tip'))
    const closeDiv = container.indexOf('</div>\n</div>')
    const closeList = container.indexOf('</ul>')

    expect(closeList).toBeGreaterThan(-1)
    expect(closeList).toBeLessThan(closeDiv)
  })

  it('highlights fenced code', () => {
    expect(html).toContain('class="token')
  })
})

describe('code is never treated as a template', () => {
  it('leaves stx syntax inside a fence literal', () => {
    // A docs page showing stx examples must render them, not execute them.
    expect(html).toContain('notATemplate')
    expect(html).toContain('@if')
  })

  it('leaves stx syntax inside inline code literal', () => {
    expect(html).toContain('alsoLiteral')
  })
})
