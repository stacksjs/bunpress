import { copyFile, mkdir, readdir, rm } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import process from 'node:process'
import { dts } from 'bun-plugin-dtsx'

console.log('Building library...')

await rm('./dist', { recursive: true, force: true })

const result = await Bun.build({
  entrypoints: [
    './src/index.ts',
    './bin/cli.ts',
  ],
  outdir: './dist',
  plugins: [dts()],
  minify: true,
  splitting: true,
  target: 'bun',
  // Kept out of the bundle so consumers resolve them from their own
  // node_modules. Mirrors dependencies + the optional ts-cloud peer.
  external: [
    '@cwcss/crosswind',
    '@stacksjs/clapp',
    '@stacksjs/stx',
    '@stacksjs/ts-cloud',
    '@stacksjs/ts-i18n',
    '@ts-cloud/core',
    'bunfig',
    'ts-syntax-highlighter',
  ],
})

if (!result.success) {
  console.error('Build failed:')
  for (const log of result.logs) {
    console.error(log)
  }
  process.exit(1)
}

// Copy templates to dist
async function copyDir(src: string, dest: string): Promise<void> {
  await mkdir(dest, { recursive: true })
  const entries = await readdir(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath)
    }
    else {
      await copyFile(srcPath, destPath)
    }
  }
}

// Copy templates
await copyDir('./src/templates', './dist/templates')
console.log('Copied templates to dist/')

// Copy theme CSS files
await copyDir('./src/themes/vitepress', './dist/themes/vitepress')
console.log('Copied theme CSS to dist/')

const publicEntry = pathToFileURL(resolve('./dist/src/index.js')).href
const publicApi = await import(publicEntry)
const requiredExports = ['buildRssFeed', 'buildSitemap', 'generateRobotsTxt', 'markdownToHtml', 'wrapInLayout']
const missingExports = requiredExports.filter(name => typeof publicApi[name] !== 'function')

if (missingExports.length > 0)
  throw new Error(`Built package is missing public exports: ${missingExports.join(', ')}`)

console.log('Validated public package entrypoint')

console.log('Build completed successfully!')
