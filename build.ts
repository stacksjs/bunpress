import process from 'node:process'
import { dts } from 'bun-plugin-dtsx'
import { buildDocs } from './bin/cli'

console.log('Building library...')

const result = await Bun.build({
  entrypoints: [
    './src/index.ts',
    './bin/cli.ts',
    './src/bun-plugin.ts',
  ],
  outdir: './dist',
  plugins: [dts()],
  minify: true,
  splitting: true,
  target: 'bun',
})

if (!result.success) {
  console.error('Build failed:')
  for (const log of result.logs) {
    console.error(log)
  }
  process.exit(1)
}

console.log('Building documentation...')
const docsSuccess = await buildDocs({
  outdir: './dist/docs',
  verbose: true,
})

if (!docsSuccess) {
  console.error('Documentation build failed')
  process.exit(1)
}

console.log('Build completed successfully!')
