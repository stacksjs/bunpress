#!/usr/bin/env bun
/* eslint-disable no-console */
/**
 * Script to generate expected HTML outputs for block tests
 */

import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { markdown } from '../../src/plugin'

async function generateExpectedHtml(blockType: string) {
  const blockDir = join(import.meta.dir, blockType)
  const mdFile = join(blockDir, 'test.md')
  const expectedHtmlFile = join(blockDir, 'expected.html')

  try {
    // Read the markdown file
    const _mdContent = await Bun.file(mdFile).text()

    // Create a simple Bun build to process the markdown
    const tempOutDir = join(blockDir, 'temp-output')

    await mkdir(tempOutDir, { recursive: true })

    const result = await Bun.build({
      entrypoints: [mdFile],
      outdir: tempOutDir,
      plugins: [markdown({
        title: `${blockType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Test`,
        meta: {
          description: `Test for ${blockType} functionality`,
          author: 'BunPress',
        },
      })],
    })

    if (!result.success) {
      console.error(`❌ Build failed for ${blockType}`)
      for (const log of result.logs) {
        console.error(log)
      }
      return
    }

    // Find the generated HTML file
    const htmlFiles = result.outputs.filter(output =>
      output.path.endsWith('.html'),
    )

    if (htmlFiles.length === 0) {
      console.error(`❌ No HTML file generated for ${blockType}`)
      return
    }

    // Read the generated HTML
    const htmlContent = await Bun.file(htmlFiles[0].path).text()

    // Write to expected.html
    await writeFile(expectedHtmlFile, htmlContent, 'utf8')

    console.log(`✅ Generated expected HTML for ${blockType}`)
  }
  catch (error) {
    console.error(`❌ Error processing ${blockType}:`, error)
  }
}

async function main() {
  console.log('🧪 Generating expected HTML for block tests...\n')

  try {
    // Get all block directories
    const blocksDir = import.meta.dir
    const entries = await readdir(blocksDir, { withFileTypes: true })

    const blockDirs = entries
      .filter(entry => entry.isDirectory() && entry.name !== 'temp-output' && entry.name !== 'dist')
      .map(entry => entry.name)

    console.log(`📁 Found ${blockDirs.length} block types:`)
    blockDirs.forEach(dir => console.log(`  - ${dir}`))
    console.log()

    // Generate expected HTML for each block type
    for (const blockType of blockDirs) {
      await generateExpectedHtml(blockType)
    }

    console.log('\n🎉 All expected HTML files generated!')
  }
  catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
