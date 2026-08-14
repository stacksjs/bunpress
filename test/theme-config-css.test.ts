import type { BunPressConfig } from '../packages/bunpress/src/types'
import { describe, expect, it } from 'bun:test'
import { defaultConfig } from '../packages/bunpress/src/config'
import { wrapInLayout } from '../packages/bunpress/src/serve'

/**
 * `themeConfig` is accepted in two places: at the top level, where it is
 * documented, and under `markdown`, which is where the config shipped with
 * Stacks puts it. Both have to reach the stylesheet, or setting a brand colour
 * is a silent no-op in whichever half of the ecosystem picked the other one.
 */
function render(config: BunPressConfig): Promise<string> {
  return wrapInLayout('<h1>Page</h1>', config, '/page', 'doc', {})
}

const BASE = { ...defaultConfig, title: 'Themed' } as BunPressConfig

describe('themeConfig to CSS', () => {
  it('emits the brand colour from a top-level themeConfig', async () => {
    const html = await render({ ...BASE, themeConfig: { colors: { primary: '#c7511b' } } } as BunPressConfig)

    expect(html).toContain('--bp-c-brand-1: #c7511b;')
  })

  it('emits it from markdown.themeConfig too', async () => {
    const html = await render({
      ...BASE,
      markdown: { ...BASE.markdown, themeConfig: { colors: { primary: '#c7511b' } } },
    } as BunPressConfig)

    expect(html).toContain('--bp-c-brand-1: #c7511b;')
  })

  it('lets the top-level form win when both are set', async () => {
    const html = await render({
      ...BASE,
      themeConfig: { colors: { primary: '#c7511b' } },
      markdown: { ...BASE.markdown, themeConfig: { colors: { primary: '#0000ff' } } },
    } as BunPressConfig)

    expect(html).toContain('--bp-c-brand-1: #c7511b;')
    expect(html).not.toContain('--bp-c-brand-1: #0000ff;')
  })

  it('carries cssVars and raw css through, and accepts a bare variable name', async () => {
    const html = await render({
      ...BASE,
      themeConfig: {
        cssVars: { '--bp-c-border': '#d5ddc9', 'bp-c-gutter': '#e4e9db' },
        css: '.bp-doc img { border-radius: 10px; }',
      },
    } as BunPressConfig)

    expect(html).toContain('--bp-c-border: #d5ddc9;')
    expect(html).toContain('--bp-c-gutter: #e4e9db;')
    expect(html).toContain('.bp-doc img { border-radius: 10px; }')
  })

  it('writes nothing when no theme is configured', async () => {
    const html = await render(BASE)

    expect(html).not.toContain('--bp-c-brand-1: #')
  })

  it('renders one branded active-tab treatment', async () => {
    const html = await render(BASE)

    expect(html.match(/\.code-group-tab\.active\s*\{/g)).toHaveLength(1)
    expect(html).toContain('--bp-code-tab-active-text-color: var(--bp-c-brand-1);')
    expect(html).not.toContain('border-bottom-color: #3451b2;')
  })
})
