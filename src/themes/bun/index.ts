/**
 * Bun Theme for BunPress
 *
 * This theme provides Bun-inspired styling for BunPress documentation sites.
 * Colors and styling are extracted directly from bun.sh for accuracy.
 *
 * Key colors from bun.sh:
 * - Bun Orange: #f89b4b
 * - Bun Blue: #00a6e1
 * - Bun Pink: #e600e5
 * - Dark backgrounds: #0d0e11, #14151a, #282a36
 */

// CSS Variables - Exact values from bun.sh
const varsCSS = `/**
 * Bun Theme for BunPress
 * Colors extracted from bun.sh
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
 * Colors: Bun Brand Palette (exact values from bun.sh)
 * -------------------------------------------------------------------------- */

:root {
  /* Bun's signature warm orange - exact from bun.sh */
  --bp-c-bun-orange: #f89b4b;
  --bp-c-bun-orange-light: #fbb175;
  --bp-c-bun-orange-dark: #e88a3a;
  --bp-c-bun-orange-soft: rgba(248, 155, 75, 0.14);

  /* Bun blue accent - exact from bun.sh */
  --bp-c-bun-blue: #00a6e1;
  --bp-c-bun-blue-light: #33b8e8;
  --bp-c-bun-blue-dark: #0095cc;
  --bp-c-bun-blue-soft: rgba(0, 166, 225, 0.14);

  /* Bun pink/magenta accent - exact from bun.sh */
  --bp-c-bun-pink: #e600e5;
  --bp-c-bun-pink-light: #f033ef;
  --bp-c-bun-pink-dark: #c700c6;
  --bp-c-bun-pink-soft: rgba(230, 0, 229, 0.14);

  /* Gray scale - Light mode (from bun.sh) */
  --bp-c-gray-1: #d1d5db;
  --bp-c-gray-2: #e5e7eb;
  --bp-c-gray-3: #f3f4f6;
  --bp-c-gray-soft: rgba(156, 163, 175, 0.14);

  /* Semantic colors */
  --bp-c-green-1: #16a34a;
  --bp-c-green-2: #22c55e;
  --bp-c-green-3: #4ade80;
  --bp-c-green-soft: rgba(22, 163, 74, 0.08);

  --bp-c-yellow-1: #ca8a04;
  --bp-c-yellow-2: #eab308;
  --bp-c-yellow-3: #facc15;
  --bp-c-yellow-soft: rgba(234, 179, 8, 0.08);

  --bp-c-red-1: #dc2626;
  --bp-c-red-2: #ef4444;
  --bp-c-red-3: #f87171;
  --bp-c-red-soft: rgba(220, 38, 38, 0.08);

  --bp-c-purple-1: #7c3aed;
  --bp-c-purple-2: #8b5cf6;
  --bp-c-purple-3: #a78bfa;
  --bp-c-purple-soft: rgba(124, 58, 237, 0.08);
}

.dark {
  /* Gray scale - Dark mode (exact from bun.sh) */
  --bp-c-gray-1: #4f5666;
  --bp-c-gray-2: #3b3f4b;
  --bp-c-gray-3: #282a36;
  --bp-c-gray-soft: rgba(79, 86, 102, 0.16);

  /* Adjusted semantic colors for dark mode */
  --bp-c-green-1: #4ade80;
  --bp-c-green-2: #22c55e;
  --bp-c-green-3: #16a34a;
  --bp-c-green-soft: rgba(74, 222, 128, 0.16);

  --bp-c-yellow-1: #fde047;
  --bp-c-yellow-2: #facc15;
  --bp-c-yellow-3: #eab308;
  --bp-c-yellow-soft: rgba(253, 224, 71, 0.16);

  --bp-c-red-1: #f87171;
  --bp-c-red-2: #ef4444;
  --bp-c-red-3: #dc2626;
  --bp-c-red-soft: rgba(248, 113, 113, 0.16);

  --bp-c-purple-1: #a78bfa;
  --bp-c-purple-2: #8b5cf6;
  --bp-c-purple-3: #7c3aed;
  --bp-c-purple-soft: rgba(167, 139, 250, 0.16);
}

/**
 * Colors: Background (exact from bun.sh dark theme)
 * --gray-950: #0d0e11 (darkest)
 * --gray-900: #14151a (main dark bg)
 * --gray-800: #282a36 (code blocks - Dracula bg)
 * -------------------------------------------------------------------------- */

:root {
  --bp-c-bg: #f9fafb;
  --bp-c-bg-alt: #f3f4f6;
  --bp-c-bg-elv: #ffffff;
  --bp-c-bg-soft: #f3f4f6;
}

.dark {
  --bp-c-bg: #14151a;
  --bp-c-bg-alt: #0d0e11;
  --bp-c-bg-elv: #1f2028;
  --bp-c-bg-soft: #1f2028;
}

/**
 * Colors: Borders
 * -------------------------------------------------------------------------- */

:root {
  --bp-c-border: #d1d5db;
  --bp-c-divider: #e5e7eb;
  --bp-c-gutter: #e5e7eb;
}

.dark {
  --bp-c-border: #3b3f4b;
  --bp-c-divider: #282a36;
  --bp-c-gutter: #14151a;
}

/**
 * Colors: Text (from bun.sh gray scale)
 * -------------------------------------------------------------------------- */

:root {
  --bp-c-text-1: #111827;
  --bp-c-text-2: #4b5563;
  --bp-c-text-3: #9ca3af;
}

.dark {
  --bp-c-text-1: #e5e7eb;
  --bp-c-text-2: #9ca3af;
  --bp-c-text-3: #6b7280;
}

/**
 * Colors: Function - Using Bun orange as brand
 * -------------------------------------------------------------------------- */

:root {
  --bp-c-default-1: var(--bp-c-gray-1);
  --bp-c-default-2: var(--bp-c-gray-2);
  --bp-c-default-3: var(--bp-c-gray-3);
  --bp-c-default-soft: var(--bp-c-gray-soft);

  /* Brand = Bun Orange */
  --bp-c-brand-1: var(--bp-c-bun-orange);
  --bp-c-brand-2: var(--bp-c-bun-orange-light);
  --bp-c-brand-3: var(--bp-c-bun-orange-dark);
  --bp-c-brand-soft: var(--bp-c-bun-orange-soft);
  --bp-c-brand: var(--bp-c-brand-1);

  /* Tip = Bun Blue */
  --bp-c-tip-1: var(--bp-c-bun-blue);
  --bp-c-tip-2: var(--bp-c-bun-blue-light);
  --bp-c-tip-3: var(--bp-c-bun-blue-dark);
  --bp-c-tip-soft: var(--bp-c-bun-blue-soft);

  /* Note = Bun Blue */
  --bp-c-note-1: var(--bp-c-bun-blue);
  --bp-c-note-2: var(--bp-c-bun-blue-light);
  --bp-c-note-3: var(--bp-c-bun-blue-dark);
  --bp-c-note-soft: var(--bp-c-bun-blue-soft);

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

  --bp-c-sponsor: var(--bp-c-bun-pink);
}

/**
 * Typography - Exact font stacks from bun.sh
 * -------------------------------------------------------------------------- */

:root {
  --bp-font-family-base: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  --bp-font-family-mono: 'JetBrains Mono', 'Fira Code', 'Hack', 'Source Code Pro', 'SF Mono', 'Inconsolata', monospace;
  font-optical-sizing: auto;
}

/**
 * Shadows
 * -------------------------------------------------------------------------- */

:root {
  --bp-shadow-1: 0 1px 2px rgba(0, 0, 0, 0.05);
  --bp-shadow-2: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --bp-shadow-3: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --bp-shadow-4: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --bp-shadow-5: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.dark {
  --bp-shadow-1: 0 1px 2px rgba(0, 0, 0, 0.3);
  --bp-shadow-2: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
  --bp-shadow-3: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
  --bp-shadow-4: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
  --bp-shadow-5: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
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
 * Layouts - exact from bun.sh
 * --max-width: 1280px
 * -------------------------------------------------------------------------- */

:root {
  --bp-layout-max-width: 1280px;
}

/**
 * Component: Header Anchor
 * -------------------------------------------------------------------------- */

:root {
  --bp-header-anchor-symbol: '#';
}

/**
 * Component: Code - Bun's code styling
 * Code blocks use #282a36 (Dracula theme background)
 * line-height: 20px from bun.sh
 * padding: 3px 2.5rem 3px 1rem from bun.sh
 * border-radius: 5px from bun.sh
 * -------------------------------------------------------------------------- */

:root {
  --bp-code-line-height: 1.5;
  --bp-code-font-size: 0.875em;
  --bp-code-color: var(--bp-c-brand-1);
  --bp-code-link-color: var(--bp-c-brand-1);
  --bp-code-link-hover-color: var(--bp-c-brand-2);
  --bp-code-bg: var(--bp-c-default-soft);

  --bp-code-block-color: var(--bp-c-text-2);
  --bp-code-block-bg: #f6f8fa;
  --bp-code-block-divider-color: var(--bp-c-gutter);

  --bp-code-lang-color: var(--bp-c-text-3);

  --bp-code-line-highlight-color: var(--bp-c-default-soft);
  --bp-code-line-number-color: var(--bp-c-text-3);

  --bp-code-line-diff-add-color: rgba(22, 163, 74, 0.08);
  --bp-code-line-diff-add-symbol-color: var(--bp-c-success-1);

  --bp-code-line-diff-remove-color: rgba(220, 38, 38, 0.08);
  --bp-code-line-diff-remove-symbol-color: var(--bp-c-danger-1);

  --bp-code-line-warning-color: var(--bp-c-warning-soft);
  --bp-code-line-error-color: var(--bp-c-danger-soft);

  --bp-code-copy-code-border-color: var(--bp-c-divider);
  --bp-code-copy-code-bg: var(--bp-c-bg-soft);
  --bp-code-copy-code-hover-border-color: var(--bp-c-brand-1);
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

.dark {
  /* Code blocks use Dracula background #282a36 */
  --bp-code-block-bg: #282a36;
  --bp-code-block-color: #e5e7eb;
  --bp-code-tab-bg: #282a36;

  --bp-code-line-diff-add-color: rgba(74, 222, 128, 0.16);
  --bp-code-line-diff-remove-color: rgba(248, 113, 113, 0.16);
}

/**
 * Component: Button - Bun style buttons
 * Install button: bg #00a6e1, border-radius: 100px, padding: 8px 16px
 * -------------------------------------------------------------------------- */

:root {
  --bp-button-brand-border: transparent;
  --bp-button-brand-text: var(--bp-c-black);
  --bp-button-brand-bg: var(--bp-c-brand-1);
  --bp-button-brand-hover-border: transparent;
  --bp-button-brand-hover-text: var(--bp-c-black);
  --bp-button-brand-hover-bg: var(--bp-c-brand-2);
  --bp-button-brand-active-border: transparent;
  --bp-button-brand-active-text: var(--bp-c-black);
  --bp-button-brand-active-bg: var(--bp-c-brand-3);

  /* Blue accent button (like bun.sh install button) */
  --bp-button-alt-border: transparent;
  --bp-button-alt-text: var(--bp-c-black);
  --bp-button-alt-bg: var(--bp-c-bun-blue);
  --bp-button-alt-hover-border: transparent;
  --bp-button-alt-hover-text: var(--bp-c-black);
  --bp-button-alt-hover-bg: var(--bp-c-bun-blue-light);
  --bp-button-alt-active-border: transparent;
  --bp-button-alt-active-text: var(--bp-c-black);
  --bp-button-alt-active-bg: var(--bp-c-bun-blue-dark);

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
  --bp-custom-block-note-bg: var(--bp-c-note-soft);
  --bp-custom-block-note-code-bg: var(--bp-c-note-soft);

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
 * Component: Nav - Bun style header
 * --navbar-height: 60px from bun.sh
 * -------------------------------------------------------------------------- */

:root {
  --bp-nav-height: 60px;
  --bp-nav-bg-color: var(--bp-c-bg);
  --bp-nav-screen-bg-color: var(--bp-c-bg);
  --bp-nav-logo-height: 24px;
}

.dark {
  --bp-nav-bg-color: var(--bp-c-bg);
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
 * Component: Home - Hero with Bun branding
 * -------------------------------------------------------------------------- */

:root {
  --bp-home-hero-name-color: var(--bp-c-brand-1);
  --bp-home-hero-name-background: linear-gradient(135deg, var(--bp-c-bun-orange) 0%, var(--bp-c-bun-pink) 100%);
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
 * Icons
 * -------------------------------------------------------------------------- */

:root {
  --bp-icon-copy: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='rgba(128,128,128,1)' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'%3E%3Crect width='8' height='4' x='8' y='2' rx='1' ry='1'/%3E%3Cpath d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/%3E%3C/g%3E%3C/svg%3E");
  --bp-icon-copied: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='rgba(128,128,128,1)' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'%3E%3Crect width='8' height='4' x='8' y='2' rx='1' ry='1'/%3E%3Cpath d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/%3E%3Cpath d='m9 14l2 2l4-4'/%3E%3C/g%3E%3C/svg%3E");
  --bp-icon-external: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M0 0h24v24H0V0z' fill='none'/%3E%3Cpath d='M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5H9z'/%3E%3C/svg%3E");
}

/**
 * Icon Classes
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

.bpi-sun {
  --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='4'/%3E%3Cpath d='M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41'/%3E%3C/g%3E%3C/svg%3E");
}

.bpi-moon {
  --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 3a6 6 0 0 0 9 9a9 9 0 1 1-9-9'/%3E%3C/svg%3E");
}

.bpi-chevron-right,
.bpi-chevron-down,
.bpi-chevron-left,
.bpi-chevron-up {
  --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m9 18l6-6l-6-6'/%3E%3C/svg%3E");
}

.bpi-chevron-down {
  transform: rotate(90deg);
}

.bpi-chevron-left {
  transform: rotate(180deg);
}

.bpi-chevron-up {
  transform: rotate(-90deg);
}

.bpi-search {
  --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.6'%3E%3Cpath d='m21 21l-4.34-4.34'/%3E%3Ccircle cx='11' cy='11' r='8' stroke-width='1.4'/%3E%3C/g%3E%3C/svg%3E");
}`

// Base CSS - Bun theme base styles
const baseCSS = `/**
 * Bun Theme for BunPress - Base Styles
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
  scroll-behavior: smooth;
}

html.dark {
  color-scheme: dark;
}

body {
  margin: 0;
  width: 100%;
  min-width: 320px;
  min-height: 100vh;
  line-height: 1.75;
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
  line-height: 1.25;
  font-weight: 600;
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
  outline: 2px solid var(--bp-c-brand-1);
  outline-offset: 2px;
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
 * VPDoc Styles - Documentation Content
 * -------------------------------------------------------------------------- */

.bp-doc h1,
.bp-doc h2,
.bp-doc h3,
.bp-doc h4,
.bp-doc h5,
.bp-doc h6 {
  position: relative;
  font-weight: 700;
  outline: none;
}

.bp-doc h1 {
  letter-spacing: -0.03em;
  line-height: 1.2;
  font-size: 2.25rem;
}

.bp-doc h2 {
  margin: 48px 0 16px;
  border-top: 1px solid var(--bp-c-divider);
  padding-top: 24px;
  letter-spacing: -0.02em;
  line-height: 1.3;
  font-size: 1.5rem;
}

.bp-doc h3 {
  margin: 32px 0 0;
  letter-spacing: -0.01em;
  line-height: 1.4;
  font-size: 1.25rem;
}

.bp-doc h4 {
  margin: 24px 0 0;
  letter-spacing: -0.01em;
  line-height: 1.4;
  font-size: 1.125rem;
}

.bp-doc h5 {
  margin: 16px 0 0;
  font-size: 1rem;
}

.bp-doc h6 {
  margin: 16px 0 0;
  font-size: 0.875rem;
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
  color: var(--bp-c-brand-1);
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
    font-size: 2.5rem;
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
  line-height: 1.75;
}

.bp-doc blockquote {
  margin: 16px 0;
  border-left: 3px solid var(--bp-c-brand-1);
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
  text-decoration: none;
  transition: color 0.25s;
}

.bp-doc a:hover {
  color: var(--bp-c-brand-2);
  text-decoration: underline;
}

.bp-doc strong {
  font-weight: 600;
}

/**
 * Lists
 * -------------------------------------------------------------------------- */

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

/* Task list styles */
.bp-doc .task-list {
  list-style: none;
  padding-left: 0;
}

.bp-doc .task-list-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.bp-doc .task-list-checkbox {
  margin-top: 0.25rem;
  width: 1rem;
  height: 1rem;
  accent-color: var(--bp-c-brand-1);
  cursor: default;
}

/**
 * Table
 * -------------------------------------------------------------------------- */

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
  padding: 10px 16px;
}

.bp-doc th {
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: var(--bp-c-text-1);
  background-color: var(--bp-c-bg-soft);
}

.bp-doc td {
  font-size: 14px;
}

/**
 * Decorational elements
 * -------------------------------------------------------------------------- */

.bp-doc hr {
  margin: 24px 0;
  border: none;
  border-top: 1px solid var(--bp-c-divider);
}

/**
 * Inline code - Bun style with orange tint
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
 * Code blocks - Bun style
 * border-radius: 5px from bun.sh
 * line-height: 20px from bun.sh
 * -------------------------------------------------------------------------- */

.bp-doc div[class*='language-'],
.bp-doc pre[data-lang],
.bp-block {
  position: relative;
  margin: 16px -24px;
  background-color: var(--bp-code-block-bg);
  overflow-x: auto;
  transition: background-color 0.5s;
  border-radius: 0;
}

@media (min-width: 640px) {
  .bp-doc div[class*='language-'],
  .bp-doc pre[data-lang],
  .bp-block {
    border-radius: 5px;
    margin: 16px 0;
  }
}

@media (max-width: 639px) {
  .bp-doc li div[class*='language-'],
  .bp-doc li pre[data-lang] {
    border-radius: 5px 0 0 5px;
  }
}

.bp-doc div[class*='language-'] + div[class*='language-'],
.bp-doc div[class$='-api'] + div[class*='language-'],
.bp-doc div[class*='language-'] + div[class$='-api'] > div[class*='language-'],
.bp-doc pre[data-lang] + pre[data-lang] {
  margin-top: -8px;
}

.bp-doc [class*='language-'] pre,
.bp-doc [class*='language-'] code,
.bp-doc pre[data-lang],
.bp-doc pre[data-lang] code {
  -moz-tab-size: 2;
  -o-tab-size: 2;
  tab-size: 2;
}

.bp-doc [class*='language-'] pre,
.bp-doc pre[data-lang] {
  position: relative;
  z-index: 1;
  margin: 0;
  padding: 16px 0;
  background: transparent;
  overflow-x: auto;
  text-align: left;
}

.bp-doc [class*='language-'] code,
.bp-doc pre[data-lang] code {
  display: block;
  padding: 3px 40px 3px 16px;
  width: fit-content;
  min-width: 100%;
  line-height: 20px;
  font-size: var(--bp-code-font-size);
  color: var(--bp-code-block-color);
  transition: color 0.5s;
}

.bp-doc [class*='language-'] code .highlighted,
.bp-doc pre[data-lang] code .highlighted {
  background-color: var(--bp-code-line-highlight-color);
  transition: background-color 0.5s;
  margin: 0 -40px 0 -16px;
  padding: 0 40px 0 16px;
  width: calc(100% + 56px);
  display: inline-block;
}

.bp-doc [class*='language-'] code .highlighted.error,
.bp-doc pre[data-lang] code .highlighted.error {
  background-color: var(--bp-code-line-error-color);
}

.bp-doc [class*='language-'] code .highlighted.warning,
.bp-doc pre[data-lang] code .highlighted.warning {
  background-color: var(--bp-code-line-warning-color);
}

.bp-doc [class*='language-'] code .diff,
.bp-doc pre[data-lang] code .diff {
  transition: background-color 0.5s;
  margin: 0 -40px 0 -16px;
  padding: 0 40px 0 16px;
  width: calc(100% + 56px);
  display: inline-block;
}

.bp-doc [class*='language-'] code .diff::before,
.bp-doc pre[data-lang] code .diff::before {
  position: absolute;
  left: 6px;
}

/* Focus lines with blur effect */
.bp-doc [class*='language-'] .has-focused-lines .line:not(.has-focus),
.bp-doc pre[data-lang] .has-focused-lines .line:not(.has-focus) {
  filter: blur(0.095rem);
  opacity: 0.7;
  transition: filter 0.35s, opacity 0.35s;
}

.bp-doc [class*='language-']:hover .has-focused-lines .line:not(.has-focus),
.bp-doc pre[data-lang]:hover .has-focused-lines .line:not(.has-focus) {
  filter: blur(0);
  opacity: 1;
}

.bp-doc [class*='language-'] code .diff.remove,
.bp-doc pre[data-lang] code .diff.remove {
  background-color: var(--bp-code-line-diff-remove-color);
  opacity: 0.7;
}

.bp-doc [class*='language-'] code .diff.remove::before,
.bp-doc pre[data-lang] code .diff.remove::before {
  content: '-';
  color: var(--bp-code-line-diff-remove-symbol-color);
}

.bp-doc [class*='language-'] code .diff.add,
.bp-doc pre[data-lang] code .diff.add {
  background-color: var(--bp-code-line-diff-add-color);
}

.bp-doc [class*='language-'] code .diff.add::before,
.bp-doc pre[data-lang] code .diff.add::before {
  content: '+';
  color: var(--bp-code-line-diff-add-symbol-color);
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
  padding-top: 16px;
  width: 32px;
  text-align: center;
  font-family: var(--bp-font-family-mono);
  line-height: 20px;
  font-size: var(--bp-code-font-size);
  color: var(--bp-code-line-number-color);
  transition: border-color 0.5s, color 0.5s;
}

/* Copy button - Bun style */
.bp-doc [class*='language-'] > button.copy,
.bp-doc pre[data-lang] > button.copy {
  direction: ltr;
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 3;
  border: 1px solid var(--bp-code-copy-code-border-color);
  border-radius: 4px;
  width: 36px;
  height: 36px;
  background-color: var(--bp-code-copy-code-bg);
  opacity: 0;
  cursor: pointer;
  background-image: var(--bp-icon-copy);
  background-position: 50%;
  background-size: 18px;
  background-repeat: no-repeat;
  transition: border-color 0.25s, background-color 0.25s, opacity 0.25s, transform 0.1s linear;
}

.bp-doc [class*='language-']:hover > button.copy,
.bp-doc [class*='language-'] > button.copy:focus,
.bp-doc pre[data-lang]:hover > button.copy,
.bp-doc pre[data-lang] > button.copy:focus {
  opacity: 1;
}

.bp-doc [class*='language-'] > button.copy:hover,
.bp-doc pre[data-lang] > button.copy:hover {
  border-color: var(--bp-code-copy-code-hover-border-color);
  background-color: var(--bp-code-copy-code-hover-bg);
  transform: scale(1.06);
}

.bp-doc [class*='language-'] > button.copy.copied,
.bp-doc pre[data-lang] > button.copy.copied {
  border-color: var(--bp-c-success-1);
  background-color: var(--bp-code-copy-code-hover-bg);
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
  border: 1px solid var(--bp-c-success-1);
  border-right: 0;
  border-radius: 4px 0 0 4px;
  padding: 0 8px;
  width: fit-content;
  height: 36px;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: var(--bp-c-success-1);
  background-color: var(--bp-code-copy-code-hover-bg);
  white-space: nowrap;
  content: var(--bp-code-copy-copied-text-content);
}

/* Language label */
.bp-doc [class*='language-'] > span.lang,
.bp-doc pre[data-lang]::before {
  position: absolute;
  top: 4px;
  right: 10px;
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
 * Custom block code group tabs
 * -------------------------------------------------------------------------- */

.bp-doc .custom-block .bp-code-group .tabs {
  margin: 0;
  border-radius: 5px 5px 0 0;
}`

// Custom Block CSS - Bun style custom containers
const customBlockCSS = `/**
 * Bun Theme for BunPress - Custom Blocks
 * -------------------------------------------------------------------------- */

.custom-block {
  border: 1px solid transparent;
  border-radius: 5px;
  padding: 16px 16px 8px;
  line-height: 1.6;
  font-size: var(--bp-custom-block-font-size);
  color: var(--bp-c-text-2);
  margin: 16px 0;
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
  border-left: 3px solid var(--bp-c-note-1);
}

.custom-block.note a,
.custom-block.note code {
  color: var(--bp-c-note-1);
}

.custom-block.note a:hover,
.custom-block.note a:hover > code {
  color: var(--bp-c-note-2);
}

.custom-block.note code {
  background-color: var(--bp-custom-block-note-code-bg);
}

.custom-block.tip {
  border-color: var(--bp-custom-block-tip-border);
  color: var(--bp-custom-block-tip-text);
  background-color: var(--bp-custom-block-tip-bg);
  border-left: 3px solid var(--bp-c-tip-1);
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
  border-left: 3px solid var(--bp-c-important-1);
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
  border-left: 3px solid var(--bp-c-warning-1);
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
  border-left: 3px solid var(--bp-c-danger-1);
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
  border-left: 3px solid var(--bp-c-caution-1);
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
  font-weight: 600;
  margin-bottom: 8px;
}

.custom-block p + p {
  margin: 8px 0;
}

.custom-block.details summary {
  margin: 0 0 8px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
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

/* Custom blocks in bp-doc context */
.bp-doc .custom-block {
  margin: 16px 0;
}

.bp-doc .custom-block p {
  margin: 8px 0;
  line-height: 1.6;
}

.bp-doc .custom-block p:first-child {
  margin: 0;
}

.bp-doc .custom-block div[class*='language-'],
.bp-doc .custom-block pre[data-lang] {
  margin: 8px 0 !important;
  border-radius: 5px;
}

.bp-doc .custom-block div[class*='language-'] code,
.bp-doc .custom-block pre[data-lang] code {
  font-weight: 400;
  background-color: transparent;
}

/**
 * GitHub-Flavored Alerts (Bun style)
 * -------------------------------------------------------------------------- */

.github-alert {
  border: 1px solid transparent;
  border-radius: 5px;
  padding: 16px 16px 8px;
  line-height: 1.6;
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
  line-height: 1.6;
}

.github-alert-content p {
  margin: 8px 0;
}

.github-alert-content p:first-child {
  margin-top: 0;
}

/* Note Alert */
.github-alert-note {
  border-color: var(--bp-custom-block-note-border);
  color: var(--bp-custom-block-note-text);
  background-color: var(--bp-custom-block-note-bg);
  border-left: 3px solid var(--bp-c-note-1);
}

.github-alert-note .github-alert-title {
  color: var(--bp-c-note-1);
}

.github-alert-note .github-alert-icon {
  fill: var(--bp-c-note-1);
}

/* Tip Alert */
.github-alert-tip {
  border-color: var(--bp-custom-block-tip-border);
  color: var(--bp-custom-block-tip-text);
  background-color: var(--bp-custom-block-tip-bg);
  border-left: 3px solid var(--bp-c-tip-1);
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
  border-left: 3px solid var(--bp-c-important-1);
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
  border-left: 3px solid var(--bp-c-warning-1);
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
  border-left: 3px solid var(--bp-c-caution-1);
}

.github-alert-caution .github-alert-title {
  color: var(--bp-c-caution-1);
}

.github-alert-caution .github-alert-icon {
  fill: var(--bp-c-caution-1);
}`

// Code Group CSS - Bun style tabbed code blocks
const codeGroupCSS = `/**
 * Bun Theme for BunPress - Code Groups
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
    border-radius: 5px 5px 0 0;
  }
}

/* Hidden input for tab switching */
.bp-code-group .tabs input {
  position: fixed;
  opacity: 0;
  pointer-events: none;
}

.bp-code-group .tabs label,
.code-group-tab {
  position: relative;
  display: inline-block;
  border-bottom: 2px solid transparent;
  padding: 0 12px;
  line-height: 44px;
  font-size: 14px;
  font-weight: 500;
  color: var(--bp-code-tab-text-color);
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.25s, border-color 0.25s;
  background: transparent;
  border-top: none;
  border-left: none;
  border-right: none;
  font-family: inherit;
}

.bp-code-group .tabs label::after,
.code-group-tab::after {
  position: absolute;
  right: 8px;
  bottom: -2px;
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

.bp-block,
.code-group-panel {
  padding: 16px;
}

/* Code group container */
.code-group {
  margin: 16px 0;
  border: 1px solid var(--bp-c-divider);
  border-radius: 5px;
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

// Bun-specific extra CSS
const bunExtrasCSS = `/**
 * Bun Theme for BunPress - Extra Bun-specific styles
 * -------------------------------------------------------------------------- */

/* Bun-style pill button (like the install button on bun.sh) */
/* padding: 8px 16px, border-radius: 100px, transform: scale(1.06) on hover */
.bun-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 100px;
  background-color: var(--bp-c-bun-blue);
  color: var(--bp-c-black);
  border: none;
  cursor: pointer;
  transition: transform 0.1s linear, background-color 0.25s;
}

.bun-button:hover {
  transform: scale(1.06);
  background-color: var(--bp-c-bun-blue-light);
}

.bun-button--orange {
  background-color: var(--bp-c-bun-orange);
}

.bun-button--orange:hover {
  background-color: var(--bp-c-bun-orange-light);
}

.bun-button--pink {
  background-color: var(--bp-c-bun-pink);
}

.bun-button--pink:hover {
  background-color: var(--bp-c-bun-pink-light);
}

/* Terminal command block styling */
.command-block {
  background: #111;
  color: rgb(163, 255, 133);
  border-radius: 5px;
  padding: 12px 16px;
  font-family: var(--bp-font-family-mono);
  font-size: 14px;
  line-height: 20px;
  margin: 16px 0;
}

.command-block::before {
  content: '$ ';
  color: var(--bp-c-bun-orange);
}

/* Bun tag/badge styling */
.bun-tag {
  display: inline-flex;
  align-items: center;
  background-color: rgba(31, 31, 132, 0.15);
  border-radius: 4px;
  padding: 4px 4px;
  border: none;
  box-shadow: 0px 1px 0px rgb(111 111 111);
  font-family: var(--bp-font-family-mono);
  font-size: 13px;
}

.bun-tag--command {
  background: #111;
  color: rgb(163, 255, 133);
}

.bun-tag--orange {
  background-color: rgba(248, 155, 75, 0.15);
  color: var(--bp-c-bun-orange);
}

.bun-tag--blue {
  background-color: rgba(0, 166, 225, 0.15);
  color: var(--bp-c-bun-blue);
}

.bun-tag--pink {
  background-color: rgba(230, 0, 229, 0.15);
  color: var(--bp-c-bun-pink);
}

/* Speed badge styling */
.speed-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 100px;
  background-color: var(--bp-c-success-soft);
  color: var(--bp-c-success-1);
}

/* Hero gradient text (orange to pink like bun.sh) */
.hero-gradient-text {
  background: linear-gradient(135deg, var(--bp-c-bun-orange) 0%, var(--bp-c-bun-pink) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Prefer/Avoid example styling from bun.sh */
.prefer-example > div[class*='language-']::before,
.prefer-example > pre[data-lang]::before {
  content: 'Prefer';
  position: absolute;
  top: 8px;
  left: 12px;
  z-index: 3;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
  background-color: rgba(22, 163, 74, 0.08);
  border: 1px solid rgb(22, 163, 74);
  color: rgb(22, 163, 74);
}

.avoid-example > div[class*='language-']::before,
.avoid-example > pre[data-lang]::before {
  content: 'Avoid';
  position: absolute;
  top: 8px;
  left: 12px;
  z-index: 3;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
  background-color: rgba(220, 38, 38, 0.08);
  border: 1px solid rgb(185, 28, 28);
  color: rgb(185, 28, 28);
}

/* Hover animation for interactive elements (transform: scale(1.06) from bun.sh) */
.interactive-hover {
  transition: transform 0.1s linear;
}

.interactive-hover:hover {
  transform: scale(1.06);
}`

/**
 * Get all Bun theme CSS combined
 */
export function getBunThemeCSS(): string {
  return `
/* Bun Theme for BunPress */
/* Colors extracted from bun.sh */
${varsCSS}
${baseCSS}
${customBlockCSS}
${codeGroupCSS}
${bunExtrasCSS}
`
}

/**
 * Get Bun theme CSS variables only
 */
export function getBunVars(): string {
  return varsCSS
}

/**
 * Get Bun base styles only
 */
export function getBunBase(): string {
  return baseCSS
}

/**
 * Get Bun custom block styles only
 */
export function getBunCustomBlocks(): string {
  return customBlockCSS
}

/**
 * Get Bun code group styles only
 */
export function getBunCodeGroups(): string {
  return codeGroupCSS
}

/**
 * Get Bun extra styles only
 */
export function getBunExtras(): string {
  return bunExtrasCSS
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
