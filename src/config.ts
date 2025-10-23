import type { BunPressConfig, BunPressOptions } from './types'
import { loadConfig } from 'bunfig'

// Default configuration
export const defaultConfig: BunPressConfig = {
  // Navigation configuration
  nav: [
    {
      text: 'Guide',
      link: '/install',
    },
    {
      text: 'API',
      link: '/usage',
    },
    {
      text: 'Examples',
      link: '/examples',
    },
  ],

  // Plugin configuration
  plugins: [],

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
            { text: 'Configuration', link: '/config' },
          ],
        },
        {
          text: 'Features',
          items: [
            { text: 'Markdown Extensions', link: '/markdown-extensions' },
            { text: 'Table of Contents', link: '/table-of-contents' },
          ],
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
            { text: 'API Reference', link: '/advanced#api-reference' },
          ],
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
            { text: 'Community Engagement', link: '/best-practices#community-engagement' },
          ],
        },
        {
          text: 'More',
          items: [
            { text: 'Showcase', link: '/showcase' },
            { text: 'Partners', link: '/partners' },
            { text: 'License', link: '/license' },
            { text: 'Postcardware', link: '/postcardware' },
          ],
        },
      ],
    },
    css: `
    /* Custom Container Blocks */
    .custom-block {
      padding: 16px;
      border-left: 4px solid;
      border-radius: 8px;
      margin: 16px 0;
    }

    .custom-block-title {
      font-weight: 600;
      margin: 0 0 8px 0;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .custom-block-content {
      font-size: 14px;
      line-height: 1.7;
    }

    .custom-block-content p {
      margin: 8px 0;
    }

    .custom-block-content p:first-child {
      margin-top: 0;
    }

    .custom-block-content p:last-child {
      margin-bottom: 0;
    }

    /* Info Block - Blue Theme */
    .custom-block.info {
      background-color: #f0f9ff;
      border-left-color: #3b82f6;
    }

    .custom-block.info .custom-block-title {
      color: #1e40af;
    }

    .custom-block.info .custom-block-content {
      color: #1e3a8a;
    }

    /* Tip Block - Green Theme */
    .custom-block.tip {
      background-color: #f0fdf4;
      border-left-color: #22c55e;
    }

    .custom-block.tip .custom-block-title {
      color: #15803d;
    }

    .custom-block.tip .custom-block-content {
      color: #14532d;
    }

    /* Warning Block - Yellow/Orange Theme */
    .custom-block.warning {
      background-color: #fffbeb;
      border-left-color: #f59e0b;
    }

    .custom-block.warning .custom-block-title {
      color: #b45309;
    }

    .custom-block.warning .custom-block-content {
      color: #78350f;
    }

    /* Danger Block - Red Theme */
    .custom-block.danger {
      background-color: #fef2f2;
      border-left-color: #ef4444;
    }

    .custom-block.danger .custom-block-title {
      color: #b91c1c;
    }

    .custom-block.danger .custom-block-content {
      color: #7f1d1d;
    }

    /* Details Block - Collapsible */
    details.custom-block.details {
      background-color: #f9fafb;
      border-left-color: #6b7280;
      cursor: pointer;
    }

    details.custom-block.details summary {
      font-weight: 600;
      font-size: 14px;
      color: #374151;
      cursor: pointer;
      user-select: none;
      padding: 4px 0;
    }

    details.custom-block.details summary:hover {
      color: #1f2937;
    }

    details.custom-block.details[open] summary {
      margin-bottom: 8px;
    }

    details.custom-block.details .custom-block-content {
      color: #4b5563;
    }

    /* Raw Container - No styling */
    .vp-raw {
      margin: 16px 0;
    }

    /* Inline code inside containers */
    .custom-block code {
      background-color: rgba(0, 0, 0, 0.05);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 13px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }

    /* Links inside containers */
    .custom-block a {
      color: inherit;
      text-decoration: underline;
      font-weight: 500;
    }

    .custom-block a:hover {
      opacity: 0.8;
    }
    `,
    scripts: [],
    preserveDirectoryStructure: true,
  },

  verbose: true,

  // Sitemap configuration
  sitemap: {
    enabled: true,
    filename: 'sitemap.xml',
    defaultPriority: 0.5,
    defaultChangefreq: 'monthly',
    maxUrlsPerFile: 50000,
    useSitemapIndex: false,
  },

  // Robots.txt configuration
  robots: {
    enabled: true,
    filename: 'robots.txt',
  },
}

// Load and export the resolved configuration
// eslint-disable-next-line antfu/no-top-level-await
export const config: BunPressOptions = await loadConfig({
  name: 'bunpress',
  defaultConfig,
})

// Note: defaultConfig is already exported above on line 7

// Backward compatibility - simple config getter
export async function getConfig(): Promise<BunPressOptions> {
  return config
}
