/**
 * VitePress Theme for BunPress
 *
 * This theme provides VitePress-compatible styling for BunPress documentation sites.
 * It includes the same color palette, typography, and component styles as VitePress.
 * Based on VitePress source code for pixel-perfect compatibility.
 */

// CSS Variables - Matches VitePress vars.css exactly
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
 * Colors: Palette - Light/Dark specific
 * -------------------------------------------------------------------------- */

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
 * Note: Using solid colors like VitePress for better consistency
 * -------------------------------------------------------------------------- */

:root {
  --bp-c-text-1: #3c3c43;
  --bp-c-text-2: #67676c;
  --bp-c-text-3: #929295;
}

.dark {
  --bp-c-text-1: #dfdfd6;
  --bp-c-text-2: #98989f;
  --bp-c-text-3: #6a6a71;
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
  font-optical-sizing: auto;
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

  --bp-code-lang-color: var(--bp-c-text-2);

  --bp-code-line-highlight-color: var(--bp-c-default-soft);
  --bp-code-line-number-color: var(--bp-c-text-2);

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
  --bp-code-copy-copied-text-content: 'Copied';

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

  /* The *-border colour is drawn only on the leading edge (see .custom-block),
   * so it carries the block's identity — hence a solid accent, not transparent.
   * Info/note are neutral, so they take a mid-grey: --bp-c-default-1 is a
   * near-white tint that vanishes against the block's own soft background. */
  --bp-custom-block-info-border: var(--bp-c-text-3);
  --bp-custom-block-info-text: var(--bp-c-text-1);
  --bp-custom-block-info-bg: var(--bp-c-default-soft);
  --bp-custom-block-info-code-bg: var(--bp-c-default-soft);

  /* note carries a brand-coloured title and icon, so its rail matches those
   * rather than the neutral background it shares with info. */
  --bp-custom-block-note-border: var(--bp-c-note-1);
  --bp-custom-block-note-text: var(--bp-c-text-1);
  --bp-custom-block-note-bg: var(--bp-c-default-soft);
  --bp-custom-block-note-code-bg: var(--bp-c-default-soft);

  --bp-custom-block-tip-border: var(--bp-c-tip-1);
  --bp-custom-block-tip-text: var(--bp-c-text-1);
  --bp-custom-block-tip-bg: var(--bp-c-tip-soft);
  --bp-custom-block-tip-code-bg: var(--bp-c-tip-soft);

  --bp-custom-block-important-border: var(--bp-c-important-1);
  --bp-custom-block-important-text: var(--bp-c-text-1);
  --bp-custom-block-important-bg: var(--bp-c-important-soft);
  --bp-custom-block-important-code-bg: var(--bp-c-important-soft);

  --bp-custom-block-warning-border: var(--bp-c-warning-1);
  --bp-custom-block-warning-text: var(--bp-c-text-1);
  --bp-custom-block-warning-bg: var(--bp-c-warning-soft);
  --bp-custom-block-warning-code-bg: var(--bp-c-warning-soft);

  --bp-custom-block-danger-border: var(--bp-c-danger-1);
  --bp-custom-block-danger-text: var(--bp-c-text-1);
  --bp-custom-block-danger-bg: var(--bp-c-danger-soft);
  --bp-custom-block-danger-code-bg: var(--bp-c-danger-soft);

  --bp-custom-block-caution-border: var(--bp-c-caution-1);
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
}

/**
 * Icons - Matches VitePress icons.css exactly
 * -------------------------------------------------------------------------- */

:root {
  /* clipboard - matches VitePress exactly */
  --bp-icon-copy: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='rgba(128,128,128,1)' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'%3E%3Crect width='8' height='4' x='8' y='2' rx='1' ry='1'/%3E%3Cpath d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/%3E%3C/g%3E%3C/svg%3E");
  /* clipboard-check - matches VitePress exactly */
  --bp-icon-copied: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='rgba(128,128,128,1)' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'%3E%3Crect width='8' height='4' x='8' y='2' rx='1' ry='1'/%3E%3Cpath d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/%3E%3Cpath d='m9 14l2 2l4-4'/%3E%3C/g%3E%3C/svg%3E");
  --bp-icon-external: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M0 0h24v24H0V0z' fill='none'/%3E%3Cpath d='M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5H9z'/%3E%3C/svg%3E");
}

/**
 * Icon Classes - Matches VitePress .vpi-* icons
 * -------------------------------------------------------------------------- */

[class^='bpi-'],
[class*=' bpi-'],
.bp-icon {
  width: 1em;
  height: 1em;
}

[class^='bpi-'].bg,
[class*=' bpi-'].bg,
.bp-icon.bg {
  background-size: 100% 100%;
  background-color: transparent;
}

[class^='bpi-']:not(.bg),
[class*=' bpi-']:not(.bg),
.bp-icon:not(.bg) {
  -webkit-mask: var(--icon) no-repeat;
  mask: var(--icon) no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  background-color: currentColor;
  color: inherit;
}

.bpi-align-left {
  --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 12H3m14 6H3M21 6H3'/%3E%3C/svg%3E");
}

.bpi-arrow-right,
.bpi-arrow-down,
.bpi-arrow-left,
.bpi-arrow-up {
  --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 12h14m-7-7l7 7l-7 7'/%3E%3C/svg%3E");
}

.bpi-chevron-right,
.bpi-chevron-down,
.bpi-chevron-left,
.bpi-chevron-up {
  --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m9 18l6-6l-6-6'/%3E%3C/svg%3E");
}

.bpi-chevron-down,
.bpi-arrow-down {
  transform: rotate(90deg);
}

.bpi-chevron-left,
.bpi-arrow-left {
  transform: rotate(180deg);
}

.bpi-chevron-up,
.bpi-arrow-up {
  transform: rotate(-90deg);
}

.bpi-square-pen {
  --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'%3E%3Cpath d='M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'/%3E%3Cpath d='M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z'/%3E%3C/g%3E%3C/svg%3E");
}

.bpi-plus {
  --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 12h14m-7-7v14'/%3E%3C/svg%3E");
}

.bpi-sun {
  --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='4'/%3E%3Cpath d='M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41'/%3E%3C/g%3E%3C/svg%3E");
}

.bpi-moon {
  --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 3a6 6 0 0 0 9 9a9 9 0 1 1-9-9'/%3E%3C/svg%3E");
}

.bpi-more-horizontal {
  --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='1'/%3E%3Ccircle cx='19' cy='12' r='1'/%3E%3Ccircle cx='5' cy='12' r='1'/%3E%3C/g%3E%3C/svg%3E");
}

.bpi-languages {
  --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m5 8l6 6m-7 0l6-6l2-3M2 5h12M7 2h1m14 20l-5-10l-5 10m2-4h6'/%3E%3C/svg%3E");
}

.bpi-heart {
  --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2c-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'/%3E%3C/svg%3E");
}

.bpi-search {
  --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.6'%3E%3Cpath d='m21 21l-4.34-4.34'/%3E%3Ccircle cx='11' cy='11' r='8' stroke-width='1.4'/%3E%3C/g%3E%3C/svg%3E");
}

.bpi-layout-list {
  --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'%3E%3Crect width='7' height='7' x='3' y='3' rx='1'/%3E%3Crect width='7' height='7' x='3' y='14' rx='1'/%3E%3Cpath d='M14 4h7m-7 5h7m-7 6h7m-7 5h7'/%3E%3C/g%3E%3C/svg%3E");
}

.bpi-delete {
  --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm2 4l6 6m0-6l-6 6'/%3E%3C/svg%3E");
}

.bpi-corner-down-left {
  --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'%3E%3Cpath d='M20 4v7a4 4 0 0 1-4 4H4'/%3E%3Cpath d='m9 10l-5 5l5 5'/%3E%3C/g%3E%3C/svg%3E");
}`

// Base CSS - Matches VitePress base.css exactly
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

button {
  padding: 0;
  font-family: inherit;
  background-color: transparent;
  background-image: none;
}

button:enabled,
[role='button']:enabled {
  cursor: pointer;
}

button:focus,
button:focus-visible {
  outline: 1px dotted;
  outline: 4px auto -webkit-focus-ring-color;
}

button:focus:not(:focus-visible) {
  outline: none !important;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
}

table {
  border-collapse: collapse;
}

input {
  background-color: transparent;
}

input:-ms-input-placeholder,
textarea:-ms-input-placeholder {
  color: var(--bp-c-text-3);
}

input::-ms-input-placeholder,
textarea::-ms-input-placeholder {
  color: var(--bp-c-text-3);
}

input::placeholder,
textarea::placeholder {
  color: var(--bp-c-text-3);
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}

textarea {
  resize: vertical;
}

select {
  -webkit-appearance: none;
}

fieldset {
  margin: 0;
  padding: 0;
}

h1,
h2,
h3,
h4,
h5,
h6,
li,
p {
  overflow-wrap: break-word;
}

vite-error-overlay {
  z-index: 9999;
}

mjx-container {
  overflow-x: auto;
}

mjx-container > svg {
  display: inline-block;
  margin: auto;
}

/**
 * Utility Classes
 * -------------------------------------------------------------------------- */

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  white-space: nowrap;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  overflow: hidden;
}

/**
 * BPDoc Styles - Documentation Content
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
  /* Anchor jumps — from the outline, the sidebar or an external deep link —
   * otherwise land the heading flush against the top edge of the scroll
   * container, with no separation from the chrome above it. */
  scroll-margin-top: 24px;
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

.bp-doc h5 {
  margin: 16px 0 0;
  font-size: 16px;
}

.bp-doc h6 {
  margin: 16px 0 0;
  font-size: 14px;
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

/**
 * Paragraph and inline elements
 * -------------------------------------------------------------------------- */

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

/* Zeroing every paragraph margin ran a multi-paragraph quote together as if
 * it were one block of prose. */
.bp-doc blockquote > p + p {
  margin-top: 16px;
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

/**
 * Lists
 * -------------------------------------------------------------------------- */

/* Markers hang in the gutter (\`outside\`) so wrapped lines stay flush with the
 * first line — the single biggest readability win for multi-line bullets. The
 * indent is wide enough for two-digit ordered markers without clipping. */
.bp-doc ul,
.bp-doc ol {
  padding-left: 1.5rem;
  margin: 16px 0;
  list-style-position: outside;
}

.bp-doc ul {
  list-style-type: disc;
}

.bp-doc ol {
  list-style-type: decimal;
}

.bp-doc li {
  margin: 6px 0;
  line-height: 1.75;
}

.bp-doc li::marker {
  color: var(--bp-c-text-3);
}

.bp-doc ol > li::marker {
  font-variant-numeric: tabular-nums;
}

/* A nested list belongs to its parent item, so it hugs it rather than
 * inheriting the full inter-item gap. */
.bp-doc li > ol,
.bp-doc li > ul {
  margin: 6px 0 0;
  padding-left: 1.5rem;
}

.bp-doc ul ul {
  list-style-type: circle;
}

.bp-doc ul ul ul {
  list-style-type: square;
}

/* Loose lists (blank lines between items) wrap each item's text in a <p>.
 * Without this the paragraph's 16px margins double the list's spacing. */
.bp-doc li > p {
  margin: 0;
}

.bp-doc li > p + p {
  margin-top: 12px;
}

/* Block content inside an item stays indented with the item, and never
 * bleeds full-width the way a top-level code block does. */
.bp-doc li > pre,
.bp-doc li > div[class*='language-'],
.bp-doc li > pre[data-lang],
.bp-doc li > blockquote,
.bp-doc li > .table-responsive,
.bp-doc li > .custom-block {
  margin: 12px 0;
}

/* Task list styles */
.bp-doc .task-list {
  list-style: none;
  padding-left: 0;
}

/* A list of task items has checkboxes where the markers would be, so the
 * marker gutter is dead space. Scoped with :has() so a list that merely
 * contains one task item keeps its indent for the plain items. */
.bp-doc ul:has(> .task-list-item) {
  padding-left: 0;
  list-style: none;
}

.bp-doc .task-list-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

/* .task-list-item-checkbox is what Bun.markdown emits; .task-list-checkbox is
 * kept for content that ships its own task-list markup. */
.bp-doc .task-list-item-checkbox,
.bp-doc .task-list-checkbox {
  /* Nudged down to sit on the first line's cap height rather than its top. */
  margin: 0.3em 0 0;
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  accent-color: var(--bp-c-brand-1);
  cursor: default;
}

.bp-doc .task-list-item input[type="checkbox"]:checked + span,
.bp-doc .task-list-item:has(input:checked) {
  color: var(--bp-c-text-2);
}

/**
 * Table
 * -------------------------------------------------------------------------- */

/* The scroll container owns overflow, so the table itself stays a real table.
 * (\`display: block\` on <table> collapses column sizing — the table shrinks to
 * its content instead of filling the row, and cell widths stop balancing.) */
.bp-doc .table-responsive {
  margin: 20px 0;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  border: 1px solid var(--bp-c-divider);
  border-radius: 8px;
  /* Clip the corner radius against the header's background fill. */
  background-color: var(--bp-c-bg);
}

.bp-doc table {
  display: table;
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 14px;
  line-height: 1.6;
}

/* Inside a scroll wrapper the wrapper supplies the outer spacing and frame. */
.bp-doc .table-responsive > table {
  margin: 0;
  border: none;
}

.bp-doc tr {
  background-color: transparent;
  transition: background-color 0.25s;
}

.bp-doc tbody tr:nth-child(2n) {
  background-color: var(--bp-c-bg-soft);
}

.bp-doc th,
.bp-doc td {
  /* Row rules only — a full grid double-draws against the wrapper border and
   * makes dense config tables read as noise. */
  border-bottom: 1px solid var(--bp-c-divider);
  padding: 10px 16px;
  text-align: left;
  vertical-align: top;
}

.bp-doc thead th {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--bp-c-text-2);
  background-color: var(--bp-c-bg-soft);
  border-bottom: 1px solid var(--bp-c-divider);
  white-space: nowrap;
}

/* Last row sits flush against the wrapper's own bottom border. */
.bp-doc tbody tr:last-child > th,
.bp-doc tbody tr:last-child > td {
  border-bottom: none;
}

.bp-doc td {
  font-size: 14px;
  color: var(--bp-c-text-1);
}

/* Long identifiers (\`preserveDirectoryStructure\`, \`Record<string, string>\`)
 * must not dictate column widths. \`anywhere\` — unlike \`break-word\` — also
 * lowers the cell's intrinsic minimum, which is what lets the auto table
 * algorithm hand the spare width to the prose column instead. */
.bp-doc td > code,
.bp-doc th > code {
  white-space: normal;
  overflow-wrap: anywhere;
}

/* Narrow screens: a multi-column table squeezed into a phone width degenerates
 * into one word per line. Give it a readable floor and let the wrapper scroll
 * horizontally instead — scrolling a table beats shredding it. */
@media (max-width: 767px) {
  .bp-doc .table-responsive > table {
    min-width: 38rem;
  }

  .bp-doc thead th {
    white-space: normal;
  }

  .bp-doc th,
  .bp-doc td {
    padding: 10px 12px;
  }
}

/* Alignment from GFM's \`:---:\` / \`---:\` syntax must win over the default. */
.bp-doc th[align='center'],
.bp-doc td[align='center'],
.bp-doc th[style*='center'],
.bp-doc td[style*='center'] {
  text-align: center;
}

.bp-doc th[align='right'],
.bp-doc td[align='right'],
.bp-doc th[style*='right'],
.bp-doc td[style*='right'] {
  text-align: right;
}

/**
 * Decorational elements
 * -------------------------------------------------------------------------- */

.bp-doc hr {
  margin: 16px 0;
  border: none;
  border-top: 1px solid var(--bp-c-divider);
}

/**
 * Inline code
 * -------------------------------------------------------------------------- */

.bp-doc :not(pre, h1, h2, h3, h4, h5, h6) > code {
  font-size: var(--bp-code-font-size);
  color: var(--bp-code-color);
}

.bp-doc :not(pre) > code {
  border-radius: 4px;
  padding: 3px 6px;
  background-color: var(--bp-code-bg);
  transition: color 0.25s, background-color 0.5s;
  /* Without clone, a code span that wraps loses its padding and rounding on
   * the broken edges, so a wrapped identifier reads as ragged half-boxes. */
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}

/* Inline code sits on a text baseline, so it must not add leading of its own
 * — otherwise a paragraph containing code is spaced wider than its neighbours. */
.bp-doc p > code,
.bp-doc li > code,
.bp-doc td > code,
.bp-doc th > code {
  line-height: 1.4;
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

/**
 * Code blocks
 * -------------------------------------------------------------------------- */

/* Inset, not full-bleed. The old \`margin: 16px -24px\` hard-coded the content
 * container's padding: once that padding changed on small screens the bleed
 * overshot it, hanging the block 8px off each edge and leaving the content
 * pane with a phantom horizontal scroll. Inset also matches how every other
 * block element here behaves (containers, tables, alerts). */
.bp-doc div[class*='language-'],
.bp-doc pre[data-lang],
.bp-block {
  position: relative;
  margin: 16px 0;
  border-radius: 8px;
  background-color: var(--bp-code-block-bg);
  overflow-x: auto;
  transition: background-color 0.5s;
}

/* Wrapper divs that belong to one code group are pulled together. Bare
 * \`pre[data-lang]\` siblings are NOT a group — they are independent examples,
 * and the negative margin made consecutive blocks overlap into one slab. */
.bp-doc div[class*='language-'] + div[class*='language-'],
.bp-doc div[class$='-api'] + div[class*='language-'],
.bp-doc div[class*='language-'] + div[class$='-api'] > div[class*='language-'] {
  margin-top: -8px;
}

.bp-doc [class*='language-'] pre,
.bp-doc [class*='language-'] code,
.bp-doc pre[data-lang],
.bp-doc pre[data-lang] code {
  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;
}

.bp-doc [class*='language-'] pre,
.bp-doc pre[data-lang] {
  position: relative;
  z-index: 1;
  padding: 20px 0;
  overflow-x: auto;
  text-align: left;
}

/* A pre nested in a language wrapper is not the block — the wrapper is — so it
 * contributes neither margin nor background of its own. A bare pre[data-lang]
 * IS the block and must keep the margin set above; zeroing it here (the rule
 * this splits out of) is what let consecutive blocks run together. */
.bp-doc [class*='language-'] pre {
  margin: 0;
  background: transparent;
}

.bp-doc [class*='language-'] code,
.bp-doc pre[data-lang] code {
  display: block;
  padding: 0 24px;
  width: fit-content;
  min-width: 100%;
  line-height: var(--bp-code-line-height);
  font-size: var(--bp-code-font-size);
  color: var(--bp-code-block-color);
  transition: color 0.5s;
}

/* Marked rows bleed through the code element's 24px gutters so the band spans
 * the full block, not just the text column. min-width (rather than width) keeps
 * a line longer than the block from being clipped mid-band when it scrolls. */
.bp-doc [class*='language-'] code :is(.highlighted, .diff, .diff-add, .diff-remove, .has-error, .has-warning),
.bp-doc pre[data-lang] code :is(.highlighted, .diff, .diff-add, .diff-remove, .has-error, .has-warning) {
  display: inline-block;
  margin: 0 -24px;
  padding: 0 24px;
  min-width: calc(100% + 2 * 24px);
  transition: background-color 0.5s;
}

.bp-doc [class*='language-'] code .highlighted,
.bp-doc pre[data-lang] code .highlighted {
  background-color: var(--bp-code-line-highlight-color);
}

.bp-doc [class*='language-'] code .highlighted.error,
.bp-doc pre[data-lang] code .highlighted.error {
  background-color: var(--bp-code-line-error-color);
}

.bp-doc [class*='language-'] code .highlighted.warning,
.bp-doc pre[data-lang] code .highlighted.warning {
  background-color: var(--bp-code-line-warning-color);
}

/* Focus lines: unfocused rows blur back until the block is hovered.
 * The renderer marks them \`.dimmed\` (see processCodeBlock) — the upstream
 * \`:not(.has-focus)\` form never matched this markup. */
.bp-doc [class*='language-'] .line.dimmed,
.bp-doc pre[data-lang] .line.dimmed {
  filter: blur(0.095rem);
  opacity: 0.7;
  transition: filter 0.35s, opacity 0.35s;
}

.bp-doc [class*='language-']:hover .line.dimmed,
.bp-doc pre[data-lang]:hover .line.dimmed {
  filter: blur(0);
  opacity: 1;
}

/* Both class spellings: \`.diff.remove\` is the upstream form, \`.diff-remove\`
 * is what processCodeBlock emits. */
.bp-doc [class*='language-'] code :is(.diff.remove, .diff-remove),
.bp-doc pre[data-lang] code :is(.diff.remove, .diff-remove) {
  background-color: var(--bp-code-line-diff-remove-color);
}

.bp-doc [class*='language-'] code :is(.diff.remove, .diff-remove)::before,
.bp-doc pre[data-lang] code :is(.diff.remove, .diff-remove)::before {
  content: '-';
  color: var(--bp-code-line-diff-remove-symbol-color);
}

.bp-doc [class*='language-'] code :is(.diff.add, .diff-add),
.bp-doc pre[data-lang] code :is(.diff.add, .diff-add) {
  background-color: var(--bp-code-line-diff-add-color);
}

.bp-doc [class*='language-'] code :is(.diff.add, .diff-add)::before,
.bp-doc pre[data-lang] code :is(.diff.add, .diff-add)::before {
  content: '+';
  color: var(--bp-code-line-diff-add-symbol-color);
}

/* The +/- glyph lives in the 24px gutter the row bleeds into. */
.bp-doc [class*='language-'] code :is(.diff, .diff-add, .diff-remove)::before,
.bp-doc pre[data-lang] code :is(.diff, .diff-add, .diff-remove)::before {
  position: absolute;
  left: 8px;
}

.bp-doc [class*='language-'] code :is(.has-error, .highlighted.error),
.bp-doc pre[data-lang] code :is(.has-error, .highlighted.error) {
  background-color: var(--bp-code-line-error-color);
}

.bp-doc [class*='language-'] code :is(.has-warning, .highlighted.warning),
.bp-doc pre[data-lang] code :is(.has-warning, .highlighted.warning) {
  background-color: var(--bp-code-line-warning-color);
}

/* Line numbers */
.bp-doc div[class*='language-'].line-numbers-mode,
.bp-doc pre[data-lang].line-numbers-mode {
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

/* Copy button */
.bp-doc [class*='language-'] > button.copy,
.bp-doc pre[data-lang] > button.copy {
  direction: ltr;
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 3;
  border: 1px solid var(--bp-code-copy-code-border-color);
  border-radius: 4px;
  width: 40px;
  height: 40px;
  background-color: var(--bp-code-copy-code-bg);
  opacity: 0;
  cursor: pointer;
  background-image: var(--bp-icon-copy);
  background-position: 50%;
  background-size: 20px;
  background-repeat: no-repeat;
  transition: border-color 0.25s, background-color 0.25s, opacity 0.25s;
}

.bp-doc [class*='language-']:hover > button.copy,
.bp-doc [class*='language-'] > button.copy:focus,
.bp-doc pre[data-lang]:hover > button.copy,
.bp-doc pre[data-lang] > button.copy:focus {
  opacity: 1;
}

.bp-doc [class*='language-'] > button.copy:hover,
.bp-doc [class*='language-'] > button.copy.copied,
.bp-doc pre[data-lang] > button.copy:hover,
.bp-doc pre[data-lang] > button.copy.copied {
  border-color: var(--bp-code-copy-code-hover-border-color);
  background-color: var(--bp-code-copy-code-hover-bg);
}

.bp-doc [class*='language-'] > button.copy.copied,
.bp-doc pre[data-lang] > button.copy.copied {
  border-radius: 0 4px 4px 0;
  background-image: var(--bp-icon-copied);
}

.bp-doc [class*='language-'] > button.copy.copied::before,
.bp-doc pre[data-lang] > button.copy.copied::before {
  position: relative;
  top: -1px;
  transform: translateX(calc(-100% - 1px));
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid var(--bp-code-copy-code-hover-border-color);
  border-right: 0;
  border-radius: 4px 0 0 4px;
  padding: 0 10px;
  width: fit-content;
  height: 40px;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: var(--bp-code-copy-code-active-text);
  background-color: var(--bp-code-copy-code-hover-bg);
  white-space: nowrap;
  content: var(--bp-code-copy-copied-text-content);
}

/* Language label */
.bp-doc [class*='language-'] > span.lang,
.bp-doc pre[data-lang]::before {
  position: absolute;
  top: 2px;
  right: 8px;
  z-index: 2;
  font-size: 12px;
  font-weight: 500;
  user-select: none;
  color: var(--bp-code-lang-color);
  transition: color 0.4s, opacity 0.4s;
}

.bp-doc pre[data-lang]::before {
  content: attr(data-lang);
}

.bp-doc [class*='language-']:hover > button.copy + span.lang,
.bp-doc [class*='language-'] > button.copy:focus + span.lang {
  opacity: 0;
}

/**
 * External links
 * -------------------------------------------------------------------------- */

:is(.bp-external-link-icon, .bp-doc a[href*='://'], .bp-doc a[target='_blank']):not(:is(.no-icon, svg a, :has(img, svg)))::after {
  display: inline-block;
  margin-top: -1px;
  margin-left: 4px;
  width: 11px;
  height: 11px;
  background: currentColor;
  color: var(--bp-c-text-3);
  flex-shrink: 0;
  --icon: var(--bp-icon-external);
  -webkit-mask-image: var(--icon);
  mask-image: var(--icon);
}

.bp-external-link-icon::after {
  content: '';
}

.external-link-icon-enabled :is(.bp-doc a[href*='://'], .bp-doc a[target='_blank']):not(:is(.no-icon, svg a, :has(img, svg)))::after {
  content: '';
  color: currentColor;
}

/**
 * Component: Team - BPTeamMembers
 * -------------------------------------------------------------------------- */

.bp-doc .BPTeamMembers {
  margin-top: 24px;
}

.bp-doc .BPTeamMembers.small.count-1 .container {
  margin: 0 !important;
  max-width: calc((100% - 24px) / 2) !important;
}

.bp-doc .BPTeamMembers.small.count-2 .container,
.bp-doc .BPTeamMembers.small.count-3 .container {
  max-width: 100% !important;
}

.bp-doc .BPTeamMembers.medium.count-1 .container {
  margin: 0 !important;
  max-width: calc((100% - 24px) / 2) !important;
}

/**
 * Custom block code group tabs
 * -------------------------------------------------------------------------- */

.bp-doc .custom-block .bp-code-group .tabs {
  margin: 0;
  border-radius: 8px 8px 0 0;
}`

// Custom Block CSS - Matches VitePress custom-block.css
const customBlockCSS = `/**
 * VitePress Theme for BunPress - Custom Blocks
 * -------------------------------------------------------------------------- */

.custom-block {
  /* Accent lives on the leading edge only — the other sides stay zero-width so
   * a variant's \`border-color\` can't paint a full outline. The tint alone is
   * easy to miss when scanning; a 4px rail reads at any zoom level. */
  border: 0 solid transparent;
  border-left-width: 4px;
  border-radius: 8px;
  padding: 14px 16px;
  line-height: 24px;
  font-size: var(--bp-custom-block-font-size);
  color: var(--bp-c-text-2);
}

.custom-block.info {
  border-color: var(--bp-custom-block-info-border);
  color: var(--bp-custom-block-info-text);
  background-color: var(--bp-custom-block-info-bg);
}

.custom-block.info a,
.custom-block.info code {
  color: var(--bp-c-brand-1);
}

.custom-block.info a:hover,
.custom-block.info a:hover > code {
  color: var(--bp-c-brand-2);
}

.custom-block.info code {
  background-color: var(--bp-custom-block-info-code-bg);
}

.custom-block.note {
  border-color: var(--bp-custom-block-note-border);
  color: var(--bp-custom-block-note-text);
  background-color: var(--bp-custom-block-note-bg);
}

.custom-block.note a,
.custom-block.note code {
  color: var(--bp-c-brand-1);
}

.custom-block.note a:hover,
.custom-block.note a:hover > code {
  color: var(--bp-c-brand-2);
}

.custom-block.note code {
  background-color: var(--bp-custom-block-note-code-bg);
}

.custom-block.tip {
  border-color: var(--bp-custom-block-tip-border);
  color: var(--bp-custom-block-tip-text);
  background-color: var(--bp-custom-block-tip-bg);
}

.custom-block.tip a,
.custom-block.tip code {
  color: var(--bp-c-tip-1);
}

.custom-block.tip a:hover,
.custom-block.tip a:hover > code {
  color: var(--bp-c-tip-2);
}

.custom-block.tip code {
  background-color: var(--bp-custom-block-tip-code-bg);
}

.custom-block.important {
  border-color: var(--bp-custom-block-important-border);
  color: var(--bp-custom-block-important-text);
  background-color: var(--bp-custom-block-important-bg);
}

.custom-block.important a,
.custom-block.important code {
  color: var(--bp-c-important-1);
}

.custom-block.important a:hover,
.custom-block.important a:hover > code {
  color: var(--bp-c-important-2);
}

.custom-block.important code {
  background-color: var(--bp-custom-block-important-code-bg);
}

.custom-block.warning {
  border-color: var(--bp-custom-block-warning-border);
  color: var(--bp-custom-block-warning-text);
  background-color: var(--bp-custom-block-warning-bg);
}

.custom-block.warning a,
.custom-block.warning code {
  color: var(--bp-c-warning-1);
}

.custom-block.warning a:hover,
.custom-block.warning a:hover > code {
  color: var(--bp-c-warning-2);
}

.custom-block.warning code {
  background-color: var(--bp-custom-block-warning-code-bg);
}

.custom-block.danger {
  border-color: var(--bp-custom-block-danger-border);
  color: var(--bp-custom-block-danger-text);
  background-color: var(--bp-custom-block-danger-bg);
}

.custom-block.danger a,
.custom-block.danger code {
  color: var(--bp-c-danger-1);
}

.custom-block.danger a:hover,
.custom-block.danger a:hover > code {
  color: var(--bp-c-danger-2);
}

.custom-block.danger code {
  background-color: var(--bp-custom-block-danger-code-bg);
}

.custom-block.caution {
  border-color: var(--bp-custom-block-caution-border);
  color: var(--bp-custom-block-caution-text);
  background-color: var(--bp-custom-block-caution-bg);
}

.custom-block.caution a,
.custom-block.caution code {
  color: var(--bp-c-caution-1);
}

.custom-block.caution a:hover,
.custom-block.caution a:hover > code {
  color: var(--bp-c-caution-2);
}

.custom-block.caution code {
  background-color: var(--bp-custom-block-caution-code-bg);
}

.custom-block.details {
  border-color: var(--bp-custom-block-details-border);
  color: var(--bp-custom-block-details-text);
  background-color: var(--bp-custom-block-details-bg);
}

.custom-block.details a {
  color: var(--bp-c-brand-1);
}

.custom-block.details a:hover,
.custom-block.details a:hover > code {
  color: var(--bp-c-brand-2);
}

.custom-block.details code {
  background-color: var(--bp-custom-block-details-code-bg);
}

.custom-block-title {
  margin-bottom: 6px;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

/* The title supplies the block's leading margin, so the first body paragraph
 * must not add one on top of it. */
.custom-block-title + * {
  margin-top: 0;
}

.custom-block p + p {
  margin: 8px 0;
}

/* The native disclosure triangle is unstyleable and sits at a different size
 * and colour in every engine, so it is replaced with a chevron that matches
 * the rest of the chrome. */
.custom-block.details summary,
.bp-doc .custom-block.details summary {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-weight: 700;
  cursor: pointer;
  user-select: none;
  list-style: none;
}

.custom-block.details summary::-webkit-details-marker {
  display: none;
}

.custom-block.details summary::marker {
  content: '';
}

.custom-block.details summary::before {
  content: '';
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  background-color: currentColor;
  transition: transform 0.2s ease;
  --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 18l6-6-6-6'/%3E%3C/svg%3E");
  -webkit-mask-image: var(--icon);
  mask-image: var(--icon);
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

.custom-block.details[open] summary::before {
  transform: rotate(90deg);
}

.custom-block.details summary:focus-visible {
  outline: 2px solid var(--bp-c-brand-1);
  outline-offset: 2px;
  border-radius: 3px;
}

/* Body content only gains its top margin once the block is open. */
.bp-doc .custom-block.details[open] summary {
  margin-bottom: 8px;
}

.custom-block.details summary + p {
  margin: 8px 0;
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

.custom-block.custom-block th,
.custom-block.custom-block blockquote > p {
  font-size: var(--bp-custom-block-font-size);
  color: inherit;
}

/* Custom blocks in vp-doc context */
.bp-doc .custom-block {
  margin: 16px 0;
}

.bp-doc .custom-block p {
  margin: 8px 0;
  line-height: 24px;
}

.bp-doc .custom-block p:first-child {
  margin: 0;
}

.bp-doc .custom-block div[class*='language-'],
.bp-doc .custom-block pre[data-lang] {
  margin: 8px 0 !important;
  border-radius: 8px;
}

.bp-doc .custom-block div[class*='language-'] code,
.bp-doc .custom-block pre[data-lang] code {
  font-weight: 400;
  background-color: transparent;
}

/**
 * GitHub-Flavored Alerts (VitePress style)
 * -------------------------------------------------------------------------- */

/* Same box treatment as .custom-block — alerts and containers say the same
 * kind of thing, so they must not look like two unrelated systems. */
.github-alert {
  border: 0 solid transparent;
  border-left-width: 4px;
  border-radius: 8px;
  padding: 14px 16px;
  line-height: 24px;
  font-size: var(--bp-custom-block-font-size);
  margin: 16px 0;
}

/* The title is a <p>, so .bp-doc's 16px paragraph margins have to be beaten
 * on specificity — otherwise the label floats half a line above its body. */
.github-alert-title,
.bp-doc .github-alert-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 6px;
  font-weight: 600;
}

.github-alert-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

.github-alert-content {
  line-height: 24px;
}

.github-alert-content p,
.bp-doc .github-alert-content p {
  margin: 0;
}

.github-alert-content p + p,
.bp-doc .github-alert-content p + p {
  margin-top: 12px;
}

.bp-doc .github-alert-content > :first-child {
  margin-top: 0;
}

.bp-doc .github-alert-content > :last-child {
  margin-bottom: 0;
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

.github-alert-note .github-alert-icon {
  fill: var(--bp-c-brand-1);
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

.github-alert-tip .github-alert-icon {
  fill: var(--bp-c-tip-1);
}

/* Important Alert */
.github-alert-important {
  border-color: var(--bp-custom-block-important-border);
  color: var(--bp-custom-block-important-text);
  background-color: var(--bp-custom-block-important-bg);
}

.github-alert-important .github-alert-title {
  color: var(--bp-c-important-1);
}

.github-alert-important .github-alert-icon {
  fill: var(--bp-c-important-1);
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

.github-alert-warning .github-alert-icon {
  fill: var(--bp-c-warning-1);
}

/* Caution Alert */
.github-alert-caution {
  border-color: var(--bp-custom-block-caution-border);
  color: var(--bp-custom-block-caution-text);
  background-color: var(--bp-custom-block-caution-bg);
}

.github-alert-caution .github-alert-title {
  color: var(--bp-c-caution-1);
}

.github-alert-caution .github-alert-icon {
  fill: var(--bp-c-caution-1);
}`

// Code Group CSS - Matches VitePress vp-code-group.css exactly
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

/* Hidden input for tab switching - matches VitePress exactly */
.bp-code-group .tabs input {
  position: fixed;
  opacity: 0;
  pointer-events: none;
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
.bp-code-group pre[data-lang],
.code-group-panel,
.bp-block {
  display: none;
  margin-top: 0 !important;
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
}

.bp-code-group div[class*='language-'].active,
.bp-code-group pre[data-lang].active,
.code-group-panel.active,
.bp-block.active {
  display: block;
}

.bp-block {
  padding: 20px 24px;
}

/* The panel is a frame, not a padded box — the code block inside brings its
 * own padding, background and radius, and stacking the panel's on top of it
 * rendered a card inside a card with a gap under the tab bar. */
.code-group-panel {
  padding: 0;
}

.bp-doc .code-group-panel > pre,
.bp-doc .code-group-panel > div[class*='language-'] {
  margin: 0;
  border: none;
  border-radius: 0;
}

/* Code group container */
.code-group {
  margin: 16px 0;
  border: 1px solid var(--bp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

@media (min-width: 640px) {
  .code-group {
    border: none;
  }
}

.code-group-panels {
  position: relative;
}

.code-group-panel pre {
  margin: 0;
  border-radius: 0;
  border: none;
}`

// Layout / chrome styles — classes referenced by layout-doc.stx, layout-page.stx, layout-home.stx,
// and the nav/sidebar generators in serve.ts. Keeps templates declarative and dark-mode aware.
export const layoutCSS = `/**
 * VitePress Theme for BunPress - Layout & Chrome
 * -------------------------------------------------------------------------- */

.Layout {
  min-height: 100vh;
}

/* BPNav — top bar */
.BPNav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--bp-nav-height, 64px);
  background-color: var(--bp-nav-bg-color, var(--bp-c-bg));
  border-bottom: 1px solid var(--bp-c-divider);
  z-index: var(--bp-z-index-nav, 30);
  backdrop-filter: saturate(50%) blur(8px);
}

.BPNavBar {
  max-width: var(--bp-layout-max-width, 1440px);
  margin: 0 auto;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  gap: 24px;
}

.BPNavBarStart {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
  min-width: 0;
}

.BPNavBarEnd {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;
}

.BPNavBarTitle {
  /* block (not inline-flex) so text-overflow applies: a long site title must
   * yield instead of sliding underneath the icons on the right. min-width:0
   * lets the flex item actually shrink below its content width. */
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 16px;
  line-height: 1.5;
  font-weight: 750;
  color: var(--bp-c-text-1);
  white-space: nowrap;
  text-decoration: none;
  transition: color 0.25s;
}

.BPNavBarTitle:hover {
  color: var(--bp-c-brand-1);
}

.BPNavBarMenu {
  display: flex;
  align-items: center;
  gap: 24px;
}

.BPNavBarMenu a,
.BPNavBarMenu .BPNavBarMenu-link {
  font-size: 14px;
  font-weight: 600;
  color: var(--bp-c-text-2);
  text-decoration: none;
  transition: color 0.25s;
  cursor: pointer;
}

.BPNavBarMenu a:hover,
.BPNavBarMenu .BPNavBarMenu-link:hover,
.BPNavBarMenu a.is-active {
  color: var(--bp-c-brand-1);
}

.BPNavBarMenu-group {
  position: relative;
}

.BPNavBarMenu-group-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  padding: 0;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  color: var(--bp-c-text-1);
  cursor: pointer;
  transition: color 0.25s;
}

.BPNavBarMenu-group-button:hover {
  color: var(--bp-c-brand-1);
}

.BPNavBarMenu-group-button .chevron {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  transition: transform 0.25s;
}

.BPNavBarMenu-group:hover > .BPNavBarMenu-group-button .chevron {
  transform: rotate(180deg);
}

.BPNavBarMenu-group-items {
  display: none;
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 8px;
  padding: 8px 0;
  min-width: 192px;
  background: var(--bp-c-bg);
  border: 1px solid var(--bp-c-divider);
  border-radius: 8px;
  box-shadow: var(--bp-shadow-3, 0 12px 32px rgba(0, 0, 0, 0.1));
  z-index: 10;
}

.BPNavBarMenu-group:hover > .BPNavBarMenu-group-items {
  display: block;
}

.BPNavBarMenu-group-items a {
  display: block;
  padding: 6px 16px;
  font-size: 13px;
  color: var(--bp-c-text-1);
  text-decoration: none;
  transition: color 0.25s, background-color 0.25s;
}

.BPNavBarMenu-group-items a:hover {
  color: var(--bp-c-brand-1);
  background-color: var(--bp-c-bg-soft);
}

/* Search */
.BPNavBarSearch {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 260px;
  width: 100%;
}

.BPNavBarSearch-icon {
  position: absolute;
  left: 12px;
  width: 16px;
  height: 16px;
  color: var(--bp-c-text-3);
  pointer-events: none;
}

.BPNavBarSearch-input {
  width: 100%;
  height: 32px;
  padding: 0 48px 0 36px;
  font: inherit;
  font-size: 13px;
  background-color: var(--bp-c-bg-alt);
  border: 1px solid var(--bp-c-divider);
  border-radius: 4px;
  color: var(--bp-c-text-1);
  outline: none;
  transition: border-color 0.25s, background-color 0.25s;
}

.BPNavBarSearch-input::placeholder {
  color: var(--bp-c-text-3);
}

.BPNavBarSearch-input:hover,
.BPNavBarSearch-input:focus {
  border-color: var(--bp-c-brand-1);
  background-color: var(--bp-c-bg);
}

.BPNavBarSearch-kbd {
  position: absolute;
  right: 8px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 600;
  font-family: inherit;
  color: var(--bp-c-text-3);
  background-color: var(--bp-c-bg);
  border: 1px solid var(--bp-c-divider);
  border-radius: 4px;
  pointer-events: none;
}

/* Social/icon links cluster */
.BPSocialLinks {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 24px;
  border-left: 1px solid var(--bp-c-divider);
}

.BPSocialLinks > a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--bp-c-text-2);
  border-radius: 4px;
  transition: color 0.25s, background-color 0.25s;
}

.BPSocialLinks > a:hover {
  color: var(--bp-c-text-1);
  background-color: var(--bp-c-bg-soft);
}

.BPSocialLinks > a svg {
  width: 20px;
  height: 20px;
}

/* Content area */
.BPContent {
  flex: 1;
}

.BPContent--doc {
  position: fixed;
  top: var(--bp-nav-height, 64px);
  bottom: 0;
  overflow-y: auto;
  left: max(var(--bp-sidebar-width, 272px), calc((100vw - var(--bp-layout-max-width, 1440px)) / 2 + var(--bp-sidebar-width, 272px)));
  right: max(0px, calc((100vw - var(--bp-layout-max-width, 1440px)) / 2));
}

.BPContent--page {
  padding-top: var(--bp-nav-height, 64px);
}

.BPDoc {
  padding: 32px 24px;
  padding-right: 32px;
}

@media (min-width: 1280px) {
  .BPDoc {
    padding: 48px 32px 128px;
  }
}

.BPDocContent {
  max-width: 768px;
  margin: 0;
}

.BPPage {
  padding: 48px 24px;
  max-width: 768px;
  margin: 0 auto;
}

@media (min-width: 1280px) {
  .BPPage {
    padding: 64px 32px;
  }
}

/* Mobile sidebar drawer behaviour */
@media (max-width: 959px) {
  .BPNavBarSearch {
    display: none;
  }
  .BPSocialLinks {
    /* The divider separates the nav links from the icons — with the links
     * hidden it is a rule floating against the title, so drop it. */
    padding-left: 0;
    border-left: none;
    gap: 4px;
  }
  .BPNavBarMenu {
    display: none;
  }
  .BPNavBar {
    padding: 0 16px;
    gap: 12px;
  }
  .BPNavBarStart {
    gap: 8px;
  }
  .BPNavBarEnd {
    gap: 4px;
  }
}

@media (max-width: 419px) {
  .BPNavBarTitle {
    font-size: 15px;
  }
}

/**
 * Hero (home layout) — used by hero.stx + serve.ts generateHero
 * -------------------------------------------------------------------------- */

.BPHero-name {
  font-size: clamp(18px, 4vw, 24px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 0 0 8px;
  background: linear-gradient(135deg, var(--bp-c-brand-1, #5672cd) 0%, var(--bp-c-brand-2, #8b9cf7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Fluid rather than stepped: a fixed 48px headline on a 375px phone puts a
 * single long word (\`documentation\`) wider than the viewport, and a hard
 * breakpoint only moves the problem to the widths either side of it. */
.BPHero-text {
  font-size: clamp(30px, 8vw, 56px);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: var(--bp-c-text-1);
  margin: 0 0 8px;
  /* Last resort for a word that still cannot fit at the minimum size. */
  overflow-wrap: break-word;
}

.BPHero-tagline {
  max-width: 720px;
  font-size: clamp(16px, 2.4vw, 20px);
  font-weight: 400;
  line-height: 1.6;
  color: var(--bp-c-text-2);
  margin: 12px 0 0;
}

.BPHero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.BPButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  height: 40px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 20px;
  text-decoration: none;
  transition: background-color 0.25s, color 0.25s, border-color 0.25s;
  border: 1px solid transparent;
  white-space: nowrap;
  cursor: pointer;
}

.BPButton-brand {
  color: var(--bp-button-brand-text, #03110b);
  background-color: var(--bp-c-brand-1);
  border-color: var(--bp-c-brand-1);
}

.BPButton-brand:hover {
  background-color: var(--bp-c-brand-2);
  border-color: var(--bp-c-brand-2);
}

.BPButton-alt {
  color: var(--bp-c-text-1);
  background-color: transparent;
  border-color: var(--bp-c-divider);
}

.BPButton-alt:hover {
  border-color: var(--bp-c-text-2);
  color: var(--bp-c-brand-1);
}

/**
 * Features grid — used by features.stx + serve.ts generateFeatures
 * -------------------------------------------------------------------------- */

.BPHomeFeatures {
  padding: 48px 24px;
  border-top: 1px solid var(--bp-c-divider);
}

.BPHomeFeatures-inner {
  max-width: 1152px;
  margin: 0 auto;
}

.BPFeatures {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
}

@media (min-width: 640px) {
  .BPFeatures {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

@media (min-width: 960px) {
  .BPHomeFeatures {
    padding: 64px 32px;
  }
  .BPFeatures {
    grid-template-columns: repeat(3, 1fr);
  }
}

.BPFeature {
  display: block;
  padding: 26px;
  background-color: var(--bp-c-bg-soft, var(--bp-c-bg-alt));
  border: 1px solid var(--bp-c-divider);
  border-radius: 12px;
  transition: border-color 0.25s, box-shadow 0.25s;
  text-decoration: none;
  color: inherit;
}

.BPFeature:hover {
  border-color: var(--bp-c-brand-1);
  box-shadow: 0 2px 12px rgba(86, 114, 205, 0.08);
}

.BPFeature-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--bp-c-brand-soft, rgba(86, 114, 205, 0.1));
  color: var(--bp-c-brand-1);
  margin-bottom: 12px;
}

.BPFeature-icon svg {
  width: 24px;
  height: 24px;
}

.BPFeature-icon-text {
  font-size: 24px;
  font-weight: 700;
}

.BPFeature-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--bp-c-text-1);
}

.BPFeature-details {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--bp-c-text-2);
}

/**
 * Home page markdown body — rendered below the hero + features grid.
 * Wrapped as .BPHome-content > .bp-doc.vp-doc.container by markdownToHtml.
 * -------------------------------------------------------------------------- */

/* The nav is fixed, so the home layout has to reserve its height. Previously
 * only the hero's own top padding cleared it, which meant any change to that
 * padding slid the first line of the hero under the bar. */
.BPHome {
  padding-top: var(--bp-nav-height, 64px);
}

.BPHome-content {
  padding: 48px 24px 96px;
}

.BPHome-content .container {
  margin: 0 auto;
  max-width: 1152px;
}

@media (min-width: 960px) {
  .BPHome-content {
    padding: 64px 32px 128px;
  }
}

/**
 * Inline content — badges, external link icons
 * -------------------------------------------------------------------------- */

/* The UA default is pure yellow with forced black text, which is jarring in
 * light mode and unreadable against a dark page. */
.bp-doc mark {
  padding: 1px 3px;
  border-radius: 3px;
  background-color: var(--bp-c-warning-soft, rgba(234, 179, 8, 0.28));
  color: inherit;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.85em;
  font-weight: 600;
  border-radius: 4px;
  margin: 0 4px;
  vertical-align: middle;
  border: 1px solid transparent;
  line-height: 1.5;
}

.badge-tip {
  background: var(--bp-c-tip-soft, rgba(16, 185, 129, 0.14));
  color: var(--bp-c-tip-1, var(--bp-c-green-1));
  border-color: var(--bp-c-tip-2, var(--bp-c-green-2));
}

.badge-info {
  background: var(--bp-c-default-soft, var(--bp-c-gray-soft));
  color: var(--bp-c-text-1);
  border-color: var(--bp-c-divider);
}

.badge-warning {
  background: var(--bp-c-warning-soft, rgba(234, 179, 8, 0.14));
  color: var(--bp-c-warning-1, var(--bp-c-yellow-1));
  border-color: var(--bp-c-warning-2, var(--bp-c-yellow-2));
}

.badge-danger {
  background: var(--bp-c-danger-soft, rgba(244, 63, 94, 0.14));
  color: var(--bp-c-danger-1, var(--bp-c-red-1));
  border-color: var(--bp-c-danger-2, var(--bp-c-red-2));
}

.external-link-icon {
  display: inline-block;
  margin-left: 4px;
  vertical-align: middle;
  width: 12px;
  height: 12px;
}

/**
 * Polish: prose elements
 * -------------------------------------------------------------------------- */

/* Subtle row hover on tables */
.bp-doc tbody tr:hover {
  background-color: var(--bp-c-default-soft, var(--bp-c-gray-soft));
}

/* Slightly stronger blockquote with brand-tinted accent */
.bp-doc blockquote {
  border-left-color: var(--bp-c-brand-1);
  padding: 8px 0 8px 16px;
}

/* Code-block scrollbar */
.bp-doc [class*='language-'] pre::-webkit-scrollbar,
.bp-doc pre[data-lang]::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}
.bp-doc [class*='language-'] pre::-webkit-scrollbar-thumb,
.bp-doc pre[data-lang]::-webkit-scrollbar-thumb {
  background-color: var(--bp-c-divider);
  border-radius: 3px;
}
.bp-doc [class*='language-'] pre::-webkit-scrollbar-thumb:hover,
.bp-doc pre[data-lang]::-webkit-scrollbar-thumb:hover {
  background-color: var(--bp-c-text-3);
}

/* Heading anchor: keep it subtle */
.bp-doc .header-anchor {
  color: var(--bp-c-text-3);
}
.bp-doc .header-anchor:hover,
.bp-doc .header-anchor:focus {
  color: var(--bp-c-brand-1);
}

/**
 * Layout scrollbars
 * --------------------------------------------------------------------------
 * The doc layout scrolls in independent panes, so on any platform with
 * always-visible scrollbars the reader gets full-height grey tracks down the
 * middle of the page. Thin them to match the code-block treatment. (The TOC
 * aside hides its scrollbar outright — see page-toc.stx.)
 */

.BPSidebar,
.BPContent--doc {
  scrollbar-width: thin;
  scrollbar-color: var(--bp-c-divider) transparent;
}

.BPSidebar::-webkit-scrollbar,
.BPContent--doc::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.BPSidebar::-webkit-scrollbar-track,
.BPContent--doc::-webkit-scrollbar-track {
  background: transparent;
}

.BPSidebar::-webkit-scrollbar-thumb,
.BPContent--doc::-webkit-scrollbar-thumb {
  background-color: var(--bp-c-divider);
  border-radius: 4px;
}

.BPSidebar:hover::-webkit-scrollbar-thumb,
.BPContent--doc:hover::-webkit-scrollbar-thumb {
  background-color: var(--bp-c-text-3);
}

/**
 * Keyboard focus
 * --------------------------------------------------------------------------
 * :focus-visible only, so pointer users never see a ring, but every
 * interactive control in the chrome is reachable and visible by keyboard.
 */

.BPNavBarTitle:focus-visible,
.BPNavBarMenu a:focus-visible,
.BPSocialLinks > a:focus-visible,
.BPNavBarHamburger:focus-visible,
.theme-toggle:focus-visible,
.BPSidebarItem-link:focus-visible,
.sidebar-section-toggle:focus-visible,
.BPDocAside a:focus-visible,
.bp-doc a:focus-visible,
.BPButton:focus-visible {
  outline: 2px solid var(--bp-c-brand-1);
  outline-offset: 2px;
  border-radius: 3px;
}

/**
 * Mobile nav / sidebar drawer
 * -------------------------------------------------------------------------- */

.BPNavBarHamburger {
  display: none;
  /* 40px keeps the hit area at the minimum comfortable touch target even
   * though the icon itself is 20px. */
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  color: var(--bp-c-text-2);
  border-radius: 8px;
  padding: 0;
  margin-left: -8px;
}

.BPNavBarHamburger:hover {
  color: var(--bp-c-text-1);
  background-color: var(--bp-c-bg-soft);
}

.BPNavBarHamburger svg {
  width: 20px;
  height: 20px;
}

@media (max-width: 959px) {
  .BPNavBarHamburger {
    display: inline-flex;
  }

  .BPSidebar {
    transform: translateX(-100%);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    z-index: var(--bp-z-index-sidebar, 25);
    background-color: var(--bp-c-bg-alt);
    box-shadow: none;
  }

  .BPSidebar.is-open {
    transform: translateX(0);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
  }

  .BPSidebar-backdrop {
    position: fixed;
    /* Starts below the nav: the drawer opens under the bar, so scrimming the
     * bar too dims the very controls (menu button, theme toggle) that stay
     * live while the drawer is open. */
    top: var(--bp-nav-height, 64px);
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.32);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    z-index: calc(var(--bp-z-index-sidebar, 25) - 1);
  }

  .BPSidebar-backdrop.is-open {
    opacity: 1;
    pointer-events: auto;
  }

  .BPContent--doc {
    left: 0;
  }

  .BPDoc {
    padding: 24px 20px 64px;
  }
}

/* Small phones: reclaim horizontal space from the gutters. */
@media (max-width: 419px) {
  .BPDoc {
    padding: 20px 16px 56px;
  }
}
`

/**
 * Get all VitePress theme CSS combined
 */
export function getVitePressThemeCSS(): string {
  return `
/* VitePress Theme for BunPress */
${varsCSS}
${baseCSS}
${layoutCSS}
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
