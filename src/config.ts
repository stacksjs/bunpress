import type { BunPressConfig } from './types'
import { loadConfig } from 'bunfig'

// Default configuration
export const defaultConfig: BunPressConfig = {
  // Directory configuration
  docsDir: './docs',
  outDir: './docs',

  // Theme configuration - defaults to 'vitepress' for VitePress-compatible styling
  theme: 'vitepress',

  // Navigation configuration
  nav: [
    {
      text: 'Guide',
      link: '/install',
    },
    {
      text: 'API',
      link: '/advanced#api-reference',
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
            { text: 'Quick Start', link: '/quick-start' },
            { text: 'Usage', link: '/usage' },
            { text: 'Configuration', link: '/config' },
          ],
        },
        {
          text: 'Core Features',
          items: [
            { text: 'Features Overview', link: '/features' },
            { text: 'Markdown Extensions', link: '/markdown-extensions' },
            { text: 'Syntax Highlighting', link: '/syntax-highlighting' },
            { text: 'Table of Contents', link: '/table-of-contents' },
            { text: 'CLI Commands', link: '/cli' },
          ],
        },
        {
          text: 'SEO & Analytics',
          items: [
            { text: 'SEO Features', link: '/seo' },
            { text: 'Analytics (Fathom)', link: '/config#fathom-analytics' },
          ],
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Advanced Usage', link: '/advanced' },
            { text: 'Examples', link: '/examples' },
            { text: 'Best Practices', link: '/best-practices' },
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
    /* Additional BunPress customizations */
    /* Note: Base styles are provided by the VitePress theme */

    /* Copy button for code blocks */
    .copy-code-button {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 6px 8px;
      background-color: var(--bp-code-copy-code-bg, var(--bp-c-bg-soft, #f6f6f7));
      border: 1px solid var(--bp-code-copy-code-border-color, var(--bp-c-divider, #e2e2e3));
      border-radius: 4px;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s ease, background-color 0.2s ease;
      z-index: 3;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    pre:hover .copy-code-button {
      opacity: 1;
    }

    .copy-code-button:hover {
      background-color: var(--bp-code-copy-code-hover-bg, var(--bp-c-bg, #ffffff));
      border-color: var(--bp-code-copy-code-hover-border-color, var(--bp-c-divider, #e2e2e3));
    }

    .copy-code-button.copied {
      opacity: 1;
      background-color: var(--bp-c-success-soft, rgba(16, 185, 129, 0.14));
      border-color: var(--bp-c-success-1, #18794e);
    }

    .copy-code-button svg {
      width: 16px;
      height: 16px;
      color: var(--bp-c-text-2, #67676c);
    }

    .copy-code-button.copied svg {
      color: var(--bp-c-success-1, #18794e);
    }

    /* Enhanced Tables */
    .table-responsive {
      overflow-x: auto;
      margin: 16px 0;
      border-radius: 8px;
      border: 1px solid var(--bp-c-divider, #e2e2e3);
    }

    .enhanced-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
      background-color: var(--bp-c-bg, #ffffff);
    }

    .enhanced-table thead {
      background-color: var(--bp-c-bg-soft, #f6f6f7);
    }

    .enhanced-table th {
      padding: 12px 16px;
      font-weight: 600;
      color: var(--bp-c-text-2, #67676c);
      border-bottom: 2px solid var(--bp-c-divider, #e2e2e3);
      white-space: nowrap;
    }

    .enhanced-table td {
      padding: 12px 16px;
      color: var(--bp-c-text-1, #3c3c43);
      border-bottom: 1px solid var(--bp-c-divider, #e2e2e3);
    }

    .enhanced-table tbody tr:nth-child(2n) {
      background-color: var(--bp-c-bg-soft, #f6f6f7);
    }

    .enhanced-table tbody tr:hover {
      background-color: var(--bp-c-default-soft, rgba(142, 150, 170, 0.14));
      transition: background-color 0.2s ease;
    }

    /* Image Captions */
    .image-figure {
      margin: 24px 0;
      text-align: center;
    }

    .image-figure img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      border: 1px solid var(--bp-c-divider, #e2e2e3);
    }

    .image-figure figcaption {
      margin-top: 12px;
      font-size: 14px;
      color: var(--bp-c-text-2, #67676c);
      font-style: italic;
      text-align: center;
    }

    /* Regular images (without captions) */
    article img:not(.image-figure img) {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 16px 0;
    }

    /* Raw Container - No styling */
    .bp-raw {
      margin: 16px 0;
    }
    `,
    scripts: [`
function switchCodeTab(groupId, panelIndex) {
  const group = document.getElementById(groupId);
  if (!group) return;

  // Update tabs
  const tabs = group.querySelectorAll('.code-group-tab');
  tabs.forEach((tab, index) => {
    if (index === panelIndex) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Update panels
  const panels = group.querySelectorAll('.code-group-panel');
  panels.forEach((panel, index) => {
    if (index === panelIndex) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });
}

function copyCode(button) {
  const pre = button.closest('pre');
  if (!pre) return;

  const code = pre.querySelector('code');
  if (!code) return;

  // Get text content from code block
  const text = code.textContent || '';

  // Copy to clipboard
  navigator.clipboard.writeText(text).then(() => {
    // Show copied state
    button.classList.add('copied');

    // Change icon to checkmark
    const svg = button.querySelector('svg');
    if (svg) {
      svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>';
    }

    // Reset after 2 seconds
    setTimeout(() => {
      button.classList.remove('copied');
      if (svg) {
        svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>';
      }
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy code:', err);
  });
}

// Add copy buttons to all code blocks when page loads
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const codeBlocks = document.querySelectorAll('pre > code');
    codeBlocks.forEach(code => {
      const pre = code.parentElement;
      if (!pre || pre.querySelector('.copy-code-button')) return;

      const button = document.createElement('button');
      button.className = 'copy-code-button';
      button.setAttribute('onclick', 'copyCode(this)');
      button.setAttribute('aria-label', 'Copy code');
      button.innerHTML = \`<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
      </svg>\`;

      pre.appendChild(button);
    });
  });
}
`],
    preserveDirectoryStructure: true,

    // Markdown features configuration (all enabled by default)
    features: {
      inlineFormatting: true,
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
      codeImports: true,
      inlineToc: true,
      customAnchors: true,
      emoji: true,
      badges: true,
      includes: true,
      externalLinks: {
        autoTarget: true,
        autoRel: true,
        showIcon: true,
      },
      imageLazyLoading: true,
      tables: {
        alignment: true,
        enhancedStyling: true,
        responsive: true,
      },
    },
    syntaxHighlightTheme: 'github-light',
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
export const config: BunPressConfig = await loadConfig({
  name: 'bunpress',
  alias: 'docs',
  defaultConfig,
})

// Backward compatibility - simple config getter
export async function getConfig(): Promise<BunPressConfig> {
  return config
}
