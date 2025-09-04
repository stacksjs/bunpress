import type { BunPressOptions } from './types'
import { loadConfig } from 'bunfig'

export const defaultConfig: BunPressOptions = {
  // Default markdown plugin configuration
  markdown: {
    title: 'BunPress Documentation',
    meta: {
      description: 'Documentation built with BunPress',
      generator: 'BunPress',
      viewport: 'width=device-width, initial-scale=1.0',
    },
    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/' },
            { text: 'Installation', link: '/install' },
            { text: 'Usage', link: '/usage' },
            { text: 'Configuration', link: '/config' }
          ]
        },
        {
          text: 'Features',
          items: [
            { text: 'Markdown Extensions', link: '/markdown-extensions' },
            { text: 'Table of Contents', link: '/table-of-contents' }
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Custom Templates', link: '/advanced#custom-templates' },
            { text: 'Plugin System', link: '/advanced#plugin-system' },
            { text: 'Build Optimization', link: '/advanced#build-optimization' },
            { text: 'Custom CSS & JS', link: '/advanced#custom-css-and-javascript' },
            { text: 'Environment Variables', link: '/advanced#environment-variables' },
            { text: 'Custom Marked Extensions', link: '/advanced#custom-marked-extensions' },
            { text: 'Build Hooks', link: '/advanced#build-hooks' },
            { text: 'Custom File Processing', link: '/advanced#custom-file-processing' },
            { text: 'Performance Monitoring', link: '/advanced#performance-monitoring' },
            { text: 'Internationalization', link: '/advanced#internationalization-i18n' },
            { text: 'Custom Error Handling', link: '/advanced#custom-error-handling' },
            { text: 'Security Considerations', link: '/advanced#security-considerations' },
            { text: 'Deployment Options', link: '/advanced#deployment-options' },
            { text: 'API Reference', link: '/advanced#api-reference' }
          ]
        },
        {
          text: 'Best Practices & Examples',
          items: [
            { text: 'Project Structure', link: '/best-practices#project-structure' },
            { text: 'Writing Content', link: '/best-practices#writing-content' },
            { text: 'Documentation Patterns', link: '/best-practices#documentation-patterns' },
            { text: 'Advanced Examples', link: '/best-practices#advanced-examples' },
            { text: 'SEO Optimization', link: '/best-practices#seo-optimization' },
            { text: 'Performance Best Practices', link: '/best-practices#performance-best-practices' },
            { text: 'Accessibility', link: '/best-practices#accessibility' },
            { text: 'Internationalization', link: '/best-practices#internationalization' },
            { text: 'Testing Documentation', link: '/best-practices#testing-documentation' },
            { text: 'Deployment Best Practices', link: '/best-practices#deployment-best-practices' },
            { text: 'Maintenance', link: '/best-practices#maintenance' },
            { text: 'Community Engagement', link: '/best-practices#community-engagement' }
          ]
        },
        {
          text: 'More',
          items: [
            { text: 'Showcase', link: '/showcase' },
            { text: 'Partners', link: '/partners' },
            { text: 'License', link: '/license' },
            { text: 'Postcardware', link: '/postcardware' }
          ]
        }
      ]
    },
    css: `
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 100%;
        margin: 0;
        padding: 0;
      }

      .markdown-body {
        padding: 1rem;
        max-width: 800px;
        margin: 0 auto;
      }

      /* Layout specific styles */
      body[data-layout="doc"] .markdown-body {
        padding: 2rem;
      }

      body[data-layout="home"] .markdown-body {
        padding: 0;
        max-width: 100%;
      }

      body[data-layout="home"] .home-content {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
      }

      pre {
        background: #f5f5f5;
        border-radius: 3px;
        padding: 12px;
        overflow: auto;
      }

      code {
        font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
        font-size: 0.9em;
      }

      a {
        color: #1F1FE9;
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }

      img {
        max-width: 100%;
      }

      h1, h2, h3, h4, h5, h6 {
        margin-top: 1.5em;
        margin-bottom: 0.75em;
      }

      h1 {
        border-bottom: 1px solid #eaecef;
        padding-bottom: 0.3em;
      }
    `,
    scripts: [],
    preserveDirectoryStructure: true,
  },

  verbose: true,
}

// eslint-disable-next-line antfu/no-top-level-await
export const config: BunPressOptions = await loadConfig({
  name: 'bunpress',
  defaultConfig,
})
