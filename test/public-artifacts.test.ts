import { expect, test } from 'bun:test'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { startServer } from '../packages/bunpress/src/serve'

test('mounted docs serve public HTML, directory indexes and JSON without wrapping or escaping the root', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'bunpress-public-'))
  const root = join(directory, 'docs')
  await mkdir(join(root, 'public/diagrams/model'), { recursive: true })
  const html = '<!doctype html><title>Training schema</title><h1>Interactive model</h1>'
  await writeFile(join(root, 'public/diagrams/model/index.html'), html)
  await writeFile(join(root, 'public/diagrams/model/schema.json'), '{"tables":23}')
  await writeFile(join(root, 'private.json'), '{"private":true}')
  await writeFile(join(directory, 'outside.css'), 'private outside file')
  const { server, stop } = await startServer({ root, port: 0, quiet: true, config: { verbose: false, markdown: {}, basePath: '/docs' } })
  const get = (path: string) => fetch(`http://127.0.0.1:${server.port}/docs${path}`)
  try {
    for (const path of ['/diagrams/model/index.html', '/diagrams/model', '/diagrams/model/']) {
      const response = await get(path)
      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toContain('text/html')
      expect(await response.text()).toBe(html)
    }
    const schema = await get('/diagrams/model/schema.json')
    expect(schema.headers.get('content-type')).toContain('application/json')
    expect(await schema.json()).toEqual({ tables: 23 })
    expect((await get('/private.json')).status).toBe(404)
    expect((await get('/%2e%2e%2foutside.css')).status).toBe(404)
    expect((await get('/%ZZ.css')).status).toBe(400)
  }
  finally { stop(); await rm(directory, { recursive: true, force: true }) }
})
