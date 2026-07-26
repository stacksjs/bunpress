import { describe, expect, test } from 'bun:test'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { resolveConfig } from '../packages/bunpress/bin/cli'

describe('resolveConfig --config', () => {
  test('layers an explicit config file over the discovered one', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'bp-cfg-'))
    const file = join(dir, 'custom.config.ts')
    writeFileSync(file, `export default { title: 'From Explicit Config', analytics: { enabled: true, siteId: 'zig-utils', scriptSrc: 'https://analyticshq.org/script.js' } }\n`)

    const resolved = await resolveConfig({ config: file })
    expect(resolved.title).toBe('From Explicit Config')
    expect(resolved.analytics?.scriptSrc).toBe('https://analyticshq.org/script.js')
  })

  test('falls back to the discovered config when no --config is given', async () => {
    const resolved = await resolveConfig({})
    expect(resolved).toBeDefined()
    expect(resolved.title).not.toBe('From Explicit Config')
  })

  test('fails loudly on a missing config path rather than silently ignoring it', async () => {
    await expect(resolveConfig({ config: '/nope/missing.config.ts' })).rejects.toThrow(/not found/i)
  })
})
