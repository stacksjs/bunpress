import type { BunPressConfig } from '../packages/bunpress/src/types'
import { afterEach, expect, test } from 'bun:test'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { buildDocs } from '../packages/bunpress/bin/cli'
import { decodeHtmlEntities, startServer } from '../packages/bunpress/src/serve'

const temporary: string[] = []
const config: BunPressConfig = {
  verbose: false,
  title: 'Source links fixture',
  markdown: {},
  basePath: '/docs',
  i18n: { enabled: false, locales: ['en'] },
  themeConfig: { nav: [], sidebar: {} },
  sitemap: { enabled: false },
  rss: { enabled: false },
  robots: { enabled: false },
  search: { enabled: false },
}

async function fixture(): Promise<{ root: string, docs: string, out: string, configFile: string }> {
  const parent = process.env.BUNPRESS_SOURCE_LINK_FIXTURES || tmpdir()
  await mkdir(parent, { recursive: true })
  const root = await mkdtemp(join(parent, 'bunpress-source-links-'))
  temporary.push(root)
  const docs = join(root, 'docs')
  const files: Record<string, string> = {
    'README.md': '# Repository source only\n',
    'docs/index.md': '# Home\n',
    'docs/guides/index.md': '# Guides\n',
    'docs/guides/README.md': '# Reference\n',
    'docs/adr/decision-a.md': '# Decision\n',
    'docs/adr/decision(two).md': '# Second decision\n',
    'docs/adr/space name.md': '# Space\n',
    'docs/images/sensor.svg': '<svg xmlns="http://www.w3.org/2000/svg"></svg>\n',
    'docs/guides/start.md': [
      '# Start',
      '[decision](../adr/decision-a.md#decision)',
      '[index](index.md#guides)',
      '[readme](README.md#reference)',
      '[home](../index.md)',
      '[reference][decision-ref]',
      '[decision-ref]: ../adr/decision-a.md#decision "Decision reference"',
      '[escaped](../adr/decision\\(two\\).md)',
      '[space](../adr/space%20name.md?case=1&safe=2#space)',
      '[source](../../README.md)',
      '[external](https://example.test/original.md?x=1#keep)',
      '[image file](../images/sensor.svg)',
      '![sensor](../images/sensor.svg)',
      '`[literal](../adr/decision-a.md#decision)`',
      '',
    ].join('\n\n'),
  }
  for (const [path, contents] of Object.entries(files)) {
    await mkdir(dirname(join(root, path)), { recursive: true })
    await writeFile(join(root, path), contents)
  }
  const configFile = join(root, 'site.config.ts')
  await writeFile(configFile, `export default ${JSON.stringify(config)}\n`)
  return { root, docs, out: join(root, 'out'), configFile }
}

afterEach(async () => {
  const roots = temporary.splice(0)
  if (!process.env.BUNPRESS_SOURCE_LINK_FIXTURES)
    await Promise.all(roots.map(root => rm(root, { recursive: true, force: true })))
})

async function assertLinks(html: string): Promise<void> {
  const hrefs: string[] = []
  const images: string[] = []
  await new HTMLRewriter()
    .on('a[href]', { element: element => { hrefs.push(decodeHtmlEntities(element.getAttribute('href')!)) } })
    .on('img[src]', { element: element => { images.push(decodeHtmlEntities(element.getAttribute('src')!)) } })
    .transform(new Response(html)).text()
  expect(hrefs.filter(href => href === '/docs/adr/decision-a#decision')).toHaveLength(2)
  for (const href of ['/docs/guides/#guides', '/docs/guides/README#reference', '/docs/', '/docs/adr/decision(two)', '/docs/adr/space%20name?case=1&safe=2#space'])
    expect(hrefs).toContain(href)
  expect(html).toContain('href="/docs/adr/space%20name?case=1&amp;safe=2#space"')
  expect(hrefs).toContain('../../README.md')
  expect(hrefs).toContain('https://example.test/original.md?x=1#keep')
  expect(hrefs).toContain('../images/sensor.svg')
  expect(images).toContain('../images/sensor.svg')
  expect(html).toContain('[literal](../adr/decision-a.md#decision)')
}

test('native build resolves Markdown source links while authored source remains unchanged', async () => {
  const f = await fixture()
  const before = await readFile(join(f.docs, 'guides/start.md'), 'utf8')
  expect(await buildDocs({ dir: f.docs, outdir: f.out, config: f.configFile, searchIndex: false })).toBe(true)
  const html = await readFile(join(f.out, '.bunpress/guides/start/index.html'), 'utf8')
  await assertLinks(html)
  expect(await readFile(join(f.docs, 'guides/start.md'), 'utf8')).toBe(before)
  for (const path of ['index.html', 'guides/index.html', 'guides/README/index.html', 'adr/decision-a/index.html', 'adr/decision(two)/index.html', 'adr/space name/index.html'])
    expect(await Bun.file(join(f.out, '.bunpress', path)).exists()).toBe(true)
}, 30000)

test('native dev resolves the same source links and serves every generated destination', async () => {
  const f = await fixture()
  const { url, stop } = await startServer({ port: 0, root: f.docs, watch: false, quiet: true, config })
  try {
    const response = await fetch(`${url}/docs/guides/start`)
    expect(response.status).toBe(200)
    const html = await response.text()
    await writeFile(join(f.root, 'dev-original.html'), html)
    await assertLinks(html)
    for (const path of ['/docs/adr/decision-a', '/docs/guides/', '/docs/guides/README', '/docs/', '/docs/adr/decision(two)', '/docs/adr/space%20name']) {
      const target = await fetch(`${url}${path}`)
      expect({ path, status: target.status }).toEqual({ path, status: 200 })
    }
  }
  finally { stop() }
}, 30000)

test('a missing linked source refuses rebuild without replacing the previous complete output', async () => {
  const f = await fixture()
  expect(await buildDocs({ dir: f.docs, outdir: f.out, config: f.configFile, searchIndex: false })).toBe(true)
  const path = join(f.out, '.bunpress/guides/start/index.html')
  const previous = await readFile(path, 'utf8')
  await rm(join(f.docs, 'adr/decision-a.md'))
  expect(await buildDocs({ dir: f.docs, outdir: f.out, config: f.configFile, searchIndex: false })).toBe(false)
  expect(await readFile(path, 'utf8')).toBe(previous)
  const { url, stop } = await startServer({ port: 0, root: f.docs, watch: false, quiet: true, config })
  try {
    const response = await fetch(`${url}/docs/guides/start`)
    expect(response.status).toBe(500)
    expect(await response.text()).toBe('Documentation page could not be rendered')
  }
  finally { stop() }
}, 30000)

test('canonical output collisions refuse publication', async () => {
  const f = await fixture()
  await writeFile(join(f.docs, 'guides.md'), '# Ambiguous guides\n')
  expect(await buildDocs({ dir: f.docs, outdir: f.out, config: f.configFile, searchIndex: false })).toBe(false)
  expect(await Bun.file(join(f.out, '.bunpress/index.html')).exists()).toBe(false)
}, 30000)

test('concurrent native builds to one output publish whole source snapshots', async () => {
  const a = await fixture()
  const b = await fixture()
  await writeFile(join(b.docs, 'adr/second-build.md'), '# Second build\n')
  await writeFile(join(b.docs, 'guides/start.md'), '# Second build guide\n\n[second](../adr/second-build.md)\n')
  for (const [f, marker] of [[a, 'SOURCE_SNAPSHOT_A'], [b, 'SOURCE_SNAPSHOT_B']] as const) {
    for await (const file of new Bun.Glob('**/*.md').scan(f.docs)) {
      const path = join(f.docs, file)
      await writeFile(path, `${await readFile(path, 'utf8')}\n\n${marker}\n`)
    }
  }
  const shared = join(a.root, 'shared-output')
  expect(await Promise.all([
    buildDocs({ dir: a.docs, outdir: shared, config: a.configFile, searchIndex: false }),
    buildDocs({ dir: b.docs, outdir: shared, config: b.configFile, searchIndex: false }),
  ])).toEqual([true, true])
  const html = await readFile(join(shared, '.bunpress/guides/start/index.html'), 'utf8')
  const selected = html.includes('SOURCE_SNAPSHOT_A') ? 'SOURCE_SNAPSHOT_A' : 'SOURCE_SNAPSHOT_B'
  expect(html).toContain(selected)
  expect(html).not.toContain(selected === 'SOURCE_SNAPSHOT_A' ? 'SOURCE_SNAPSHOT_B' : 'SOURCE_SNAPSHOT_A')
  const outputRoot = join(shared, '.bunpress')
  for await (const file of new Bun.Glob('**/*.html').scan(outputRoot)) {
    if (file !== '404.html')
      expect(await readFile(join(outputRoot, file), 'utf8')).toContain(selected)
  }
  expect(await Bun.file(join(outputRoot, 'adr/second-build/index.html')).exists()).toBe(selected === 'SOURCE_SNAPSHOT_B')
}, 30000)

test('locale fallback links use the current rendered locale and explicit translated sources stay selectable', async () => {
  const f = await fixture()
  await mkdir(join(f.docs, 'es/adr'), { recursive: true })
  await writeFile(join(f.docs, 'es/adr/decision-a.md'), '# Decision\n\nLocalized source chosen.\n')
  await writeFile(join(f.docs, 'guides/README.es.md'), '# Reference\n\nLocalized reference source.\n')
  const site: BunPressConfig = { ...config, i18n: { enabled: true, locales: ['en', 'es'], defaultLocale: 'en' } }
  await writeFile(f.configFile, `export default ${JSON.stringify(site)}\n`)
  expect(await buildDocs({ dir: f.docs, outdir: f.out, config: f.configFile, searchIndex: false })).toBe(true)
  const built = await readFile(join(f.out, '.bunpress/es/guides/start/index.html'), 'utf8')
  expect(built).toContain('href="/docs/es/adr/decision-a#decision"')
  expect(built).toContain('href="/docs/es/guides/README#reference"')
  expect(built).toContain('href="/docs/es"')
  expect(await readFile(join(f.out, '.bunpress/es/adr/decision-a/index.html'), 'utf8')).toContain('Localized source chosen.')
  const { url, stop } = await startServer({ port: 0, root: f.docs, watch: false, quiet: true, config: site })
  try {
    const response = await fetch(`${url}/docs/es/guides/start`)
    expect(response.status).toBe(200)
    const html = await response.text()
    expect(html).toContain('href="/docs/es/adr/decision-a#decision"')
    expect(html).toContain('href="/docs/es/guides/README#reference"')
    const target = await fetch(`${url}/docs/es/adr/decision-a`)
    expect(target.status).toBe(200)
    expect(await target.text()).toContain('Localized source chosen.')
    // A live request gets a fresh source catalog, rather than a stale build cache.
    await rm(join(f.docs, 'es/adr/decision-a.md'))
    const fallback = await fetch(`${url}/docs/es/adr/decision-a`)
    expect(fallback.status).toBe(200)
    expect(await fallback.text()).not.toContain('Localized source chosen.')
  }
  finally { stop() }
}, 30000)

test('selected-source read failure refuses rebuild and dev render without serving a fallback', async () => {
  const f = await fixture()
  const { chmod } = await import('node:fs/promises')
  expect(await buildDocs({ dir: f.docs, outdir: f.out, config: f.configFile, searchIndex: false })).toBe(true)
  const output = join(f.out, '.bunpress/guides/start/index.html')
  const before = await readFile(output, 'utf8')
  const source = join(f.docs, 'guides/start.md')
  await chmod(source, 0o000)
  const { url, stop } = await startServer({ port: 0, root: f.docs, watch: false, quiet: true, config })
  try {
    expect(await buildDocs({ dir: f.docs, outdir: f.out, config: f.configFile, searchIndex: false })).toBe(false)
    expect(await readFile(output, 'utf8')).toBe(before)
    expect((await fetch(`${url}/docs/guides/start`)).status).toBe(500)
  }
  finally {
    stop()
    await chmod(source, 0o600)
  }
}, 30000)

test('a retained external build lock refuses publication and a later build can replace removed pages', async () => {
  const f = await fixture()
  const { basename } = await import('node:path')
  const args = { dir: f.docs, outdir: f.out, config: f.configFile, searchIndex: false }
  expect(await buildDocs(args)).toBe(true)
  const page = join(f.out, '.bunpress/guides/start/index.html')
  const before = await readFile(page, 'utf8')
  const lock = join(f.out, '.bunpress.lock')
  await mkdir(lock)
  await writeFile(join(lock, 'owner.json'), '{"pid":1,"token":"another-builder"}')
  expect(await buildDocs(args)).toBe(false)
  expect(await readFile(page, 'utf8')).toBe(before)
  expect(await readFile(join(lock, 'owner.json'), 'utf8')).toBe('{"pid":1,"token":"another-builder"}')
  await rm(lock, { recursive: true })
  await rm(join(f.docs, 'adr/decision(two).md'))
  await writeFile(join(f.docs, 'guides/start.md'), '# Updated guide\n\n[decision](../adr/decision-a.md#decision)\n')
  expect(await buildDocs(args)).toBe(true)
  expect(await Bun.file(join(f.out, '.bunpress/adr/decision(two)/index.html')).exists()).toBe(false)
  expect(await readFile(page, 'utf8')).toContain('Updated guide')
  const remnants: string[] = []
  for await (const entry of new Bun.Glob('.bunpress.*').scan({ cwd: f.out, onlyFiles: false }))
    remnants.push(basename(entry))
  expect(remnants).toEqual([])
}, 30000)

test('post-publication metadata failure restores the previous complete output and releases the lock', async () => {
  const f = await fixture()
  const args = { dir: f.docs, outdir: f.out, config: f.configFile, searchIndex: false }
  expect(await buildDocs(args)).toBe(true)
  const page = join(f.out, '.bunpress/guides/start/index.html')
  const before = await readFile(page, 'utf8')
  await writeFile(join(f.docs, 'guides/start.md'), '# Replacement must roll back\n')
  const manifestDirectory = join(f.root, 'manifest-directory')
  await mkdir(manifestDirectory)
  expect(await buildDocs({ ...args, manifest: manifestDirectory })).toBe(false)
  expect(await readFile(page, 'utf8')).toBe(before)
  expect(await buildDocs(args)).toBe(true)
  expect(await readFile(page, 'utf8')).toContain('Replacement must roll back')
}, 30000)

test('opaque percent-encoded asset URLs stay intact in native build and dev', async () => {
  const f = await fixture()
  await writeFile(join(f.docs, 'guides/start.md'), '# Assets\n\n[opaque asset](../assets/%FF.pdf?download=1#original)\n\n[encoded guide](../adr/decision-a%2Emd#decision)\n')
  expect(await buildDocs({ dir: f.docs, outdir: f.out, config: f.configFile, searchIndex: false })).toBe(true)
  const built = await readFile(join(f.out, '.bunpress/guides/start/index.html'), 'utf8')
  expect(built).toContain('href="../assets/%FF.pdf?download=1#original"')
  expect(built).toContain('href="/docs/adr/decision-a#decision"')
  const { url, stop } = await startServer({ port: 0, root: f.docs, watch: false, quiet: true, config })
  try {
    const response = await fetch(`${url}/docs/guides/start`)
    expect(response.status).toBe(200)
    const html = await response.text()
    expect(html).toContain('href="../assets/%FF.pdf?download=1#original"')
    expect(html).toContain('href="/docs/adr/decision-a#decision"')
  }
  finally { stop() }
}, 30000)

test('an explicit default-language source keeps that language from a translated page', async () => {
  const f = await fixture()
  await mkdir(join(f.docs, 'es/adr'), { recursive: true })
  await writeFile(join(f.docs, 'explicit.en.md'), '# English\n\nEXPLICIT_ENGLISH_CONTENT\n')
  await writeFile(join(f.docs, 'es/explicit.md'), '# Spanish\n\nTRANSLATED_CONTENT\n')
  await writeFile(join(f.docs, 'es/adr/decision-a.md'), '# Decision\n\nSPANISH_DECISION\n')
  await writeFile(join(f.docs, 'es/start.md'), '# Spanish start\n\n[English](../explicit.en.md)\n\n[current locale](../adr/decision-a.md)\n')
  const site: BunPressConfig = { ...config, i18n: { enabled: true, locales: ['en', 'es'], defaultLocale: 'en' } }
  await writeFile(f.configFile, `export default ${JSON.stringify(site)}\n`)
  expect(await buildDocs({ dir: f.docs, outdir: f.out, config: f.configFile, searchIndex: false })).toBe(true)
  const built = await readFile(join(f.out, '.bunpress/es/start/index.html'), 'utf8')
  expect(built).toContain('href="/docs/explicit"')
  expect(built).toContain('href="/docs/es/adr/decision-a"')
  expect(await readFile(join(f.out, '.bunpress/explicit/index.html'), 'utf8')).toContain('EXPLICIT_ENGLISH_CONTENT')
  const { url, stop } = await startServer({ port: 0, root: f.docs, watch: false, quiet: true, config: site })
  try {
    const response = await fetch(`${url}/docs/es/start`)
    expect(response.status).toBe(200)
    const html = await response.text()
    expect(html).toContain('href="/docs/explicit"')
    expect(html).toContain('href="/docs/es/adr/decision-a"')
    expect(await (await fetch(`${url}/docs/explicit`)).text()).toContain('EXPLICIT_ENGLISH_CONTENT')
    expect(await (await fetch(`${url}/docs/es/adr/decision-a`)).text()).toContain('SPANISH_DECISION')
  }
  finally { stop() }
}, 30000)

test('recursive included links keep their source directories and the rendered fallback locale', async () => {
  const f = await fixture()
  await mkdir(join(f.docs, 'parts/deep'), { recursive: true })
  await mkdir(join(f.docs, 'es/parts'), { recursive: true })
  await writeFile(join(f.docs, 'guides/target.md'), '# Host target\n')
  await writeFile(join(f.docs, 'parts/target.md'), '# Included target\n')
  await writeFile(join(f.docs, 'es/parts/target.md'), '# Included target\n\nSPANISH_INCLUDED_TARGET\n')
  await writeFile(join(f.docs, 'parts/deep/target.md'), '# Deep target\n')
  await writeFile(join(f.docs, 'parts/deep/snippet.md'), '[nested](target.md#deep-target)\n\n`[literal]: target.md`\n')
  await writeFile(join(f.docs, 'parts/snippet.md'), '[included](target.md#included-target)\n\n<!--@include: ./parts/deep/snippet.md-->\n\n`[literal](target.md)`\n')
  await writeFile(join(f.docs, 'guides/start.md'), '# Included source\n\n[outer](target.md#host-target)\n\n<!--@include: ./parts/snippet.md-->\n\n[outer after](target.md#host-target)\n')
  const site: BunPressConfig = { ...config, i18n: { enabled: true, locales: ['en', 'es'], defaultLocale: 'en' } }
  await writeFile(f.configFile, `export default ${JSON.stringify(site)}\n`)
  expect(await buildDocs({ dir: f.docs, outdir: f.out, config: f.configFile, searchIndex: false })).toBe(true)
  const built = await readFile(join(f.out, '.bunpress/es/guides/start/index.html'), 'utf8')
  expect(built.includes('href="/docs/es/parts/target#included-target"')).toBe(true)
  expect(built.includes('href="/docs/es/parts/deep/target#deep-target"')).toBe(true)
  expect(built.match(/href="\/docs\/es\/guides\/target#host-target"/g)).toHaveLength(2)
  expect(built).toContain('[literal](target.md)')
  expect(built).toContain('[literal]: target.md')
  expect(built).not.toContain('<!--bunpress-source-')
  const { url, stop } = await startServer({ port: 0, root: f.docs, watch: false, quiet: true, config: site })
  try {
    const response = await fetch(`${url}/docs/es/guides/start`)
    expect(response.status).toBe(200)
    const html = await response.text()
    await writeFile(join(f.root, 'included-dev-original.html'), html)
    expect(html.includes('href="/docs/es/parts/target#included-target"')).toBe(true)
    expect(html.includes('href="/docs/es/parts/deep/target#deep-target"')).toBe(true)
    expect(html.match(/href="\/docs\/es\/guides\/target#host-target"/g)).toHaveLength(2)
    expect(await (await fetch(`${url}/docs/es/parts/target`)).text()).toContain('SPANISH_INCLUDED_TARGET')
    expect((await fetch(`${url}/docs/es/parts/deep/target`)).status).toBe(200)
  }
  finally { stop() }
}, 30000)

test('unreadable included content and unsupported inline includes refuse dev rendering and preserve built output', async () => {
  const f = await fixture()
  const { chmod } = await import('node:fs/promises')
  await mkdir(join(f.docs, 'parts'), { recursive: true })
  const snippet = join(f.docs, 'parts/snippet.md')
  const host = join(f.docs, 'guides/start.md')
  await writeFile(snippet, 'Included content\n')
  await writeFile(host, '# Include host\n\n<!--@include: ./parts/snippet.md-->\n')
  const args = { dir: f.docs, outdir: f.out, config: f.configFile, searchIndex: false }
  expect(await buildDocs(args)).toBe(true)
  const output = join(f.out, '.bunpress/guides/start/index.html')
  const before = await readFile(output, 'utf8')
  const { url, stop } = await startServer({ port: 0, root: f.docs, watch: false, quiet: true, config })
  try {
    await chmod(snippet, 0o000)
    expect((await fetch(`${url}/docs/guides/start`)).status).toBe(500)
    expect(await buildDocs(args)).toBe(false)
    expect(await readFile(output, 'utf8')).toBe(before)
    await chmod(snippet, 0o600)
    await writeFile(host, '# Inline include\n\nBefore <!--@include: ./parts/snippet.md--> after\n')
    expect((await fetch(`${url}/docs/guides/start`)).status).toBe(500)
    expect(await buildDocs(args)).toBe(false)
    expect(await readFile(output, 'utf8')).toBe(before)
  }
  finally {
    stop()
    await chmod(snippet, 0o600)
  }
}, 30000)

test('reference definitions crossing include boundaries are refused instead of choosing the host target', async () => {
  const f = await fixture()
  await mkdir(join(f.docs, 'parts'), { recursive: true })
  await writeFile(join(f.docs, 'parts/target.md'), '# Included reference target\n')
  await writeFile(join(f.docs, 'guides/target.md'), '# Wrong host target\n')
  await writeFile(join(f.docs, 'parts/definitions.md'), '[shared]: target.md\n')
  const args = { dir: f.docs, outdir: f.out, config: f.configFile, searchIndex: false }
  expect(await buildDocs(args)).toBe(true)
  const output = join(f.out, '.bunpress/guides/start/index.html')
  const previous = await readFile(output, 'utf8')
  const { url, stop } = await startServer({ port: 0, root: f.docs, watch: false, quiet: true, config })
  try {
    for (const [host, included] of [
      ['[shared link][shared]\n\n<!--@include: ./parts/definitions.md-->\n', '[shared]: target.md\n'],
      ['[shared]: target.md\n\n<!--@include: ./parts/definitions.md-->\n', '[shared link][shared]\n'],
      ['[shared link][shared<code>]\n\n<!--@include: ./parts/definitions.md-->\n', '[shared<code>]: target.md\n'],
      ['[shared link][shared\\]label]\n\n<!--@include: ./parts/definitions.md-->\n', '[shared\\]label]: target.md\n'],
      ['[shared link][shared\\[label]\n\n<!--@include: ./parts/definitions.md-->\n', '[shared\\[label]: target.md\n'],
      ['[shared link][shared\nlabel]\n\n<!--@include: ./parts/definitions.md-->\n', '[shared\nlabel]: target.md\n'],
      ['[shared link][a`b]\n\n<!--@include: ./parts/definitions.md-->\n', '[a`b]: target.md "title`"\n'],
    ]) {
      await writeFile(join(f.docs, 'guides/start.md'), `# Shared references\n\n${host}`)
      await writeFile(join(f.docs, 'parts/definitions.md'), included)
      expect(await buildDocs(args)).toBe(false)
      expect(await readFile(output, 'utf8')).toBe(previous)
      const response = await fetch(`${url}/docs/guides/start`)
      expect(response.status).toBe(500)
      expect(await response.text()).toBe('Documentation page could not be rendered')
    }
  }
  finally { stop() }
}, 30000)

test('literal reference definitions in rendered code groups stay code when a document includes content', async () => {
  const f = await fixture()
  await mkdir(join(f.docs, 'parts'), { recursive: true })
  await writeFile(join(f.docs, 'parts/snippet.md'), 'Included prose\n')
  await writeFile(join(f.docs, 'guides/start.md'), [
    '[home](../index.md)\n\n# Literal references',
    '<!--@include: ./parts/snippet.md-->',
    '::: code-group\n```unknownreferenceexample [Reference syntax]\n[literal]: target.md\n```\n:::',
    '<pre><code>[html literal]: target.md</code></pre>',
    '<span title="[attribute]: target.md">Attribute example</span>',
  ].join('\n\n'))
  expect(await buildDocs({ dir: f.docs, outdir: f.out, config: f.configFile, searchIndex: false })).toBe(true)
  const built = await readFile(join(f.out, '.bunpress/guides/start/index.html'), 'utf8')
  expect(built).toContain('[literal]: target.md')
  expect(built).toContain('class="code-group"')
  expect(built).toContain('[html literal]: target.md')
  expect(built).toContain('title="[attribute]: target.md"')
  expect(built).not.toContain('<!--bunpress-source-')
  expect(built).toContain('Included prose')
  const { url, stop } = await startServer({ port: 0, root: f.docs, watch: false, quiet: true, config })
  try {
    const response = await fetch(`${url}/docs/guides/start`)
    expect(response.status).toBe(200)
    const html = await response.text()
    expect(html).toContain('[literal]: target.md')
    expect(html).toContain('class="code-group"')
    expect(html).toContain('[html literal]: target.md')
    expect(html).toContain('title="[attribute]: target.md"')
    expect(html).not.toContain('<!--bunpress-source-')
    expect(html).toContain('Included prose')
  }
  finally { stop() }
}, 30000)

test('include reference validation refuses excessive candidates without publishing partial output', async () => {
  const f = await fixture()
  await mkdir(join(f.docs, 'parts'), { recursive: true })
  await writeFile(join(f.docs, 'parts/snippet.md'), 'Included prose\n')
  const args = { dir: f.docs, outdir: f.out, config: f.configFile, searchIndex: false }
  expect(await buildDocs(args)).toBe(true)
  const output = join(f.out, '.bunpress/guides/start/index.html')
  const previous = await readFile(output, 'utf8')
  const examples = Array.from({ length: 40 }, (_, index) => `<pre><code>[example-${index}]: target.md</code></pre>`).join('\n\n')
  await writeFile(join(f.docs, 'guides/start.md'), `# Many reference examples\n\n<!--@include: ./parts/snippet.md-->\n\n${examples}\n`)
  expect(await buildDocs(args)).toBe(false)
  expect(await readFile(output, 'utf8')).toBe(previous)
  const { url, stop } = await startServer({ port: 0, root: f.docs, watch: false, quiet: true, config })
  try { expect((await fetch(`${url}/docs/guides/start`)).status).toBe(500) }
  finally { stop() }
}, 30000)
