import { join } from 'node:path'

/**
 * stx component resolution for markdown / pages (VitePress-with-Vue style).
 *
 * Any PascalCase tag in markdown content is treated as a component reference
 * and resolved against the components directory (default `<docsDir>/.components`):
 *
 *   <Callout type="tip">Hello **world**</Callout>
 *   <ProgressBar :value="data.test262.percentage" />
 *
 * The matching `.stx` file is rendered with stx, receiving the parsed
 * attributes as props (plus the surrounding context), and the inner content as
 * a `slot` string. Bound props (`:value="expr"` or `value={expr}`) are
 * evaluated against the page context; plain attributes are passed as strings;
 * valueless attributes become boolean `true`.
 *
 * Fenced code blocks and inline code spans are masked before resolution so
 * documentation that shows `<Component />` literally is never touched.
 */
const componentCache = new Map<string, string | null>()

// Sentinels use NUL bytes so they can never collide with real document text
// and survive stx rendering untouched.
const MASK_PREFIX = '\u0000BPCODE'
const MASK_SUFFIX = '\u0000'

/** Load a component's source by PascalCase name. Returns null if not found. */
async function loadComponent(componentsDir: string, name: string): Promise<string | null> {
  const cacheKey = join(componentsDir, name)
  if (componentCache.has(cacheKey))
    return componentCache.get(cacheKey)!

  const candidates = [
    join(componentsDir, `${name}.stx`),
    join(componentsDir, name, 'index.stx'),
  ]

  let src: string | null = null
  for (const path of candidates) {
    const file = Bun.file(path)
    if (await file.exists()) {
      src = await file.text()
      break
    }
  }

  componentCache.set(cacheKey, src)
  return src
}

/** Clear the component cache (used for dev-server hot reloading). */
export function clearComponentCache(): void {
  componentCache.clear()
}

function evalExpr(expr: string, context: Record<string, unknown>): unknown {
  try {
    const keys = Object.keys(context)
    const vals = keys.map(k => context[k])
    // eslint-disable-next-line no-new-func
    return new Function(...keys, `"use strict"; return (${expr});`)(...vals)
  }
  catch {
    return undefined
  }
}

function parseProps(attrString: string, context: Record<string, unknown>): Record<string, unknown> {
  const props: Record<string, unknown> = {}
  if (!attrString)
    return props

  const re = /([:@]?[\w-]+)(?:=(?:"([^"]*)"|'([^']*)'|\{([^}]*)\}))?/g
  let m: RegExpExecArray | null
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(attrString))) {
    const rawName = m[1]
    if (!rawName)
      continue
    const bound = rawName.startsWith(':')
    const name = rawName.replace(/^[:@]/, '')
    const dq = m[2]
    const sq = m[3]
    const brace = m[4]
    const rawVal = dq ?? sq ?? brace

    if (rawVal === undefined)
      props[name] = true
    else if (bound || brace !== undefined)
      props[name] = evalExpr(rawVal, context)
    else
      props[name] = rawVal
  }
  return props
}

/**
 * Resolve PascalCase component tags in `content` to rendered HTML.
 *
 * @param content       Markdown (or page) source to scan.
 * @param componentsDir Directory holding `.stx` component files.
 * @param context       Variables available to bound props and components.
 * @param depth         Internal recursion guard for components emitting components.
 */
export async function resolveStxComponents(
  content: string,
  componentsDir: string,
  context: Record<string, unknown>,
  depth = 0,
): Promise<string> {
  if (depth > 10 || !content.includes('<'))
    return content

  // Mask code so literal component examples in docs are never resolved.
  const code: string[] = []
  const masked = content
    .replace(/```[\s\S]*?```/g, (m) => {
      code.push(m)
      return `${MASK_PREFIX}${code.length - 1}${MASK_SUFFIX}`
    })
    .replace(/`[^`\n]*`/g, (m) => {
      code.push(m)
      return `${MASK_PREFIX}${code.length - 1}${MASK_SUFFIX}`
    })

  const tagRe = /<([A-Z][A-Za-z0-9]*)((?:\s[^>]*?)?)(\/?)>/g
  let result = ''
  let lastIndex = 0
  let changed = false
  let m: RegExpExecArray | null

  // eslint-disable-next-line no-cond-assign
  while ((m = tagRe.exec(masked))) {
    const full = m[0]
    const name = m[1]
    const attrs = m[2]
    const selfClose = m[3]

    const src = await loadComponent(componentsDir, name)
    if (src == null)
      continue // Not a known component — leave the tag untouched.

    changed = true
    result += masked.slice(lastIndex, m.index)

    let slot = ''
    let endIndex = m.index + full.length
    if (!selfClose) {
      const closeRe = new RegExp(`</${name}>`, 'g')
      closeRe.lastIndex = endIndex
      const cm = closeRe.exec(masked)
      if (cm) {
        slot = masked.slice(endIndex, cm.index).trim()
        endIndex = cm.index + cm[0].length
      }
    }

    const props = parseProps(attrs.trim(), context)
    let rendered: string
    try {
      // Import the renderer entry point directly. The package root initializes
      // unrelated browser, image, and application subsystems whose platform
      // dependencies must not decide whether static component rendering works.
      const { renderString } = await import('@stacksjs/stx/render')
      rendered = await renderString(src, { ...context, ...props, slot }, { injectCSS: false, templateOnly: true })
    }
    catch (error) {
      const detail = error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to render BunPress component ${name}: ${detail}`, { cause: error })
    }

    result += rendered
    lastIndex = endIndex
    tagRe.lastIndex = endIndex
  }
  result += masked.slice(lastIndex)

  // Restore masked code spans.
  result = result.replace(/\u0000BPCODE(\d+)\u0000/g, (_, i) => code[Number(i)] ?? '')

  // Components may themselves emit component tags — resolve again.
  if (changed)
    return resolveStxComponents(result, componentsDir, context, depth + 1)

  return result
}
