import { describe, expect, it } from 'bun:test'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { checkConfiguredLinks, findBrokenInternalLinks } from '../packages/bunpress/bin/commands/seo'
import type { BunPressConfig } from '../packages/bunpress/src/types'

/**
 * `seo:check` is the command that is supposed to catch broken links before
 * they ship. It used to discard the `#fragment` of every link and never look
 * at nav or sidebar entries, so a link to a real page with a heading that does
 * not exist read as healthy — and a broken sidebar anchor, which appears on
 * every page of the site, was invisible.
 */

function fixture(): { docsDir: string, currentFile: string } {
  const docsDir = mkdtempSync(join(tmpdir(), 'bunpress-anchors-'))

  writeFileSync(join(docsDir, 'config.md'), [
    '# Configuration',
    '',
    '## Fathom Analytics Configuration',
    '',
    '## Custom Slug {#my-custom-id}',
    '',
    '## Repeated',
    '',
    '## Repeated',
    '',
    '## Custom Collision {#repeated}',
    '',
    '```markdown',
    '## Heading In A Fence',
    '```',
  ].join('\n'))

  // `/advanced` names both a file and a directory, which is where a bare
  // existence check goes wrong.
  mkdirSync(join(docsDir, 'advanced'), { recursive: true })
  writeFileSync(join(docsDir, 'advanced', 'ci-cd.md'), '# CI\n')
  writeFileSync(join(docsDir, 'advanced.md'), '# Advanced\n\n## API Reference\n')

  const currentFile = join(docsDir, 'index.md')
  writeFileSync(currentFile, '# Home\n\n## Getting Started\n')

  return { docsDir, currentFile }
}

describe('anchor targets', () => {
  it('accepts a fragment that matches a heading', () => {
    const { docsDir, currentFile } = fixture()
    const markdown = '[Fathom](/config#fathom-analytics-configuration)'

    expect(findBrokenInternalLinks(markdown, docsDir, currentFile)).toEqual([])
  })

  it('reports a fragment that matches no heading', () => {
    const { docsDir, currentFile } = fixture()
    const markdown = '[Fathom](/config#fathom-analytics)'

    expect(findBrokenInternalLinks(markdown, docsDir, currentFile)).toEqual(['/config#fathom-analytics'])
  })

  it('honours an explicit {#custom-id} anchor', () => {
    const { docsDir, currentFile } = fixture()

    expect(findBrokenInternalLinks('[x](/config#my-custom-id)', docsDir, currentFile)).toEqual([])
    // The heading text itself is not the anchor once a custom id is given.
    expect(findBrokenInternalLinks('[x](/config#custom-slug)', docsDir, currentFile)).toEqual(['/config#custom-slug'])
  })

  it('reserves the suffixed slugs duplicate headings receive', () => {
    const { docsDir, currentFile } = fixture()

    expect(findBrokenInternalLinks('[x](/config#repeated)', docsDir, currentFile)).toEqual([])
    expect(findBrokenInternalLinks('[x](/config#repeated-1)', docsDir, currentFile)).toEqual([])
    expect(findBrokenInternalLinks('[x](/config#repeated-2)', docsDir, currentFile)).toEqual([])
  })

  it('ignores headings that only appear inside a code fence', () => {
    const { docsDir, currentFile } = fixture()

    expect(findBrokenInternalLinks('[x](/config#heading-in-a-fence)', docsDir, currentFile))
      .toEqual(['/config#heading-in-a-fence'])
  })

  it('checks same-page anchors against the current file', () => {
    const { docsDir, currentFile } = fixture()

    expect(findBrokenInternalLinks('[x](#getting-started)', docsDir, currentFile)).toEqual([])
    expect(findBrokenInternalLinks('[x](#nope)', docsDir, currentFile)).toEqual(['#nope'])
  })

  it('resolves a target that is both a file and a directory to the file', () => {
    const { docsDir, currentFile } = fixture()

    // advanced/ exists as a directory; the headings live in advanced.md.
    expect(findBrokenInternalLinks('[x](/advanced#api-reference)', docsDir, currentFile)).toEqual([])
  })
})

describe('configured nav and sidebar links', () => {
  function report(): { totalPages: number, errors: Array<{ message: string, file: string }>, warnings: unknown[], passed: number } {
    return { totalPages: 0, errors: [], warnings: [], passed: 0 }
  }

  it('reports a broken sidebar anchor', () => {
    const { docsDir } = fixture()
    const result = report()

    checkConfiguredLinks({
      markdown: { sidebar: { '/': [{ text: 'Fathom', link: '/config#fathom-analytics' }] } },
    } as unknown as BunPressConfig, docsDir, result as never)

    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].message).toContain('/config#fathom-analytics')
    expect(result.errors[0].file).toContain('sidebar')
  })

  it('reports a nav entry pointing at a page that does not exist', () => {
    const { docsDir } = fixture()
    const result = report()

    checkConfiguredLinks({ nav: [{ text: 'API', link: '/api' }] } as unknown as BunPressConfig, docsDir, result as never)

    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].message).toContain('/api')
  })

  it('walks nested sidebar items', () => {
    const { docsDir } = fixture()
    const result = report()

    checkConfiguredLinks({
      markdown: { sidebar: { '/': [{ text: 'Group', items: [{ text: 'Bad', link: '/missing' }] }] } },
    } as unknown as BunPressConfig, docsDir, result as never)

    expect(result.errors).toHaveLength(1)
  })

  it('passes on links that resolve', () => {
    const { docsDir } = fixture()
    const result = report()

    checkConfiguredLinks({
      nav: [{ text: 'Advanced', link: '/advanced#api-reference' }],
      markdown: { sidebar: { '/': [{ text: 'Config', link: '/config' }] } },
    } as unknown as BunPressConfig, docsDir, result as never)

    expect(result.errors).toEqual([])
  })

  it('leaves external links alone', () => {
    const { docsDir } = fixture()
    const result = report()

    checkConfiguredLinks({
      nav: [{ text: 'GitHub', link: 'https://github.com/stacksjs/bunpress' }],
    } as unknown as BunPressConfig, docsDir, result as never)

    expect(result.errors).toEqual([])
  })
})
