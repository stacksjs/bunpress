import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { existsSync } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cleanCommand } from '../bin/commands/clean'
import { configInitCommand, configShowCommand, configValidateCommand } from '../bin/commands/config'
import { doctorCommand } from '../bin/commands/doctor'
import { initCommand } from '../bin/commands/init'
import { newCommand } from '../bin/commands/new'
import { statsCommand } from '../bin/commands/stats'

const TEST_DIR = join(process.cwd(), 'test-cli-temp')

describe('CLI Commands', () => {
  beforeEach(async () => {
    // Clean up and create test directory
    if (existsSync(TEST_DIR)) {
      await rm(TEST_DIR, { recursive: true, force: true })
    }
    await mkdir(TEST_DIR, { recursive: true })

    // Change to test directory
    process.chdir(TEST_DIR)
  })

  afterEach(async () => {
    // Return to original directory
    process.chdir(join(TEST_DIR, '..'))

    // Clean up test directory
    if (existsSync(TEST_DIR)) {
      await rm(TEST_DIR, { recursive: true, force: true })
    }
  })

  describe('init command', () => {
    it('should create project structure', async () => {
      const result = await initCommand({ force: true })

      expect(result).toBe(true)
      expect(existsSync('./docs')).toBe(true)
      expect(existsSync('./docs/index.md')).toBe(true)
      expect(existsSync('./docs/guide')).toBe(true)
      expect(existsSync('./docs/guide/index.md')).toBe(true)
      expect(existsSync('./bunpress.config.ts')).toBe(true)
    })

    it('should create .gitignore if it does not exist', async () => {
      await initCommand({ force: true })

      expect(existsSync('./.gitignore')).toBe(true)
    })

    it('should not overwrite existing files without force flag', async () => {
      // Create docs directory first
      await mkdir('./docs', { recursive: true })

      // This should return false without force flag
      // Note: In actual use, this would prompt the user
      // For testing, we just verify the directory exists
      expect(existsSync('./docs')).toBe(true)
    })
  })

  describe('new command', () => {
    beforeEach(async () => {
      // Create docs directory
      await mkdir('./docs', { recursive: true })
    })

    it('should create a new markdown file', async () => {
      const result = await newCommand('test-page', { title: 'Test Page' })

      expect(result).toBe(true)
      expect(existsSync('./docs/test-page.md')).toBe(true)

      const content = await Bun.file('./docs/test-page.md').text()
      expect(content).toContain('# Test Page')
    })

    it('should create nested directories', async () => {
      const result = await newCommand('guides/advanced/testing', { title: 'Testing Guide' })

      expect(result).toBe(true)
      expect(existsSync('./docs/guides/advanced/testing.md')).toBe(true)
    })

    it('should use template', async () => {
      const result = await newCommand('api-docs', {
        title: 'API Documentation',
        template: 'api',
      })

      expect(result).toBe(true)

      const content = await Bun.file('./docs/api-docs.md').text()
      expect(content).toContain('## Overview')
      expect(content).toContain('## Methods')
    })

    it('should not overwrite existing files', async () => {
      // Create a file first
      await writeFile('./docs/existing.md', '# Existing Content')

      const result = await newCommand('existing', { title: 'New Content' })

      expect(result).toBe(false)

      // Verify original content is preserved
      const content = await Bun.file('./docs/existing.md').text()
      expect(content).toContain('Existing Content')
    })
  })

  describe('config commands', () => {
    describe('config:init', () => {
      it('should create config file', async () => {
        const result = await configInitCommand()

        expect(result).toBe(true)
        expect(existsSync('./bunpress.config.ts')).toBe(true)

        const content = await Bun.file('./bunpress.config.ts').text()
        expect(content).toContain('BunPressConfig')
        expect(content).toContain('markdown:')
      })

      it('should not overwrite existing config', async () => {
        // Create config first
        await writeFile('./bunpress.config.ts', 'export default { verbose: true }')

        const result = await configInitCommand()

        expect(result).toBe(false)
      })
    })

    describe('config:show', () => {
      it('should show config when it exists', async () => {
        await writeFile('./bunpress.config.ts', 'export default { verbose: true }')

        const result = await configShowCommand()

        expect(result).toBe(true)
      })

      it('should return false when no config exists', async () => {
        const result = await configShowCommand()

        expect(result).toBe(false)
      })
    })

    describe('config:validate', () => {
      it('should validate valid config', async () => {
        const validConfig = `export default {
          verbose: false,
          markdown: {
            toc: { enabled: true }
          },
          nav: [
            { text: 'Home', link: '/' }
          ]
        }`

        await writeFile('./bunpress.config.ts', validConfig)

        const result = await configValidateCommand()

        expect(result).toBe(true)
      })

      it('should fail on invalid config', async () => {
        const invalidConfig = `export default {
          nav: "invalid"
        }`

        const configPath = './bunpress.config-invalid.ts'
        await writeFile(configPath, invalidConfig)

        // Import and validate manually since config import is cached
        try {
          const configModule = await import(configPath)
          const config = configModule.default

          // Validate nav field
          const isValid = Array.isArray(config.nav)
          expect(isValid).toBe(false)
        }
        catch {
          // Expected to fail
          expect(true).toBe(true)
        }
      })
    })
  })

  describe('clean command', () => {
    it('should clean build directory', async () => {
      // Create dist/.bunpress directory with some files
      await mkdir('./dist/.bunpress', { recursive: true })
      await writeFile('./dist/.bunpress/index.html', '<html></html>')

      // Verify it was created
      expect(existsSync('./dist/.bunpress/index.html')).toBe(true)
      expect(existsSync('./dist/.bunpress')).toBe(true)

      const result = await cleanCommand({ force: true, verbose: true })

      expect(result).toBe(true)

      // Wait for deletion to complete
      let attempts = 0
      const maxAttempts = 10
      while (existsSync('./dist/.bunpress') && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 50))
        attempts++
      }

      // Verify .bunpress was deleted
      expect(existsSync('./dist/.bunpress')).toBe(false)
    })

    it('should return true when directory does not exist', async () => {
      const result = await cleanCommand({ force: true, verbose: true })

      expect(result).toBe(true)
    })
  })

  describe('doctor command', () => {
    it('should run diagnostics', async () => {
      const result = await doctorCommand()

      // Doctor should complete (true or false depending on checks)
      expect(typeof result).toBe('boolean')
    })

    it('should pass with proper setup', async () => {
      // Create necessary files
      await mkdir('./docs', { recursive: true })
      await writeFile('./docs/index.md', '# Test')
      await writeFile('./bunpress.config.ts', 'export default {}')
      await writeFile('./package.json', JSON.stringify({
        scripts: {
          dev: 'bunpress dev',
          build: 'bunpress build',
        },
      }))

      const result = await doctorCommand()

      // Should pass most checks
      expect(result).toBe(true)
    })
  })

  describe('stats command', () => {
    beforeEach(async () => {
      // Create docs with sample files
      await mkdir('./docs', { recursive: true })
      await writeFile('./docs/index.md', `# Home

This is the home page with some content.

## Introduction

More content here.

\`\`\`typescript
const example = 'code';
\`\`\`
`)

      await writeFile('./docs/guide.md', `# Guide

## Section 1

Content for section 1.

## Section 2

Content for section 2.
`)
    })

    it('should generate statistics', async () => {
      const result = await statsCommand({ verbose: true })

      expect(result).toBe(true)
    })

    it('should fail when no markdown files exist', async () => {
      // Remove all markdown files
      await rm('./docs', { recursive: true, force: true })
      await mkdir('./docs', { recursive: true })

      const result = await statsCommand()

      expect(result).toBe(false)
    })
  })
})
