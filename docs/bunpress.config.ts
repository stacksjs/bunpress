import type { BunPressOptions } from '../src/types'

const config: BunPressOptions = {
  verbose: false,
  docsDir: './docs',
  outDir: './dist',

  markdown: {
    title: 'BunPress Documentation',
    meta: {
      description: 'Lightning-fast documentation engine powered by Bun',
    },

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Features', link: '/features' },
      { text: 'CLI', link: '/guide/cli' },
      {
        text: 'Ecosystem',
        items: [
          { text: 'STX Templating', link: 'https://stx.sh' },
          { text: 'Headwind CSS', link: 'https://headwind.sh' },
          { text: 'Clarity Logging', link: 'https://clarity.sh' },
          { text: 'Pantry', link: 'https://pantry.sh' },
        ],
      },
      { text: 'GitHub', link: 'https://github.com/stacksjs/bunpress' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Configuration', link: '/guide/configuration' },
          ],
        },
        {
          text: 'Features',
          items: [
            { text: 'Markdown Features', link: '/guide/markdown-features' },
            { text: 'Table of Contents', link: '/guide/toc' },
            { text: 'SEO', link: '/guide/seo' },
          ],
        },
        {
          text: 'Reference',
          items: [
            { text: 'CLI Commands', link: '/guide/cli' },
          ],
        },
      ],
      '/features/': [
        {
          text: 'Features',
          items: [
            { text: 'Syntax Highlighting', link: '/features/syntax-highlighting' },
            { text: 'Code Groups', link: '/features/code-groups' },
            { text: 'Custom Containers', link: '/features/containers' },
            { text: 'Search', link: '/features/search' },
          ],
        },
      ],
      '/advanced/': [
        {
          text: 'Advanced',
          items: [
            { text: 'Configuration', link: '/advanced/configuration' },
            { text: 'Theming', link: '/advanced/theming' },
            { text: 'Performance', link: '/advanced/performance' },
            { text: 'CI/CD Integration', link: '/advanced/ci-cd' },
          ],
        },
      ],
    },

    toc: {
      enabled: true,
      position: 'sidebar',
      title: 'On this page',
      minDepth: 2,
      maxDepth: 4,
      smoothScroll: true,
      activeHighlight: true,
    },

    syntaxHighlightTheme: 'github-dark',

    features: {
      containers: true,
      githubAlerts: true,
      codeBlocks: {
        lineHighlighting: true,
        lineNumbers: true,
        focus: true,
        diffs: true,
        errorWarningMarkers: true,
      },
      codeGroups: true,
      emoji: true,
      badges: true,
    },
  },

  sitemap: {
    enabled: true,
    baseUrl: 'https://bunpress.sh',
    priorityMap: {
      '/': 1.0,
      '/guide/*': 0.8,
    },
  },

  robots: {
    enabled: true,
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/draft/'],
      },
    ],
  },

  fathom: {
    enabled: true,
    siteId: 'NXCLHKXQ',
    honorDNT: true,
  },
}

export default config
