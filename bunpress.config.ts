import type { BunPressOptions } from './src/types'
import { defaultConfig } from './src/config'

const config: BunPressOptions = {
  ...defaultConfig,
  verbose: true,
}

export default config
