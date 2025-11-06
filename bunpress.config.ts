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
    baseUrl: 'https://bunpress.sh',
  },

  robots: {
    enabled: true,
  },
}

export default config
