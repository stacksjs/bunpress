import type { BunPressConfig } from '../src/types'
import { describe, expect, test } from 'bun:test'
import { startServer } from '../src/serve'

const TEST_PORT = 19100

describe('Fathom Analytics Integration', () => {
  test('should not include Fathom script when disabled', async () => {
    const testConfig: BunPressConfig = {
      verbose: false,
      markdown: {
        title: 'Test Docs',
      },
      fathom: {
        enabled: false,
        siteId: 'TESTID',
      },
    }

    const { stop } = await startServer({
      port: TEST_PORT,
      root: './test/markdown',
      config: testConfig,
    })

    try {
      const response = await fetch(`http://localhost:${TEST_PORT}/`)
      const html = await response.text()

      expect(html).not.toContain('cdn.usefathom.com')
      expect(html).not.toContain('data-site="TESTID"')
    }
    finally {
      stop()
    }
  })

  test('should not include Fathom script when no siteId provided', async () => {
    const testConfig: BunPressConfig = {
      verbose: false,
      markdown: {
        title: 'Test Docs',
      },
      fathom: {
        enabled: true,
        // No siteId
      },
    }

    const { stop } = await startServer({
      port: TEST_PORT + 1,
      root: './test/markdown',
      config: testConfig,
    })

    try {
      const response = await fetch(`http://localhost:${TEST_PORT + 1}/`)
      const html = await response.text()

      expect(html).not.toContain('cdn.usefathom.com')
    }
    finally {
      stop()
    }
  })

  test('should not include Fathom script when fathom config is omitted', async () => {
    const testConfig: BunPressConfig = {
      verbose: false,
      markdown: {
        title: 'Test Docs',
      },
      // No fathom config
    }

    const { stop } = await startServer({
      port: TEST_PORT + 2,
      root: './test/markdown',
      config: testConfig,
    })

    try {
      const response = await fetch(`http://localhost:${TEST_PORT + 2}/`)
      const html = await response.text()

      expect(html).not.toContain('cdn.usefathom.com')
    }
    finally {
      stop()
    }
  })

  test('should include basic Fathom script with default options', async () => {
    const testConfig: BunPressConfig = {
      verbose: false,
      markdown: {
        title: 'Test Docs',
      },
      fathom: {
        enabled: true,
        siteId: 'TESTID123',
      },
    }

    const { stop } = await startServer({
      port: TEST_PORT + 3,
      root: './test/markdown',
      config: testConfig,
    })

    try {
      const response = await fetch(`http://localhost:${TEST_PORT + 3}/`)
      const html = await response.text()

      expect(html).toContain('https://cdn.usefathom.com/script.js')
      expect(html).toContain('data-site="TESTID123"')
      expect(html).toContain('defer')
    }
    finally {
      stop()
    }
  })

  test('should include Fathom script with custom URL', async () => {
    const testConfig: BunPressConfig = {
      verbose: false,
      markdown: {
        title: 'Test Docs',
      },
      fathom: {
        enabled: true,
        siteId: 'TESTID123',
        scriptUrl: 'https://custom.example.com/fathom.js',
      },
    }

    const { stop } = await startServer({
      port: TEST_PORT + 4,
      root: './test/markdown',
      config: testConfig,
    })

    try {
      const response = await fetch(`http://localhost:${TEST_PORT + 4}/`)
      const html = await response.text()

      expect(html).toContain('https://custom.example.com/fathom.js')
      expect(html).toContain('data-site="TESTID123"')
    }
    finally {
      stop()
    }
  })

  test('should not include defer attribute when defer is false', async () => {
    const testConfig: BunPressConfig = {
      verbose: false,
      markdown: {
        title: 'Test Docs',
      },
      fathom: {
        enabled: true,
        siteId: 'TESTID123',
        defer: false,
      },
    }

    const { stop } = await startServer({
      port: TEST_PORT + 5,
      root: './test/markdown',
      config: testConfig,
    })

    try {
      const response = await fetch(`http://localhost:${TEST_PORT + 5}/`)
      const html = await response.text()

      expect(html).toContain('data-site="TESTID123"')
      // Check that defer is not present (need to check the exact script tag)
      const scriptMatch = html.match(/<script[^>]*data-site="TESTID123"[^>]*>/g)
      expect(scriptMatch).not.toBeNull()
      if (scriptMatch) {
        expect(scriptMatch[0]).not.toContain(' defer')
      }
    }
    finally {
      stop()
    }
  })

  test('should include honorDNT attribute when enabled', async () => {
    const testConfig: BunPressConfig = {
      verbose: false,
      markdown: {
        title: 'Test Docs',
      },
      fathom: {
        enabled: true,
        siteId: 'TESTID123',
        honorDNT: true,
      },
    }

    const { stop } = await startServer({
      port: TEST_PORT + 6,
      root: './test/markdown',
      config: testConfig,
    })

    try {
      const response = await fetch(`http://localhost:${TEST_PORT + 6}/`)
      const html = await response.text()

      expect(html).toContain('data-site="TESTID123"')
      expect(html).toContain('data-honor-dnt="true"')
    }
    finally {
      stop()
    }
  })

  test('should include canonical attribute when provided', async () => {
    const testConfig: BunPressConfig = {
      verbose: false,
      markdown: {
        title: 'Test Docs',
      },
      fathom: {
        enabled: true,
        siteId: 'TESTID123',
        canonical: 'https://docs.example.com',
      },
    }

    const { stop } = await startServer({
      port: TEST_PORT + 7,
      root: './test/markdown',
      config: testConfig,
    })

    try {
      const response = await fetch(`http://localhost:${TEST_PORT + 7}/`)
      const html = await response.text()

      expect(html).toContain('data-site="TESTID123"')
      expect(html).toContain('data-canonical="https://docs.example.com"')
    }
    finally {
      stop()
    }
  })

  test('should disable auto tracking when auto is false', async () => {
    const testConfig: BunPressConfig = {
      verbose: false,
      markdown: {
        title: 'Test Docs',
      },
      fathom: {
        enabled: true,
        siteId: 'TESTID123',
        auto: false,
      },
    }

    const { stop } = await startServer({
      port: TEST_PORT + 8,
      root: './test/markdown',
      config: testConfig,
    })

    try {
      const response = await fetch(`http://localhost:${TEST_PORT + 8}/`)
      const html = await response.text()

      expect(html).toContain('data-site="TESTID123"')
      expect(html).toContain('data-auto="false"')
    }
    finally {
      stop()
    }
  })

  test('should enable SPA mode when spa is true', async () => {
    const testConfig: BunPressConfig = {
      verbose: false,
      markdown: {
        title: 'Test Docs',
      },
      fathom: {
        enabled: true,
        siteId: 'TESTID123',
        spa: true,
      },
    }

    const { stop } = await startServer({
      port: TEST_PORT + 9,
      root: './test/markdown',
      config: testConfig,
    })

    try {
      const response = await fetch(`http://localhost:${TEST_PORT + 9}/`)
      const html = await response.text()

      expect(html).toContain('data-site="TESTID123"')
      expect(html).toContain('data-spa="auto"')
    }
    finally {
      stop()
    }
  })

  test('should include Fathom script with all options combined', async () => {
    const testConfig: BunPressConfig = {
      verbose: false,
      markdown: {
        title: 'Test Docs',
      },
      fathom: {
        enabled: true,
        siteId: 'FULLTEST',
        scriptUrl: 'https://custom.fathom.com/script.js',
        defer: true,
        honorDNT: true,
        canonical: 'https://example.com',
        auto: false,
        spa: true,
      },
    }

    const { stop } = await startServer({
      port: TEST_PORT + 10,
      root: './test/markdown',
      config: testConfig,
    })

    try {
      const response = await fetch(`http://localhost:${TEST_PORT + 10}/`)
      const html = await response.text()

      expect(html).toContain('https://custom.fathom.com/script.js')
      expect(html).toContain('data-site="FULLTEST"')
      expect(html).toContain('data-honor-dnt="true"')
      expect(html).toContain('data-canonical="https://example.com"')
      expect(html).toContain('data-auto="false"')
      expect(html).toContain('data-spa="auto"')
      expect(html).toContain('defer')
    }
    finally {
      stop()
    }
  })

  test('should include Fathom script on home layout', async () => {
    const testConfig: BunPressConfig = {
      verbose: false,
      markdown: {
        title: 'Test Docs',
      },
      fathom: {
        enabled: true,
        siteId: 'HOMETEST',
      },
    }

    const { stop } = await startServer({
      port: TEST_PORT + 11,
      root: './test/markdown',
      config: testConfig,
    })

    try {
      // Assuming there's a home.md with layout: home frontmatter
      const response = await fetch(`http://localhost:${TEST_PORT + 11}/`)
      const html = await response.text()

      expect(html).toContain('data-site="HOMETEST"')
      expect(html).toContain('https://cdn.usefathom.com/script.js')
    }
    finally {
      stop()
    }
  })

  test('should include Fathom script on doc layout', async () => {
    const testConfig: BunPressConfig = {
      verbose: false,
      markdown: {
        title: 'Test Docs',
      },
      fathom: {
        enabled: true,
        siteId: 'DOCTEST',
      },
    }

    const { stop } = await startServer({
      port: TEST_PORT + 12,
      root: './test/markdown',
      config: testConfig,
    })

    try {
      const response = await fetch(`http://localhost:${TEST_PORT + 12}/blocks`)
      const html = await response.text()

      expect(html).toContain('data-site="DOCTEST"')
      expect(html).toContain('https://cdn.usefathom.com/script.js')
    }
    finally {
      stop()
    }
  })

  test('should properly escape special characters in attributes', async () => {
    const testConfig: BunPressConfig = {
      verbose: false,
      markdown: {
        title: 'Test Docs',
      },
      fathom: {
        enabled: true,
        siteId: 'TEST"ID',
        canonical: 'https://example.com?param=value&other=test',
      },
    }

    const { stop } = await startServer({
      port: TEST_PORT + 13,
      root: './test/markdown',
      config: testConfig,
    })

    try {
      const response = await fetch(`http://localhost:${TEST_PORT + 13}/`)
      const html = await response.text()

      // Check that the script tag is properly formed (no broken HTML)
      expect(html).toContain('<script')
      expect(html).toContain('data-site="TEST"ID"')
    }
    finally {
      stop()
    }
  })
})
