/**
 * VitePress Theme for BunPress
 *
 * This theme provides VitePress-compatible styling for BunPress documentation sites.
 * It includes the same color palette, typography, and component styles as VitePress.
 */

// CSS Variables
const varsCSS = `/**
 * VitePress Theme for BunPress
 * Colors: Solid
 * -------------------------------------------------------------------------- */

:root {
  --bp-c-white: #ffffff;
  --bp-c-black: #000000;

  --bp-c-neutral: var(--bp-c-black);
  --bp-c-neutral-inverse: var(--bp-c-white);
}

.dark {
  --bp-c-neutral: var(--bp-c-white);
  --bp-c-neutral-inverse: var(--bp-c-black);
}

/**
 * Colors: Palette
 * -------------------------------------------------------------------------- */

:root {
  --bp-c-gray-1: #dddde3;
  --bp-c-gray-2: #e4e4e9;
  --bp-c-gray-3: #ebebef;
  --bp-c-gray-soft: rgba(142, 150, 170, 0.14);

  --bp-c-indigo-1: #3451b2;
  --bp-c-indigo-2: #3a5ccc;
  --bp-c-indigo-3: #5672cd;
  --bp-c-indigo-soft: rgba(100, 108, 255, 0.14);

  --bp-c-purple-1: #6f42c1;
  --bp-c-purple-2: #7e4cc9;
  --bp-c-purple-3: #8e5cd9;
  --bp-c-purple-soft: rgba(159, 122, 234, 0.14);

  --bp-c-green-1: #18794e;
  --bp-c-green-2: #299764;
  --bp-c-green-3: #30a46c;
  --bp-c-green-soft: rgba(16, 185, 129, 0.14);

  --bp-c-yellow-1: #915930;
  --bp-c-yellow-2: #946300;
  --bp-c-yellow-3: #9f6a00;
  --bp-c-yellow-soft: rgba(234, 179, 8, 0.14);

  --bp-c-red-1: #b8272c;
  --bp-c-red-2: #d5393e;
  --bp-c-red-3: #e0575b;
  --bp-c-red-soft: rgba(244, 63, 94, 0.14);

  --bp-c-sponsor: #db2777;
}

.dark {
  --bp-c-gray-1: #515c67;
  --bp-c-gray-2: #414853;
  --bp-c-gray-3: #32363f;
  --bp-c-gray-soft: rgba(101, 117, 133, 0.16);

  --bp-c-indigo-1: #a8b1ff;
  --bp-c-indigo-2: #5c73e7;
  --bp-c-indigo-3: #3e63dd;
  --bp-c-indigo-soft: rgba(100, 108, 255, 0.16);

  --bp-c-purple-1: #c8abfa;
  --bp-c-purple-2: #a879e6;
  --bp-c-purple-3: #8e5cd9;
  --bp-c-purple-soft: rgba(159, 122, 234, 0.16);

  --bp-c-green-1: #3dd68c;
  --bp-c-green-2: #30a46c;
  --bp-c-green-3: #298459;
  --bp-c-green-soft: rgba(16, 185, 129, 0.16);

  --bp-c-yellow-1: #f9b44e;
  --bp-c-yellow-2: #da8b17;
  --bp-c-yellow-3: #a46a0a;
  --bp-c-yellow-soft: rgba(234, 179, 8, 0.16);

  --bp-c-red-1: #f66f81;
  --bp-c-red-2: #f14158;
  --bp-c-red-3: #b62a3c;
  --bp-c-red-soft: rgba(244, 63, 94, 0.16);
}

/**
 * Colors: Background
 * -------------------------------------------------------------------------- */

:root {
  --bp-c-bg: #ffffff;
  --bp-c-bg-alt: #f6f6f7;
  --bp-c-bg-elv: #ffffff;
  --bp-c-bg-soft: #f6f6f7;
}

.dark {
  --bp-c-bg: #1b1b1f;
  --bp-c-bg-alt: #161618;
  --bp-c-bg-elv: #202127;
  --bp-c-bg-soft: #202127;
}

/**
 * Colors: Borders
 * -------------------------------------------------------------------------- */

:root {
  --bp-c-border: #c2c2c4;
  --bp-c-divider: #e2e2e3;
  --bp-c-gutter: #e2e2e3;
}

.dark {
  --bp-c-border: #3c3f44;
  --bp-c-divider: #2e2e32;
  --bp-c-gutter: #000000;
}

/**
 * Colors: Text
 * -------------------------------------------------------------------------- */

:root {
  --bp-c-text-1: rgba(60, 60, 67);
  --bp-c-text-2: rgba(60, 60, 67, 0.78);
  --bp-c-text-3: rgba(60, 60, 67, 0.56);
}

.dark {
  --bp-c-text-1: rgba(255, 255, 245, 0.86);
  --bp-c-text-2: rgba(235, 235, 245, 0.6);
  --bp-c-text-3: rgba(235, 235, 245, 0.38);
}

/**
 * Colors: Function
 * -------------------------------------------------------------------------- */

:root {
  --bp-c-default-1: var(--bp-c-gray-1);
  --bp-c-default-2: var(--bp-c-gray-2);
  --bp-c-default-3: var(--bp-c-gray-3);
  --bp-c-default-soft: var(--bp-c-gray-soft);

  --bp-c-brand-1: var(--bp-c-indigo-1);
  --bp-c-brand-2: var(--bp-c-indigo-2);
  --bp-c-brand-3: var(--bp-c-indigo-3);
  --bp-c-brand-soft: var(--bp-c-indigo-soft);

  --bp-c-brand: var(--bp-c-brand-1);

  --bp-c-tip-1: var(--bp-c-brand-1);
  --bp-c-tip-2: var(--bp-c-brand-2);
  --bp-c-tip-3: var(--bp-c-brand-3);
  --bp-c-tip-soft: var(--bp-c-brand-soft);

  --bp-c-note-1: var(--bp-c-brand-1);
  --bp-c-note-2: var(--bp-c-brand-2);
  --bp-c-note-3: var(--bp-c-brand-3);
  --bp-c-note-soft: var(--bp-c-brand-soft);

  --bp-c-success-1: var(--bp-c-green-1);
  --bp-c-success-2: var(--bp-c-green-2);
  --bp-c-success-3: var(--bp-c-green-3);
  --bp-c-success-soft: var(--bp-c-green-soft);

  --bp-c-important-1: var(--bp-c-purple-1);
  --bp-c-important-2: var(--bp-c-purple-2);
  --bp-c-important-3: var(--bp-c-purple-3);
  --bp-c-important-soft: var(--bp-c-purple-soft);

  --bp-c-warning-1: var(--bp-c-yellow-1);
  --bp-c-warning-2: var(--bp-c-yellow-2);
  --bp-c-warning-3: var(--bp-c-yellow-3);
  --bp-c-warning-soft: var(--bp-c-yellow-soft);

  --bp-c-danger-1: var(--bp-c-red-1);
  --bp-c-danger-2: var(--bp-c-red-2);
  --bp-c-danger-3: var(--bp-c-red-3);
  --bp-c-danger-soft: var(--bp-c-red-soft);

  --bp-c-caution-1: var(--bp-c-red-1);
  --bp-c-caution-2: var(--bp-c-red-2);
  --bp-c-caution-3: var(--bp-c-red-3);
  --bp-c-caution-soft: var(--bp-c-red-soft);
}

/**
 * Typography
 * -------------------------------------------------------------------------- */

:root {
  --bp-font-family-base: 'Inter', ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  --bp-font-family-mono: ui-monospace, 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
}

/**
 * Shadows
 * -------------------------------------------------------------------------- */

:root {
  --bp-shadow-1: 0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
  --bp-shadow-2: 0 3px 12px rgba(0, 0, 0, 0.07), 0 1px 4px rgba(0, 0, 0, 0.07);
  --bp-shadow-3: 0 12px 32px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08);
  --bp-shadow-4: 0 14px 44px rgba(0, 0, 0, 0.12), 0 3px 9px rgba(0, 0, 0, 0.12);
  --bp-shadow-5: 0 18px 56px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.16);
}

/**
 * Z-indexes
 * -------------------------------------------------------------------------- */

:root {
  --bp-z-index-footer: 10;
  --bp-z-index-local-nav: 20;
  --bp-z-index-nav: 30;
  --bp-z-index-layout-top: 40;
  --bp-z-index-backdrop: 50;
  --bp-z-index-sidebar: 60;
}

@media (min-width: 960px) {
  :root {
    --bp-z-index-sidebar: 25;
  }
}

/**
 * Layouts
 * -------------------------------------------------------------------------- */

:root {
  --bp-layout-max-width: 1440px;
}

/**
 * Component: Header Anchor
 * -------------------------------------------------------------------------- */

:root {
  --bp-header-anchor-symbol: '#';
}

/**
 * Component: Code
 * -------------------------------------------------------------------------- */

:root {
  --bp-code-line-height: 1.7;
  --bp-code-font-size: 0.875em;
  --bp-code-color: var(--bp-c-brand-1);
  --bp-code-link-color: var(--bp-c-brand-1);
  --bp-code-link-hover-color: var(--bp-c-brand-2);
  --bp-code-bg: var(--bp-c-default-soft);

  --bp-code-block-color: var(--bp-c-text-2);
  --bp-code-block-bg: var(--bp-c-bg-alt);
  --bp-code-block-divider-color: var(--bp-c-gutter);

  --bp-code-lang-color: var(--bp-c-text-3);

  --bp-code-line-highlight-color: var(--bp-c-default-soft);
  --bp-code-line-number-color: var(--bp-c-text-3);

  --bp-code-line-diff-add-color: var(--bp-c-success-soft);
  --bp-code-line-diff-add-symbol-color: var(--bp-c-success-1);

  --bp-code-line-diff-remove-color: var(--bp-c-danger-soft);
  --bp-code-line-diff-remove-symbol-color: var(--bp-c-danger-1);

  --bp-code-line-warning-color: var(--bp-c-warning-soft);
  --bp-code-line-error-color: var(--bp-c-danger-soft);

  --bp-code-copy-code-border-color: var(--bp-c-divider);
  --bp-code-copy-code-bg: var(--bp-c-bg-soft);
  --bp-code-copy-code-hover-border-color: var(--bp-c-divider);
  --bp-code-copy-code-hover-bg: var(--bp-c-bg);
  --bp-code-copy-code-active-text: var(--bp-c-text-2);

  --bp-code-tab-divider: var(--bp-code-block-divider-color);
  --bp-code-tab-text-color: var(--bp-c-text-2);
  --bp-code-tab-bg: var(--bp-code-block-bg);
  --bp-code-tab-hover-text-color: var(--bp-c-text-1);
  --bp-code-tab-active-text-color: var(--bp-c-text-1);
  --bp-code-tab-active-bar-color: var(--bp-c-brand-1);
}

/**
 * Component: Button
 * -------------------------------------------------------------------------- */

:root {
  --bp-button-brand-border: transparent;
  --bp-button-brand-text: var(--bp-c-white);
  --bp-button-brand-bg: var(--bp-c-brand-3);
  --bp-button-brand-hover-border: transparent;
  --bp-button-brand-hover-text: var(--bp-c-white);
  --bp-button-brand-hover-bg: var(--bp-c-brand-2);
  --bp-button-brand-active-border: transparent;
  --bp-button-brand-active-text: var(--bp-c-white);
  --bp-button-brand-active-bg: var(--bp-c-brand-1);

  --bp-button-alt-border: transparent;
  --bp-button-alt-text: var(--bp-c-text-1);
  --bp-button-alt-bg: var(--bp-c-default-3);
  --bp-button-alt-hover-border: transparent;
  --bp-button-alt-hover-text: var(--bp-c-text-1);
  --bp-button-alt-hover-bg: var(--bp-c-default-2);
  --bp-button-alt-active-border: transparent;
  --bp-button-alt-active-text: var(--bp-c-text-1);
  --bp-button-alt-active-bg: var(--bp-c-default-1);

  --bp-button-sponsor-border: var(--bp-c-text-2);
  --bp-button-sponsor-text: var(--bp-c-text-2);
  --bp-button-sponsor-bg: transparent;
  --bp-button-sponsor-hover-border: var(--bp-c-sponsor);
  --bp-button-sponsor-hover-text: var(--bp-c-sponsor);
  --bp-button-sponsor-hover-bg: transparent;
  --bp-button-sponsor-active-border: var(--bp-c-sponsor);
  --bp-button-sponsor-active-text: var(--bp-c-sponsor);
  --bp-button-sponsor-active-bg: transparent;
}

/**
 * Component: Custom Block
 * -------------------------------------------------------------------------- */

:root {
  --bp-custom-block-font-size: 14px;
  --bp-custom-block-code-font-size: 13px;

  --bp-custom-block-info-border: transparent;
  --bp-custom-block-info-text: var(--bp-c-text-1);
  --bp-custom-block-info-bg: var(--bp-c-default-soft);
  --bp-custom-block-info-code-bg: var(--bp-c-default-soft);

  --bp-custom-block-note-border: transparent;
  --bp-custom-block-note-text: var(--bp-c-text-1);
  --bp-custom-block-note-bg: var(--bp-c-default-soft);
  --bp-custom-block-note-code-bg: var(--bp-c-default-soft);

  --bp-custom-block-tip-border: transparent;
  --bp-custom-block-tip-text: var(--bp-c-text-1);
  --bp-custom-block-tip-bg: var(--bp-c-tip-soft);
  --bp-custom-block-tip-code-bg: var(--bp-c-tip-soft);

  --bp-custom-block-important-border: transparent;
  --bp-custom-block-important-text: var(--bp-c-text-1);
  --bp-custom-block-important-bg: var(--bp-c-important-soft);
  --bp-custom-block-important-code-bg: var(--bp-c-important-soft);

  --bp-custom-block-warning-border: transparent;
  --bp-custom-block-warning-text: var(--bp-c-text-1);
  --bp-custom-block-warning-bg: var(--bp-c-warning-soft);
  --bp-custom-block-warning-code-bg: var(--bp-c-warning-soft);

  --bp-custom-block-danger-border: transparent;
  --bp-custom-block-danger-text: var(--bp-c-text-1);
  --bp-custom-block-danger-bg: var(--bp-c-danger-soft);
  --bp-custom-block-danger-code-bg: var(--bp-c-danger-soft);

  --bp-custom-block-caution-border: transparent;
  --bp-custom-block-caution-text: var(--bp-c-text-1);
  --bp-custom-block-caution-bg: var(--bp-c-caution-soft);
  --bp-custom-block-caution-code-bg: var(--bp-c-caution-soft);

  --bp-custom-block-details-border: var(--bp-custom-block-info-border);
  --bp-custom-block-details-text: var(--bp-custom-block-info-text);
  --bp-custom-block-details-bg: var(--bp-custom-block-info-bg);
  --bp-custom-block-details-code-bg: var(--bp-custom-block-info-code-bg);
}

/**
 * Component: Nav
 * -------------------------------------------------------------------------- */

:root {
  --bp-nav-height: 64px;
  --bp-nav-bg-color: var(--bp-c-bg);
  --bp-nav-screen-bg-color: var(--bp-c-bg);
  --bp-nav-logo-height: 24px;
}

/**
 * Component: Sidebar
 * -------------------------------------------------------------------------- */

:root {
  --bp-sidebar-width: 272px;
  --bp-sidebar-bg-color: var(--bp-c-bg-alt);
}

/**
 * Colors Backdrop
 * -------------------------------------------------------------------------- */

:root {
  --bp-backdrop-bg-color: rgba(0, 0, 0, 0.6);
}

/**
 * Component: Home
 * -------------------------------------------------------------------------- */

:root {
  --bp-home-hero-name-color: var(--bp-c-brand-1);
  --bp-home-hero-name-background: transparent;
  --bp-home-hero-image-background-image: none;
  --bp-home-hero-image-filter: none;
}

/**
 * Component: Badge
 * -------------------------------------------------------------------------- */

:root {
  --bp-badge-info-border: transparent;
  --bp-badge-info-text: var(--bp-c-text-2);
  --bp-badge-info-bg: var(--bp-c-default-soft);

  --bp-badge-tip-border: transparent;
  --bp-badge-tip-text: var(--bp-c-tip-1);
  --bp-badge-tip-bg: var(--bp-c-tip-soft);

  --bp-badge-warning-border: transparent;
  --bp-badge-warning-text: var(--bp-c-warning-1);
  --bp-badge-warning-bg: var(--bp-c-warning-soft);

  --bp-badge-danger-border: transparent;
  --bp-badge-danger-text: var(--bp-c-danger-1);
  --bp-badge-danger-bg: var(--bp-c-danger-soft);
}`

// Base CSS
const baseCSS = `/**
 * VitePress Theme for BunPress - Base Styles
 * -------------------------------------------------------------------------- */

@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-delay: -1ms !important;
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    background-attachment: initial !important;
    scroll-behavior: auto !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
  }
}

*,
::before,
::after {
  box-sizing: border-box;
}

html {
  line-height: 1.4;
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
}

html.dark {
  color-scheme: dark;
}

body {
  margin: 0;
  width: 100%;
  min-width: 320px;
  min-height: 100vh;
  line-height: 24px;
  font-family: var(--bp-font-family-base);
  font-size: 16px;
  font-weight: 400;
  color: var(--bp-c-text-1);
  background-color: var(--bp-c-bg);
  font-synthesis: style;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

main {
  display: block;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 0;
  line-height: 24px;
  font-size: 16px;
  font-weight: 400;
}

p {
  margin: 0;
}

strong,
b {
  font-weight: 600;
}

a,
area,
button,
[role='button'],
input,
label,
select,
summary,
textarea {
  touch-action: manipulation;
}

a {
  color: inherit;
  text-decoration: inherit;
}

ol,
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

blockquote {
  margin: 0;
}

pre,
code,
kbd,
samp {
  font-family: var(--bp-font-family-mono);
}

img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block;
}

figure {
  margin: 0;
}

img,
video {
  max-width: 100%;
  height: auto;
}

button,
input,
optgroup,
select,
textarea {
  border: 0;
  padding: 0;
  line-height: inherit;
  color: inherit;
}

/**
 * VPDoc Styles - Documentation Content
 * -------------------------------------------------------------------------- */

.bp-doc h1,
.bp-doc h2,
.bp-doc h3,
.bp-doc h4,
.bp-doc h5,
.bp-doc h6 {
  position: relative;
  font-weight: 600;
  outline: none;
}

.bp-doc h1 {
  letter-spacing: -0.02em;
  line-height: 40px;
  font-size: 28px;
}

.bp-doc h2 {
  margin: 48px 0 16px;
  border-top: 1px solid var(--bp-c-divider);
  padding-top: 24px;
  letter-spacing: -0.02em;
  line-height: 32px;
  font-size: 24px;
}

.bp-doc h3 {
  margin: 32px 0 0;
  letter-spacing: -0.01em;
  line-height: 28px;
  font-size: 20px;
}

.bp-doc h4 {
  margin: 24px 0 0;
  letter-spacing: -0.01em;
  line-height: 24px;
  font-size: 18px;
}

.bp-doc .header-anchor {
  position: absolute;
  top: 0;
  left: 0;
  margin-left: -0.87em;
  font-weight: 500;
  user-select: none;
  opacity: 0;
  text-decoration: none;
  transition: color 0.25s, opacity 0.25s;
}

.bp-doc .header-anchor:before {
  content: var(--bp-header-anchor-symbol);
}

.bp-doc h1:hover .header-anchor,
.bp-doc h1 .header-anchor:focus,
.bp-doc h2:hover .header-anchor,
.bp-doc h2 .header-anchor:focus,
.bp-doc h3:hover .header-anchor,
.bp-doc h3 .header-anchor:focus,
.bp-doc h4:hover .header-anchor,
.bp-doc h4 .header-anchor:focus,
.bp-doc h5:hover .header-anchor,
.bp-doc h5 .header-anchor:focus,
.bp-doc h6:hover .header-anchor,
.bp-doc h6 .header-anchor:focus {
  opacity: 1;
}

@media (min-width: 768px) {
  .bp-doc h1 {
    letter-spacing: -0.02em;
    line-height: 40px;
    font-size: 32px;
  }
}

.bp-doc h2 .header-anchor {
  top: 24px;
}

.bp-doc p,
.bp-doc summary {
  margin: 16px 0;
}

.bp-doc p {
  line-height: 28px;
}

.bp-doc blockquote {
  margin: 16px 0;
  border-left: 2px solid var(--bp-c-divider);
  padding-left: 16px;
  transition: border-color 0.5s;
  color: var(--bp-c-text-2);
}

.bp-doc blockquote > p {
  margin: 0;
  font-size: 16px;
  transition: color 0.5s;
}

.bp-doc a {
  font-weight: 500;
  color: var(--bp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.25s, opacity 0.25s;
}

.bp-doc a:hover {
  color: var(--bp-c-brand-2);
}

.bp-doc strong {
  font-weight: 600;
}

.bp-doc ul,
.bp-doc ol {
  padding-left: 1.25rem;
  margin: 16px 0;
}

.bp-doc ul {
  list-style: disc;
}

.bp-doc ol {
  list-style: decimal;
}

.bp-doc li + li {
  margin-top: 8px;
}

.bp-doc li > ol,
.bp-doc li > ul {
  margin: 8px 0 0;
}

.bp-doc table {
  display: block;
  border-collapse: collapse;
  margin: 20px 0;
  overflow-x: auto;
}

.bp-doc tr {
  background-color: var(--bp-c-bg);
  border-top: 1px solid var(--bp-c-divider);
  transition: background-color 0.5s;
}

.bp-doc tr:nth-child(2n) {
  background-color: var(--bp-c-bg-soft);
}

.bp-doc th,
.bp-doc td {
  border: 1px solid var(--bp-c-divider);
  padding: 8px 16px;
}

.bp-doc th {
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: var(--bp-c-text-2);
  background-color: var(--bp-c-bg-soft);
}

.bp-doc td {
  font-size: 14px;
}

.bp-doc hr {
  margin: 16px 0;
  border: none;
  border-top: 1px solid var(--bp-c-divider);
}

/* Inline code */
.bp-doc :not(pre, h1, h2, h3, h4, h5, h6) > code {
  font-size: var(--bp-code-font-size);
  color: var(--bp-code-color);
}

.bp-doc :not(pre) > code {
  border-radius: 4px;
  padding: 3px 6px;
  background-color: var(--bp-code-bg);
  transition: color 0.25s, background-color 0.5s;
}

.bp-doc a > code {
  color: var(--bp-code-link-color);
}

.bp-doc a:hover > code {
  color: var(--bp-code-link-hover-color);
}

.bp-doc h1 > code,
.bp-doc h2 > code,
.bp-doc h3 > code,
.bp-doc h4 > code {
  font-size: 0.9em;
}

/* Code blocks */
.bp-doc div[class*='language-'],
.bp-block {
  position: relative;
  margin: 16px -24px;
  background-color: var(--bp-code-block-bg);
  overflow-x: auto;
  transition: background-color 0.5s;
}

@media (min-width: 640px) {
  .bp-doc div[class*='language-'],
  .bp-block {
    border-radius: 8px;
    margin: 16px 0;
  }
}

.bp-doc [class*='language-'] pre,
.bp-doc [class*='language-'] code {
  tab-size: 4;
}

.bp-doc [class*='language-'] pre {
  position: relative;
  z-index: 1;
  margin: 0;
  padding: 20px 0;
  background: transparent;
  overflow-x: auto;
  text-align: left;
}

.bp-doc [class*='language-'] code {
  display: block;
  padding: 0 24px;
  width: fit-content;
  min-width: 100%;
  line-height: var(--bp-code-line-height);
  font-size: var(--bp-code-font-size);
  color: var(--bp-code-block-color);
  transition: color 0.5s;
}

.bp-doc [class*='language-'] code .highlighted {
  background-color: var(--bp-code-line-highlight-color);
  transition: background-color 0.5s;
  margin: 0 -24px;
  padding: 0 24px;
  width: calc(100% + 2 * 24px);
  display: inline-block;
}

.bp-doc [class*='language-'] code .highlighted.error {
  background-color: var(--bp-code-line-error-color);
}

.bp-doc [class*='language-'] code .highlighted.warning {
  background-color: var(--bp-code-line-warning-color);
}

.bp-doc [class*='language-'] code .diff {
  transition: background-color 0.5s;
  margin: 0 -24px;
  padding: 0 24px;
  width: calc(100% + 2 * 24px);
  display: inline-block;
}

.bp-doc [class*='language-'] code .diff::before {
  position: absolute;
  left: 10px;
}

.bp-doc [class*='language-'] code .diff.remove {
  background-color: var(--bp-code-line-diff-remove-color);
  opacity: 0.7;
}

.bp-doc [class*='language-'] code .diff.remove::before {
  content: '-';
  color: var(--bp-code-line-diff-remove-symbol-color);
}

.bp-doc [class*='language-'] code .diff.add {
  background-color: var(--bp-code-line-diff-add-color);
}

.bp-doc [class*='language-'] code .diff.add::before {
  content: '+';
  color: var(--bp-code-line-diff-add-symbol-color);
}

/* Line numbers */
.bp-doc div[class*='language-'].line-numbers-mode {
  padding-left: 32px;
}

.bp-doc .line-numbers-wrapper {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 3;
  border-right: 1px solid var(--bp-code-block-divider-color);
  padding-top: 20px;
  width: 32px;
  text-align: center;
  font-family: var(--bp-font-family-mono);
  line-height: var(--bp-code-line-height);
  font-size: var(--bp-code-font-size);
  color: var(--bp-code-line-number-color);
  transition: border-color 0.5s, color 0.5s;
}

/* Language label */
.bp-doc [class*='language-'] > span.lang {
  position: absolute;
  top: 2px;
  right: 8px;
  z-index: 2;
  font-size: 12px;
  font-weight: 500;
  user-select: none;
  color: var(--bp-code-lang-color);
  transition: color 0.4s, opacity 0.4s;
}`

// Custom Block CSS
const customBlockCSS = `/**
 * VitePress Theme for BunPress - Custom Blocks
 * -------------------------------------------------------------------------- */

.custom-block {
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 16px 16px 8px;
  line-height: 24px;
  font-size: var(--bp-custom-block-font-size);
  color: var(--bp-c-text-2);
}

.custom-block.info {
  border-color: var(--bp-custom-block-info-border);
  color: var(--bp-custom-block-info-text);
  background-color: var(--bp-custom-block-info-bg);
}

.custom-block.tip {
  border-color: var(--bp-custom-block-tip-border);
  color: var(--bp-custom-block-tip-text);
  background-color: var(--bp-custom-block-tip-bg);
}

.custom-block.warning {
  border-color: var(--bp-custom-block-warning-border);
  color: var(--bp-custom-block-warning-text);
  background-color: var(--bp-custom-block-warning-bg);
}

.custom-block.danger {
  border-color: var(--bp-custom-block-danger-border);
  color: var(--bp-custom-block-danger-text);
  background-color: var(--bp-custom-block-danger-bg);
}

.custom-block-title {
  font-weight: 600;
}

.custom-block p + p {
  margin: 8px 0;
}

.custom-block.details summary {
  margin: 0 0 8px;
  font-weight: 700;
  cursor: pointer;
  user-select: none;
}

.custom-block a {
  color: inherit;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: opacity 0.25s;
}

.custom-block a:hover {
  opacity: 0.75;
}

.custom-block code {
  font-size: var(--bp-custom-block-code-font-size);
}

/**
 * GitHub-Flavored Alerts (VitePress style)
 * -------------------------------------------------------------------------- */

.github-alert {
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 16px 16px 8px;
  line-height: 24px;
  font-size: var(--bp-custom-block-font-size);
  margin: 16px 0;
}

.github-alert-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 8px;
}

.github-alert-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

.github-alert-content {
  line-height: 24px;
}

.github-alert-content p {
  margin: 8px 0;
}

/* Note Alert */
.github-alert-note {
  border-color: var(--bp-custom-block-note-border);
  color: var(--bp-custom-block-note-text);
  background-color: var(--bp-custom-block-note-bg);
}

.github-alert-note .github-alert-title {
  color: var(--bp-c-brand-1);
}

/* Tip Alert */
.github-alert-tip {
  border-color: var(--bp-custom-block-tip-border);
  color: var(--bp-custom-block-tip-text);
  background-color: var(--bp-custom-block-tip-bg);
}

.github-alert-tip .github-alert-title {
  color: var(--bp-c-tip-1);
}

/* Warning Alert */
.github-alert-warning {
  border-color: var(--bp-custom-block-warning-border);
  color: var(--bp-custom-block-warning-text);
  background-color: var(--bp-custom-block-warning-bg);
}

.github-alert-warning .github-alert-title {
  color: var(--bp-c-warning-1);
}

/* Caution Alert */
.github-alert-caution {
  border-color: var(--bp-custom-block-caution-border);
  color: var(--bp-custom-block-caution-text);
  background-color: var(--bp-custom-block-caution-bg);
}

.github-alert-caution .github-alert-title {
  color: var(--bp-c-caution-1);
}`

// Code Group CSS
const codeGroupCSS = `/**
 * VitePress Theme for BunPress - Code Groups
 * -------------------------------------------------------------------------- */

.bp-code-group {
  margin-top: 16px;
}

.bp-code-group .tabs,
.code-group-tabs {
  position: relative;
  display: flex;
  margin-right: -24px;
  margin-left: -24px;
  padding: 0 12px;
  background-color: var(--bp-code-tab-bg);
  overflow-x: auto;
  overflow-y: hidden;
  box-shadow: inset 0 -1px var(--bp-code-tab-divider);
}

@media (min-width: 640px) {
  .bp-code-group .tabs,
  .code-group-tabs {
    margin-right: 0;
    margin-left: 0;
    border-radius: 8px 8px 0 0;
  }
}

.bp-code-group .tabs label,
.code-group-tab {
  position: relative;
  display: inline-block;
  border-bottom: 1px solid transparent;
  padding: 0 12px;
  line-height: 48px;
  font-size: 14px;
  font-weight: 500;
  color: var(--bp-code-tab-text-color);
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.25s;
  background: transparent;
  border: none;
  font-family: inherit;
}

.bp-code-group .tabs label::after,
.code-group-tab::after {
  position: absolute;
  right: 8px;
  bottom: -1px;
  left: 8px;
  z-index: 1;
  height: 2px;
  border-radius: 2px;
  content: '';
  background-color: transparent;
  transition: background-color 0.25s;
}

.bp-code-group label:hover,
.code-group-tab:hover {
  color: var(--bp-code-tab-hover-text-color);
}

.bp-code-group input:checked + label,
.code-group-tab.active {
  color: var(--bp-code-tab-active-text-color);
}

.bp-code-group input:checked + label::after,
.code-group-tab.active::after {
  background-color: var(--bp-code-tab-active-bar-color);
}

.bp-code-group div[class*='language-'],
.code-group-panel,
.bp-block {
  display: none;
  margin-top: 0 !important;
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
}

.bp-code-group div[class*='language-'].active,
.code-group-panel.active,
.bp-block.active {
  display: block;
}

.bp-block,
.code-group-panel {
  padding: 20px 24px;
}

/* Code group container */
.code-group {
  margin: 16px 0;
  border: 1px solid var(--bp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.code-group-panels {
  position: relative;
}

.code-group-panel pre {
  margin: 0;
  border-radius: 0;
  border: none;
}`

/**
 * Get all VitePress theme CSS combined
 */
export function getVitePressThemeCSS(): string {
  return `
/* VitePress Theme for BunPress */
${varsCSS}
${baseCSS}
${customBlockCSS}
${codeGroupCSS}
`
}

/**
 * Get VitePress theme CSS variables only
 */
export function getVitePressVars(): string {
  return varsCSS
}

/**
 * Get VitePress base styles only
 */
export function getVitePressBase(): string {
  return baseCSS
}

/**
 * Get VitePress custom block styles only
 */
export function getVitePressCustomBlocks(): string {
  return customBlockCSS
}

/**
 * Get VitePress code group styles only
 */
export function getVitePressCodeGroups(): string {
  return codeGroupCSS
}

export interface VitePressTheme {
  name: string
  getCSS: () => string
  getVars: () => string
  getBase: () => string
  getCustomBlocks: () => string
  getCodeGroups: () => string
}

const vitePressTheme: VitePressTheme = {
  name: 'vitepress',
  getCSS: getVitePressThemeCSS,
  getVars: getVitePressVars,
  getBase: getVitePressBase,
  getCustomBlocks: getVitePressCustomBlocks,
  getCodeGroups: getVitePressCodeGroups,
}

export default vitePressTheme
