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
})

if (!result.success) {
  console.error('Build failed:')
  for (const log of result.logs) {
    console.error(log)
  }
  process.exit(1)
}

console.log('Build completed successfully!')
