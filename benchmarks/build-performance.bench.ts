import { bench, group, run } from 'mitata'
import { buildDocs } from '../bin/cli'
import { cleanupFiles, countFiles, formatBytes, formatDuration, generateMarkdownFiles, getDirectorySize, measureMemory } from './utils'

/**
 * Build Performance Benchmarks
 *
 * Compares BunPress build times with different file counts
 * and measures memory usage
 */

const FIXTURES_DIR = './benchmarks/fixtures'
const OUTPUT_DIR = './benchmarks/output'

// Benchmark configuration
const FILE_COUNTS = [10, 50, 100, 500]

async function setupFixtures(count: number) {
  const fixturesDir = `${FIXTURES_DIR}/docs-${count}`
  await cleanupFiles(fixturesDir)
  await generateMarkdownFiles(count, fixturesDir)
  return fixturesDir
}

async function cleanupOutput() {
  await cleanupFiles(OUTPUT_DIR)
}

// Build benchmarks for different file counts
for (const count of FILE_COUNTS) {
  group(`Build ${count} files`, () => {
    let fixturesDir: string

    bench(`cold build (${count} files)`, async () => {
      fixturesDir = await setupFixtures(count)
      const memBefore = measureMemory()

      await buildDocs({
        outdir: OUTPUT_DIR,
        verbose: false,
      })

      const memAfter = measureMemory()
      const memUsed = memAfter - memBefore

      // Log metrics
      const outputSize = await getDirectorySize(OUTPUT_DIR)
      const fileCount = await countFiles(OUTPUT_DIR)

      console.log(`  Memory: ${memUsed}MB`)
      console.log(`  Output: ${formatBytes(outputSize)} (${fileCount} files)`)

      await cleanupOutput()
    })

    bench(`hot build (${count} files)`, async () => {
      // Simulate hot build (files already exist)
      const memBefore = measureMemory()

      await buildDocs({
        outdir: OUTPUT_DIR,
        verbose: false,
      })

      const memAfter = measureMemory()
      console.log(`  Memory: ${memAfter - memBefore}MB`)

      await cleanupOutput()
    })
  })
}

// Incremental build benchmark
group('Incremental builds', () => {
  let fixturesDir: string

  bench('full rebuild (100 files)', async () => {
    fixturesDir = await setupFixtures(100)
    await buildDocs({
      outdir: OUTPUT_DIR,
      verbose: false,
    })
    await cleanupOutput()
  })

  bench('single file change', async () => {
    // Simulate changing one file
    const testFile = `${fixturesDir}/doc-0000.md`
    const content = await Bun.file(testFile).text()
    await Bun.write(testFile, `${content}\n\nUpdated content`)

    await buildDocs({
      outdir: OUTPUT_DIR,
      verbose: false,
    })

    await cleanupOutput()
  })

  bench('multiple file changes (10%)', async () => {
    // Update 10% of files
    for (let i = 0; i < 10; i++) {
      const testFile = `${fixturesDir}/doc-${String(i).padStart(4, '0')}.md`
      const content = await Bun.file(testFile).text()
      await Bun.write(testFile, `${content}\n\nUpdated`)
    }

    await buildDocs({
      outdir: OUTPUT_DIR,
      verbose: false,
    })

    await cleanupOutput()
  })
})

// Memory usage benchmarks
group('Memory usage', () => {
  bench('peak memory (100 files)', async () => {
    const fixturesDir = await setupFixtures(100)
    const memBefore = measureMemory()

    await buildDocs({
      outdir: OUTPUT_DIR,
      verbose: false,
    })

    const memAfter = measureMemory()
    const memUsed = memAfter - memBefore

    console.log(`  Peak memory: ${memUsed}MB`)
    console.log(`  Memory before: ${memBefore}MB`)
    console.log(`  Memory after: ${memAfter}MB`)

    await cleanupOutput()
    await cleanupFiles(fixturesDir)
  })

  bench('memory cleanup', async () => {
    // Check if memory is properly released
    const initialMem = measureMemory()

    for (let i = 0; i < 5; i++) {
      const fixturesDir = await setupFixtures(50)
      await buildDocs({
        outdir: OUTPUT_DIR,
        verbose: false,
      })
      await cleanupOutput()
      await cleanupFiles(fixturesDir)
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc()
    }

    const finalMem = measureMemory()
    const memLeak = finalMem - initialMem

    console.log(`  Initial: ${initialMem}MB`)
    console.log(`  Final: ${finalMem}MB`)
    console.log(`  Leak: ${memLeak}MB`)
  })
})

// Bundle size analysis
group('Bundle size', () => {
  bench('output size (100 files)', async () => {
    const fixturesDir = await setupFixtures(100)

    await buildDocs({
      outdir: OUTPUT_DIR,
      verbose: false,
    })

    const totalSize = await getDirectorySize(OUTPUT_DIR)
    const htmlCount = await countFiles(OUTPUT_DIR, '.html')
    const jsCount = await countFiles(OUTPUT_DIR, '.js')
    const cssCount = await countFiles(OUTPUT_DIR, '.css')

    console.log(`  Total size: ${formatBytes(totalSize)}`)
    console.log(`  HTML files: ${htmlCount}`)
    console.log(`  JS files: ${jsCount}`)
    console.log(`  CSS files: ${cssCount}`)
    console.log(`  Avg per page: ${formatBytes(totalSize / htmlCount)}`)

    await cleanupOutput()
    await cleanupFiles(fixturesDir)
  })

  bench('minified output', async () => {
    const fixturesDir = await setupFixtures(100)

    await buildDocs({
      outdir: OUTPUT_DIR,
      verbose: false,
      minify: true,
    })

    const totalSize = await getDirectorySize(OUTPUT_DIR)
    console.log(`  Minified size: ${formatBytes(totalSize)}`)

    await cleanupOutput()
    await cleanupFiles(fixturesDir)
  })
})

console.log('\n🔥 BunPress Build Performance Benchmarks\n')
console.log('Testing build times, memory usage, and bundle sizes\n')
console.log('Environment:')
console.log(`  Bun: ${Bun.version}`)
console.log(`  Platform: ${process.platform} ${process.arch}`)
console.log(`  Memory: ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB available\n`)

await run({
  colors: true,
})

// Cleanup
await cleanupFiles(FIXTURES_DIR)
await cleanupFiles(OUTPUT_DIR)

console.log('\n✅ Benchmarks complete!\n')
