import { describe, expect, test } from 'bun:test'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { findBrokenInternalLinks, serializeFrontmatter } from '../packages/bunpress/bin/commands/seo'

function createDocsFixture(): { docsDir: string, currentFile: string } {
  const docsDir = mkdtempSync(join(tmpdir(), 'bunpress-seo-'))
  mkdirSync(join(docsDir, 'guide'), { recursive: true })
  mkdirSync(join(docsDir, 'architecture'), { recursive: true })
  writeFileSync(join(docsDir, 'guide', 'queues.md'), '# Queues\n')
  writeFileSync(join(docsDir, 'architecture', 'index.md'), '# Architecture\n')
  const currentFile = join(docsDir, 'guide', 'index.md')
  writeFileSync(currentFile, '# Guide\n')
  return { docsDir, currentFile }
}

describe('SEO internal link checks', () => {
  test('serializes parseable block-style frontmatter', () => {
    const output = serializeFrontmatter({ title: 'Queues', description: 'Run work in the background.' }, '# Queues\n')

    expect(output).toBe('---\ntitle: Queues\ndescription: Run work in the background.\n---\n# Queues\n')
  })

  test('resolves site-absolute clean URLs and directory indexes', () => {
    const { docsDir, currentFile } = createDocsFixture()
    const markdown = '[Queues](/guide/queues) [Architecture](/architecture/)'

    expect(findBrokenInternalLinks(markdown, docsDir, currentFile)).toEqual([])
  })

  test('resolves relative links with fragments and query strings', () => {
    const { docsDir, currentFile } = createDocsFixture()
    const markdown = '[Queues](queues#workers) [Architecture](../architecture/?view=full)'

    expect(findBrokenInternalLinks(markdown, docsDir, currentFile)).toEqual([])
  })

  test('ignores links inside code and comments, then reports missing content links', () => {
    const { docsDir, currentFile } = createDocsFixture()
    const markdown = [
      '```ts',
      "const template = '[Release]({{compareUrl}})'",
      '```',
      '`[pattern]([^"\\s]*)`',
      '<!-- [Draft diagram](../images/not-published.png) -->',
      '[Missing](/guide/missing)',
    ].join('\n')

    expect(findBrokenInternalLinks(markdown, docsDir, currentFile)).toEqual(['/guide/missing'])
  })
})
