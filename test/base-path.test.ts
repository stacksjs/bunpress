import { describe, expect, it } from 'bun:test'
import {
  getConfiguredBasePath,
  startServer,
  stripConfiguredBasePath,
  wrapInLayout,
} from '../packages/bunpress/src/serve'

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
          logo: '/images/logo.svg',
          footer: { message: 'Released under MIT.' },
          socialLinks: [{ icon: 'github', link: 'https://github.com/stacksjs/bunpress' }],
          nav: [{ text: 'Guide', link: '/guide/get-started' }],
          sidebar: {
            '/': [{ text: 'Guide', collapsed: true, items: [{ text: 'Intro', link: '/guide/intro' }] }],
          },
        },
      },
      '/guide/get-started',
    )

    expect(html).toContain('href="/docs/guide/get-started"')
    expect(html).toContain('href="/docs/guide/intro"')
    expect(html).toContain('class="BPSidebarItem sidebar-section collapsed"')
    expect(html).toContain('src="/docs/images/logo.svg"')
    expect(html).toContain('action="/docs/search"')
    expect(html).toContain('href="https://stacksjs.com/docs/guide/get-started"')
  })

  it('reads basePath from config.basePath', () => {
    expect(getConfiguredBasePath({ verbose: false, markdown: {}, basePath: '/docs' })).toBe('/docs')
  })

  it('strips configured base path from request paths', () => {
    const cfg = { verbose: false, markdown: {}, basePath: '/docs' }
    expect(stripConfiguredBasePath(cfg, '/docs/guide/intro')).toBe('/guide/intro')
    expect(stripConfiguredBasePath(cfg, '/docs')).toBe('/')
    expect(stripConfiguredBasePath(cfg, '/guide/intro')).toBe('/guide/intro')
  })

  it('serves markdown under a mounted base path', async () => {
    const root = `${import.meta.dir}/fixtures/base-path-docs`
    const { server, stop } = await startServer({
      port: 0,
      root,
      quiet: true,
      config: {
        verbose: false,
        markdown: { title: 'Mounted' },
        basePath: '/docs',
      },
    })

    try {
      const port = server.port
      const index = await fetch(`http://127.0.0.1:${port}/docs`)
      expect(index.status).toBe(200)
      expect(await index.text()).toContain('Mounted page')

      const nested = await fetch(`http://127.0.0.1:${port}/docs/page`)
      expect(nested.status).toBe(200)
      expect(await nested.text()).toContain('Nested page')
    }
    finally {
      stop()
    }
  })
})
