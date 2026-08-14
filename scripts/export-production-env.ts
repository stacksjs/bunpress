import { appendFileSync } from 'node:fs'
import { loadEnv } from '@stacksjs/env/plugin'

const result = loadEnv({
  path: '.env.production',
  keysFile: '.env.keys',
  env: 'production',
  overload: true,
  quiet: true,
})

if (result.errors.length > 0)
  throw new Error(`Could not load .env.production: ${result.errors.join('; ')}`)

const required = [
  'AWS_DEFAULT_REGION',
  'AWS_S3_BUCKET',
  'AWS_CLOUDFRONT_DISTRIBUTION_ID',
] as const

const values = Object.fromEntries(required.map((key) => {
  const value = process.env[key]

  if (!value || value.startsWith('encrypted:'))
    throw new Error(`Missing decrypted production value: ${key}`)

  if (value.includes('\n') || value.includes('\r'))
    throw new Error(`Production value must be single-line: ${key}`)

  return [key, value]
}))

if (!/^[a-z]{2}(?:-gov)?-[a-z]+-\d$/.test(values.AWS_DEFAULT_REGION))
  throw new Error('AWS_DEFAULT_REGION is invalid')

if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(values.AWS_S3_BUCKET))
  throw new Error('AWS_S3_BUCKET is invalid')

if (!/^[A-Z0-9]{13,14}$/.test(values.AWS_CLOUDFRONT_DISTRIBUTION_ID))
  throw new Error('AWS_CLOUDFRONT_DISTRIBUTION_ID is invalid')

const githubEnv = process.env.GITHUB_ENV

if (!githubEnv)
  throw new Error('GITHUB_ENV is required')

appendFileSync(githubEnv, `${Object.entries(values).map(([key, value]) => `${key}=${value}`).join('\n')}\n`)
console.log(`Loaded ${required.length} encrypted production values`)
