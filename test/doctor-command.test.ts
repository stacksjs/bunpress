import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { doctorCommand } from '../packages/bunpress/bin/commands/doctor'

/**
 * `bunpress doctor` exits non-zero when a check fails, so a false alarm is not
 * cosmetic — it fails a CI job for a project that is set up correctly.
 */

const ORIGINAL_CWD = process.cwd()
let workdir = ''
/** Everything doctor printed during the last run. */
let output = ''

/** Run doctor with console output captured. */
async function runDoctor(options: { dir?: string, verbose?: boolean } = {}): Promise<boolean> {
  const lines: string[] = []
  const realLog = console.log
  console.log = (...args: unknown[]) => void lines.push(args.map(String).join(' '))

  try {
    return await doctorCommand(options)
  }
  finally {
    console.log = realLog
    output = lines.join('\n')
  }
}

beforeEach(async () => {
  workdir = await mkdtemp(join(tmpdir(), 'bp-doctor-'))
  process.chdir(workdir)
  await writeFile('package.json', JSON.stringify({ name: 'docs-site', scripts: { dev: 'bunpress dev', build: 'bunpress build' } }))
})

afterEach(async () => {
  process.chdir(ORIGINAL_CWD)
  await rm(workdir, { recursive: true, force: true })
})

describe('doctor: docs directory', () => {
  it('accepts a docs directory other than ./docs', async () => {
    // The directory used to be hardcoded to ./docs, so every project with a
    // custom `docsDir` was told its documentation did not exist — a failing
    // check, which exits 1.
    await mkdir('content', { recursive: true })
    await writeFile(join('content', 'index.md'), '# Hello')

    const ok = await runDoctor({ dir: './content' })

    expect(ok).toBe(true)
    expect(output).toContain('1 markdown files in ./content')
    expect(output).not.toContain('./content not found')
  })

  it('still fails when the docs directory really is missing', async () => {
    const ok = await runDoctor({ dir: './content' })

    expect(ok).toBe(false)
    expect(output).toContain('bunpress init')
  })

  it('warns, but does not fail, on a docs directory with no markdown', async () => {
    await mkdir('content', { recursive: true })

    const ok = await runDoctor({ dir: './content' })

    expect(ok).toBe(true)
    expect(output).toContain('0 markdown files')
  })
})

describe('doctor: configuration detection', () => {
  // bunfig loads any of these; doctor used to look only for `.ts` and `.js`
  // under the name `bunpress`, and called everything else "no config file".
  for (const name of ['bunpress.config.mjs', '.bunpress.config.ts', 'docs.config.ts', 'bunpress.config.json']) {
    it(`finds ${name}`, async () => {
      await writeFile(name, name.endsWith('.json') ? '{}' : 'export default {}')
      await mkdir('docs', { recursive: true })
      await writeFile(join('docs', 'index.md'), '# Hello')

      await runDoctor({ dir: './docs' })

      expect(output).toContain(name)
    })
  }

  it('treats a missing config as a passing state, not a problem', async () => {
    await mkdir('docs', { recursive: true })
    await writeFile(join('docs', 'index.md'), '# Hello')

    await runDoctor({ dir: './docs' })

    expect(output).toContain('using defaults')
  })
})

describe('doctor: remediation', () => {
  it('prints advice when the only unhappy checks are warnings', async () => {
    // The advice used to live inside the `failCount > 0` branch, so a run with
    // warnings and no failures — the ordinary "your setup is incomplete" case
    // — printed no guidance at all.
    await mkdir('docs', { recursive: true })
    await writeFile(join('docs', 'index.md'), '# Hello')

    const ok = await runDoctor({ dir: './docs' })

    expect(ok).toBe(true)
    expect(output).toContain('Recommended actions')
    expect(output).toContain('bun install')
  })

  it('does not claim BunPress is missing from its own repository', async () => {
    await mkdir(join('packages', 'bunpress'), { recursive: true })
    await writeFile(join('packages', 'bunpress', 'package.json'), '{"name":"@stacksjs/bunpress"}')
    await mkdir('docs', { recursive: true })
    await writeFile(join('docs', 'index.md'), '# Hello')

    await runDoctor({ dir: './docs' })

    expect(output).toContain('source repository')
    expect(output).not.toContain('bun add -d @stacksjs/bunpress')
  })
})

describe('doctor: verbose', () => {
  it('adds detail only when asked', async () => {
    await mkdir('docs', { recursive: true })
    await writeFile(join('docs', 'index.md'), '# Hello')

    await runDoctor({ dir: './docs' })
    expect(output).not.toContain('Looked for:')

    await runDoctor({ dir: './docs', verbose: true })
    expect(output).toContain('Looked for:')
  })
})

describe('--dir does not mask config docsDir', () => {
  it('leaves --dir unset so the configured directory can win', () => {
    // `--dir` defaulting to './docs' made `options.dir || config.docsDir` pick
    // the flag every time, which silently disabled the `docsDir` config option
    // for doctor, stats, seo:check and llm.
    const cli = readFileSync(join(ORIGINAL_CWD, 'packages', 'bunpress', 'bin', 'cli.ts'), 'utf8')
    const withDefault = [...cli.matchAll(/\.option\('--dir <dir>'[^\n]*\n?/g)]
      .map(match => match[0])
      .filter(line => line.includes('default:'))

    expect(withDefault, `--dir must not declare a default:\n${withDefault.join('')}`).toHaveLength(0)
  })
})
