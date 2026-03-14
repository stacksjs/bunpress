/**
 * BunPress Themes
 *
 * This module exports all available themes for BunPress.
 * The default theme is 'vitepress' which provides VitePress-compatible styling.
 * The 'bun' theme provides Bun-inspired styling with warm orange accents.
 */

import vitePressTheme, { getVitePressThemeCSS } from './vitepress'
import bunTheme, { getBunThemeCSS } from './bun'

export type ThemeName = 'vitepress' | 'bun'

export interface Theme {
  name: string
  getCSS: () => string
}

/**
 * Available themes
 */
export const themes: Record<ThemeName, Theme> = {
  vitepress: vitePressTheme,
  bun: bunTheme,
}

/**
 * Get theme CSS by name
 */
export function getThemeCSS(themeName: ThemeName = 'vitepress'): string {
  const theme = themes[themeName]
  if (!theme) {
    console.warn(`[BunPress] Unknown theme: ${themeName}, falling back to vitepress`)
    return getVitePressThemeCSS()
  }
  return theme.getCSS()
}

/**
 * Default theme name
 */
export const defaultTheme: ThemeName = 'vitepress'

export { getVitePressThemeCSS, vitePressTheme, getBunThemeCSS, bunTheme }
export default themes
