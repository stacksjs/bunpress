import { copyFile, mkdir, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { dts } from 'bun-plugin-dtsx'

console.log('Building library...')

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
  external: [
    'ts-cloud',
    'ts-md',
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

console.log('Build completed successfully!')
