import { bench, group, run } from 'mitata'
import { startServer } from '../src/serve'
import { cleanupFiles, formatDuration, generateMarkdownFiles, measureMemory } from './utils'

/**
 * Development Server Performance Benchmarks
 *
 * Measures dev server startup time, hot reload,
 * and request response times
 */

const FIXTURES_DIR = './benchmarks/fixtures/dev-server'
const TEST_PORT = 9000

async function setupDevServer(fileCount: number = 50) {
  await cleanupFiles(FIXTURES_DIR)
  await generateMarkdownFiles(fileCount, FIXTURES_DIR)
}

group('Server startup', () => {
  bench('cold start (50 files)', async () => {
    await setupDevServer(50)
    const memBefore = measureMemory()
    const startTime = performance.now()

    const { stop } = await startServer({
      port: TEST_PORT,
      root: FIXTURES_DIR,
      watch: false,
    })

    const startupTime = performance.now() - startTime
    const memAfter = measureMemory()

    console.log(`  Startup time: ${formatDuration(startupTime)}`)
    console.log(`  Memory: ${memAfter - memBefore}MB`)

    stop()
  })

  bench('cold start (100 files)', async () => {
    await setupDevServer(100)
    const startTime = performance.now()

    const { stop } = await startServer({
      port: TEST_PORT + 1,
      root: FIXTURES_DIR,
      watch: false,
    })

    const startupTime = performance.now() - startTime
    console.log(`  Startup time: ${formatDuration(startupTime)}`)

    stop()
  })

  bench('cold start (500 files)', async () => {
    await setupDevServer(500)
    const startTime = performance.now()

    const { stop } = await startServer({
      port: TEST_PORT + 2,
      root: FIXTURES_DIR,
      watch: false,
    })

    const startupTime = performance.now() - startTime
    console.log(`  Startup time: ${formatDuration(startupTime)}`)

    stop()
  })
})

group('Request performance', () => {
  let serverStop: () => void

  bench('initial page load', async () => {
    await setupDevServer(100)

    const { stop } = await startServer({
      port: TEST_PORT + 3,
      root: FIXTURES_DIR,
      watch: false,
    })
    serverStop = stop

    const startTime = performance.now()
    const response = await fetch(`http://localhost:${TEST_PORT + 3}/doc-0000`)
    await response.text()
    const loadTime = performance.now() - startTime

    console.log(`  Load time: ${formatDuration(loadTime)}`)
    console.log(`  Status: ${response.status}`)
  })

  bench('subsequent page load', async () => {
    const startTime = performance.now()
    const response = await fetch(`http://localhost:${TEST_PORT + 3}/doc-0001`)
    await response.text()
    const loadTime = performance.now() - startTime

    console.log(`  Load time: ${formatDuration(loadTime)}`)
  })

  bench('parallel requests (10)', async () => {
    const startTime = performance.now()

    const requests = Array.from({ length: 10 }, (_, i) =>
      fetch(`http://localhost:${TEST_PORT + 3}/doc-${String(i).padStart(4, '0')}`).then(r => r.text()),
    )

    await Promise.all(requests)
    const totalTime = performance.now() - startTime

    console.log(`  Total time: ${formatDuration(totalTime)}`)
    console.log(`  Avg per request: ${formatDuration(totalTime / 10)}`)

    serverStop()
  })
})

group('Static assets', () => {
  bench('serve markdown file', async () => {
    await setupDevServer(10)

    const { stop } = await startServer({
      port: TEST_PORT + 4,
      root: FIXTURES_DIR,
      watch: false,
    })

    const startTime = performance.now()
    const response = await fetch(`http://localhost:${TEST_PORT + 4}/doc-0000`)
    const html = await response.text()
    const loadTime = performance.now() - startTime

    console.log(`  Load time: ${formatDuration(loadTime)}`)
    console.log(`  Size: ${(html.length / 1024).toFixed(2)}KB`)

    stop()
  })
})

group('Memory under load', () => {
  bench('100 sequential requests', async () => {
    await setupDevServer(50)
    const memBefore = measureMemory()

    const { stop } = await startServer({
      port: TEST_PORT + 5,
      root: FIXTURES_DIR,
      watch: false,
    })

    // Make 100 sequential requests
    for (let i = 0; i < 100; i++) {
      const response = await fetch(`http://localhost:${TEST_PORT + 5}/doc-${String(i % 50).padStart(4, '0')}`)
      await response.text()
    }

    const memAfter = measureMemory()
    console.log(`  Memory used: ${memAfter - memBefore}MB`)
    console.log(`  Memory before: ${memBefore}MB`)
    console.log(`  Memory after: ${memAfter}MB`)

    stop()
  })

  bench('concurrent load (50 requests)', async () => {
    await setupDevServer(50)
    const memBefore = measureMemory()

    const { stop } = await startServer({
      port: TEST_PORT + 6,
      root: FIXTURES_DIR,
      watch: false,
    })

    // Make 50 concurrent requests
    const requests = Array.from({ length: 50 }, (_, i) =>
      fetch(`http://localhost:${TEST_PORT + 6}/doc-${String(i).padStart(4, '0')}`).then(r => r.text()),
    )

    await Promise.all(requests)

    const memAfter = measureMemory()
    console.log(`  Memory used: ${memAfter - memBefore}MB`)

    stop()
  })
})

console.log('\n⚡ BunPress Dev Server Performance Benchmarks\n')
console.log('Testing server startup, request handling, and memory usage\n')
console.log('Environment:')
console.log(`  Bun: ${Bun.version}`)
console.log(`  Platform: ${process.platform} ${process.arch}\n`)

await run({
  colors: true,
})

// Cleanup
await cleanupFiles(FIXTURES_DIR)

console.log('\n✅ Server benchmarks complete!\n')
