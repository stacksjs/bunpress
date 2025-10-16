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
 * Render a template with data
 */
export function renderTemplate(template: string, data: Record<string, any>): string {
  let result = template

  for (const [key, value] of Object.entries(data)) {
    const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    result = result.replace(placeholder, value ?? '')
  }

  return result
}

/**
 * Load and render a template in one step
 */
export async function render(templateName: string, data: Record<string, any>): Promise<string> {
  const template = await loadTemplate(templateName)
  return renderTemplate(template, data)
}

/**
 * Clear the template cache (useful for development/hot reloading)
 */
export function clearTemplateCache(): void {
  templateCache.clear()
}
