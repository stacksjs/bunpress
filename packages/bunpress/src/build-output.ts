import { randomUUID } from 'node:crypto'
import { mkdir, mkdtemp, readFile, realpath, rename, rm, rmdir, writeFile } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'

const queues = new Map<string, Promise<void>>()

async function serialized<T>(key: string, work: () => Promise<T>): Promise<T> {
  const previous = queues.get(key) ?? Promise.resolve()
  let release!: () => void
  const current = new Promise<void>(done => { release = done })
  const tail = previous.then(() => current)
  queues.set(key, tail)
  await previous
  try { return await work() }
  finally {
    release()
    if (queues.get(key) === tail)
      queues.delete(key)
  }
}

function missing(error: unknown): boolean {
  return error !== null && typeof error === 'object' && 'code' in error && error.code === 'ENOENT'
}

/** A complete replacement, serialized locally and locked against other build processes. */
export async function withBuildOutput<T>(directory: string, render: (staging: string) => Promise<T>, afterPublish?: () => Promise<void>): Promise<T> {
  const requested = resolve(directory)
  await mkdir(dirname(requested), { recursive: true })
  const target = join(await realpath(dirname(requested)), basename(requested))
  return serialized(target, async () => {
    const lock = `${target}.lock`
    try { await mkdir(lock, { mode: 0o700 }) }
    catch (error) {
      if (error !== null && typeof error === 'object' && 'code' in error && error.code === 'EEXIST')
        throw new Error(`Documentation output is locked: ${lock}. Verify the recorded owner has stopped before removing a stale lock.`)
      throw error
    }
    const owner = JSON.stringify({ pid: process.pid, token: randomUUID() })
    const ownerPath = join(lock, 'owner.json')
    let staging: string | undefined
    let backup: string | undefined
    let published = false
    let committed = false
    try {
      await writeFile(ownerPath, owner, { flag: 'wx', mode: 0o600 })
      staging = await mkdtemp(`${target}.tmp-`)
      const result = await render(staging)
      const previous = `${staging}.previous`
      try { await rename(target, previous); backup = previous }
      catch (error) { if (!missing(error)) throw error }
      await rename(staging, target)
      published = true
      await afterPublish?.()
      committed = true
      if (backup)
        await rm(backup, { recursive: true })
      return result
    }
    catch (error) {
      if (!committed && (published || backup)) {
        try {
          if (published)
            await rm(target, { recursive: true })
          if (backup)
            await rename(backup, target)
        }
        catch (rollback) {
          throw new AggregateError([error, rollback], `Documentation publication failed; previous output is retained at ${backup ?? target}`)
        }
      }
      throw error
    }
    finally {
      try {
        if (staging)
          await rm(staging, { recursive: true, force: true })
      }
      finally {
        // Never delete a replacement owner's lock after external intervention.
        const recorded = await readFile(ownerPath, 'utf8').catch(() => undefined)
        if (recorded === owner) {
          await rm(ownerPath)
          await rmdir(lock)
        }
        else {
          throw new Error(`Documentation output lock ownership changed: ${lock}`)
        }
      }
    }
  })
}
