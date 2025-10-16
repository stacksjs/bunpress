/**
 * Test script for the serve functionality
 * Run with: bun test-serve.ts
 */
import { startServer } from './src/serve'

console.log('Starting BunPress server...\n')

const { url, stop } = await startServer({
  port: 3000,
  root: './docs',
  watch: true,
})

console.log(`✅ Server started successfully!`)
console.log(`📄 Open ${url} in your browser`)
console.log(`📁 Serving from: ./docs`)
console.log('\nTry these URLs:')
console.log(`  - ${url}`)
console.log(`  - ${url}install`)
console.log(`  - ${url}usage`)
console.log(`  - ${url}config`)
console.log('\nPress Ctrl+C to stop\n')

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...')
  stop()
  process.exit(0)
})

// Keep running
await new Promise(() => {})
