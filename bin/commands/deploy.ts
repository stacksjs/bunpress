/**
 * Deploy command - Deploys BunPress docs to AWS using ts-cloud
 * Uses CloudFormation for infrastructure management
 */

import { join } from 'node:path'
import { config } from '../../src/config'
import type { BunPressConfig } from '../../src/types'
import { buildDocs } from '../cli'
import { Spinner, logSuccess, logError, logWarning, logInfo } from '../utils'

// Import deployment functions from ts-cloud
import {
  deployStaticSiteFull,
  type StaticSiteConfig,
} from 'ts-cloud'

interface DeployOptions {
  region?: string
  bucket?: string
  domain?: string
  subdomain?: string
  baseDomain?: string
  stackName?: string
  hostedZoneId?: string
  certificateArn?: string
  verbose?: boolean
  dryRun?: boolean
}

/**
 * Main deploy command
 */
export async function deployCommand(options: DeployOptions = {}): Promise<boolean> {
  const bunPressConfig = await config as BunPressConfig
  const cloudConfig = bunPressConfig.cloud || {}
  const verbose = options.verbose ?? bunPressConfig.verbose ?? false

  // Merge options with config
  const region = options.region || cloudConfig.region || 'us-east-1'
  const domain = options.domain || cloudConfig.domain
  const subdomain = options.subdomain || cloudConfig.subdomain
  const baseDomain = options.baseDomain || cloudConfig.baseDomain
  const bucket = options.bucket || cloudConfig.bucket
  const stackName = options.stackName || cloudConfig.stackName
  const hostedZoneId = options.hostedZoneId || cloudConfig.hostedZoneId
  const certificateArn = options.certificateArn || cloudConfig.certificateArn
  const cacheControl = cloudConfig.cacheControl || 'max-age=31536000, public'

  // Determine full domain
  let fullDomain: string | undefined
  if (domain) {
    fullDomain = domain
  }
  else if (subdomain && baseDomain) {
    fullDomain = `${subdomain}.${baseDomain}`
  }

  // Generate site name for CloudFormation stack
  const siteName = fullDomain?.replace(/\./g, '-') || 'bunpress-site'

  if (options.dryRun) {
    logInfo('Dry run mode - no changes will be made')
    console.log('\nConfiguration:')
    console.log(`  Region: ${region}`)
    console.log(`  Site Name: ${siteName}`)
    console.log(`  Bucket: ${bucket || 'auto-generated'}`)
    console.log(`  Domain: ${fullDomain || 'not specified'}`)
    console.log(`  Stack Name: ${stackName || `${siteName}-static-site`}`)
    console.log(`  Hosted Zone ID: ${hostedZoneId || 'auto-detected'}`)
    console.log(`  Certificate ARN: ${certificateArn || 'auto-created'}`)
    return true
  }

  // Check credentials
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    logError('AWS credentials not found. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.')
    return false
  }

  const spinner = new Spinner('Building documentation...')

  try {
    // Step 1: Build the docs
    if (!verbose) spinner.start()
    const buildSuccess = await buildDocs({ verbose })
    if (!buildSuccess) {
      if (!verbose) spinner.fail('Build failed')
      return false
    }
    if (!verbose) spinner.succeed('Documentation built successfully')

    // Step 2: Deploy using ts-cloud
    const outDir = bunPressConfig.outDir || './dist'
    const sourceDir = join(outDir, '.bunpress')

    // Prepare deployment config
    const deployConfig: StaticSiteConfig & { sourceDir: string; onProgress?: (stage: string, detail?: string) => void } = {
      siteName,
      region,
      bucket,
      domain: fullDomain,
      subdomain,
      baseDomain,
      stackName,
      hostedZoneId,
      certificateArn,
      cacheControl,
      defaultRootObject: 'index.html',
      errorDocument: '404.html',
      sourceDir,
      tags: {
        Project: 'BunPress',
        Environment: cloudConfig.environment || 'production',
      },
      onProgress: (stage, detail) => {
        if (verbose) {
          console.log(`[${stage}] ${detail || ''}`)
        }
        else {
          switch (stage) {
            case 'infrastructure':
              spinner.text = detail || 'Deploying CloudFormation stack...'
              spinner.start()
              break
            case 'upload':
              if (detail?.startsWith('Uploading')) {
                spinner.text = detail
              }
              break
            case 'invalidate':
              spinner.text = 'Invalidating CloudFront cache...'
              break
            case 'complete':
              spinner.succeed('Deployment complete!')
              break
          }
        }
      },
    }

    if (!verbose) {
      spinner.text = 'Deploying infrastructure with CloudFormation...'
      spinner.start()
    }
    else {
      console.log('\nDeploying with CloudFormation...')
    }

    const result = await deployStaticSiteFull(deployConfig)

    if (!result.success) {
      if (!verbose) spinner.fail('Deployment failed')
      logError(result.message)
      return false
    }

    // Success output
    console.log('\n' + '='.repeat(50))
    logSuccess('Deployment complete!')
    console.log('='.repeat(50))

    console.log(`\nCloudFormation Stack: ${result.stackName}`)
    console.log(`S3 Bucket: ${result.bucket}`)

    if (result.distributionId) {
      console.log(`CloudFront Distribution: ${result.distributionId}`)
      console.log(`CloudFront Domain: ${result.distributionDomain}`)
    }

    if (result.filesUploaded) {
      console.log(`Files Uploaded: ${result.filesUploaded}`)
    }

    if (result.domain) {
      console.log(`\nYour site: https://${result.domain}`)
    }
    else if (result.distributionDomain) {
      console.log(`\nYour site: https://${result.distributionDomain}`)
    }

    return true
  }
  catch (error: any) {
    if (!verbose) spinner.fail('Deployment failed')
    logError(error.message)
    if (verbose && error.stack) {
      console.error(error.stack)
    }
    return false
  }
}
