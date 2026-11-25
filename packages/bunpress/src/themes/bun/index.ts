/**
 * Bun Theme for BunPress
 *
 * Mirrors the documentation at bun.com/docs, measured off the live site
 * (November 2026) rather than remembered: a white page (a warm near-black one
 * in the dark), near-black type, a hot pink accent drawn as rails, underlines
 * and icons, square corners, no shadows, Archivo condensed for headings and
 * Martian Mono for code and labels.
 *
 * It is the complete default theme with a Bun layer on top, so every
 * component keeps its structure and behaviour and only its look changes. The
 * layer's rules carry an `html` prefix because the component sheets land
 * later in the head than the theme does.
 *
 * Where Bun's own colours miss WCAG AA as text, the text uses the next step
 * of Bun's ramp and the original stays as decoration: links and inline code
 * are drawn in Bun's accent-strong (#d60066, 5.2:1), and the accent pink
 * (#ff1f8f, 3.3:1) only ever marks a rail, an underline or an icon, exactly as
 * it does on bun.com. test/theme-contrast.test.ts holds every pair.
 */

import { getVitePressThemeCSS } from '../vitepress'

/* -------------------------------------------------------------------------- */
/* Tokens                                                                     */
/* -------------------------------------------------------------------------- */

// Hex only in the two palette blocks: the contrast test reads them as written.
const varsCSS = `
/* Bun theme palette (bun.com/docs) */
:root {
  --bun-canvas: #ffffff;
  --bun-subtle: #f6f6f6;
  --bun-line: #e2e2e2;
  --bun-line-strong: #0a0a0a;
  --bun-rule: #181818;
  --bun-fg: #0a0a0a;
  --bun-fg-muted: #525252;
  --bun-fg-faint: #707070;
  --bun-accent: #ff1f8f;
  --bun-accent-strong: #d60066;
  --bun-accent-soft: #ffebf5;
  --bun-code-bg: #f6f6f6;
  --bun-info: #1450dc;
  --bun-success: #007a43;
  --bun-warning: #9a5f02;
  --bun-danger: #d61f2d;
  --bun-important: #7a3ed4;

  --bun-sk-text: #24211d;
  --bun-sk-keyword: #c41a68;
  --bun-sk-type: #0a7583;
  --bun-sk-fn: #2f5fd0;
  --bun-sk-const: #7a3ed4;
  --bun-sk-param: #a8520a;
  --bun-sk-string: #4d7c1b;
  --bun-sk-comment: #736c62;

  --bp-c-bg: #ffffff;
  --bp-c-bg-alt: #f6f6f6;
  --bp-c-bg-elv: #ffffff;
  --bp-c-bg-soft: #f6f6f6;

  --bp-c-text-1: #0a0a0a;
  --bp-c-text-2: #525252;
  --bp-c-text-3: #707070;

  --bp-c-border: #8a8a8a;
  --bp-c-divider: #e2e2e2;
  --bp-c-gutter: #e2e2e2;

  --bp-c-brand-1: #d60066;
  --bp-c-brand-2: #b8005a;
  --bp-c-brand-3: #ff1f8f;
  --bp-c-brand: #d60066;
  --bp-c-indigo-1: #d60066;
  --bp-c-indigo-2: #b8005a;
  --bp-c-indigo-3: #ff1f8f;

  --bp-c-note-1: #1450dc;
  --bp-c-tip-1: #007a43;
  --bp-c-success-1: #007a43;
  --bp-c-warning-1: #9a5f02;
  --bp-c-caution-1: #d61f2d;
  --bp-c-danger-1: #d61f2d;
  --bp-c-important-1: #7a3ed4;
  --bp-c-sponsor: #d60066;

  --bp-button-brand-text: #ffffff;
  --bp-button-brand-bg: #0a0a0a;
  --bp-button-brand-border: #0a0a0a;
  --bp-button-brand-hover-text: #ffffff;
  --bp-button-brand-hover-bg: #d60066;
  --bp-button-brand-hover-border: #d60066;
  --bp-button-brand-active-text: #ffffff;
  --bp-button-brand-active-bg: #b8005a;
  --bp-button-brand-active-border: #b8005a;
  --bp-button-alt-text: #0a0a0a;
  --bp-button-alt-bg: #ffffff;
  --bp-button-alt-border: #e2e2e2;
  --bp-button-alt-hover-text: #0a0a0a;
  --bp-button-alt-hover-bg: #f6f6f6;
  --bp-button-alt-hover-border: #181818;

  --bp-code-bg: #f6f6f6;
  --bp-code-color: #0a0a0a;
  --bp-code-block-bg: #f6f6f6;
  --bp-code-block-color: #24211d;
  --bp-code-lang-color: #525252;
  --bp-code-tab-bg: #f6f6f6;
  --bp-nav-bg-color: #ffffff;
  --bp-sidebar-bg-color: #ffffff;
}

.dark {
  --bun-canvas: #0d0a0c;
  --bun-subtle: #171316;
  --bun-line: #28282b;
  --bun-line-strong: #48484c;
  --bun-rule: #3e3e42;
  --bun-fg: #eaeae8;
  --bun-fg-muted: #a8a8a5;
  --bun-fg-faint: #8a8a87;
  --bun-accent: #ff2e97;
  --bun-accent-strong: #ff5cb0;
  --bun-accent-soft: #280016;
  --bun-code-bg: #0e0e0e;
  --bun-info: #78aaff;
  --bun-success: #28dc82;
  --bun-warning: #f5b43c;
  --bun-danger: #ff5a5a;
  --bun-important: #c4a5ff;

  --bun-sk-text: #e9e6e1;
  --bun-sk-keyword: #ff7eb6;
  --bun-sk-type: #7fdbec;
  --bun-sk-fn: #8fb4ff;
  --bun-sk-const: #c4a5ff;
  --bun-sk-param: #ffb977;
  --bun-sk-string: #b5e48c;
  --bun-sk-comment: #8f8b9e;

  --bp-c-bg: #0d0a0c;
  --bp-c-bg-alt: #171316;
  --bp-c-bg-elv: #1a1a1c;
  --bp-c-bg-soft: #171316;

  --bp-c-text-1: #eaeae8;
  --bp-c-text-2: #a8a8a5;
  --bp-c-text-3: #8a8a87;

  --bp-c-border: #6b6b6e;
  --bp-c-divider: #28282b;
  --bp-c-gutter: #28282b;

  --bp-c-brand-1: #ff5cb0;
  --bp-c-brand-2: #ff7ec2;
  --bp-c-brand-3: #ff2e97;
  --bp-c-brand: #ff5cb0;
  --bp-c-indigo-1: #ff5cb0;
  --bp-c-indigo-2: #ff7ec2;
  --bp-c-indigo-3: #ff2e97;

  --bp-c-note-1: #78aaff;
  --bp-c-tip-1: #28dc82;
  --bp-c-success-1: #28dc82;
  --bp-c-warning-1: #f5b43c;
  --bp-c-caution-1: #ff5a5a;
  --bp-c-danger-1: #ff5a5a;
  --bp-c-important-1: #c4a5ff;
  --bp-c-sponsor: #ff5cb0;

  --bp-button-brand-text: #0d0a0c;
  --bp-button-brand-bg: #eaeae8;
  --bp-button-brand-border: #eaeae8;
  --bp-button-brand-hover-text: #0d0a0c;
  --bp-button-brand-hover-bg: #ff5cb0;
  --bp-button-brand-hover-border: #ff5cb0;
  --bp-button-brand-active-text: #0d0a0c;
  --bp-button-brand-active-bg: #ff2e97;
  --bp-button-brand-active-border: #ff2e97;
  --bp-button-alt-text: #eaeae8;
  --bp-button-alt-bg: #0d0a0c;
  --bp-button-alt-border: #28282b;
  --bp-button-alt-hover-text: #eaeae8;
  --bp-button-alt-hover-bg: #171316;
  --bp-button-alt-hover-border: #3e3e42;

  --bp-code-bg: #171316;
  --bp-code-color: #eaeae8;
  --bp-code-block-bg: #0e0e0e;
  --bp-code-block-color: #e9e6e1;
  --bp-code-lang-color: #a8a8a5;
  --bp-code-tab-bg: #0e0e0e;
  --bp-nav-bg-color: #0d0a0c;
  --bp-sidebar-bg-color: #0d0a0c;
}

:root {
  --bp-font-family-base: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --bp-font-family-mono: "Martian Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --bun-font-display: "Archivo", "Arial Narrow", ui-sans-serif, system-ui, sans-serif;
  --bun-radius: 3px;
  --bun-radius-lg: 4px;
  --bun-cut: 10px;
  --bp-c-brand-soft: rgba(255, 31, 143, 0.09);
  --bp-c-default-soft: rgba(10, 10, 10, 0.05);
  --bp-code-font-size: 13.5px;
  --bp-code-line-height: 20px;
  --bp-code-line-highlight-color: rgba(255, 31, 143, 0.09);
  --bp-shadow-1: none;
  --bp-shadow-2: none;
  --bp-shadow-3: none;
  --bp-shadow-4: none;
  --bp-shadow-5: none;
  --bp-nav-height: 64px;
  --bp-sidebar-width: 288px;
  --bp-layout-max-width: 1600px;
  --bun-aside-width: 240px;
  --bun-gutter: 56px;
}

html.dark {
  --bp-c-brand-soft: rgba(255, 46, 151, 0.12);
  --bp-c-default-soft: rgba(234, 234, 232, 0.06);
  --bp-code-line-highlight-color: rgba(255, 46, 151, 0.12);
}
`

/* -------------------------------------------------------------------------- */
/* Chrome: header, sidebar, layout, page header, TOC, pager                   */
/* -------------------------------------------------------------------------- */

const baseCSS = `
/* Bun theme: chrome */
html body {
  font-family: var(--bp-font-family-base);
  background: var(--bun-canvas);
  color: var(--bun-fg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html ::selection {
  background: color-mix(in srgb, var(--bun-accent) 25%, transparent);
  color: var(--bun-fg);
}

html :focus-visible {
  outline: 2px solid var(--bun-accent);
  outline-offset: 2px;
}

html code, html kbd, html pre, html samp {
  font-family: var(--bp-font-family-mono);
  font-variant-ligatures: none;
}

/* Header ------------------------------------------------------------------ */

html .BPNav {
  background: var(--bun-canvas);
  border-bottom: 1px solid var(--bun-line);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

/* The start and end groups dissolve so the bar can be ordered the way Bun's
 * is: brand, section pills, search, then the icons. */
html .BPNavBar {
  max-width: none;
  padding: 0 40px;
  gap: 8px;
  justify-content: flex-start;
}

html .BPNavBarStart,
html .BPNavBarEnd {
  display: contents;
}

html .BPNavBarHamburger { order: 0; }
html .BPNavBarTitle { order: 1; }
html .BPNavBarMenu { order: 2; }
html .BPNavBarSearch { order: 3; }
html .BPSocialLinks { order: 4; }
html .BPNavToggle { order: 5; }

html .BPNavBarTitle {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  margin-right: 8px;
  font-family: var(--bun-font-display);
  font-size: 23px;
  font-weight: 800;
  font-stretch: 75%;
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--bun-fg);
}

html .BPNavBarTitle:hover {
  color: var(--bun-fg);
}

html .BPNavBarTitle-logo {
  height: 34px;
  width: auto;
  border-radius: 0;
  transition: transform 0.3s cubic-bezier(.22, 1, .36, 1);
}

html .BPNavBarTitle:hover .BPNavBarTitle-logo {
  transform: rotate(-10deg);
}

html .BPNavBarMenu {
  gap: 2px;
}

html .BPNavBarMenu a,
html .BPNavBarMenu .BPNavBarMenu-link,
html .BPNavBarMenu-group-button {
  display: inline-flex;
  align-items: center;
  height: 34px;
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 14.5px;
  font-weight: 500;
  color: var(--bun-fg-muted);
  transition: background-color 0.15s, color 0.15s;
}

html .BPNavBarMenu a:hover,
html .BPNavBarMenu .BPNavBarMenu-link:hover,
html .BPNavBarMenu-group-button:hover,
html .BPNavBarMenu a.is-active,
html .BPNavBarMenu-group.is-active > .BPNavBarMenu-group-button {
  background: var(--bun-subtle);
  color: var(--bun-fg);
}

html .BPNavBarMenu-group-items::before {
  background: var(--bun-canvas);
  border: 1px solid var(--bun-line);
  border-radius: var(--bun-radius-lg);
  box-shadow: none;
}

html .BPNavBarMenu-group-items a {
  height: auto;
  border-radius: 0;
  padding: 7px 14px;
  font-size: 14px;
}

html .BPNavBarSearch {
  flex: 1 1 auto;
  max-width: 26rem;
  height: 36px;
  margin-left: 8px;
  margin-right: auto;
  padding: 0 12px;
  gap: 10px;
  border: 1px solid var(--bun-line);
  border-radius: 0;
  background: var(--bun-canvas);
  color: var(--bun-fg-faint);
  font-size: 13.5px;
  transition: border-color 0.15s;
}

html .BPNavBarSearch:hover {
  border-color: var(--bun-rule);
  background: var(--bun-canvas);
}

html .BPNavBarSearch-icon {
  width: 16px;
  height: 16px;
  color: var(--bun-fg-faint);
}

html .BPNavBarSearch-label {
  flex: 1;
  text-align: left;
  color: var(--bun-fg-faint);
}

html .BPNavBarSearch-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  min-width: 18px;
  padding: 0 4px;
  border: 1px solid var(--bun-line);
  border-radius: 0;
  background: transparent;
  font-family: var(--bp-font-family-mono);
  font-size: 10.5px;
  font-weight: 400;
  line-height: 1;
  color: var(--bun-fg-faint);
}

html .BPSocialLinks {
  gap: 0;
  margin-left: 8px;
  padding: 0;
  border: 0;
}

html .BPSocialLinks a,
html .BPSocialLinks .theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 0;
  color: var(--bun-fg-muted);
  transition: color 0.15s;
}

html .BPSocialLinks a:hover,
html .BPSocialLinks .theme-toggle:hover {
  color: var(--bun-fg);
  background: transparent;
}

html .BPSocialLinks svg {
  width: 18px;
  height: 18px;
}

html .BPNavScreen {
  background: var(--bun-canvas);
}

/* Layout ------------------------------------------------------------------ */

html .BPDocContent {
  max-width: 768px;
}

/* Below 960px the sidebar is a drawer and the default layout already spans
 * the page, so Bun's geometry starts where the sidebar is docked. */
@media (min-width: 960px) {
  html .BPContent--doc {
    left: max(var(--bp-sidebar-width), calc((100vw - var(--bp-layout-max-width)) / 2 + var(--bp-sidebar-width)));
    right: max(0px, calc((100vw - var(--bp-layout-max-width)) / 2));
  }

  html .BPDoc {
    padding: 40px var(--bun-gutter) 96px;
  }
}

@media (min-width: 1280px) {
  html .BPContent.BPContent--doc {
    right: max(calc(var(--bun-aside-width) + var(--bun-gutter)), calc((100vw - var(--bp-layout-max-width)) / 2 + var(--bun-aside-width) + var(--bun-gutter))) !important;
  }

  html .BPDoc {
    padding: 40px 48px 96px var(--bun-gutter);
  }

  html .BPDocContent {
    max-width: 752px;
  }
}

/* Sidebar ----------------------------------------------------------------- */

html .BPSidebar {
  width: min(var(--bp-sidebar-width), 85vw);
  padding: 0;
  background: var(--bun-canvas);
  border-right: 1px solid var(--bun-line);
  scrollbar-width: thin;
  scrollbar-color: var(--bun-line-strong) transparent;
}

html .BPSidebar::-webkit-scrollbar {
  width: 6px;
}

html .BPSidebar::-webkit-scrollbar-thumb {
  background: var(--bun-line-strong);
  border-radius: 999px;
}

html .sidebar-content {
  padding: 24px 16px 40px 40px;
}

html .sidebar-section,
html .sidebar-section + .sidebar-section {
  margin: 0;
  padding: 0;
  border: 0;
}

html .sidebar-section + .sidebar-section {
  margin-top: 28px;
}

html .sidebar-section-toggle {
  padding: 0;
  margin: 0 0 8px;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 19.5px;
  color: var(--bun-fg);
}

html .sidebar-section-toggle:hover {
  color: var(--bun-fg);
}

html .sidebar-section-toggle .chevron {
  width: 12px;
  height: 12px;
  color: var(--bun-fg-faint);
}

/* Bun rules the list and lays the active page's rail over it. The list clips
 * (it animates open and shut), so each link draws its own stretch of the rule
 * rather than overlapping one the list draws. */
html .sidebar-items {
  margin: 0;
  padding: 0;
  border-left: 0;
}

html .sidebar-items > li {
  margin: 0;
  padding: 0;
}

html .BPSidebarItem-link,
html .BPSidebarGroup-link,
html .BPSidebarGroup-text {
  margin-left: 0;
  padding: 5px 8px 5px calc(16px + var(--bp-sidebar-depth, 0) * 12px);
  border-left: 1px solid var(--bun-line);
  border-radius: 0;
  background: transparent;
  font-size: 14px;
  line-height: 1.375;
  color: var(--bun-fg-muted);
  transition: color 0.15s, border-color 0.15s;
}

html .BPSidebarGroup-text,
html .BPSidebarGroup-link {
  color: var(--bun-fg);
  font-weight: 600;
}

html .BPSidebarItem-link:hover,
html .BPSidebarGroup-link:hover {
  background: transparent;
  color: var(--bun-fg);
  border-left-color: var(--bun-line-strong);
}

html .BPSidebarItem-link.is-active,
html .BPSidebarGroup-link.is-active {
  background: transparent;
  color: var(--bun-fg);
  font-weight: 600;
  border-left-color: var(--bun-accent);
  box-shadow: none;
}



/* Page header: breadcrumb and copy control on one row, the title under them. */

html .bp-page-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas: "title copy";
  align-items: start;
  gap: 0 16px;
  margin-bottom: 0;
}

html .bp-page-header.has-breadcrumb {
  grid-template-areas: "crumb copy" "title title";
}

html .bp-page-header > h1 { grid-area: title; }
html .bp-page-header > .bp-breadcrumb { grid-area: crumb; }
html .bp-page-header > .copy-page-dropdown { grid-area: copy; align-self: start; margin-top: -4px; }

html .bp-breadcrumb {
  margin: 0 0 12px;
  line-height: 1.5;
}

html .bp-doc .bp-breadcrumb ol {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 6px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--bun-fg-muted);
}

html .bp-doc .bp-breadcrumb-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 0;
}

html .bp-breadcrumb-item + .bp-breadcrumb-item::before {
  content: "\\203A";
  color: color-mix(in srgb, var(--bun-fg-faint) 70%, transparent);
}

html .bp-breadcrumb-item[aria-current="page"] {
  color: var(--bun-accent-strong);
}

html .bp-breadcrumb code {
  font-size: 0.92em;
}

/* Copy page: two square buttons sharing a hairline. */
html .copy-page-button-group {
  gap: 0;
}

html .copy-page-button {
  height: 32px;
  padding: 0 10px;
  gap: 8px;
  border: 1px solid var(--bun-line);
  border-radius: 0 !important;
  background: transparent;
  color: var(--bun-fg-muted);
  font-size: 13px;
  font-weight: 400;
  box-shadow: none;
  transition: border-color 0.15s, color 0.15s;
}

html .copy-page-button.copy-page-toggle {
  width: 32px;
  margin-left: -1px;
  padding: 0;
  justify-content: center;
}

html .copy-page-button:hover {
  position: relative;
  z-index: 1;
  border-color: var(--bun-rule);
  background: transparent;
  color: var(--bun-fg);
}

html .copy-page-menu {
  border: 1px solid var(--bun-line);
  border-radius: var(--bun-radius-lg);
  background: var(--bun-canvas);
  box-shadow: none;
}

html .copy-page-menu-item {
  border-radius: 0;
}

html .copy-page-menu-item:hover {
  background: var(--bun-subtle);
}

/* On this page ------------------------------------------------------------ */

html .BPDocAside {
  width: var(--bun-aside-width);
  padding: 40px 0 32px;
  right: max(var(--bun-gutter), calc((100vw - var(--bp-layout-max-width)) / 2 + var(--bun-gutter)));
  background: var(--bun-canvas);
}

html .outline-title {
  margin-bottom: 12px;
  font-family: var(--bp-font-family-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--bun-fg-faint);
}

html .page-toc {
  border-left: 1px solid var(--bun-line);
}

html .outline-marker {
  left: -1px;
  width: 1px;
  border-radius: 0;
  background-color: var(--bun-accent);
}

html .page-toc a {
  margin-left: -1px;
  padding: 4px 0 4px 16px;
  border-left: 1px solid transparent;
  font-size: 13px;
  line-height: 1.375;
  color: var(--bun-fg-faint);
  transition: color 0.15s, border-color 0.15s;
}

html .page-toc a.level-3 {
  padding-left: 28px;
}

html .page-toc a:hover {
  color: var(--bun-fg-muted);
  border-left-color: var(--bun-line-strong);
}

html .page-toc a.active {
  color: var(--bun-fg);
  font-weight: 400;
  border-left-color: transparent;
}

html .page-toc code {
  font-size: 0.92em;
}

html .bp-local-outline {
  border: 1px solid var(--bun-line);
  border-radius: var(--bun-radius-lg);
  background: var(--bun-canvas);
}

html .bp-local-outline-label {
  font-family: var(--bp-font-family-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--bun-fg-faint);
}

/* Previous / next --------------------------------------------------------- */

html .bp-pager {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 64px;
}

html .bp-pager-link {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  border: 1px solid var(--bun-line);
  border-radius: var(--bun-radius-lg);
  background: var(--bun-canvas);
  color: var(--bun-fg);
  text-decoration: none;
  transition: border-color 0.15s;
}

html .bp-pager-link:hover {
  border-color: var(--bun-line-strong);
}

html .bp-pager-next {
  align-items: flex-end;
  text-align: right;
}

html .bp-pager-label {
  font-family: var(--bp-font-family-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--bun-fg-faint);
}

html .bp-pager-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--bun-fg);
}

html .bp-pager-title svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  transition: transform 0.15s;
}

html .bp-pager-prev .bp-pager-title svg {
  transform: rotate(180deg);
}

html .bp-pager-prev:hover .bp-pager-title svg {
  transform: rotate(180deg) translateX(2px);
}

html .bp-pager-next:hover .bp-pager-title svg {
  transform: translateX(2px);
}

@media (max-width: 639px) {
  html .bp-pager {
    grid-template-columns: minmax(0, 1fr);
  }

  html .bp-pager-spacer {
    display: none;
  }
}

html .BPDocFooter {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--bun-line);
}

html .BPFooter {
  border-top: 1px solid var(--bun-line);
  background: var(--bun-canvas);
}

/* Narrow screens ---------------------------------------------------------- */

@media (max-width: 959px) {
  html .BPNavBar {
    padding: 0 20px;
    gap: 8px;
  }

  html .BPNavBarMenu {
    display: none;
  }

  /* On a phone the search is Bun's square icon button. */
  html .BPNavBarSearch {
    flex: 0 0 auto;
    width: 40px;
    height: 40px;
    margin-left: auto;
    margin-right: 0;
    padding: 0;
    justify-content: center;
    border-color: var(--bun-rule);
  }

  html .BPNavBarSearch-label,
  html .BPNavBarSearch-kbd {
    display: none;
  }

  html .BPNavBarHamburger {
    width: 40px;
    height: 40px;
    border: 1px solid var(--bun-rule);
    border-radius: 0;
    background: transparent;
    color: var(--bun-fg);
  }

  html .BPNavBarSearch-icon {
    width: 18px;
    height: 18px;
    color: var(--bun-fg);
  }

  html .BPDoc {
    padding: 32px 20px 80px;
  }

  html .sidebar-content {
    padding: 24px 20px 40px;
  }
}
`

/* -------------------------------------------------------------------------- */
/* Prose                                                                      */
/* -------------------------------------------------------------------------- */

const proseCSS = `
/* Bun theme: prose */
html .bp-doc {
  font-size: 16.48px;
  line-height: 1.75;
  color: color-mix(in srgb, var(--bun-fg) 88%, transparent);
}

html .bp-doc h1,
html .bp-doc h2,
html .bp-doc h3,
html .bp-doc h4,
html .bp-doc h5,
html .bp-doc h6 {
  color: var(--bun-fg);
}

html .bp-doc h1 {
  margin: 0;
  font-family: var(--bun-font-display);
  font-size: clamp(2.4rem, 4.4vw, 3.2rem);
  font-weight: 800;
  font-stretch: 75%;
  line-height: 0.92;
  letter-spacing: -0.02em;
  text-wrap: balance;
}

/* The paragraph under the title is the page's lead, as on bun.com. */
html .bp-doc .bp-page-header + p {
  max-width: 64ch;
  margin: 12px 0 32px;
  font-size: 1.05rem;
  line-height: 1.625;
  color: var(--bun-fg-muted);
  text-wrap: pretty;
}

html .bp-doc h2 {
  margin: 2.2em 0 1em;
  padding: 0 0 0.35em;
  border-top: 0;
  border-bottom: 1px solid var(--bun-line);
  font-family: var(--bun-font-display);
  font-size: 2.05em;
  font-weight: 800;
  font-stretch: 75%;
  line-height: 1.08;
  letter-spacing: -0.012em;
}

html .bp-doc h2 code {
  vertical-align: 0.1em;
  font-size: 0.68em;
}

html .bp-doc h3 {
  margin: 1.6em 0 0.6em;
  font-size: 1.22em;
  font-weight: 650;
  line-height: 1.6;
  letter-spacing: -0.02em;
}

html .bp-doc h4 {
  margin: 1.5em 0 0.5em;
  font-size: 1.05em;
  font-weight: 600;
  line-height: 1.6;
  letter-spacing: -0.01em;
}

html .bp-doc h2 + *,
html .bp-doc h3 + *,
html .bp-doc hr + * {
  margin-top: 0;
}

html .bp-doc p {
  margin: 0 0 1.25em;
  line-height: 1.75;
}

html .bp-doc strong {
  color: var(--bun-fg);
  font-weight: 600;
}

html .bp-doc a:not([class]) {
  color: var(--bun-fg);
  font-weight: 500;
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--bun-accent) 45%, transparent);
  text-decoration-thickness: 1.5px;
  text-underline-offset: 3px;
  transition: text-decoration-color 0.15s, color 0.15s;
}

html .bp-doc a:not([class]):hover {
  color: var(--bun-accent-strong);
  text-decoration-color: var(--bun-accent);
}

html .bp-doc ul,
html .bp-doc ol {
  margin: 1.25em 0;
  padding-left: 1.625em;
}

html .bp-doc ul { list-style: disc; }
html .bp-doc ol { list-style: decimal; }

html .bp-doc li {
  margin: 0.5em 0;
  padding-left: 0.375em;
}

html .bp-doc ul > li::marker {
  color: color-mix(in srgb, var(--bun-accent) 70%, transparent);
}

html .bp-doc ol > li::marker {
  color: var(--bun-fg-faint);
  font-weight: 400;
}

html .bp-doc hr {
  margin: 2.5em 0;
  border: 0;
  border-top: 1px solid var(--bun-line);
}

html .bp-doc blockquote {
  margin: 1.6em 0;
  padding: 0 0 0 1em;
  border-left: 3px solid color-mix(in srgb, var(--bun-accent) 50%, transparent);
  color: var(--bun-fg-muted);
  font-style: normal;
}

html .bp-doc blockquote > p {
  color: inherit;
}

html .bp-doc :not(pre) > code {
  padding: 0.12em 0.36em;
  border: 1px solid var(--bun-line);
  border-radius: 6px;
  background: var(--bun-code-bg);
  color: var(--bun-fg);
  font-size: 0.875em;
  font-weight: inherit;
  word-break: break-word;
}

html .bp-doc a:not([class]) > code {
  color: inherit;
}

html .bp-doc mark {
  background: var(--bun-accent-soft);
  color: var(--bun-fg);
}

html .bp-doc img,
html .bp-doc video {
  border-radius: var(--bun-radius);
}

/* Tables: open, ruled between rows, no outer frame. */
html .bp-doc .table-responsive {
  margin: 24px 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}

html .bp-doc .table-responsive > table {
  margin: 0;
}

html .bp-doc table {
  display: table;
  width: 100%;
  margin: 24px 0;
  border: 0;
  border-collapse: collapse;
  border-radius: 0;
  font-size: 0.92em;
  line-height: 1.71;
}

html .bp-doc :is(table, .enhanced-table) thead {
  border-bottom: 1px solid var(--bun-line);
  background: transparent;
}

html .bp-doc tr {
  border: 0;
  border-bottom: 1px solid var(--bun-line);
  background: transparent;
}

html .bp-doc tbody tr:last-child {
  border-bottom: 0;
}

html .bp-doc :is(table, .enhanced-table) tbody tr:nth-child(2n) {
  background: transparent;
}

html .bp-doc :is(table, .enhanced-table) tbody tr:hover {
  background: var(--bun-subtle);
}

html .bp-doc :is(table, .enhanced-table) :is(th, td) {
  padding: 0.57em 0.57em 0.57em 0;
  border: 0;
  text-align: left;
  vertical-align: top;
}

html .bp-doc :is(table, .enhanced-table) :is(th, td):last-child {
  padding-right: 0;
}

html .bp-doc :is(table, .enhanced-table) th {
  background: transparent;
  color: var(--bun-fg);
  font-size: inherit;
  font-weight: 600;
  vertical-align: bottom;
}

html .bp-doc :is(table, .enhanced-table) td {
  color: color-mix(in srgb, var(--bun-fg) 88%, transparent);
  border-bottom: 0;
}
`

/* -------------------------------------------------------------------------- */
/* Code                                                                       */
/* -------------------------------------------------------------------------- */

const FILE_ICON = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'black\' stroke-width=\'1.75\' stroke-linecap=\'square\'%3E%3Cpath d=\'M14 3H6v18h12V7z\'/%3E%3Cpath d=\'M14 3v4h4\'/%3E%3C/svg%3E")'
const TERMINAL_ICON = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'black\' stroke-width=\'1.75\' stroke-linecap=\'square\'%3E%3Cpath d=\'m5 8 4 4-4 4\'/%3E%3Cpath d=\'M12 16h7\'/%3E%3C/svg%3E")'
const SHELL_LANGS = ['bash', 'sh', 'shell', 'zsh', 'console', 'terminal', 'shellscript', 'fish', 'powershell', 'ps1']

function shellSelector(suffix: string): string {
  return SHELL_LANGS.map(lang => `html .bp-doc pre[data-lang="${lang}"]${suffix}`).join(',\n')
}

// One palette, written for whichever of light and dark is active: the token
// variables change with the palette, so the rules do not have to.
function tokenRules(scope: string): string {
  const at = `${scope} :is(.bp-doc, .BPHeroCode)`
  return `
${at} .token { color: var(--bun-sk-text) !important; }
${at} .token[class*='variable-parameter'],
${at} .token[class*='parameter'] { color: var(--bun-sk-param) !important; }
${at} .token[class*='entity-name-type'],
${at} .token[class*='entity-name-class'],
${at} .token[class*='support-type'],
${at} .token[class*='support-class'],
${at} .token[class*='entity-other-inherited'] { color: var(--bun-sk-type) !important; }
${at} .token[class*='entity-name-function'],
${at} .token[class*='support-function'],
${at} .token[class*='meta-function-call'],
${at} .token[class*='entity-other-attribute'] { color: var(--bun-sk-fn) !important; }
${at} .token[class*='constant'],
${at} .token[class*='support-constant'],
${at} .token[class*='variable-language'] { color: var(--bun-sk-const) !important; }
${at} .token[class*='keyword'],
${at} .token[class*='storage'],
${at} .token[class*='entity-name-tag'] { color: var(--bun-sk-keyword) !important; }
${at} .token[class*='string'],
${at} .token[class*='markup-inline-raw'] { color: var(--bun-sk-string) !important; }
${at} .token[class*='comment'] { color: var(--bun-sk-comment) !important; font-style: italic; }
${at} .token[class*='invalid'] { color: var(--bun-danger) !important; }`
}

const codeCSS = `
/* Bun theme: code */
html .bp-doc pre[data-lang],
html .bp-doc div[class*='language-'] {
  margin: 20px 0;
  padding: 0 0 14px;
  border: 1px solid var(--bun-line);
  border-radius: var(--bun-radius);
  background: var(--bun-code-bg);
  color: var(--bun-sk-text);
}

/* The base doc sheet forces a background on every pre, in both modes. */
html:root .bp-doc pre[data-lang],
html:root .bp-doc pre {
  background: var(--bun-code-bg) !important;
}

/* The file strip across the top: what the block is, as Bun labels it. */
html .bp-doc pre[data-lang]::before {
  content: attr(data-lang);
  position: sticky;
  left: 0;
  top: auto;
  right: auto;
  display: block;
  box-sizing: border-box;
  width: 100%;
  min-height: 34px;
  margin: 0 0 14px;
  padding: 0 48px 0 36px;
  border-bottom: 1px solid var(--bun-line);
  background-color: color-mix(in srgb, var(--bun-subtle) 70%, var(--bun-code-bg));
  font-family: var(--bp-font-family-mono);
  font-size: 12px;
  font-weight: 400;
  line-height: 34px;
  text-transform: none;
  color: var(--bun-fg-muted);
  opacity: 1;
  z-index: 2;
}

/* The icon is a mask so it takes the label's colour in either palette. */
html .bp-doc pre[data-lang]::after {
  content: "";
  position: absolute;
  top: 9px;
  left: 14px;
  width: 16px;
  height: 16px;
  background-color: var(--bun-fg-muted);
  -webkit-mask: ${FILE_ICON} center / contain no-repeat;
  mask: ${FILE_ICON} center / contain no-repeat;
  z-index: 3;
  pointer-events: none;
}

${shellSelector('::before')} {
  content: "terminal";
}

${shellSelector('::after')} {
  -webkit-mask-image: ${TERMINAL_ICON};
  mask-image: ${TERMINAL_ICON};
}

html .bp-doc pre[data-lang] code,
html .bp-doc [class*='language-'] code {
  padding: 0 48px 0 17.6px;
  font-size: 13.5px;
  line-height: 20px;
  color: var(--bun-sk-text);
}

html .bp-doc pre .line-number {
  color: var(--bun-fg-faint);
}

html .bp-doc pre code .highlighted {
  background: color-mix(in srgb, var(--bun-accent) 9%, transparent);
  box-shadow: inset 3px 0 0 var(--bun-accent);
}

html .bp-doc pre code .diff.add,
html .bp-doc pre code .diff-add {
  background: color-mix(in srgb, var(--bun-success) 14%, transparent);
}

html .bp-doc pre code .diff.remove,
html .bp-doc pre code .diff-remove {
  background: color-mix(in srgb, var(--bun-danger) 14%, transparent);
}

/* Copy: a quiet icon in the strip, always there. */
html .bp-doc pre .copy-code-button,
html .copy-code-button {
  top: 3px;
  right: 6px;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: var(--bun-radius);
  background: transparent;
  color: var(--bun-fg-faint);
  opacity: 1;
  transition: color 0.15s, background-color 0.15s;
}

html .copy-code-button:hover {
  background: color-mix(in srgb, var(--bun-fg) 6%, transparent);
  border: 0;
  color: var(--bun-fg);
}

html .copy-code-button.copied {
  color: var(--bun-success);
}

/* Tabs of code: one frame, and the strip holds the tabs. */
html .bp-doc .code-group {
  margin: 20px 0;
  border: 1px solid var(--bun-line);
  border-radius: var(--bun-radius);
  background: var(--bun-code-bg);
  overflow: hidden;
}

html .bp-doc .code-group-tabs {
  display: flex;
  margin: 0;
  padding: 0;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid var(--bun-line);
  border-radius: 0;
  background: var(--bun-subtle);
  box-shadow: none;
}

html.dark .bp-doc .code-group-tabs {
  background: color-mix(in srgb, var(--bun-canvas) 60%, transparent);
}

html .bp-doc .code-group-tab {
  position: relative;
  height: auto;
  margin: 0;
  padding: 9px 14px;
  border: 0;
  background: transparent;
  font-family: var(--bp-font-family-mono);
  font-size: 12.5px;
  font-weight: 400;
  line-height: 1.75;
  white-space: nowrap;
  color: var(--bun-fg-faint);
  transition: color 0.15s;
}

html .bp-doc .code-group-tab:hover,
html .bp-doc .code-group-tab.active {
  color: var(--bun-fg);
  background: transparent;
}

html .bp-doc .code-group-tab::after {
  content: none;
}

html .bp-doc .code-group-tab.active::after {
  content: "";
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: -1px;
  width: auto;
  height: 2px;
  border-radius: 2px;
  background: var(--bun-accent);
  transform: none;
}

html .bp-doc .code-group pre[data-lang] {
  margin: 0;
  padding-top: 14px;
  border: 0;
  border-radius: 0;
}

html .bp-doc .code-group pre[data-lang]::before,
html .bp-doc .code-group pre[data-lang]::after {
  content: none;
  display: none;
}

/* Syntax: Bun's palette, by scope, over whatever the highlighter wrote inline. */
${tokenRules('html')}
${tokenRules('html.dark')}
`

/* -------------------------------------------------------------------------- */
/* Callouts                                                                   */
/* -------------------------------------------------------------------------- */

const NOTE_ICON = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'black\' stroke-width=\'1.75\' stroke-linecap=\'square\'%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'9\'/%3E%3Cpath d=\'M12 11v6M12 7.5v.5\'/%3E%3C/svg%3E")'
const TIP_ICON = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'black\' stroke-width=\'1.75\' stroke-linecap=\'square\'%3E%3Cpath d=\'M9 18h6M10 21h4\'/%3E%3Cpath d=\'M12 3a6 6 0 0 0-3.5 10.9V15h7v-1.1A6 6 0 0 0 12 3z\'/%3E%3C/svg%3E")'
const WARNING_ICON = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'black\' stroke-width=\'1.75\' stroke-linecap=\'square\'%3E%3Cpath d=\'M12 3 2 20h20z\'/%3E%3Cpath d=\'M12 10v4M12 17v.5\'/%3E%3C/svg%3E")'
const DANGER_ICON = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'black\' stroke-width=\'1.75\' stroke-linecap=\'square\'%3E%3Cpath d=\'M8 3h8l5 5v8l-5 5H8l-5-5V8z\'/%3E%3Cpath d=\'M12 8v5M12 16v.5\'/%3E%3C/svg%3E")'

function callout(selectors: string[], color: string, icon: string): string {
  return `
${selectors.map(selector => `html .bp-doc ${selector}`).join(',\n')} {
  --bun-callout: var(${color});
  --bun-callout-icon: ${icon};
}`
}

const customBlockCSS = `
/* Bun theme: callouts */
html .bp-doc .custom-block,
html .bp-doc .github-alert {
  --bun-callout: var(--bun-info);
  --bun-callout-icon: ${NOTE_ICON};
  position: relative;
  margin: 20px 0;
  padding: 14px 16px 14px 44px;
  border: 1px solid color-mix(in srgb, var(--bun-callout) 30%, transparent);
  border-radius: var(--bun-radius-lg);
  background: color-mix(in srgb, var(--bun-callout) 6%, transparent);
  font-size: 94%;
  line-height: 1.625;
  color: color-mix(in srgb, var(--bun-fg) 90%, transparent);
}

html .bp-doc .custom-block::before,
html .bp-doc .github-alert::before {
  content: "";
  position: absolute;
  top: calc(14px + 0.32em);
  left: 16px;
  width: 16px;
  height: 16px;
  background-color: var(--bun-callout);
  -webkit-mask: var(--bun-callout-icon) center / contain no-repeat;
  mask: var(--bun-callout-icon) center / contain no-repeat;
}
${callout(['.custom-block.tip', '.github-alert-tip'], '--bun-success', TIP_ICON)}
${callout(['.custom-block.warning', '.github-alert-warning'], '--bun-warning', WARNING_ICON)}
${callout(['.custom-block.danger', '.custom-block.caution', '.github-alert-caution'], '--bun-danger', DANGER_ICON)}
${callout(['.github-alert-important'], '--bun-important', NOTE_ICON)}
${callout(['.custom-block.details'], '--bun-fg-muted', NOTE_ICON)}

html .bp-doc .custom-block-title,
html .bp-doc .github-alert-title {
  display: block;
  margin: 0 0 4px;
  font-size: inherit;
  font-weight: 600;
  line-height: inherit;
  text-transform: none;
  letter-spacing: 0;
  color: var(--bun-callout);
}

html .bp-doc .github-alert-icon {
  display: none;
}

/* A title that only names the type says what the icon already says. It stays
 * for screen readers. */
html .bp-doc .custom-block-title.is-default,
html .bp-doc .github-alert-title {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

html .bp-doc .github-alert-content > p:first-child {
  margin-top: 0;
}

html .bp-doc .custom-block p,
html .bp-doc .github-alert p {
  margin: 8px 0;
  color: inherit;
}

html .bp-doc .custom-block-content > :first-child,
html .bp-doc .github-alert-content > :first-child {
  margin-top: 0;
}

html .bp-doc .custom-block-content > :last-child,
html .bp-doc .github-alert-content > :last-child {
  margin-bottom: 0;
}

html .bp-doc .custom-block a,
html .bp-doc .github-alert a {
  color: var(--bun-fg);
}

html .bp-doc .custom-block :not(pre) > code,
html .bp-doc .github-alert :not(pre) > code {
  background: color-mix(in srgb, var(--bun-callout) 8%, var(--bun-canvas));
  border-color: color-mix(in srgb, var(--bun-callout) 22%, transparent);
  color: var(--bun-fg);
}

html .bp-doc .custom-block pre[data-lang] {
  margin: 12px 0;
}

html .bp-doc details.custom-block summary {
  font-weight: 600;
  color: var(--bun-fg);
  cursor: pointer;
}
`

/* -------------------------------------------------------------------------- */
/* Home                                                                       */
/* -------------------------------------------------------------------------- */

const homeCSS = `
/* Bun theme: home */
html .BPHero-name {
  font-family: var(--bp-font-family-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  line-height: 1.6;
  color: var(--bun-accent-strong);
  background: none;
  -webkit-text-fill-color: currentColor;
}

html .BPHero-text {
  font-family: var(--bun-font-display);
  font-weight: 800;
  font-stretch: 75%;
  letter-spacing: -0.02em;
  line-height: 0.95;
  color: var(--bun-fg);
}

html .BPHero-tagline {
  color: var(--bun-fg-muted);
  line-height: 1.6;
}

html .BPButton {
  border-radius: 0;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.005em;
  transition: background-color 0.15s, color 0.15s, border-color 0.15s;
}

html .BPButton:active {
  transform: translateY(1px);
}

/* The primary action is Bun's notched slab. */
html .BPButton-brand {
  clip-path: polygon(0 0, calc(100% - var(--bun-cut)) 0, 100% var(--bun-cut), 100% 100%, 0 100%);
}

html .BPButton-alt {
  border: 1px solid var(--bun-rule);
  background: var(--bun-canvas);
  color: var(--bun-fg);
}

html .BPButton-alt:hover {
  background: var(--bun-subtle);
}

html .BPFeature {
  border: 1px solid var(--bun-line);
  border-radius: var(--bun-radius-lg);
  background: var(--bun-canvas);
  box-shadow: none;
  transition: border-color 0.15s;
}

html .BPFeature:hover {
  border-color: var(--bun-accent);
}

html .BPFeature-icon {
  border: 0;
  border-radius: 0;
  background: transparent;
  color: var(--bun-accent);
}

html .BPFeature-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.375;
  color: var(--bun-fg);
}

html .BPFeature-details {
  font-size: 14px;
  line-height: 1.625;
  color: var(--bun-fg-muted);
}

html .BPFeature-link {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--bun-fg-muted);
}

html .BPFeature:hover .BPFeature-link {
  color: var(--bun-accent-strong);
}

html .BPHeroCode {
  border: 1px solid var(--bun-line);
  border-radius: var(--bun-radius);
  background: var(--bun-code-bg);
  box-shadow: none;
}

html .BPHeroCode-head {
  border-bottom: 1px solid var(--bun-line);
  background: var(--bun-subtle);
}

html .BPHeroCode-tab {
  font-family: var(--bp-font-family-mono);
  font-size: 12.5px;
  color: var(--bun-fg-faint);
}

html .BPHeroCode-tab.is-active {
  color: var(--bun-fg);
  box-shadow: inset 0 -2px 0 var(--bun-accent);
}

html .BPSearch-panel {
  border: 1px solid var(--bun-line);
  border-radius: var(--bun-radius-lg);
  box-shadow: none;
}
`

/**
 * Get all Bun theme CSS combined: the default theme, then the Bun layer.
 */
export function getBunThemeCSS(): string {
  return `${getVitePressThemeCSS()}
/* Bun Theme for BunPress (bun.com/docs) */
${varsCSS}
${baseCSS}
${proseCSS}
${codeCSS}
${customBlockCSS}
${homeCSS}
`
}

/** The Bun palette and tokens only. */
export function getBunVars(): string {
  return varsCSS
}

/** The Bun chrome and prose layer, without the default theme under it. */
export function getBunBase(): string {
  return `${baseCSS}\n${proseCSS}`
}

/** The Bun callout styles only. */
export function getBunCustomBlocks(): string {
  return customBlockCSS
}

/** The Bun code block, code group and syntax styles only. */
export function getBunCodeGroups(): string {
  return codeCSS
}

/** The Bun home page styles only. */
export function getBunExtras(): string {
  return homeCSS
}

export interface BunTheme {
  name: string
  getCSS: () => string
  getVars: () => string
  getBase: () => string
  getCustomBlocks: () => string
  getCodeGroups: () => string
  getExtras: () => string
}

const bunTheme: BunTheme = {
  name: 'bun',
  getCSS: getBunThemeCSS,
  getVars: getBunVars,
  getBase: getBunBase,
  getCustomBlocks: getBunCustomBlocks,
  getCodeGroups: getBunCodeGroups,
  getExtras: getBunExtras,
}

export default bunTheme
