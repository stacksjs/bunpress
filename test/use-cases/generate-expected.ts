#!/usr/bin/env bun
/**
 * Script to generate expected HTML outputs for use-case tests
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { markdown } from '../../src/plugin'

async function generateExpectedHtml(testCase: string) {
  const testDir = join(import.meta.dir, testCase)
  const mdFile = join(testDir, 'test.md')
  const expectedHtmlFile = join(testDir, 'expected.html')

  try {
    // Read the markdown file
    const mdContent = await Bun.file(mdFile).text()

    // Create a simple Bun build to process the markdown
    const tempOutDir = join(testDir, 'temp-output')

    await mkdir(tempOutDir, { recursive: true })

    const result = await Bun.build({
      entrypoints: [mdFile],
      outdir: tempOutDir,
      plugins: [markdown({
        title: 'Test Documentation',
        meta: {
          description: 'Test description',
          author: 'BunPress'
        }
      })]
    })

    if (!result.success) {
      console.error(`❌ Build failed for ${testCase}:`, result.logs)
      return
    }

    // Debug: Print all outputs
    console.log('Build outputs:', result.outputs.map(o => ({ kind: o.kind, path: o.path })))

    // Find the generated HTML file
    const htmlFiles = result.outputs.filter(output =>
      output.path.endsWith('.html')
    )

    console.log('HTML files found:', htmlFiles.length)

    if (htmlFiles.length === 0) {
      // Try to find HTML files manually
      const findResult = await Bun.spawn(['find', tempOutDir, '-name', '*.html', '-type', 'f'], {
        stdout: 'pipe'
      })
      const output = await new Response(findResult.stdout).text()
      const foundPaths = output.trim().split('\n').filter(p => p)

      if (foundPaths.length > 0) {
        console.log('Found HTML files manually:', foundPaths)
        const generatedHtml = await Bun.file(foundPaths[0]).text()
        await writeFile(expectedHtmlFile, generatedHtml)
        console.log(`✅ Generated expected HTML for ${testCase} (manual find)`)
        return
      }

      console.error(`❌ No HTML file generated for ${testCase}`)
      return
    }

    // Read the generated HTML
    const generatedHtmlPath = htmlFiles[0].path
    console.log('Using HTML path:', generatedHtmlPath)

    const generatedHtml = await Bun.file(generatedHtmlPath).text()

    // Write to expected.html
    await writeFile(expectedHtmlFile, generatedHtml)

    console.log(`✅ Generated expected HTML for ${testCase}`)

    // Clean up temp directory
    await Bun.spawn(['rm', '-rf', tempOutDir])

  } catch (error) {
    console.error(`❌ Error generating expected HTML for ${testCase}:`, error)
  }
}

async function main() {
  const testCases = [
    'config-example',
    'frontmatter-example',
    'markdown-extensions-example'
  ]

  console.log('🚀 Generating expected HTML for test cases...')

  for (const testCase of testCases) {
    await generateExpectedHtml(testCase)
  }

  console.log('✨ All expected HTML files generated!')
}

// Run if called directly
if (import.meta.main) {
  main().catch(console.error)
}
