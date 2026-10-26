import { describe, expect, test } from 'bun:test'
import { renderUntrustedMarkdown } from '../packages/bunpress/src/untrusted'

describe('user-authored Markdown', () => {
  test('renders documentation, task lists, tables and literal code', () => {
    const html = renderUntrustedMarkdown('# Guide\n\n**Welcome**\n\n- [x] Done\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n```ts\nconst a = "<script>"\n```')
    expect(html).toContain('<h1 id="wiki-guide">Guide</h1>')
    expect(html).toContain('<strong>Welcome</strong>')
    expect(html).toContain('disabled checked')
    expect(html).toContain('<table>')
    expect(html).toContain('&lt;script&gt;')
  })

  test('never executes stx, includes, frontmatter, or raw HTML', () => {
    const html = renderUntrustedMarkdown('---\nlayout: home\n---\n\n{{ globalThis.process.env.SECRET }}\n\n<script server>throw new Error("executed")</script>\n\n<!--@include: /etc/passwd-->\n\n<img src=x onerror=alert(1)>')
    expect(html).toContain('{{ globalThis.process.env.SECRET }}')
    expect(html).toContain('&lt;script server&gt;')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('<img src=x')
  })

  test('rejects executable URLs, including entities and controls', () => {
    for (const url of ['javascript:alert(1)', 'java&#x73;cript:alert(1)', 'data:text/html,bad', 'vbscript:bad']) {
      const html = renderUntrustedMarkdown(`[click](${url})\n\n![picture](${url})`)
      expect(html).not.toContain('href=')
      expect(html).not.toContain('<img')
    }
  })

  test('validates resolved links and keeps nested markup intact', () => {
    expect(renderUntrustedMarkdown('[**Guide**](Guide.md)', { resolveLink: () => '/wiki/guide' })).toContain('<a href="/wiki/guide" rel="nofollow noopener noreferrer"><strong>Guide</strong></a>')
    expect(renderUntrustedMarkdown('[Guide](Guide.md)', { resolveLink: () => 'javascript:bad' })).not.toContain('href=')
  })
})
