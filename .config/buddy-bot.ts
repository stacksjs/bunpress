import type { BuddyBotConfig } from 'buddy-bot'

const config: BuddyBotConfig = {
  repository: {
    owner: 'stacksjs',
    name: 'bunpress',
    provider: 'github',
    // Uses GITHUB_TOKEN by default
  },
  dashboard: {
    enabled: true,
    title: 'Dependency Dashboard',
    // issueNumber: undefined, // Auto-generated
  },
  workflows: {
    enabled: true,
    outputDir: '.github/workflows',
    templates: {
      daily: true,
      weekly: true,
      monthly: true,
    },
    custom: [],
  },
  packages: {
    strategy: 'all',
    ignore: [
      '@stacksjs/desktop',
      '@stacksjs/sanitizer',
      '@stacksjs/stx',
      'bun-plugin-stx',
      'stx-router',
      'ts-syntax-highlighter',
    ],
    ignorePaths: [
      '../stx/**',
      '../../Libraries/ts-syntax-highlighter/**',
    ],
  },
  verbose: false,
}

export default config
