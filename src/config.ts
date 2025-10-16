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
    css: '',
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
