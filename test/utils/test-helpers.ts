import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { file } from 'bun'
import type { BunPressOptions, MarkdownPluginOptions } from '../../src/types'

/**
 * Test helpers for TDD workflow
 */
export interface TestFile {
  path: string
  content: string
}

export interface TestSiteOptions {
  files: TestFile[]
  config?: Partial<BunPressOptions>
  outDir?: string
}

export interface BuildResult {
  success: boolean
  outputs: string[]
  logs: string[]
}

/**
 * Creates a temporary test directory with files
 */
export async function createTestDirectory(files: TestFile[]): Promise<string> {
  const testDir = join(import.meta.dir, 'temp', `test-${Date.now()}`)

  await mkdir(testDir, { recursive: true })

  for (const file of files) {
    const filePath = join(testDir, file.path)
    await mkdir(join(filePath, '..'), { recursive: true })
    await writeFile(filePath, file.content)
  }

  return testDir
}

/**
 * Cleans up a test directory
 */
export async function cleanupTestDirectory(dir: string): Promise<void> {
  await rm(dir, { recursive: true, force: true })
}

/**
 * Creates a test markdown file with frontmatter
 */
export function createTestMarkdown(
  content: string,
  frontmatter?: Record<string, any>
): string {
  if (!frontmatter) return content

  const frontmatterStr = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n')

  return `---\n${frontmatterStr}\n---\n\n${content}`
}

/**
 * Creates a test configuration
 */
export function createTestConfig(overrides?: Partial<BunPressOptions>): BunPressOptions {
  return {
    markdown: {
      title: 'Test Documentation',
      meta: {
        description: 'Test description',
        generator: 'BunPress Test'
      },
      css: 'body { background: #f0f0f0; }',
      scripts: ['/test.js']
    },
    verbose: true,
    ...overrides
  }
}

/**
 * Builds a test site
 */
export async function buildTestSite(options: TestSiteOptions): Promise<BuildResult> {
  const testDir = await createTestDirectory(options.files)
  const outDir = options.outDir || join(testDir, 'dist')

  try {
    const result = await Bun.build({
      entrypoints: options.files
        .filter(f => f.path.endsWith('.md'))
        .map(f => join(testDir, f.path)),
      outdir: outDir,
      plugins: [] // We'll add plugins as needed
    })

    return {
      success: result.success,
      outputs: result.outputs.map(o => o.path),
      logs: result.logs.map(l => l.message)
    }
  }
  catch (error) {
    return {
      success: false,
      outputs: [],
      logs: [error.message]
    }
  }
  finally {
    await cleanupTestDirectory(testDir)
  }
}

/**
 * Reads the content of a built HTML file
 */
export async function readBuiltFile(outDir: string, filePath: string): Promise<string> {
  const fullPath = join(outDir, filePath)
  const fileHandle = file(fullPath)
  return await fileHandle.text()
}

/**
 * Asserts that HTML contains specific content
 */
export function assertHtmlContains(html: string, selector: string, content?: string): boolean {
  if (content) {
    return html.includes(content)
  }
  return html.includes(selector)
}

/**
 * Creates a mock file system for testing
 */
export function mockFileSystem(files: Record<string, string>): Record<string, string> {
  // In a real implementation, this would mock the file system
  // For now, we'll use the actual file system with temp directories
  return files
}

/**
 * Waits for a file to exist
 */
export async function waitForFile(filePath: string, timeout = 5000): Promise<boolean> {
  const start = Date.now()

  while (Date.now() - start < timeout) {
    try {
      const f = file(filePath)
      if (await f.exists()) return true
    }
    catch {
      // File doesn't exist yet
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return false
}

/**
 * Creates test translation files for i18n testing
 */
export function createTestTranslations(): TestFile[] {
  return [
    {
      path: 'locales/en.yml',
      content: `home:
  title: Home
  description: Welcome to our site
user:
  profile:
    name: Name
    email: Email`
    },
    {
      path: 'locales/es.yml',
      content: `home:
  title: Inicio
  description: Bienvenido a nuestro sitio
user:
  profile:
    name: Nombre
    email: Correo electrónico`
    },
    {
      path: 'locales/en/app.ts',
      content: `import type { Dictionary } from '@stacksjs/ts-i18n'

export default {
  dynamic: {
    welcome: ({ name }: { name: string }) => \`Welcome, \${name}!\`,
    items: ({ count }: { count: number }) => \`You have \${count} items\`
  }
} satisfies Dictionary`
    }
  ]
}
