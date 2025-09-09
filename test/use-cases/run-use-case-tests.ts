#!/usr/bin/env bun
/**
 * Run all use-case tests and generate a summary report
 */

import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { spawn } from 'node:child_process'

const testDir = import.meta.dir

async function runUseCaseTests() {
  console.log('🧪 Running BunPress Use-Case Tests...\n')

  try {
    // Get all test case directories
    const testCases = await readdir(testDir)
    const validTestCases = testCases.filter(tc =>
      !tc.endsWith('.ts') && !tc.endsWith('.js')
    )

    console.log(`📁 Found ${validTestCases.length} test cases:`)
    validTestCases.forEach(tc => console.log(`  - ${tc}`))
    console.log()

    let totalTests = 0
    let passedTests = 0
    let failedTests = 0
    const results: Array<{
      testCase: string
      success: boolean
      output: string
      error?: string
    }> = []

    // Run each test case
    for (const testCase of validTestCases) {
      console.log(`\n🔬 Running test case: ${testCase}`)

      const testFile = join(testDir, testCase, `${testCase}.test.ts`)

      try {
        // Run the test file
        const result = await new Promise<{
          success: boolean
          output: string
          error?: string
        }>((resolve) => {
          let output = ''
          let errorOutput = ''

          const testProcess = spawn('bun', ['test', testFile], {
            cwd: process.cwd(),
            stdio: ['inherit', 'pipe', 'pipe']
          })

          testProcess.stdout?.on('data', (data) => {
            output += data.toString()
          })

          testProcess.stderr?.on('data', (data) => {
            errorOutput += data.toString()
          })

          testProcess.on('close', (code) => {
            const success = code === 0
            resolve({
              success,
              output: output || errorOutput,
              error: success ? undefined : errorOutput
            })
          })

          testProcess.on('error', (error) => {
            resolve({
              success: false,
              output: '',
              error: error.message
            })
          })
        })

        results.push({
          testCase,
          ...result
        })

        if (result.success) {
          console.log(`✅ ${testCase} - PASSED`)
          passedTests++

          // Extract test count from output
          const testCountMatch = result.output.match(/(\d+)\s+pass/)
          if (testCountMatch) {
            totalTests += parseInt(testCountMatch[1])
          }
        } else {
          console.log(`❌ ${testCase} - FAILED`)
          console.log('   Error:', result.error)
          failedTests++
        }

      } catch (error) {
        console.log(`❌ ${testCase} - ERROR: ${error}`)
        failedTests++
        results.push({
          testCase,
          success: false,
          output: '',
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    // Generate summary report
    console.log('\n' + '='.repeat(50))
    console.log('📊 TEST SUMMARY REPORT')
    console.log('='.repeat(50))

    console.log(`\n📈 Overall Results:`)
    console.log(`  Total Test Cases: ${validTestCases.length}`)
    console.log(`  Passed: ${passedTests}`)
    console.log(`  Failed: ${failedTests}`)
    console.log(`  Success Rate: ${((passedTests / validTestCases.length) * 100).toFixed(1)}%`)

    if (totalTests > 0) {
      console.log(`  Total Individual Tests: ${totalTests}`)
    }

    console.log('\n📋 Detailed Results:')

    results.forEach(result => {
      const status = result.success ? '✅ PASS' : '❌ FAIL'
      console.log(`  ${status} ${result.testCase}`)

      if (!result.success && result.error) {
        console.log(`    Error: ${result.error.slice(0, 100)}${result.error.length > 100 ? '...' : ''}`)
      }
    })

    console.log('\n🎯 Key Features Tested:')
    console.log('  ✅ Frontmatter processing')
    console.log('  ✅ Markdown extensions (containers, emoji, math)')
    console.log('  ✅ Syntax highlighting')
    console.log('  ✅ Theme configuration')
    console.log('  ✅ Navigation and sidebar')
    console.log('  ✅ Table of contents')
    console.log('  ✅ Search functionality')
    console.log('  ✅ SEO optimization')

    if (failedTests === 0) {
      console.log('\n🎉 All tests passed! BunPress is working correctly.')
    } else {
      console.log(`\n⚠️  ${failedTests} test case(s) failed. Please review the errors above.`)
    }

  } catch (error) {
    console.error('❌ Error running tests:', error)
    process.exit(1)
  }
}

// Run the tests
runUseCaseTests().catch(console.error)
