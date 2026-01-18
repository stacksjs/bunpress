import type { BunPressOptions } from './src/types'
import { defaultConfig } from './src/config'

const config: BunPressOptions = {
  ...defaultConfig,
  verbose: true,

  // Fathom Analytics Configuration
  fathom: {
    enabled: true,
    siteId: 'NXCLHKXQ',
    honorDNT: true,
    auto: true,
    spa: false,
  },

  // SEO Configuration
  sitemap: {
    enabled: true,
    baseUrl: 'https://bunpress.stacksjs.com',
  },

  robots: {
    enabled: true,
  },

  // Cloud Deployment Configuration
  cloud: {
    driver: 'aws',
    region: 'us-east-1',
    subdomain: 'bunpress',
    baseDomain: 'stacksjs.com',
    // bucket, hostedZoneId, distributionId, and certificateArn are auto-inferred
    invalidateCache: true,
    waitForInvalidation: false,
    cacheControl: 'max-age=31536000, public',
  },
}

export default config
