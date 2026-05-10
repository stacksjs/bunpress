import { describe, expect, it } from 'bun:test'
import { wrapInLayout } from '../packages/bunpress/src/serve'

describe('mounted base path output', () => {
  it('prefixes root-relative links and assets when sitemap baseUrl has a path', async () => {
    const html = await wrapInLayout(
      '<article><a href="/guide/get-started">Start</a><img src="/images/logo.svg"><form action="/search"></form></article>',
      {
        verbose: false,
        title: 'Docs',
        markdown: {},
        sitemap: {
          enabled: true,
          baseUrl: 'https://stacksjs.com/docs',
        },
        themeConfig: {
          nav: [{ text: 'Guide', link: '/guide/get-started' }],
          sidebar: {
            '/': [{ text: 'Guide', items: [{ text: 'Intro', link: '/guide/intro' }] }],
          },
        },
      },
      '/guide/get-started',
    )

    expect(html).toContain('href="/docs/guide/get-started"')
    expect(html).toContain('href="/docs/guide/intro"')
    expect(html).toContain('src="/docs/images/logo.svg"')
    expect(html).toContain('action="/docs/search"')
    expect(html).toContain('href="https://stacksjs.com/docs/guide/get-started"')
  })
})
