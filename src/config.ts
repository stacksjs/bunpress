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

    /* Copy Page Dropdown */
    .copy-page-dropdown {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      display: none; /* Hidden until JS positions it */
      z-index: 10;
    }

    .copy-page-dropdown.positioned {
      display: inline-block;
    }

    /* Page header row with H1 and Copy button */
    .bp-page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      position: relative;
      margin-bottom: 16px;
    }

    .bp-page-header h1 {
      margin: 0;
      flex: 1;
      min-width: 0;
    }

    .bp-page-header .copy-page-dropdown {
      position: relative;
      right: auto;
      top: auto;
      transform: none;
      flex-shrink: 0;
      margin-top: 4px;
      display: inline-block;
    }

    .bp-page-header .copy-page-dropdown.positioned {
      display: inline-block;
    }

    .copy-page-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background-color: var(--bp-c-bg-soft, #f6f6f7);
      border: 1px solid var(--bp-c-divider, #e2e2e3);
      border-radius: 8px;
      color: var(--bp-c-text-1, #3c3c43);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .copy-page-button:hover {
      background-color: var(--bp-c-bg, #ffffff);
      border-color: var(--bp-c-brand-1, #5672cd);
    }

    .copy-page-button svg {
      width: 16px;
      height: 16px;
    }

    .copy-page-button .chevron {
      width: 12px;
      height: 12px;
      transition: transform 0.2s ease;
    }

    .copy-page-dropdown.open .copy-page-button .chevron {
      transform: rotate(180deg);
    }

    .copy-page-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      min-width: 280px;
      background-color: var(--bp-c-bg, #ffffff);
      border: 1px solid var(--bp-c-divider, #e2e2e3);
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-8px);
      transition: all 0.2s ease;
      z-index: 100;
      overflow: hidden;
    }

    .copy-page-dropdown.open .copy-page-menu {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .copy-page-menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: var(--bp-c-text-1, #3c3c43);
      text-decoration: none;
      cursor: pointer;
      transition: background-color 0.15s ease;
    }

    .copy-page-menu-item:hover {
      background-color: var(--bp-c-bg-soft, #f6f6f7);
    }

    .copy-page-menu-item .icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .copy-page-menu-item .icon svg {
      width: 20px;
      height: 20px;
    }

    .copy-page-menu-item .icon img {
      width: 20px;
      height: 20px;
      border-radius: 4px;
    }

    .copy-page-menu-item .content {
      flex: 1;
      min-width: 0;
    }

    .copy-page-menu-item .title {
      font-size: 14px;
      font-weight: 500;
      color: var(--bp-c-text-1, #3c3c43);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .copy-page-menu-item .title .external-icon {
      width: 12px;
      height: 12px;
      opacity: 0.6;
    }

    .copy-page-menu-item .description {
      font-size: 12px;
      color: var(--bp-c-text-2, #67676c);
      margin-top: 2px;
    }

    .copy-page-menu-divider {
      height: 1px;
      background-color: var(--bp-c-divider, #e2e2e3);
      margin: 4px 0;
    }

    .copy-page-menu-item.copied .title {
      color: var(--bp-c-success-1, #18794e);
    }

    /* Dark mode support */
    html.dark .copy-page-menu {
      background-color: var(--bp-c-bg, #1a1a1a);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
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

    // Position Copy Page dropdown next to H1
    const h1 = document.querySelector('article.bp-doc h1');
    const dropdown = document.getElementById('copy-page-dropdown');
    if (h1 && dropdown) {
      // Create wrapper div for H1 and dropdown
      const wrapper = document.createElement('div');
      wrapper.className = 'bp-page-header';

      // Insert wrapper before H1
      h1.parentNode.insertBefore(wrapper, h1);

      // Move H1 and dropdown into wrapper
      wrapper.appendChild(h1);
      wrapper.appendChild(dropdown);

      // Show dropdown now that it's positioned
      dropdown.classList.add('positioned');
    }
  });
}

// Copy Page Dropdown functionality
function toggleCopyPageDropdown(event) {
  event.stopPropagation();
  const dropdown = document.querySelector('.copy-page-dropdown');
  if (dropdown) {
    dropdown.classList.toggle('open');
  }
}

function closeCopyPageDropdown() {
  const dropdown = document.querySelector('.copy-page-dropdown');
  if (dropdown) {
    dropdown.classList.remove('open');
  }
}

// Get the page content as markdown-formatted text for LLMs
function getPageAsMarkdown() {
  const article = document.querySelector('article.bp-doc');
  if (!article) return '';

  const title = document.querySelector('h1')?.textContent || document.title;
  const url = window.location.href;

  // Clone the article to avoid modifying the original
  const clone = article.cloneNode(true);

  // Remove copy buttons and other UI elements
  clone.querySelectorAll('.copy-code-button, .copy-page-dropdown').forEach(el => el.remove());

  // Convert HTML back to a readable markdown-like format
  let content = '';

  function processNode(node, depth = 0) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const tag = node.tagName.toLowerCase();
    let text = '';

    switch(tag) {
      case 'h1':
        text = '# ' + node.textContent + '\\n\\n';
        break;
      case 'h2':
        text = '## ' + node.textContent + '\\n\\n';
        break;
      case 'h3':
        text = '### ' + node.textContent + '\\n\\n';
        break;
      case 'h4':
        text = '#### ' + node.textContent + '\\n\\n';
        break;
      case 'h5':
        text = '##### ' + node.textContent + '\\n\\n';
        break;
      case 'h6':
        text = '###### ' + node.textContent + '\\n\\n';
        break;
      case 'p':
        text = Array.from(node.childNodes).map(n => processNode(n, depth)).join('') + '\\n\\n';
        break;
      case 'pre':
        const code = node.querySelector('code');
        const lang = code?.className?.match(/language-(\\w+)/)?.[1] || '';
        text = '\`\`\`' + lang + '\\n' + (code?.textContent || node.textContent) + '\\n\`\`\`\\n\\n';
        break;
      case 'code':
        if (node.parentElement?.tagName.toLowerCase() !== 'pre') {
          text = '\`' + node.textContent + '\`';
        }
        break;
      case 'strong':
      case 'b':
        text = '**' + node.textContent + '**';
        break;
      case 'em':
      case 'i':
        text = '*' + node.textContent + '*';
        break;
      case 'a':
        const href = node.getAttribute('href');
        text = '[' + node.textContent + '](' + (href?.startsWith('/') ? window.location.origin + href : href) + ')';
        break;
      case 'ul':
        text = Array.from(node.children).map(li => '- ' + li.textContent).join('\\n') + '\\n\\n';
        break;
      case 'ol':
        text = Array.from(node.children).map((li, i) => (i + 1) + '. ' + li.textContent).join('\\n') + '\\n\\n';
        break;
      case 'blockquote':
        text = node.textContent.split('\\n').map(line => '> ' + line).join('\\n') + '\\n\\n';
        break;
      case 'hr':
        text = '---\\n\\n';
        break;
      case 'br':
        text = '\\n';
        break;
      case 'table':
        // Simple table handling
        const rows = node.querySelectorAll('tr');
        rows.forEach((row, i) => {
          const cells = row.querySelectorAll('th, td');
          text += '| ' + Array.from(cells).map(c => c.textContent.trim()).join(' | ') + ' |\\n';
          if (i === 0) {
            text += '| ' + Array.from(cells).map(() => '---').join(' | ') + ' |\\n';
          }
        });
        text += '\\n';
        break;
      default:
        // For other elements, just process children
        text = Array.from(node.childNodes).map(n => processNode(n, depth)).join('');
    }

    return text;
  }

  content = Array.from(clone.childNodes).map(n => processNode(n)).join('');

  // Clean up extra newlines
  content = content.replace(/\\n{3,}/g, '\\n\\n').trim();

  return \`# \${title}\\n\\nSource: \${url}\\n\\n\${content}\`;
}

function copyPageAsMarkdown(event) {
  event.preventDefault();
  event.stopPropagation();

  const markdown = getPageAsMarkdown();

  navigator.clipboard.writeText(markdown).then(() => {
    const menuItem = event.currentTarget;
    menuItem.classList.add('copied');
    const titleEl = menuItem.querySelector('.title');
    const originalText = titleEl.innerHTML;
    titleEl.innerHTML = 'Copied!';

    setTimeout(() => {
      menuItem.classList.remove('copied');
      titleEl.innerHTML = originalText;
      closeCopyPageDropdown();
    }, 1500);
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

function viewAsMarkdown(event) {
  event.preventDefault();
  const markdown = getPageAsMarkdown();
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

function openInChatGPT(event) {
  event.preventDefault();
  const markdown = getPageAsMarkdown();
  const prompt = encodeURIComponent('Please help me understand this documentation:\\n\\n' + markdown);
  window.open('https://chat.openai.com/?q=' + prompt, '_blank');
}

function openInClaude(event) {
  event.preventDefault();
  const markdown = getPageAsMarkdown();
  // Claude doesn't have a direct URL scheme, so copy to clipboard and open Claude
  navigator.clipboard.writeText(markdown).then(() => {
    window.open('https://claude.ai/new', '_blank');
  });
}

function openInPerplexity(event) {
  event.preventDefault();
  const title = document.querySelector('h1')?.textContent || document.title;
  const url = window.location.href;
  const query = encodeURIComponent('Help me understand: ' + title + ' from ' + url);
  window.open('https://www.perplexity.ai/search?q=' + query, '_blank');
}

// Close dropdown when clicking outside
if (typeof document !== 'undefined') {
  document.addEventListener('click', (event) => {
    const dropdown = document.querySelector('.copy-page-dropdown');
    if (dropdown && !dropdown.contains(event.target)) {
      closeCopyPageDropdown();
    }
  });

  // Close dropdown on escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeCopyPageDropdown();
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
