import type { BunPressConfig } from './types'
import { loadConfig } from 'bunfig'

export const defaultConfig: BunPressConfig = {
  verbose: true,
}

// eslint-disable-next-line antfu/no-top-level-await
export const config: BunPressConfig = await loadConfig({
  name: 'bunpress',
  defaultConfig,
})
