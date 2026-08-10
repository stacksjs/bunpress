import { join } from 'node:path'

const TEMPLATES_DIR = join(import.meta.dir, 'templates')

// Cache for loaded templates
const templateCache = new Map<string, string>()

/**
 * Load a template file from the templates directory
 */
export async function loadTemplate(name: string): Promise<string> {
  if (templateCache.has(name)) {
    return templateCache.get(name)!
  }

  const templatePath = join(TEMPLATES_DIR, `${name}.stx`)
  const file = Bun.file(templatePath)

  if (!await file.exists()) {
    throw new Error(`Template not found: ${name}`)
  }

  const content = await file.text()
  templateCache.set(name, content)
  return content
}

/**
 * Render a bundled Bunpress template.
 * Supports escaped {{ key }} and raw {!! key !!} placeholders.
 */
export async function renderTemplate(template: string, data: Record<string, any>): Promise<string> {
  return interpolateTemplate(template, data)
}

/**
 * Load and render a template in one step
 */
export async function render(templateName: string, data: Record<string, any>): Promise<string> {
  const template = await loadTemplate(templateName)
  return interpolateTemplate(template, data)
}

/**
 * Clear the template cache (useful for development/hot reloading)
 */
export function clearTemplateCache(): void {
  templateCache.clear()
}

/**
 * Substitute both placeholder syntaxes in a SINGLE pass.
 *
 * Two sequential `.replace()` calls would rescan the text injected by the
 * first one: a page that legitimately documents `{{ content }}` (in a table
 * cell, say) would have the whole rendered page spliced back into itself on
 * the second pass. One pass means substituted values are never re-scanned.
 */
function interpolateTemplate(template: string, data: Record<string, any>): string {
  return template.replace(
    /\{!!\s*([\w.]+)\s*!!\}|\{\{\s*([\w.]+)\s*\}\}/g,
    (_match, rawKey: string | undefined, escapedKey: string | undefined) => {
      if (rawKey !== undefined)
        return stringifyValue(readTemplateValue(data, rawKey))

      return escapeHtml(stringifyValue(readTemplateValue(data, escapedKey!)))
    },
  )
}

function readTemplateValue(data: Record<string, any>, key: string): unknown {
  return key.split('.').reduce<unknown>((value, part) => {
    if (value == null || typeof value !== 'object')
      return undefined

    return (value as Record<string, unknown>)[part]
  }, data)
}

function stringifyValue(value: unknown): string {
  if (value == null)
    return ''

  return String(value)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
