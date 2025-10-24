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

    /* GitHub-Flavored Alerts */
    .github-alert {
      padding: 16px;
      margin: 16px 0;
      border-left: 4px solid;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .github-alert-title {
      margin: 0;
      font-weight: 600;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .github-alert-icon {
      flex-shrink: 0;
    }

    .github-alert-content {
      font-size: 14px;
      line-height: 1.7;
    }

    .github-alert-content p {
      margin: 8px 0;
    }

    .github-alert-content p:first-child {
      margin-top: 0;
    }

    .github-alert-content p:last-child {
      margin-bottom: 0;
    }

    /* Note Alert - Blue (same as info) */
    .github-alert-note {
      background-color: #dff6ff;
      border-left-color: #0969da;
    }

    .github-alert-note .github-alert-title {
      color: #0969da;
    }

    .github-alert-note .github-alert-icon {
      fill: #0969da;
    }

    .github-alert-note .github-alert-content {
      color: #0a3069;
    }

    /* Tip Alert - Green */
    .github-alert-tip {
      background-color: #dff6dd;
      border-left-color: #1a7f37;
    }

    .github-alert-tip .github-alert-title {
      color: #1a7f37;
    }

    .github-alert-tip .github-alert-icon {
      fill: #1a7f37;
    }

    .github-alert-tip .github-alert-content {
      color: #0f4d24;
    }

    /* Important Alert - Purple */
    .github-alert-important {
      background-color: #f6e8ff;
      border-left-color: #8250df;
    }

    .github-alert-important .github-alert-title {
      color: #8250df;
    }

    .github-alert-important .github-alert-icon {
      fill: #8250df;
    }

    .github-alert-important .github-alert-content {
      color: #442e66;
    }

    /* Warning Alert - Orange/Amber */
    .github-alert-warning {
      background-color: #fff8e5;
      border-left-color: #9a6700;
    }

    .github-alert-warning .github-alert-title {
      color: #9a6700;
    }

    .github-alert-warning .github-alert-icon {
      fill: #9a6700;
    }

    .github-alert-warning .github-alert-content {
      color: #633c01;
    }

    /* Caution Alert - Red */
    .github-alert-caution {
      background-color: #ffebe9;
      border-left-color: #d1242f;
    }

    .github-alert-caution .github-alert-title {
      color: #d1242f;
    }

    .github-alert-caution .github-alert-icon {
      fill: #d1242f;
    }

    .github-alert-caution .github-alert-content {
      color: #6e011a;
    }

    /* Inline elements inside GitHub alerts */
    .github-alert code {
      background-color: rgba(0, 0, 0, 0.05);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 13px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }

    .github-alert a {
      color: inherit;
      text-decoration: underline;
      font-weight: 500;
    }

    .github-alert a:hover {
      opacity: 0.8;
    }

    /* Code Blocks with Advanced Features */
    pre {
      background-color: #f6f8fa;
      border-radius: 6px;
      padding: 16px;
      overflow-x: auto;
      margin: 16px 0;
      border: 1px solid #e1e4e8;
    }

    code {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 14px;
      line-height: 1.6;
    }

    /* Inline code */
    p code, li code, td code, th code {
      background-color: rgba(175, 184, 193, 0.2);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 13px;
    }

    /* Code block lines */
    pre code {
      background: none;
      padding: 0;
      border-radius: 0;
      display: block;
    }

    pre code span {
      display: block;
      padding: 0 4px;
      margin: 0 -16px;
      padding-left: 16px;
      padding-right: 16px;
    }

    /* Highlighted lines in code blocks */
    pre code span.highlighted {
      background-color: rgba(254, 243, 199, 0.5);
      border-left: 3px solid #fbbf24;
      padding-left: 13px; /* 16px - 3px border */
    }

    /* Line numbers in code blocks */
    pre.line-numbers-mode {
      padding-left: 48px;
      position: relative;
    }

    pre.line-numbers-mode code span {
      position: relative;
    }

    pre.line-numbers-mode .line-number {
      position: absolute;
      left: -48px;
      width: 32px;
      text-align: right;
      color: #9ca3af;
      user-select: none;
      font-size: 13px;
      padding-right: 12px;
    }

    pre.line-numbers-mode code span.highlighted .line-number {
      color: #b45309;
      font-weight: 500;
    }

    /* Code focus markers */
    pre code span.focused {
      background-color: rgba(147, 197, 253, 0.15);
      border-left: 3px solid #3b82f6;
      padding-left: 13px; /* 16px - 3px border */
    }

    pre code span.dimmed {
      opacity: 0.4;
      filter: blur(0.5px);
      transition: opacity 0.2s ease, filter 0.2s ease;
    }

    pre code span.dimmed:hover {
      opacity: 1;
      filter: blur(0);
    }

    /* Combine focused and highlighted */
    pre code span.focused.highlighted {
      background-color: rgba(254, 243, 199, 0.7);
      border-left: 3px solid #fbbf24;
    }

    /* Code diff markers */
    pre code span.diff-add {
      background-color: rgba(134, 239, 172, 0.2);
      border-left: 3px solid #22c55e;
      padding-left: 13px; /* 16px - 3px border */
    }

    pre code span.diff-add::before {
      content: '+';
      position: absolute;
      left: -16px;
      color: #22c55e;
      font-weight: bold;
      width: 16px;
      text-align: center;
    }

    pre code span.diff-remove {
      background-color: rgba(252, 165, 165, 0.2);
      border-left: 3px solid #ef4444;
      padding-left: 13px; /* 16px - 3px border */
      opacity: 0.7;
    }

    pre code span.diff-remove::before {
      content: '-';
      position: absolute;
      left: -16px;
      color: #ef4444;
      font-weight: bold;
      width: 16px;
      text-align: center;
    }

    /* Ensure proper positioning for diff indicators */
    pre code span.diff-add,
    pre code span.diff-remove {
      position: relative;
    }

    /* Code error markers */
    pre code span.has-error {
      background-color: rgba(252, 165, 165, 0.15);
      border-left: 3px solid #dc2626;
      padding-left: 13px; /* 16px - 3px border */
      position: relative;
    }

    pre code span.has-error::before {
      content: '✕';
      position: absolute;
      left: -16px;
      color: #dc2626;
      font-weight: bold;
      width: 16px;
      text-align: center;
      font-size: 12px;
    }

    /* Code warning markers */
    pre code span.has-warning {
      background-color: rgba(251, 191, 36, 0.15);
      border-left: 3px solid #f59e0b;
      padding-left: 13px; /* 16px - 3px border */
      position: relative;
    }

    pre code span.has-warning::before {
      content: '⚠';
      position: absolute;
      left: -16px;
      color: #f59e0b;
      font-weight: bold;
      width: 16px;
      text-align: center;
      font-size: 12px;
    }

    /* Code Groups (Tabs) */
    .code-group {
      margin: 16px 0;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }

    .code-group-tabs {
      display: flex;
      background-color: #f6f8fa;
      border-bottom: 1px solid #e2e8f0;
      padding: 0;
      margin: 0;
    }

    .code-group-tab {
      background: transparent;
      border: none;
      padding: 10px 16px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: #6b7280;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .code-group-tab:hover {
      color: #3b82f6;
      background-color: #eff6ff;
    }

    .code-group-tab.active {
      color: #3b82f6;
      border-bottom-color: #3b82f6;
      background-color: #eff6ff;
    }

    .code-group-panels {
      position: relative;
    }

    .code-group-panel {
      display: none;
    }

    .code-group-panel.active {
      display: block;
    }

    .code-group-panel pre {
      margin: 0;
      border-radius: 0;
      border: none;
    }

    /* Enhanced Tables */
    .table-responsive {
      overflow-x: auto;
      margin: 16px 0;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .enhanced-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
      background-color: white;
    }

    .enhanced-table thead {
      background-color: #f6f8fa;
    }

    .enhanced-table th {
      padding: 12px 16px;
      font-weight: 600;
      color: #213547;
      border-bottom: 2px solid #e2e8f0;
      white-space: nowrap;
    }

    .enhanced-table td {
      padding: 12px 16px;
      color: #3c4858;
      border-bottom: 1px solid #f0f0f0;
    }

    /* Striped rows */
    .enhanced-table tbody tr:nth-child(even) {
      background-color: #f9fafb;
    }

    /* Hover effect */
    .enhanced-table tbody tr:hover {
      background-color: #f0f9ff;
      transition: background-color 0.2s ease;
    }

    /* Responsive behavior */
    @media (max-width: 768px) {
      .table-responsive {
        font-size: 13px;
      }

      .enhanced-table th,
      .enhanced-table td {
        padding: 8px 12px;
      }
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
