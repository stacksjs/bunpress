import type { BunPressConfig } from './types'
import { loadConfig } from 'bunfig'

// Default configuration
export const defaultConfig: BunPressConfig = {
  // Directory configuration
  docsDir: './docs',
  outDir: './dist',

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
            { text: 'Analytics (Fathom)', link: '/config#fathom-analytics-configuration' },
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
      /* Scroll, never wrap: wrapped code loses its indentation. */
      white-space: pre;
      /* fit-content + min-width lets a long line extend the scroll width. */
      width: fit-content;
      min-width: 100%;
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

    /* Code groups are styled by the theme (codeGroupCSS), which owns the tab metrics, the active-tab bar and dark mode via CSS variables. Duplicating them here fought it: a second padding rule on top of the theme's 48px line-height inflated the tab bar to 74px, and a second border-bottom drew a second active indicator under the theme's own. */

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

    /* List styling. Scoped to a bare article element only: inside .bp-doc the theme owns lists, and duplicating them here produced two competing sets of margins. */
    article ul,
    article ol {
      padding-left: 1.5rem;
      margin: 16px 0;
      list-style-position: outside;
    }

    article ul {
      list-style-type: disc;
    }

    article ol {
      list-style-type: decimal;
    }

    article li {
      margin: 6px 0;
      line-height: 1.75;
    }

    /* Nested lists */
    article ul ul,
    article ol ul,
    article ul ol,
    article ol ol {
      margin: 6px 0 0;
      padding-left: 1.5rem;
    }

    article ul ul {
      list-style-type: circle;
    }

    article ul ul ul {
      list-style-type: square;
    }

    /* Enhanced tables. The wrapper is the scroll container and owns the frame; the table stays a real table so columns size against the available width. Keep in sync with the .bp-doc table rules in the theme. */
    .table-responsive {
      overflow-x: auto;
      overscroll-behavior-x: contain;
      margin: 20px 0;
      border-radius: 8px;
      border: 1px solid var(--bp-c-divider, #e2e2e3);
      background-color: var(--bp-c-bg, #ffffff);
    }

    .enhanced-table {
      display: table;
      width: 100%;
      margin: 0;
      border: none;
      border-collapse: collapse;
      font-size: 14px;
      line-height: 1.6;
    }

    .enhanced-table thead {
      background-color: var(--bp-c-bg-soft, #f6f6f7);
    }

    .enhanced-table th {
      padding: 10px 16px;
      font-size: 13px;
      font-weight: 600;
      text-align: left;
      color: var(--bp-c-text-2, #67676c);
      border-bottom: 1px solid var(--bp-c-divider, #e2e2e3);
      white-space: nowrap;
    }

    .enhanced-table td {
      padding: 10px 16px;
      vertical-align: top;
      color: var(--bp-c-text-1, #3c3c43);
      border-bottom: 1px solid var(--bp-c-divider, #e2e2e3);
    }

    /* The wrapper already draws the bottom edge. */
    .enhanced-table tbody tr:last-child > td,
    .enhanced-table tbody tr:last-child > th {
      border-bottom: none;
    }

    .enhanced-table tbody tr:nth-child(2n) {
      background-color: var(--bp-c-bg-soft, #f6f6f7);
    }

    .enhanced-table tbody tr:hover {
      background-color: var(--bp-c-default-soft, rgba(142, 150, 170, 0.14));
      transition: background-color 0.2s ease;
    }

    /* Long values wrap inside their column rather than dictating its width. 'anywhere' (not 'break-word') also lowers the cell's intrinsic minimum, which is what frees the auto table algorithm to widen the prose column. */
    .enhanced-table td > code,
    .enhanced-table th > code {
      white-space: normal;
      overflow-wrap: anywhere;
    }

    /* Narrow screens: hold a readable floor and let the wrapper scroll rather than compressing four columns into one word per line. */
    @media (max-width: 767px) {
      .enhanced-table {
        min-width: 38rem;
      }

      .enhanced-table th {
        white-space: normal;
      }

      .enhanced-table th,
      .enhanced-table td {
        padding: 10px 12px;
      }
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
    /* Rendered server-side inside .bp-page-header, so it needs no JS to be placed and no "hidden until positioned" state. */
    .copy-page-dropdown {
      position: relative;
      display: inline-block;
      flex-shrink: 0;
      z-index: 10;
    }

    /* Page header row: H1 on the left, copy control trailing it. */
    .bp-page-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 16px;
      position: relative;
      margin-bottom: 16px;
      /* On narrow screens the button drops below the title instead of squeezing it into a one-word-per-line column. */
      flex-wrap: wrap;
    }

    .bp-page-header h1 {
      margin: 0;
      flex: 1 1 16rem;
      min-width: 0;
      /* Break only where there is no other option, never mid-word while the title still has room to wrap between words. */
      overflow-wrap: break-word;
      word-break: normal;
      hyphens: none;
    }

    /* The control is chrome, not content: it sits on the title's baseline and stays visually quieter than the heading it accompanies. */
    .bp-page-header .copy-page-dropdown {
      align-self: baseline;
    }

    @media (max-width: 639px) {
      .bp-page-header {
        gap: 10px;
      }
    }

    /* Split button group */
    .copy-page-button-group {
      display: flex;
      align-items: stretch;
    }

    .copy-page-button {
      display: flex;
      align-items: center;
      gap: 6px;
      /* Deliberately smaller than body copy: this is a utility next to the page title, and at 14px/40px tall it competed with the H1. */
      height: 32px;
      padding: 0 10px;
      background-color: transparent;
      border: 1px solid var(--bp-c-divider, #e2e2e3);
      color: var(--bp-c-text-2, #67676c);
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
      cursor: pointer;
      transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
    }

    .copy-page-button.copy-page-main {
      border-radius: 6px 0 0 6px;
      border-right: none;
    }

    .copy-page-button.copy-page-toggle {
      border-radius: 0 6px 6px 0;
      padding: 0 6px;
      border-left: 1px solid var(--bp-c-divider, #e2e2e3);
    }

    .copy-page-button:hover {
      color: var(--bp-c-text-1, #3c3c43);
      background-color: var(--bp-c-bg-soft, #f6f6f7);
    }

    .copy-page-button:focus-visible {
      outline: 2px solid var(--bp-c-brand-1, #5672cd);
      outline-offset: 2px;
    }

    .copy-page-button-group:hover .copy-page-button {
      border-color: var(--bp-c-brand-1, #5672cd);
    }

    .copy-page-button-group:hover .copy-page-toggle {
      border-left-color: var(--bp-c-brand-1, #5672cd);
    }

    .copy-page-button svg {
      width: 15px;
      height: 15px;
      flex-shrink: 0;
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
      width: 280px;
      /* The trigger sits near the left edge on a phone, so a right-anchored 280px panel hangs off-screen. Cap it to the viewport and let the start-edge clamp below flip it when there is no room to the left. */
      max-width: calc(100vw - 32px);
      background-color: var(--bp-c-bg, #ffffff);
      border: 1px solid var(--bp-c-divider, #e2e2e3);
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-8px);
      transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
      z-index: 100;
      overflow: hidden;
    }

    /* Below the point where the panel is wider than the space to the trigger's left, anchor it to the start edge instead so it opens into the page. */
    @media (max-width: 519px) {
      .copy-page-menu {
        right: auto;
        left: 0;
      }
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
      cursor: pointer;
      transition: background-color 0.15s ease;
    }

    /* The control is rendered inside .bp-doc, so prose link styling (brand colour + underline) would otherwise bleed onto every menu row. */
    .copy-page-dropdown a,
    .copy-page-dropdown a:hover {
      color: inherit;
      font-weight: inherit;
      text-decoration: none;
    }

    .copy-page-dropdown a::after {
      content: none;
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
  // A site can force a theme (config darkMode: 'dark' | 'light'), SSR'd as
  // data-theme-mode on <html>. Honor it over localStorage/system so a forced
  // theme is never overridden (and the SSR'd class is never stripped).
  const forced = document.documentElement.getAttribute('data-theme-mode');
  if (forced === 'dark' || forced === 'light') {
    return forced;
  }
  // Check localStorage next
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
  }
  else {
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
  const forced = document.documentElement.getAttribute('data-theme-mode');
  const theme = getPreferredTheme();
  setTheme(theme);

  // A forced theme has no alternate to switch to; hide the toggle so nobody
  // lands on a broken half-themed page from clicking it.
  if (forced === 'dark' || forced === 'light') {
    const toggle = document.querySelector('.theme-toggle');
    if (toggle)
      toggle.style.display = 'none';
    return;
  }

  // Listen for system theme changes. Skip when the site forces a theme, and
  // only auto-switch if the user hasn't manually set a preference.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const forced = document.documentElement.getAttribute('data-theme-mode');
    if (forced === 'dark' || forced === 'light')
      return;
    if (!localStorage.getItem('bunpress-theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
})();

// Nav dropdowns and mega menus.
//
// The panels open on :hover and :focus-within in CSS, so they work with no
// JavaScript and with the keyboard. This adds the two things CSS cannot do:
// a real click/tap toggle (a touch device has no hover to rely on) and an
// accurate aria-expanded for screen readers.
function closeNavGroups(except) {
  document.querySelectorAll('.BPNavBarMenu-group.is-open').forEach(function (group) {
    if (group === except) return;
    group.classList.remove('is-open');
    const button = group.querySelector('.BPNavBarMenu-group-button');
    if (button) button.setAttribute('aria-expanded', 'false');
  });
}

function toggleNavScreen(force) {
  const screen = document.getElementById('bp-nav-screen');
  const toggle = document.querySelector('.BPNavToggle');
  if (!screen) return;
  const open = typeof force === 'boolean' ? force : screen.hasAttribute('hidden');
  if (open) screen.removeAttribute('hidden');
  else screen.setAttribute('hidden', '');
  document.documentElement.classList.toggle('bp-nav-screen-open', open);
  if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
}

(function () {
  document.addEventListener('click', function (event) {
    const button = event.target.closest ? event.target.closest('.BPNavBarMenu-group-button') : null;
    if (button) {
      const group = button.parentElement;
      const open = !group.classList.contains('is-open');
      closeNavGroups(group);
      group.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      return;
    }
    // A click anywhere else dismisses an open panel, including a click on one
    // of its own links (which navigates, but SPA routing keeps the DOM).
    closeNavGroups(null);
    const screen = document.getElementById('bp-nav-screen');
    if (screen && !screen.hasAttribute('hidden') && !event.target.closest('.BPNav')) {
      toggleNavScreen(false);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    closeNavGroups(null);
    toggleNavScreen(false);
  });

  // A link inside the stacked nav navigates; leaving the panel open over the
  // new page would hide it.
  document.addEventListener('click', function (event) {
    if (event.target.closest && event.target.closest('.BPNavScreen a')) toggleNavScreen(false);
  });
})();

// Hero code panel tabs. The panels are all server-rendered; this only swaps
// which one is visible, so the samples are in the HTML with or without JS.
function switchHeroCodeTab(button, index) {
  const panel = button.closest('.BPHeroCode');
  if (!panel) return;
  panel.querySelectorAll('.BPHeroCode-tab').forEach(function (tab, i) {
    tab.classList.toggle('is-active', i === index);
    tab.setAttribute('aria-selected', i === index ? 'true' : 'false');
  });
  panel.querySelectorAll('.BPHeroCode-panel').forEach(function (body, i) {
    if (i === index) body.removeAttribute('hidden');
    else body.setAttribute('hidden', '');
  });
}

function switchCodeTab(groupId, panelIndex) {
  const group = document.getElementById(groupId);
  if (!group) return;

  // Update tabs
  const tabs = group.querySelectorAll('.code-group-tab');
  tabs.forEach((tab, index) => {
    if (index === panelIndex) {
      tab.classList.add('active');
    }
    else {
      tab.classList.remove('active');
    }
  });

  // Update panels
  const panels = group.querySelectorAll('.code-group-panel');
  panels.forEach((panel, index) => {
    if (index === panelIndex) {
      panel.classList.add('active');
    }
    else {
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
  }
  catch (err) {
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
          }
          else {
            reject(new Error('Copy failed'));
          }
        });
    }
    else {
      // Use fallback directly
      if (fallbackCopyToClipboard(text)) {
        resolve();
      }
      else {
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

// Add copy buttons to all code blocks.
// Idempotent and re-run after client-side navigation: the SPA router replaces
// .BPDoc wholesale, so buttons added on first load are gone from the new page.
// (The copy-page control is rendered server-side inside the content, so it
// survives the same swap without any JS.)
function addCodeCopyButtons() {
  document.querySelectorAll('pre > code').forEach(code => {
    const pre = code.parentElement;
    if (!pre || pre.querySelector('.copy-code-button')) return;

    const button = document.createElement('button');
    button.className = 'copy-code-button';
    button.setAttribute('onclick', 'copyCode(this)');
    button.setAttribute('type', 'button');
    button.setAttribute('aria-label', 'Copy code');
    button.innerHTML = \`<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
    </svg>\`;

    pre.appendChild(button);
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', addCodeCopyButtons);
  document.addEventListener('bp:navigated', addCodeCopyButtons);
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
        text = \`# \${node.textContent}\\n\\n\`;
        break;
      case 'h2':
        text = \`## \${node.textContent}\\n\\n\`;
        break;
      case 'h3':
        text = \`### \${node.textContent}\\n\\n\`;
        break;
      case 'h4':
        text = \`#### \${node.textContent}\\n\\n\`;
        break;
      case 'h5':
        text = \`##### \${node.textContent}\\n\\n\`;
        break;
      case 'h6':
        text = \`###### \${node.textContent}\\n\\n\`;
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
        text = \`**\${node.textContent}**\`;
        break;
      case 'em':
      case 'i':
        text = \`*\${node.textContent}*\`;
        break;
      case 'a':
        const href = node.getAttribute('href');
        text = \`[\${node.textContent}](\${href?.startsWith('/') ? window.location.origin + href : href})\`;
        break;
      case 'ul':
        text = \`\${Array.from(node.children).map(li => \`- \${li.textContent}\`).join('\\n')}\\n\\n\`;
        break;
      case 'ol':
        text = \`\${Array.from(node.children).map((li, i) => \`\${i + 1}. \${li.textContent}\`).join('\\n')}\\n\\n\`;
        break;
      case 'blockquote':
        text = \`\${node.textContent.split('\\n').map(line => \`> \${line}\`).join('\\n')}\\n\\n\`;
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
          text += \`| \${Array.from(cells).map(c => c.textContent.trim()).join(' | ')} |\\n\`;
          if (i === 0) {
            text += \`| \${Array.from(cells).map(() => '---').join(' | ')} |\\n\`;
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
  window.open(\`https://www.perplexity.ai/search?q=\${query}\`, '_blank');
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

  // Search is on by default: the nav shows a search affordance, and shipping
  // that affordance without the dialog behind it is worse than no search.
  search: {
    enabled: true,
    maxResults: 12,
    keyboardShortcuts: true,
  },

  themeConfig: {
    // Rendered into the nav bar. Previously the GitHub link was hardcoded into
    // the layout, so every site built with BunPress linked back to this repo.
    socialLinks: [
      { icon: 'github', link: 'https://github.com/stacksjs/bunpress' },
    ],
  },

  verbose: false,

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

/**
 * Run the config through the plugins it declares.
 *
 * `ConfigPlugin` and its four hooks were a documented, typed interface that
 * nothing ever called — a plugin could be written and registered and would
 * simply never run. Hooks apply in declaration order so a later plugin sees
 * what earlier ones produced.
 *
 * A plugin that throws is reported and skipped rather than taking the whole
 * site down: a broken third-party plugin should not make the docs unbuildable.
 */
export function applyConfigPlugins(loaded: BunPressConfig): BunPressConfig {
  const plugins = loaded.plugins
  if (!Array.isArray(plugins) || plugins.length === 0)
    return loaded

  let resolved = loaded

  for (const plugin of plugins) {
    if (!plugin || typeof plugin !== 'object')
      continue

    const label = plugin.name || 'unnamed plugin'

    try {
      if (typeof plugin.extendConfig === 'function')
        resolved = plugin.extendConfig(resolved) ?? resolved
    }
    catch (error) {
      console.error(`[bunpress] ${label}: extendConfig failed —`, error)
    }

    try {
      if (typeof plugin.validateConfig === 'function') {
        const result = plugin.validateConfig(resolved)
        for (const warning of result?.warnings ?? [])
          console.warn(`[bunpress] ${label}: ${warning}`)
        // Errors are surfaced, not thrown: validation reports a problem with
        // the site's config, and the author is better served by a built site
        // plus a loud message than by a build that refuses to run.
        for (const failure of result?.errors ?? [])
          console.error(`[bunpress] ${label}: ${failure}`)
      }
    }
    catch (error) {
      console.error(`[bunpress] ${label}: validateConfig failed —`, error)
    }
  }

  for (const plugin of plugins) {
    try {
      // Fire-and-forget: an async onConfigLoad must not block module init,
      // which happens at import time.
      void plugin?.onConfigLoad?.(resolved)
    }
    catch (error) {
      console.error(`[bunpress] ${plugin?.name || 'unnamed plugin'}: onConfigLoad failed —`, error)
    }
  }

  return resolved
}

/**
 * Config is resolved by name (`bunpress`) with `docs` as an alias, and each of
 * those has a root and a `.config/` form. When a project has more than one,
 * exactly one wins and the others are silently ignored, which reads as "my
 * edits do nothing" rather than as a config problem. Say so once at startup.
 */
async function warnOnShadowedConfigs(): Promise<void> {
  const candidates = [
    'bunpress.config.ts',
    'bunpress.config.js',
    '.config/bunpress.ts',
    'docs.config.ts',
    '.config/docs.ts',
  ]

  const present: string[] = []
  for (const candidate of candidates) {
    if (await Bun.file(candidate).exists())
      present.push(candidate)
  }

  if (present.length > 1) {
    const [winner, ...shadowed] = present
    console.warn(`[bunpress] Multiple config files found. Using ${winner}; ignoring ${shadowed.join(', ')}.`)
  }
}

await warnOnShadowedConfigs()

// Load and export the resolved configuration
export const config: BunPressConfig = applyConfigPlugins(await loadConfig({
  name: 'bunpress',
  alias: 'docs',
  defaultConfig,
}))

// Backward compatibility - simple config getter
export async function getConfig(): Promise<BunPressConfig> {
  return config
}
