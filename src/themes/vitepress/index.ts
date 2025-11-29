/**
 * VitePress Theme for BunPress
 *
 * This theme provides VitePress-compatible styling for BunPress documentation sites.
 * It includes the same color palette, typography, and component styles as VitePress.
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Load CSS file content
 */
function loadCSS(filename: string): string {
  try {
    return readFileSync(join(__dirname, filename), 'utf-8')
  }
  catch {
    console.warn(`[VitePress Theme] Could not load ${filename}`)
    return ''
  }
}

/**
 * Get all VitePress theme CSS combined
 */
export function getVitePressThemeCSS(): string {
  const vars = loadCSS('vars.css')
  const base = loadCSS('base.css')
  const customBlock = loadCSS('custom-block.css')
  const codeGroup = loadCSS('code-group.css')

  return `
/* VitePress Theme for BunPress */
${vars}
${base}
${customBlock}
${codeGroup}
`
}

/**
 * Get VitePress theme CSS variables only
 */
export function getVitePressVars(): string {
  return loadCSS('vars.css')
}

/**
 * Get VitePress base styles only
 */
export function getVitePressBase(): string {
  return loadCSS('base.css')
}

/**
 * Get VitePress custom block styles only
 */
export function getVitePressCustomBlocks(): string {
  return loadCSS('custom-block.css')
}

/**
 * Get VitePress code group styles only
 */
export function getVitePressCodeGroups(): string {
  return loadCSS('code-group.css')
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
