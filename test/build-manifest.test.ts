import { afterEach, describe, expect, test } from 'bun:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  createBuildManifest,
  verifyBuildManifest,
  writeBuildManifest,
} from '../packages/bunpress/src/build-manifest'
import { markdownToHtml } from '../packages/bunpress/src/serve'

const temporaryDirectories: string[] = []

async function temporaryDirectory(): Promise<string> {
  const path = await mkdtemp(join(tmpdir(), 'bunpress-manifest-'))
  temporaryDirectories.push(path)
  return path
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map(path => rm(path, { recursive: true, force: true })))
})

describe('deterministic build manifest', () => {
  test('renders stable, distinct code-group IDs', async () => {
    const group = `::: code-group
\`\`\`ts [TypeScript]
const value: number = 1
\`\`\`
\`\`\`js [JavaScript]
const value = 1
\`\`\`
:::`
    const markdown = `${group}\n\n${group}`

    const first = await markdownToHtml(markdown, '.')
    const second = await markdownToHtml(markdown, '.')
    const ids = [...first.html.matchAll(/id="(code-group-[0-9a-f]+)"/g)].map(match => match[1])

    expect(second.html).toBe(first.html)
    expect(ids).toHaveLength(2)
    expect(ids[0]).not.toBe(ids[1])
  })

  test('sorts paths and hashes the complete output tree', async () => {
    const root = await temporaryDirectory()
    await Bun.write(join(root, 'z.txt'), 'last\n')
    await Bun.write(join(root, 'a/index.html'), '<h1>first</h1>\n')

    const first = await createBuildManifest(root, '1.2.3')
    const second = await createBuildManifest(root, '1.2.3')

    expect(first).toEqual(second)
    expect(first.outputs.map(output => output.path)).toEqual(['a/index.html', 'z.txt'])
    expect(first.tree_sha256).toMatch(/^[0-9a-f]{64}$/)
  })

  test('excludes an in-tree manifest from its own hash', async () => {
    const root = await temporaryDirectory()
    const path = join(root, 'manifest.json')
    await Bun.write(join(root, 'index.html'), 'hello')

    const first = await writeBuildManifest(root, path, '1.2.3')
    const second = await writeBuildManifest(root, path, '1.2.3')

    expect(second).toEqual(first)
    expect(second.outputs.map(output => output.path)).toEqual(['index.html'])
  })

  test('reports exact output drift', async () => {
    const root = await temporaryDirectory()
    const path = join(await temporaryDirectory(), 'manifest.json')
    await Bun.write(join(root, 'index.html'), 'before')
    await writeBuildManifest(root, path, '1.2.3')

    await Bun.write(join(root, 'index.html'), 'after')
    await Bun.write(join(root, 'new.txt'), 'new')

    await expect(verifyBuildManifest(root, path, '1.2.3')).rejects.toThrow('added: new.txt; changed: index.html')
  })
})
