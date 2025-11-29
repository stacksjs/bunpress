/**
 * BunPress Themes
 *
 * This module exports all available themes for BunPress.
 * The default theme is 'vitepress' which provides VitePress-compatible styling.
 */

import vitePressTheme, { getVitePressThemeCSS } from './vitepress'

export type ThemeName = 'vitepress'

export interface Theme {
  name: string
  getCSS: () => string
}

/**
 * Available themes
 */
export const themes: Record<ThemeName, Theme> = {
  vitepress: vitePressTheme,
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

export { getVitePressThemeCSS, vitePressTheme }
export default themes
