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

    /* Code block backgrounds fix - using !important to override any inline styles */
    pre,
    pre[data-lang],
    article pre,
    .bp-doc pre {
      position: relative;
      background-color: #f6f6f7 !important;
      border-radius: 8px;
      margin: 16px 0;
      overflow-x: auto;
    }

    pre code,
    pre[data-lang] code,
    article pre code,
    .bp-doc pre code {
      display: block;
      padding: 20px 24px;
      background-color: transparent !important;
      background: transparent !important;
      font-size: 14px;
      line-height: 1.7;
      color: #24292f;
    }

    /* Dark mode code blocks */
    html.dark pre,
    html.dark pre[data-lang],
    html.dark article pre,
    html.dark .bp-doc pre {
      background-color: #161618 !important;
    }

    html.dark pre code,
    html.dark pre[data-lang] code {
      color: #e6edf3;
    }

    /* Code groups - tabbed code blocks */
    .code-group {
      margin: 16px 0;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e2e2e3;
      background-color: #f6f6f7 !important;
    }

    html.dark .code-group {
      border-color: #3c3f44;
      background-color: #161618 !important;
    }

    .code-group-tabs {
      display: flex;
      background-color: #f6f6f7 !important;
      border-bottom: 1px solid #e2e2e3;
      overflow-x: auto;
    }

    html.dark .code-group-tabs {
      background-color: #161618 !important;
      border-bottom-color: #3c3f44;
    }

    .code-group-tab {
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 500;
      color: #67676c;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      white-space: nowrap;
      transition: color 0.2s, border-color 0.2s;
    }

    .code-group-tab:hover {
      color: #3c3c43;
    }

    .code-group-tab.active {
      color: #3451b2;
      border-bottom-color: #3451b2;
    }

    html.dark .code-group-tab {
      color: #9ca3af;
    }

    html.dark .code-group-tab:hover {
      color: #e6edf3;
    }

    html.dark .code-group-tab.active {
      color: #a8b1ff;
      border-bottom-color: #a8b1ff;
    }

    .code-group-panels {
      background-color: #f6f6f7 !important;
    }

    html.dark .code-group-panels {
      background-color: #161618 !important;
    }

    .code-group-panel {
      display: none;
    }

    .code-group-panel.active {
      display: block;
    }

    .code-group-panel pre,
    .code-group pre {
      margin: 0 !important;
      border-radius: 0 !important;
      border: none !important;
      background-color: #f6f6f7 !important;
    }

    html.dark .code-group-panel pre,
    html.dark .code-group pre {
      background-color: #161618 !important;
    }

    /* Language label positioning */
    pre[data-lang]::before {
      content: attr(data-lang);
      position: absolute;
      top: 8px;
      right: 48px;
      font-size: 12px;
      font-weight: 500;
      color: #9ca3af;
      text-transform: lowercase;
      pointer-events: none;
      z-index: 2;
    }

    /* Adjust copy button position to not overlap language label */
    pre .copy-code-button {
      top: 8px;
      right: 8px;
    }

    /* Heading spacing - add margin below headings */
    article h1,
    article h2,
    article h3,
    article h4,
    article h5,
    article h6,
    .bp-doc h1,
    .bp-doc h2,
    .bp-doc h3,
    .bp-doc h4,
    .bp-doc h5,
    .bp-doc h6 {
      margin-bottom: 16px;
    }

    article h2,
    .bp-doc h2 {
      margin-top: 48px;
      margin-bottom: 24px;
    }

    article h3,
    .bp-doc h3 {
      margin-top: 32px;
      margin-bottom: 16px;
    }

    article h4,
    .bp-doc h4 {
      margin-top: 24px;
      margin-bottom: 12px;
    }

    /* List styling with proper indentation */
    article ul,
    article ol,
    .bp-doc ul,
    .bp-doc ol {
      padding-left: 1.5rem;
      margin: 16px 0;
    }

    article ul,
    .bp-doc ul {
      list-style-type: disc;
    }

    article ol,
    .bp-doc ol {
      list-style-type: decimal;
    }

    article li,
    .bp-doc li {
      margin: 8px 0;
      line-height: 1.7;
    }

    /* Nested lists */
    article ul ul,
    article ol ul,
    article ul ol,
    article ol ol,
    .bp-doc ul ul,
    .bp-doc ol ul,
    .bp-doc ul ol,
    .bp-doc ol ol {
      margin: 8px 0;
      padding-left: 1.5rem;
    }

    article ul ul,
    .bp-doc ul ul {
      list-style-type: circle;
    }

    article ul ul ul,
    .bp-doc ul ul ul {
      list-style-type: square;
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

    /* Split button group */
    .copy-page-button-group {
      display: flex;
      align-items: stretch;
    }

    .copy-page-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background-color: var(--bp-c-bg-soft, #f6f6f7);
      border: 1px solid var(--bp-c-divider, #e2e2e3);
      color: var(--bp-c-text-1, #3c3c43);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .copy-page-button.copy-page-main {
      border-radius: 8px 0 0 8px;
      border-right: none;
      padding-right: 12px;
    }

    .copy-page-button.copy-page-toggle {
      border-radius: 0 8px 8px 0;
      padding: 8px 8px;
      border-left: 1px solid var(--bp-c-divider, #e2e2e3);
    }

    .copy-page-button:hover {
      background-color: var(--bp-c-bg, #ffffff);
    }

    .copy-page-button-group:hover .copy-page-button {
      border-color: var(--bp-c-brand-1, #5672cd);
    }

    .copy-page-button-group:hover .copy-page-toggle {
      border-left-color: var(--bp-c-brand-1, #5672cd);
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

    /* Copied state */
    .copy-page-button.copied {
      background-color: var(--bp-c-success-soft, rgba(16, 185, 129, 0.14));
    }

    .copy-page-button.copied .copy-icon {
      display: none;
    }

    .copy-page-button.copied .check-icon {
      display: block !important;
      color: var(--bp-c-success-1, #18794e);
    }

    .copy-page-button.copied .button-text {
      color: var(--bp-c-success-1, #18794e);
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

    /* Toast notification */
    .bp-toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 20px;
      background-color: var(--bp-c-bg, #ffffff);
      border: 1px solid var(--bp-c-divider, #e2e2e3);
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      font-size: 14px;
      font-weight: 500;
      color: var(--bp-c-text-1, #3c3c43);
      z-index: 9999;
      opacity: 0;
      transition: transform 0.3s ease, opacity 0.3s ease;
    }

    .bp-toast.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    html.dark .bp-toast {
      background-color: var(--bp-c-bg, #1a1a1a);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }

    /* Theme Toggle Button */
    .theme-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      padding: 0;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 8px;
      cursor: pointer;
      color: #6b7280;
      transition: color 0.2s, background-color 0.2s, border-color 0.2s;
    }

    .theme-toggle:hover {
      color: #3c3c43;
      background-color: #f6f6f7;
      border-color: #e2e2e3;
    }

    html.dark .theme-toggle {
      color: #9ca3af;
    }

    html.dark .theme-toggle:hover {
      color: #e6edf3;
      background-color: #2e2e32;
      border-color: #3c3f44;
    }

    .theme-toggle svg {
      width: 20px;
      height: 20px;
    }

    /* Show sun icon in dark mode, moon icon in light mode */
    .theme-toggle .sun-icon {
      display: none;
    }

    .theme-toggle .moon-icon {
      display: block;
    }

    html.dark .theme-toggle .sun-icon {
      display: block;
    }

    html.dark .theme-toggle .moon-icon {
      display: none;
    }
    `,
    scripts: [`
// Theme toggle functionality
function getPreferredTheme() {
  // Check localStorage first
  const stored = localStorage.getItem('bunpress-theme');
  if (stored) {
    return stored;
  }
  // Fall back to system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('bunpress-theme', theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

// Initialize theme on page load
(function() {
  const theme = getPreferredTheme();
  setTheme(theme);

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only auto-switch if user hasn't manually set a preference
    if (!localStorage.getItem('bunpress-theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
})();

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

// Fallback copy function for browsers that don't support clipboard API
function fallbackCopyToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  textArea.style.top = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  } catch (err) {
    document.body.removeChild(textArea);
    return false;
  }
}

// Copy to clipboard with fallback
function copyToClipboard(text) {
  return new Promise((resolve, reject) => {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(resolve)
        .catch(() => {
          // Fallback to execCommand
          if (fallbackCopyToClipboard(text)) {
            resolve();
          } else {
            reject(new Error('Copy failed'));
          }
        });
    } else {
      // Use fallback directly
      if (fallbackCopyToClipboard(text)) {
        resolve();
      } else {
        reject(new Error('Copy failed'));
      }
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

  // Copy to clipboard using fallback-enabled function
  copyToClipboard(text).then(() => {
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

// Direct copy button (left side of split button)
function copyPageDirect(event) {
  event.preventDefault();
  event.stopPropagation();

  const markdown = getPageAsMarkdown();
  const button = event.currentTarget;
  const textEl = button.querySelector('.button-text');

  copyToClipboard(markdown).then(() => {
    // Show copied state
    button.classList.add('copied');
    textEl.textContent = 'Copied!';

    // Reset after delay
    setTimeout(() => {
      button.classList.remove('copied');
      textEl.textContent = 'Copy page';
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    showToast('Failed to copy. Please try again.');
  });
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

// Show toast notification
function showToast(message, duration = 3000) {
  // Remove existing toast
  const existingToast = document.querySelector('.bp-toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = 'bp-toast';
  toast.innerHTML = \`
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 20px; height: 20px; color: #10b981;">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>
    <span>\${message}</span>
  \`;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function copyPageAsMarkdown(event) {
  event.preventDefault();
  event.stopPropagation();

  const markdown = getPageAsMarkdown();

  copyToClipboard(markdown).then(() => {
    // Update button to show copied state
    const menuItem = event.currentTarget;
    const iconEl = menuItem.querySelector('.icon svg');
    const titleEl = menuItem.querySelector('.title');
    const originalIcon = iconEl.outerHTML;
    const originalTitle = titleEl.textContent;

    // Show checkmark icon
    iconEl.outerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #10b981;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
    titleEl.textContent = 'Copied to clipboard!';
    menuItem.classList.add('copied');

    // Show toast
    showToast('Page copied as Markdown');

    setTimeout(() => {
      menuItem.querySelector('.icon').innerHTML = originalIcon;
      titleEl.textContent = originalTitle;
      menuItem.classList.remove('copied');
      closeCopyPageDropdown();
    }, 1500);
  }).catch(err => {
    console.error('Failed to copy:', err);
    showToast('Failed to copy. Please try again.');
  });
}

function viewAsMarkdown(event) {
  event.preventDefault();
  const markdown = getPageAsMarkdown();
  const blob = new Blob([markdown], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  closeCopyPageDropdown();
}

function openInChatGPT(event) {
  event.preventDefault();
  event.stopPropagation();

  const title = document.querySelector('h1')?.textContent || document.title;
  const pageUrl = window.location.href;
  const markdown = getPageAsMarkdown();

  const prompt = \`Please help me understand this documentation page:

Title: \${title}
URL: \${pageUrl}

---

\${markdown}\`;

  copyToClipboard(prompt).then(() => {
    showToast('Content copied! Paste it in ChatGPT');
    closeCopyPageDropdown();
    setTimeout(() => {
      window.open('https://chat.openai.com/', '_blank');
    }, 500);
  }).catch(err => {
    console.error('Failed to copy:', err);
    showToast('Failed to copy. Please try again.');
  });
}

function openInClaude(event) {
  event.preventDefault();
  event.stopPropagation();

  const title = document.querySelector('h1')?.textContent || document.title;
  const pageUrl = window.location.href;
  const markdown = getPageAsMarkdown();

  const prompt = \`Please help me understand this documentation page:

Title: \${title}
URL: \${pageUrl}

---

\${markdown}\`;

  copyToClipboard(prompt).then(() => {
    showToast('Content copied! Paste it in Claude');
    closeCopyPageDropdown();
    setTimeout(() => {
      window.open('https://claude.ai/new', '_blank');
    }, 500);
  }).catch(err => {
    console.error('Failed to copy:', err);
    showToast('Failed to copy. Please try again.');
  });
}

function openInPerplexity(event) {
  event.preventDefault();
  event.stopPropagation();

  const title = document.querySelector('h1')?.textContent || document.title;
  const pageUrl = window.location.href;

  // Perplexity supports URL-based search
  const query = encodeURIComponent(\`Explain this documentation: "\${title}" \${pageUrl}\`);
  closeCopyPageDropdown();
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
