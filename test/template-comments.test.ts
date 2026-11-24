import { describe, expect, it } from 'bun:test'
import { loadTemplate, stripTemplateComments } from '../packages/bunpress/src/template-loader'

describe('template comments', () => {
  it('strips single and multi-line {{-- --}} comments', () => {
    const source = '<a>{{ x }}</a>\n{{-- one --}}\n{{-- two\n  lines --}}\n<b>{!! y !!}</b>'
    expect(stripTemplateComments(source)).toBe('<a>{{ x }}</a>\n<b>{!! y !!}</b>')
  })

  it('ships no comment text from the bundled sidebar template', async () => {
    const sidebar = await loadTemplate('sidebar')
    expect(sidebar).not.toContain('{{--')
    expect(sidebar).not.toContain('emitted wherever it renders')
  })
})
