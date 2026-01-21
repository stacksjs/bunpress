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
    baseUrl: 'https://bunpress.org',
  },

  robots: {
    enabled: true,
  },

  // Cloud Deployment Configuration
  cloud: {
    driver: 'aws',
    region: 'us-east-1',
    domain: 'bunpress.org',
    // bucket, distributionId, and certificateArn are auto-inferred
    invalidateCache: true,
    waitForInvalidation: false,
    cacheControl: 'max-age=31536000, public',

    // Use Porkbun for DNS management
    // API credentials loaded from environment variables:
    // PORKBUN_API_KEY and PORKBUN_SECRET_KEY
    dnsProvider: {
      provider: 'porkbun',
    },
  },
}

export default config
