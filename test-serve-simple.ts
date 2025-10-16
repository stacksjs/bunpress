/**
 * Simple test without importing the full serve module
 * This tests if the docs directory markdown files can be read
 */

import { readdir } from 'node:fs/promises'

console.log('🔍 Testing BunPress setup...\n')

// Check if docs directory exists
try {
  const docsFiles = await readdir('./docs')
  console.log(`✅ Found ${docsFiles.length} files in ./docs directory`)

  // List markdown files
  const mdFiles = docsFiles.filter(f => f.endsWith('.md'))
  console.log(`✅ Found ${mdFiles.length} markdown files:`)
  mdFiles.forEach(f => console.log(`   - ${f}`))

  // Check bunpress config
  const configPath = './bunpress.config.ts'
  const configFile = Bun.file(configPath)
  if (await configFile.exists()) {
    console.log(`\n✅ Config file exists: ${configPath}`)
  }

  console.log('\n📋 To test the server, run:')
  console.log('   bun run dev')
  console.log('\nNote: The serve functionality requires @stacksjs/stx to be properly built.')
  console.log('If you see duplicate export errors, rebuild stx with:')
  console.log('   cd ../stx/packages/stx && rm -rf dist && bun --bun build.ts')
}
catch (error) {
  console.error('❌ Error:', error)
  process.exit(1)
}
